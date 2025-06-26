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

  // Method để tạo coin mới
  async createCoin(params: CreateCoinParams): Promise<CreateCoinResult> {
    const mint = params.mint || Keypair.generate();
    const [global] = findGlobalPDA();
    const [marketCap] = findMarketCapPDA(params.marketCapIndex);
    const [bondingCurve] = findBondingCurvePDA(mint.publicKey);
    
    // Tìm associated bonding curve token account
    const associatedBondingCurve = await getAssociatedTokenAddress(
      mint.publicKey,
      bondingCurve,
      true
    );

    // Tạo metadata PDA sử dụng Metaplex UMI
    const umi = createUmi(this.connection.rpcEndpoint);
    const [metadataString] = findMetadataPda(umi, { 
      mint: publicKey(mint.publicKey.toBase58()) 
    });
    const metadata = new PublicKey(metadataString);

    // Tạo instruction với tất cả accounts cần thiết
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

    // Tạo VersionedTransaction
    const { blockhash } = await this.connection.getLatestBlockhash();
    
    const messageV0 = new TransactionMessage({
      payerKey: this.wallet.publicKey,
      recentBlockhash: blockhash,
      instructions: instructions,
    }).compileToV0Message();
    
    const versionedTx = new VersionedTransaction(messageV0);
    
    // Sign với mint keypair
    if (params.mint) {
      versionedTx.sign([params.mint]);
    } else {
      versionedTx.sign([mint]);
    }

    return {
      transaction: versionedTx,
      mint
    };
  }

  // Method để mua coin
  async buyCoin(params: BuyCoinParams): Promise<VersionedTransaction> {
    const [global] = findGlobalPDA();
    const [marketCap] = findMarketCapPDA(params.marketCapIndex);
    const [bondingCurve] = findBondingCurvePDA(params.mint);
    const [creatorRevenuePool] = findCreatorRevenuePDA(params.mint, params.creator);
    
    // Fetch on-chain data
    const globalData = await this.program.account.global.fetch(global);
    const marketCapData = await this.program.account.marketCap.fetch(marketCap);
    const bondingCurveData = await this.program.account.bondingCurve.fetch(bondingCurve);
    
    // Calculate token amount from SOL input
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

    // Calculate slippage tolerance
    const slippage = params.slippage || 500; // Default 5%
    const maxSolCost = params.solAmount.mul(new BN(10000 + slippage)).div(new BN(10000));
    
    // Tìm các token accounts
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

    // Tạo ATA cho user nếu chưa có
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

    // Kiểm tra và tạo creator_revenue_pool nếu chưa có
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

    // Thêm buy instruction với token amount đã calculate
    const buyInstruction = await this.program.methods
      .buy(
        params.marketCapIndex,
        tokenAmount, // Use calculated token amount
        maxSolCost,
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

    // Tạo và return VersionedTransaction
    const { blockhash } = await this.connection.getLatestBlockhash();
    
    const messageV0 = new TransactionMessage({
      payerKey: this.wallet.publicKey,
      recentBlockhash: blockhash,
      instructions: instructions,
    }).compileToV0Message();
    
    return new VersionedTransaction(messageV0);
  }

  // Method để bán coin
  async sellCoin(params: SellCoinParams): Promise<VersionedTransaction> {
    const [global] = findGlobalPDA();
    const [marketCap] = findMarketCapPDA(params.marketCapIndex);
    const [bondingCurve] = findBondingCurvePDA(params.mint);
    const [creatorRevenuePool] = findCreatorRevenuePDA(params.mint, params.creator);
    
    // Fetch on-chain data
    const globalData = await this.program.account.global.fetch(global);
    const bondingCurveData = await this.program.account.bondingCurve.fetch(bondingCurve);
    
    // Calculate expected SOL output for token input
    const { solAfterFee } = calculateSolForTokens(
      params.tokenAmount,
      {
        reserveSol: new BN(bondingCurveData.reserveSol.toString()),
        reserveToken: new BN(bondingCurveData.reserveToken.toString()),
        completed: bondingCurveData.completed
      },
      globalData.fee
    );

    // Calculate slippage tolerance  
    const slippage = params.slippage || 500; // Default 5%
    const minSolOutput = solAfterFee.mul(new BN(10000 - slippage)).div(new BN(10000));
    
    // Tìm các token accounts
    const associatedBondingCurve = await getAssociatedTokenAddress(
      params.mint,
      bondingCurve,
      true
    );
    
    const associatedUser = await getAssociatedTokenAddress(
      params.mint,
      this.wallet.publicKey
    );

    // Tạo sell instruction với slippage protection
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

    // Tạo và return VersionedTransaction
    const { blockhash } = await this.connection.getLatestBlockhash();
    
    const messageV0 = new TransactionMessage({
      payerKey: this.wallet.publicKey,
      recentBlockhash: blockhash,
      instructions: [sellInstruction],
    }).compileToV0Message();
    
    return new VersionedTransaction(messageV0);
  }

  // Helper methods
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
}