import { NavbarMenu } from '@/partials/menu/NavbarMenu';

const PageMenu = () => {
  const accountMenuConfig = [
    { title: 'All', path: 'Home' },
    { title: 'Beach', path: 'Waves' },
    { title: 'Tropical', path: 'Palm' },
    { title: 'Countryside', path: 'Mountain' },
    { title: 'City', path: 'Building2' },
    { title: 'Camping', path: 'Tent' },
    { title: 'Islands', path: 'UmbrellaIcon' },
    { title: 'All', path: 'Home' },
    { title: 'Beach', path: 'Waves' },
    { title: 'Tropical', path: 'Palm' },
    { title: 'Countryside', path: 'Mountain' },
    { title: 'City', path: 'Building2' },
    { title: 'Camping', path: 'Tent' },
    { title: 'Islands', path: 'UmbrellaIcon' },
    { title: 'All', path: 'Home' },
    { title: 'Beach', path: 'Waves' },
    { title: 'Tropical', path: 'Palm' },
    { title: 'Countryside', path: 'Mountain' },
    { title: 'City', path: 'Building2' },
    { title: 'Camping', path: 'Tent' },
    { title: 'Islands', path: 'UmbrellaIcon' },
    { title: 'All', path: 'Home' },
    { title: 'Beach', path: 'Waves' },
    { title: 'Tropical', path: 'Palm' },
    { title: 'Countryside', path: 'Mountain' },
    { title: 'City', path: 'Building2' },
    { title: 'Camping', path: 'Tent' },
    { title: 'Islands', path: 'UmbrellaIcon' }
  ];

  return (
    <div className="w-[90%]">
      <NavbarMenu type={true} items={accountMenuConfig} />
    </div>
  );
};

export { PageMenu };
