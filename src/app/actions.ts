"use server";

import {
  aiHatchingGuidance,
  type AiHatchingGuidanceInput,
  type AiHatchingGuidanceOutput
} from "@/ai/flows/ai-hatching-guidance-flow";

export async function getAiGuidance(input: AiHatchingGuidanceInput): Promise<{
  success: boolean;
  data: AiHatchingGuidanceOutput | null;
  error?: string;
}> {
  try {
    const output = await aiHatchingGuidance(input);
    return { success: true, data: output };
  } catch (e: any) {
    console.error(e);
    return { success: false, data: null, error: e.message || "An unknown error occurred." };
  }
}
