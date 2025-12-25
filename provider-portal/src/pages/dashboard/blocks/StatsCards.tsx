import { KeenIcon } from '@/components';

interface DashboardStats {
  total_incidents: number;
  critical_serious_incidents: number;
  active_participants: number;
  restrictive_practices: number;
}

interface StatsCardsProps {
  stats: DashboardStats | null;
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
      <div className="card hover:shadow-lg transition-all duration-200 cursor-pointer">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2sm font-medium text-gray-600 mb-1.5">
                Total Incidents
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {stats?.total_incidents || 0}
              </div>
            </div>
            <div className="flex items-center justify-center size-12 rounded-lg bg-primary-light">
              <KeenIcon icon="note-2" className="text-xl text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="card hover:shadow-lg transition-all duration-200 cursor-pointer">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2sm font-medium text-gray-600 mb-1.5">
                Critical/Serious
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {stats?.critical_serious_incidents || 0}
              </div>
            </div>
            <div className="flex items-center justify-center size-12 rounded-lg bg-primary-light">
              <KeenIcon icon="information-2" className="text-xl text-primary" />
            </div>
          </div>
        </div>
      </div>

      <div className="card hover:shadow-lg transition-all duration-200 cursor-pointer">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2sm font-medium text-gray-600 mb-1.5">
                Active Participants
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {stats?.active_participants || 0}
              </div>
            </div>
            <div className="flex items-center justify-center size-12 rounded-lg bg-gray-100">
              <KeenIcon icon="people" className="text-xl text-gray-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="card hover:shadow-lg transition-all duration-200 cursor-pointer">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2sm font-medium text-gray-600 mb-1.5">
                Restrictive Practices
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {stats?.restrictive_practices || 0}
              </div>
            </div>
            <div className="flex items-center justify-center size-12 rounded-lg bg-gray-100">
              <KeenIcon icon="shield-tick" className="text-xl text-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { StatsCards };
