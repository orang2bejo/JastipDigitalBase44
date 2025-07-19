import React, { useState } from "react";

export default function LocationPicker({ onLocationSelect, initialLocation = null }) {
  const [location, setLocation] = useState(initialLocation);

  const handleLocationChange = (e) => {
    const coords = e.target.value.split(',');
    const newLocation = {
      lat: parseFloat(coords[0]) || -6.2088,
      lng: parseFloat(coords[1]) || 106.8456
    };
    setLocation(newLocation);
    onLocationSelect && onLocationSelect(newLocation);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-gray-500">
          📍 Map akan ditampilkan di sini
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Pilih lokasi pengantaran
        </p>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Koordinat (lat,lng):
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="-6.2088,106.8456"
          onChange={handleLocationChange}
          defaultValue={location ? `${location.lat},${location.lng}` : ''}
        />
        <p className="text-xs text-gray-500">
          Default: Jakarta Pusat (-6.2088,106.8456)
        </p>
      </div>
    </div>
  );
}