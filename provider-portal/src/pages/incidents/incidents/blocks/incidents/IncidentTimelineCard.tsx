import { KeenIcon } from '@/components';
import { IIncidentsData } from './IncidentsData';
import { Menu, MenuItem, MenuToggle, MenuSub, MenuLink, MenuIcon, MenuTitle } from '@/components';
import { useLanguage } from '@/i18n';

interface IncidentTimelineCardProps {
  incident: IIncidentsData;
  onViewDetails: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const IncidentTimelineCard = ({
  incident,
  onViewDetails,
  onEdit,
  onDelete,
}: IncidentTimelineCardProps) => {
  const { isRTL } = useLanguage();

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

  const formatTime = (dateTime: string) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getIncidentTypeName = () => {
    const incidentType = incident.incident_type;
    if (typeof incidentType === 'object' && incidentType?.name) {
      return incidentType.name;
    }
    return typeof incidentType === 'string' ? incidentType : 'N/A';
  };

  const getParticipantName = () => {
    return incident.participant_name ||
      (incident.customer
        ? `${incident.customer.first_name || ''} ${incident.customer.last_name || ''}`.trim()
        : 'N/A');
  };

  // Debug logging to check if descriptions are unique
  console.log('Incident Card:', {
    id: incident.id,
    number: incident.incident_number,
    description: incident.description?.substring(0, 50) + '...'
  });

  return (
    <div className="relative pb-8">
      {/* Timeline dot */}
      <div className="absolute -left-16 top-5 w-3 h-3 bg-primary rounded-full ring-4 ring-white dark:ring-gray-900 z-10"></div>

      {/* Timeline card */}
      <div className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 rounded-lg overflow-hidden">
        <div className="card-body p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  #{incident.incident_number}
                </h3>
                <span className={`badge ${getSeverityBadgeClass(incident.severity)} badge-outline rounded-full badge-sm`}>
                  {incident.severity}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(incident.incident_date_time)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <KeenIcon icon="user" className="text-gray-500 text-sm" />
                <span>{getParticipantName()}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 dark:text-gray-400">{getIncidentTypeName()}</span>
              </div>
            </div>

            {/* Actions Menu */}
            <Menu className="items-stretch">
              <MenuItem
                toggle="dropdown"
                trigger="click"
                dropdownProps={{
                  placement: isRTL() ? 'bottom-start' : 'bottom-end',
                  modifiers: [
                    {
                      name: 'offset',
                      options: {
                        offset: isRTL() ? [0, -10] : [0, 10]
                      }
                    }
                  ]
                }}
              >
                <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
                  <KeenIcon icon="dots-vertical" />
                </MenuToggle>
                <MenuSub className="menu-default" rootClassName="w-full max-w-[200px]">
                  <MenuItem
                    onClick={() => onViewDetails(incident.id)}
                    toggle="dropdown"
                    trigger="hover"
                    dropdownProps={{
                      placement: isRTL() ? 'left-start' : 'right-start',
                      modifiers: [
                        {
                          name: 'offset',
                          options: {
                            offset: isRTL() ? [15, 0] : [-15, 0]
                          }
                        }
                      ]
                    }}
                  >
                    <MenuLink>
                      <a className="flex">
                        <MenuIcon>
                          <KeenIcon icon="eye" />
                        </MenuIcon>
                        <MenuTitle>View Details</MenuTitle>
                      </a>
                    </MenuLink>
                  </MenuItem>

                  <MenuItem
                    onClick={() => onEdit(incident.id)}
                    toggle="dropdown"
                    trigger="hover"
                    dropdownProps={{
                      placement: isRTL() ? 'left-start' : 'right-start',
                      modifiers: [
                        {
                          name: 'offset',
                          options: {
                            offset: isRTL() ? [15, 0] : [-15, 0]
                          }
                        }
                      ]
                    }}
                  >
                    <MenuLink>
                      <a className="flex">
                        <MenuIcon>
                          <KeenIcon icon="notepad-edit" />
                        </MenuIcon>
                        <MenuTitle>Edit</MenuTitle>
                      </a>
                    </MenuLink>
                  </MenuItem>

                  <MenuItem
                    onClick={() => onDelete(incident.id)}
                    toggle="dropdown"
                    dropdownProps={{
                      placement: isRTL() ? 'left-start' : 'right-start',
                      modifiers: [
                        {
                          name: 'offset',
                          options: {
                            offset: isRTL() ? [15, 0] : [-15, 0]
                          }
                        }
                      ]
                    }}
                  >
                    <MenuLink>
                      <a className="flex">
                        <MenuIcon>
                          <KeenIcon icon="trash" />
                        </MenuIcon>
                        <MenuTitle>Delete</MenuTitle>
                      </a>
                    </MenuLink>
                  </MenuItem>
                </MenuSub>
              </MenuItem>
            </Menu>
          </div>

          {/* Description */}
          {incident.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {incident.description}
            </p>
          )}

          {/* Footer Icons */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            {incident.behavioral_identified && (
              <div
                className="relative group cursor-pointer"
                title="Behavioral Identified"
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors">
                  <i className="ki-solid ki-abstract-26 text-purple-600 dark:text-purple-400 text-base"></i>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Behavioral Identified
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            )}
            {incident.trigger_extracted && (
              <div
                className="relative group cursor-pointer"
                title="Trigger Extracted"
              >
                <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center hover:bg-yellow-200 dark:hover:bg-yellow-800/50 transition-colors">
                  <KeenIcon icon="electricity" className="text-yellow-600 dark:text-yellow-400 text-lg" />
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Trigger Extracted
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            )}
            {incident.bsp_aligned && (
              <div
                className="relative group cursor-pointer"
                title="BSP Aligned"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors">
                  <KeenIcon icon="check-circle" className="text-green-600 dark:text-green-400 text-lg" />
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  BSP Aligned
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            )}
            {!incident.behavioral_identified && !incident.trigger_extracted && !incident.bsp_aligned && (
              <span className="text-gray-400 dark:text-gray-600 text-xs">N/A</span>
            )}
            {incident.restrictive_practice_used && (
              <div className="ml-auto">
                <span className="badge badge-warning badge-outline rounded-full badge-sm">
                  Restrictive
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { IncidentTimelineCard };