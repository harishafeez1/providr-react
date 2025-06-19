// components/ImageCarouselModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';

interface ImageCarouselModalProps {
  images: string[];
  openIndex: number;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export const ImageCarouselModal = ({
  images,
  openIndex,
  open,
  onOpenChange
}: ImageCarouselModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(openIndex);
  useEffect(() => {
    setCurrentIndex(openIndex);
  }, [openIndex]);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-screen h-full p-0 bg-white">
        <DialogHeader className="flex justify-center">
          <DialogTitle className="font-montserrat">{`${currentIndex + 1} of ${images?.length || 0}`}</DialogTitle>
        </DialogHeader>
        <div className="relative w-full h-[80vh] flex items-center justify-center bg-white">
          <button onClick={handlePrev} className="absolute left-4 text-black text-2xl z-10">
            ‹
          </button>

          <img
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            className="max-h-[70vh] max-w-full object-contain"
          />

          <button onClick={handleNext} className="absolute right-4 text-black text-2xl z-10">
            ›
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
