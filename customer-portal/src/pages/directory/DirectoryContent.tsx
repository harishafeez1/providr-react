import { PropertyCard } from './blocks';

const DirectoryContent = ({ providers, loading }: any) => {
  function ListingSkeleton() {
    return (
      <div className="animate-pulse">
        <div className="h-[400px] bg-gray-200 rounded-xl mb-6"></div>
      </div>
    );
  }
  return (
    <>
      <main className="w-full">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {loading
            ? Array.from({ length: 10 }).map((_, index) => <ListingSkeleton key={index} />)
            : providers.map((provider: any) => (
                <div key={provider.id} className="card-rounded">
                  <PropertyCard data={provider} />
                </div>
              ))}
        </div>
      </main>
    </>
  );
};

export { DirectoryContent };
