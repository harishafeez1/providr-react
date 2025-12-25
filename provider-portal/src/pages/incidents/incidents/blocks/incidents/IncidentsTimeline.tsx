import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IIncidentsData } from './IncidentsData';
import { IncidentTimelineCard } from './IncidentTimelineCard';
import { fetchAllIncidents, deleteIncident, fetchSingleIncident, fetchIncidentCustomers, fetchIncidentStatistics, fetchBspAnalysis, exportIncidentPdf } from '@/services/api';
import { KeenIcon } from '@/components';
import { ModalDeleteConfirmation } from '@/partials/modals/delete-confirmation';
import { ViewToggle } from './ViewToggle';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GroupedIncidents {
  [date: string]: IIncidentsData[];
}

interface IncidentsTimelineProps {
  activeView: 'table' | 'timeline';
  onViewChange: (view: 'table' | 'timeline') => void;
}

const IncidentsTimeline = ({ activeView, onViewChange }: IncidentsTimelineProps) => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<IIncidentsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIncidentDetails, setSelectedIncidentDetails] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [bspAnalysisData, setBspAnalysisData] = useState<any>(null);
  const [loadingBspAnalysis, setLoadingBspAnalysis] = useState(false);
  const ITEMS_PER_PAGE = 20;

  // Filter states
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRestrictive, setSelectedRestrictive] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [allIncidentsData, setAllIncidentsData] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Load participants on mount
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        const data = await fetchIncidentCustomers();
        setParticipants(data || []);
      } catch (error) {
        console.error('Error loading participants:', error);
      }
    };
    loadParticipants();
  }, []);

  // Load initial statistics on mount
  useEffect(() => {
    const loadStatistics = async () => {
      setLoadingStats(true);
      try {
        const data = await fetchIncidentStatistics({});
        setStatistics(data);
      } catch (error) {
        console.error('Error loading statistics:', error);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStatistics();
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [currentPage]);

  const loadIncidents = async () => {
    try {
      setLoading(true);

      // Build filter object for backend
      const apiFilters: any = {
        per_page: ITEMS_PER_PAGE,
        page: currentPage
      };

      // Add custom filters
      if (selectedParticipant !== 'all') {
        apiFilters.participant_name = selectedParticipant;
      }
      if (selectedSeverity !== 'all') {
        apiFilters.severity = selectedSeverity;
      }
      if (selectedStatus !== 'all') {
        apiFilters.status = selectedStatus;
      }
      if (selectedRestrictive !== 'all') {
        apiFilters.restrictive_practice = selectedRestrictive === 'yes';
      }
      if (dateFrom) {
        apiFilters.date_from = dateFrom;
      }
      if (dateTo) {
        apiFilters.date_to = dateTo;
      }

      // Fetch data from backend with filters
      const data = await fetchAllIncidents(apiFilters);
      console.log('Incidents API response:', data);

      // Handle different possible response formats
      let incidentsData = [];

      if (Array.isArray(data)) {
        incidentsData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        incidentsData = data.data;
      } else if (data?.incidents) {
        incidentsData = data.incidents;
      }

      console.log('Processed incidents data:', incidentsData);

      // Store all incidents for export
      setAllIncidentsData(incidentsData);

      if (currentPage === 1) {
        setIncidents(incidentsData);
      } else {
        setIncidents(prev => [...prev, ...incidentsData]);
      }

      // Check if there are more items
      setHasMore(incidentsData && incidentsData.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading incidents:', error);
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'minor':
        return 'badge-success';
      case 'moderate':
        return 'badge-warning';
      case 'serious':
        return 'badge-danger';
      case 'critical':
        return 'badge-danger';
      default:
        return 'badge-light';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'badge-light';
      case 'submitted':
        return 'badge-info';
      case 'under_review':
        return 'badge-warning';
      case 'completed':
        return 'badge-success';
      default:
        return 'badge-light';
    }
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return { date: 'N/A', time: '' };
    const date = new Date(dateTime);

    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return { date: formattedDate, time: formattedTime };
  };

  const handleViewDetails = async (incidentId: number) => {
    setShowReportModal(true);
    setLoadingReport(true);

    try {
      const response = await fetchSingleIncident(incidentId);
      setSelectedIncidentDetails(response);
      setLoadingReport(false);
    } catch (err: any) {
      console.error('Error fetching incident details:', err);
      toast.error(err?.response?.data?.message || 'Failed to load incident details');
      setShowReportModal(false);
      setLoadingReport(false);
    }
  };

  const handleModalOpen = (id: number) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleDeleteIncident = async () => {
    if (selectedId) {
      try {
        await deleteIncident(selectedId);
        toast.success('Incident deleted successfully');
        // Refresh the list
        setCurrentPage(1);
        loadIncidents();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to delete incident');
      }
    }
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedIncidentDetails(null);
  };

  const handleRunBspAnalysis = async (incidentId: number) => {
    setLoadingBspAnalysis(true);
    setBspAnalysisData(null);

    try {
      const bspResponse = await fetchBspAnalysis(incidentId);
      setBspAnalysisData(bspResponse);
    } catch (bspErr: any) {
      console.error('Error fetching BSP analysis:', bspErr);
      toast.error('BSP Analysis could not be loaded');
    } finally {
      setLoadingBspAnalysis(false);
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'draft':
        return 'Draft';
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'completed':
        return 'Completed';
      default:
        return status || 'Draft';
    }
  };

  const loadStatisticsWithFilters = async () => {
    setLoadingStats(true);
    try {
      const filters: any = {};

      if (selectedParticipant !== 'all') {
        filters.participant_name = selectedParticipant;
      }
      if (selectedSeverity !== 'all') {
        filters.severity = selectedSeverity;
      }
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      if (selectedRestrictive !== 'all') {
        filters.restrictive_practice = selectedRestrictive === 'yes';
      }
      if (dateFrom) {
        filters.date_from = dateFrom;
      }
      if (dateTo) {
        filters.date_to = dateTo;
      }

      const data = await fetchIncidentStatistics(filters);
      setStatistics(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    loadIncidents();
    loadStatisticsWithFilters();
  };

  const handleClearFilters = async () => {
    setSelectedParticipant('all');
    setSelectedSeverity('all');
    setSelectedStatus('all');
    setSelectedRestrictive('all');
    setDateFrom('');
    setDateTo('');

    // Reload data without filters
    setCurrentPage(1);

    // Load statistics without filters
    setLoadingStats(true);
    try {
      const data = await fetchIncidentStatistics({});
      setStatistics(data);

      // Reload incidents without filters
      const apiFilters: any = {
        per_page: ITEMS_PER_PAGE,
        page: 1
      };
      const response = await fetchAllIncidents(apiFilters);

      // Handle different possible response formats
      let incidentsData = [];

      if (Array.isArray(response)) {
        incidentsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        incidentsData = response.data;
      } else if (response?.incidents) {
        incidentsData = response.incidents;
      }

      setAllIncidentsData(incidentsData);
      setIncidents(incidentsData);
      setHasMore(incidentsData && incidentsData.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const exportToCSV = () => {
    try {
      let dataToExport = allIncidentsData;

      // Apply the same filters
      if (selectedParticipant && selectedParticipant !== 'all') {
        dataToExport = dataToExport.filter((item: any) => {
          const participantName = item.participant_name ||
            (item.customer ? `${item.customer.first_name || ''} ${item.customer.last_name || ''}`.trim() : '');
          return participantName === selectedParticipant;
        });
      }

      if (selectedSeverity && selectedSeverity !== 'all') {
        dataToExport = dataToExport.filter((item: any) =>
          item.severity?.toLowerCase() === selectedSeverity.toLowerCase()
        );
      }

      if (selectedStatus && selectedStatus !== 'all') {
        dataToExport = dataToExport.filter((item: any) =>
          item.status?.toLowerCase() === selectedStatus.toLowerCase()
        );
      }

      if (selectedRestrictive && selectedRestrictive !== 'all') {
        const isRestrictive = selectedRestrictive === 'restrictive';
        dataToExport = dataToExport.filter((item: any) =>
          Boolean(item.restrictive_practice_used) === isRestrictive
        );
      }

      if (dateFrom) {
        dataToExport = dataToExport.filter((item: any) => {
          const itemDate = new Date(item.incident_date_time);
          const fromDate = new Date(dateFrom);
          return itemDate >= fromDate;
        });
      }

      if (dateTo) {
        dataToExport = dataToExport.filter((item: any) => {
          const itemDate = new Date(item.incident_date_time);
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          return itemDate <= toDate;
        });
      }

      // Prepare CSV content
      const headers = [
        'Incident Number',
        'Date & Time',
        'Participant',
        'Type',
        'Severity',
        'Status',
        'Injury',
        'Location',
        'Description'
      ];

      const csvRows = [headers.join(',')];

      dataToExport.forEach((incident: any) => {
        const { date, time } = formatDateTime(incident.incident_date_time);
        const dateTimeFormatted = time ? `${date} ${time}` : date;

        const row = [
          `"${incident.incident_number || 'N/A'}"`,
          `"${dateTimeFormatted}"`,
          `"${incident.participant_name || (incident.customer ? `${incident.customer.first_name || ''} ${incident.customer.last_name || ''}`.trim() : 'N/A')}"`,
          `"${typeof incident.incident_type === 'object' && incident.incident_type?.name ? incident.incident_type.name : incident.incident_type || 'N/A'}"`,
          `"${incident.severity || 'N/A'}"`,
          `"${getStatusDisplayName(incident.status)}"`,
          `"${incident.injury_occurred ? 'Yes' : 'No'}"`,
          `"${incident.location || 'N/A'}"`,
          `"${(incident.description || 'N/A').replace(/"/g, '""')}"`
        ];
        csvRows.push(row.join(','));
      });

      // Create and download CSV file
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `incidents_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${dataToExport.length} incident(s) to CSV`);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Failed to export data');
    }
  };

  // Group incidents by date
  const groupedIncidents = useMemo(() => {
    const groups: GroupedIncidents = {};

    incidents.forEach(incident => {
      const date = new Date(incident.incident_date_time);
      const dateKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(incident);
    });

    // Sort incidents within each group by time (descending)
    Object.keys(groups).forEach(dateKey => {
      groups[dateKey].sort((a, b) =>
        new Date(b.incident_date_time).getTime() - new Date(a.incident_date_time).getTime()
      );
    });

    return groups;
  }, [incidents]);

  const sortedDates = useMemo(() => {
    return Object.keys(groupedIncidents).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
  }, [groupedIncidents]);

  const handleEdit = (id: number) => {
    navigate(`/incidents/${id}/edit`);
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading incidents...</span>
        </div>
      </div>
    );
  }

  const hasActiveFilters = selectedParticipant !== 'all' || selectedSeverity !== 'all' ||
    selectedStatus !== 'all' || selectedRestrictive !== 'all' || dateFrom || dateTo;

  return (
    <div className="card">
      {/* Toolbar Header */}
      <div className="card-header flex-wrap px-5 py-5 border-b-0">
        <h3 className="card-title">Incidents</h3>
        <div className="flex flex-wrap gap-2 items-center">
          {/* View Toggle */}
          <ViewToggle activeView={activeView} onViewChange={onViewChange} />

          {/* Export Button */}
          <button
            type="button"
            onClick={exportToCSV}
            className="btn btn-sm btn-light flex items-center gap-1.5"
          >
            <KeenIcon icon="file-down" className="text-base" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          {/* Filters Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-sm ${hasActiveFilters ? 'btn-primary' : 'btn-light'} flex items-center gap-1.5`}
            style={{
              color: hasActiveFilters ? 'white' : undefined
            }}
          >
            <KeenIcon icon="filter" className={`text-base ${hasActiveFilters ? 'text-white' : ''}`} />
            <span style={{ color: hasActiveFilters ? 'white' : undefined }}>Filters</span>
            {hasActiveFilters && (
              <span className="badge badge-sm badge-circle bg-white text-primary">!</span>
            )}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Incidents Card */}
          <div className="card border border-gray-200 dark:border-gray-700">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xs text-gray-600 dark:text-gray-400 font-medium mb-1">Total Incidents</div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                    {loadingStats ? '...' : statistics?.total_incidents || 0}
                  </div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-light">
                  <KeenIcon icon="chart-line-up" className="text-2xl text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* High Severity Card */}
          <div className="card border border-gray-200 dark:border-gray-700">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xs text-gray-600 dark:text-gray-400 font-medium mb-1">High Severity</div>
                  <div className="text-2xl font-semibold text-danger">
                    {loadingStats ? '...' : statistics?.high_severity || 0}
                  </div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-danger-light">
                  <KeenIcon icon="information-2" className="text-2xl text-danger" />
                </div>
              </div>
            </div>
          </div>

          {/* Training Gaps Card */}
          <div className="card border border-gray-200 dark:border-gray-700">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xs text-gray-600 dark:text-gray-400 font-medium mb-1">Training Gaps</div>
                  <div className="text-2xl font-semibold text-warning">
                    {loadingStats ? '...' : statistics?.training_gaps || 0}
                  </div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-warning-light">
                  <KeenIcon icon="book" className="text-2xl text-warning" />
                </div>
              </div>
            </div>
          </div>

          {/* Time Saved Card */}
          <div className="card border border-gray-200 dark:border-gray-700">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xs text-gray-600 dark:text-gray-400 font-medium mb-1">Time Saved</div>
                  <div className="text-2xl font-semibold text-success">
                    {loadingStats ? '...' : `${statistics?.time_saved || 0}%`}
                  </div>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success-light">
                  <KeenIcon icon="time" className="text-2xl text-success" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section - Collapsible */}
      {showFilters && (
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
            {/* Participant Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Participant
              </label>
              <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Participants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Participants</SelectItem>
                  {participants.map((participant: any) => (
                    <SelectItem
                      key={participant.id}
                      value={`${participant.first_name} ${participant.last_name}`}
                    >
                      {participant.first_name} {participant.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severity Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Severity
              </label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="serious">Serious</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Restrictive Practice Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Restrictive
              </label>
              <Select value={selectedRestrictive} onValueChange={setSelectedRestrictive}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Date From
              </label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Date To Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Date To
              </label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-sm btn-light"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="btn btn-sm btn-primary"
              style={{ color: 'white' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className="card-body px-5 py-7.5">
        {!loading && incidents.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <KeenIcon icon="file-deleted" className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No incidents found
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Try adjusting your filters or create a new incident
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((dateKey) => {
            const dateObj = new Date(dateKey);
            const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
            const year = dateObj.getFullYear();
            const day = dateObj.getDate();
            const month = dateObj.toLocaleDateString('en-US', { month: 'short' });

            return (
              <div key={dateKey} className="relative">
                {/* Date Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary text-white shadow-md flex-shrink-0">
                    <div className="text-center">
                      <div className="text-xs font-medium opacity-90">{month}</div>
                      <div className="text-2xl font-bold leading-none">{day}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">
                      {dayOfWeek}, {year}
                    </h3>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mt-2"></div>
                  </div>
                </div>

                {/* Timeline Line */}
                <div className="absolute left-8 top-20 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>

                {/* Incidents for this date */}
                <div className="space-y-0 ml-16">
                  {groupedIncidents[dateKey].map((incident) => (
                    <IncidentTimelineCard
                      key={incident.id}
                      incident={incident}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEdit}
                      onDelete={handleModalOpen}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-6">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="btn btn-primary btn-sm"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">
                      <KeenIcon icon="arrows-circle" />
                    </span>
                    Loading...
                  </>
                ) : (
                  <>
                    <KeenIcon icon="down" />
                    Load More
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ModalDeleteConfirmation
        open={isModalOpen}
        onOpenChange={() => {
          handleModalClose();
        }}
        onDeleteConfirm={async () => {
          await handleDeleteIncident();
          handleModalClose();
        }}
      />

      {/* Report Modal */}
      {showReportModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeReportModal();
            }
          }}
        >
          <style>
            {`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
            `}
          </style>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '1200px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Modal Header */}
              <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 className="modal-title" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                    Incident Details
                  </h3>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                    <i className="ki-outline ki-check-circle text-xs mr-1"></i>
                    NDIS
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-light"
                    onClick={() => selectedIncidentDetails && exportIncidentPdf(selectedIncidentDetails.id)}
                    disabled={!selectedIncidentDetails}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="ki-outline ki-file-down text-base mr-1"></i>
                    Export
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-icon btn-light"
                    onClick={() => {
                      if (selectedIncidentDetails) {
                        setSelectedId(selectedIncidentDetails.id);
                        setShowReportModal(false);
                        setIsModalOpen(true);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="ki-outline ki-trash text-base"></i>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-icon btn-light"
                    onClick={closeReportModal}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="ki-outline ki-cross text-base"></i>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                {loadingReport ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    padding: '40px 20px'
                  }}>
                    <div style={{
                      position: 'relative',
                      width: '120px',
                      height: '120px',
                      marginBottom: '32px'
                    }}>
                      {/* Outer rotating ring */}
                      <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        border: '4px solid #e5e7eb',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      {/* Middle rotating ring */}
                      <div style={{
                        position: 'absolute',
                        width: '80%',
                        height: '80%',
                        top: '10%',
                        left: '10%',
                        border: '4px solid #e5e7eb',
                        borderBottom: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1.5s linear infinite reverse'
                      }}></div>
                      {/* Center icon */}
                      <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className="ki-outline ki-document text-4xl text-primary" style={{
                          animation: 'pulse 2s ease-in-out infinite'
                        }}></i>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <h4 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '8px'
                      }}>
                        Loading Incident Report
                      </h4>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        marginBottom: '16px'
                      }}>
                        Fetching incident details and AI-generated reports...
                      </p>

                      {/* Progress dots */}
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          animation: 'bounce 1.4s ease-in-out infinite'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          animation: 'bounce 1.4s ease-in-out 0.2s infinite'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          animation: 'bounce 1.4s ease-in-out 0.4s infinite'
                        }}></div>
                      </div>
                    </div>
                  </div>
                ) : selectedIncidentDetails ? (
                  <div className="space-y-6">
                    {/* BSP ANALYSIS SECTION */}
                    {loadingBspAnalysis ? (
                      <div style={{
                        backgroundColor: '#eff6ff',
                        borderLeft: '4px solid #6b46c1',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '24px'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '24px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i className="ki-outline ki-abstract-26" style={{ fontSize: '24px', color: '#6b46c1' }}></i>
                            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                              AI-Powered BSP Analysis
                            </h4>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            disabled
                            style={{ cursor: 'not-allowed' }}
                          >
                            <i className="ki-outline ki-abstract-26 text-sm mr-1"></i>
                            Analyzing...
                          </button>
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '40px 20px'
                        }}>
                          <div style={{
                            position: 'relative',
                            width: '80px',
                            height: '80px',
                            marginBottom: '24px'
                          }}>
                            <div style={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              border: '4px solid #dbeafe',
                              borderTop: '4px solid #3b82f6',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }}></div>
                            <div style={{
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <i className="ki-outline ki-abstract-26" style={{ fontSize: '32px', color: '#3b82f6' }}></i>
                            </div>
                          </div>
                          <p style={{ fontSize: '1rem', color: '#3b82f6', marginBottom: '8px', textAlign: 'center' }}>
                            Analyzing incident against Behavior Support Plan...
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#60a5fa', textAlign: 'center' }}>
                            Maps triggers, strategies, and risk factors against the participant's BSP
                          </p>
                        </div>
                      </div>
                    ) : bspAnalysisData?.bsp_analysis ? (
                      <div style={{
                        backgroundColor: 'white',
                        borderLeft: '4px solid #6b46c1',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '24px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                          <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                            BSP Analysis & Recommendations
                          </h4>
                        </div>

                        <div className="space-y-4">
                        {/* BSP Gaps Detected */}
                        {bspAnalysisData.bsp_analysis?.gaps_detected?.count > 0 && (
                          <div style={{ backgroundColor: '#f5f3ff', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#6b46c1', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>{bspAnalysisData.bsp_analysis.gaps_detected.title}</span>
                              <span className="badge badge-light" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                {bspAnalysisData.bsp_analysis.gaps_detected.count} Gaps
                              </span>
                            </h5>
                            <div className="space-y-2">
                              {(bspAnalysisData.bsp_analysis.gaps_detected.data || []).map((gap: any, idx: number) => (
                                <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #a78bfa' }}>
                                  <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{gap.description || gap}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}



                        {/* Draft BSP Update */}
                        {bspAnalysisData.bsp_analysis.draft_update?.data && (
                          <div style={{ backgroundColor: '#f5f3ff', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#6b46c1', marginBottom: '12px' }}>
                              {bspAnalysisData.bsp_analysis.draft_update.title}
                            </h5>
                            <div className="space-y-3">
                              {bspAnalysisData.bsp_analysis.draft_update.data.context_of_behaviour && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '6px' }}>Context of Behaviour</p>
                                  <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{bspAnalysisData.bsp_analysis.draft_update.data.context_of_behaviour}</p>
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.draft_update.data.environmental_considerations && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '6px' }}>Environmental Considerations</p>
                                  <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{bspAnalysisData.bsp_analysis.draft_update.data.environmental_considerations}</p>
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.draft_update.data.trauma_informed_adjustments && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '6px' }}>Trauma-Informed Adjustments</p>
                                  <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{bspAnalysisData.bsp_analysis.draft_update.data.trauma_informed_adjustments}</p>
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.draft_update.data.safety_recommendations && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '6px' }}>Safety Recommendations</p>
                                  <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{bspAnalysisData.bsp_analysis.draft_update.data.safety_recommendations}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Trigger Alignment */}
                        {bspAnalysisData.bsp_analysis.trigger_alignment?.data && (
                          <div style={{ backgroundColor: '#f5f3ff', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#6b46c1', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>{bspAnalysisData.bsp_analysis.trigger_alignment.title}</span>
                              <span className="badge badge-light" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                {bspAnalysisData.bsp_analysis.trigger_alignment.data.confidence_level || 'N/A'} Confidence
                              </span>
                            </h5>
                            <div className="space-y-3">
                              {bspAnalysisData.bsp_analysis.trigger_alignment.data.alignment_explanation && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{bspAnalysisData.bsp_analysis.trigger_alignment.data.alignment_explanation}</p>
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.trigger_alignment.data.matched_triggers?.length > 0 && (
                                <div>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px' }}>Matched Triggers</p>
                                  <div className="space-y-2">
                                    {(bspAnalysisData.bsp_analysis.trigger_alignment.data.matched_triggers || []).map((trigger: string, idx: number) => (
                                      <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #a78bfa' }}>
                                        <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{trigger}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Strategy Assessment */}
                        {bspAnalysisData.bsp_analysis.strategy_assessment?.data && (
                          <div style={{ backgroundColor: '#f5f3ff', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#6b46c1', marginBottom: '12px' }}>
                              {bspAnalysisData.bsp_analysis.strategy_assessment.title}
                            </h5>
                            <div className="space-y-3">
                              {bspAnalysisData.bsp_analysis.strategy_assessment.data.staff_response_evaluation && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '6px' }}>Staff Response Evaluation</p>
                                  <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{bspAnalysisData.bsp_analysis.strategy_assessment.data.staff_response_evaluation}</p>
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.strategy_assessment.data.missing_proactive_strategies?.length > 0 && (
                                <div>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px' }}>Missing Proactive Strategies</p>
                                  {(bspAnalysisData.bsp_analysis.strategy_assessment.data.missing_proactive_strategies || []).map((strategy: string, idx: number) => (
                                    <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #a78bfa', marginBottom: '8px' }}>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{strategy}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.strategy_assessment.data.missed_reactive_strategies?.length > 0 && (
                                <div>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px' }}>Missed Reactive Strategies</p>
                                  {(bspAnalysisData.bsp_analysis.strategy_assessment.data.missed_reactive_strategies || []).map((strategy: string, idx: number) => (
                                    <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #a78bfa', marginBottom: '8px' }}>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{strategy}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Identified Gaps Summary */}
                        {bspAnalysisData.bsp_analysis?.gaps_summary?.count > 0 && (
                          <div style={{ backgroundColor: '#f5f3ff', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#6b46c1', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>{bspAnalysisData.bsp_analysis.gaps_summary.title}</span>
                              <span className="badge badge-light" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                {bspAnalysisData.bsp_analysis.gaps_summary.count} Issues
                              </span>
                            </h5>
                            <div className="space-y-2">
                              {(bspAnalysisData.bsp_analysis.gaps_summary.data || []).map((gap: any, idx: number) => (
                                <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #a78bfa' }}>
                                  <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{typeof gap === 'string' ? gap : gap.description || gap.gap || JSON.stringify(gap)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* BSP Internal Inconsistencies */}
                        {bspAnalysisData.bsp_analysis?.inconsistencies?.count > 0 && (
                          <div style={{ backgroundColor: '#f5f3ff', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#6b46c1', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>{bspAnalysisData.bsp_analysis.inconsistencies.title}</span>
                              <span className="badge badge-light" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                {bspAnalysisData.bsp_analysis.inconsistencies.count} Found
                              </span>
                            </h5>
                            <div className="space-y-2">
                              {(bspAnalysisData.bsp_analysis.inconsistencies.data || []).map((inconsistency: any, idx: number) => (
                                <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #a78bfa' }}>
                                  <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{typeof inconsistency === 'string' ? inconsistency : inconsistency.description || inconsistency.inconsistency || JSON.stringify(inconsistency)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Potentially Outdated Strategies */}
                        {bspAnalysisData.bsp_analysis?.outdated_strategies?.count > 0 && (
                          <div style={{ backgroundColor: '#f5f3ff', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#6b46c1', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>{bspAnalysisData.bsp_analysis.outdated_strategies.title}</span>
                              <span className="badge badge-light" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                {bspAnalysisData.bsp_analysis.outdated_strategies.count} Strategies
                              </span>
                            </h5>
                            <div className="space-y-3">
                              {(bspAnalysisData.bsp_analysis.outdated_strategies.data || []).map((item: any, idx: number) => (
                                <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>{item.strategy || item}</p>
                                  {item.reason && (
                                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}><strong>Reason:</strong> {item.reason}</p>
                                  )}
                                  {item.suggested_update && (
                                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}><strong>Suggested Update:</strong> {item.suggested_update}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skill Building Opportunities */}
                        {bspAnalysisData.bsp_analysis?.skill_building?.count > 0 && (
                          <div style={{ backgroundColor: '#f5f3ff', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#6b46c1', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>{bspAnalysisData.bsp_analysis.skill_building.title}</span>
                              <span className="badge badge-light" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                {bspAnalysisData.bsp_analysis.skill_building.count} Opportunities
                              </span>
                            </h5>
                            <div className="space-y-3">
                              {(bspAnalysisData.bsp_analysis.skill_building.data || []).map((item: any, idx: number) => (
                                <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  {item.skill_area && (
                                    <span className="badge badge-sm badge-light" style={{ fontSize: '0.75rem', padding: '4px 8px', marginBottom: '8px', display: 'inline-block' }}>
                                      {item.skill_area}
                                    </span>
                                  )}
                                  {item.recommendation && (
                                    <p style={{ fontSize: '0.875rem', color: '#1f2937', marginBottom: '8px' }}><strong>Recommendation:</strong> {item.recommendation}</p>
                                  )}
                                  {item.functional_basis && (
                                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}><strong>Functional Basis:</strong> {item.functional_basis}</p>
                                  )}
                                  {!item.recommendation && !item.functional_basis && (
                                    <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{item}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Risk Insights */}
                        {bspAnalysisData.bsp_analysis.risk_insights?.data && (
                          <div style={{ backgroundColor: '#f5f3ff', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#6b46c1', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>{bspAnalysisData.bsp_analysis.risk_insights.title}</span>
                              <span className={`badge badge-lg ${
                                bspAnalysisData.bsp_analysis.risk_insights.data.recurrence_risk === 'high' ? 'badge-danger' :
                                bspAnalysisData.bsp_analysis.risk_insights.data.recurrence_risk === 'medium' ? 'badge-warning' : 'badge-success'
                              }`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                {bspAnalysisData.bsp_analysis.risk_insights.data.recurrence_risk || 'N/A'} Risk
                              </span>
                            </h5>
                            <div className="space-y-3">
                              {bspAnalysisData.bsp_analysis.risk_insights.data.risk_mitigation_summary && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '6px' }}>Risk Mitigation Summary</p>
                                  <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{bspAnalysisData.bsp_analysis.risk_insights.data.risk_mitigation_summary}</p>
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.risk_insights.data.environmental_risk_factors?.length > 0 && (
                                <div>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px' }}>Environmental Risk Factors</p>
                                  {(bspAnalysisData.bsp_analysis.risk_insights.data.environmental_risk_factors || []).map((factor: string, idx: number) => (
                                    <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #a78bfa', marginBottom: '8px' }}>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{factor}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.risk_insights.data.behavioural_risk_factors?.length > 0 && (
                                <div>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px' }}>Behavioural Risk Factors</p>
                                  {(bspAnalysisData.bsp_analysis.risk_insights.data.behavioural_risk_factors || []).map((factor: string, idx: number) => (
                                    <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #a78bfa', marginBottom: '8px' }}>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{factor}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* NDIS Compliance Assessment */}
                        {bspAnalysisData.bsp_analysis.compliance?.data && (
                          <div style={{ backgroundColor: '#f5f3ff', borderRadius: '8px', padding: '16px' }}>
                            <h5 style={{ fontSize: '1rem', fontWeight: '600', color: '#6b46c1', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>{bspAnalysisData.bsp_analysis.compliance.title}</span>
                              <span className={`badge badge-lg ${
                                bspAnalysisData.bsp_analysis.compliance.data.compliance_level === 'compliant' ? 'badge-success' :
                                bspAnalysisData.bsp_analysis.compliance.data.compliance_level === 'partial' ? 'badge-warning' : 'badge-danger'
                              }`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                {bspAnalysisData.bsp_analysis.compliance.data.compliance_level || 'N/A'}
                              </span>
                            </h5>
                            <div className="grid md:grid-cols-2 gap-4">
                              {bspAnalysisData.bsp_analysis.compliance.data.person_centred_practice && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '6px' }}>Person-Centred Practice</p>
                                  <div className="flex items-center justify-between">
                                    <span className={`badge ${bspAnalysisData.bsp_analysis.compliance.data.person_centred_practice.status === 'compliant' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                      {bspAnalysisData.bsp_analysis.compliance.data.person_centred_practice.status}
                                    </span>
                                  </div>
                                  {bspAnalysisData.bsp_analysis.compliance.data.person_centred_practice.notes && (
                                    <p style={{ fontSize: '0.75rem', color: '#1f2937', marginTop: '8px' }}>{bspAnalysisData.bsp_analysis.compliance.data.person_centred_practice.notes}</p>
                                  )}
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.compliance.data.positive_behaviour_support_framework && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '6px' }}>PBS Framework</p>
                                  <div className="flex items-center justify-between">
                                    <span className={`badge ${bspAnalysisData.bsp_analysis.compliance.data.positive_behaviour_support_framework.status === 'compliant' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                      {bspAnalysisData.bsp_analysis.compliance.data.positive_behaviour_support_framework.status}
                                    </span>
                                  </div>
                                  {bspAnalysisData.bsp_analysis.compliance.data.positive_behaviour_support_framework.notes && (
                                    <p style={{ fontSize: '0.75rem', color: '#1f2937', marginTop: '8px' }}>{bspAnalysisData.bsp_analysis.compliance.data.positive_behaviour_support_framework.notes}</p>
                                  )}
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.compliance.data.restrictive_practice_documentation && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '6px' }}>Restrictive Practice Documentation</p>
                                  <div className="flex items-center justify-between">
                                    <span className={`badge ${bspAnalysisData.bsp_analysis.compliance.data.restrictive_practice_documentation.status === 'compliant' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                      {bspAnalysisData.bsp_analysis.compliance.data.restrictive_practice_documentation.status}
                                    </span>
                                  </div>
                                  {bspAnalysisData.bsp_analysis.compliance.data.restrictive_practice_documentation.notes && (
                                    <p style={{ fontSize: '0.75rem', color: '#1f2937', marginTop: '8px' }}>{bspAnalysisData.bsp_analysis.compliance.data.restrictive_practice_documentation.notes}</p>
                                  )}
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.compliance.data.environment_safety_obligations && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '6px' }}>Environment Safety</p>
                                  <div className="flex items-center justify-between">
                                    <span className={`badge ${bspAnalysisData.bsp_analysis.compliance.data.environment_safety_obligations.status === 'compliant' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                      {bspAnalysisData.bsp_analysis.compliance.data.environment_safety_obligations.status}
                                    </span>
                                  </div>
                                  {bspAnalysisData.bsp_analysis.compliance.data.environment_safety_obligations.notes && (
                                    <p style={{ fontSize: '0.75rem', color: '#1f2937', marginTop: '8px' }}>{bspAnalysisData.bsp_analysis.compliance.data.environment_safety_obligations.notes}</p>
                                  )}
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.compliance.data.incident_documentation_standards && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '6px' }}>Incident Documentation</p>
                                  <div className="flex items-center justify-between">
                                    <span className={`badge ${bspAnalysisData.bsp_analysis.compliance.data.incident_documentation_standards.status === 'compliant' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                                      {bspAnalysisData.bsp_analysis.compliance.data.incident_documentation_standards.status}
                                    </span>
                                  </div>
                                  {bspAnalysisData.bsp_analysis.compliance.data.incident_documentation_standards.notes && (
                                    <p style={{ fontSize: '0.75rem', color: '#1f2937', marginTop: '8px' }}>{bspAnalysisData.bsp_analysis.compliance.data.incident_documentation_standards.notes}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        backgroundColor: '#eff6ff',
                        borderLeft: '4px solid #6b46c1',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '24px'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '24px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i className="ki-outline ki-abstract-26" style={{ fontSize: '24px', color: '#6b46c1' }}></i>
                            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                              AI-Powered BSP Analysis
                            </h4>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => selectedIncidentDetails && handleRunBspAnalysis(selectedIncidentDetails.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <i className="ki-outline ki-abstract-26 text-sm mr-1"></i>
                            Run BSP Analysis
                          </button>
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '60px 20px'
                        }}>
                          <i className="ki-outline ki-abstract-26" style={{
                            fontSize: '64px',
                            color: '#60a5fa',
                            marginBottom: '20px'
                          }}></i>
                          <p style={{
                            fontSize: '1rem',
                            color: '#3b82f6',
                            fontWeight: '500',
                            marginBottom: '8px',
                            textAlign: 'center'
                          }}>
                            Click "Run BSP Analysis" to analyse this incident
                          </p>
                          <p style={{ fontSize: '0.875rem', color: '#60a5fa', textAlign: 'center' }}>
                            Maps triggers, strategies, and risk factors against the participant's BSP
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SEPARATOR */}
                    {bspAnalysisData?.bsp_analysis && (
                      <div className="border-t-4 border-gray-300 my-6"></div>
                    )}

                    {/* Basic Information */}
                    <div style={{
                      backgroundColor: 'white',
                      borderLeft: '4px solid #6b46c1',
                      borderRadius: '8px',
                      padding: '24px',
                      marginBottom: '24px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                          Basic Information
                        </h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>Incident Number</p>
                          <p style={{ fontSize: '1rem', fontWeight: '600', color: '#111827' }}>{selectedIncidentDetails.incident_number}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>Type</p>
                          <p style={{ fontSize: '1rem', color: '#111827' }}>
                            {typeof selectedIncidentDetails.incident_type === 'object' && selectedIncidentDetails.incident_type?.name
                              ? selectedIncidentDetails.incident_type.name
                              : selectedIncidentDetails.incident_type || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>Severity</p>
                          <span className={`badge ${getSeverityBadgeClass(selectedIncidentDetails.severity)}`} style={{ fontSize: '0.875rem', padding: '4px 12px' }}>
                            {selectedIncidentDetails.severity}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>Status</p>
                          <span className={`badge ${getStatusBadgeClass(selectedIncidentDetails.status)}`} style={{ fontSize: '0.875rem', padding: '4px 12px' }}>
                            {selectedIncidentDetails.status || 'Draft'}
                          </span>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>Date & Time</p>
                          <p style={{ fontSize: '1rem', color: '#111827' }}>
                            {formatDateTime(selectedIncidentDetails.incident_date_time).date} at {formatDateTime(selectedIncidentDetails.incident_date_time).time}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>Location</p>
                          <p style={{ fontSize: '1rem', color: '#111827' }}>{selectedIncidentDetails.location || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* People Involved */}
                    <div style={{
                      backgroundColor: 'white',
                      borderLeft: '4px solid #6b46c1',
                      borderRadius: '8px',
                      padding: '24px',
                      marginBottom: '24px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                          People Involved
                        </h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>Participant</p>
                          <p style={{ fontSize: '1rem', color: '#111827' }}>{selectedIncidentDetails.participant_name || 'N/A'}</p>
                        </div>
                        {selectedIncidentDetails.customer && (
                          <div>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>Customer</p>
                            <p style={{ fontSize: '1rem', color: '#111827' }}>
                              {selectedIncidentDetails.customer.first_name} {selectedIncidentDetails.customer.last_name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* NDIS-Compliant Fields */}
                    {selectedIncidentDetails.what_happened && (
                      <div style={{
                        backgroundColor: 'white',
                        borderLeft: '4px solid #6b46c1',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '24px'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '20px'
                        }}>
                          <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                            NDIS-Compliant Fields
                          </h4>
                          <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
                            AI: 90%
                          </span>
                        </div>

                        <div className="space-y-4">
                          <div style={{
                            backgroundColor: '#f5f3ff',
                            borderRadius: '8px',
                            padding: '16px'
                          }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px' }}>
                              What Happened (Observable Facts)
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                              {selectedIncidentDetails.what_happened}
                            </p>
                          </div>

                          {selectedIncidentDetails.lead_up_triggers && (
                            <div style={{
                              backgroundColor: '#f5f3ff',
                              borderRadius: '8px',
                              padding: '16px'
                            }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px' }}>
                                Lead-Up & Triggers
                              </p>
                              <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                {selectedIncidentDetails.lead_up_triggers}
                              </p>
                            </div>
                          )}

                          {selectedIncidentDetails.during_incident && (
                            <div style={{
                              backgroundColor: '#f5f3ff',
                              borderRadius: '8px',
                              padding: '16px'
                            }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px' }}>
                                During the Incident (Observable Behaviours)
                              </p>
                              <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                {selectedIncidentDetails.during_incident}
                              </p>
                            </div>
                          )}

                          {selectedIncidentDetails.response_actions && (
                            <div style={{
                              backgroundColor: '#f5f3ff',
                              borderRadius: '8px',
                              padding: '16px'
                            }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px' }}>
                                Response Actions Taken
                              </p>
                              <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                {selectedIncidentDetails.response_actions}
                              </p>
                            </div>
                          )}

                          {selectedIncidentDetails.causes_contributing_factors && (
                            <div style={{
                              backgroundColor: '#f5f3ff',
                              borderRadius: '8px',
                              padding: '16px'
                            }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px' }}>
                                Causes & Contributing Factors
                              </p>
                              <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                {selectedIncidentDetails.causes_contributing_factors}
                              </p>
                            </div>
                          )}

                          {selectedIncidentDetails.description && (
                            <div style={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '16px'
                            }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>
                                Original Full Description
                              </p>
                              <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                                {selectedIncidentDetails.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Injury & Medical */}
                    <div style={{
                      backgroundColor: 'white',
                      borderLeft: '4px solid #dc2626',
                      borderRadius: '8px',
                      padding: '24px',
                      marginBottom: '24px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                          Injury & Medical
                        </h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div style={{
                          backgroundColor: '#fef2f2',
                          borderRadius: '8px',
                          padding: '16px'
                        }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
                            Injury Occurred
                          </p>
                          <p style={{ fontSize: '1.125rem', fontWeight: '600', color: selectedIncidentDetails.injury_occurred ? '#dc2626' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{selectedIncidentDetails.injury_occurred ? '✓' : '✗'}</span>
                            <span>{selectedIncidentDetails.injury_occurred ? 'Yes' : 'No'}</span>
                          </p>
                        </div>
                        <div style={{
                          backgroundColor: '#fef2f2',
                          borderRadius: '8px',
                          padding: '16px'
                        }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
                            Medical Treatment Required
                          </p>
                          <p style={{ fontSize: '1.125rem', fontWeight: '600', color: selectedIncidentDetails.medical_treatment_required ? '#dc2626' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{selectedIncidentDetails.medical_treatment_required ? '✓' : '✗'}</span>
                            <span>{selectedIncidentDetails.medical_treatment_required ? 'Yes' : 'No'}</span>
                          </p>
                        </div>
                      </div>
                      {selectedIncidentDetails.injury_details && (
                        <div style={{ marginTop: '16px' }}>
                          <div style={{
                            backgroundColor: '#fef2f2',
                            borderRadius: '8px',
                            padding: '16px'
                          }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
                              Injury Details
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                              {selectedIncidentDetails.injury_details}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Notifications & Reporting */}
                    <div style={{
                      backgroundColor: 'white',
                      borderLeft: '4px solid #10b981',
                      borderRadius: '8px',
                      padding: '24px',
                      marginBottom: '24px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                          Notifications & Reporting
                        </h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div style={{
                          backgroundColor: '#ecfdf5',
                          borderRadius: '8px',
                          padding: '16px'
                        }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981', marginBottom: '8px' }}>
                            NDIS Reportable
                          </p>
                          <p style={{ fontSize: '1.125rem', fontWeight: '600', color: selectedIncidentDetails.is_ndis_reportable ? '#10b981' : '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{selectedIncidentDetails.is_ndis_reportable ? '✓' : '✗'}</span>
                            <span>{selectedIncidentDetails.is_ndis_reportable ? 'Yes' : 'No'}</span>
                          </p>
                        </div>
                        <div style={{
                          backgroundColor: '#ecfdf5',
                          borderRadius: '8px',
                          padding: '16px'
                        }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981', marginBottom: '8px' }}>
                            Police Notified
                          </p>
                          <p style={{ fontSize: '1.125rem', fontWeight: '600', color: selectedIncidentDetails.police_notified ? '#10b981' : '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{selectedIncidentDetails.police_notified ? '✓' : '✗'}</span>
                            <span>{selectedIncidentDetails.police_notified ? 'Yes' : 'No'}</span>
                          </p>
                        </div>
                      </div>
                      {selectedIncidentDetails.notification_made_to && (
                        <div style={{ marginTop: '16px' }}>
                          <div style={{
                            backgroundColor: '#ecfdf5',
                            borderRadius: '8px',
                            padding: '16px'
                          }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981', marginBottom: '8px' }}>
                              Notification Made To
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5' }}>
                              {selectedIncidentDetails.notification_made_to}
                            </p>
                            {selectedIncidentDetails.notification_date_time && (
                              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                                on {formatDateTime(selectedIncidentDetails.notification_date_time).date} at {formatDateTime(selectedIncidentDetails.notification_date_time).time}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* BSP Analysis */}
                    {(selectedIncidentDetails.bsp_alignment_notes || selectedIncidentDetails.bsp_suggested_improvements) && (
                      <div className="card bg-gray-50">
                        <div className="card-body">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <i className="ki-outline ki-note-2 text-xl mr-2 text-info"></i>
                            BSP Analysis
                          </h4>
                          <div className="space-y-4">
                            {selectedIncidentDetails.bsp_alignment_notes && (
                              <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">BSP Alignment Notes</p>
                                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                                  {selectedIncidentDetails.bsp_alignment_notes}
                                </p>
                              </div>
                            )}
                            {selectedIncidentDetails.bsp_suggested_improvements && (
                              <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">BSP Suggested Improvements</p>
                                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                                  {selectedIncidentDetails.bsp_suggested_improvements}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Risk Assessment & Follow-up */}
                    <div style={{
                      backgroundColor: 'white',
                      borderLeft: '4px solid #dc2626',
                      borderRadius: '8px',
                      padding: '24px',
                      marginBottom: '24px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                          Risk Assessment & Follow-up
                        </h4>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div style={{
                          backgroundColor: '#fef2f2',
                          borderRadius: '8px',
                          padding: '16px'
                        }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
                            Recurrence Likelihood
                          </p>
                          <p style={{ fontSize: '1rem', color: '#1f2937' }}>
                            {selectedIncidentDetails.recurrence_likelihood || 'Not Assessed'}
                          </p>
                        </div>
                        <div style={{
                          backgroundColor: '#fef2f2',
                          borderRadius: '8px',
                          padding: '16px'
                        }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
                            Follow-up Required
                          </p>
                          <p style={{ fontSize: '1.125rem', fontWeight: '600', color: selectedIncidentDetails.follow_up_required ? '#dc2626' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>{selectedIncidentDetails.follow_up_required ? '✓' : '✗'}</span>
                            <span>{selectedIncidentDetails.follow_up_required ? 'Yes' : 'No'}</span>
                          </p>
                        </div>
                      </div>
                      {selectedIncidentDetails.follow_up_actions && selectedIncidentDetails.follow_up_required && (
                        <div style={{ marginTop: '16px' }}>
                          <div style={{
                            backgroundColor: '#fef2f2',
                            borderRadius: '8px',
                            padding: '16px'
                          }}>
                            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
                              Follow-up Actions
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                              {selectedIncidentDetails.follow_up_actions}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Information */}
                    {selectedIncidentDetails.additional_information && (
                      <div className="card bg-gray-50">
                        <div className="card-body">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <i className="ki-outline ki-notepad text-xl mr-2 text-gray-600"></i>
                            Additional Information
                          </h4>
                          <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                            {selectedIncidentDetails.additional_information}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* AI Generated Report */}
                    {selectedIncidentDetails.generated_report && (
                      <div className="card bg-primary-light/10 border-2 border-primary">
                        <div className="card-body">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <i className="ki-outline ki-ai text-xl mr-2 text-primary"></i>
                            AI-Generated Complete Report
                          </h4>
                          <div className="bg-white p-6 rounded-lg">
                            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                              {selectedIncidentDetails.generated_report}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-600">No incident details available.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={closeReportModal}
                  style={{ cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { IncidentsTimeline };