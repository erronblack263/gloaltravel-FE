'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// Dynamically import MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

interface Location {
  id: number
  name: string
  latitude: string
  longitude: string
  type: 'destination' | 'resort'
  address?: string
  city?: string
  country?: string
  star_rating?: number
  price_per_night?: string
  amenities?: string[]
  images?: string[]
}

interface MapComponentProps {
  locations: Location[]
  center?: [number, number]
  zoom?: number
  height?: string
  onLocationClick?: (location: Location) => void
}

export default function MapComponent({ 
  locations, 
  center = [0, 0], 
  zoom = 2,
  height = '400px',
  onLocationClick 
}: MapComponentProps) {
  const mapRef = useRef<any>(null)
  const [isClient, setIsClient] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Setup Leaflet icons after component mounts
    if (typeof window !== 'undefined') {
      import('leaflet').then((L: any) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
        setLeafletLoaded(true)
      })
    }
  }, [])

  // Validate and sanitize center coordinates
  const safeCenter: [number, number] = [
    isNaN(center[0]) || center[0] === null || center[0] === undefined ? 0 : center[0],
    isNaN(center[1]) || center[1] === null || center[1] === undefined ? 0 : center[1]
  ]

  useEffect(() => {
    // Update map center when locations change
    if (locations.length > 0 && mapRef.current && leafletLoaded) {
      const validLocations = locations.filter(loc => 
        loc.latitude && loc.longitude && 
        !isNaN(parseFloat(loc.latitude)) && 
        !isNaN(parseFloat(loc.longitude))
      )
      
      if (validLocations.length > 0) {
        const avgLat = validLocations.reduce((sum, loc) => sum + parseFloat(loc.latitude), 0) / validLocations.length
        const avgLng = validLocations.reduce((sum, loc) => sum + parseFloat(loc.longitude), 0) / validLocations.length
        
        if (!isNaN(avgLat) && !isNaN(avgLng)) {
          mapRef.current.setView([avgLat, avgLng], zoom)
        }
      }
    }
  }, [locations, zoom, leafletLoaded])

  if (!isClient || !leafletLoaded) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }}>
      {isClient && (
        <MapContainer
          center={safeCenter}
          zoom={zoom}
          ref={mapRef}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {locations
            .filter(loc => 
              loc.latitude && loc.longitude && 
              !isNaN(parseFloat(loc.latitude)) && 
              !isNaN(parseFloat(loc.longitude))
            )
            .map((location) => (
            <Marker
              key={`${location.type}-${location.id}-${location.name}`}
              position={[parseFloat(location.latitude), parseFloat(location.longitude)]}
              eventHandlers={{
                click: () => {
                  console.log('Marker clicked:', location)
                  onLocationClick?.(location)
                }
              }}
            >
            <Popup>
              <div className="p-3 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    location.type === 'resort' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    <span className={`text-xs font-bold ${
                      location.type === 'resort' ? 'text-blue-600' : 'text-green-600'
                    }`}>
                      {location.type === 'resort' ? '🏨' : '🌍'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{location.name}</h3>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {location.address && (
                    <p>
                      <strong>Address:</strong> {location.address}
                    </p>
                  )}
                  
                  {location.city && location.country && (
                    <p>
                      <strong>Location:</strong> {location.city}, {location.country}
                    </p>
                  )}
                  
                  {location.star_rating && (
                    <p>
                      <strong>Rating:</strong> ⭐ {location.star_rating}
                    </p>
                  )}
                  
                  {location.price_per_night && (
                    <p>
                      <strong>Price:</strong> ${location.price_per_night}/night
                    </p>
                  )}
                  
                  {location.amenities && location.amenities.length > 0 && (
                    <div>
                      <strong>Amenities:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {location.amenities.slice(0, 4).map((amenity, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {amenity}
                          </span>
                        ))}
                        {location.amenities.length > 4 && (
                          <span className="text-gray-500 text-xs">+{location.amenities.length - 4} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {onLocationClick && (
                  <button
                    onClick={() => onLocationClick(location)}
                    className="mt-3 w-full bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        </MapContainer>
      )}
    </div>
  )
}
