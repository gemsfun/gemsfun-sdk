# Pump SDK

A TypeScript SDK for interacting with the Pump Protocol - a Solana-based pump.fun style token creation and trading platform with bonding curve mechanics.

[![npm version](https://badge.fury.io/js/@your-org/pump-sdk.svg)](https://badge.fury.io/js/@your-org/pump-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📚 Documentation

- **[Test It Now](./TEST_SETUP.md)** ← **Try the SDK in 5 minutes** 🚀
- **[Simple Integration Guide](./SIMPLE_INTEGRATION.md)** ← **Integration docs** 🎯
- [Quick Reference](./QUICK_REFERENCE.md) - Common operations
- [Cheat Sheet](./CHEAT_SHEET.md) - Ultra-quick reference
- [Full Integration Guide](./INTEGRATION_GUIDE.md) - Detailed examples
- [API Reference](./API.md) - Complete API documentation

## ⚠️ Important

**The creator address is NOT stored on-chain.** You must save it to your database when creating tokens. See [Simple Integration Guide](./SIMPLE_INTEGRATION.md) for details.

## Features

- ✅ **Token Creation**: Create new tokens with metadata
- ✅ **Token Trading**: Buy and sell tokens using bonding curve mechanics  
- ✅ **Revenue Sharing**: Built-in creator revenue pools
- ✅ **Slippage Protection**: Automatic slippage calculation and protection
- ✅ **Transaction Simulation**: Validate transactions before sending
- ✅ **TypeScript Support**: Full type safety with comprehensive interfaces
- ✅ **Multiple Buy Modes**: Buy with specific token amounts or SOL amounts

## Installation

```bash
npm install @your-org/pump-sdk
# or
yarn add @your-org/pump-sdk
# or
pnpm add @your-org/pump-sdk
```

## Quick Start

```bash
npm install @gems.fun/sdk
```

```typescript
import { PumpClient } from '@gems.fun/sdk';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from 'bn.js';

// Initialize
const client = new PumpClient(wallet, {
  rpcUrl: 'https://api.devnet.solana.com'
});

// 1. Create token
const { transaction, mint } = await client.createCoin({
  marketCapIndex: 1,
  name: "My Token",
  symbol: "MTK",
  uri: "https://example.com/metadata.json"
});

// Sign and send
const signed = await wallet.signTransaction(transaction);
await connection.sendRawTransaction(signed.serialize());

// ⚠️ SAVE TO DATABASE - CRITICAL!
await db.tokens.create({
  mint: mint.publicKey.toBase58(),
  creator: wallet.publicKey.toBase58() // Required for buy/sell!
});

// 2. Buy tokens (fetch creator from your DB)
const token = await db.tokens.findOne({ mint });
const buyTx = await client.buyCoinWithSolSimple({
  mint: new PublicKey(token.mint),
  creator: new PublicKey(token.creator),
  solAmount: new BN(0.01 * LAMPORTS_PER_SOL),
  slippage: 500 // 5%
});

const buySigned = await wallet.signTransaction(buyTx);
await connection.sendRawTransaction(buySigned.serialize());
```

**👉 See [SIMPLE_INTEGRATION.md](./SIMPLE_INTEGRATION.md) for complete examples.**

## API Reference

### PumpClient

The main class for interacting with the Pump Protocol.

#### Constructor

```typescript
new PumpClient(wallet: Wallet, config?: PumpClientConfig)
```

**Parameters:**
- `wallet`: Anchor Wallet instance
- `config` (optional): Configuration options

**Config Options:**
```typescript
interface PumpClientConfig {
  rpcUrl?: string; // Default: 'https://api.mainnet-beta.solana.com'
  commitment?: 'processed' | 'confirmed' | 'finalized'; // Default: 'confirmed'
}
```

### Core Methods

#### createCoin()

Create a new token with metadata and bonding curve.

```typescript
async createCoin(params: CreateCoinParams): Promise<CreateCoinResult>
```

**Parameters:**
```typescript
interface CreateCoinParams {
  marketCapIndex: number; // Market cap tier (1=42k, 2=57.5k, 3=75.3k)
  name: string; // Token name
  symbol: string; // Token symbol
  uri: string; // Metadata URI
  aiGenerated?: boolean; // Default: false
  mint?: Keypair; // Custom mint keypair (optional)
  createCreatorRevenuePool?: boolean; // Default: true
}
```

**Returns:**
```typescript
interface CreateCoinResult {
  transaction: VersionedTransaction;
  mint: Keypair;
}
```

#### buyCoin()

Buy tokens with a specific token amount.

```typescript
async buyCoin(params: BuyCoinParams): Promise<VersionedTransaction>
```

**Parameters:**
```typescript
interface BuyCoinParams {
  mint: PublicKey; // Token mint address
  marketCapIndex: number; // Market cap tier
  tokenAmount: BN; // Amount of tokens to buy
  maxSolCost: BN; // Maximum SOL willing to spend
  creator: PublicKey; // Token creator address
  referralFee?: number; // Referral fee in basis points (optional)
  referral?: PublicKey; // Referral address (optional)
}
```

#### buyCoinWithSol()

Buy tokens by specifying SOL amount to spend (helper method).

```typescript
async buyCoinWithSol(params: BuyCoinWithSolParams): Promise<VersionedTransaction>
```

**Parameters:**
```typescript
interface BuyCoinWithSolParams {
  mint: PublicKey; // Token mint address
  marketCapIndex: number; // Market cap tier
  solAmount: BN; // SOL amount to spend
  slippage?: number; // Slippage tolerance in basis points (default: 500 = 5%)
  creator: PublicKey; // Token creator address
  referralFee?: number; // Referral fee in basis points (optional)
  referral?: PublicKey; // Referral address (optional)
}
```

#### sellCoin()

Sell tokens for SOL.

```typescript
async sellCoin(params: SellCoinParams): Promise<VersionedTransaction>
```

**Parameters:**
```typescript
interface SellCoinParams {
  mint: PublicKey; // Token mint address
  marketCapIndex: number; // Market cap tier
  tokenAmount: BN; // Amount of tokens to sell
  slippage?: number; // Slippage tolerance in basis points (default: 500 = 5%)
  creator: PublicKey; // Token creator address
  referralFee?: number; // Referral fee in basis points (optional)
  referral?: PublicKey; // Referral address (optional)
}
```

### Utility Methods

#### simulateTransaction()

Simulate a transaction before sending to validate it will succeed.

```typescript
async simulateTransaction(transaction: VersionedTransaction): Promise<{
  success: boolean;
  error?: string;
  logs?: string[];
}>
```

### Account Getter Methods

```typescript
// Get global program configuration
async getGlobalAccount(): Promise<GlobalAccount>

// Get market cap configuration
async getMarketCapAccount(marketCapIndex: number): Promise<MarketCapAccount>

// Get bonding curve state
async getBondingCurveAccount(mint: PublicKey): Promise<BondingCurveAccount>

// Get creator revenue pool
async getCreatorRevenuePoolAccount(mint: PublicKey, creator: PublicKey): Promise<CreatorRevenuePoolAccount>
```

## Utility Functions

The SDK exports useful utility functions:

```typescript
import { 
  findGlobalPDA,
  findMarketCapPDA,
  findBondingCurvePDA,
  findCreatorRevenuePDA,
  calculateTokensForSol,
  calculateSolForTokens
} from '@your-org/pump-sdk';

// Find Program Derived Addresses (PDAs)
const [globalPDA, bump] = findGlobalPDA();
const [marketCapPDA, bump] = findMarketCapPDA(1);
const [bondingCurvePDA, bump] = findBondingCurvePDA(mintAddress);

// Calculate trade amounts
const { tokenAmount, fee } = calculateTokensForSol(
  solAmount,
  bondingCurveState,
  marketCapState,
  feePercent
);

const { solAmount, solAfterFee } = calculateSolForTokens(
  tokenAmount,
  bondingCurveState,
  feePercent
);
```

## Market Cap Tiers

The protocol supports multiple market cap tiers:

| Index | Market Cap | Total Supply | Token Reserves | Token Liquidity |
|-------|------------|--------------|----------------|-----------------|
| 1     | 42k        | 560M         | 608M           | 104M            |
| 2     | 57.5k      | TBD          | TBD            | TBD             |
| 3     | 75.3k      | TBD          | TBD            | TBD             |

## Examples
### Complete Token Creation and Trading Flow

```typescript
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet } from '@coral-xyz/anchor';
import { BN } from 'bn.js';
import { PumpClient } from '@your-org/pump-sdk';

async function completeExample() {
  // Setup
  const keypair = Keypair.fromSecretKey(/* your private key */);
  const wallet = new Wallet(keypair);
  const client = new PumpClient(wallet, {
    rpcUrl: 'https://api.devnet.solana.com'
  });

  try {
    // 1. Create a new token
    const { transaction: createTx, mint } = await client.createCoin({
      marketCapIndex: 1,
      name: "Example Token",
      symbol: "EXAM",
      uri: "https://example.com/token-metadata.json",
      aiGenerated: false
    });

    // Simulate before sending
    const simulation = await client.simulateTransaction(createTx);
    if (!simulation.success) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }

    // Sign and send
    createTx.sign([wallet.payer, mint]);
    const createSig = await client.connection.sendRawTransaction(
      createTx.serialize()
    );
    console.log('Token created:', createSig);
    
    // Wait for confirmation
    await client.connection.confirmTransaction(createSig, 'confirmed');

    // 2. Buy tokens with SOL amount
    const buyTx = await client.buyCoinWithSol({
      mint: mint.publicKey,
      marketCapIndex: 1,
      solAmount: new BN(0.01 * LAMPORTS_PER_SOL), // 0.01 SOL
      slippage: 500, // 5%
      creator: keypair.publicKey
    });

    buyTx.sign([wallet.payer]);
    const buySig = await client.connection.sendRawTransaction(
      buyTx.serialize()
    );
    console.log('Tokens bought:', buySig);

    // 3. Sell some tokens
    const sellTx = await client.sellCoin({
      mint: mint.publicKey,
      marketCapIndex: 1,
      tokenAmount: new BN(500 * 10**6), // 500 tokens
      slippage: 500, // 5%
      creator: keypair.publicKey
    });

    sellTx.sign([wallet.payer]);
    const sellSig = await client.connection.sendRawTransaction(
      sellTx.serialize()
    );
    console.log('Tokens sold:', sellSig);

  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Advanced Error Handling

```typescript
async function robustTrading() {
  const client = new PumpClient(wallet, { rpcUrl: 'https://api.devnet.solana.com' });

  try {
    const buyTx = await client.buyCoinWithSol({
      mint: tokenMint,
      marketCapIndex: 1,
      solAmount: new BN(0.1 * LAMPORTS_PER_SOL),
      slippage: 300, // 3%
      creator: creatorAddress
    });

    // Always simulate first
    const simulation = await client.simulateTransaction(buyTx);
    if (!simulation.success) {
      console.error('Simulation failed:', simulation.error);
      if (simulation.logs) {
        console.log('Transaction logs:', simulation.logs);
      }
      return;
    }

    // Send transaction
    buyTx.sign([wallet.payer]);
    const signature = await client.connection.sendRawTransaction(
      buyTx.serialize(),
      { 
        skipPreflight: true, // Since we already simulated
        maxRetries: 3
      }
    );

    // Wait for confirmation with timeout
    const confirmation = await client.connection.confirmTransaction(
      signature,
      'confirmed'
    );

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    console.log('✅ Transaction successful:', signature);

  } catch (error) {
    if (error.message.includes('insufficient funds')) {
      console.error('❌ Insufficient SOL balance');
    } else if (error.message.includes('slippage')) {
      console.error('❌ Slippage exceeded, try increasing slippage tolerance');
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}
```

## Error Handling

Common errors and how to handle them:

```typescript
try {
  await client.buyCoin(params);
} catch (error) {
  if (error.message.includes('Token amount must be greater than 0')) {
    // Invalid token amount
  } else if (error.message.includes('Bonding curve is completed')) {
    // Token has graduated from bonding curve
  } else if (error.message.includes('Insufficient tokens')) {
    // Not enough tokens available
  } else if (error.message.includes('No tokens available')) {
    // Bonding curve empty
  }
}
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@your-org.com
- 💬 Discord: [Your Discord Server](https://discord.gg/your-server)
- 📖 Documentation: [Full Documentation](https://docs.your-org.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/pump-sdk/issues)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and updates.

---

**⚠️ Disclaimer**: This SDK is for educational and development purposes. Always test thoroughly before using in production. Trading cryptocurrencies involves risk.
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

## Next.js Integration

Complete setup guide for integrating with Next.js applications.

### 1. Install Dependencies

```bash
# SDK and wallet adapters
npm install @gems.fun/sdk @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets
```

### 2. Setup Wallet Provider

Create `components/WalletProvider.tsx`:

```typescript
'use client';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { ReactNode, useMemo } from 'react';

// Import wallet adapter CSS
require('@solana/wallet-adapter-react-ui/styles.css');

interface Props {
  children: ReactNode;
}

export function AppWalletProvider({ children }: Props) {
  const network = WalletAdapterNetwork.Devnet; // or Mainnet
  const endpoint = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
  
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### 3. Setup Root Layout

Update `app/layout.tsx`:

```typescript
import { AppWalletProvider } from '@/components/WalletProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppWalletProvider>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
```

### 4. Environment Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
# For mainnet: https://api.mainnet-beta.solana.com
```

### 5. Create Trading Component

```typescript
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PumpClient } from '@gems.fun/sdk';
import { useState, useMemo } from 'react';
import { BN } from 'bn.js';

export default function TradingPage() {
  const wallet = useWallet();
  const [tokenMint, setTokenMint] = useState('');
  const [creatorAddress, setCreatorAddress] = useState('');

  const client = useMemo(() => {
    if (!wallet.publicKey || !wallet.connected) return null;
    
    return new PumpClient(wallet as any, {
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
      commitment: 'confirmed'
    });
  }, [wallet.connected, wallet.publicKey]);

  const createToken = async () => {
    if (!client || !wallet.connected) return;
    
    try {
      const { transaction, mint } = await client.createCoin({
        marketCapIndex: 1,
        name: "My Token",
        symbol: "MTK",
        uri: "https://example.com/metadata.json"
      });

      const signedTx = await wallet.signTransaction!(transaction);
      const signature = await client.connection.sendRawTransaction(signedTx.serialize());
      
      console.log('Token created:', signature);
      setTokenMint(mint.publicKey.toString());
      setCreatorAddress(wallet.publicKey!.toString());
    } catch (error) {
      console.error('Create failed:', error);
    }
  };

  const buyTokens = async () => {
    if (!client || !tokenMint || !creatorAddress) return;
    
    try {
      const tx = await client.buyCoinWithSol({
        mint: new PublicKey(tokenMint),
        marketCapIndex: 1,
        solAmount: new BN(0.01 * 10**9), // 0.01 SOL
        creator: new PublicKey(creatorAddress)
      });

      const signedTx = await wallet.signTransaction!(tx);
      const signature = await client.connection.sendRawTransaction(signedTx.serialize());
      
      console.log('Tokens bought:', signature);
    } catch (error) {
      console.error('Buy failed:', error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Pump SDK Demo</h1>
      
      <div className="mb-4">
        <WalletMultiButton />
      </div>

      {wallet.connected && (
        <div className="space-y-4">
          <button 
            onClick={createToken}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create Token
          </button>
          
          {tokenMint && (
            <button 
              onClick={buyTokens}
              className="bg-green-500 text-white px-4 py-2 rounded ml-2"
            >
              Buy Tokens
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

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