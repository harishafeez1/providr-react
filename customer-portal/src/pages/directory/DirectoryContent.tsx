import { PropertyCard } from './blocks';

const DirectoryContent = ({ providers }: any) => {
  return (
    <>
      <main className="w-full px-8 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {providers.map((provider: any) => (
            <div className="card-border card-rounded p-4">
              <PropertyCard key={provider.id} data={provider} />
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export { DirectoryContent };
