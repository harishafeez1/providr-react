export interface IIncidentsData {
  id: number;
  incident_number: string;
  incident_type: string;
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
}
