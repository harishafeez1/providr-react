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
      <h3 className="font-semibold">My Portfolio</h3>

      <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden h-[442px] my-2">
        {images.slice(0, 3).map((src: string, idx: number) => (
          <div
            key={idx}
            className={`${idx === 0 ? 'col-span-2 row-span-2' : 'col-span-1'} cursor-pointer`}
            onClick={() => handleImageClick(idx)}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
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
