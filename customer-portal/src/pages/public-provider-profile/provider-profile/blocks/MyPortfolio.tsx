const MyPortfolio = ({ PortfolioImages }: any) => {
  return (
    <>
      <h3 className="font-semibold">My Portfolio</h3>

      <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden h-[442px] my-2">
        {/* Big Image on the left (spans 2 rows) */}
        <div className="col-span-2 row-span-2">
          <img
            src={`${import.meta.env.VITE_APP_AWS_URL}/${PortfolioImages?.photo_gallery?.[0]}`}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* First small image on the right */}
        {PortfolioImages?.photo_gallery?.[1] && (
          <div className="col-span-1">
            <img
              src={`${import.meta.env.VITE_APP_AWS_URL}/${PortfolioImages?.photo_gallery?.[1]}`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Second small image on the right */}
        {PortfolioImages?.photo_gallery?.[2] && (
          <div className="col-span-1">
            <img
              src={`${import.meta.env.VITE_APP_AWS_URL}/${PortfolioImages?.photo_gallery?.[2]}`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </>
  );
};

export { MyPortfolio };
