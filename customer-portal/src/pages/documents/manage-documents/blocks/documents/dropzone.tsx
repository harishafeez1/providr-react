import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
}

interface FileWithPreview extends File {
  preview: string;
}

const Dropzone: React.FC<DropzoneProps> = ({ onDrop }) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file)
          })
        )
      );
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const handleUpload = () => {
    // Implement the upload logic here
    console.log('Uploading files:', files);
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
          <button className="btn btn-primary" onClick={handleUpload}>
            Upload File
          </button>
        </div>
      )}
    </>
  );
};

export { Dropzone };
