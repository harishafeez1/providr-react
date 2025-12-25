import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeenIcon } from '@/components';
import {
  fetchDashboardOverview,
  fetchIncidentTrends,
  fetchIncidentDistribution,
  fetchDashboardRecentIncidents,
  fetchDashboardParticipants
} from '@/services/api';
import { toast } from 'sonner';
import {
  StatsCards,
  // RestrictivePracticeTrends,
  // BreakdownByType,
  IncidentTrendsChart,
  IncidentDistributionCharts,
  RecentIncidentsList
} from './blocks';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all_time');

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [rpTrends, setRpTrends] = useState<any>(null);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [incidentTrends, setIncidentTrends] = useState<any>(null);
  const [distribution, setDistribution] = useState<any>(null);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    loadParticipants();
  }, [selectedParticipant, selectedPeriod]);

  const loadParticipants = async () => {
    try {
      const data = await fetchDashboardParticipants();
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);

    const params = {
      ...(selectedParticipant !== 'all' && { participant_id: parseInt(selectedParticipant) }),
      ...(selectedPeriod !== 'all_time' && { period: selectedPeriod })
    };

    // Fetch overview data
    try {
      const overviewData = await fetchDashboardOverview(params);
      console.log('Overview Data:', overviewData);
      setStats(overviewData.stats || overviewData);
      setRpTrends(overviewData.restrictive_practice_trends);
      setBreakdown(overviewData.breakdown_by_type);
    } catch (error: any) {
      console.error('Error loading overview:', error);
      if (error.response?.status === 404) {
        console.warn('Overview endpoint not found (404)');
      }
    }

    // Fetch incident trends
    try {
      const trendsData = await fetchIncidentTrends(params);
      console.log('Trends Data:', trendsData);
      setIncidentTrends(trendsData);
    } catch (error: any) {
      console.error('Error loading incident trends:', error);
      if (error.response?.status === 404) {
        console.warn('Incident trends endpoint not found (404)');
      }
    }

    // Fetch distribution data
    try {
      const distributionData = await fetchIncidentDistribution(params);
      console.log('Distribution Data:', distributionData);
      setDistribution(distributionData);
    } catch (error: any) {
      console.error('Error loading distribution:', error);
      if (error.response?.status === 404) {
        console.warn('Distribution endpoint not found (404) - Endpoint may not be implemented yet');
      }
    }

    // Fetch recent incidents
    try {
      const recentData = await fetchDashboardRecentIncidents({ limit: 10, ...params });
      console.log('Recent Incidents Data:', recentData);
      setRecentIncidents(recentData.incidents || recentData || []);
    } catch (error: any) {
      console.error('Error loading recent incidents:', error);
      if (error.response?.status === 404) {
        console.warn('Recent incidents endpoint not found (404)');
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container-fixed">
      <div className="flex flex-wrap items-center lg:items-end justify-between gap-5 pb-7.5">
        <div className="flex flex-col justify-center gap-2">
          <h1 className="text-xl font-semibold leading-none text-gray-900">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            className="select select-sm w-48"
            value={selectedParticipant}
            onChange={(e) => setSelectedParticipant(e.target.value)}
          >
            <option value="all">All Participants</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            className="select select-sm w-48"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="all_time">All time</option>
            <option value="last_7_days">Last 7 days</option>
            <option value="last_30_days">Last 30 days</option>
            <option value="last_90_days">Last 90 days</option>
            <option value="last_12_months">Last 12 months</option>
          </select>

          <button
            className="btn btn-sm btn-primary"
            onClick={() => navigate('/incidents/add-incident')}
          >
            <KeenIcon icon="plus" className="text-sm" />
            Report Incident
          </button>
        </div>
      </div>

      <StatsCards stats={stats} />
      {/* <RestrictivePracticeTrends rpTrends={rpTrends} /> */}
      {/* <BreakdownByType breakdown={breakdown} /> */}
      <IncidentTrendsChart incidentTrends={incidentTrends} />
      <IncidentDistributionCharts distribution={distribution} />
      <RecentIncidentsList recentIncidents={recentIncidents} />
    </div>
  );
};

export { DashboardPage };
