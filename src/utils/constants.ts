import { PublicKey } from "@solana/web3.js";

// Program ID from deployed program (must match IDL)
export const PUMP_PROGRAM_ID = new PublicKey("BbB1tcCWeuXTMdqfMs93qjUEGhmax3WvWxLyEPYwAAZP"); // mainnet

// Seeds
export const GLOBAL_SEED = "global";
export const MARKET_CAP_SEED = "market_cap";
export const BONDING_CURVE_SEED = "bonding_curve";
export const CREATOR_REVENUE_SEED = "creator_revenue";

// Default values
export const DEFAULT_SLIPPAGE = 50; // 0.5%
export const PERCENTAGE_DENOMINATOR = 10000;