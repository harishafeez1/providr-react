import { NavbarMenu } from '@/partials/menu/NavbarMenu';
import { useEffect, useState } from 'react';

export interface IServices {
  id: number;
  name: string;
  path?: string;
  service_icon: string;
}

interface PageMenuProps {
  services: IServices[];
  loading: boolean;
}

function ServicesSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 w-12 bg-gray-200 mb-2 rounded-full"></div>
      <div className="space-y-1">
        <div className="h-4 w-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

const getSkeletonCount = () => {
  if (window.matchMedia('(max-width: 640px)').matches) {
    return 5; // xs screens
  } else if (window.matchMedia('(max-width: 768px)').matches) {
    return 10; // sm screens
  } else if (window.matchMedia('(max-width: 1024px)').matches) {
    return 14; // md screens
  } else if (window.matchMedia('(max-width: 1280px)').matches) {
    return 16; // lg screens
  } else if (window.matchMedia('(max-width: 1536px)').matches) {
    return 18; // lg screens
  } else {
    return 28; // xl and above
  }
};

const PageMenu: React.FC<PageMenuProps> = ({ services, loading }) => {
  const [skeletonCount, setSkeletonCount] = useState(
    typeof window !== 'undefined' ? getSkeletonCount() : 5
  );

  useEffect(() => {
    const updateSkeletonCount = () => {
      setSkeletonCount(getSkeletonCount());
    };

    // Run on mount (though initial value is already set)
    updateSkeletonCount();

    // Add resize listener
    window.addEventListener('resize', updateSkeletonCount);

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', updateSkeletonCount);
  }, []);

  return (
    <div className="w-[90%]">
      {loading ? (
        <div className="flex space-x-4">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <ServicesSkeleton key={index} />
          ))}
        </div>
      ) : (
        <NavbarMenu type={true} items={services} loading={loading} />
      )}
    </div>
  );
};

export { PageMenu };
