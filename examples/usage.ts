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
    
    const { transaction: createTx, mint } = await client.createCoin(createParams);
    console.log("Create transaction created for mint:", mint.publicKey.toBase58());
    
    // Simulate transaction trước khi send (optional)
    const simulation = await client.simulateTransaction(createTx);
    if (!simulation.success) {
      throw new Error(`Transaction simulation failed: ${simulation.error}`);
    }
    
    // Example 2: Mua coin với token amount cụ thể
    console.log("Buying coin with specific token amount...");
    const creator = keypair.publicKey; // Thường là creator của coin
    
    const buyParams = {
      mint: mint.publicKey,
      marketCapIndex: 1,
      tokenAmount: new BN(1000 * 10**6), // 1000 tokens (với 6 decimals)
      maxSolCost: new BN(0.01 * LAMPORTS_PER_SOL), // Max 0.01 SOL
      creator,
      referralFee: 0, // No referral fee
    };
    
    const buyTx = await client.buyCoin(buyParams);
    console.log("Buy transaction created");
    
    // Example 3: Mua coin với SOL amount (helper method)
    console.log("Buying coin with SOL amount...");
    const buySolParams = {
      mint: mint.publicKey,
      marketCapIndex: 1,
      solAmount: new BN(0.005 * LAMPORTS_PER_SOL), // 0.005 SOL
      slippage: 500, // 5% slippage
      creator,
    };
    
    const buySolTx = await client.buyCoinWithSol(buySolParams);
    console.log("Buy with SOL transaction created");
    
    // Example 4: Bán coin
    console.log("Selling coin...");
    const sellParams = {
      mint: mint.publicKey,
      marketCapIndex: 1,
      tokenAmount: new BN(500 * 10**6), // 500 tokens
      slippage: 500, // 5% slippage
      creator,
      referralFee: 0,
    };
    
    const sellTx = await client.sellCoin(sellParams);
    console.log("Sell transaction created");
    
    // Example 5: Fetch account data
    console.log("Fetching account data...");
    const globalAccount = await client.getGlobalAccount();
    console.log("Global fee:", globalAccount.fee);
    console.log("Global referral fee:", globalAccount.referralFee);
    
    const marketCapAccount = await client.getMarketCapAccount(1);
    console.log("Market cap total supply:", marketCapAccount.defaultTotalSupply.toString());
    
    const bondingCurveAccount = await client.getBondingCurveAccount(mint.publicKey);
    console.log("Bonding curve SOL reserves:", bondingCurveAccount.reserveSol.toString());
    console.log("Bonding curve completed:", bondingCurveAccount.completed);
    
    const revenuePoolAccount = await client.getCreatorRevenuePoolAccount(mint.publicKey, creator);
    console.log("Creator revenue accumulated:", revenuePoolAccount.accumulatedSol.toString());
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Example với error handling và simulation
async function advancedExample() {
  const keypair = Keypair.generate();
  const wallet = new Wallet(keypair);
  
  const client = new PumpClient(wallet, {
    rpcUrl: 'https://api.devnet.solana.com',
    commitment: 'confirmed'
  });

  try {
    // Tạo coin với validation
    const { transaction, mint } = await client.createCoin({
      marketCapIndex: 1,
      name: "Advanced Test Coin",
      symbol: "ATC",
      uri: "https://advanced.example.com/metadata.json",
      aiGenerated: false
    });

    // Simulate trước khi send
    console.log("Simulating transaction...");
    const result = await client.simulateTransaction(transaction);
    
    if (result.success) {
      console.log("✅ Transaction simulation successful");
      console.log("Logs:", result.logs);
      
      // Sign và send transaction
      transaction.sign([wallet.payer, mint]);
      const signature = await client.connection.sendRawTransaction(
        transaction.serialize()
      );
      
      console.log("Transaction sent:", signature);
      
      // Wait for confirmation
      await client.connection.confirmTransaction(signature, 'confirmed');
      console.log("Transaction confirmed!");
      
    } else {
      console.error("❌ Transaction simulation failed:", result.error);
      if (result.logs) {
        console.log("Logs:", result.logs);
      }
    }

  } catch (error) {
    console.error("Advanced example error:", error);
  }
}

// Uncomment để chạy examples
// example();
// advancedExample();

export { example, advancedExample };
