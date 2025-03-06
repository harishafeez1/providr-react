import { Fragment, useEffect, useState } from 'react';
import { DirectoryContent, FilterModal } from './';
import { Navbar, NavbarActions } from '@/partials/navbar';
import { PageMenu } from './blocks/PageMenu';
import { KeenIcon } from '@/components';
import { getListoftProvider } from '@/services/api/provider-profile';

const DirectoryPage = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [providers, setProviders] = useState<any>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProviders(1);
  }, []);

  const fetchProviders = async (page: number) => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await getListoftProvider(page);
      if (res) {
        setProviders((prev : any) => [...prev, ...res.data]); 
        setCurrentPage(res.current_page);
        setLastPage(res.last_page);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <Navbar>
        <div className="flex w-full items-center justify-between border-b px-8 py-5">
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

      <DirectoryContent providers={providers} />

      {currentPage < lastPage && (
        <div className="flex justify-center mt-6">
          <button
            className="px-4 py-2 btn btn-primary rounded-lg"
            onClick={() => fetchProviders(currentPage + 1)}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </Fragment>
  );
};

export { DirectoryPage };
