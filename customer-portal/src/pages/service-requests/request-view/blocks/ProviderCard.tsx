import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getConnectedProvider, getSingleServiceRequests } from '@/services/api/service-requests';
import { Heart, MessageCircleMore, Phone, Star } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const ProviderCard = ({ data, comapnyId }: any) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const truncateText = (htmlString: string, length: number) => {
    const text = new DOMParser().parseFromString(htmlString, 'text/html').body.textContent || '';
    return text.length > length ? text.substring(0, length) + '...' : text;
  };
  const { id } = useParams();

  const providerCantContact = String(data?.id) === String(comapnyId);

  const handleProviderConnection = async () => {
    const res = await getConnectedProvider(data?.id, data?.pivot?.service_request_id);
    if (res) {
      await getSingleServiceRequests(id);
    }
  };

  return (
    <Card className="group rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl bg-white h-full">
      <CardContent className="p-0">
        {/* Connection Status / Button */}
        <div className="p-4 text-center">
          {comapnyId == null || comapnyId == '' ? (
            <Button onClick={handleProviderConnection} className="rounded-full" size="lg">
              Connect
            </Button>
          ) : comapnyId !== null ? (
            <div className="flex justify-center">
              <Badge
                variant={data?.pivot?.status === 'Completed' ? 'default' : 'secondary'}
                className={cn(
                  'px-4 py-2 text-sm font-medium',
                  data?.pivot?.status === 'Completed'
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                )}
              >
                {data?.pivot?.status}
              </Badge>
            </div>
          ) : null}
        </div>

        {/* Image Section */}
        <div className="relative p-4">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
            <Link to={`/provider-profile/${data?.id}`}>
              <img
                src={
                  data?.business_logo
                    ? `${import.meta.env.VITE_APP_AWS_URL}/${data?.business_logo}`
                    : data?.imageUrl
                }
                alt={data?.name || 'company name'}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </Link>

            {/* Favorite Button */}
            <button
              className="absolute right-3 top-3 rounded-full bg-white/20 backdrop-blur-sm p-2 transition-all duration-200 hover:bg-white/30 hover:scale-110"
              onClick={(e) => {
                e.preventDefault(), setIsFavorite(!isFavorite);
              }}
            >
              <Heart
                className={cn(
                  'h-5 w-5 transition-colors duration-200',
                  isFavorite ? 'fill-red-500 stroke-red-500' : 'stroke-white fill-white/20'
                )}
              />
            </button>

            {/* Reviews Badge */}
            {data?.review_stats && (
              <div className="absolute bottom-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-lg">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <MessageCircleMore className="h-4 w-4 text-purple-600" />
                  <span>{data?.review_stats ? data?.review_stats?.total_reviews : 0} reviews</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 pt-0">
          {/* Header with Name and Rating */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2 flex-1">
              {data?.name || ''}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 rounded-full px-2 py-1 shrink-0">
              <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
              <span className="text-sm font-semibold text-amber-700">
                {data?.review_stats ? data?.review_stats?.average_rating : 0}
              </span>
            </div>
          </div>

          {/* Location */}
          <p className="text-sm text-gray-500 mb-3 font-medium">📍 {data?.location || ''}</p>

          {/* Description */}
          <div className="mb-4">
            <div
              className="text-sm text-gray-600 leading-relaxed ql-content"
              dangerouslySetInnerHTML={{
                __html: truncateText(data?.description || '', 20)
              }}
            />
          </div>

          {/* Contact Status */}
          <div className="flex justify-center">
            {data?.pivot?.customer_contacted === 1 ? (
              <div className="flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-sm font-medium text-green-700">
                <Phone className="h-4 w-4" />
                Already Contacted
              </div>
            ) : (
              providerCantContact && (
                <div className="flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700">
                  <Phone className="h-4 w-4" />
                  Contact You Soon
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { ProviderCard };
