# GemsFun SDK - Quick Reference

## 🚀 Quick Start

```typescript
import { PumpClient } from '@gems.fun/sdk';
import { Wallet } from '@coral-xyz/anchor';
import { BN } from 'bn.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const client = new PumpClient(wallet, {
  rpcUrl: 'https://api.devnet.solana.com',
  commitment: 'confirmed'
});
```

## 📋 Common Operations

### Create Token
```typescript
const { transaction, mint } = await client.createCoin({
  marketCapIndex: 1, // 1=42k, 2=57.5k, 3=75.3k
  name: "My Token",
  symbol: "MTK",
  uri: "https://example.com/metadata.json"
});

// ⚠️ SAVE THIS TO YOUR DATABASE!
const creator = wallet.publicKey;
await db.tokens.create({
  mint: mint.publicKey.toBase58(),
  creator: creator.toBase58() // CRITICAL: Save this!
});

// User signs and sends
const signed = await wallet.signTransaction(transaction);
const sig = await connection.sendRawTransaction(signed.serialize());
```

### Buy Tokens (Recommended Method)
```typescript
// Specify SOL amount to spend
const tx = await client.buyCoinWithSolSimple({
  mint: new PublicKey(tokenMint),
  creator: new PublicKey(creatorAddress), // From your DB
  solAmount: new BN(0.01 * LAMPORTS_PER_SOL),
  slippage: 500 // 5%
});

const signed = await wallet.signTransaction(tx);
const sig = await connection.sendRawTransaction(signed.serialize());
await connection.confirmTransaction(sig);
```

### Buy Tokens (Specify Token Amount)
```typescript
const tx = await client.buyCoinSimple({
  mint: new PublicKey(tokenMint),
  creator: new PublicKey(creatorAddress), // From your DB
  tokenAmount: new BN(1000 * 10**6), // 1000 tokens
  maxSolCost: new BN(0.01 * LAMPORTS_PER_SOL)
});
```

### Sell Tokens
```typescript
const tx = await client.sellCoinSimple({
  mint: new PublicKey(tokenMint),
  creator: new PublicKey(creatorAddress), // From your DB
  tokenAmount: new BN(500 * 10**6), // 500 tokens
  slippage: 500 // 5%
});
```

### Get Token Info
```typescript
const info = await client.getTokenInfo(mint);
console.log(info);
// {
//   mint: "...",
//   marketCapIndex: 1,
//   reserveSol: BN,
//   reserveToken: BN,
//   completed: false,
//   ...
// }
```

### Find Creator (Fallback)
```typescript
// Try to find creator from on-chain data
const creator = await client.findCreatorAddress(mint);
if (!creator) {
  // Creator not found on-chain
  // Must get from your database or user input
}
```

## 🎯 Method Comparison

| Method | When to Use | Creator Required? | MarketCap Required? |
|--------|-------------|-------------------|---------------------|
| `buyCoin()` | Low-level control | ✅ Yes | ✅ Yes |
| `buyCoinSimple()` | Want token amount | ✅ Yes | ❌ Auto-fetched |
| `buyCoinWithSol()` | Low-level control | ✅ Yes | ✅ Yes |
| `buyCoinWithSolSimple()` | Want SOL amount (Recommended) | ✅ Yes | ❌ Auto-fetched |
| `sellCoin()` | Low-level control | ✅ Yes | ✅ Yes |
| `sellCoinSimple()` | Simple selling (Recommended) | ✅ Yes | ❌ Auto-fetched |

## ⚠️ Common Mistakes

### ❌ DON'T: Forget to save creator
```typescript
const { mint } = await client.createCoin({...});
// Later: How do I buy this token? Creator is lost!
```

### ✅ DO: Always save creator to database
```typescript
const { mint } = await client.createCoin({...});
await db.tokens.create({
  mint: mint.publicKey.toBase58(),
  creator: wallet.publicKey.toBase58() // Save this!
});
```

### ❌ DON'T: Use plain numbers
```typescript
tokenAmount: 1000, // Wrong!
solAmount: 0.01    // Wrong!
```

### ✅ DO: Use BN with correct decimals
```typescript
tokenAmount: new BN(1000 * 10**6), // Correct (6 decimals)
solAmount: new BN(0.01 * LAMPORTS_PER_SOL) // Correct
```

### ❌ DON'T: Skip simulation
```typescript
const tx = await client.buyCoin(params);
await wallet.signTransaction(tx);
// What if it fails?
```

### ✅ DO: Always simulate first
```typescript
const tx = await client.buyCoin(params);
const sim = await client.simulateTransaction(tx);
if (!sim.success) {
  console.error('Will fail:', sim.error);
  return;
}
```

## 🔢 Constants

### Market Cap Tiers
```typescript
const MARKET_CAP = {
  SMALL: 1,   // 42k SOL
  MEDIUM: 2,  // 57.5k SOL
  LARGE: 3    // 75.3k SOL
};
```

### Slippage Values
```typescript
const SLIPPAGE = {
  LOW: 100,      // 1%
  MEDIUM: 500,   // 5%
  HIGH: 1000     // 10%
};
```

### Token Decimals
```typescript
const DECIMALS = 6;
const TOKEN_MULTIPLIER = 10 ** 6;

// Convert to base units
const amount = 1000 * TOKEN_MULTIPLIER; // 1000 tokens
```

## 🎨 React Example

```typescript
// hooks/useTokenBuy.ts
import { useMutation } from '@tanstack/react-query';

export function useTokenBuy(mint: string, creator: string) {
  const { wallet } = useWallet();
  const client = new PumpClient(wallet, {...});

  return useMutation({
    mutationFn: async (solAmount: number) => {
      const tx = await client.buyCoinWithSolSimple({
        mint: new PublicKey(mint),
        creator: new PublicKey(creator),
        solAmount: new BN(solAmount * LAMPORTS_PER_SOL),
        slippage: 500
      });

      const signed = await wallet.signTransaction(tx);
      const sig = await client.connection.sendRawTransaction(
        signed.serialize()
      );
      await client.connection.confirmTransaction(sig);
      
      return sig;
    }
  });
}

// In component:
const { mutate: buy, isLoading } = useTokenBuy(mint, creator);

<button onClick={() => buy(0.01)} disabled={isLoading}>
  Buy with 0.01 SOL
</button>
```

## 🔗 Useful Links

- [Full Integration Guide](./INTEGRATION_GUIDE.md)
- [API Reference](./API.md)
- [Examples](./examples/)
- [Improvements Summary](./IMPROVEMENTS_SUMMARY.md)

## 💬 Quick Tips

1. **Always track creator in your database** - It's not on-chain!
2. **Use `*Simple` methods** - They auto-fetch marketCapIndex
3. **Simulate before sending** - Catches errors early
4. **Handle errors gracefully** - Show user-friendly messages
5. **Confirm transactions** - Don't assume success

## 📞 Need Help?

- Creator not found? → Check your database or use `findCreatorAddress()`
- Transaction fails? → Use `simulateTransaction()` to debug
- Slippage exceeded? → Increase slippage tolerance
- Insufficient funds? → User needs more SOL
