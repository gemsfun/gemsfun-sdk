# Test Integration - Complete Setup Guide

## 🚀 Step-by-Step Setup

### 1. Create Next.js App

```bash
npx create-next-app@latest gemsfun-test
# ✅ TypeScript? Yes
# ✅ ESLint? Yes
# ✅ Tailwind CSS? Yes
# ✅ src/ directory? No
# ✅ App Router? Yes
# ✅ Import alias? No

cd gemsfun-test
```

### 2. Install Dependencies

```bash
npm install @gems.fun/sdk @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js bn.js @metaplex-foundation/mpl-token-metadata @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults
```

### 3. Setup Wallet Provider

Create `components/WalletProvider.tsx`:

```typescript
'use client';

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { ReactNode, useMemo } from 'react';

require('@solana/wallet-adapter-react-ui/styles.css');

export function AppWalletProvider({ children }: { children: ReactNode }) {
  const endpoint = 'https://api.devnet.solana.com';
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### 4. Update Root Layout

Edit `app/layout.tsx`:

```typescript
import { AppWalletProvider } from '@/components/WalletProvider';
import './globals.css';

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

### 5. Create Test Page

Edit `app/page.tsx`:

```typescript
'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState } from 'react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PumpClient } from '@gems.fun/sdk';
import { BN } from 'bn.js';

export default function Home() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [status, setStatus] = useState('');
  const [mintAddress, setMintAddress] = useState('');
  const [creatorAddress, setCreatorAddress] = useState('');

  // In real app, this would be your database
  const [tokenDB, setTokenDB] = useState<{[key: string]: string}>({});

  const createToken = async () => {
    if (!publicKey || !signTransaction) {
      setStatus('Please connect wallet');
      return;
    }

    try {
      setStatus('Creating token...');

      const wallet = { publicKey, signTransaction, signAllTransactions: async (txs: any[]) => txs };
      const client = new PumpClient(wallet as any, {
        rpcUrl: 'https://api.devnet.solana.com'
      });

      const { transaction, mint } = await client.createCoin({
        marketCapIndex: 1,
        name: "Test Token",
        symbol: "TEST",
        uri: "https://example.com/metadata.json"
      });

      const signed = await signTransaction(transaction);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');

      // Save to "database" (in real app, save to your DB)
      const mintStr = mint.publicKey.toBase58();
      const creatorStr = publicKey.toBase58();
      setTokenDB(prev => ({ ...prev, [mintStr]: creatorStr }));
      setMintAddress(mintStr);
      setCreatorAddress(creatorStr);

      setStatus(`✅ Token created! Mint: ${mintStr}`);
      console.log('Transaction:', sig);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
      console.error(error);
    }
  };

  const buyToken = async () => {
    if (!publicKey || !signTransaction || !mintAddress) {
      setStatus('Please create token first');
      return;
    }

    try {
      setStatus('Buying tokens...');

      // Get creator from "database"
      const creator = tokenDB[mintAddress];
      if (!creator) {
        setStatus('❌ Creator not found in database!');
        return;
      }

      const wallet = { publicKey, signTransaction, signAllTransactions: async (txs: any[]) => txs };
      const client = new PumpClient(wallet as any, {
        rpcUrl: 'https://api.devnet.solana.com'
      });

      const tx = await client.buyCoinWithSolSimple({
        mint: new PublicKey(mintAddress),
        creator: new PublicKey(creator),
        solAmount: new BN(0.01 * LAMPORTS_PER_SOL),
        slippage: 500
      });

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');

      setStatus(`✅ Bought tokens! Tx: ${sig}`);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
      console.error(error);
    }
  };

  const sellToken = async () => {
    if (!publicKey || !signTransaction || !mintAddress) {
      setStatus('Please create and buy token first');
      return;
    }

    try {
      setStatus('Selling tokens...');

      // Get creator from "database"
      const creator = tokenDB[mintAddress];
      if (!creator) {
        setStatus('❌ Creator not found in database!');
        return;
      }

      const wallet = { publicKey, signTransaction, signAllTransactions: async (txs: any[]) => txs };
      const client = new PumpClient(wallet as any, {
        rpcUrl: 'https://api.devnet.solana.com'
      });

      const tx = await client.sellCoinSimple({
        mint: new PublicKey(mintAddress),
        creator: new PublicKey(creator),
        tokenAmount: new BN(100 * 10**6), // Sell 100 tokens
        slippage: 500
      });

      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, 'confirmed');

      setStatus(`✅ Sold tokens! Tx: ${sig}`);
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">GemsFun SDK Test</h1>
      
      <div className="mb-8">
        <WalletMultiButton />
      </div>

      {publicKey && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-mono text-sm break-all">
              Connected: {publicKey.toBase58()}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={createToken}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded"
            >
              1️⃣ Create Token
            </button>

            <button
              onClick={buyToken}
              disabled={!mintAddress}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded disabled:bg-gray-300"
            >
              2️⃣ Buy Token (0.01 SOL)
            </button>

            <button
              onClick={sellToken}
              disabled={!mintAddress}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded disabled:bg-gray-300"
            >
              3️⃣ Sell Token (100 tokens)
            </button>
          </div>

          {mintAddress && (
            <div className="bg-blue-50 p-4 rounded space-y-2">
              <p className="text-sm">
                <strong>Mint:</strong> 
                <span className="font-mono text-xs break-all ml-2">{mintAddress}</span>
              </p>
              <p className="text-sm">
                <strong>Creator:</strong> 
                <span className="font-mono text-xs break-all ml-2">{creatorAddress}</span>
              </p>
              <p className="text-xs text-gray-600 mt-2">
                ⚠️ In production, save these to your database!
              </p>
            </div>
          )}

          {status && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="text-sm">{status}</p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-bold mb-2">Token Database (In-Memory)</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(tokenDB, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}
```

### 6. Run the App

```bash
npm run dev
```

Open http://localhost:3000

### 7. Test Flow

1. **Connect Phantom Wallet** (make sure you're on Devnet)
2. **Click "1️⃣ Create Token"** - Creates a new token
   - ✅ Mint address is saved to in-memory "database"
   - ✅ Creator address is saved to in-memory "database"
3. **Click "2️⃣ Buy Token"** - Buys tokens with 0.01 SOL
   - ✅ Fetches creator from "database"
4. **Click "3️⃣ Sell Token"** - Sells 100 tokens
   - ✅ Fetches creator from "database"

### 8. Verify on Solana Explorer

After each transaction, check:
- https://explorer.solana.com/?cluster=devnet
- Paste the transaction signature to see details

## 🎯 What This Demonstrates

✅ Exact flow from SIMPLE_INTEGRATION.md  
✅ Creator address tracking (in-memory DB)  
✅ Simplified methods (`buyCoinWithSolSimple`, `sellCoinSimple`)  
✅ Wallet signing flow  
✅ Transaction confirmation

## 💡 For Production

Replace the in-memory `tokenDB` with real database:

```typescript
// Instead of:
setTokenDB(prev => ({ ...prev, [mintStr]: creatorStr }));

// Do:
await fetch('/api/tokens', {
  method: 'POST',
  body: JSON.stringify({
    mint: mintStr,
    creator: creatorStr
  })
});
```

## 🐛 Common Issues

**"Wallet not connected"**
→ Make sure Phantom is installed and connected

**"Insufficient funds"**
→ Get devnet SOL from https://faucet.solana.com/

**"Transaction failed"**
→ Check console for detailed error
→ Make sure you're on Devnet in Phantom

**"Creator not found"**
→ Make sure you created a token first
→ Check the Token Database section shows your token

## 📝 Next Steps

Once this works, you can:
1. Add a real database (PostgreSQL, MongoDB, etc.)
2. Create API routes for token CRUD operations
3. Add token listing page
4. Add transaction history
5. Add error handling and loading states
6. Add input validation

---

**This is the simplest possible test setup!** 🎉
