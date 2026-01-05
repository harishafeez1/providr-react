'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { KeenIcon } from '@/components';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';

interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  mode?: 'date' | 'datetime';
  required?: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value = '',
  onChange,
  placeholder = 'Pick a date',
  className = '',
  disabled = false,
  mode = 'date',
  required = false
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [timeValue, setTimeValue] = React.useState<string>(() => {
    if (value && mode === 'datetime') {
      const date = new Date(value);
      return format(date, 'HH:mm');
    }
    return '00:00';
  });
  const [open, setOpen] = React.useState(false);

  // Update selected date when value prop changes
  React.useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      if (mode === 'datetime') {
        setTimeValue(format(date, 'HH:mm'));
      }
    } else {
      setSelectedDate(undefined);
      setTimeValue('00:00');
    }
  }, [value, mode]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      onChange?.('');
      return;
    }

    setSelectedDate(date);

    if (mode === 'datetime') {
      // Combine date with current time value
      const [hours, minutes] = timeValue.split(':');
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      // Format as YYYY-MM-DDTHH:mm for datetime-local input compatibility
      onChange?.(format(date, "yyyy-MM-dd'T'HH:mm"));
    } else {
      // Format as YYYY-MM-DD for date input compatibility
      onChange?.(format(date, 'yyyy-MM-dd'));
      setOpen(false);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (selectedDate) {
      const [hours, minutes] = newTime.split(':');
      const newDate = new Date(selectedDate);
      newDate.setHours(parseInt(hours, 10));
      newDate.setMinutes(parseInt(minutes, 10));
      // Format as YYYY-MM-DDTHH:mm for datetime-local input compatibility
      onChange?.(format(newDate, "yyyy-MM-dd'T'HH:mm"));
    }
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    setTimeValue('00:00');
    onChange?.('');
    setOpen(false);
  };

  const displayValue = React.useMemo(() => {
    if (!selectedDate) return null;

    if (mode === 'datetime') {
      return `${format(selectedDate, 'LLL dd, yyyy')} ${timeValue}`;
    }
    return format(selectedDate, 'LLL dd, yyyy');
  }, [selectedDate, timeValue, mode]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'input w-full text-left flex items-center justify-between gap-2 data-[state=open]:border-primary',
            !selectedDate && 'text-gray-500',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <KeenIcon icon="calendar" className="text-gray-400 flex-shrink-0" />
            <span className="truncate">
              {displayValue || placeholder}
            </span>
          </div>
          {selectedDate && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <KeenIcon icon="cross" className="text-gray-500 text-sm" />
            </button>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            defaultMonth={selectedDate}
          />
          {mode === 'datetime' && (
            <div className="border-t pt-3 px-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 flex-shrink-0">Time:</label>
                <Input
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
          {mode === 'datetime' && selectedDate && (
            <div className="px-3 pb-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-primary btn-sm w-full"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
