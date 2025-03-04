import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { KeenIcon } from '@/components';

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

const Premises = () => {
  const rows: IProfileRows = [
    {
      icon: 'map',
      text: 'Herengracht 501, 1017 BV Amsterdam, NL',
      info: false
    }
  ];

  const renderRows = (row: IProfileRow, index: number) => {
    return (
      <div key={index} className="flex items-center gap-2.5">
        <span>
          <KeenIcon icon={row.icon} className="text-lg text-gray-500" />
        </span>
        {row.info ? (
          <a href={row.text} className="link text-sm font-medium">
            {row.text}
          </a>
        ) : (
          <span className="text-sm text-gray-900">{row.text}</span>
        )}
      </div>
    );
  };

  const customIcon = L.divIcon({
    html: `<i class="ki-solid ki-geolocation text-3xl text-success"></i>`,
    className: 'leaflet-marker',
    bgPos: [10, 10],
    iconAnchor: [20, 37],
    popupAnchor: [0, -37]
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Premises</h3>
      </div>
      <div className="card-body">
        <div className="flex flex-wrap items-center gap-5 mb-5">
          <MapContainer
            center={[40.725, -73.985]}
            zoom={30}
            className="rounded-xl w-full md:w-[90vh] min-h-[40vh]"
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[40.724716, -73.984789]} icon={customIcon}>
              <Popup>430 E 6th St, New York, 10009.</Popup>
            </Marker>
          </MapContainer>
        </div>
        <div className="flex flex-wrap items-center gap-5 ">
          <div className="flex flex-col gap-2.5">
            {rows.map((row, index) => {
              return renderRows(row, index);
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export {
  Premises,
  type IProfileRow,
  type IProfileRows,
  type IProfileProduct,
  type IProfileProducts
};
