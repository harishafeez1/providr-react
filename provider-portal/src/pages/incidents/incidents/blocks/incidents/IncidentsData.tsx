export interface IIncidentsData {
  id: number;
  incident_number: string;
  incident_type: string | {
    id: number;
    name: string;
    active: boolean;
    created_at: string;
    updated_at: string;
  };
  severity: string;
  incident_date_time: string;
  participant_name: string | null;
  injury_occurred: boolean;
  status: string;
  location?: string;
  description?: string;
  customer?: {
    first_name?: string;
    last_name?: string;
  };
  behavioral_identified?: boolean;
  trigger_extracted?: boolean;
  bsp_aligned?: boolean;
  restrictive_practice_used?: boolean;
}
