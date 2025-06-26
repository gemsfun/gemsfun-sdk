# Gemsfun SDK

Simple SDK for interacting with Solmeme Program on Solana. Supports creating, buying, and selling coins with user-friendly UX.

## ✨ Key Features

- **Create Coin**: Create new coins with metadata
- **Buy Coin**: Input SOL amount → SDK automatically calculates tokens received
- **Sell Coin**: Input token amount → SDK automatically calculates SOL received  
- **Slippage Protection**: Automatic protection against slippage
- **Creator Revenue**: Automatic creator revenue pool management

## 📦 Installation

```bash
npm install @gems.fun/sdk
```

## 🚀 Basic Usage

### 1. Initialize Client

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { PumpClient } from '@gems.fun/sdk';

// In React component
const wallet = useWallet();

const client = useMemo(() => {
  if (!wallet.publicKey) return null;
  
  return new PumpClient(wallet as any, {
    rpcUrl: 'https://api.devnet.solana.com', // or mainnet
    commitment: 'confirmed'
  });
}, [wallet.publicKey]);
```

### 2. Create New Coin

```typescript
const [currentMint, setCurrentMint] = useState('');
const [currentCreator, setCurrentCreator] = useState('');

const handleCreateCoin = async () => {
  if (!client || !wallet.connected) return;
  
  try {
    // Create new coin
    const result = await client.createCoin({
      marketCapIndex: 1, // 1=42k, 2=57.5k, 3=75.3k SOL market cap
      name: "My Awesome Token",
      symbol: "MAT", 
      uri: "https://example.com/metadata.json",
      aiGenerated: false
    });
    
    // Sign and send transaction
    const signedTx = await wallet.signTransaction!(result.transaction);
    const signature = await client.connection.sendRawTransaction(signedTx.serialize());
    await client.connection.confirmTransaction(signature, 'confirmed');
    
    // Save mint and creator for buy/sell operations
    const mint = result.mint.publicKey.toBase58();
    const creator = wallet.publicKey.toBase58();
    
    setCurrentMint(mint);
    setCurrentCreator(creator);
    
    console.log('Coin created!', { mint, creator, signature });
  } catch (error) {
    console.error('Create failed:', error);
  }
};
```

### 3. Buy Coin

```typescript
const handleBuyCoin = async (solAmount: string) => {
  if (!client || !wallet.connected || !currentMint || !currentCreator) return;
  
  try {
    // User only needs to input SOL amount to spend
    const tx = await client.buyCoin({
      mint: new PublicKey(currentMint),
      marketCapIndex: 1,
      solAmount: new BN(parseFloat(solAmount) * 10**9), // Convert SOL to lamports
      slippage: 500, // 5% slippage tolerance (optional)
      creator: new PublicKey(currentCreator)
    });
    
    const signedTx = await wallet.signTransaction!(tx);
    const signature = await client.connection.sendRawTransaction(signedTx.serialize());
    await client.connection.confirmTransaction(signature, 'confirmed');
    
    console.log('Buy successful!', signature);
  } catch (error) {
    console.error('Buy failed:', error);
  }
};

// Usage: handleBuyCoin("0.01") to buy with 0.01 SOL
```

### 4. Sell Coin

```typescript
const handleSellCoin = async (tokenAmount: string) => {
  if (!client || !wallet.connected || !currentMint || !currentCreator) return;
  
  try {
    // User only needs to input token amount to sell
    const tx = await client.sellCoin({
      mint: new PublicKey(currentMint),
      marketCapIndex: 1,
      tokenAmount: new BN(parseFloat(tokenAmount) * 10**6), // Convert to token units
      slippage: 500, // 5% slippage tolerance (optional)
      creator: new PublicKey(currentCreator)
    });
    
    const signedTx = await wallet.signTransaction!(tx);
    const signature = await client.connection.sendRawTransaction(signedTx.serialize());
    await client.connection.confirmTransaction(signature, 'confirmed');
    
    console.log('Sell successful!', signature);
  } catch (error) {
    console.error('Sell failed:', error);
  }
};

// Usage: handleSellCoin("500") to sell 500 tokens
```

## 📝 Types

### CreateCoinParams
```typescript
interface CreateCoinParams {
  marketCapIndex: number;        // 1, 2, or 3
  name: string;                  // Coin name
  symbol: string;                // Coin symbol
  uri: string;                   // Metadata URI
  aiGenerated?: boolean;         // Whether AI generated
  mint?: Keypair;                // Custom mint keypair (optional)
  createCreatorRevenuePool?: boolean; // Create revenue pool (default: true)
}

interface CreateCoinResult {
  transaction: VersionedTransaction; // Transaction to sign
  mint: Keypair;                     // Mint keypair of new coin
}
```

### BuyCoinParams
```typescript
interface BuyCoinParams {
  mint: PublicKey;              // Coin mint address
  marketCapIndex: number;       // Market cap index (1, 2, 3)
  solAmount: BN;                // SOL amount to spend (lamports)
  slippage?: number;            // Slippage tolerance (basis points, default: 500)
  creator: PublicKey;           // Coin creator address
  referralFee?: number;         // Referral fee (optional)
  referral?: PublicKey;         // Referral address (optional)
}
```

### SellCoinParams
```typescript
interface SellCoinParams {
  mint: PublicKey;              // Coin mint address
  marketCapIndex: number;       // Market cap index (1, 2, 3)
  tokenAmount: BN;              // Token amount to sell
  slippage?: number;            // Slippage tolerance (basis points, default: 500)
  creator: PublicKey;           // Coin creator address
  referralFee?: number;         // Referral fee (optional)
  referral?: PublicKey;         // Referral address (optional)
}
```

## 🔧 Helper Utilities

```typescript
import { 
  findGlobalPDA,
  findMarketCapPDA, 
  findBondingCurvePDA,
  findCreatorRevenuePDA
} from '@gems.fun/sdk';

// Find PDA addresses
const [global] = findGlobalPDA();
const [marketCap] = findMarketCapPDA(1);
const [bondingCurve] = findBondingCurvePDA(mint);
const [creatorRevenue] = findCreatorRevenuePDA(mint, creator);
```

## ⚙️ Configuration

### Market Cap Index
- **1**: 42,000 SOL market cap
- **2**: 57,500 SOL market cap
- **3**: 75,300 SOL market cap

### Slippage Protection
- Default: **500** basis points (5%)
- Buy: Automatically increases maxSolCost based on slippage
- Sell: Automatically calculates minSolOutput based on slippage

### Network
- **Devnet**: `https://api.devnet.solana.com`
- **Mainnet**: `https://api.mainnet-beta.solana.com`

## 💡 Complete Example - React Hook

```typescript
import { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from 'bn.js';
import { PumpClient } from '@gems.fun/sdk';

export function useGemsfunActions() {
  const wallet = useWallet();
  const [currentMint, setCurrentMint] = useState('');
  const [currentCreator, setCurrentCreator] = useState('');
  
  const client = useMemo(() => {
    if (!wallet.publicKey) return null;
    
    return new PumpClient(wallet as any, {
      rpcUrl: 'https://api.devnet.solana.com',
      commitment: 'confirmed'
    });
  }, [wallet.publicKey]);

  const createCoin = async (name: string, symbol: string, uri: string) => {
    if (!client || !wallet.connected) throw new Error('Wallet not connected');
    
    const result = await client.createCoin({
      marketCapIndex: 1,
      name,
      symbol, 
      uri,
      aiGenerated: false
    });
    
    const signedTx = await wallet.signTransaction!(result.transaction);
    const signature = await client.connection.sendRawTransaction(signedTx.serialize());
    await client.connection.confirmTransaction(signature, 'confirmed');
    
    const mint = result.mint.publicKey.toBase58();
    const creator = wallet.publicKey.toBase58();
    
    setCurrentMint(mint);
    setCurrentCreator(creator);
    
    return { mint, creator, signature };
  };

  const buyCoin = async (solAmount: number) => {
    if (!client || !currentMint || !currentCreator) throw new Error('No coin selected');
    
    const tx = await client.buyCoin({
      mint: new PublicKey(currentMint),
      marketCapIndex: 1,
      solAmount: new BN(solAmount * 10**9),
      creator: new PublicKey(currentCreator)
    });
    
    const signedTx = await wallet.signTransaction!(tx);
    const signature = await client.connection.sendRawTransaction(signedTx.serialize());
    await client.connection.confirmTransaction(signature, 'confirmed');
    
    return signature;
  };

  const sellCoin = async (tokenAmount: number) => {
    if (!client || !currentMint || !currentCreator) throw new Error('No coin selected');
    
    const tx = await client.sellCoin({
      mint: new PublicKey(currentMint),
      marketCapIndex: 1,
      tokenAmount: new BN(tokenAmount * 10**6),
      creator: new PublicKey(currentCreator)
    });
    
    const signedTx = await wallet.signTransaction!(tx);
    const signature = await client.connection.sendRawTransaction(signedTx.serialize());
    await client.connection.confirmTransaction(signature, 'confirmed');
    
    return signature;
  };

  return { 
    client,
    currentMint,
    currentCreator,
    createCoin,
    buyCoin,
    sellCoin
  };
}
```

## 🚨 Important Notes

1. **Creator Address**: When creating a coin, the creator will be `wallet.publicKey`. Save the creator to use for buy/sell operations.

2. **Slippage**: SDK automatically calculates slippage protection. Can be customized with the `slippage` parameter.

3. **Token Decimals**: Tokens typically have 6 decimals. Example: 1 token = 1,000,000 units.

4. **Error Handling**: Always wrap in try-catch and check wallet connection.

5. **Transaction Confirmation**: Always confirm transactions before considering them successful.

## 🔗 Links

- **Program ID**: `FQCKTpkAviLqpUPEvbJ5epQLLPgVW5URSUw4CH7BXQTb`
- **Devnet Explorer**: https://explorer.solana.com/?cluster=devnet
- **Mainnet Explorer**: https://explorer.solana.com/