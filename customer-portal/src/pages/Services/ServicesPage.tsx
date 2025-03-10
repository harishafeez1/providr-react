import { Fragment, useEffect } from 'react';
import ServicesContent from './ServicesContent';
import { getAllServices } from '@/services/api/all-services';

const ServicesPage = () => {
  useEffect(() => {
    const getServices = async () => {
      await getAllServices();
    };

    getServices();
  }, []);

  return (
    <Fragment>
      <ServicesContent />
    </Fragment>
  );
};

export { ServicesPage };
