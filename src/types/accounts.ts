import { PublicKey, Keypair } from "@solana/web3.js";
import BN from "bn.js";

export interface CreateCoinParams {
  marketCapIndex: number;
  name: string;
  symbol: string;
  uri: string;
  aiGenerated?: boolean;
  mint?: Keypair; 
  createCreatorRevenuePool?: boolean; // Default: true
}

export interface CreateCoinResult {
  transaction: any; // VersionedTransaction
  mint: Keypair;
}

export interface BuyCoinParams {
  mint: PublicKey;
  marketCapIndex: number;
  tokenAmount: BN; // Token amount user wants to buy
  maxSolCost: BN; // Maximum SOL willing to spend
  creator: PublicKey;
  referralFee?: number; 
  referral?: PublicKey; 
}

export interface BuyCoinWithSolParams {
  mint: PublicKey;
  marketCapIndex: number;
  solAmount: BN; // SOL amount user wants to spend
  slippage?: number; // Slippage tolerance in basis points (default: 500 = 5%)
  creator: PublicKey;
  referralFee?: number; 
  referral?: PublicKey; 
}

export interface SellCoinParams {
  mint: PublicKey;
  marketCapIndex: number;
  tokenAmount: BN; // Token amount user wants to sell
  slippage?: number; // Slippage tolerance in basis points (default: 500 = 5%)
  creator: PublicKey;
  referralFee?: number; 
  referral?: PublicKey; 
}

export interface PumpClientConfig {
  rpcUrl?: string;
  commitment?: 'confirmed' | 'finalized' | 'processed';
}