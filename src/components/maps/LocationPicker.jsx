import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';

// Fix for default Leaflet icon issue with bundlers like Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Lokasi Pilihan</Popup>
    </Marker>
  );
};

export default function LocationPicker({ onLocationSelect, initialPosition = { lat: -6.2088, lng: 106.8456 } }) {
  const [position, setPosition] = useState(null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-center text-gray-600">Klik pada peta untuk memilih lokasi pengantaran.</p>
      <MapContainer center={initialPosition} zoom={13} scrollWheelZoom={true} style={{ height: '400px', width: '100%', borderRadius: '1rem', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      {position && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Lokasi terpilih: Lat: {position.lat.toFixed(5)}, Lng: {position.lng.toFixed(5)}
          </p>
          <Button onClick={() => onLocationSelect(position)} className="mt-2 bg-blue-600 hover:bg-blue-700">
            Konfirmasi Lokasi Ini
          </Button>
        </div>
      )}
    </div>
  );
}