# API Reference

Complete API reference for the Pump SDK.

## Table of Contents

- [Installation](#installation)
- [Client Configuration](#client-configuration)
- [Core Methods](#core-methods)
- [Utility Functions](#utility-functions)
- [Account Getters](#account-getters)
- [Types and Interfaces](#types-and-interfaces)
- [Error Handling](#error-handling)

## Installation

```bash
npm install @your-org/pump-sdk
```

## Client Configuration

### PumpClient Constructor

```typescript
import { PumpClient } from '@your-org/pump-sdk';
import { Wallet } from '@coral-xyz/anchor';

const client = new PumpClient(wallet: Wallet, config?: PumpClientConfig);
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `wallet` | `Wallet` | Anchor Wallet instance (required) |
| `config` | `PumpClientConfig` | Configuration options (optional) |

#### PumpClientConfig

```typescript
interface PumpClientConfig {
  rpcUrl?: string; // Default: 'https://api.mainnet-beta.solana.com'
  commitment?: 'processed' | 'confirmed' | 'finalized'; // Default: 'confirmed'
}
```

## Core Methods

### createCoin()

Create a new token with metadata and bonding curve.

```typescript
async createCoin(params: CreateCoinParams): Promise<CreateCoinResult>
```

#### Parameters

```typescript
interface CreateCoinParams {
  marketCapIndex: number; // Market cap tier (1=42k, 2=57.5k, 3=75.3k)
  name: string; // Token name (max 32 chars)
  symbol: string; // Token symbol (max 10 chars)
  uri: string; // Metadata URI
  aiGenerated?: boolean; // Whether AI generated (default: false)
  mint?: Keypair; // Custom mint keypair (optional)
  createCreatorRevenuePool?: boolean; // Create revenue pool (default: true)
}
```

#### Returns

```typescript
interface CreateCoinResult {
  transaction: VersionedTransaction; // Transaction to sign and send
  mint: Keypair; // Mint keypair for the new token
}
```

#### Example

```typescript
const { transaction, mint } = await client.createCoin({
  marketCapIndex: 1,
  name: "My Token",
  symbol: "MTK",
  uri: "https://example.com/metadata.json"
});

transaction.sign([wallet.payer, mint]);
const signature = await connection.sendRawTransaction(transaction.serialize());
```

### buyCoin()

Buy tokens with a specific token amount.

```typescript
async buyCoin(params: BuyCoinParams): Promise<VersionedTransaction>
```

#### Parameters

```typescript
interface BuyCoinParams {
  mint: PublicKey; // Token mint address
  marketCapIndex: number; // Market cap tier (1, 2, or 3)
  tokenAmount: BN; // Amount of tokens to buy (in token units)
  maxSolCost: BN; // Maximum SOL willing to spend (in lamports)
  creator: PublicKey; // Token creator address
  referralFee?: number; // Referral fee in basis points (optional)
  referral?: PublicKey; // Referral address (optional)
}
```

#### Example

```typescript
const transaction = await client.buyCoin({
  mint: new PublicKey('...'),
  marketCapIndex: 1,
  tokenAmount: new BN(1000 * 10**6), // 1000 tokens
  maxSolCost: new BN(0.01 * LAMPORTS_PER_SOL), // Max 0.01 SOL
  creator: new PublicKey('...')
});
```

### buyCoinWithSol()

Buy tokens by specifying SOL amount to spend.

```typescript
async buyCoinWithSol(params: BuyCoinWithSolParams): Promise<VersionedTransaction>
```

#### Parameters

```typescript
interface BuyCoinWithSolParams {
  mint: PublicKey; // Token mint address
  marketCapIndex: number; // Market cap tier (1, 2, or 3)
  solAmount: BN; // SOL amount to spend (in lamports)
  slippage?: number; // Slippage tolerance in basis points (default: 500 = 5%)
  creator: PublicKey; // Token creator address
  referralFee?: number; // Referral fee in basis points (optional)
  referral?: PublicKey; // Referral address (optional)
}
```

#### Example

```typescript
const transaction = await client.buyCoinWithSol({
  mint: new PublicKey('...'),
  marketCapIndex: 1,
  solAmount: new BN(0.01 * LAMPORTS_PER_SOL), // 0.01 SOL
  slippage: 500, // 5% slippage tolerance
  creator: new PublicKey('...')
});
```

### sellCoin()

Sell tokens for SOL.

```typescript
async sellCoin(params: SellCoinParams): Promise<VersionedTransaction>
```

#### Parameters

```typescript
interface SellCoinParams {
  mint: PublicKey; // Token mint address
  marketCapIndex: number; // Market cap tier (1, 2, or 3)
  tokenAmount: BN; // Amount of tokens to sell (in token units)
  slippage?: number; // Slippage tolerance in basis points (default: 500 = 5%)
  creator: PublicKey; // Token creator address
  referralFee?: number; // Referral fee in basis points (optional)
  referral?: PublicKey; // Referral address (optional)
}
```

#### Example

```typescript
const transaction = await client.sellCoin({
  mint: new PublicKey('...'),
  marketCapIndex: 1,
  tokenAmount: new BN(500 * 10**6), // 500 tokens
  slippage: 500, // 5% slippage tolerance
  creator: new PublicKey('...')
});
```

### simulateTransaction()

Simulate a transaction before sending to validate it will succeed.

```typescript
async simulateTransaction(transaction: VersionedTransaction): Promise<{
  success: boolean;
  error?: string;
  logs?: string[];
}>
```

#### Example

```typescript
const simulation = await client.simulateTransaction(transaction);
if (!simulation.success) {
  console.error('Simulation failed:', simulation.error);
  console.log('Logs:', simulation.logs);
  return;
}

// Proceed with signing and sending
```

## Utility Functions

Import utility functions separately:

```typescript
import { 
  findGlobalPDA,
  findMarketCapPDA,
  findBondingCurvePDA,
  findCreatorRevenuePDA,
  calculateTokensForSol,
  calculateSolForTokens
} from '@your-org/pump-sdk';
```

### PDA Finders

#### findGlobalPDA()

```typescript
function findGlobalPDA(): [PublicKey, number]
```

Find the global program configuration PDA.

#### findMarketCapPDA()

```typescript
function findMarketCapPDA(marketCapIndex: number): [PublicKey, number]
```

Find market cap configuration PDA for a specific tier.

#### findBondingCurvePDA()

```typescript
function findBondingCurvePDA(mint: PublicKey): [PublicKey, number]
```

Find bonding curve PDA for a token mint.

#### findCreatorRevenuePDA()

```typescript
function findCreatorRevenuePDA(mint: PublicKey, creator: PublicKey): [PublicKey, number]
```

Find creator revenue pool PDA.

### Calculation Functions

#### calculateTokensForSol()

```typescript
function calculateTokensForSol(
  solAmount: BN,
  bondingCurve: BondingCurveAccount,
  marketCap: MarketCapAccount,
  feePercent: number
): { tokenAmount: BN; fee: BN }
```

Calculate how many tokens can be bought with a given SOL amount.

#### calculateSolForTokens()

```typescript
function calculateSolForTokens(
  tokenAmount: BN,
  bondingCurve: BondingCurveAccount,
  feePercent: number
): { solAmount: BN; solAfterFee: BN }
```

Calculate how much SOL will be received for selling tokens.

## Account Getters

### getGlobalAccount()

```typescript
async getGlobalAccount(): Promise<GlobalAccount>
```

Get the global program configuration account.

### getMarketCapAccount()

```typescript
async getMarketCapAccount(marketCapIndex: number): Promise<MarketCapAccount>
```

Get market cap configuration for a specific tier.

### getBondingCurveAccount()

```typescript
async getBondingCurveAccount(mint: PublicKey): Promise<BondingCurveAccount>
```

Get bonding curve state for a token.

### getCreatorRevenuePoolAccount()

```typescript
async getCreatorRevenuePoolAccount(
  mint: PublicKey, 
  creator: PublicKey
): Promise<CreatorRevenuePoolAccount>
```

Get creator revenue pool information.

## Types and Interfaces

### Account Types

#### GlobalAccount

```typescript
interface GlobalAccount {
  authority: PublicKey;
  feePercent: number;
  lockFee: BN;
  // ... other fields
}
```

#### MarketCapAccount

```typescript
interface MarketCapAccount {
  marketCapIndex: number;
  marketCapSol: BN;
  totalSupply: BN;
  tokenReserve: BN;
  tokenLiquidity: BN;
  // ... other fields
}
```

#### BondingCurveAccount

```typescript
interface BondingCurveAccount {
  mint: PublicKey;
  creator: PublicKey;
  marketCapIndex: number;
  tokenReserve: BN;
  solReserve: BN;
  completed: boolean;
  // ... other fields
}
```

#### CreatorRevenuePoolAccount

```typescript
interface CreatorRevenuePoolAccount {
  mint: PublicKey;
  creator: PublicKey;
  solAmount: BN;
  claimed: boolean;
  // ... other fields
}
```

### Parameter Types

All parameter interfaces are exported from the main module:

```typescript
import type {
  CreateCoinParams,
  CreateCoinResult,
  BuyCoinParams,
  BuyCoinWithSolParams,
  SellCoinParams,
  PumpClientConfig
} from '@your-org/pump-sdk';
```

## Error Handling

### Common Errors

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Token amount must be greater than 0` | Invalid token amount | Check token amount parameter |
| `SOL amount must be greater than 0` | Invalid SOL amount | Check SOL amount parameter |
| `Market cap index must be 1, 2, or 3` | Invalid market cap tier | Use valid market cap index |
| `Bonding curve is completed` | Token has graduated | Cannot trade on bonding curve |
| `Insufficient tokens available` | Not enough tokens in curve | Reduce buy amount or wait |
| `Slippage exceeded` | Price changed too much | Increase slippage tolerance |

### Error Handling Pattern

```typescript
try {
  const transaction = await client.buyCoin(params);
  // Handle success
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    // Handle insufficient balance
  } else if (error.message.includes('slippage')) {
    // Handle slippage error
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

### Validation Errors

All methods perform parameter validation before execution:

- Non-zero amounts
- Valid PublicKey addresses
- Valid market cap indices (1, 2, or 3)
- Reasonable slippage values (0-10000 basis points)
- String length limits for token name/symbol

### Transaction Simulation

Always simulate transactions before sending to catch errors early:

```typescript
const transaction = await client.buyCoin(params);
const simulation = await client.simulateTransaction(transaction);

if (!simulation.success) {
  throw new Error(`Transaction would fail: ${simulation.error}`);
}

// Proceed with signing and sending
transaction.sign([wallet.payer]);
const signature = await connection.sendRawTransaction(transaction.serialize());
```
