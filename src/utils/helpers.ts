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
 * Uses the same logic as the on-chain program
 */
export function calculateTokensForSol(
  solAmount: BN,
  bondingCurve: BondingCurveState,
  marketCap: MarketCapState,
  feePercent: number = 100 // 1% in basis points
): { tokenAmount: BN; solNeeded: BN; fee: BN; solAfterFee: BN } {
  try {
    // Remove fee from SOL amount first (same as program logic)
    const feeAmount = solAmount.mul(new BN(feePercent)).div(new BN(PERCENTAGE_DENOMINATOR));
    const solAfterFee = solAmount.sub(feeAmount);

    // Check if bonding curve is completed
    if (bondingCurve.completed) {
      throw new Error("Bonding curve is completed, cannot buy more tokens");
    }

    // Using constant product formula: x * y = k
    // (reserveSol + solInput) * (reserveToken - tokenOutput) = reserveSol * reserveToken
    // tokenOutput = reserveToken - (reserveSol * reserveToken) / (reserveSol + solInput)
    
    const k = bondingCurve.reserveSol.mul(bondingCurve.reserveToken);
    const newSolReserve = bondingCurve.reserveSol.add(solAfterFee);
    
    // Prevent division by zero
    if (newSolReserve.isZero()) {
      throw new Error("Invalid calculation: division by zero");
    }
    
    const newTokenReserve = k.div(newSolReserve);
    const tokenAmount = bondingCurve.reserveToken.sub(newTokenReserve);

    // Calculate available tokens to buy (same logic as program)
    const tokenLeft = bondingCurve.reserveToken
      .sub(marketCap.defaultTokenReserves.sub(marketCap.defaultTotalSupply))
      .sub(marketCap.defaultTokenLiquidity);

    // Ensure we don't exceed available tokens
    const finalTokenAmount = BN.min(tokenAmount, tokenLeft);

    // Validate result
    if (finalTokenAmount.lte(new BN(0))) {
      throw new Error("No tokens available for purchase");
    }

    return {
      tokenAmount: finalTokenAmount,
      solNeeded: solAmount,
      fee: feeAmount,
      solAfterFee
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Token calculation failed: ${errorMessage}`);
  }
}

/**
 * Calculate SOL amount for given token amount (for sell operation)  
 * Uses the same logic as the on-chain program
 */
export function calculateSolForTokens(
  tokenAmount: BN,
  bondingCurve: BondingCurveState,
  feePercent: number = 100 // 1% in basis points
): { solAmount: BN; fee: BN; solAfterFee: BN } {
  try {
    // Check if bonding curve is completed
    if (bondingCurve.completed) {
      throw new Error("Bonding curve is completed, cannot sell tokens");
    }

    // Validate input
    if (tokenAmount.lte(new BN(0))) {
      throw new Error("Token amount must be greater than 0");
    }

    if (tokenAmount.gt(bondingCurve.reserveToken)) {
      throw new Error("Insufficient tokens in bonding curve");
    }

    // Using constant product formula: x * y = k
    // (reserveSol - solOutput) * (reserveToken + tokenInput) = reserveSol * reserveToken  
    // solOutput = reserveSol - (reserveSol * reserveToken) / (reserveToken + tokenInput)
    
    const k = bondingCurve.reserveSol.mul(bondingCurve.reserveToken);
    const newTokenReserve = bondingCurve.reserveToken.add(tokenAmount);
    
    // Prevent division by zero
    if (newTokenReserve.isZero()) {
      throw new Error("Invalid calculation: division by zero");
    }
    
    const newSolReserve = k.div(newTokenReserve);
    const solAmount = bondingCurve.reserveSol.sub(newSolReserve);

    // Calculate fee (deducted from SOL output)
    const feeAmount = solAmount.mul(new BN(feePercent)).div(new BN(PERCENTAGE_DENOMINATOR));
    const solAfterFee = solAmount.sub(feeAmount);

    // Validate result
    if (solAfterFee.lte(new BN(0))) {
      throw new Error("SOL output after fee must be greater than 0");
    }

    return {
      solAmount,
      fee: feeAmount,
      solAfterFee
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`SOL calculation failed: ${errorMessage}`);
  }
}