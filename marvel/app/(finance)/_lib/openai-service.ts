import OpenAI from "openai";
import { FinancialRecord, ForecastData } from "./type";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function cleanFinancialData(
  rawData: any[]
): Promise<FinancialRecord[]> {
  try {
    const prompt = `Clean this Stark Industries financial data. Return ONLY a valid JSON array with no extra text.

Sample input: ${JSON.stringify(rawData.slice(0, 50))}

Return format:
[
  {
    "Department": "Engineering",
    "Month": "Jan-24",
    "Revenue": 1500000,
    "Expenses": 900000,
    "Profit/Loss": 600000,
    "Forecasted Growth %": 12.5,
    "Risk Flag": "Low"
  }
]

Rules:
- Remove records with null/invalid Department
- Convert all numbers properly
- Calculate Profit/Loss = Revenue - Expenses
- Risk Flag must be "High", "Medium", or "Low"
- Return valid JSON array only - no explanations or comments, Unexpected non-whitespace character after JSON`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
        // response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 4000, // Ensure response doesn't get truncated
    });

    let responseContent = response.choices[0].message.content || "[]";

    // Clean up common JSON issues from OpenAI responses
    try {
      // Remove any text before the first [ or {
      const jsonStart = Math.max(
        responseContent.indexOf("["),
        responseContent.indexOf("{")
      );
      if (jsonStart > 0) {
        responseContent = responseContent.substring(jsonStart);
      }

      // Remove any text after the last ] or }
      const lastBracket = responseContent.lastIndexOf("]");
      const lastBrace = responseContent.lastIndexOf("}");
      const jsonEnd = Math.max(lastBracket, lastBrace);
      if (jsonEnd > 0 && jsonEnd < responseContent.length - 1) {
        responseContent = responseContent.substring(0, jsonEnd + 1);
      }

     const jsonString = extractJson(responseContent);
     const cleanedData = JSON.parse(jsonString);
     return Array.isArray(cleanedData) ? cleanedData : [];
    } catch (parseError) {
      console.error(
        "JSON parsing failed, falling back to manual cleaning:",
        parseError
      );
      throw parseError; // Let it fall through to manual cleaning
    }
  } catch (error) {
    console.error("Error cleaning data with OpenAI:", error);
    // Fallback to manual cleaning
    return rawData
      .filter(
        (row) =>
          row.Department &&
          row.Department !== "nil" &&
          row.Department !== "-" &&
          row.Department !== "N/A" &&
          typeof row.Revenue === "number" &&
          typeof row.Expenses === "number"
      )
      .map((row) => ({
        Department: row.Department,
        Month: row.Month,
        Revenue: row.Revenue,
        Expenses: row.Expenses,
        "Profit/Loss": row.Revenue - row.Expenses,
        "Budget Allocation": row["Budget Allocation"],
        "Forecasted Growth %": row["Forecasted Growth %"] || 0,
        "Risk Flag": row["Risk Flag"] || "Medium",
      }));
  }
}

export async function generateForecast(params: {
  period: number;
  department: string;
}): Promise<any> {
  try {
    const prompt = `
As Tony Stark's AI financial advisor, generate comprehensive financial forecasts for Stark Industries.

Parameters:
- Forecast Period: ${params.period} months
- Department Focus: ${params.department}

Generate a complete analytics report with the following structure:

{
  "forecasts": [
    {
      "period": "2024-09",
      "predicted_revenue": 15000000,
      "confidence": 87.5,
      "growth_rate": 12.3,
      "risk_factors": ["Market volatility", "Supply chain"]
    }
  ],
  "insights": {
    "revenue_trend": "increasing",
    "confidence_score": 82.4,
    "key_risks": ["Competition from Oscorp", "Technology disruption", "Economic downturn"],
    "opportunities": ["Arc reactor technology licensing", "Clean energy expansion", "AI integration"],
    "recommendations": [
      "Increase R&D investment by 15% to maintain technological edge",
      "Diversify revenue streams beyond defense contracts",
      "Focus on sustainable energy solutions for long-term growth"
    ]
  },
  "performance_metrics": {
    "accuracy": 89.2,
    "trend_strength": 76.8,
    "volatility": 12.4
  }
}

Generate realistic data for ${params.period} months ahead. Include:
- Monthly forecasts with confidence intervals
- Strategic insights and recommendations
- Risk assessment and opportunities
- Model performance metrics

Base this on Stark Industries' focus areas: defense technology, clean energy, AI, and advanced materials.
Return only valid JSON.
        `;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      //   response_format:{type:"json_object"}
    });

    const forecastData = JSON.parse(
      response.choices[0].message.content || "{}"
    );
    return forecastData;
  } catch (error) {
    console.error("Error generating forecast:", error);

    // Fallback data for demo purposes
    const months = [
      "2024-09",
      "2024-10",
      "2024-11",
      "2024-12",
      "2025-01",
      "2025-02",
    ];
    const forecasts = months.slice(0, params.period).map((month, index) => {
      const baseRevenue = 15000000 + index * 1200000;
      const growthRate = 5 + Math.random() * 10;

      return {
        period: month,
        predicted_revenue: baseRevenue * (1 + growthRate / 100),
        confidence: 75 + Math.random() * 20,
        growth_rate: growthRate,
        risk_factors: [
          "Market volatility",
          "Supply chain disruptions",
          "Competition",
        ],
      };
    });

    return {
      forecasts,
      insights: {
        revenue_trend: "increasing",
        confidence_score: 82.4,
        key_risks: [
          "Competition from Oscorp",
          "Technology disruption",
          "Economic downturn",
        ],
        opportunities: [
          "Arc reactor technology licensing",
          "Clean energy expansion",
          "AI integration",
        ],
        recommendations: [
          "Increase R&D investment by 15% to maintain technological edge",
          "Diversify revenue streams beyond defense contracts",
          "Focus on sustainable energy solutions for long-term growth",
        ],
      },
      performance_metrics: {
        accuracy: 89.2,
        trend_strength: 76.8,
        volatility: 12.4,
      },
    };
  }
}

function extractJson(text: string) {
  // Remove markdown fences
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Find first [ or { and last ] or }
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  const start =
    firstBrace === -1 ? firstBracket : Math.min(firstBrace, firstBracket);
  const lastBrace = cleaned.lastIndexOf("}");
  const lastBracket = cleaned.lastIndexOf("]");
  const end = Math.max(lastBrace, lastBracket) + 1;

  return cleaned.slice(start, end);
}