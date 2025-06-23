import { Card, CardContent } from '@/components/ui/card';

const OurQualifications = ({ data }: any) => {
  return (
    <div className="flex-1">
      <h2 className="font-bold text-2xl my-6 text-[#222222]">My qualifications</h2>

      <Card className="h-[230px] shadow-xl rounded-3xl p-4">
        <CardContent className="flex flex-col gap-2 items-center justify-center">
          {data?.business_logo && (
            <div className="w-[104px] h-[104px]">
              <img
                src={
                  data?.business_logo
                    ? `${import.meta.env.VITE_APP_AWS_URL}/${data?.business_logo}`
                    : ''
                }
                alt=""
                className="h-full w-full object-cover rounded-full ring-white ring-2"
              />
            </div>
          )}
          <div className="font-bold text-black text-center line-clamp-2">{data?.name || ''}</div>
          <div className="text-[#6a6a6a] text-xs">Provider</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OurQualifications;
