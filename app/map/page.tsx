'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ArrowLeft, MapPin, Filter, Search, Hotel, Globe } from 'lucide-react'
import { ThemeSwitcher } from "@/components/theme-switcher"
import MapComponent from "@/components/MapComponent"
import { getDestinationCoordinates, destinationCoordinates } from "@/utils/destinationCoordinates"

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

export default function MapViewPage() {
  const router = useRouter()
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'destination' | 'resort'>('all')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [focusLocation, setFocusLocation] = useState<Location | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    console.log('=== MODAL STATE DEBUG ===')
    console.log('showLocationModal:', showLocationModal)
    console.log('selectedLocation:', selectedLocation)
    console.log('showLocationModal && selectedLocation:', showLocationModal && selectedLocation)
    console.log('=== END DEBUG ===')
  }, [showLocationModal, selectedLocation])

  useEffect(() => {
    console.log('Component mounted or updated')
  })

  const currentTheme = mounted ? theme : systemTheme

  const getBackgroundThemeClasses = () => {
    if (!mounted) return "bg-gray-50"
    if (theme === 'dark') return "bg-gray-900"
    if (theme === 'dim') return "bg-gray-800"
    return "bg-gray-50"
  }

  const getTextThemeClasses = () => {
    if (!mounted) return "text-gray-900"
    if (theme === 'dark') return "text-gray-100"
    if (theme === 'dim') return "text-gray-200"
    return "text-gray-900"
  }

  const getCardThemeClasses = () => {
    if (!mounted) return "bg-white text-gray-900"
    if (theme === 'dark') return "bg-gray-800 text-gray-100"
    if (theme === 'dim') return "bg-gray-700 text-gray-200"
    return "bg-white text-gray-900"
  }

  useEffect(() => {
    fetchLocations()
    
    // Check for focus location from sessionStorage
    const focusLocation = sessionStorage.getItem('mapFocusLocation')
    if (focusLocation) {
      try {
        const locationData = JSON.parse(focusLocation)
        console.log('Map focus location:', locationData)
        
        // Check if coordinates exist
        if (!locationData.latitude || !locationData.longitude) {
          console.warn('Missing coordinates in focus location:', locationData)
          console.log('Available fields:', Object.keys(locationData))
          sessionStorage.removeItem('mapFocusLocation')
          return
        }
        
        // Validate coordinates before setting focus
        const lat = parseFloat(locationData.latitude)
        const lng = parseFloat(locationData.longitude)
        
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          // Store for map component to use
          setFocusLocation(locationData)
        } else {
          console.warn('Invalid coordinates in focus location:', locationData)
          console.log('Parsed coordinates:', { lat, lng })
        }
        
        // Clear sessionStorage after reading
        sessionStorage.removeItem('mapFocusLocation')
      } catch (error) {
        console.error('Error parsing focus location:', error)
      }
    }
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      
      // Try to fetch both destinations and resorts
      let destinationsData: any[] = []
      let resortsData: any[] = []
      
      try {
        const destinationsResponse = await fetch('http://localhost:8000/api/v1/destinations/')
        if (destinationsResponse.ok) {
          const data = await destinationsResponse.json()
          destinationsData = Array.isArray(data) 
            ? data 
            : data.destinations || data.results || []
        } else {
          console.warn('Destinations API not available, using fallback data')
        }
      } catch (error) {
        console.warn('Failed to fetch destinations, using fallback data:', error)
      }
      
      try {
        const resortsResponse = await fetch('http://localhost:8000/api/v1/resorts/')
        if (resortsResponse.ok) {
          const data = await resortsResponse.json()
          resortsData = Array.isArray(data) 
            ? data 
            : data.resorts || data.results || []
        } else {
          console.warn('Resorts API not available, using fallback data')
        }
      } catch (error) {
        console.warn('Failed to fetch resorts, using fallback data:', error)
      }

      const allLocations: Location[] = []

      // Process destinations (from API or fallback)
      const destinationsToProcess = destinationsData.length > 0 ? destinationsData : getFallbackDestinations()
      
      destinationsToProcess.forEach((dest: any) => {
        // Try to get coordinates from mapping first
        const mappedCoords = getDestinationCoordinates(dest.name || dest.destination_name || 'Unknown Destination')
        
        allLocations.push({
          id: dest.id || Math.random(),
          name: dest.name || dest.destination_name || 'Unknown Destination',
          latitude: dest.latitude || mappedCoords?.lat.toString() || '0',
          longitude: dest.longitude || mappedCoords?.lng.toString() || '0',
          type: 'destination',
          address: dest.address,
          city: dest.city,
          country: dest.country,
          star_rating: dest.star_rating,
          price_per_night: dest.price_per_night,
          amenities: dest.amenities,
          images: dest.images
        })
      })

      // Process resorts (from API or fallback)
      const resortsToProcess = resortsData.length > 0 ? resortsData : getFallbackResorts()
      
      resortsToProcess.forEach((resort: any) => {
        // Try to get coordinates from mapping first
        const mappedCoords = getDestinationCoordinates(resort.name || resort.resort_name || 'Unknown Resort')
        
        allLocations.push({
          id: resort.id || Math.random(),
          name: resort.name || resort.resort_name || 'Unknown Resort',
          latitude: resort.latitude || mappedCoords?.lat.toString() || '0',
          longitude: resort.longitude || mappedCoords?.lng.toString() || '0',
          type: 'resort',
          address: resort.address,
          city: resort.city,
          country: resort.country,
          star_rating: resort.star_rating,
          price_per_night: resort.price_per_night,
          amenities: resort.amenities,
          images: resort.images
        })
      })

      setLocations(allLocations)
      console.log(`Loaded ${allLocations.length} locations for map`)
    } catch (error) {
      console.error('Error fetching locations:', error)
      // Set empty locations to prevent infinite loading
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  // Fallback destinations when API is unavailable
  const getFallbackDestinations = () => {
    const fallbackDestinations = [
      {
        id: 1,
        name: "Northern Lights",
        city: "Tromsø",
        country: "Norway",
        type: "destination",
        entry_fee: "2500.00",
        description: "Experience the magical Aurora Borealis in one of the world's best viewing locations.",
        highlights: ["Aurora viewing", "Dog sledding", "Reindeer sledding"],
        latitude: "69.6492",
        longitude: "18.9553"
      },
      {
        id: 6,
        name: "Norwegian Fjords",
        city: "Bergen",
        country: "Norway",
        type: "destination",
        entry_fee: "2800.00",
        description: "Discover the breathtaking beauty of Norway's majestic fjords.",
        highlights: ["Fjord cruising", "Waterfall viewing", "Mountain hiking"],
        latitude: "60.3913",
        longitude: "5.3221"
      },
      {
        id: 2,
        name: "Maldives Paradise Island",
        city: "Malé",
        country: "Maldives",
        type: "destination",
        entry_fee: "3500.00",
        description: "Discover crystal-clear waters, pristine beaches, and luxurious overwater bungalows.",
        highlights: ["Snorkeling", "Diving", "Island hopping", "Dolphin watching"],
        latitude: "3.2028",
        longitude: "73.2207"
      },
      {
        id: 3,
        name: "Santorini, Greece",
        city: "Santorini",
        country: "Greece",
        type: "destination",
        entry_fee: "2200.00",
        description: "Explore the stunning white-washed buildings, blue-domed churches, and breathtaking sunsets.",
        highlights: ["Wine tasting", "Sunset viewing", "Beach hopping", "Archaeological sites"],
        latitude: "36.3932",
        longitude: "25.4615"
      },
      {
        id: 4,
        name: "Swiss Alps - Interlaken",
        city: "Interlaken",
        country: "Switzerland",
        type: "destination",
        entry_fee: "2800.00",
        description: "Adventure awaits in the heart of the Swiss Alps. Experience breathtaking mountain scenery.",
        highlights: ["Skiing", "Mountain hiking", "Scenic trains", "Alpine villages"],
        latitude: "46.6863",
        longitude: "7.8632"
      },
      {
        id: 5,
        name: "Tokyo, Japan",
        city: "Tokyo",
        country: "Japan",
        type: "destination",
        entry_fee: "2000.00",
        description: "Immerse yourself in the perfect blend of ancient tradition and cutting-edge technology.",
        highlights: ["Temple visits", "Cherry blossoms", "Mount Fuji views", "Japanese cuisine"],
        latitude: "35.6762",
        longitude: "139.6503"
      },
      {
        id: 7,
        name: "Dolomites, Italy",
        city: "Cortina d'Ampezzo",
        country: "Italy",
        type: "destination",
        entry_fee: "2600.00",
        description: "Explore the dramatic peaks and picturesque valleys of the Italian Dolomites.",
        highlights: ["Mountain climbing", "Scenic hiking", "Alpine villages", "Photography"],
        latitude: "46.4192",
        longitude: "11.8698"
      },
      {
        id: 8,
        name: "Paris, France",
        city: "Paris",
        country: "France",
        type: "destination",
        entry_fee: "2400.00",
        description: "Experience the romance and culture of the City of Light with its iconic landmarks.",
        highlights: ["Eiffel Tower", "Louvre Museum", "Seine River cruise", "French cuisine"],
        latitude: "48.8566",
        longitude: "2.3522"
      },
      {
        id: 9,
        name: "Machu Picchu, Peru",
        city: "Cusco",
        country: "Peru",
        type: "destination",
        entry_fee: "3000.00",
        description: "Discover the ancient Incan citadel high in the Andes Mountains.",
        highlights: ["Inca Trail", "Ancient ruins", "Mountain views", "Cultural tours"],
        latitude: "-13.1631",
        longitude: "-72.5450"
      },
      {
        id: 10,
        name: "Petra, Jordan",
        city: "Wadi Musa",
        country: "Jordan",
        type: "destination",
        entry_fee: "2200.00",
        description: "Explore the magnificent rock-cut architecture of this ancient wonder.",
        highlights: ["Treasury", "Monastery", "Siq Canyon", "Archaeological sites"],
        latitude: "30.3285",
        longitude: "35.4444"
      },
      {
        id: 11,
        name: "Iceland - Golden Circle",
        city: "Reykjavik",
        country: "Iceland",
        type: "destination",
        entry_fee: "2800.00",
        description: "Experience geysers, waterfalls, and the raw beauty of Iceland's Golden Circle.",
        highlights: ["Geysers", "Waterfalls", "Northern Lights", "Glaciers"],
        latitude: "64.9631",
        longitude: "-19.0208"
      },
      {
        id: 12,
        name: "Bali, Indonesia",
        city: "Denpasar",
        country: "Indonesia",
        type: "destination",
        entry_fee: "1800.00",
        description: "Discover tropical paradise with stunning beaches, rice terraces, and ancient temples.",
        highlights: ["Beaches", "Rice terraces", "Temples", "Balinese culture"],
        latitude: "-8.3405",
        longitude: "115.0920"
      },
      {
        id: 13,
        name: "Phuket, Thailand",
        city: "Phuket",
        country: "Thailand",
        type: "destination",
        entry_fee: "1600.00",
        description: "Experience Thailand's largest island with beautiful beaches and vibrant culture.",
        highlights: ["Beaches", "Island hopping", "Thai cuisine", "Water sports"],
        latitude: "7.8804",
        longitude: "98.3923"
      },
      {
        id: 14,
        name: "New York City, USA",
        city: "New York",
        country: "USA",
        type: "destination",
        entry_fee: "2500.00",
        description: "Experience the energy and excitement of the city that never sleeps.",
        highlights: ["Times Square", "Central Park", "Broadway", "Statue of Liberty"],
        latitude: "40.7128",
        longitude: "-74.0060"
      },
      {
        id: 15,
        name: "London, England",
        city: "London",
        country: "UK",
        type: "destination",
        entry_fee: "2300.00",
        description: "Explore historic landmarks, royal palaces, and vibrant culture in London.",
        highlights: ["Big Ben", "Tower Bridge", "British Museum", "West End shows"],
        latitude: "51.5074",
        longitude: "-0.1278"
      },
      {
        id: 16,
        name: "Dubai, UAE",
        city: "Dubai",
        country: "UAE",
        type: "destination",
        entry_fee: "2700.00",
        description: "Experience modern luxury, stunning architecture, and traditional Arabian culture.",
        highlights: ["Burj Khalifa", "Desert safari", "Gold Souk", "Dubai Mall"],
        latitude: "25.2048",
        longitude: "55.2708"
      },
      {
        id: 17,
        name: "Rome, Italy",
        city: "Rome",
        country: "Italy",
        type: "destination",
        entry_fee: "2100.00",
        description: "Walk through history in the Eternal City with ancient ruins and Renaissance art.",
        highlights: ["Colosseum", "Vatican City", "Trevi Fountain", "Roman Forum"],
        latitude: "41.9028",
        longitude: "12.4964"
      },
      {
        id: 18,
        name: "Cairo, Egypt",
        city: "Cairo",
        country: "Egypt",
        type: "destination",
        entry_fee: "1900.00",
        description: "Explore ancient pyramids, bustling bazaars, and rich Egyptian history.",
        highlights: ["Pyramids", "Sphinx", "Egyptian Museum", "Khan el-Khalili"],
        latitude: "30.0444",
        longitude: "31.2357"
      },
      {
        id: 19,
        name: "Costa Rica Rainforest",
        city: "San José",
        country: "Costa Rica",
        type: "destination",
        entry_fee: "1700.00",
        description: "Discover incredible biodiversity in lush tropical rainforests.",
        highlights: ["Wildlife", "Zip-lining", "Volcanoes", "Eco-tours"],
        latitude: "10.3007",
        longitude: "-84.8168"
      },
      {
        id: 20,
        name: "Maui, Hawaii",
        city: "Maui",
        country: "USA",
        type: "destination",
        entry_fee: "3200.00",
        description: "Experience tropical paradise with stunning beaches and volcanic landscapes.",
        highlights: ["Beaches", "Road to Hana", "Haleakalā", "Whale watching"],
        latitude: "20.7984",
        longitude: "-156.3319"
      }
    ]
    
    return fallbackDestinations.map(dest => ({
      id: dest.id,
      name: dest.name,
      destination_name: dest.name,
      city: dest.city,
      country: dest.country,
      rating: 4.5,
      price: dest.entry_fee === '0.00' ? 'Free' : `$${dest.entry_fee}`,
      duration: "5-7 days",
      image: `/static/images/${dest.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}_0.jpg`,
      description: dest.description,
      highlights: dest.highlights,
      saved: false,
      latitude: dest.latitude,
      longitude: dest.longitude,
      type: 'destination',
      address: `${dest.city}, ${dest.country}`,
      star_rating: undefined,
      price_per_night: undefined
    }))
  }

  // Fallback resorts when API is unavailable
  const getFallbackResorts = () => {
    return [
      {
        id: 101,
        name: 'Luxury Resort Maldives',
        resort_name: 'Luxury Resort Maldives',
        city: 'Male',
        country: 'Maldives',
        rating: 4.8,
        price_per_night: '1500',
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d23b2a?w=400&h=300&fit=crop',
        description: 'Luxury beachfront resort with overwater villas',
        amenities: ['Spa', 'Restaurant', 'Pool', 'Beach Access']
      },
      {
        id: 102,
        name: 'Mountain Retreat Switzerland',
        resort_name: 'Mountain Retreat Switzerland',
        city: 'Interlaken',
        country: 'Switzerland',
        rating: 4.7,
        price_per_night: '800',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
        description: 'Alpine resort with stunning mountain views',
        amenities: ['Ski Access', 'Spa', 'Restaurant', 'Fireplace']
      }
    ]
  }

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || location.type === filterType
    return matchesSearch && matchesType
  })

  const handleLocationClick = (location: Location) => {
    console.log('🎯 MARKER CLICK START ===')
    console.log('handleLocationClick called with:', location)
    console.log('Current showLocationModal before:', showLocationModal)
    console.log('Current selectedLocation before:', selectedLocation)
    
    // Add a small delay to prevent immediate closing
    setTimeout(() => {
      setSelectedLocation(location)
      setShowLocationModal(true)
      console.log('Set selectedLocation to:', location)
      console.log('Set showLocationModal to: true')
    }, 100)
    
    console.log('🎯 MARKER CLICK END ===')
  }

  const getMapCenter = (): [number, number] => {
    // If we have a focus location, center on it
    if (focusLocation) {
      const lat = parseFloat(focusLocation.latitude)
      const lng = parseFloat(focusLocation.longitude)
      
      // Validate coordinates
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return [lat, lng]
      }
    }
    
    // Otherwise, use filtered locations or default
    if (filteredLocations.length === 0) return [0, 0]
    
    const validLocations = filteredLocations.filter(loc => 
      loc.latitude && loc.longitude && 
      !isNaN(parseFloat(loc.latitude)) && 
      !isNaN(parseFloat(loc.longitude)) &&
      parseFloat(loc.latitude) !== 0 && 
      parseFloat(loc.longitude) !== 0
    )
    
    if (validLocations.length === 0) return [0, 0]
    
    const avgLat = validLocations.reduce((sum, loc) => sum + parseFloat(loc.latitude), 0) / validLocations.length
    const avgLng = validLocations.reduce((sum, loc) => sum + parseFloat(loc.longitude), 0) / validLocations.length
    return [avgLat, avgLng]
  }

  const getStats = () => {
    const destinationCount = locations.filter(loc => loc.type === 'destination').length
    const resortCount = locations.filter(loc => loc.type === 'resort').length
    
    return { destinationCount, resortCount }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getBackgroundThemeClasses()}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className={`mt-4 ${getTextThemeClasses()} opacity-70`}>
            Loading map data...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${getBackgroundThemeClasses()}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-lg ${getCardThemeClasses()}`}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <MapPin className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className={`text-xl font-bold ${getTextThemeClasses()}`}>
                GlobalTravel Map
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { name: "Dashboard", icon: Globe, href: "/dashboard" },
                { name: "Destinations", icon: MapPin, href: "/destinations" },
                { name: "Resorts", icon: Hotel, href: "/resorts" },
                { name: "Map View", icon: MapPin, href: "/map" }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                    item.name === "Map View" ? "text-primary" : getTextThemeClasses()
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Theme Switcher */}
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className={`border-b ${getCardThemeClasses()}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.destinationCount}</div>
              <div className={`text-sm ${getTextThemeClasses()} opacity-70`}>Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.resortCount}</div>
              <div className={`text-sm ${getTextThemeClasses()} opacity-70`}>Resorts</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`border-b ${getCardThemeClasses()}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search destinations and resorts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${getCardThemeClasses()}`}
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${getCardThemeClasses()}`}
              >
                <option value="all">All Locations</option>
                <option value="destination">Destinations Only</option>
                <option value="resort">Resorts Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        {locations.length === 0 ? (
          <div className={`flex items-center justify-center ${getBackgroundThemeClasses()}`} style={{ height: 'calc(100vh - 200px)' }}>
            <div className="text-center">
              <MapPin className={`h-16 w-16 mx-auto mb-4 ${getTextThemeClasses()} opacity-50`} />
              <h3 className={`text-xl font-semibold ${getTextThemeClasses()} mb-2`}>
                No Locations Available
              </h3>
              <p className={`${getTextThemeClasses()} opacity-70`}>
                No destinations or resorts with valid coordinates are available to display on the map.
              </p>
              <button
                onClick={() => router.push('/destinations')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Destinations
              </button>
            </div>
          </div>
        ) : (
          <MapComponent
            locations={filteredLocations}
            center={getMapCenter()}
            zoom={focusLocation ? 12 : (filteredLocations.length > 0 ? 10 : 2)}
            height="calc(100vh - 200px)"
            onLocationClick={handleLocationClick}
          />
        )}

        {/* Map Legend */}
        <div className="absolute top-4 right-4 z-10">
          <div className={`rounded-lg border p-3 shadow-lg ${getCardThemeClasses()}`}>
            <h3 className={`font-semibold mb-2 ${getTextThemeClasses()}`}>Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600">🌍</span>
                </div>
                <span className={`text-sm ${getTextThemeClasses()}`}>Destinations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">🏨</span>
                </div>
                <span className={`text-sm ${getTextThemeClasses()}`}>Resorts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Details Sheet */}
      {showLocationModal && selectedLocation && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center">
          <div className={`w-full max-w-lg mx-auto ${getCardThemeClasses()} rounded-t-2xl shadow-2xl transform transition-all duration-300 ease-out font-inter`}>
            {/* Backdrop to close */}
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                console.log('Backdrop clicked')
                setShowLocationModal(false)
                setSelectedLocation(null)
              }}
            />
            
            {/* Sheet Content */}
            <div className={`relative ${getCardThemeClasses()} rounded-t-2xl shadow-2xl transform transition-all duration-300 ease-out font-inter`}>
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className={`h-1 w-12 rounded-full ${getTextThemeClasses()} opacity-30`}></div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-12 w-12 rounded-full ${selectedLocation.type === 'resort' ? 'bg-blue-100' : 'bg-green-100'} flex items-center justify-center`}>
                    {selectedLocation.type === 'resort' ? (
                      <Hotel className={`h-6 w-6 text-blue-600`} />
                    ) : (
                      <Globe className={`h-6 w-6 text-green-600`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${getTextThemeClasses()}`}>
                      {selectedLocation.name}
                    </h3>
                    <p className={`text-sm ${getTextThemeClasses()} opacity-70`}>
                      {selectedLocation.type === 'resort' ? 'Resort' : 'Destination'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      console.log('❌ X BUTTON CLICKED ===')
                      setShowLocationModal(false)
                      setSelectedLocation(null)
                    }}
                    className={`rounded-full p-2 ${getTextThemeClasses()} hover:bg-muted transition-colors`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="space-y-3 mb-6">
                  {selectedLocation.city && selectedLocation.country && (
                    <div>
                      <label className={`text-sm font-medium ${getTextThemeClasses()}`}>Location</label>
                      <p className={`${getTextThemeClasses()}`}>{selectedLocation.city}, {selectedLocation.country}</p>
                    </div>
                  )}
                  
                  {selectedLocation.address && (
                    <div>
                      <label className={`text-sm font-medium ${getTextThemeClasses()}`}>Address</label>
                      <p className={`${getTextThemeClasses()}`}>{selectedLocation.address}</p>
                    </div>
                  )}
                  
                  {selectedLocation.star_rating && (
                    <div>
                      <label className={`text-sm font-medium ${getTextThemeClasses()}`}>Rating</label>
                      <p className={`${getTextThemeClasses()}`}>⭐ {selectedLocation.star_rating}</p>
                    </div>
                  )}
                  
                  {selectedLocation.price_per_night && (
                    <div>
                      <label className={`text-sm font-medium ${getTextThemeClasses()}`}>Price per Night</label>
                      <p className={`${getTextThemeClasses()}`}>${selectedLocation.price_per_night}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className={`text-sm font-medium ${getTextThemeClasses()}`}>Coordinates</label>
                    <p className={`${getTextThemeClasses()} text-sm font-mono`}>
                      {selectedLocation.latitude}, {selectedLocation.longitude}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      console.log('🚫 CLOSE BUTTON CLICKED ===')
                      setShowLocationModal(false)
                      setSelectedLocation(null)
                    }}
                    className={`flex-1 rounded-lg border px-4 py-2 font-medium transition-colors ${getTextThemeClasses()} hover:bg-muted`}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      console.log('👁 VIEW DETAILS BUTTON CLICKED ===')
                      setShowLocationModal(false)
                      if (selectedLocation.type === 'destination') {
                        router.push(`/destinations/${selectedLocation.id}`)
                      } else {
                        router.push(`/resorts/${selectedLocation.id}`)
                      }
                    }}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
