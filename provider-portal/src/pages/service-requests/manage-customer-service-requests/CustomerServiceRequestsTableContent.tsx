import { NavbarMenu } from '@/partials/menu/NavbarMenu';
import { CustomerServiceRequestsTable } from './blocks';

const CustomerServiceRequestsTableContent = () => {
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
      <CustomerServiceRequestsTable />
    </div>
  );
};

export { CustomerServiceRequestsTableContent };
