import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { PUMP_PROGRAM_ID, GLOBAL_SEED, MARKET_CAP_SEED, BONDING_CURVE_SEED, PERCENTAGE_DENOMINATOR } from "./constants";

export function findGlobalPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(GLOBAL_SEED)],
    PUMP_PROGRAM_ID
  );
}

export function findMarketCapPDA(marketCapIndex: number): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(MARKET_CAP_SEED), Buffer.from([marketCapIndex])],
    PUMP_PROGRAM_ID
  );
}

export function findBondingCurvePDA(mint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(BONDING_CURVE_SEED), mint.toBuffer()],
    PUMP_PROGRAM_ID
  );
}

export function findCreatorRevenuePDA(mint: PublicKey, creator: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("creator_revenue"), mint.toBuffer(), creator.toBuffer()],
    PUMP_PROGRAM_ID
  );
}

export function findEventAuthorityPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("__event_authority")],
    PUMP_PROGRAM_ID
  );
}

// Bonding curve calculation helpers
export interface BondingCurveState {
  reserveSol: BN;
  reserveToken: BN;
  completed: boolean;
}

export interface MarketCapState {
  defaultTotalSupply: BN;
  defaultTokenReserves: BN;
  defaultTokenLiquidity: BN;
}

/**
 * Calculate token amount for given SOL amount (for buy operation)
 */
export function calculateTokensForSol(
  solAmount: BN,
  bondingCurve: BondingCurveState,
  marketCap: MarketCapState,
  feePercent: number = 100 // 1% in basis points
): { tokenAmount: BN; solNeeded: BN; fee: BN } {
  // Remove fee from SOL amount first
  const feeAmount = solAmount.mul(new BN(feePercent)).div(new BN(PERCENTAGE_DENOMINATOR));
  const solAfterFee = solAmount.sub(feeAmount);

  // Calculate available tokens to buy
  const tokenLeft = bondingCurve.reserveToken
    .sub(marketCap.defaultTokenReserves.sub(marketCap.defaultTotalSupply))
    .sub(marketCap.defaultTokenLiquidity);

  // Using constant product formula: x * y = k
  // (reserveSol + solInput) * (reserveToken - tokenOutput) = reserveSol * reserveToken
  // tokenOutput = reserveToken - (reserveSol * reserveToken) / (reserveSol + solInput)
  
  const k = bondingCurve.reserveSol.mul(bondingCurve.reserveToken);
  const newSolReserve = bondingCurve.reserveSol.add(solAfterFee);
  const newTokenReserve = k.div(newSolReserve);
  const tokenAmount = bondingCurve.reserveToken.sub(newTokenReserve);

  // Ensure we don't exceed available tokens
  const finalTokenAmount = BN.min(tokenAmount, tokenLeft);

  return {
    tokenAmount: finalTokenAmount,
    solNeeded: solAmount,
    fee: feeAmount
  };
}

/**
 * Calculate SOL amount for given token amount (for sell operation)  
 */
export function calculateSolForTokens(
  tokenAmount: BN,
  bondingCurve: BondingCurveState,
  feePercent: number = 100 // 1% in basis points
): { solAmount: BN; fee: BN; solAfterFee: BN } {
  // Using constant product formula: x * y = k
  // (reserveSol - solOutput) * (reserveToken + tokenInput) = reserveSol * reserveToken  
  // solOutput = reserveSol - (reserveSol * reserveToken) / (reserveToken + tokenInput)
  
  const k = bondingCurve.reserveSol.mul(bondingCurve.reserveToken);
  const newTokenReserve = bondingCurve.reserveToken.add(tokenAmount);
  const newSolReserve = k.div(newTokenReserve);
  const solAmount = bondingCurve.reserveSol.sub(newSolReserve);

  const feeAmount = solAmount.mul(new BN(feePercent)).div(new BN(PERCENTAGE_DENOMINATOR));
  const solAfterFee = solAmount.sub(feeAmount);

  return {
    solAmount,
    fee: feeAmount,
    solAfterFee
  };
}