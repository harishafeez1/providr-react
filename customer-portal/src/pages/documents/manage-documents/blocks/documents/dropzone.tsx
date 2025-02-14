import { uploadDocument } from '@/services/api/documents';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  onDrop?: (acceptedFiles: File[]) => void;
  onUploadSuccess: () => void;
}
interface FileWithPreview extends File {
  preview: string;
}

const Dropzone: React.FC<DropzoneProps> = ({ onDrop, onUploadSuccess }) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
      if (onDrop){

        onDrop(acceptedFiles);
      }
    },
    [onDrop]
  );

  const handleUpload = async () => {
    setLoading(true);
    if (!files.length) {
      console.log('No files to upload');
      return;
    }

    // Convert files to base64 or FormData
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('document', file);
    });

    const res = await uploadDocument(formData);

    if (res) {
      setLoading(false);
      setFiles([]);
      onUploadSuccess();
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: handleDrop });

  return (
    <>
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-400 p-5 text-center rounded-lg"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop some files here, or click to select files</p>
        )}
        <div>
          {files.map((file) => (
            <div key={file.name}>
              <p>{file.name}</p>
            </div>
          ))}
        </div>
      </div>
      {files.length > 0 && (
        <div className="flex justify-center ">
          <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      )}
    </>
  );
};

export { Dropzone };
