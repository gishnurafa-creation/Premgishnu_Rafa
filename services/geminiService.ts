
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

export const analyzeAuditData = async (transactions: Transaction[]) => {
  // Guidelines: Instantiate inside the function to capture the latest API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Role: Senior Chartered Accountant & NSS Regional Auditor for Mumbai University.
    Institution: St. Paul College, Ulhasnagar-4.
    
    Data Source: Institutional Ledger (JSON): ${JSON.stringify(transactions)}
    
    Task: Perform a deep-dive compliance audit based on the following strict NSS norms:
    
    1. FINANCIAL CAPS (Regular Activities):
       - Refreshment: Max ₹25-30 per volunteer per activity.
       - Honorarium: Max ₹500 per guest speaker.
       - Traveling: Must be supported by specific purpose.
    
    2. SPECIAL CAMPING (7-Day Residential):
       - Per Camper Daily Rate: Total expenditure / (Campers * 7 days). Should be ~₹450-₹500.
       - Prohibited: No "Misc" expenditure over 10% of total camp budget.
    
    3. ACCOUNTING INTEGRITY:
       - Sequence: Check for gaps in Voucher (V-) or Receipt (R-) numbers.
       - Chronology: Flag any expenses made before the corresponding Grant Receipt date.
       - Verification: Note which items are marked 'Audit Verified' vs 'Pending'.
    
    Format your response in Markdown with clear sections: 
    - 🚩 CRITICAL WARNINGS (Red Flags)
    - ✅ COMPLIANCE SCORE (0-100)
    - 📝 RECOMMENDATIONS FOR PROGRAMME OFFICER
    - 📊 BUDGETARY INSIGHTS
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error: any) {
    console.error("AI Audit Analysis Error:", error);
    
    // Check for common 'NOT_FOUND' or Permission errors
    if (error.message?.includes("not found") || error.message?.includes("404")) {
      return "ERROR_AUTH_REQUIRED: The High-Quality Auditor (Gemini 3 Pro) requires a paid project authorization. Please click the 'Authorize' button below.";
    }
    
    return "The AI Auditor encountered an unexpected technical issue. Please verify your internet connection or try again later.";
  }
};
