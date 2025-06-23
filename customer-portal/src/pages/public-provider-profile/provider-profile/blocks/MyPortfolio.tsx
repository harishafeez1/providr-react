import { useState } from 'react';
import { ImageCarouselModal } from './GalleryCarousel';

const MyPortfolio = ({ PortfolioImages }: any) => {
  const images =
    PortfolioImages?.photo_gallery?.map(
      (img: string) => `${import.meta.env.VITE_APP_AWS_URL}/${img}`
    ) || [];

  const [openModal, setOpenModal] = useState(false);
  const [clickedIndex, setClickedIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setClickedIndex(index);
    setOpenModal(true);
  };

  return (
    <>
      <h2 className="font-bold text-xl my-6 text-[#222222]">My Portfolio</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 overflow-hidden rounded-[36px] md:h-[442px] my-2">
        {images.slice(0, 3).map((src: string, idx: number) => (
          <div
            key={idx}
            className={`
        cursor-pointer
        ${idx === 0 ? 'md:col-span-2 md:row-span-2' : ''}
      `}
            onClick={() => handleImageClick(idx)}
          >
            <img src={src} alt="" className="w-full h-full object-cover rounded-md" />
          </div>
        ))}
      </div>

      <ImageCarouselModal
        images={images}
        openIndex={clickedIndex}
        open={openModal}
        onOpenChange={setOpenModal}
      />
    </>
  );
};

export { MyPortfolio };
