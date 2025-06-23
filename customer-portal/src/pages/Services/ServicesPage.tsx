import { Fragment, useEffect } from 'react';
import ServicesContent from './ServicesContent';
import { getAllServicesToTransform } from '@/services/api/all-services';

const ServicesPage = () => {
  useEffect(() => {
    const getServices = async () => {
      await getAllServicesToTransform('page=1&per_page=100');
    };

    getServices();
  }, []);

  return (
    <div className="col-span-12">
      <ServicesContent />
    </div>
  );
};

export { ServicesPage };
