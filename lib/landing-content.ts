import data from "@/content/landing.json";

export const landing = data as LandingContent;

export interface LandingContent {
  seo: {
    title: string;
    description: string;
    keywords: string[];
    og_title: string;
    og_description: string;
    twitter_card: string;
  };
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    cta_primary: string;
    cta_secondary: string;
    social_proof_microcopy: string;
    trust_signals: string[];
  };
  feature_strip: {
    icon_name: string;
    title: string;
    description: string;
  }[];
  feature_deep_dives: {
    eyebrow: string;
    title: string;
    description: string;
    bullet_points: string[];
    demo_caption: string;
  }[];
  comparison_table: {
    title: string;
    columns: string[];
    rows: { feature: string; values: string[] }[];
  };
  how_it_works: {
    step_number: number;
    title: string;
    description: string;
  }[];
  pricing: {
    eyebrow: string;
    headline: string;
    description: string;
    plans: {
      name: string;
      price: string;
      period: string;
      billed_as: string;
      cta: string;
      highlighted: boolean;
      badge?: string;
      features: string[];
    }[];
    free_plan_note: string;
    trial_note: string;
  };
  testimonials: {
    quote: string;
    name: string;
    title: string;
    avatar_seed: string;
  }[];
  faq: { question: string; answer: string }[];
  final_cta: {
    headline: string;
    subheadline: string;
    cta_primary: string;
    microcopy: string;
  };
  footer: {
    tagline: string;
    link_columns: Record<string, { label: string; href: string }[]>;
    copyright: string;
  };
  structured_data: Record<string, unknown>;
}
