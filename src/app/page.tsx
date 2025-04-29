'use client'
import Navbar from "@/components/Header";
import "mapbox-gl/dist/mapbox-gl.css";
import Map, { Marker } from 'react-map-gl/mapbox';
import React from "react";


export default function Home() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  return (
    <div className="flex flex-col h-screen w-full">
      <Navbar />
      <div>
        <Map
          initialViewState={{
            latitude: 35.770787, 
            longitude: 10.828034,
            zoom: 14,
          }}
          style={{ width: "100%", height: "100vh" }}
          mapStyle="mapbox://styles/mapbox/light-v10"
          mapboxAccessToken={mapboxToken}
        >
          <Marker latitude={35.770787} longitude={10.828034} color="blue" />
        </Map>
      </div>
    </div>
  );
}
