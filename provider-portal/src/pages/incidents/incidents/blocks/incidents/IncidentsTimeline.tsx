import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IIncidentsData } from './IncidentsData';
import { IncidentTimelineCard } from './IncidentTimelineCard';
import { fetchAllIncidents, deleteIncident, fetchSingleIncident, fetchIncidentCustomers, fetchIncidentStatistics, fetchBspAnalysis, exportIncidentPdf, getSingleParticipant } from '@/services/api';
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
  const [totalCount, setTotalCount] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedIncidentDetails, setSelectedIncidentDetails] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [bspAnalysisData, setBspAnalysisData] = useState<any>(null);
  const [loadingBspAnalysis, setLoadingBspAnalysis] = useState(false);
  const [selectedIncidents, setSelectedIncidents] = useState<Set<number>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'details' | 'bsp' | 'participant'>('details');
  const [participantDetails, setParticipantDetails] = useState<any>(null);
  const [loadingParticipant, setLoadingParticipant] = useState(false);

  // Collapsible section states - all closed by default
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    basicInfo: false,
    whatHappened: true,
    leadUpTriggers: true,
    duringIncident: true,
    responseActions: true,
    causesFactors: true
  });

  const ITEMS_PER_PAGE = 10;

  // Filter states (for UI - not applied until user clicks Apply)
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

  // Applied filters (used in API calls and trigger data reload)
  const [appliedFilters, setAppliedFilters] = useState<{
    participant: string;
    severity: string;
    status: string;
    restrictive: string;
    dateFrom: string;
    dateTo: string;
  }>({
    participant: 'all',
    severity: 'all',
    status: 'all',
    restrictive: 'all',
    dateFrom: '',
    dateTo: ''
  });

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

  // Reset to page 1 when applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  // Load incidents when page or applied filters change
  useEffect(() => {
    loadIncidents();
  }, [currentPage, appliedFilters]);

  // Load statistics when applied filters change
  useEffect(() => {
    loadStatisticsWithFilters();
  }, [appliedFilters]);

  const loadIncidents = async () => {
    try {
      setLoading(true);

      // Build filter object for backend using applied filters
      const apiFilters: any = {
        per_page: ITEMS_PER_PAGE,
        page: currentPage
      };

      // Add custom filters from applied filters state
      if (appliedFilters.participant !== 'all') {
        apiFilters.participant_name = appliedFilters.participant;
      }
      if (appliedFilters.severity !== 'all') {
        apiFilters.severity = appliedFilters.severity;
      }
      if (appliedFilters.status !== 'all') {
        apiFilters.status = appliedFilters.status;
      }
      if (appliedFilters.restrictive !== 'all') {
        apiFilters.restrictive_practice = appliedFilters.restrictive === 'yes';
      }
      if (appliedFilters.dateFrom) {
        apiFilters.date_from = appliedFilters.dateFrom;
      }
      if (appliedFilters.dateTo) {
        apiFilters.date_to = appliedFilters.dateTo;
      }

      // Fetch data from backend with filters
      const data = await fetchAllIncidents(apiFilters);
      console.log('Incidents API response:', data);

      // Handle different possible response formats
      let incidentsData = [];
      let total = 0;

      if (Array.isArray(data)) {
        incidentsData = data;
        total = data.length;
      } else if (data?.data && Array.isArray(data.data)) {
        incidentsData = data.data;
        total = data.total || data.data.length;
      } else if (data?.incidents) {
        incidentsData = data.incidents;
        total = data.total || incidentsData.length;
      }

      console.log('Processed incidents data:', incidentsData);

      // Store all incidents for export
      setAllIncidentsData(incidentsData);

      // Replace incidents for the current page (not append)
      setIncidents(incidentsData);
      setTotalCount(total);
    } catch (error) {
      console.error('Error loading incidents:', error);
      toast.error('Failed to load incidents. Please try again.');
      setIncidents([]);
      setTotalCount(0);
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

  const fetchParticipantDetails = async (participantId: string | number) => {
    setLoadingParticipant(true);
    try {
      const response = await getSingleParticipant(String(participantId));
      setParticipantDetails(response.participant || response);
    } catch (error) {
      console.error('Error fetching participant details:', error);
      setParticipantDetails(null);
    } finally {
      setLoadingParticipant(false);
    }
  };

  const handleViewDetails = async (incidentId: number) => {
    setShowReportModal(true);
    setLoadingReport(true);

    try {
      // Fetch incident details
      const response = await fetchSingleIncident(incidentId);
      setSelectedIncidentDetails(response);
      setLoadingReport(false);

      // Fetch participant details if participant_id exists
      if (response.participant_id || response.customer?.id) {
        const participantId = response.participant_id || response.customer?.id;
        fetchParticipantDetails(participantId);
      }
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

  const toggleIncidentSelection = (id: number) => {
    setSelectedIncidents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIncidents.size === incidents.length) {
      // Deselect all
      setSelectedIncidents(new Set());
    } else {
      // Select all on current page
      setSelectedIncidents(new Set(incidents.map(i => i.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIncidents.size === 0) return;

    setIsDeletingBulk(true);
    try {
      // Delete incidents one by one
      const deletePromises = Array.from(selectedIncidents).map(id => deleteIncident(id));
      await Promise.all(deletePromises);

      toast.success(`Successfully deleted ${selectedIncidents.size} incident${selectedIncidents.size > 1 ? 's' : ''}`);

      // Clear selection and close modal
      setSelectedIncidents(new Set());
      setIsBulkDeleteModalOpen(false);

      // Refresh the list
      setCurrentPage(1);
      loadIncidents();
    } catch (error) {
      console.error('Error deleting incidents:', error);
      toast.error('Failed to delete some incidents. Please try again.');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedIncidentDetails(null);
    setBspAnalysisData(null);
    setParticipantDetails(null);
    setActiveModalTab('details'); // Reset to details tab when closing
    // Reset collapsed sections
    setCollapsedSections({
      basicInfo: false,
      whatHappened: true,
      leadUpTriggers: true,
      duringIncident: true,
      responseActions: true,
      causesFactors: true
    });
  };

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
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

      if (appliedFilters.participant !== 'all') {
        filters.participant_name = appliedFilters.participant;
      }
      if (appliedFilters.severity !== 'all') {
        filters.severity = appliedFilters.severity;
      }
      if (appliedFilters.status !== 'all') {
        filters.status = appliedFilters.status;
      }
      if (appliedFilters.restrictive !== 'all') {
        filters.restrictive_practice = appliedFilters.restrictive === 'yes';
      }
      if (appliedFilters.dateFrom) {
        filters.date_from = appliedFilters.dateFrom;
      }
      if (appliedFilters.dateTo) {
        filters.date_to = appliedFilters.dateTo;
      }

      const data = await fetchIncidentStatistics(filters);
      setStatistics(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleApplyFilters = () => {
    // Update applied filters which will trigger useEffect to reload both data and stats
    setAppliedFilters({
      participant: selectedParticipant,
      severity: selectedSeverity,
      status: selectedStatus,
      restrictive: selectedRestrictive,
      dateFrom: dateFrom,
      dateTo: dateTo
    });
  };

  const handleClearFilters = async () => {
    // Reset UI filter states
    setSelectedParticipant('all');
    setSelectedSeverity('all');
    setSelectedStatus('all');
    setSelectedRestrictive('all');
    setDateFrom('');
    setDateTo('');

    // Reset applied filters (this will trigger useEffect to reload data)
    setAppliedFilters({
      participant: 'all',
      severity: 'all',
      status: 'all',
      restrictive: 'all',
      dateFrom: '',
      dateTo: ''
    });

    // Load statistics without filters
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

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = selectedParticipant !== 'all' || selectedSeverity !== 'all' ||
    selectedStatus !== 'all' || selectedRestrictive !== 'all' || dateFrom || dateTo;

  return (
    <div className="card">
      {/* Toolbar Header */}
      <div className="card-header flex-wrap px-5 py-5 border-b-0">
        <h3 className="card-title">
          Incidents
          {selectedIncidents.size > 0 && (
            <span className="badge badge-sm badge-primary ms-2">{selectedIncidents.size} selected</span>
          )}
        </h3>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Bulk Actions - shown when incidents are selected */}
          {selectedIncidents.size > 0 && (
            <>
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="btn btn-sm btn-danger flex items-center gap-1.5"
              >
                <KeenIcon icon="trash" className="text-base" />
                <span>Delete ({selectedIncidents.size})</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIncidents(new Set())}
                className="btn btn-sm btn-light flex items-center gap-1.5"
              >
                <KeenIcon icon="cross" className="text-base" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
          )}

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
        {loading ? (
          <div className="space-y-8">
            {/* Loading Skeleton */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="ml-16 space-y-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && incidents.length === 0 ? (
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
          <>
            {/* Select All Checkbox */}
            {incidents.length > 0 && (
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={selectedIncidents.size === incidents.length && incidents.length > 0}
                  onChange={handleSelectAll}
                  className="checkbox checkbox-sm"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer" onClick={handleSelectAll}>
                  Select All on This Page ({incidents.length})
                </label>
              </div>
            )}

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
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-white shadow-sm flex-shrink-0">
                    <div className="text-center">
                      <div className="text-[10px] font-medium uppercase opacity-90">{month}</div>
                      <div className="text-lg font-bold leading-none">{day}</div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {dayOfWeek}, {year}
                    </h3>
                  </div>
                </div>

                {/* Timeline Line */}
                <div className="absolute left-6 top-14 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>

                {/* Incidents for this date */}
                <div className="space-y-0 ml-16">
                  {groupedIncidents[dateKey].map((incident) => (
                    <IncidentTimelineCard
                      key={incident.id}
                      incident={incident}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEdit}
                      onDelete={handleModalOpen}
                      isSelected={selectedIncidents.has(incident.id)}
                      onToggleSelection={toggleIncidentSelection}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-8 pb-4 border-t border-gray-200 dark:border-gray-700 mt-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} incidents
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-sm btn-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <KeenIcon icon="left" className="text-sm" />
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const maxPagesToShow = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

                    if (endPage - startPage < maxPagesToShow - 1) {
                      startPage = Math.max(1, endPage - maxPagesToShow + 1);
                    }

                    // First page
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => handlePageChange(1)}
                          className="btn btn-sm btn-light min-w-[2.5rem]"
                        >
                          1
                        </button>
                      );
                      if (startPage > 2) {
                        pages.push(<span key="ellipsis1" className="px-2 text-gray-400">...</span>);
                      }
                    }

                    // Page numbers
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`btn btn-sm min-w-[2.5rem] ${
                            currentPage === i
                              ? 'btn-primary'
                              : 'btn-light'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }

                    // Last page
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(<span key="ellipsis2" className="px-2 text-gray-400">...</span>);
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          className="btn btn-sm btn-light min-w-[2.5rem]"
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-sm btn-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <KeenIcon icon="right" className="text-sm" />
                </button>
              </div>
            </div>
          )}
          </div>
          </>
        )}
      </div>

      {/* Single Delete Confirmation Modal */}
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

      {/* Bulk Delete Confirmation Modal */}
      <ModalDeleteConfirmation
        open={isBulkDeleteModalOpen}
        onOpenChange={() => setIsBulkDeleteModalOpen(false)}
        onDeleteConfirm={handleBulkDelete}
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
              /* Animation Keyframes */
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
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }

              /* ============================================
                 CENTRALIZED MODAL WIDTH MANAGEMENT
                 ============================================
                 This section handles all width-related styling
                 for the incident details modal to prevent
                 content shrinking issues across all tabs.

                 ROOT CAUSE: Flex containers cause children to shrink
                 SOLUTION: Explicitly set min-width: 0 and width: 100%
                 ============================================ */

              /* Fix flex shrinking in modal */
              .modal-content {
                min-width: 0 !important;
              }

              .modal-body {
                min-width: 0 !important;
                flex-shrink: 0 !important;
              }

              /* Tab Content Wrapper - Applied to all tab containers */
              .incident-modal-tab-content {
                animation: fadeIn 0.3s ease-in-out;
                padding: 0;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                box-sizing: border-box;
                flex-shrink: 0 !important;
              }

              /* All direct children of tab content inherit full width */
              .incident-modal-tab-content > * {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                box-sizing: border-box;
              }

              /* Ensure all modal body content takes full width */
              .modal-body > * {
                width: 100%;
                max-width: 100%;
                min-width: 0;
                box-sizing: border-box;
                flex-shrink: 0;
              }
            `}
          </style>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '1400px',
              width: '95%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, width: '100%' }}>
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
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      if (selectedIncidentDetails) {
                        navigate(`/incidents/${selectedIncidentDetails.id}/edit`);
                      }
                    }}
                    disabled={!selectedIncidentDetails}
                    style={{ cursor: 'pointer' }}
                  >
                    <i className="ki-outline ki-notepad-edit text-base mr-1"></i>
                    Edit
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

              {/* Tab Navigation - Only show when not loading */}
              {!loadingReport && !loadingBspAnalysis && !loadingParticipant && selectedIncidentDetails && (
                <div style={{ borderBottom: '1px solid #e5e7eb', padding: '0 24px', backgroundColor: '#f9fafb' }}>
                  <div style={{ display: 'flex', gap: '32px' }}>
                    <button
                      onClick={() => setActiveModalTab('details')}
                      style={{
                        padding: '16px 4px',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '0.875rem',
                        fontWeight: activeModalTab === 'details' ? '600' : '500',
                        color: activeModalTab === 'details' ? '#6b46c1' : '#6b7280',
                        borderBottom: activeModalTab === 'details' ? '2px solid #6b46c1' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        top: '1px'
                      }}
                    >
                      Incident Details
                    </button>
                    <button
                      onClick={() => setActiveModalTab('bsp')}
                      style={{
                        padding: '16px 4px',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '0.875rem',
                        fontWeight: activeModalTab === 'bsp' ? '600' : '500',
                        color: activeModalTab === 'bsp' ? '#6b46c1' : '#6b7280',
                        borderBottom: activeModalTab === 'bsp' ? '2px solid #6b46c1' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        top: '1px'
                      }}
                    >
                      BSP Analysis
                    </button>
                    {/* Participant Info Tab */}
                    <button
                      onClick={() => setActiveModalTab('participant')}
                      style={{
                        padding: '16px 4px',
                        border: 'none',
                        background: 'transparent',
                        fontSize: '0.875rem',
                        fontWeight: activeModalTab === 'participant' ? '600' : '500',
                        color: activeModalTab === 'participant' ? '#6b46c1' : '#6b7280',
                        borderBottom: activeModalTab === 'participant' ? '2px solid #6b46c1' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        top: '1px'
                      }}
                    >
                      Participant Info
                    </button>
                  </div>
                </div>
              )}

              {/* Modal Body */}
              <div className="modal-body" style={{
                flex: '1 1 auto',
                flexShrink: 0,
                overflowY: 'auto',
                padding: '24px',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box'
              }}>
                {(loadingReport || loadingBspAnalysis || loadingParticipant) ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    padding: '40px 20px',
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
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
                        borderTop: '4px solid #6b46c1',
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
                        borderBottom: '4px solid #6b46c1',
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
                          backgroundColor: '#6b46c1',
                          animation: 'bounce 1.4s ease-in-out infinite'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#6b46c1',
                          animation: 'bounce 1.4s ease-in-out 0.2s infinite'
                        }}></div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#6b46c1',
                          animation: 'bounce 1.4s ease-in-out 0.4s infinite'
                        }}></div>
                      </div>
                    </div>
                  </div>
                ) : selectedIncidentDetails ? (
                  <div style={{
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}>
                    {/* BSP ANALYSIS TAB */}
                    {activeModalTab === 'bsp' && (
                      <div className="incident-modal-tab-content">
                        {/* BSP ANALYSIS SECTION */}
                        {bspAnalysisData?.bsp_analysis ? (
                      <div style={{
                        backgroundColor: 'white',
                        borderLeft: '4px solid #6b46c1',
                        borderRadius: '8px',
                        padding: '24px',
                        marginBottom: '24px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                          <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#6b46c1', margin: 0 }}>
                            BSP Analysis & Recommendations
                          </h4>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {/* BSP Gaps Detected */}
                        {bspAnalysisData.bsp_analysis?.gaps_detected?.count > 0 && (
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                          }}>
                            <div
                              onClick={() => toggleSection('bspGapsDetected')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                backgroundColor: '#f5f3ff',
                                transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="ki-outline ki-information-2" style={{ fontSize: '18px', color: '#6b46c1' }}></i>
                                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                                  BSP Gaps Detected
                                </h5>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="badge badge-danger" style={{ fontSize: '0.6875rem', padding: '4px 10px', fontWeight: '600' }}>
                                  {bspAnalysisData.bsp_analysis.gaps_detected.count} Critical
                                </span>
                                <i className={`ki-outline ${collapsedSections.bspGapsDetected ? 'ki-down' : 'ki-up'}`} style={{ color: '#6b46c1' }}></i>
                              </div>
                            </div>
                            {!collapsedSections.bspGapsDetected && (
                              <div style={{ padding: '16px', backgroundColor: '#f5f3ff' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {(bspAnalysisData.bsp_analysis.gaps_detected.data || []).map((gap: any, idx: number) => (
                                    <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #ef4444', border: '1px solid #fee2e2', display: 'flex', alignItems: 'start', gap: '10px' }}>
                                      <i className="ki-outline ki-cross-circle" style={{ fontSize: '16px', color: '#ef4444', marginTop: '2px', flexShrink: 0 }}></i>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5', margin: 0 }}>{gap.description || gap}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}



                        {/* Draft BSP Update */}
                        {bspAnalysisData.bsp_analysis.draft_update?.data && (
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                          }}>
                            <div
                              onClick={() => toggleSection('bspDraftUpdate')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                backgroundColor: '#f5f3ff',
                                transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="ki-outline ki-document" style={{ fontSize: '18px', color: '#6b46c1' }}></i>
                                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                                  Draft BSP Update
                                </h5>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="badge badge-primary" style={{ fontSize: '0.6875rem', padding: '4px 10px', fontWeight: '600' }}>
                                  Draft
                                </span>
                                <i className={`ki-outline ${collapsedSections.bspDraftUpdate ? 'ki-down' : 'ki-up'}`}></i>
                              </div>
                            </div>
                            {!collapsedSections.bspDraftUpdate && (
                              <div style={{ padding: '16px', backgroundColor: '#f5f3ff' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {bspAnalysisData.bsp_analysis.draft_update.data.context_of_behaviour && (
                                    <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
                                      <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>CONTEXT OF BEHAVIOUR</p>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5' }}>{bspAnalysisData.bsp_analysis.draft_update.data.context_of_behaviour}</p>
                                    </div>
                                  )}
                                  {bspAnalysisData.bsp_analysis.draft_update.data.environmental_considerations && (
                                    <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
                                      <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>ENVIRONMENTAL CONSIDERATIONS</p>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5' }}>{bspAnalysisData.bsp_analysis.draft_update.data.environmental_considerations}</p>
                                    </div>
                                  )}
                                  {bspAnalysisData.bsp_analysis.draft_update.data.trauma_informed_adjustments && (
                                    <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
                                      <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>TRAUMA-INFORMED ADJUSTMENTS</p>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5' }}>{bspAnalysisData.bsp_analysis.draft_update.data.trauma_informed_adjustments}</p>
                                    </div>
                                  )}
                                  {bspAnalysisData.bsp_analysis.draft_update.data.safety_recommendations && (
                                    <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
                                      <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>SAFETY RECOMMENDATIONS</p>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5' }}>{bspAnalysisData.bsp_analysis.draft_update.data.safety_recommendations}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Trigger Alignment */}
                        {bspAnalysisData.bsp_analysis.trigger_alignment?.data && (
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                          }}>
                            <div
                              onClick={() => toggleSection('bspTriggerAlignment')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                backgroundColor: '#f5f3ff',
                                transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="ki-outline ki-people" style={{ fontSize: '18px', color: '#6b46c1' }}></i>
                                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                                  Trigger Alignment
                                </h5>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="badge badge-info" style={{ fontSize: '0.6875rem', padding: '4px 10px', fontWeight: '600' }}>
                                  {bspAnalysisData.bsp_analysis.trigger_alignment.data.confidence_level || 'N/A'} Confidence
                                </span>
                                <i className={`ki-outline ${collapsedSections.bspTriggerAlignment ? 'ki-down' : 'ki-up'}`}></i>
                              </div>
                            </div>
                            {!collapsedSections.bspTriggerAlignment && (
                              <div style={{ padding: '16px', backgroundColor: '#f5f3ff' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {bspAnalysisData.bsp_analysis.trigger_alignment.data.alignment_explanation && (
                                    <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5' }}>{bspAnalysisData.bsp_analysis.trigger_alignment.data.alignment_explanation}</p>
                                    </div>
                                  )}
                                  {bspAnalysisData.bsp_analysis.trigger_alignment.data.matched_triggers?.length > 0 && (
                                    <div>
                                      <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Matched Triggers</p>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {(bspAnalysisData.bsp_analysis.trigger_alignment.data.matched_triggers || []).map((trigger: string, idx: number) => (
                                          <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #6b46c1', border: '1px solid #e9d5ff' }}>
                                            <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5' }}>{trigger}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Strategy Assessment */}
                        {bspAnalysisData.bsp_analysis.strategy_assessment?.data && (
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                          }}>
                            <div
                              onClick={() => toggleSection('bspStrategyAssessment')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                backgroundColor: '#f5f3ff',
                                transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="ki-outline ki-graph-up" style={{ fontSize: '18px', color: '#6b46c1' }}></i>
                                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                                  {bspAnalysisData.bsp_analysis.strategy_assessment.title}
                                </h5>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="badge" style={{ fontSize: '0.6875rem', padding: '4px 10px', fontWeight: '600', backgroundColor: '#6b46c1', color: 'white' }}>
                                  Action Required
                                </span>
                                <i className={`ki-outline ${collapsedSections.bspStrategyAssessment ? 'ki-down' : 'ki-up'}`} style={{ color: '#6b46c1' }}></i>
                              </div>
                            </div>
                            {!collapsedSections.bspStrategyAssessment && (
                              <div style={{ padding: '16px', backgroundColor: '#f5f3ff' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {bspAnalysisData.bsp_analysis.strategy_assessment.data.staff_response_evaluation && (
                                    <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
                                      <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Staff Response Evaluation</p>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5' }}>{bspAnalysisData.bsp_analysis.strategy_assessment.data.staff_response_evaluation}</p>
                                    </div>
                                  )}
                                  {bspAnalysisData.bsp_analysis.strategy_assessment.data.missing_proactive_strategies?.length > 0 && (
                                    <div>
                                      <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Missing Proactive Strategies</p>
                                      {(bspAnalysisData.bsp_analysis.strategy_assessment.data.missing_proactive_strategies || []).map((strategy: string, idx: number) => (
                                        <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #6b46c1', marginBottom: '8px', border: '1px solid #e9d5ff' }}>
                                          <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5' }}>{strategy}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {bspAnalysisData.bsp_analysis.strategy_assessment.data.missed_reactive_strategies?.length > 0 && (
                                    <div>
                                      <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Missed Reactive Strategies</p>
                                      {(bspAnalysisData.bsp_analysis.strategy_assessment.data.missed_reactive_strategies || []).map((strategy: string, idx: number) => (
                                        <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #6b46c1', marginBottom: '8px', border: '1px solid #e9d5ff' }}>
                                          <p style={{ fontSize: '0.875rem', color: '#1f2937', lineHeight: '1.5' }}>{strategy}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Identified Gaps Summary */}
                        {bspAnalysisData.bsp_analysis?.gaps_summary?.count > 0 && (
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                          }}>
                            <div
                              onClick={() => toggleSection('bspGapsSummary')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                backgroundColor: '#f5f3ff',
                                transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="ki-outline ki-category" style={{ fontSize: '18px', color: '#6b46c1' }}></i>
                                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                                  {bspAnalysisData.bsp_analysis.gaps_summary.title}
                                </h5>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="badge" style={{ fontSize: '0.6875rem', padding: '4px 10px', fontWeight: '600', backgroundColor: '#6b46c1', color: 'white' }}>
                                  {bspAnalysisData.bsp_analysis.gaps_summary.count} Issues
                                </span>
                                <i className={`ki-outline ${collapsedSections.bspGapsSummary ? 'ki-down' : 'ki-up'}`} style={{ color: '#6b46c1' }}></i>
                              </div>
                            </div>
                            {!collapsedSections.bspGapsSummary && (
                              <div style={{ padding: '16px', backgroundColor: '#f5f3ff' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {(bspAnalysisData.bsp_analysis.gaps_summary.data || []).map((gap: any, idx: number) => (
                                    <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #6b46c1', border: '1px solid #e9d5ff' }}>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{typeof gap === 'string' ? gap : gap.description || gap.gap || JSON.stringify(gap)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* BSP Internal Inconsistencies */}
                        {bspAnalysisData.bsp_analysis?.inconsistencies?.count > 0 && (
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                          }}>
                            <div
                              onClick={() => toggleSection('bspInconsistencies')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                backgroundColor: '#f5f3ff',
                                transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="ki-outline ki-file" style={{ fontSize: '18px', color: '#6b46c1' }}></i>
                                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                                  {bspAnalysisData.bsp_analysis.inconsistencies.title}
                                </h5>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="badge" style={{ fontSize: '0.6875rem', padding: '4px 10px', fontWeight: '600', backgroundColor: '#6b46c1', color: 'white' }}>
                                  {bspAnalysisData.bsp_analysis.inconsistencies.count} Found
                                </span>
                                <i className={`ki-outline ${collapsedSections.bspInconsistencies ? 'ki-down' : 'ki-up'}`} style={{ color: '#6b46c1' }}></i>
                              </div>
                            </div>
                            {!collapsedSections.bspInconsistencies && (
                              <div style={{ padding: '16px', backgroundColor: '#f5f3ff' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {(bspAnalysisData.bsp_analysis.inconsistencies.data || []).map((inconsistency: any, idx: number) => (
                                    <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #6b46c1', border: '1px solid #e9d5ff' }}>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{typeof inconsistency === 'string' ? inconsistency : inconsistency.description || inconsistency.inconsistency || JSON.stringify(inconsistency)}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Potentially Outdated Strategies */}
                        {bspAnalysisData.bsp_analysis?.outdated_strategies?.count > 0 && (
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                          }}>
                            <div
                              onClick={() => toggleSection('bspOutdatedStrategies')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                backgroundColor: '#f5f3ff',
                                transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="ki-outline ki-technology-2" style={{ fontSize: '18px', color: '#6b46c1' }}></i>
                                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                                  {bspAnalysisData.bsp_analysis.outdated_strategies.title}
                                </h5>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="badge" style={{ fontSize: '0.6875rem', padding: '4px 10px', fontWeight: '600', backgroundColor: '#6b46c1', color: 'white' }}>
                                  {bspAnalysisData.bsp_analysis.outdated_strategies.count} Strategies
                                </span>
                                <i className={`ki-outline ${collapsedSections.bspOutdatedStrategies ? 'ki-down' : 'ki-up'}`} style={{ color: '#6b46c1' }}></i>
                              </div>
                            </div>
                            {!collapsedSections.bspOutdatedStrategies && (
                              <div style={{ padding: '16px', backgroundColor: '#f5f3ff' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {(bspAnalysisData.bsp_analysis.outdated_strategies.data || []).map((item: any, idx: number) => (
                                    <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
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
                          </div>
                        )}

                        {/* Skill Building Opportunities */}
                        {bspAnalysisData.bsp_analysis?.skill_building?.count > 0 && (
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                          }}>
                            <div
                              onClick={() => toggleSection('bspSkillBuilding')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                backgroundColor: '#f5f3ff',
                                transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="ki-outline ki-compass" style={{ fontSize: '18px', color: '#6b46c1' }}></i>
                                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                                  {bspAnalysisData.bsp_analysis.skill_building.title}
                                </h5>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="badge" style={{ fontSize: '0.6875rem', padding: '4px 10px', fontWeight: '600', backgroundColor: '#6b46c1', color: 'white' }}>
                                  {bspAnalysisData.bsp_analysis.skill_building.count} Items
                                </span>
                                <i className={`ki-outline ${collapsedSections.bspSkillBuilding ? 'ki-down' : 'ki-up'}`} style={{ color: '#6b46c1' }}></i>
                              </div>
                            </div>
                            {!collapsedSections.bspSkillBuilding && (
                              <div style={{ padding: '16px', backgroundColor: '#f5f3ff' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {(bspAnalysisData.bsp_analysis.skill_building.data || []).map((item: any, idx: number) => (
                                    <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
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
                          </div>
                        )}

                        {/* Risk Insights */}
                        {bspAnalysisData.bsp_analysis.risk_insights?.data && (
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                          }}>
                            <div
                              onClick={() => toggleSection('bspRiskInsights')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                backgroundColor: '#f5f3ff',
                                transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="ki-outline ki-shield-tick" style={{ fontSize: '18px', color: '#6b46c1' }}></i>
                                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                                  {bspAnalysisData.bsp_analysis.risk_insights.title}
                                </h5>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className={`badge ${
                                  bspAnalysisData.bsp_analysis.risk_insights.data.recurrence_risk === 'high' ? 'badge-danger' :
                                  bspAnalysisData.bsp_analysis.risk_insights.data.recurrence_risk === 'medium' ? 'badge-warning' : 'badge-success'
                                }`} style={{ fontSize: '0.6875rem', padding: '4px 10px', fontWeight: '600' }}>
                                  {bspAnalysisData.bsp_analysis.risk_insights.data.recurrence_risk || 'N/A'} Risk
                                </span>
                                <i className={`ki-outline ${collapsedSections.bspRiskInsights ? 'ki-down' : 'ki-up'}`} style={{ color: '#6b46c1' }}></i>
                              </div>
                            </div>
                            {!collapsedSections.bspRiskInsights && (
                              <div style={{ padding: '16px', backgroundColor: '#f5f3ff' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {bspAnalysisData.bsp_analysis.risk_insights.data.risk_mitigation_summary && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '6px' }}>Risk Mitigation Summary</p>
                                  <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{bspAnalysisData.bsp_analysis.risk_insights.data.risk_mitigation_summary}</p>
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.risk_insights.data.environmental_risk_factors?.length > 0 && (
                                <div>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px' }}>Environmental Risk Factors</p>
                                  {(bspAnalysisData.bsp_analysis.risk_insights.data.environmental_risk_factors || []).map((factor: string, idx: number) => (
                                    <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #6b46c1', border: '1px solid #e9d5ff', marginBottom: '8px' }}>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{factor}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {bspAnalysisData.bsp_analysis.risk_insights.data.behavioural_risk_factors?.length > 0 && (
                                <div>
                                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b46c1', marginBottom: '8px' }}>Behavioural Risk Factors</p>
                                  {(bspAnalysisData.bsp_analysis.risk_insights.data.behavioural_risk_factors || []).map((factor: string, idx: number) => (
                                    <div key={idx} style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', borderLeft: '3px solid #6b46c1', border: '1px solid #e9d5ff', marginBottom: '8px' }}>
                                      <p style={{ fontSize: '0.875rem', color: '#1f2937' }}>{factor}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* NDIS Compliance Assessment */}
                        {bspAnalysisData.bsp_analysis.compliance?.data && (
                          <div style={{
                            backgroundColor: 'white',
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            marginBottom: '8px'
                          }}>
                            <div
                              onClick={() => toggleSection('bspCompliance')}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '14px 16px',
                                cursor: 'pointer',
                                backgroundColor: '#f5f3ff',
                                transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="ki-outline ki-shield-search" style={{ fontSize: '18px', color: '#6b46c1' }}></i>
                                <h5 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0 }}>
                                  {bspAnalysisData.bsp_analysis.compliance.title}
                                </h5>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className={`badge ${
                                  bspAnalysisData.bsp_analysis.compliance.data.compliance_level === 'compliant' ? 'badge-success' :
                                  bspAnalysisData.bsp_analysis.compliance.data.compliance_level === 'partial' ? 'badge-warning' : 'badge-danger'
                                }`} style={{ fontSize: '0.6875rem', padding: '4px 10px', fontWeight: '600' }}>
                                  {bspAnalysisData.bsp_analysis.compliance.data.compliance_level || 'N/A'}
                                </span>
                                <i className={`ki-outline ${collapsedSections.bspCompliance ? 'ki-down' : 'ki-up'}`} style={{ color: '#6b46c1' }}></i>
                              </div>
                            </div>
                            {!collapsedSections.bspCompliance && (
                              <div style={{ padding: '16px', backgroundColor: '#f5f3ff' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                              {bspAnalysisData.bsp_analysis.compliance.data.person_centred_practice && (
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
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
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
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
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
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
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
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
                                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
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
                        )}
                        </div>
                      </div>
                    ) : (
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <i className="ki-outline ki-abstract-26" style={{ fontSize: '24px', color: '#6b46c1' }}></i>
                            <h4 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                              AI-Powered BSP Analysis
                            </h4>
                          </div>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => selectedIncidentDetails && handleRunBspAnalysis(selectedIncidentDetails.id)}
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
                          padding: '60px 20px',
                          minHeight: '300px'
                        }}>
                          <i className="ki-outline ki-abstract-26" style={{
                            fontSize: '64px',
                            color: '#9333ea',
                            marginBottom: '20px'
                          }}></i>
                          <p style={{
                            fontSize: '1rem',
                            color: '#6b46c1',
                            fontWeight: '500',
                            marginBottom: '8px',
                            textAlign: 'center'
                          }}>
                            Click "Run BSP Analysis" to analyse this incident
                          </p>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#9333ea',
                            textAlign: 'center'
                          }}>
                            Maps triggers, strategies, and risk factors against the participant's BSP
                          </p>
                        </div>
                      </div>
                    )}
                      </div>
                    )}

                    {/* INCIDENT DETAILS TAB */}
                    {activeModalTab === 'details' && (
                      <div className="incident-modal-tab-content">
                    {/* Core Incident Information */}
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '16px',
                      border: '1px solid #e9d5ff'
                    }}>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          marginBottom: '4px',
                          backgroundColor: '#f5f3ff',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          borderLeft: '3px solid #6b46c1'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="ki-outline ki-information-2" style={{ fontSize: '16px', color: '#6b46c1' }}></i>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                              Core Incident Information
                            </h4>
                          </div>
                          <span className={`badge ${getStatusBadgeClass(selectedIncidentDetails.status)}`} style={{ fontSize: '0.6875rem', padding: '4px 10px' }}>
                            {selectedIncidentDetails.status || 'Draft'}
                          </span>
                        </div>
                      </div>

                      {/* Two Column Layout */}
                      <div className="grid md:grid-cols-2 gap-3" style={{ marginBottom: '14px' }}>
                        {/* Incident Profile */}
                        <div style={{
                          backgroundColor: '#f5f3ff',
                          borderRadius: '8px',
                          padding: '14px',
                          border: '1px solid #e9d5ff'
                        }}>
                          <h5 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            Incident Profile
                          </h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <i className="ki-outline ki-calendar" style={{ fontSize: '14px', color: '#6b46c1', marginTop: '2px' }}></i>
                              <div>
                                <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Date & Time</p>
                                <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                                  {formatDateTime(selectedIncidentDetails.incident_date_time).date}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                                  {formatDateTime(selectedIncidentDetails.incident_date_time).time}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <i className="ki-outline ki-geolocation" style={{ fontSize: '14px', color: '#6b46c1', marginTop: '2px' }}></i>
                              <div>
                                <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Location</p>
                                <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                                  {selectedIncidentDetails.location || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <i className="ki-outline ki-category" style={{ fontSize: '14px', color: '#6b46c1', marginTop: '2px' }}></i>
                              <div>
                                <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Incident Type</p>
                                <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                                  {typeof selectedIncidentDetails.incident_type === 'object' && selectedIncidentDetails.incident_type?.name
                                    ? selectedIncidentDetails.incident_type.name
                                    : selectedIncidentDetails.incident_type || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <i className="ki-outline ki-shield-tick" style={{ fontSize: '14px', color: '#6b46c1', marginTop: '2px' }}></i>
                              <div>
                                <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Severity</p>
                                <span className={`badge ${getSeverityBadgeClass(selectedIncidentDetails.severity)}`} style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                                  {selectedIncidentDetails.severity}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Basic Info & Classification */}
                        <div style={{
                          backgroundColor: '#f5f3ff',
                          border: '1px solid #e9d5ff',
                          borderRadius: '8px',
                          padding: '14px'
                        }}>
                          <h5 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            Basic Info & Classification
                          </h5>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}>
                            <div>
                              <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Status</p>
                              <span className={`badge ${getStatusBadgeClass(selectedIncidentDetails.status)}`} style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                                {selectedIncidentDetails.status || 'Draft'}
                              </span>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Participant</p>
                              <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                                {selectedIncidentDetails.participant_name || 'N/A'}
                              </p>
                            </div>
                            {selectedIncidentDetails.key_contributing_factors && selectedIncidentDetails.key_contributing_factors.length > 0 && (
                              <div>
                                <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Key Contributing Factors</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {selectedIncidentDetails.key_contributing_factors.map((factor: string, idx: number) => (
                                    <span
                                      key={idx}
                                      style={{
                                        backgroundColor: '#ddd6fe',
                                        color: '#5b21b6',
                                        padding: '6px 12px',
                                        borderRadius: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        display: 'inline-block',
                                        width: 'fit-content'
                                      }}
                                    >
                                      {factor}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Draft Summary */}
                      {selectedIncidentDetails.description && (
                        <div style={{
                          backgroundColor: 'white',
                          border: '1px solid #fde68a',
                          borderRadius: '8px',
                          padding: '14px',
                          marginTop: '14px'
                        }}>
                          <h5 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f59e0b', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            Draft Summary
                          </h5>
                          <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                            {selectedIncidentDetails.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* People Involved - Removed as it's now in Core Incident Information */}
                    {selectedIncidentDetails.customer && (
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '14px',
                        marginBottom: '12px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Customer</p>
                        <p style={{ fontSize: '0.875rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                          {selectedIncidentDetails.customer.first_name} {selectedIncidentDetails.customer.last_name}
                        </p>
                      </div>
                    )}

                    {/* NDIS Narrative Details - Collapsible Sections */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', paddingLeft: '4px' }}>
                        <i className="ki-outline ki-document" style={{ fontSize: '16px', color: '#6b46c1' }}></i>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                          NDIS Narrative Details
                        </h3>
                      </div>

                      {/* What Happened */}
                      {selectedIncidentDetails.what_happened && (
                        <div style={{
                          backgroundColor: 'white',
                          border: '1px solid #e9d5ff',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          overflow: 'hidden'
                        }}>
                          <div
                            onClick={() => toggleSection('whatHappened')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              cursor: 'pointer',
                              backgroundColor: '#f5f3ff',
                              transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ede9fe'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                          >
                            <h4 style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#6b46c1', margin: 0 }}>
                              What Happened
                            </h4>
                            <i
                              className={`ki-outline ${collapsedSections.whatHappened ? 'ki-down' : 'ki-up'}`}
                              style={{ fontSize: '0.75rem', color: '#6b46c1' }}
                            ></i>
                          </div>
                          {!collapsedSections.whatHappened && (
                            <div style={{ padding: '14px 16px', backgroundColor: '#f5f3ff', borderTop: '1px solid #e9d5ff' }}>
                              <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                {selectedIncidentDetails.what_happened}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Lead-Up & Triggers */}
                      {selectedIncidentDetails.lead_up_triggers && (
                        <div style={{
                          backgroundColor: 'white',
                          border: '1px solid #e9d5ff',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          overflow: 'hidden'
                        }}>
                          <div
                            onClick={() => toggleSection('leadUpTriggers')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              cursor: 'pointer',
                              backgroundColor: '#f5f3ff',
                              transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ede9fe'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                          >
                            <h4 style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#6b46c1', margin: 0 }}>
                              Lead Up & Triggers
                            </h4>
                            <i
                              className={`ki-outline ${collapsedSections.leadUpTriggers ? 'ki-down' : 'ki-up'}`}
                              style={{ fontSize: '0.75rem', color: '#6b46c1' }}
                            ></i>
                          </div>
                          {!collapsedSections.leadUpTriggers && (
                            <div style={{ padding: '14px 16px', backgroundColor: '#f5f3ff', borderTop: '1px solid #e9d5ff' }}>
                              <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                {selectedIncidentDetails.lead_up_triggers}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* During Incident */}
                      {selectedIncidentDetails.during_incident && (
                        <div style={{
                          backgroundColor: 'white',
                          border: '1px solid #e9d5ff',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          overflow: 'hidden'
                        }}>
                          <div
                            onClick={() => toggleSection('duringIncident')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              cursor: 'pointer',
                              backgroundColor: '#f5f3ff',
                              transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ede9fe'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                          >
                            <h4 style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#6b46c1', margin: 0 }}>
                              During Incident
                            </h4>
                            <i
                              className={`ki-outline ${collapsedSections.duringIncident ? 'ki-down' : 'ki-up'}`}
                              style={{ fontSize: '0.75rem', color: '#6b46c1' }}
                            ></i>
                          </div>
                          {!collapsedSections.duringIncident && (
                            <div style={{ padding: '14px 16px', backgroundColor: '#f5f3ff', borderTop: '1px solid #e9d5ff' }}>
                              <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                {selectedIncidentDetails.during_incident}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Response Actions */}
                      {selectedIncidentDetails.response_actions && (
                        <div style={{
                          backgroundColor: 'white',
                          border: '1px solid #e9d5ff',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          overflow: 'hidden'
                        }}>
                          <div
                            onClick={() => toggleSection('responseActions')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              cursor: 'pointer',
                              backgroundColor: '#f5f3ff',
                              transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ede9fe'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                          >
                            <h4 style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#6b46c1', margin: 0 }}>
                              Response Actions
                            </h4>
                            <i
                              className={`ki-outline ${collapsedSections.responseActions ? 'ki-down' : 'ki-up'}`}
                              style={{ fontSize: '0.75rem', color: '#6b46c1' }}
                            ></i>
                          </div>
                          {!collapsedSections.responseActions && (
                            <div style={{ padding: '14px 16px', backgroundColor: '#f5f3ff', borderTop: '1px solid #e9d5ff' }}>
                              <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                {selectedIncidentDetails.response_actions}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Causes & Contributing Factors */}
                      {selectedIncidentDetails.causes_contributing_factors && (
                        <div style={{
                          backgroundColor: 'white',
                          border: '1px solid #e9d5ff',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          overflow: 'hidden'
                        }}>
                          <div
                            onClick={() => toggleSection('causesFactors')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              cursor: 'pointer',
                              backgroundColor: '#f5f3ff',
                              transition: 'background-color 0.2s',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ede9fe'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5f3ff'}
                          >
                            <h4 style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#6b46c1', margin: 0 }}>
                              Causes & Contributing Factors
                            </h4>
                            <i
                              className={`ki-outline ${collapsedSections.causesFactors ? 'ki-down' : 'ki-up'}`}
                              style={{ fontSize: '0.75rem', color: '#6b46c1' }}
                            ></i>
                          </div>
                          {!collapsedSections.causesFactors && (
                            <div style={{ padding: '14px 16px', backgroundColor: '#f5f3ff', borderTop: '1px solid #e9d5ff' }}>
                              <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                {selectedIncidentDetails.causes_contributing_factors}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Impact & Response Section */}
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '16px',
                      border: '1px solid #e9d5ff'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                        backgroundColor: '#f5f3ff',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        borderLeft: '3px solid #6b46c1'
                      }}>
                        <i className="ki-outline ki-pulse" style={{ fontSize: '16px', color: '#6b46c1' }}></i>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                          Impact & Response
                        </h4>
                      </div>

                      {/* Medical & Injury */}
                      <div style={{
                        backgroundColor: '#f5f3ff',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        padding: '14px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <i className="ki-outline ki-shield-cross" style={{ fontSize: '16px', color: '#6b46c1' }}></i>
                          <h5 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Medical & Injury
                          </h5>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className={`ki-outline ${selectedIncidentDetails.injury_occurred ? 'ki-cross' : 'ki-check'}`}
                               style={{ fontSize: '16px', color: selectedIncidentDetails.injury_occurred ? '#ef4444' : '#10b981' }}></i>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                              <span style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: '500' }}>Injury Occurred</span>
                              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#6b7280' }}>
                                {selectedIncidentDetails.injury_occurred ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className={`ki-outline ${selectedIncidentDetails.medical_treatment_required ? 'ki-cross' : 'ki-check'}`}
                               style={{ fontSize: '16px', color: selectedIncidentDetails.medical_treatment_required ? '#ef4444' : '#10b981' }}></i>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                              <span style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: '500' }}>Medical Treatment Required</span>
                              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#6b7280' }}>
                                {selectedIncidentDetails.medical_treatment_required ? 'Yes' : 'No'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedIncidentDetails.injury_details && (
                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e9d5ff' }}>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Injury Details</p>
                            <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: 0 }}>
                              {selectedIncidentDetails.injury_details}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Reporting */}
                      <div style={{
                        backgroundColor: '#f5f3ff',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        padding: '14px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <i className="ki-outline ki-notification-status" style={{ fontSize: '16px', color: '#6b46c1' }}></i>
                          <h5 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Reporting
                          </h5>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: '500' }}>NDIS Reportable</span>
                            <span className={`badge ${selectedIncidentDetails.is_ndis_reportable ? 'badge-success' : 'badge-light'}`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                              {selectedIncidentDetails.is_ndis_reportable ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: '500' }}>Police Notified</span>
                            <span className={`badge ${selectedIncidentDetails.police_notified ? 'badge-info' : 'badge-light'}`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                              {selectedIncidentDetails.police_notified ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                        {selectedIncidentDetails.notification_made_to && (
                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e9d5ff' }}>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '6px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Notification Made To</p>
                            <p style={{ fontSize: '0.8125rem', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                              {selectedIncidentDetails.notification_made_to}
                              {selectedIncidentDetails.notification_date_time && (
                                <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '8px' }}>
                                  ({formatDateTime(selectedIncidentDetails.notification_date_time).date})
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* System Analysis (BSP Notes) */}
                    {(selectedIncidentDetails.bsp_alignment_notes || selectedIncidentDetails.bsp_suggested_improvements) && (
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '16px',
                        border: '1px solid #e9d5ff'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '16px',
                          backgroundColor: '#f5f3ff',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          borderLeft: '3px solid #6b46c1'
                        }}>
                          <i className="ki-outline ki-abstract-26" style={{ fontSize: '16px', color: '#6b46c1' }}></i>
                          <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            System Analysis
                          </h4>
                        </div>

                        {selectedIncidentDetails.bsp_alignment_notes && (
                          <div style={{
                            backgroundColor: '#f5f3ff',
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            padding: '14px',
                            marginBottom: '12px',
                            borderLeft: '3px solid #6b46c1'
                          }}>
                            <p style={{ fontSize: '0.75rem', color: '#6b46c1', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BSP Alignment Notes</p>
                            <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                              {selectedIncidentDetails.bsp_alignment_notes}
                            </p>
                          </div>
                        )}

                        {selectedIncidentDetails.bsp_suggested_improvements && (
                          <div style={{
                            backgroundColor: '#f5f3ff',
                            border: '1px solid #e9d5ff',
                            borderRadius: '8px',
                            padding: '14px',
                            borderLeft: '3px solid #6b46c1'
                          }}>
                            <p style={{ fontSize: '0.75rem', color: '#6b46c1', marginBottom: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Suggested Improvements</p>
                            <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                              {selectedIncidentDetails.bsp_suggested_improvements}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Follow-Up */}
                    {(selectedIncidentDetails.recurrence_likelihood || selectedIncidentDetails.follow_up_actions_required) && (
                      <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '16px',
                        border: '1px solid #fed7aa'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '16px',
                          backgroundColor: '#fef9f3',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          borderLeft: '3px solid #f59e0b'
                        }}>
                          <i className="ki-outline ki-calendar-tick" style={{ fontSize: '16px', color: '#f59e0b' }}></i>
                          <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f59e0b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            Follow-Up
                          </h4>
                        </div>

                        <div style={{
                          backgroundColor: '#fef9f3',
                          border: '1px solid #fed7aa',
                          borderRadius: '8px',
                          padding: '14px',
                          borderLeft: '3px solid #f59e0b'
                        }}>
                          <div className="grid md:grid-cols-2 gap-3">
                            {selectedIncidentDetails.recurrence_likelihood && (
                              <div>
                                <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Recurrence Risk</p>
                                <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                                  {selectedIncidentDetails.recurrence_likelihood}
                                </p>
                              </div>
                            )}
                            {selectedIncidentDetails.follow_up_actions_required !== undefined && (
                              <div>
                                <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Action Required</p>
                                <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                                  {selectedIncidentDetails.follow_up_actions_required ? 'Yes' : 'No'}
                                </p>
                              </div>
                            )}
                          </div>
                          {selectedIncidentDetails.follow_up_notes && (
                            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #fed7aa' }}>
                              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>Notes:</p>
                              <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: 0 }}>
                                {selectedIncidentDetails.follow_up_notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Risk Assessment & Follow-up */}
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '16px',
                      border: '1px solid #e9d5ff'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '16px',
                        backgroundColor: '#f5f3ff',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        borderLeft: '3px solid #6b46c1'
                      }}>
                        <i className="ki-outline ki-security-user" style={{ fontSize: '16px', color: '#6b46c1' }}></i>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                          Risk Assessment & Follow-up
                        </h4>
                      </div>

                      <div style={{
                        backgroundColor: '#f5f3ff',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        padding: '14px',
                        borderLeft: '3px solid #6b46c1'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <i className="ki-outline ki-triangle" style={{ fontSize: '14px', color: '#6b46c1' }}></i>
                          <h5 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Risk Assessment
                          </h5>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Recurrence Likelihood</p>
                            <span style={{
                              display: 'inline-block',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: selectedIncidentDetails.recurrence_likelihood === 'High' ? '#fee2e2' :
                                            selectedIncidentDetails.recurrence_likelihood === 'Medium' ? '#fef3c7' : '#dcfce7',
                              color: selectedIncidentDetails.recurrence_likelihood === 'High' ? '#dc2626' :
                                     selectedIncidentDetails.recurrence_likelihood === 'Medium' ? '#f59e0b' : '#10b981'
                            }}>
                              {selectedIncidentDetails.recurrence_likelihood || 'Not Assessed'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              backgroundColor: selectedIncidentDetails.follow_up_required ? '#ddd6fe' : '#d1fae5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <i className={`ki-outline ${selectedIncidentDetails.follow_up_required ? 'ki-check' : 'ki-cross'}`}
                                 style={{ fontSize: '14px', color: selectedIncidentDetails.follow_up_required ? '#6b46c1' : '#10b981' }}></i>
                            </div>
                            <div>
                              <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '2px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Follow-up Required</p>
                              <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                                {selectedIncidentDetails.follow_up_required ? 'Yes' : 'No'}
                              </p>
                            </div>
                          </div>
                        </div>
                        {selectedIncidentDetails.follow_up_actions && selectedIncidentDetails.follow_up_required && (
                          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e9d5ff' }}>
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>Follow-up Actions:</p>
                            <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.5', whiteSpace: 'pre-wrap', margin: 0 }}>
                              {selectedIncidentDetails.follow_up_actions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reporter Signature */}
                    {selectedIncidentDetails.reporter_signature && (
                      <div className="card bg-primary-light/10 border-2 border-primary">
                        <div className="card-body">
                          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <i className="ki-outline ki-pencil text-xl mr-2 text-primary"></i>
                            Reporter Signature
                          </h4>
                          <div className="bg-white p-6 rounded-lg">
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-1">Signed by:</p>
                              <p className="text-base font-semibold text-gray-900">
                                {selectedIncidentDetails.reporting_user?.first_name} {selectedIncidentDetails.reporting_user?.last_name}
                              </p>
                            </div>
                            {selectedIncidentDetails.reporter_signed_at && (
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1">Signed at:</p>
                                <p className="text-base text-gray-900">
                                  {new Date(selectedIncidentDetails.reporter_signed_at).toLocaleString('en-US', {
                                    dateStyle: 'full',
                                    timeStyle: 'short'
                                  })}
                                </p>
                              </div>
                            )}
                            <div className="mt-4">
                              <p className="text-sm text-gray-600 mb-2">Signature:</p>
                              <img
                                src={selectedIncidentDetails.reporter_signature}
                                alt="Reporter Signature"
                                className="border-2 border-primary rounded-lg max-w-md"
                                style={{ maxHeight: '200px' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                      </div>
                    )}

                    {/* PARTICIPANT INFO TAB */}
                    {activeModalTab === 'participant' && (
                      <div className="incident-modal-tab-content">
                    {participantDetails ? (
                      <>
                    {/* Core Participant Information */}
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      marginBottom: '16px',
                      border: '1px solid #e9d5ff'
                    }}>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          marginBottom: '4px',
                          backgroundColor: '#f5f3ff',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          borderLeft: '3px solid #6b46c1'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="ki-outline ki-profile-circle" style={{ fontSize: '16px', color: '#6b46c1' }}></i>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                              Participant Information
                            </h4>
                          </div>
                          {participantDetails && (
                            <span className={`badge ${participantDetails.status === 'active' || participantDetails.status === true ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.6875rem', padding: '4px 10px' }}>
                              {participantDetails.status === 'active' || participantDetails.status === true ? 'Active' : 'Inactive'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Two Column Layout */}
                      {participantDetails && (
                      <div className="grid md:grid-cols-2 gap-3" style={{ marginBottom: '14px' }}>
                              {/* Personal Profile */}
                              <div style={{
                                backgroundColor: '#f5f3ff',
                                borderRadius: '8px',
                                padding: '14px',
                                border: '1px solid #e9d5ff'
                              }}>
                                <h5 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                  Personal Profile
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <i className="ki-outline ki-user" style={{ fontSize: '14px', color: '#6b46c1', marginTop: '2px' }}></i>
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Full Name</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                                        {participantDetails.first_name} {participantDetails.last_name}
                                      </p>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <i className="ki-outline ki-calendar" style={{ fontSize: '14px', color: '#6b46c1', marginTop: '2px' }}></i>
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Date of Birth</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                                        {participantDetails.dob ? new Date(participantDetails.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <i className="ki-outline ki-profile-circle" style={{ fontSize: '14px', color: '#6b46c1', marginTop: '2px' }}></i>
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Gender</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                                        {participantDetails.gender === 'male' ? 'Male' : participantDetails.gender === 'female' ? 'Female' : participantDetails.gender === 'other' ? 'Other' : participantDetails.gender === 'prefer_not_to_say' ? 'Prefer Not To Say' : 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Contact & Provider */}
                              <div style={{
                                backgroundColor: '#f5f3ff',
                                border: '1px solid #e9d5ff',
                                borderRadius: '8px',
                                padding: '14px'
                              }}>
                                <h5 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                  Contact & Provider
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflow: 'hidden' }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <i className="ki-outline ki-sms" style={{ fontSize: '14px', color: '#6b46c1', marginTop: '2px' }}></i>
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Email</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                                        {participantDetails.contact_email || 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <i className="ki-outline ki-phone" style={{ fontSize: '14px', color: '#6b46c1', marginTop: '2px' }}></i>
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Phone</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                                        {participantDetails.contact_phone || 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                  {participantDetails.assigned_practitioner && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                      <i className="ki-outline ki-user-tick" style={{ fontSize: '14px', color: '#6b46c1', marginTop: '2px' }}></i>
                                      <div>
                                        <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Assigned Provider</p>
                                        <p style={{ fontSize: '0.8125rem', color: '#111827', fontWeight: '500', margin: 0 }}>
                                          {participantDetails.assigned_practitioner.first_name} {participantDetails.assigned_practitioner.last_name}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                      )}

                      {/* Medical Information */}
                      {participantDetails && (participantDetails.medical_conditions || participantDetails.medications || participantDetails.disabilities) && (
                              <div style={{
                                border: '1px solid #e9d5ff',
                                borderRadius: '8px',
                                padding: '14px',
                                marginTop: '14px',
                                backgroundColor: '#f5f3ff'
                              }}>
                                <h5 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                  Medical Information
                                </h5>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                  {participantDetails.medical_conditions && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Medical Conditions</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.medical_conditions}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.medications && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Medications</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.medications}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.disabilities && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Disabilities</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.disabilities}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Behaviour Profile Section */}
                            {participantDetails && (participantDetails.behaviours_of_concern || participantDetails.triggers_antecedents ||
                              participantDetails.early_warning_signs || participantDetails.escalation_patterns ||
                              participantDetails.behaviour_overview_summary || participantDetails.behavioural_tendencies) && (
                              <>
                                <div style={{ marginTop: '20px', marginBottom: '12px', paddingLeft: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="ki-outline ki-chart-line-star" style={{ fontSize: '16px', color: '#6b46c1' }}></i>
                                    <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                      Behaviour Profile
                                    </h3>
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                  {participantDetails.behaviours_of_concern && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Behaviours of Concern</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.behaviours_of_concern}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.triggers_antecedents && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Triggers & Antecedents</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.triggers_antecedents}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.early_warning_signs && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Early Warning Signs</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.early_warning_signs}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.escalation_patterns && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Escalation Patterns</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.escalation_patterns}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.behaviour_overview_summary && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Behaviour Overview</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.behaviour_overview_summary}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.behavioural_tendencies && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Behavioural Tendencies</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.behavioural_tendencies}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}

                            {/* BSP Strategies Section */}
                            {participantDetails && (participantDetails.proactive_strategies || participantDetails.reactive_strategies ||
                              participantDetails.escalation_steps || participantDetails.restricted_practices ||
                              participantDetails.support_requirements || participantDetails.risk_indicators ||
                              participantDetails.risk_factors) && (
                              <>
                                <div style={{ marginTop: '20px', marginBottom: '12px', paddingLeft: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="ki-outline ki-shield-tick" style={{ fontSize: '16px', color: '#6b46c1' }}></i>
                                    <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                      BSP Strategies
                                    </h3>
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                  {participantDetails.proactive_strategies && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Proactive Strategies</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.proactive_strategies}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.reactive_strategies && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Reactive Strategies</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.reactive_strategies}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.escalation_steps && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Escalation Steps</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.escalation_steps}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.restricted_practices && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Restricted Practices</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.restricted_practices}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.support_requirements && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Support Requirements</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.support_requirements}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.risk_indicators && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Risk Indicators</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.risk_indicators}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.risk_factors && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Risk Factors</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.risk_factors}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}

                            {/* Support Context Section */}
                            {participantDetails && (participantDetails.sensory_profile || participantDetails.communication_style ||
                              participantDetails.environmental_needs || participantDetails.support_environment_family_context ||
                              participantDetails.functional_daily_living_profile) && (
                              <>
                                <div style={{ marginTop: '20px', marginBottom: '12px', paddingLeft: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="ki-outline ki-home-2" style={{ fontSize: '16px', color: '#6b46c1' }}></i>
                                    <h3 style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b46c1', margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                      Support Context
                                    </h3>
                                  </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                  {participantDetails.sensory_profile && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Sensory Profile</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.sensory_profile}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.communication_style && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Communication Style</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.communication_style}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.environmental_needs && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Environmental Needs</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.environmental_needs}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.support_environment_family_context && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Support Environment / Family Context</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.support_environment_family_context}
                                      </p>
                                    </div>
                                  )}
                                  {participantDetails.functional_daily_living_profile && (
                                    <div>
                                      <p style={{ fontSize: '0.6875rem', color: '#6b7280', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Functional & Daily Living</p>
                                      <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: 0 }}>
                                        {participantDetails.functional_daily_living_profile}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                    </div>
                    </>
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '400px',
                        padding: '40px 20px'
                      }}>
                        <i
                          className="ki-outline ki-profile-circle"
                          style={{ fontSize: '64px', color: '#d1d5db', marginBottom: '16px' }}
                        ></i>
                        <p style={{ fontSize: '1rem', color: '#6b7280', textAlign: 'center', marginBottom: '8px' }}>
                          No participant information available
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center' }}>
                          This incident may not have an associated participant
                        </p>
                      </div>
                    )}
                  </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-gray-600">No incident details available.</p>
                  </div>
                )}
              </div>

              {/* Modal Footer - Only show on Incident Details tab */}
              {activeModalTab === 'details' && (
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { IncidentsTimeline };