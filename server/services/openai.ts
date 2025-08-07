import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "default_key" 
});

export interface ConversationAnalysisRequest {
  conversation: string;
  analysisType: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AnalysisResult {
  emotionalTone: string;
  emotionalToneDescription: string;
  powerDynamics: string;
  powerDynamicsDescription: string;
  communicationPatterns: string;
  communicationPatternsDescription: string;
  relationshipInsights: string;
  relationshipInsightsDescription: string;
  recommendations: string[];
  emotionalIntensity: number;
  resolutionPotential: number;
  communicationQuality: number;
  powerBalance: number;
  rawAnalysis: string;
}

export async function analyzeConversation(request: ConversationAnalysisRequest): Promise<AnalysisResult> {
  try {
    const systemPrompt = `You are an expert relationship psychologist and communication analyst. Analyze conversations for psychological dynamics, emotional patterns, and relationship insights. Always respond with valid JSON in the exact format specified.`;

    const analysisPrompt = `
Analyze the following conversation between two people with focus on: ${request.analysisType}

Conversation:
${request.conversation}

Please provide a comprehensive psychological analysis in JSON format with these exact fields:
{
  "emotionalTone": "brief emotional tone assessment (2-3 words)",
  "emotionalToneDescription": "detailed emotional tone analysis (2-3 sentences)",
  "powerDynamics": "brief power dynamic assessment (2-3 words)", 
  "powerDynamicsDescription": "detailed power dynamics analysis (2-3 sentences)",
  "communicationPatterns": "brief communication pattern assessment (2-3 words)",
  "communicationPatternsDescription": "detailed communication patterns analysis (2-3 sentences)",
  "relationshipInsights": "brief relationship insight (2-3 words)",
  "relationshipInsightsDescription": "detailed relationship insights and therapeutic recommendations (3-4 sentences)",
  "recommendations": ["array of 4-6 specific therapeutic recommendations"],
  "emotionalIntensity": numerical_score_0_to_10,
  "resolutionPotential": numerical_score_0_to_10,
  "communicationQuality": numerical_score_0_to_10,
  "powerBalance": numerical_score_0_to_10,
  "rawAnalysis": "comprehensive full analysis text combining all insights (4-6 paragraphs)"
}

Provide specific, actionable insights suitable for both general users and relationship counselors.
`;

    const response = await openai.chat.completions.create({
      model: request.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: analysisPrompt }
      ],
      temperature: request.temperature,
      max_tokens: request.maxTokens,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content received from OpenAI");
    }

    const analysisResult = JSON.parse(content) as AnalysisResult;
    
    // Validate and sanitize numerical scores
    analysisResult.emotionalIntensity = Math.max(0, Math.min(10, analysisResult.emotionalIntensity || 0));
    analysisResult.resolutionPotential = Math.max(0, Math.min(10, analysisResult.resolutionPotential || 0));
    analysisResult.communicationQuality = Math.max(0, Math.min(10, analysisResult.communicationQuality || 0));
    analysisResult.powerBalance = Math.max(0, Math.min(10, analysisResult.powerBalance || 0));

    return analysisResult;
  } catch (error: any) {
    console.error("OpenAI Analysis Error:", error);
    throw new Error(`Failed to analyze conversation: ${error.message}`);
  }
}
