export type KitchenDesignStatus =
  | "uploaded"
  | "analyzing"
  | "rendering"
  | "describing"
  | "estimating"
  | "report_ready"
  | "lead_submitted"
  | "failed";

export type KitchenStyle =
  | "Modern Minimal"
  | "Shaker"
  | "Industrial"
  | "Classic Luxury"
  | "Scandinavian";

export interface KitchenDesignJob {
  id: string;
  status: KitchenDesignStatus;
  input_image_url: string;
  style: KitchenStyle;
  color_palette: string[];
  budget_min: number;
  budget_max: number;
  customer_notes: string | null;
  vision_analysis: Record<string, unknown> | null;
  generated_image_url: string | null;
  project_description: string | null;
  estimated_cost_min: number | null;
  estimated_cost_max: number | null;
  estimate_explanation: string | null;
  pdf_report_url: string | null;
  lead_name: string | null;
  lead_email: string | null;
  lead_phone: string | null;
  lead_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateKitchenDesignJobInput {
  inputImageUrl: string;
  style: KitchenStyle;
  colorPalette: string[];
  budgetMin: number;
  budgetMax: number;
  customerNotes: string | null;
}

export interface LeadInput {
  name: string;
  email: string;
  phone: string;
  message: string | null;
}
