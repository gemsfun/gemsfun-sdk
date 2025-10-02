# GemsFun SDK - Cheat Sheet

## Install
```bash
npm install @gems.fun/sdk
```

## Initialize
```typescript
import { PumpClient } from '@gems.fun/sdk';
const client = new PumpClient(wallet, { rpcUrl: 'https://api.devnet.solana.com' });
```

## Create Token
```typescript
const { transaction, mint } = await client.createCoin({
  marketCapIndex: 1, // 1=42k, 2=57.5k, 3=75.3k
  name: "My Token",
  symbol: "MTK",
  uri: "https://example.com/metadata.json"
});

// Sign & send
const signed = await wallet.signTransaction(transaction);
const sig = await connection.sendRawTransaction(signed.serialize());

// ⚠️ SAVE CREATOR TO DB!
await db.tokens.create({
  mint: mint.publicKey.toBase58(),
  creator: wallet.publicKey.toBase58()
});
```

## Buy Tokens
```typescript
const token = await db.tokens.findOne({ mint });
const tx = await client.buyCoinWithSolSimple({
  mint: new PublicKey(token.mint),
  creator: new PublicKey(token.creator),
  solAmount: new BN(0.01 * LAMPORTS_PER_SOL),
  slippage: 500 // 5%
});
const signed = await wallet.signTransaction(tx);
await connection.sendRawTransaction(signed.serialize());
```

## Sell Tokens
```typescript
const token = await db.tokens.findOne({ mint });
const tx = await client.sellCoinSimple({
  mint: new PublicKey(token.mint),
  creator: new PublicKey(token.creator),
  tokenAmount: new BN(1000 * 10**6), // 1000 tokens
  slippage: 500 // 5%
});
const signed = await wallet.signTransaction(tx);
await connection.sendRawTransaction(signed.serialize());
```

## React Hook
```typescript
export function useTokenBuy(mint: string, creator: string) {
  const { wallet } = useWallet();
  const client = new PumpClient(wallet, {...});

  const buy = async (solAmount: number) => {
    const tx = await client.buyCoinWithSolSimple({
      mint: new PublicKey(mint),
      creator: new PublicKey(creator),
      solAmount: new BN(solAmount * LAMPORTS_PER_SOL),
      slippage: 500
    });
    const signed = await wallet.signTransaction(tx);
    return await connection.sendRawTransaction(signed.serialize());
  };

  return { buy };
}
```

## Database Schema
```sql
CREATE TABLE tokens (
  mint VARCHAR(44) PRIMARY KEY,
  creator VARCHAR(44) NOT NULL,
  name VARCHAR(100),
  symbol VARCHAR(10)
);
```

## Key Points
- ⚠️ **Always save creator to database** when creating tokens
- 💡 Use `*Simple` methods - they auto-fetch marketCapIndex
- 🔢 Token amounts need 6 decimals: `amount * 10**6`
- 💰 SOL amounts: `amount * LAMPORTS_PER_SOL`
- 📊 Slippage: `500` = 5%, `1000` = 10%

## Full Docs
- [Simple Integration](./SIMPLE_INTEGRATION.md)
- [API Reference](./API.md)
