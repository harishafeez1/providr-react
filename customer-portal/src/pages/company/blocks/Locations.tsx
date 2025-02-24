import React, { useState } from 'react';
import { CardLocation } from '@/partials/cards';

interface ITagsItem {
  label: string;
}
interface ITagsItems extends Array<ITagsItem> {}
interface ILocationsItem {
  image: string;
  title: string;
  description: string;
  participant_endorsements?: ITagsItems;
}

interface ILocationsItems extends Array<ILocationsItem> {}

const Locations = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const items: ILocationsItems = [
    {
      image: '10.jpg',
      title: 'Duolingo Tech Hub',
      description: '456 Innovation Street, Floor 6, Techland, New York 54321',
      participant_endorsements: [
        { label: 'Web Design' },
        { label: 'Code Review' },
        { label: 'Figma' },
        { label: 'Product Development' },
        { label: 'Webflow' },
        { label: 'AI' },
        { label: 'noCode' },
        { label: 'Management' }
      ]
    },
    {
      image: '11.jpg',
      title: 'Duolingo Language Lab',
      description: '789 Learning Lane, 3rd Floor, Lingoville, Texas 98765',
      participant_endorsements: [
        { label: 'Web Design' },
        { label: 'Code Review' },
        { label: 'Figma' },
        { label: 'Product Development' },
        { label: 'Webflow' },
        { label: 'AI' },
        { label: 'noCode' },
        { label: 'Management' }
      ]
    },
    {
      image: '12.jpg',
      title: 'Duolingo Research Institute',
      description: '246 Innovation Road, Research Wing, Innovacity, Arizona 13579',
      participant_endorsements: [
        { label: 'Web Design' },
        { label: 'Code Review' },
        { label: 'Figma' },
        { label: 'Product Development' },
        { label: 'Webflow' },
        { label: 'AI' },
        { label: 'noCode' },
        { label: 'Management' }
      ]
    },
    {
      image: '7.jpg',
      title: 'Duolingo Research Institute',
      description: '246 Innovation Road, Research Wing, Innovacity, Arizona 13579'
    },
    {
      image: '8.jpg',
      title: 'Duolingo Research Institute',
      description: '246 Innovation Road, Research Wing, Innovacity, Arizona 13579'
    }
  ];

  const renderItem = (item: ILocationsItem, index: number) => {
    return (
      <CardLocation
        key={index}
        image={item.image}
        title={item.title}
        description={item.description}
        participant_endorsements={item?.participant_endorsements}
        comments_number={5}
        rating={4}
      />
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  gap-5">
        {items
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((item, index) => {
            return renderItem(item, index);
          })}
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="badge disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2 mx-1">
          Page {currentPage} of {Math.ceil(items.length / itemsPerPage)}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === Math.ceil(items.length / itemsPerPage)}
          className="badge disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </>
  );
};

export { Locations, type ILocationsItem, type ILocationsItems };
