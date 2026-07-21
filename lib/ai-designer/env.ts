import "server-only";

type EnvKey =
  | "SUPABASE_URL"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "OPENAI_API_KEY"
  | "REPLICATE_API_TOKEN"
  | "REPLICATE_MODEL_VERSION"
  | "PDFSHIFT_API_KEY";

export function requiredEnv(key: EnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function optionalEnv(key: string): string | undefined {
  const value = process.env[key];
  return value?.trim() ? value : undefined;
}
