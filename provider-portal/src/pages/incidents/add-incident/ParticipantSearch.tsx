import { useState, useEffect, useRef } from 'react';
import { searchParticipants } from '@/services/api';
import { KeenIcon } from '@/components';

interface Participant {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email?: string;
  phone?: string;
  contact_email?: string;
  contact_phone?: string;
  dob?: string;
}

interface ParticipantSearchProps {
  onSelect: (participant: Participant) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ParticipantSearch: React.FC<ParticipantSearchProps> = ({
  onSelect,
  placeholder = 'Search participants...',
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setParticipants([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const response = await searchParticipants(searchQuery);
      setParticipants(response.participants || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedParticipant(null);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounce (300ms)
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  // Handle participant selection
  const handleSelect = (participant: Participant) => {
    setQuery(participant.name || `${participant.first_name} ${participant.last_name}`);
    setSelectedParticipant(participant);
    setShowDropdown(false);
    onSelect(participant);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Clear selection
  const handleClear = () => {
    setQuery('');
    setSelectedParticipant(null);
    setParticipants([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative flex-1 min-w-0" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onClick={(e) => {
            e.stopPropagation();
            if (participants.length > 0) {
              setShowDropdown(true);
            }
          }}
          placeholder={placeholder}
          className="input w-full pr-20"
          disabled={disabled}
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          )}

          {selectedParticipant && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              disabled={disabled}
            >
              <KeenIcon icon="cross" className="text-gray-500 text-sm" />
            </button>
          )}

          <KeenIcon icon="magnifier" className="text-gray-400 text-base" />
        </div>
      </div>

      {showDropdown && participants.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {participants.map((participant) => (
            <div
              key={participant.id}
              onClick={() => handleSelect(participant)}
              className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
            >
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {participant.name || `${participant.first_name} ${participant.last_name}`}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-2 mt-1">
                {(participant.email || participant.contact_email) && (
                  <span className="flex items-center gap-1">
                    <KeenIcon icon="sms" className="text-xs" />
                    {participant.email || participant.contact_email}
                  </span>
                )}
                {(participant.phone || participant.contact_phone) && (
                  <span className="flex items-center gap-1">
                    <KeenIcon icon="phone" className="text-xs" />
                    {participant.phone || participant.contact_phone}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && query.length >= 2 && participants.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <KeenIcon icon="information-2" className="text-base" />
            <span className="text-sm">No participants found</span>
          </div>
        </div>
      )}
    </div>
  );
};
