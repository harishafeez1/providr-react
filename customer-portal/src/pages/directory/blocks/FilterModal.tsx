import { X } from 'lucide-react';
import { useEffect } from 'react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilterModal({ isOpen, onClose }: FilterModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
          <h2 className="font-semibold">Filters</h2>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>
        <div className="p-6">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Price range</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2">Minimum</label>
                  <input
                    type="number"
                    placeholder="$"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-airbnb focus:border-transparent"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2">Maximum</label>
                  <input
                    type="number"
                    placeholder="$"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-airbnb focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Rooms and beds</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Bedrooms</label>
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        className="px-6 py-2 border rounded-full hover:border-black transition"
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Beds</label>
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        className="px-6 py-2 border rounded-full hover:border-black transition"
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Property type</h3>
              <div className="grid grid-cols-2 gap-4">
                {['House', 'Apartment', 'Guesthouse', 'Hotel'].map((type) => (
                  <button
                    key={type}
                    className="p-4 border rounded-xl text-left hover:border-black transition"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-white border-t mt-8 p-4 flex justify-between items-center">
            <button onClick={onClose} className="font-semibold underline">
              Clear all
            </button>
            <button
              onClick={onClose}
              className="bg-airbnb text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              Show results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
