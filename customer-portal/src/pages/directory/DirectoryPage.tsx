import { Fragment, useState } from 'react';
import { DirectoryContent, FilterModal } from './';
import { Navbar, NavbarActions } from '@/partials/navbar';
import { PageMenu } from './blocks/PageMenu';
import { KeenIcon } from '@/components';

const DirectoryPage = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  return (
    <Fragment>
      <Navbar>
        <div className="flex w-full items-center justify-between border-b px-8 py-5 ">
          <PageMenu />
          <NavbarActions>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 rounded-xl border px-4 py-2 hover:shadow-md transition"
            >
              <KeenIcon icon="filter" className="w-5 h-5" />
              <span>Filters</span>
            </button>

            <FilterModal open={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
          </NavbarActions>
        </div>
      </Navbar>
      <DirectoryContent />
    </Fragment>
  );
};

export { DirectoryPage };
