import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import { BN } from 'bn.js';
import { 
  PumpClient, 
  findGlobalPDA, 
  findMarketCapPDA, 
  findBondingCurvePDA,
  findCreatorRevenuePDA,
  PUMP_PROGRAM_ID,
  calculateTokensForSol,
  calculateSolForTokens
} from '../src';

describe('Pump SDK', () => {
  let client: PumpClient;
  let wallet: Wallet;

  before(() => {
    const keypair = Keypair.generate();
    wallet = new Wallet(keypair);
    
    client = new PumpClient(wallet, {
      rpcUrl: 'https://api.devnet.solana.com',
      commitment: 'confirmed'
    });
  });

  describe('PDA Functions', () => {
    it('should find global PDA correctly', () => {
      const [globalPDA, bump] = findGlobalPDA();
      expect(globalPDA).to.be.instanceof(PublicKey);
      expect(bump).to.be.within(0, 255);
    });

    it('should find market cap PDA correctly', () => {
      const [marketCapPDA, bump] = findMarketCapPDA(1);
      expect(marketCapPDA).to.be.instanceof(PublicKey);
      expect(bump).to.be.within(0, 255);
    });

    it('should find bonding curve PDA correctly', () => {
      const mint = Keypair.generate().publicKey;
      const [bondingCurvePDA, bump] = findBondingCurvePDA(mint);
      expect(bondingCurvePDA).to.be.instanceof(PublicKey);
      expect(bump).to.be.within(0, 255);
    });

    it('should find creator revenue PDA correctly', () => {
      const mint = Keypair.generate().publicKey;
      const creator = Keypair.generate().publicKey;
      const [creatorRevenuePDA, bump] = findCreatorRevenuePDA(mint, creator);
      expect(creatorRevenuePDA).to.be.instanceof(PublicKey);
      expect(bump).to.be.within(0, 255);
    });
  });

  describe('Calculation Functions', () => {
    const mockBondingCurve = {
      reserveSol: new BN(17 * LAMPORTS_PER_SOL),
      reserveToken: new BN(608_000_000 * 10**6),
      completed: false
    };

    const mockMarketCap = {
      defaultTotalSupply: new BN(560_000_000 * 10**6),
      defaultTokenReserves: new BN(608_000_000 * 10**6),
      defaultTokenLiquidity: new BN(104_000_000 * 10**6)
    };

    it('should calculate token amount for SOL correctly', () => {
      const solAmount = new BN(0.01 * LAMPORTS_PER_SOL);
      
      const result = calculateTokensForSol(
        solAmount,
        mockBondingCurve,
        mockMarketCap,
        100
      );

      expect(result.tokenAmount).to.be.instanceof(BN);
      expect(result.tokenAmount.gt(new BN(0))).to.be.true;
      expect(result.fee.eq(solAmount.muln(100).divn(10000))).to.be.true;
    });

    it('should calculate SOL amount for tokens correctly', () => {
      const tokenAmount = new BN(1000 * 10**6);
      
      const result = calculateSolForTokens(
        tokenAmount,
        mockBondingCurve,
        100
      );

      expect(result.solAmount.gt(new BN(0))).to.be.true;
      expect(result.solAfterFee.gt(new BN(0))).to.be.true;
    });

    it('should throw error for completed bonding curve', () => {
      const completedCurve = { ...mockBondingCurve, completed: true };
      const solAmount = new BN(0.01 * LAMPORTS_PER_SOL);

      expect(() => {
        calculateTokensForSol(solAmount, completedCurve, mockMarketCap, 100);
      }).to.throw('Bonding curve is completed');
    });
  });

  describe('Client Validation', () => {
    it('should validate create coin parameters', async () => {
      const invalidParams = {
        marketCapIndex: 1,
        name: '',
        symbol: 'TEST',
        uri: 'https://test.com'
      };

      try {
        await client.createCoin(invalidParams);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).to.contain('Coin name is required');
      }
    });

    it('should validate buy coin parameters', async () => {
      const mint = Keypair.generate().publicKey;
      const creator = Keypair.generate().publicKey;
      
      const invalidParams = {
        mint,
        marketCapIndex: 1,
        tokenAmount: new BN(0),
        maxSolCost: new BN(LAMPORTS_PER_SOL),
        creator
      };

      try {
        await client.buyCoin(invalidParams);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).to.contain('Token amount must be greater than 0');
      }
    });

    it('should validate market cap index', async () => {
      const mint = Keypair.generate().publicKey;
      const creator = Keypair.generate().publicKey;
      
      const invalidParams = {
        mint,
        marketCapIndex: 5, // Invalid index
        tokenAmount: new BN(1000),
        maxSolCost: new BN(LAMPORTS_PER_SOL),
        creator
      };

      try {
        await client.buyCoin(invalidParams);
        expect.fail('Should have thrown validation error');
      } catch (error) {
        expect(error.message).to.contain('Market cap index must be 1, 2, or 3');
      }
    });
  });

  describe('Constants', () => {
    it('should export PUMP_PROGRAM_ID', () => {
      expect(PUMP_PROGRAM_ID).to.be.instanceof(PublicKey);
    });
  });
});
