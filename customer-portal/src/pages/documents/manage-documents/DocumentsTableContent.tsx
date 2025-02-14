import { useState } from 'react';
import { DocumentsTable } from './blocks';
import { Dropzone } from './blocks/documents/dropzone';

const DocumentsTableContent = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshTable = () => {
    setRefreshKey((prev) => prev + 1);
  };
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Dropzone onUploadSuccess={refreshTable} />
      <DocumentsTable key={refreshKey} />
    </div>
  );
};

export { DocumentsTableContent };
