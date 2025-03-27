import { NavbarMenu } from '@/partials/menu/NavbarMenu';

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

const PageMenu: React.FC<PageMenuProps> = ({ services, loading }) => {
  return (
    <div className="w-[90%] ">
      <NavbarMenu type={true} items={services} loading={loading} />
    </div>
  );
};

export { PageMenu };
