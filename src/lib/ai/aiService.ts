import { buildFitnessContext } from './contextBuilder';
import type { AIContextCategory, AIFitnessContext } from './contextBuilder';

export interface AIResponse {
  content: string;
  confidence?: 'HIGH_CONTEXT' | 'PARTIAL_CONTEXT' | 'INSUFFICIENT_CONTEXT';
  suggestedActions?: { label: string; action: string }[];
}

export interface AIProvider {
  generateDailyBriefing(context: AIFitnessContext): Promise<AIResponse>;
  generateResponse(prompt: string, context: AIFitnessContext): Promise<AIResponse>;
}

// In production, this would call a secure Supabase Edge Function without exposing API keys.
export class EdgeFunctionAIProvider implements AIProvider {
  async generateDailyBriefing(context: AIFitnessContext): Promise<AIResponse> {
    // throw new Error("Not implemented in local environment. Requires Edge Function deployment.");
    return {
      content: `Good morning, ${context.identity.username}.\n\nYou're maintaining a solid ${context.gamification?.streak || 0} day streak.\n\nToday I'd prioritize:\n💪 Completing your planned sessions\n🥗 Hitting your nutrition targets\n🌙 Focusing on recovery tonight`,
      confidence: 'PARTIAL_CONTEXT'
    };
  }

  async generateResponse(prompt: string, context: AIFitnessContext): Promise<AIResponse> {
    // Simulated intelligent response based on context
    let reply = `ARC received your message: "${prompt}".\n\n`;
    
    if (prompt.toLowerCase().includes('tired')) {
      reply += `Looking at your data, it appears your training load has been consistent, but recovery might be slipping. I recommend prioritizing an earlier bedtime tonight instead of a heavy session.`;
    } else if (prompt.toLowerCase().includes('eat')) {
      reply += `Based on your goal (${context.identity.goal}), ensure you hit your protein targets today. Consider options from your food library that align with this.`;
    } else {
      reply += `As your intelligence layer, I've analyzed your current goal (${context.identity.goal}) and streak (${context.gamification?.streak || 0} days). Keep up the discipline!`;
    }

    return {
      content: reply,
      confidence: 'PARTIAL_CONTEXT'
    };
  }
}

const provider = new EdgeFunctionAIProvider();

export const aiService = {
  async getDailyBriefing(profileId: string): Promise<AIResponse> {
    const categories: AIContextCategory[] = ['TRAINING', 'RECOVERY', 'GAMIFICATION'];
    const context = await buildFitnessContext(profileId, categories);
    return provider.generateDailyBriefing(context);
  },

  async askCoach(profileId: string, message: string): Promise<AIResponse> {
    const categories: AIContextCategory[] = ['TRAINING', 'NUTRITION', 'RECOVERY', 'GAMIFICATION', 'SOCIAL'];
    const context = await buildFitnessContext(profileId, categories);
    return provider.generateResponse(message, context);
  }
};
