"use client";

import { useState, useEffect, useRef } from "react";

interface Coords {
  lat: number;
  lng: number;
}

function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

export function useGeolocationTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [coordinates, setCoordinates] = useState<Coords[]>([]);
  const [distance, setDistance] = useState(0); // in kilometers
  const [currentSpeed, setCurrentSpeed] = useState<number | null>(null); // in km/h
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const prevCoordsRef = useRef<Coords | null>(null);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolokasi tidak didukung oleh browser Anda");
      return;
    }

    setCoordinates([]);
    setDistance(0);
    setCurrentSpeed(null);
    setError(null);
    setIsTracking(true);
    prevCoordsRef.current = null;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        const currentCoords = { lat: latitude, lng: longitude };

        setCoordinates((prev) => [...prev, currentCoords]);

        // Speed is in m/s, convert to km/h
        if (speed !== null && speed !== undefined) {
          setCurrentSpeed(Math.round(speed * 3.6));
        } else {
          setCurrentSpeed(null);
        }

        if (prevCoordsRef.current) {
          const stepDistance = calculateHaversine(
            prevCoordsRef.current.lat,
            prevCoordsRef.current.lng,
            latitude,
            longitude
          );

          // Filtering tiny GPS drifts (e.g. less than 5 meters)
          if (stepDistance > 0.005) {
            setDistance((prevDist) => prevDist + stepDistance);
            prevCoordsRef.current = currentCoords;
          }
        } else {
          prevCoordsRef.current = currentCoords;
        }
      },
      (err) => {
        console.error("GPS error:", err);
        let errorMsg = "Gagal mengakses GPS";
        if (err.code === err.PERMISSION_DENIED) {
          errorMsg = "Izin GPS ditolak oleh pengguna";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          errorMsg = "Informasi posisi GPS tidak tersedia";
        } else if (err.code === err.TIMEOUT) {
          errorMsg = "Waktu permintaan posisi GPS habis";
        }
        setError(errorMsg);
        setIsTracking(false);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    prevCoordsRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    isTracking,
    coordinates,
    distance: parseFloat(distance.toFixed(3)), // 3 decimal places (meter precision)
    currentSpeed,
    error,
    startTracking,
    stopTracking,
    resetTracking: () => {
      setCoordinates([]);
      setDistance(0);
      setCurrentSpeed(null);
      setError(null);
    },
  };
}
