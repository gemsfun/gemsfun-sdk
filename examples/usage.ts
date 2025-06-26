import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Wallet } from "@coral-xyz/anchor";
import { BN } from "bn.js";
import { PumpClient } from "../src";

// Example usage của PumpClient SDK
async function example() {
  // Tạo wallet và connection
  const privateKey = new Uint8Array([/* your private key */]);
  const keypair = Keypair.fromSecretKey(privateKey);
  const wallet = new Wallet(keypair);
  
  // Khởi tạo client
  const client = new PumpClient(wallet, {
    rpcUrl: 'https://api.devnet.solana.com',
    commitment: 'confirmed'
  });

  try {
    // Example 1: Tạo coin mới
    console.log("Creating new coin...");
    const createParams = {
      marketCapIndex: 1, // 42k market cap
      name: "Test Coin",
      symbol: "TEST",
      uri: "https://example.com/metadata.json",
      aiGenerated: false,
      createCreatorRevenuePool: true
    };
    
    const createTx = await client.createCoin(createParams);
    console.log("Create transaction created:", createTx);
    
    // Example 2: Mua coin
    console.log("Buying coin...");
    const mint = new PublicKey("YOUR_MINT_ADDRESS");
    const creator = new PublicKey("YOUR_CREATOR_ADDRESS");
    
    const buyParams = {
      mint,
      marketCapIndex: 1,
      amount: new BN(1000 * 10**6), // 1000 tokens
      maxSolCost: new BN(0.01 * LAMPORTS_PER_SOL), // Max 0.01 SOL
      creator,
      referralFee: 0,
    };
    
    const buyTx = await client.buyCoin(buyParams);
    console.log("Buy transaction created:", buyTx);
    
    // Example 3: Bán coin
    console.log("Selling coin...");
    const sellParams = {
      mint,
      marketCapIndex: 1,
      amount: new BN(500 * 10**6), // 500 tokens
      minSolOutput: new BN(0.005 * LAMPORTS_PER_SOL), // Min 0.005 SOL
      creator,
      referralFee: 0,
    };
    
    const sellTx = await client.sellCoin(sellParams);
    console.log("Sell transaction created:", sellTx);
    
    // Example 4: Fetch account data
    console.log("Fetching account data...");
    const globalAccount = await client.getGlobalAccount();
    console.log("Global account:", globalAccount);
    
    const marketCapAccount = await client.getMarketCapAccount(1);
    console.log("Market cap account:", marketCapAccount);
    
    const bondingCurveAccount = await client.getBondingCurveAccount(mint);
    console.log("Bonding curve account:", bondingCurveAccount);
    
    const revenuePoolAccount = await client.getCreatorRevenuePoolAccount(mint, creator);
    console.log("Revenue pool account:", revenuePoolAccount);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Uncomment để chạy example
// example();

export default example;
