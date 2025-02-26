import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ModalDeleteConfirmation } from '@/pages/directory';
import { toAbsoluteUrl } from '@/utils/Assets';
import { useState } from 'react';
// import { Heart, Star } from 'react-icons/fa';
// import cn from 'classnames';

interface ITagsItem {
  label: string;
}
interface ITagsItems extends Array<ITagsItem> {}

interface ILocationProps {
  image: string;
  title: string;
  description: string;
  rating: number;
  comments_number: number;
  participant_endorsements?: ITagsItems;
  location: string;
  dates: string;
  price: number;
}

const CardLocation = ({
  image,
  title,
  description,
  rating,
  comments_number,
  participant_endorsements,
  location,
  dates,
  price
}: ILocationProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const handleModalOpen = (id: any) => {
    setIsModalOpen(true);
  };
  const renderItem = (item: ITagsItem, index: number) => {
    return (
      <span key={index} className="badge badge-sm badge-gray-200">
        {item.label}
      </span>
    );
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <img
          src={toAbsoluteUrl(`/media/images/600x400/${image}`)}
          alt={title}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute right-3 top-3 rounded-full p-2 transition hover:bg-white/10"
        >
          <KeenIcon icon="heart" className={'text-red'} />
        </button>
      </div>
      <div className="mt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <div className="flex items-center gap-1">
            <KeenIcon icon="star" className={'text-white mr-1'} />
            <span>{rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-500">{location}</p>
        <p className="text-sm text-gray-500">{dates}</p>
        <p className="mt-2">
          <span className="font-medium">${price}</span> night
        </p>
      </div>
      <ModalDeleteConfirmation
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onDeleteConfirm={async () => {}}
      />
    </div>
  );
};

export { CardLocation, type ILocationProps };
