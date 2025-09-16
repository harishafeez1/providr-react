import { NavbarMenu } from '@/partials/menu/NavbarMenu';
import { CustomerServiceRequestsTable } from './blocks';

const CustomerServiceRequestsTableContent = () => {
  const menuConfig = [
    {
      title: 'Direct Requests',
      path: '/service-request/my-service-request'
    },
    {
      title: 'Open requests',
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
