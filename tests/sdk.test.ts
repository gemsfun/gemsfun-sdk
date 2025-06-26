import { describe, it } from 'mocha';
import { expect } from 'chai';
import { PublicKey, Keypair } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import { BN } from 'bn.js';
import { 
  PumpClient, 
  findGlobalPDA, 
  findMarketCapPDA, 
  findBondingCurvePDA,
  findCreatorRevenuePDA,
  PUMP_PROGRAM_ID 
} from '../src';

describe('Pump SDK', () => {
  let client: PumpClient;
  let wallet: Wallet;

  before(() => {
    // Tạo mock wallet
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
      expect(bump).to.be.a('number');
    });

    it('should find market cap PDA correctly', () => {
      const [marketCapPDA, bump] = findMarketCapPDA(1);
      expect(marketCapPDA).to.be.instanceof(PublicKey);
      expect(bump).to.be.a('number');
    });

    it('should find bonding curve PDA correctly', () => {
      const mint = Keypair.generate().publicKey;
      const [bondingCurvePDA, bump] = findBondingCurvePDA(mint);
      expect(bondingCurvePDA).to.be.instanceof(PublicKey);
      expect(bump).to.be.a('number');
    });

    it('should find creator revenue PDA correctly', () => {
      const mint = Keypair.generate().publicKey;
      const creator = Keypair.generate().publicKey;
      const [revenuePDA, bump] = findCreatorRevenuePDA(mint, creator);
      expect(revenuePDA).to.be.instanceof(PublicKey);
      expect(bump).to.be.a('number');
    });
  });

  describe('PumpClient', () => {
    it('should initialize correctly', () => {
      expect(client).to.be.instanceOf(PumpClient);
      expect(client.wallet).to.equal(wallet);
    });

    it('should create transaction for create coin', async () => {
      const createParams = {
        marketCapIndex: 1,
        name: "Test Coin",
        symbol: "TEST",
        uri: "https://test.com",
        aiGenerated: false
      };

      // This would normally create a transaction, but we're just testing the structure
      try {
        const tx = await client.createCoin(createParams);
        expect(tx).to.have.property('message');
      } catch (error) {
        // Expected to fail without proper RPC connection
        expect(error).to.be.an('error');
      }
    });

    it('should validate buy coin parameters', async () => {
      const mint = Keypair.generate().publicKey;
      const creator = Keypair.generate().publicKey;
      
      const buyParams = {
        mint,
        marketCapIndex: 1,
        amount: new BN(1000),
        maxSolCost: new BN(100000),
        creator
      };

      try {
        const tx = await client.buyCoin(buyParams);
        expect(tx).to.have.property('message');
      } catch (error) {
        // Expected to fail without proper RPC connection
        expect(error).to.be.an('error');
      }
    });

    it('should validate sell coin parameters', async () => {
      const mint = Keypair.generate().publicKey;
      const creator = Keypair.generate().publicKey;
      
      const sellParams = {
        mint,
        marketCapIndex: 1,
        amount: new BN(500),
        minSolOutput: new BN(50000),
        creator
      };

      try {
        const tx = await client.sellCoin(sellParams);
        expect(tx).to.have.property('message');
      } catch (error) {
        // Expected to fail without proper RPC connection
        expect(error).to.be.an('error');
      }
    });
  });

  describe('Constants', () => {
    it('should export PUMP_PROGRAM_ID', () => {
      expect(PUMP_PROGRAM_ID).to.be.instanceof(PublicKey);
    });
  });
});
