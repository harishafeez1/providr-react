interface IOverviewItem {
  overview: string;
}

const Overview = () => {
  const items: IOverviewItem = {
    overview: 'this is the overview'
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Overview</h3>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="flex flex-wrap items-center p-7">
          <span className="text-sm text-gray-900">{items.overview}</span>
        </div>
      </div>
    </div>
  );
};

export { Overview, type IOverviewItem };
