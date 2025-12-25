import { useState } from 'react';
import { IncidentsTable, IncidentsTimeline } from './blocks';

const IncidentsTableContent = () => {
  const [activeView, setActiveView] = useState<'table' | 'timeline'>('table');

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* Conditional View Rendering */}
      {activeView === 'table' ? (
        <IncidentsTable activeView={activeView} onViewChange={setActiveView} />
      ) : (
        <IncidentsTimeline activeView={activeView} onViewChange={setActiveView} />
      )}
    </div>
  );
};

export { IncidentsTableContent };
