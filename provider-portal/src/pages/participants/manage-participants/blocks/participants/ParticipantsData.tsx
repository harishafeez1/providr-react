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
  provider_company_id: string | number;
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
