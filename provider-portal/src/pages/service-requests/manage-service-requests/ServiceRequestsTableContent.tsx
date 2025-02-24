import { ServiceRequestsTable } from './blocks';
import { NavbarMenu } from '@/partials/menu/NavbarMenu';

const ServiceRequestsTableContent = () => {
  const menuConfig = [
    {
      title: 'Connected Requests',
      path: '/service-request/my-service-request'
    },
    {
      title: 'Customer Service Requests',
      path: '/service-request/customer-service-request'
    }
  ];

  return (
    <div className="grid gap-5 lg:gap-7.5">
      {/* <Cards /> */}
      <NavbarMenu items={menuConfig} />
      <ServiceRequestsTable />
    </div>
  );
};

export { ServiceRequestsTableContent };
