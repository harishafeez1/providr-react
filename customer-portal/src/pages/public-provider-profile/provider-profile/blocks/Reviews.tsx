import { format } from 'date-fns';
import { Star } from 'lucide-react';
import React from 'react';

const Reviews = ({ data }: any) => {
  return (
    <div id="reviews" className="px-4 py-12">
      <div className="flex items-center mb-6">
        <Star size={20} className="text-black" />
        <span className="ml-2 text-xl font-bold">{data?.total_reviews} reviews</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Review cards would go here */}
        {data?.reviews?.map((item: any) => (
          <div key={item.id} className="border-b pb-6">
            <div className="flex items-center mb-4">
              <div>
                <h3 className="font-medium">{`${item.customer.first_name} ${item.customer.last_name || ''}`}</h3>
                <p className="text-gray-500 text-sm">{format(item.created_at, 'dd MM yyyy')}</p>
              </div>
            </div>
            <p className="text-gray-700">{item.content || ''}</p>
          </div>
        ))}
      </div>

      {/* <button className="mt-8 px-6 py-2 border border-gray-900 rounded-lg font-medium">
          Show all 73 reviews
        </button> */}
    </div>
  );
};

export { Reviews };
