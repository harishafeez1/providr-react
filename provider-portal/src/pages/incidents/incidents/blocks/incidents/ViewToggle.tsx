import { KeenIcon } from '@/components';

interface ViewToggleProps {
  activeView: 'table' | 'timeline';
  onViewChange: (view: 'table' | 'timeline') => void;
}

const ViewToggle = ({ activeView, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center gap-0 bg-gray-100 dark:bg-gray-800 rounded-md p-0.5">
      <button
        onClick={() => onViewChange('table')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-200 ${
          activeView === 'table'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-primary font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        <KeenIcon icon="row-horizontal" className="text-sm" />
        <span className="text-xs font-medium">Table</span>
      </button>
      <button
        onClick={() => onViewChange('timeline')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-200 ${
          activeView === 'timeline'
            ? 'bg-white dark:bg-gray-700 shadow-sm text-primary font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        <KeenIcon icon="time" className="text-sm" />
        <span className="text-xs font-medium">Timeline</span>
      </button>
    </div>
  );
};

export { ViewToggle };