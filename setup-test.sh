#!/bin/bash

# GemsFun SDK Test Setup Script
# This script creates a complete Next.js test app

set -e

echo "🚀 Creating GemsFun SDK test app..."

# Create Next.js app
npx create-next-app@latest gemsfun-test --typescript --tailwind --app --no-import-alias --use-npm

cd gemsfun-test

echo "📦 Installing dependencies..."
npm install @gems.fun/sdk @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/web3.js bn.js @metaplex-foundation/mpl-token-metadata @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults

echo "📝 Creating WalletProvider..."
mkdir -p components
cat > components/WalletProvider.tsx << 'EOF'
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
EOF

echo "📝 Updating layout..."
cat > app/layout.tsx << 'EOF'
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
EOF

echo "📝 Creating test page..."
cat > app/page.tsx << 'EOF'
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

      const mintStr = mint.publicKey.toBase58();
      const creatorStr = publicKey.toBase58();
      setTokenDB(prev => ({ ...prev, [mintStr]: creatorStr }));
      setMintAddress(mintStr);
      setCreatorAddress(creatorStr);
      setStatus(`✅ Token created! Mint: ${mintStr}`);
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  const buyToken = async () => {
    if (!publicKey || !signTransaction || !mintAddress) {
      setStatus('Please create token first');
      return;
    }

    try {
      setStatus('Buying tokens...');
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
    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">GemsFun SDK Test</h1>
      <div className="mb-8"><WalletMultiButton /></div>

      {publicKey && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded">
            <p className="font-mono text-sm break-all">Connected: {publicKey.toBase58()}</p>
          </div>

          <button onClick={createToken} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded">
            1️⃣ Create Token
          </button>
          <button onClick={buyToken} disabled={!mintAddress} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded disabled:bg-gray-300">
            2️⃣ Buy Token (0.01 SOL)
          </button>

          {mintAddress && (
            <div className="bg-blue-50 p-4 rounded space-y-2">
              <p className="text-sm"><strong>Mint:</strong> <span className="font-mono text-xs break-all ml-2">{mintAddress}</span></p>
              <p className="text-sm"><strong>Creator:</strong> <span className="font-mono text-xs break-all ml-2">{creatorAddress}</span></p>
            </div>
          )}

          {status && <div className="bg-yellow-50 border border-yellow-200 p-4 rounded"><p className="text-sm">{status}</p></div>}
        </div>
      )}
    </main>
  );
}
EOF

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  cd gemsfun-test"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 and connect your Phantom wallet (Devnet)"
