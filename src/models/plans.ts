export const PLANS_FEATURES_MAP = {
  pos: "PDV",
  reports: "Relatórios",
  support: "Suporte",
  ecommerce: "Loja virtual",
  credit_sales: "Vendas a prazo",
  custom_domain: "Domínio próprio",
  integration_ifood: "Integração com Ifood",
  ai_agent_whatsapp: "Atendente virtual (WhatsApp)",
} as const;

export type FeatureKey = keyof typeof PLANS_FEATURES_MAP;

export type PlanType = {
  id: string;
  created_at: string;
  name: string;
  price: number;
  features: typeof PLANS_FEATURES_MAP;
  recurrence: "monthly" | "annualy";
  price_id: string;
};
