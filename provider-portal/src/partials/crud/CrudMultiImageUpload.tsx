import { useAuthContext } from '@/auth';
import { KeenIcon } from '@/components';
import { ImageInput } from '@/components/image-input';
import type { IImageInputFile } from '@/components/image-input';
import { deleteGalleryPhoto } from '@/services/api';
import { useEffect, useState } from 'react';
import { ModalDeleteConfirmation } from '../modals/delete-confirmation';

interface CrudMultiImageUploadProps {
  disabled?: boolean;
  onChange?: (images: IImageInputFile[]) => void;
}

const CrudMultiImageUpload = ({ disabled = false, onChange }: CrudMultiImageUploadProps) => {
  const { currentCompany, getUser, setCurrentCompany, setCurrentUser, currentUser } =
    useAuthContext();
  const awsUrl = import.meta.env.VITE_APP_AWS_URL;

  const [deleteImgUrl, setDeleteImgUrl] = useState<string | undefined>('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const [images, setImages] = useState<IImageInputFile[]>(
    currentCompany?.photo_gallery?.map((img: any) => ({
      url: `${awsUrl}/${img}`
    })) ?? []
  );

  useEffect(() => {
    setImages(
      currentCompany?.photo_gallery?.map((img: any) => ({
        url: `${awsUrl}/${img}`
      })) ?? []
    );
  }, [currentCompany, currentUser]);

  const handleImageChange = (selectedImages: IImageInputFile[]) => {
    if (!disabled) {
      setImages(selectedImages);
      onChange?.(selectedImages);
    }
  };

  const deletePhoto = async (imageUrl: string | undefined) => {
    setLoading(true);
    const res = await deleteGalleryPhoto(currentCompany?.id, imageUrl);
    if (res) {
      setLoading(false);
      const user = await getUser();
      setCurrentUser(user?.data);
      setCurrentCompany(res);
      setImages((prev) => prev.filter((image) => image.url !== imageUrl));
      handleModalToggle();
    }
  };

  return (
    <>
      <ImageInput value={images} onChange={handleImageChange} multiple disabled={disabled}>
        {({ onImageUpload }) => (
          <div
            className={`image-input-container ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div
              className="add-image-placeholder border-dashed border-2 rounded-lg p-4 cursor-pointer"
              onClick={!disabled ? onImageUpload : undefined}
            >
              <div className="flex flex-col items-center justify-center">
                <KeenIcon icon="plus" className="text-xl" />
                <span className="text-sm mt-1">Add Images</span>
              </div>
            </div>

            <div className="uploaded-images grid grid-cols-8 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative group rounded-lg border overflow-hidden">
                  <img
                    src={image.url ? image.url : image.dataURL}
                    alt={`uploaded-${index}`}
                    className="w-full h-full object-cover"
                  />

                  {!disabled && (
                    <div
                      className="absolute top-1 right-1 bg-gray-100 rounded-full p-1 cursor-pointer group-hover:bg-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModalToggle();
                        setDeleteImgUrl(image.url);
                        setShowModal(!showModal);
                      }}
                    >
                      <KeenIcon icon="cross" className="text-sm" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </ImageInput>
      {
        <ModalDeleteConfirmation
          open={isModalOpen}
          onOpenChange={handleModalToggle}
          onDeleteConfirm={() => {
            deletePhoto(deleteImgUrl);
          }}
          loading={loading}
        />
      }
    </>
  );
};

export { CrudMultiImageUpload };
