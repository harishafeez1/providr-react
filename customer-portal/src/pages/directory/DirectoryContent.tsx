import { PropertyCard } from './blocks';
const properties = [
  {
    id: 1,
    imageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop',
    title: 'Modern Villa with Ocean View',
    location: 'Malibu, California',
    price: 550,
    rating: 4.95,
    dates: 'Mar 1-6'
  },
  {
    id: 2,
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    title: 'Cozy Mountain Cabin',
    location: 'Aspen, Colorado',
    price: 300,
    rating: 4.89,
    dates: 'Mar 10-15'
  },
  {
    id: 3,
    imageUrl:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
    title: 'Luxury Beachfront House',
    location: 'Miami Beach, Florida',
    price: 450,
    rating: 4.92,
    dates: 'Mar 5-10'
  },
  {
    id: 4,
    imageUrl:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop',
    title: 'Downtown Penthouse',
    location: 'New York City, New York',
    price: 600,
    rating: 4.88,
    dates: 'Mar 15-20'
  },
  {
    id: 5,
    imageUrl:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop',
    title: 'Rustic Farmhouse',
    location: 'Nashville, Tennessee',
    price: 250,
    rating: 4.96,
    dates: 'Mar 8-13'
  },
  {
    id: 6,
    imageUrl:
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=2084&auto=format&fit=crop',
    title: 'Desert Oasis Villa',
    location: 'Scottsdale, Arizona',
    price: 400,
    rating: 4.91,
    dates: 'Mar 12-17'
  },
  {
    id: 7,
    imageUrl:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070&auto=format&fit=crop',
    title: 'Lake House Retreat',
    location: 'Lake Tahoe, Nevada',
    price: 350,
    rating: 4.93,
    dates: 'Mar 20-25'
  },
  {
    id: 8,
    imageUrl:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop',
    title: 'Historic Downtown Loft',
    location: 'Charleston, South Carolina',
    price: 280,
    rating: 4.87,
    dates: 'Mar 25-30'
  },
  {
    id: 9,
    imageUrl:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop',
    title: 'Modern Villa with Ocean View',
    location: 'Malibu, California',
    price: 550,
    rating: 4.95,
    dates: 'Mar 1-6'
  },
  {
    id: 10,
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    title: 'Cozy Mountain Cabin',
    location: 'Aspen, Colorado',
    price: 300,
    rating: 4.89,
    dates: 'Mar 10-15'
  },
  {
    id: 11,
    imageUrl:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop',
    title: 'Luxury Beachfront House',
    location: 'Miami Beach, Florida',
    price: 450,
    rating: 4.92,
    dates: 'Mar 5-10'
  },
  {
    id: 12,
    imageUrl:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2070&auto=format&fit=crop',
    title: 'Downtown Penthouse',
    location: 'New York City, New York',
    price: 600,
    rating: 4.88,
    dates: 'Mar 15-20'
  },
  {
    id: 13,
    imageUrl:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop',
    title: 'Rustic Farmhouse',
    location: 'Nashville, Tennessee',
    price: 250,
    rating: 4.96,
    dates: 'Mar 8-13'
  },
  {
    id: 14,
    imageUrl:
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=2084&auto=format&fit=crop',
    title: 'Desert Oasis Villa',
    location: 'Scottsdale, Arizona',
    price: 400,
    rating: 4.91,
    dates: 'Mar 12-17'
  },
  {
    id: 15,
    imageUrl:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=2070&auto=format&fit=crop',
    title: 'Lake House Retreat',
    location: 'Lake Tahoe, Nevada',
    price: 350,
    rating: 4.93,
    dates: 'Mar 20-25'
  },
  {
    id: 16,
    imageUrl:
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop',
    title: 'Historic Downtown Loft',
    location: 'Charleston, South Carolina',
    price: 280,
    rating: 4.87,
    dates: 'Mar 25-30'
  }
];

const DirectoryContent = () => {
  return (
    <>
      <main className="w-full px-8 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {properties.map((property) => (
            <PropertyCard key={property.id} data={property} />
          ))}
        </div>
      </main>
    </>
  );
};

export { DirectoryContent };
