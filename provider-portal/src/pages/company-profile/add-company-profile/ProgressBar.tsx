import { useFormikContext } from 'formik';
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  className?: string;
}

const ProgressBar = ({ className }: ProgressBarProps) => {
  const { values } = useFormikContext<any>();

  const stripHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const isFilled = (value: any) => {
    if (value === null || value === undefined) return false;

    if (typeof value === 'string') {
      const cleanText = stripHtml(value).trim();
      return cleanText !== '';
    }

    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'number') return true; // numbers like 0, 1 are filled
    if (typeof value === 'boolean') return true; // booleans are filled

    return false;
  };

  const totalFields = Object.keys(values).length;
  const filledFields = Object.values(values).filter(isFilled).length;

  const progress = (filledFields / totalFields) * 100;

  return (
    <div className={cn("w-full bg-gray-300 rounded-full progress", className)}>
      <div
        className="progress-bar bg-success rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export { ProgressBar };
