import React, { useEffect, useState } from 'react'
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  overflow: 'hidden',
}

const centerDefault = {
  lat: 0,
  lng: 0,
}

export const MapView = ({ location }: { location: string }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  })

  useEffect(() => {
    if (!location || !isLoaded) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: location }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const { lat, lng } = results[0].geometry.location
        setPosition({ lat: lat(), lng: lng() })
      } else {
        setPosition(null)
      }
    })
  }, [location, isLoaded])

  if (loadError) return <div>Error loading maps</div>
  if (!isLoaded) return <div>Loading Maps...</div>

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={position || centerDefault}
        zoom={position ? 14 : 2}
        options={{
          fullscreenControl: false,
          streetViewControl: true,
          mapTypeControl: false,
        }}
      >
        {position && (
          <Marker
            position={position}
            icon={{
              url: "/spider.svg",
              scaledSize: new google.maps.Size(40, 40), // adjust width & height
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
