import {
  Building2,
  Home,
  Mountain,
  Palmtree as Palm,
  Tent,
  UmbrellaIcon,
  Waves,
  SlidersHorizontal
} from 'lucide-react';
import { useState } from 'react';

import { FilterModal } from './FilterModal';
import clsx from 'clsx';

const categories = [
  { label: 'All', icon: Home },
  { label: 'Beach', icon: Waves },
  { label: 'Tropical', icon: Palm },
  { label: 'Countryside', icon: Mountain },
  { label: 'City', icon: Building2 },
  { label: 'Camping', icon: Tent },
  { label: 'Islands', icon: UmbrellaIcon }
];

export function Categories() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <>
      <div className="flex w-full items-center justify-between border-b px-8 py-4">
        <div className="flex flex-nowrap w-full  scrollable-x items-center gap-8 ">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.label}
                onClick={() => setActiveCategory(category.label)}
                className={clsx(
                  'flex flex-col items-center gap-2 border-b-2 pb-2 transition whitespace-nowrap',
                  activeCategory === category.label
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-black'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm">{category.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex-1 flex justify-end">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 rounded-xl border px-4 py-2 hover:shadow-md transition"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>
      <FilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </>
  );
}
