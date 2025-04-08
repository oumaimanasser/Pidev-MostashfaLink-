import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const MapComponent = ({ position }) => {
  return (
    <MapContainer center={position} zoom={13} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>
          L'hôpital est situé ici.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;