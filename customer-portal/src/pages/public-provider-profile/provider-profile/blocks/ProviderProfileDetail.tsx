import React, { useState } from 'react';
import { Heart, Star, Share, Phone, Mail, Globe, Facebook, Instagram } from 'lucide-react';

import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ConnectProviderModal } from './ConnectProviderModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { StarRating } from '@/components';

interface ProviderDetailPageProps {
  data: any;
  loading: boolean;
}

const ProviderDetailPage: React.FC<ProviderDetailPageProps> = ({ data, loading }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userRatingDescription, setUserRatingDescription] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  function ListingSkeleton() {
    return (
      <div className="animate-pulse">
        <div className="h-[400px] bg-gray-200 rounded-xl mb-6"></div>
      </div>
    );
  }

  function GridListingSkeleton() {
    return (
      <div className="col-span-2">
        <div className="animate-pulse">
          <div className="h-[190px] w-full bg-gray-200 rounded-xl mb-6"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-[190px] bg-gray-200 rounded-xl mb-6"></div>
        </div>
      </div>
    );
  }

  const handleRating = (rating: number) => {
    setUserRating(rating);
  };

  const handleReviewDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserRatingDescription(e.target.value);
  };

  const handleReviewSubmission = () => {
    const reviewdata = {
      rating: userRating,
      content: userRatingDescription
    };
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <ConnectProviderModal open={isModalOpen} onOpenChange={handleModalClose} />
      {/* Property title section */}
      <div className="px-4 pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{data?.name || ''}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-sm font-medium hover:underline">
              <Share size={16} className="mr-1" />
              Share
            </button>
            <button
              onClick={toggleFavorite}
              className="flex items-center text-sm font-medium hover:underline"
            >
              <Heart
                size={16}
                className={`mr-1 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`}
              />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Photo gallery */}
      <div className="mb-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 rounded-xl overflow-hidden">
          {/* Large Main Image */}
          <div className="row-span-1 col-span-1 md:row-span-2 md:col-span-2 md-[340px] lg:h-[510px]">
            {loading ? (
              <ListingSkeleton />
            ) : (
              <img
                src={
                  data?.photo_gallery?.[0]
                    ? `${import.meta.env.VITE_APP_AWS_URL}/${data?.photo_gallery?.[0]}`
                    : `${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`
                }
                alt="company details"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>

          {/* Smaller Images */}
          {loading ? (
            <GridListingSkeleton />
          ) : data?.photo_gallery?.length > 0 ? (
            data?.photo_gallery?.slice(1, 5).map((image: any, index: number) => (
              <div key={index} className="h-48 md:h-[170px] lg:h-[250px]">
                <img
                  src={`${import.meta.env.VITE_APP_AWS_URL}/${image}`}
                  alt="details"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))
          ) : (
            // Default image when no images are available
            [...Array(2)].map((_, index) => {
              const image = data?.photo_gallery?.[index + 1] || 'man-helping-woman-for-carrier.png';
              return (
                <div key={index} className="h-48 md:h-[170px] lg:h-[250px]">
                  <img
                    src={`${import.meta.env.VITE_APP_AWS_URL}/${image}`}
                    alt="details"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left column - Property details */}
          <div className="lg:col-span-2">
            <div className="border-b pb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{data?.name || ''}</h2>
                </div>
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={
                      data?.business_logo
                        ? `${import.meta.env.VITE_APP_AWS_URL}/${data?.business_logo}`
                        : `${import.meta.env.VITE_APP_AWS_URL}/man-helping-woman-for-carrier.png`
                    }
                    alt={'company details'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Host highlights */}
            <div className="py-6">
              <h2 className="text-xl font-bold mb-2">Services</h2>
              <div className="py-6 border-b">
                <div className="grid grid-cols-1 gap-4 backdrop:gap-4">
                  {data?.service_offerings?.map((item: any) => (
                    <div key={item.id}>
                      <div className="flex justify-between">
                        <div className="flex gap-2 items-start truncate me-6">
                          <div className="space-y-2 mr-4">
                            {item.service.service_icon ? (
                              <div
                                className="h-10 w-12"
                                dangerouslySetInnerHTML={{ __html: item.service.service_icon }}
                              ></div>
                            ) : (
                              ''
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{item?.service?.name || ''}</h3>
                            <p className="text-gray-600 text-sm ">{item?.description || ''}</p>
                          </div>
                        </div>
                        <div className="flex items-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size={'sm'}>
                                View Service Detail
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                              <DialogHeader className="text-lg font-bold">
                                Service Detail
                              </DialogHeader>
                              <div className="flex flex-col justify-center flex-wrap p-4">
                                <div className="text-lg font-bold">Description</div>
                                <div className="text-sm">{item?.description || ''}</div>
                              </div>
                              <div className="text-lg font-bold ps-4 ">Areas</div>
                              <div className="flex flex-wrap p-4 items-center gap-4">
                                {item?.service_available_options?.map(
                                  (option: any, index: number) => (
                                    <div key={index} className="badge badge-sm badge-gray-100">
                                      <span>{option}</span>
                                    </div>
                                  )
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-6 border-b">
              <h2 className="text-xl font-bold mb-4">About</h2>
              <div className="ql-content">
                <div
                  className="mt-4"
                  dangerouslySetInnerHTML={{ __html: data?.description || '' }}
                ></div>
              </div>
              {/* <button className="mt-4 font-medium underline">Show more</button> */}
            </div>
          </div>

          {/* Right column - Booking widget */}
          <div className="lg:col-span-1">
            <div className="border rounded-xl p-6 shadow-lg bg-white z-10">
              <div className="flex justify-center flex-col gap-4 mb-4">
                <Button className="bg-primary" onClick={handleModalOpen}>
                  Connect with this provider
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant={'outline'}>Write A Review</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl ">
                    <DialogTitle></DialogTitle>
                    <DialogHeader className="text-lg font-bold">Review</DialogHeader>
                    <div className="flex flex-col justify-center flex-wrap p-4">
                      <div className="mb-4">
                        <div className="form-label mb-2">Please rate your experience:</div>
                        <StarRating onRatingChange={handleRating} initialRating={5} />
                      </div>
                      <div className="form-label mb-2">Please tell us about your experience:</div>
                      <Textarea
                        placeholder="Write a review..."
                        className="h-40"
                        onChange={handleReviewDescription}
                      />
                      <div className="flex justify-center mt-4">
                        <Button onClick={handleReviewSubmission}>Submit</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="flex gap-6 justify-center items-center border card-rounded p-2">
                  <Phone className="text-primary flex-shrink-0" size={18} />
                  <span className="truncate overflow-hidden whitespace-nowrap">
                    {data?.company_phone || 'N/A'}
                  </span>
                </div>
                <div className="flex gap-6 justify-center items-center border card-rounded p-2">
                  <Mail className="text-primary flex-shrink-0" size={18} />
                  <span className="truncate overflow-hidden whitespace-nowrap">
                    {data?.company_email || 'N/A'}
                  </span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex gap-6 justify-center items-center border card-rounded p-2">
                        <Globe className="text-primary flex-shrink-0" size={18} />
                        <span className="truncate overflow-hidden whitespace-nowrap">
                          {data?.company_website || 'N/A'}
                        </span>
                      </div>
                    </TooltipTrigger>
                    {data?.company_website && (
                      <TooltipContent>
                        <p className="text-sm">{data?.company_website || 'N/A'}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                <div className="flex justify-around">
                  {data?.facebook_url ? (
                    <a
                      href={data.facebook_url}
                      className="cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Facebook className="text-primary" size={22} />
                    </a>
                  ) : (
                    <Facebook className="text-primary" size={22} />
                  )}

                  {data?.instagram_url ? (
                    <a
                      href={data.instagram_url}
                      className="cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="text-primary" size={22} />
                    </a>
                  ) : (
                    <Instagram className="text-primary" size={22} />
                  )}
                </div>
              </div>
            </div>
            <div className="card card-rounded p-4 mt-4 shadow-lg card-white">
              <div className="card-title">Service Areas</div>
              <ScrollArea className="h-40">
                <div className="flex flex-col gap-2 truncate p-2">
                  {Array.isArray(data?.addresses_collection) &&
                    (data?.addresses_collection || [])?.map((item: any, index: number) => (
                      <div key={index} className="badge bg-white border border-gray-300 text-sm">
                        {item || ''}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
            <div className="card card-rounded p-4 mt-4 shadow-lg card-white">
              <div className="card-title">Access Method</div>

              <div className="flex flex-col gap-2 truncate p-2">
                {Array.isArray(data?.access_method_collection) &&
                  (data?.access_method_collection || [])?.map((item: any, index: number) => (
                    <div key={index} className="badge bg-white border border-gray-300 text-sm">
                      {item || ''}
                    </div>
                  ))}
              </div>
            </div>
            <div className="card card-rounded p-4 mt-4 shadow-lg card-white">
              <div className="card-title">Age Groups</div>

              <div className="flex flex-col gap-2 truncate p-2">
                {Array.isArray(data?.age_group_collection) &&
                  (data?.age_group_collection || [])?.map((item: any, index: number) => (
                    <div key={index} className="badge bg-white border border-gray-300 text-sm">
                      {item || ''}
                    </div>
                  ))}
              </div>
            </div>
            <div className="card card-rounded p-4 mt-4 shadow-lg card-white">
              <div className="card-title">Languages</div>

              <div className="flex flex-col gap-2 truncate p-2">
                {Array.isArray(data?.language_collection) &&
                  data.language_collection.map((item: string, index: number) => (
                    <div key={index} className="badge bg-white border border-gray-300 text-sm">
                      {item}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews section */}
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
    </div>
  );
};

export default ProviderDetailPage;
