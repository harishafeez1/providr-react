import 'leaflet/dist/leaflet.css';

interface IProfileRow {
  icon: string;
  text: string;
  info: boolean;
}
interface IProfileRows extends Array<IProfileRow> {}

interface IProfileProduct {
  label: string;
}
interface IProfileProducts extends Array<IProfileProduct> {}

const CompanyProfile = () => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Requested Service</h3>
      </div>
      <div className="card-body">
        <h3 className="text-base font-semibold text-gray-900 leading-none mb-5">Support Work</h3>

        <div className="grid gap-2.5 mb-7">
          <p className="text-sm text-gray-800 leading-5.5">
            Now that I’m done thoroughly mangling that vague metaphor, let’s get down to business.
            You know you need to start blogging to grow your business, but you don’t know how. In
            this post, I’ll show you how to write a great blog post in five simple steps that people
            will actually want to read.
          </p>
        </div>
      </div>
    </div>
  );
};

export {
  CompanyProfile,
  type IProfileRow,
  type IProfileRows,
  type IProfileProduct,
  type IProfileProducts
};
