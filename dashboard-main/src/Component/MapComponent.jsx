import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import PropTypes from 'prop-types';
import RedArrowIcon from '../assests/red-arrow.png'; // adapte le chemin

const customIcon = new L.Icon({
  iconUrl: RedArrowIcon,
  iconSize: [38, 38], // taille de l'image
  iconAnchor: [19, 38], // point d’ancrage
  popupAnchor: [0, -38],
});

const MapComponent = ({ position }) => {
  return (
    <MapContainer center={position} zoom={13} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} icon={customIcon}>
        <Popup>
          🏥 Lhôpital est situé ici.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

MapComponent.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default MapComponent;
