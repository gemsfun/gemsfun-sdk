import { 
  Connection, 
  PublicKey, 
  Keypair, 
  VersionedTransaction,
  TransactionMessage,
  Transaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY
} from "@solana/web3.js";
import { Program, AnchorProvider, Wallet, BN } from "@coral-xyz/anchor";
import { 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount
} from "@solana/spl-token";
import { findMetadataPda, MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey } from "@metaplex-foundation/umi";

import { Pump } from "../artifacts/pump";
import pumpIdl from "../artifacts/pump.json";
import { 
  CreateCoinParams, 
  BuyCoinParams,
  BuyCoinWithSolParams,
  SellCoinParams, 
  PumpClientConfig,
  CreateCoinResult
} from "../types/accounts";
import { 
  PUMP_PROGRAM_ID,
  findGlobalPDA,
  findMarketCapPDA,
  findBondingCurvePDA,
  findCreatorRevenuePDA,
  findEventAuthorityPDA,
  calculateTokensForSol,
  calculateSolForTokens
} from "../utils";

export class PumpClient {
  public connection: Connection;
  public program: Program<Pump>;
  public wallet: Wallet;

  constructor(
    wallet: Wallet, 
    config: PumpClientConfig = {}
  ) {
    this.connection = new Connection(
      config.rpcUrl || 'https://api.mainnet-beta.solana.com',
      config.commitment || 'confirmed'
    );
    
    this.wallet = wallet;
    
    const provider = new AnchorProvider(this.connection, wallet, {
      commitment: config.commitment || 'confirmed'
    });
    
    this.program = new Program(pumpIdl as Pump, provider);
  }

  /**
   * Simulate transaction before sending (optional validation)
   */
  async simulateTransaction(transaction: VersionedTransaction): Promise<{ success: boolean; error?: string; logs?: string[] }> {
    try {
      const result = await this.connection.simulateTransaction(transaction, {
        commitment: 'processed'
      });
      
      if (result.value.err) {
        return {
          success: false,
          error: JSON.stringify(result.value.err),
          logs: result.value.logs || []
        };
      }
      
      return {
        success: true,
        logs: result.value.logs || []
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Validate coin creation parameters
   */
  private validateCreateCoinParams(params: CreateCoinParams): void {
    if (!params.name || params.name.trim().length === 0) {
      throw new Error("Coin name is required");
    }
    if (!params.symbol || params.symbol.trim().length === 0) {
      throw new Error("Coin symbol is required");
    }
    if (!params.uri || params.uri.trim().length === 0) {
      throw new Error("Metadata URI is required");
    }
    if (params.marketCapIndex < 1 || params.marketCapIndex > 3) {
      throw new Error("Market cap index must be 1, 2, or 3");
    }
  }

  /**
   * Validate buy coin parameters
   */
  private validateBuyCoinParams(params: BuyCoinParams): void {
    if (params.tokenAmount.lte(new BN(0))) {
      throw new Error("Token amount must be greater than 0");
    }
    if (params.maxSolCost.lte(new BN(0))) {
      throw new Error("Max SOL cost must be greater than 0");
    }
    if (params.marketCapIndex < 1 || params.marketCapIndex > 3) {
      throw new Error("Market cap index must be 1, 2, or 3");
    }
  }

  /**
   * Validate sell coin parameters
   */
  private validateSellCoinParams(params: SellCoinParams): void {
    if (params.tokenAmount.lte(new BN(0))) {
      throw new Error("Token amount must be greater than 0");
    }
    if (params.marketCapIndex < 1 || params.marketCapIndex > 3) {
      throw new Error("Market cap index must be 1, 2, or 3");
    }
  }

  /**
   * Validate buy coin with SOL parameters
   */
  private validateBuyCoinWithSolParams(params: BuyCoinWithSolParams): void {
    if (params.solAmount.lte(new BN(0))) {
      throw new Error("SOL amount must be greater than 0");
    }
    if (params.marketCapIndex < 1 || params.marketCapIndex > 3) {
      throw new Error("Market cap index must be 1, 2, or 3");
    }
    if (params.slippage && (params.slippage < 0 || params.slippage > 10000)) {
      throw new Error("Slippage must be between 0 and 10000 basis points");
    }
  }

  async createCoin(params: CreateCoinParams): Promise<CreateCoinResult> {
    // Validate parameters
    this.validateCreateCoinParams(params);

    const mint = params.mint || Keypair.generate();
    const [global] = findGlobalPDA();
    const [marketCap] = findMarketCapPDA(params.marketCapIndex);
    const [bondingCurve] = findBondingCurvePDA(mint.publicKey);
    
    const associatedBondingCurve = await getAssociatedTokenAddress(
      mint.publicKey,
      bondingCurve,
      true
    );

    const umi = createUmi(this.connection.rpcEndpoint);
    const [metadataString] = findMetadataPda(umi, { 
      mint: publicKey(mint.publicKey.toBase58()) 
    });
    const metadata = new PublicKey(metadataString);

    try {
      const createInstruction = await this.program.methods
        .create(
          params.marketCapIndex,
          params.name,
          params.symbol,
          params.uri,
          params.aiGenerated || false
        )
        .accountsStrict({
          user: this.wallet.publicKey,
          global,
          marketCap,
          mint: mint.publicKey,
          bondingCurve,
          associatedBondingCurve,
          metadata,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          eventAuthority: findEventAuthorityPDA()[0],
          program: PUMP_PROGRAM_ID,
        })
        .instruction();

      const instructions = [createInstruction];

      // Thêm instruction tạo creator revenue pool nếu cần
      if (params.createCreatorRevenuePool !== false) {
        const [creatorRevenuePool] = findCreatorRevenuePDA(mint.publicKey, this.wallet.publicKey);
        
        const createRevenuePoolInstruction = await this.program.methods
          .createCreatorRevenuePool()
          .accountsStrict({
            user: this.wallet.publicKey,
            mint: mint.publicKey,
            creatorRevenuePool,
            systemProgram: SystemProgram.programId,
          })
          .instruction();
        
        instructions.push(createRevenuePoolInstruction);
      }

      const { blockhash } = await this.connection.getLatestBlockhash();
      
      const messageV0 = new TransactionMessage({
        payerKey: this.wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: instructions,
      }).compileToV0Message();
      
      const versionedTx = new VersionedTransaction(messageV0);
      
      if (params.mint) {
        versionedTx.sign([params.mint]);
      } else {
        versionedTx.sign([mint]);
      }

      return {
        transaction: versionedTx,
        mint
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to create coin: ${errorMessage}`);
    }
  }

  async buyCoin(params: BuyCoinParams): Promise<VersionedTransaction> {
    this.validateBuyCoinParams(params);

    const [global] = findGlobalPDA();
    const [marketCap] = findMarketCapPDA(params.marketCapIndex);
    const [bondingCurve] = findBondingCurvePDA(params.mint);
    const [creatorRevenuePool] = findCreatorRevenuePDA(params.mint, params.creator);
    
    try {
      const globalData = await this.program.account.global.fetch(global);
      
      const associatedBondingCurve = await getAssociatedTokenAddress(
        params.mint,
        bondingCurve,
        true
      );
      
      const associatedUser = await getAssociatedTokenAddress(
        params.mint,
        this.wallet.publicKey
      );

      const instructions = [];

      try {
        await getAccount(this.connection, associatedUser);
      } catch (error) {
        instructions.push(
          createAssociatedTokenAccountInstruction(
            this.wallet.publicKey,
            associatedUser,
            this.wallet.publicKey,
            params.mint
          )
        );
      }

      try {
        await this.program.account.creatorRevenuePool.fetch(creatorRevenuePool);
      } catch (error) {
        const createRevenuePoolInstruction = await this.program.methods
          .createCreatorRevenuePool()
          .accountsStrict({
            user: this.wallet.publicKey,
            mint: params.mint,
            creatorRevenuePool,
            systemProgram: SystemProgram.programId,
          })
          .instruction();
        
        instructions.push(createRevenuePoolInstruction);
      }

      const buyInstruction = await this.program.methods
        .buy(
          params.marketCapIndex,
          params.tokenAmount,
          params.maxSolCost,
          params.referralFee || 0
        )
        .accountsStrict({
          user: this.wallet.publicKey,
          creator: params.creator,
          global,
          marketCap,
          feeRecipient: globalData.feeRecipient,
          mint: params.mint,
          bondingCurve,
          associatedBondingCurve,
          associatedUser,
          creatorRevenuePool,
          referral: params.referral || this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          eventAuthority: findEventAuthorityPDA()[0],
          program: PUMP_PROGRAM_ID,
        })
        .instruction();

      instructions.push(buyInstruction);

      const { blockhash } = await this.connection.getLatestBlockhash();
      
      const messageV0 = new TransactionMessage({
        payerKey: this.wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: instructions,
      }).compileToV0Message();
      
      return new VersionedTransaction(messageV0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to buy coin: ${errorMessage}`);
    }
  }

  async buyCoinWithSol(params: BuyCoinWithSolParams): Promise<VersionedTransaction> {
    // Validate parameters
    this.validateBuyCoinWithSolParams(params);

    const [global] = findGlobalPDA();
    const [marketCap] = findMarketCapPDA(params.marketCapIndex);
    const [bondingCurve] = findBondingCurvePDA(params.mint);
    
    try {
      const globalData = await this.program.account.global.fetch(global);
      const marketCapData = await this.program.account.marketCap.fetch(marketCap);
      const bondingCurveData = await this.program.account.bondingCurve.fetch(bondingCurve);
      
      const { tokenAmount } = calculateTokensForSol(
        params.solAmount,
        {
          reserveSol: new BN(bondingCurveData.reserveSol.toString()),
          reserveToken: new BN(bondingCurveData.reserveToken.toString()),
          completed: bondingCurveData.completed
        },
        {
          defaultTotalSupply: new BN(marketCapData.defaultTotalSupply.toString()),
          defaultTokenReserves: new BN(marketCapData.defaultTokenReserves.toString()),
          defaultTokenLiquidity: new BN(marketCapData.defaultTokenLiquidity.toString()),
        },
        globalData.fee
      );

      const slippage = params.slippage || 500; // Default 5%
      const maxSolCost = params.solAmount.mul(new BN(10000 + slippage)).div(new BN(10000));
      
      const buyParams: BuyCoinParams = {
        mint: params.mint,
        marketCapIndex: params.marketCapIndex,
        tokenAmount: tokenAmount,
        maxSolCost: maxSolCost,
        creator: params.creator,
        referralFee: params.referralFee,
        referral: params.referral
      };

      return this.buyCoin(buyParams);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to buy coin with SOL: ${errorMessage}`);
    }
  }

  async sellCoin(params: SellCoinParams): Promise<VersionedTransaction> {
    this.validateSellCoinParams(params);

    const [global] = findGlobalPDA();
    const [marketCap] = findMarketCapPDA(params.marketCapIndex);
    const [bondingCurve] = findBondingCurvePDA(params.mint);
    const [creatorRevenuePool] = findCreatorRevenuePDA(params.mint, params.creator);
    
    try {
      const globalData = await this.program.account.global.fetch(global);
      const bondingCurveData = await this.program.account.bondingCurve.fetch(bondingCurve);
      
      const { solAfterFee } = calculateSolForTokens(
        params.tokenAmount,
        {
          reserveSol: new BN(bondingCurveData.reserveSol.toString()),
          reserveToken: new BN(bondingCurveData.reserveToken.toString()),
          completed: bondingCurveData.completed
        },
        globalData.fee
      );

      const slippage = params.slippage || 500; // Default 5%
      const minSolOutput = solAfterFee.mul(new BN(10000 - slippage)).div(new BN(10000));
      
      const associatedBondingCurve = await getAssociatedTokenAddress(
        params.mint,
        bondingCurve,
        true
      );
      
      const associatedUser = await getAssociatedTokenAddress(
        params.mint,
        this.wallet.publicKey
      );

      const sellInstruction = await this.program.methods
        .sell(
          params.marketCapIndex,
          params.tokenAmount, // Use user's token input directly
          minSolOutput, // Minimum SOL expected with slippage
          params.referralFee || 0
        )
        .accountsStrict({
          user: this.wallet.publicKey,
          creator: params.creator,
          global,
          marketCap,
          feeRecipient: globalData.feeRecipient,
          mint: params.mint,
          bondingCurve,
          associatedBondingCurve,
          associatedUser,
          creatorRevenuePool,
          referral: params.referral || this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
          eventAuthority: findEventAuthorityPDA()[0],
          program: PUMP_PROGRAM_ID,
        })
        .instruction();

      const { blockhash } = await this.connection.getLatestBlockhash();
      
      const messageV0 = new TransactionMessage({
        payerKey: this.wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: [sellInstruction],
      }).compileToV0Message();
      
      return new VersionedTransaction(messageV0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to sell coin: ${errorMessage}`);
    }
  }

  async getGlobalAccount() {
    const [global] = findGlobalPDA();
    return await this.program.account.global.fetch(global);
  }

  async getMarketCapAccount(marketCapIndex: number) {
    const [marketCap] = findMarketCapPDA(marketCapIndex);
    return await this.program.account.marketCap.fetch(marketCap);
  }

  async getBondingCurveAccount(mint: PublicKey) {
    const [bondingCurve] = findBondingCurvePDA(mint);
    return await this.program.account.bondingCurve.fetch(bondingCurve);
  }

  async getCreatorRevenuePoolAccount(mint: PublicKey, creator: PublicKey) {
    const [creatorRevenuePool] = findCreatorRevenuePDA(mint, creator);
    return await this.program.account.creatorRevenuePool.fetch(creatorRevenuePool);
  }

  /**
   * Get complete token information 
   * Note: Creator address must be tracked separately as it's not stored in bonding curve
   */
  async getTokenInfo(mint: PublicKey) {
    const bondingCurve = await this.getBondingCurveAccount(mint);
    const marketCapData = await this.program.account.marketCap.fetch(bondingCurve.marketCap);
    
    return {
      mint: mint.toBase58(),
      marketCapPda: bondingCurve.marketCap.toBase58(),
      marketCapIndex: marketCapData.index,
      reserveSol: bondingCurve.reserveSol,
      reserveToken: bondingCurve.reserveToken,
      completed: bondingCurve.completed,
      totalSupply: marketCapData.defaultTotalSupply,
      tokenReserves: marketCapData.defaultTokenReserves,
      tokenLiquidity: marketCapData.defaultTokenLiquidity
    };
  }

  /**
   * Find creator address by searching for CreatorRevenuePool accounts
   * This is a workaround since creator is not stored in BondingCurve
   * 
   * LIMITATION: Only finds creator if they have a revenue pool created
   * For tokens without revenue pool, creator must be tracked off-chain
   */
  async findCreatorAddress(mint: PublicKey): Promise<PublicKey | null> {
    try {
      // Search for CreatorRevenuePool accounts for this mint
      const accounts = await this.program.account.creatorRevenuePool.all([
        {
          memcmp: {
            offset: 8 + 1, // Skip discriminator (8) + bump (1)
            bytes: mint.toBase58()
          }
        }
      ]);

      if (accounts.length > 0) {
        return accounts[0].account.creator;
      }
      
      return null;
    } catch (error) {
      console.warn('Could not find creator address:', error);
      return null;
    }
  }

  /**
   * Simplified buy - auto-fetches marketCapIndex from on-chain
   * Note: Creator address still required as it's not stored in bonding curve
   */
  async buyCoinSimple(params: {
    mint: PublicKey;
    tokenAmount: BN;
    maxSolCost: BN;
    creator: PublicKey; // Still required - not stored in bonding curve
    referralFee?: number;
    referral?: PublicKey;
  }): Promise<VersionedTransaction> {
    // Auto-fetch marketCapIndex from on-chain
    const bondingCurve = await this.getBondingCurveAccount(params.mint);
    const marketCapData = await this.program.account.marketCap.fetch(bondingCurve.marketCap);
    
    return this.buyCoin({
      mint: params.mint,
      marketCapIndex: marketCapData.index,
      tokenAmount: params.tokenAmount,
      maxSolCost: params.maxSolCost,
      creator: params.creator,
      referralFee: params.referralFee,
      referral: params.referral
    });
  }

  /**
   * Simplified buy with SOL - auto-fetches marketCapIndex
   * Note: Creator address still required as it's not stored on-chain in bonding curve
   */
  async buyCoinWithSolSimple(params: {
    mint: PublicKey;
    solAmount: BN;
    creator: PublicKey; // Still required - not stored in bonding curve
    slippage?: number;
    referralFee?: number;
    referral?: PublicKey;
  }): Promise<VersionedTransaction> {
    // Auto-fetch marketCapIndex from on-chain
    const bondingCurve = await this.getBondingCurveAccount(params.mint);
    const marketCapData = await this.program.account.marketCap.fetch(bondingCurve.marketCap);
    
    return this.buyCoinWithSol({
      mint: params.mint,
      marketCapIndex: marketCapData.index,
      solAmount: params.solAmount,
      slippage: params.slippage,
      creator: params.creator,
      referralFee: params.referralFee,
      referral: params.referral
    });
  }

  /**
   * Simplified sell - auto-fetches marketCapIndex
   * Note: Creator address still required as it's not stored on-chain in bonding curve
   */
  async sellCoinSimple(params: {
    mint: PublicKey;
    tokenAmount: BN;
    creator: PublicKey; // Still required - not stored in bonding curve
    slippage?: number;
    referralFee?: number;
    referral?: PublicKey;
  }): Promise<VersionedTransaction> {
    // Auto-fetch marketCapIndex from on-chain
    const bondingCurve = await this.getBondingCurveAccount(params.mint);
    const marketCapData = await this.program.account.marketCap.fetch(bondingCurve.marketCap);
    
    return this.sellCoin({
      mint: params.mint,
      marketCapIndex: marketCapData.index,
      tokenAmount: params.tokenAmount,
      slippage: params.slippage,
      creator: params.creator,
      referralFee: params.referralFee,
      referral: params.referral
    });
  }
}