# Integration Guide for GemsFun SDK

## ⚠️ Critical Integration Considerations

### 1. Creator Address Management

**THE PROBLEM:**
The creator address is **NOT stored in the BondingCurve account** on-chain. This means:
- You **MUST track the creator address** in your database when tokens are created
- Every buy/sell transaction requires the creator address as a parameter
- If you lose the creator address, you cannot interact with the token

**SOLUTIONS:**

#### Option A: Track Creator in Your Database (Recommended)
```typescript
// When creating a token, save creator to your DB
const { mint } = await client.createCoin({ ... });
await db.tokens.create({
  mint: mint.publicKey.toBase58(),
  creator: wallet.publicKey.toBase58(), // SAVE THIS!
  createdAt: new Date()
});

// Later when buying/selling, fetch from DB
const token = await db.tokens.findOne({ mint });
await client.buyCoin({
  mint: new PublicKey(token.mint),
  creator: new PublicKey(token.creator), // Load from DB
  // ...
});
```

#### Option B: Use CreatorRevenuePool Lookup (Limited)
```typescript
// Try to find creator from on-chain data
const creator = await client.findCreatorAddress(mint);
if (creator) {
  // Found! Can use this creator
  await client.buyCoin({ mint, creator, ... });
} else {
  // Not found - creator must be provided by user or stored off-chain
  throw new Error('Creator address not found');
}
```

**LIMITATION:** `findCreatorAddress()` only works if:
- A CreatorRevenuePool was created for this token
- The pool hasn't been deleted
- You have RPC access to query program accounts

#### Option C: Parse Creation Transaction (Most Reliable)
```typescript
// Get the transaction that created the token
async function getCreatorFromTx(mint: PublicKey): Promise<PublicKey> {
  // 1. Find bonding curve PDA
  const [bondingCurve] = findBondingCurvePDA(mint);
  
  // 2. Get signatures for this account
  const signatures = await connection.getSignaturesForAddress(bondingCurve, { limit: 1000 });
  
  // 3. Find the first (creation) transaction
  const creationSig = signatures[signatures.length - 1];
  const tx = await connection.getTransaction(creationSig.signature, {
    maxSupportedTransactionVersion: 0
  });
  
  // 4. The creator is the first signer (fee payer)
  return tx.transaction.message.accountKeys[0];
}
```

---

### 2. Market Cap Index

**THE ISSUE:**
Market cap indices are not intuitive:
- `1` = 42k SOL market cap
- `2` = 57.5k SOL market cap  
- `3` = 75.3k SOL market cap

**SOLUTION: Use Simplified Methods**
```typescript
// Use simplified methods that auto-fetch marketCapIndex
await client.buyCoinWithSolSimple({
  mint,
  creator, // You still need to provide this
  solAmount: new BN(0.01 * LAMPORTS_PER_SOL),
  slippage: 500 // 5%
});

// Or for more control, create a helper
const MARKET_CAP_TIERS = {
  small: 1,   // 42k
  medium: 2,  // 57.5k
  large: 3    // 75.3k
};

await client.createCoin({
  marketCapIndex: MARKET_CAP_TIERS.small,
  // ...
});
```

---

## 🎯 Recommended Integration Architecture

### Frontend Architecture

```typescript
// hooks/useGemsfunToken.ts
import { useWallet } from '@solana/wallet-adapter-react';
import { PumpClient } from '@gems.fun/sdk';
import { useQuery, useMutation } from '@tanstack/react-query';

export function useGemsfunToken(mint: PublicKey) {
  const { wallet, publicKey } = useWallet();
  const client = useMemo(() => new PumpClient(wallet, { ... }), [wallet]);

  // Fetch token info
  const { data: tokenInfo } = useQuery({
    queryKey: ['token', mint.toBase58()],
    queryFn: () => client.getTokenInfo(mint)
  });

  // Fetch creator from your API
  const { data: creator } = useQuery({
    queryKey: ['creator', mint.toBase58()],
    queryFn: () => fetch(`/api/tokens/${mint}/creator`).then(r => r.json())
  });

  // Buy mutation
  const buyMutation = useMutation({
    mutationFn: async (solAmount: number) => {
      if (!creator) throw new Error('Creator not found');
      
      const tx = await client.buyCoinWithSolSimple({
        mint,
        creator: new PublicKey(creator),
        solAmount: new BN(solAmount * LAMPORTS_PER_SOL),
        slippage: 500
      });

      // User signs the transaction
      const signed = await wallet.signTransaction(tx);
      const sig = await client.connection.sendRawTransaction(signed.serialize());
      await client.connection.confirmTransaction(sig);
      
      return sig;
    }
  });

  return { tokenInfo, creator, buy: buyMutation.mutate, ... };
}
```

### Backend API Architecture

```typescript
// api/tokens/route.ts (Next.js API Route)
import { PumpClient } from '@gems.fun/sdk';

export async function POST(req: Request) {
  const { name, symbol, uri, walletPublicKey } = await req.json();
  
  // Create token using a server wallet or relay user's signed tx
  // ...
  
  // CRITICAL: Store creator in database
  await prisma.token.create({
    data: {
      mint: mint.publicKey.toBase58(),
      creator: walletPublicKey, // This is critical!
      name,
      symbol,
      uri,
      createdAt: new Date()
    }
  });
  
  return Response.json({ mint: mint.publicKey.toBase58() });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mint = searchParams.get('mint');
  
  // Fetch from your database
  const token = await prisma.token.findUnique({
    where: { mint }
  });
  
  return Response.json({
    ...token,
    creator: token.creator // Return creator from DB
  });
}
```

---

## 📊 Complete Example: Token Trading Page

```typescript
// components/TokenTradingPage.tsx
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from 'bn.js';
import { PumpClient } from '@gems.fun/sdk';

export function TokenTradingPage({ mintAddress }: { mintAddress: string }) {
  const { wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [solAmount, setSolAmount] = useState('0.01');
  const [creator, setCreator] = useState<string | null>(null);

  const client = useMemo(() => 
    new PumpClient(wallet, {
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
      commitment: 'confirmed'
    }),
    [wallet]
  );

  // Fetch creator from your API
  useEffect(() => {
    fetch(`/api/tokens/${mintAddress}/creator`)
      .then(r => r.json())
      .then(data => setCreator(data.creator))
      .catch(err => {
        console.error('Failed to fetch creator:', err);
        // Fallback: try to find from on-chain
        client.findCreatorAddress(new PublicKey(mintAddress))
          .then(setCreator);
      });
  }, [mintAddress]);

  const handleBuy = async () => {
    if (!creator) {
      alert('Creator address not found. Cannot proceed with buy.');
      return;
    }

    setLoading(true);
    try {
      // Build transaction
      const tx = await client.buyCoinWithSolSimple({
        mint: new PublicKey(mintAddress),
        creator: new PublicKey(creator),
        solAmount: new BN(parseFloat(solAmount) * LAMPORTS_PER_SOL),
        slippage: 500 // 5%
      });

      // Request user signature
      const signed = await wallet.signTransaction(tx);
      
      // Send transaction
      const signature = await client.connection.sendRawTransaction(
        signed.serialize(),
        { skipPreflight: false }
      );

      // Wait for confirmation
      await client.connection.confirmTransaction(signature, 'confirmed');
      
      alert(`Success! Signature: ${signature}`);
    } catch (error) {
      console.error('Buy failed:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2>Buy Token</h2>
      <div className="mb-4">
        <label>Mint: {mintAddress}</label><br />
        <label>Creator: {creator || 'Loading...'}</label>
      </div>
      
      <input
        type="number"
        value={solAmount}
        onChange={(e) => setSolAmount(e.target.value)}
        placeholder="SOL Amount"
        className="border p-2 mb-2"
      />
      
      <button
        onClick={handleBuy}
        disabled={loading || !creator}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {loading ? 'Processing...' : 'Buy Tokens'}
      </button>
    </div>
  );
}
```

---

## 🔧 Recommended SDK Improvements

### For Your Team to Consider:

1. **Add creator field to BondingCurve account** (On-chain change)
   ```rust
   pub struct BondingCurve {
       pub bump: u8,
       pub creator: Pubkey, // ADD THIS
       pub market_cap: Pubkey,
       // ...
   }
   ```

2. **Create a token registry account** (On-chain change)
   ```rust
   #[account]
   pub struct TokenRegistry {
       pub mint: Pubkey,
       pub creator: Pubkey,
       pub created_at: i64,
       pub metadata_uri: String,
   }
   ```

3. **Add event logging** (On-chain change)
   ```rust
   #[event]
   pub struct TokenCreated {
       pub mint: Pubkey,
       pub creator: Pubkey,
       pub timestamp: i64,
   }
   ```

---

## 💡 Best Practices

### DO:
✅ Store creator address in your database when tokens are created  
✅ Use simplified methods (`buyCoinWithSolSimple`) to reduce parameters  
✅ Always simulate transactions before sending  
✅ Handle errors gracefully with user-friendly messages  
✅ Show loading states during transaction processing  
✅ Confirm transactions before showing success

### DON'T:
❌ Assume you can fetch creator from on-chain (it's not there!)  
❌ Hardcode market cap indices without comments  
❌ Skip transaction simulation (catches errors early)  
❌ Send transactions without user confirmation  
❌ Show raw error messages to end users

---

## 🚨 Common Pitfalls

### Pitfall 1: Lost Creator Address
```typescript
// ❌ BAD: Not storing creator
await client.createCoin({ ... });
// Later: How do I buy this token? Creator is lost!

// ✅ GOOD: Store creator immediately
const { mint } = await client.createCoin({ ... });
await db.tokens.create({
  mint: mint.publicKey.toBase58(),
  creator: wallet.publicKey.toBase58()
});
```

### Pitfall 2: Wrong Parameter Types
```typescript
// ❌ BAD: Using regular numbers
await client.buyCoin({
  tokenAmount: 1000, // Wrong!
  maxSolCost: 0.01   // Wrong!
});

// ✅ GOOD: Using BN with proper decimals
await client.buyCoin({
  tokenAmount: new BN(1000 * 10**6), // 1000 tokens
  maxSolCost: new BN(0.01 * LAMPORTS_PER_SOL) // 0.01 SOL
});
```

### Pitfall 3: Not Handling Transaction Errors
```typescript
// ❌ BAD: No error handling
const tx = await client.buyCoin(params);
const sig = await wallet.signTransaction(tx);
await connection.sendRawTransaction(sig.serialize());

// ✅ GOOD: Proper error handling
try {
  const tx = await client.buyCoin(params);
  const simulation = await client.simulateTransaction(tx);
  
  if (!simulation.success) {
    throw new Error(`Simulation failed: ${simulation.error}`);
  }
  
  const sig = await wallet.signTransaction(tx);
  const txSig = await connection.sendRawTransaction(sig.serialize());
  await connection.confirmTransaction(txSig);
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    alert('Insufficient SOL balance');
  } else if (error.message.includes('slippage')) {
    alert('Price changed too much. Try increasing slippage.');
  } else {
    alert(`Transaction failed: ${error.message}`);
  }
}
```

---

## 📞 Support

For integration support:
- Check the [API Reference](./API.md)
- Review [Examples](./examples/)
- Open an issue on GitHub
