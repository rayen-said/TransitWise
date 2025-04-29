import { useState, useEffect } from "react";

type GeolocationData= {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    error : string | null;
};

export const useGeolocation = (): GeolocationData => {
    const [data, setData] = useState<GeolocationData>({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: null,
    });
    useEffect(() => {
        if (!navigator.geolocation) {
          setData((prev) => ({ ...prev, error: 'Geolocation is not supported' }));
          return;
        }
    
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            setData({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              error: null,
            });
          },
          (err) => {
            setData((prev) => ({
              ...prev,
              error: err.message,
            }));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
    
        return () => navigator.geolocation.clearWatch(watchId);
      }, []);
    
      return data;
    };