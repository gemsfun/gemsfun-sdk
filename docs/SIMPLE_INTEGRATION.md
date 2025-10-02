# GemsFun SDK - Simple Integration

## 🚀 Install

```bash
npm install @gems.fun/sdk
```

## ⚠️ ONE CRITICAL RULE

**You MUST save the creator address to your database when creating tokens.**

The creator address is NOT stored on-chain and is required for all buy/sell operations.

## 📝 Complete Example

```typescript
import { PumpClient } from '@gems.fun/sdk';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from 'bn.js';

// Initialize client
const client = new PumpClient(wallet, {
  rpcUrl: 'https://api.devnet.solana.com'
});

// 1️⃣ CREATE TOKEN
const { transaction, mint } = await client.createCoin({
  marketCapIndex: 1, // 1=42k, 2=57.5k, 3=75.3k
  name: "My Token",
  symbol: "MTK",
  uri: "https://example.com/metadata.json"
});

// Sign and send
const signed = await wallet.signTransaction(transaction);
const sig = await connection.sendRawTransaction(signed.serialize());

// ⚠️ CRITICAL: Save to your database
await db.tokens.create({
  mint: mint.publicKey.toBase58(),
  creator: wallet.publicKey.toBase58() // YOU MUST SAVE THIS!
});

// 2️⃣ BUY TOKENS
// Fetch creator from your database
const token = await db.tokens.findOne({ mint: mintAddress });

const buyTx = await client.buyCoinWithSolSimple({
  mint: new PublicKey(token.mint),
  creator: new PublicKey(token.creator), // From your DB
  solAmount: new BN(0.01 * LAMPORTS_PER_SOL), // 0.01 SOL
  slippage: 500 // 5%
});

const buySignature = await wallet.signTransaction(buyTx);
await connection.sendRawTransaction(buySignature.serialize());

// 3️⃣ SELL TOKENS
const sellTx = await client.sellCoinSimple({
  mint: new PublicKey(token.mint),
  creator: new PublicKey(token.creator), // From your DB
  tokenAmount: new BN(1000 * 10**6), // 1000 tokens (6 decimals)
  slippage: 500 // 5%
});

const sellSignature = await wallet.signTransaction(sellTx);
await connection.sendRawTransaction(sellSignature.serialize());
```

## 🎯 React Hook Example

```typescript
import { useWallet } from '@solana/wallet-adapter-react';
import { PumpClient } from '@gems.fun/sdk';

export function useGemsfunTrade(mint: string) {
  const { wallet } = useWallet();
  const [creator, setCreator] = useState<string | null>(null);

  // Fetch creator from your API
  useEffect(() => {
    fetch(`/api/tokens/${mint}`)
      .then(r => r.json())
      .then(data => setCreator(data.creator));
  }, [mint]);

  const buy = async (solAmount: number) => {
    if (!creator) throw new Error('Creator not found');
    
    const client = new PumpClient(wallet, {...});
    const tx = await client.buyCoinWithSolSimple({
      mint: new PublicKey(mint),
      creator: new PublicKey(creator),
      solAmount: new BN(solAmount * LAMPORTS_PER_SOL),
      slippage: 500
    });

    const signed = await wallet.signTransaction(tx);
    return await connection.sendRawTransaction(signed.serialize());
  };

  return { buy, creator };
}
```

## 🔧 Database Schema Example

```sql
CREATE TABLE tokens (
  mint VARCHAR(44) PRIMARY KEY,
  creator VARCHAR(44) NOT NULL,  -- CRITICAL FIELD
  name VARCHAR(100),
  symbol VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Always save creator when creating token!
INSERT INTO tokens (mint, creator, name, symbol)
VALUES ('Abc123...', 'Creator123...', 'My Token', 'MTK');
```

## 💡 Helper: Find Creator (Fallback Only)

If you lost the creator address, try this (not guaranteed to work):

```typescript
// This only works if CreatorRevenuePool exists
const creator = await client.findCreatorAddress(mint);
if (creator) {
  // Found!
} else {
  // Not found - you MUST get it from your database
}
```

## ❌ Common Mistakes

```typescript
// ❌ DON'T: Create token without saving creator
await client.createCoin({...}); // Where's the creator saved?

// ✅ DO: Always save creator immediately
const { mint } = await client.createCoin({...});
await db.tokens.create({ 
  mint: mint.publicKey.toBase58(),
  creator: wallet.publicKey.toBase58() 
});
```

```typescript
// ❌ DON'T: Use plain numbers
tokenAmount: 1000

// ✅ DO: Use BN with decimals
tokenAmount: new BN(1000 * 10**6)
```

## 📊 Method Reference

| Method | Use Case | Auto-fetch MarketCap? |
|--------|----------|----------------------|
| `createCoin()` | Create token | N/A |
| `buyCoinWithSolSimple()` | Buy with SOL amount | ✅ Yes |
| `sellCoinSimple()` | Sell tokens | ✅ Yes |
| `getTokenInfo()` | Get token data | ✅ Yes |
| `findCreatorAddress()` | Find lost creator | N/A |

## 🆘 Troubleshooting

**"Creator not found"**
→ Check your database. Creator MUST be saved when token is created.

**"Invalid creator address"**
→ Make sure you're using the correct creator from your database.

**"Slippage exceeded"**
→ Increase `slippage` parameter (try 1000 for 10%).

**"Insufficient funds"**
→ User needs more SOL in wallet.

## 🔗 More Info

- Full API: [API.md](./API.md)
- Detailed Guide: [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- Quick Reference: [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

**Remember:** The creator address is NOT on-chain. Save it to your database when creating tokens!
