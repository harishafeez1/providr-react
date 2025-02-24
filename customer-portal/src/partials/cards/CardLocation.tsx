import { KeenIcon } from '@/components';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ModalDeleteConfirmation } from '@/pages/company/blocks/ModalDeleteConfirmation';
import { toAbsoluteUrl } from '@/utils/Assets';
import { useState } from 'react';
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
}

const CardLocation = ({
  image,
  title,
  description,
  rating,
  comments_number,
  participant_endorsements
}: ILocationProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <div className="card w-[280px] border-0 mb-4">
      <img
        src={toAbsoluteUrl(`/media/images/600x400/${image}`)}
        className="rounded-t-xl max-w-[280px] shrink-0"
        alt=""
      />
      <div className="card-border card-rounded-b px-3.5 h-full pt-3 pb-3.5">
        <a href="#" className="font-medium block text-gray-900 hover:text-primary text-md mb-2">
          {title}
        </a>
        <div className=" py-3">
          <Button variant="light" size="sm" onClick={handleModalOpen}>
            connect
          </Button>
        </div>
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, index) => (
            <KeenIcon
              key={index}
              icon="star"
              className={index < rating ? 'text-yellow-500 mr-1' : 'text-gray-400 mr-1'}
            />
          ))}
          <KeenIcon icon="message-text-2" />
          <span className="text-sm text-gray-500 ml-1">{comments_number}</span>
        </div>
        <p className="text-2sm text-gray-700">{description}</p>
        {participant_endorsements && (
          <>
            <Separator className="my-2" />
            <div className="flex flex-wrap gap-2.5 mb-2">
              {participant_endorsements.map((item, index) => {
                return renderItem(item, index);
              })}
            </div>
          </>
        )}
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
