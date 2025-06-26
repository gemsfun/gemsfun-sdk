import { PublicKey } from "@solana/web3.js";

export const PUMP_PROGRAM_ID = new PublicKey("FQCKTpkAviLqpUPEvbJ5epQLLPgVW5URSUw4CH7BXQTb");

// Seeds
export const GLOBAL_SEED = "global";
export const MARKET_CAP_SEED = "market_cap";
export const BONDING_CURVE_SEED = "bonding_curve";
export const CREATOR_REVENUE_SEED = "creator_revenue";

// Default values
export const DEFAULT_SLIPPAGE = 50; // 0.5%
export const PERCENTAGE_DENOMINATOR = 10000;