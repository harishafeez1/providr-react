import { DocumentsTable } from './blocks';
import { Dropzone } from './blocks/documents/dropzone';

const DocumentsTableContent = () => {
  return (
    <div className="grid gap-5 lg:gap-7.5">
      <Dropzone />
      <DocumentsTable />
    </div>
  );
};

export { DocumentsTableContent };
