import { ImageInput } from '@/components/image-input';
import type { IImageInputFile } from '@/components/image-input';
import { useState } from 'react';
import { useAuthContext } from '@/auth';
import { CameraIcon } from 'lucide-react';

interface CrudAvatarUploadProps {
  onChange?: (image: IImageInputFile[]) => void; // Callback to send image data to parent
}

const CrudAvatarUpload = ({ onChange }: CrudAvatarUploadProps) => {
  const { currentUser } = useAuthContext();
  const businessLogo = currentUser?.provider_company?.business_logo
    ? `${import.meta.env.VITE_APP_AWS_URL}/${currentUser.provider_company.business_logo}`
    : '';
  const placeHolderLogo = import.meta.env.VITE_APP_AWS_URL + '/User-Avatar.png';

  const [avatar, setAvatar] = useState<IImageInputFile[]>([{ dataURL: businessLogo }]);

  const handleAvatarChange = (selectedAvatar: IImageInputFile[]) => {
    setAvatar(selectedAvatar);
    if (onChange) {
      onChange(selectedAvatar);
    }
  };

  return (
    <ImageInput value={avatar} onChange={handleAvatarChange}>
      {({ onImageUpload }) => (
        <div className="image-input size-52" onClick={onImageUpload}>
          <div
            className="image-input-placeholder rounded-full border-2 border-success image-input-empty:border-gray-300"
            // style={{ backgroundImage: `url(${toAbsoluteUrl(`/media/avatars/blank.png`)})` }}
          >
            {avatar.length > 0 && (
              <img
                src={!avatar[0].dataURL ? placeHolderLogo : avatar[0].dataURL}
                alt="avatar"
                className="object-cover w-full h-full"
              />
            )}

            <div className="flex items-center justify-center cursor-pointer h-10 left-0 right-0 bottom-0 bg-dark-clarity absolute">
              <CameraIcon className="text-white" size={20} />
            </div>
          </div>
        </div>
      )}
    </ImageInput>
  );
};

export { CrudAvatarUpload };
