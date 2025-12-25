import { useNavigate } from 'react-router-dom';
import { KeenIcon } from '@/components';

interface RecentIncident {
  id: number;
  incident_number: string;
  type: string;
  date: string;
  severity: string;
  status: string;
  participant?: {
    initial: string;
  };
}

interface RecentIncidentsListProps {
  recentIncidents: RecentIncident[];
}

const getSeverityBadgeClass = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'badge-primary';
    case 'serious': return 'badge-primary';
    case 'moderate': return 'badge-light';
    case 'minor': return 'badge-light';
    default: return 'badge-light';
  }
};

const RecentIncidentsList = ({ recentIncidents }: RecentIncidentsListProps) => {
  const navigate = useNavigate();

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <KeenIcon icon="document" className="text-primary" />
          Recent Incidents
        </h3>
        <button className="btn btn-sm btn-light" onClick={() => navigate('/incidents')}>
          View All
          <KeenIcon icon="right" className="text-sm" />
        </button>
      </div>
      <div className="card-body">
        {recentIncidents && recentIncidents.length > 0 ? (
          <div className="space-y-3">
            {recentIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-all duration-200"
                onClick={() => navigate('/incidents')}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-10 rounded-full bg-primary text-white font-semibold text-sm">
                    {incident.participant?.initial || 'M'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{incident.incident_number}</div>
                    <div className="text-2sm text-gray-600">{incident.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2sm text-gray-600">{incident.date}</div>
                  <span className={`badge ${getSeverityBadgeClass(incident.severity)}`}>
                    {incident.severity}
                  </span>
                  <span className="badge badge-light">{incident.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No recent incidents found
          </div>
        )}
      </div>
    </div>
  );
};

export { RecentIncidentsList };
