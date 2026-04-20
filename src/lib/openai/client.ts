import "server-only";

import OpenAI from "openai";
import { serverEnv } from "@/lib/config/env.server";

/**
 * Lazy-instantiated OpenAI client.
 *
 * Phase 22 wires this at the adapter level only — actual extraction
 * flows land in later phases. The key is optional in Phase 22
 * foundation, so this client is constructed on first access rather
 * than at module load. That way an owner without an OPENAI_API_KEY can
 * still boot the app and exercise every other surface.
 *
 * Server-only. The API key must never leak to the browser bundle.
 */
let cached: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!serverEnv.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set. Configure it in .env.local (server-only) before using the OpenAI adapter.",
    );
  }
  if (!cached) {
    cached = new OpenAI({ apiKey: serverEnv.OPENAI_API_KEY });
  }
  return cached;
}
