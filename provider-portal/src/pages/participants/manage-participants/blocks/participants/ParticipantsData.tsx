interface IParticipantsData {
  id: string | number;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  contact_phone: string;
  contact_email: string;
  assigned_practitioner_id?: string | number | null;
  assigned_practitioner?: {
    id: string | number;
    first_name: string;
    last_name: string;
    email: string;
  };
  status: string | number | boolean;
  medical_conditions?: string;
  medications?: string;
  disabilities?: string;
  provider_company_id: string | number;
  behaviours_of_concern?: string;
  triggers_antecedents?: string;
  early_warning_signs?: string;
  escalation_patterns?: string;
  behaviour_overview_summary?: string;
  behavioural_tendencies?: string;
  proactive_strategies?: string;
  reactive_strategies?: string;
  escalation_steps?: string;
  restricted_practices?: string;
  support_requirements?: string;
  risk_indicators?: string;
  risk_factors?: string;
  sensory_profile?: string;
  communication_style?: string;
  environmental_needs?: string;
  support_environment_family_context?: string;
  functional_daily_living_profile?: string;
}

interface ParticipantsData {
  id: string | number;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  contact_phone: string;
  contact_email: string;
  assigned_practitioner_id?: string | number | null;
  assigned_practitioner?: {
    id: string | number;
    first_name: string;
    last_name: string;
    email: string;
  };
  assigned_workers?: Array<{
    id: string | number;
    first_name: string;
    last_name: string;
    email: string;
  }>;
  assigned_worker_ids?: (string | number)[];
  status: string | number | boolean;
  medical_conditions?: string;
  provider_company_id: string | number;
}

export type { IParticipantsData, ParticipantsData };
