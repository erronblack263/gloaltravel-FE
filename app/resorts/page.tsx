'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Search, MapPin, Star, Heart, Calendar, Users, DollarSign, Globe, Filter, X, ArrowLeft, Home, Map } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import BookingSheet from '@/components/BookingSheet'

export default function ResortsPage() {
  const router = useRouter()
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [resorts, setResorts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCoordinateModal, setShowCoordinateModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedCountry, setSelectedCountry] = useState("All")
  const [selectedCity, setSelectedCity] = useState("All")
  const [selectedType, setSelectedType] = useState("All")
  const [showFilters, setShowFilters] = useState(false)
  const [savedResorts, setSavedResorts] = useState<number[]>([])
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10
  })
  const [bookingSheet, setBookingSheet] = useState({
    isOpen: false,
    resortId: 0,
    resortName: ''
  })

  // Open booking sheet
  const openBookingSheet = (resortId: number, resortName: string) => {
    setBookingSheet({
      isOpen: true,
      resortId: resortId,
      resortName: resortName
    })
  }

  // Close booking sheet
  const closeBookingSheet = () => {
    setBookingSheet({
      isOpen: false,
      resortId: 0,
      resortName: ''
    })
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? theme : systemTheme

  const getTextThemeClasses = () => {
    if (!mounted) return "text-gray-900"
    
    switch (currentTheme) {
      case "light":
        return "text-gray-900"
      case "dim":
        return "text-gray-100"
      case "dark":
        return "text-gray-100"
      default:
        return "text-gray-900"
    }
  }

  const getCardThemeClasses = () => {
    if (!mounted) return "bg-white border-gray-200"
    
    switch (currentTheme) {
      case "light":
        return "bg-white border-gray-200 hover:shadow-lg"
      case "dim":
        return "bg-slate-800 border-slate-700 hover:bg-slate-700"
      case "dark":
        return "bg-gray-800 border-gray-700 hover:bg-gray-700"
      default:
        return "bg-white border-gray-200 hover:shadow-lg"
    }
  }

  const getBackgroundThemeClasses = () => {
    if (!mounted) return "bg-gray-50"
    
    switch (currentTheme) {
      case "light":
        return "bg-gray-50"
      case "dim":
        return "bg-gray-900"
      case "dark":
        return "bg-gray-950"
      default:
        return "bg-gray-50"
    }
  }

  const fetchResorts = async (page: number = 1, search: string = '', category: string = 'All') => {
    try {
      setLoading(true)
      
      // Get token from localStorage
      const token = localStorage.getItem('authToken')
      
      console.log('🔍 Fetching resorts:', { page, search, category })
      
      // Build API URL with category parameter
      let apiUrl = `/api/resorts?page=${page}&limit=10&search=${encodeURIComponent(search)}`
      if (category && category !== 'All') {
        apiUrl += `&category=${encodeURIComponent(category)}`
        console.log('🏨 Using category filter for:', category)
      }
      
      console.log('📡 API URL:', apiUrl)
      
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })
      
      console.log('📊 Response status:', response.status)
      
      const data = await response.json()
      console.log('📦 Response data:', data)
      
      if (data.success) {
        console.log('✅ Success! Setting resorts:', data.resorts?.length || 0, 'items')
        console.log('🏷️ Resorts types:', data.resorts?.map((r: any) => r.type))
        setResorts(data.resorts || [])
        setPagination(data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_items: 0,
          items_per_page: 10
        })
      } else {
        console.error('❌ API returned error:', data.error)
        setResorts([])
      }
    } catch (error) {
      console.error('❌ Error fetching resorts:', error)
      setResorts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchResorts(1, searchQuery, selectedCategory)
    }
  }, [mounted, searchQuery, selectedCategory])

  const toggleSave = (resortId: number) => {
    setSavedResorts(prev => 
      prev.includes(resortId) 
        ? prev.filter(id => id !== resortId)
        : [...prev, resortId]
    )
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      fetchResorts(newPage, searchQuery, selectedCategory)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getBackgroundThemeClasses()}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className={`mt-4 ${getTextThemeClasses()} opacity-70`}>
            Loading amazing resorts...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${getBackgroundThemeClasses()}`}>
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1571003123894-1f0594d23b2a?w=1920&h=600&fit=crop&crop=entropy"
            alt="Luxury Resort"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl font-bold text-white mb-4 md:text-6xl">
            Luxury Resorts & Spas
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl">
            Discover world-class resorts with premium amenities, stunning locations, and unforgettable experiences
          </p>
          
          {/* Search Bar */}
          <div className="w-full max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search resorts by name, location, or amenities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-full border-0 bg-white/90 backdrop-blur-sm pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/30`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className={`border-b ${getBackgroundThemeClasses()}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm">
              <button
                onClick={() => router.push('/dashboard')}
                className={`flex items-center gap-1 transition-colors hover:text-primary ${getTextThemeClasses()}`}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </button>
              <span className={`${getTextThemeClasses()} opacity-50`}>/</span>
              <span className={`${getTextThemeClasses()} font-medium`}>Resorts</span>
            </nav>
            
            {/* Back to Dashboard Button */}
            <button
              onClick={() => router.push('/dashboard')}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${getTextThemeClasses()} hover:bg-primary/10`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters Section */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === "All" 
                    ? "bg-primary text-primary-foreground" 
                    : `${getTextThemeClasses()} hover:bg-primary/10`
                }`}
              >
                All Resorts
              </button>
              <button
                onClick={() => setSelectedCategory("Beach")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === "Beach" 
                    ? "bg-primary text-primary-foreground" 
                    : `${getTextThemeClasses()} hover:bg-primary/10`
                }`}
              >
                Beach Resorts
              </button>
              <button
                onClick={() => setSelectedCategory("Mountain")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === "Mountain" 
                    ? "bg-primary text-primary-foreground" 
                    : `${getTextThemeClasses()} hover:bg-primary/10`
                }`}
              >
                Mountain Resorts
              </button>
              <button
                onClick={() => setSelectedCategory("Spa")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === "Spa" 
                    ? "bg-primary text-primary-foreground" 
                    : `${getTextThemeClasses()} hover:bg-primary/10`
                }`}
              >
                Spa & Wellness
              </button>
              <button
                onClick={() => setSelectedCategory("Golf")}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === "Golf" 
                    ? "bg-primary text-primary-foreground" 
                    : `${getTextThemeClasses()} hover:bg-primary/10`
                }`}
              >
                Golf Resorts
              </button>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${getTextThemeClasses()} hover:bg-primary/10`}
            >
              <Filter className="h-4 w-4" />
              Advanced Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className={`mt-4 rounded-xl border p-4 ${getCardThemeClasses()}`}>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${getTextThemeClasses()}`}>
                    Country
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 ${getTextThemeClasses()} ${getCardThemeClasses()} focus:outline-none focus:ring-2`}
                  >
                    <option value="All">All Countries</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Seychelles">Seychelles</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${getTextThemeClasses()}`}>
                    City
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 ${getTextThemeClasses()} ${getCardThemeClasses()} focus:outline-none focus:ring-2`}
                  >
                    <option value="All">All Cities</option>
                    <option value="Ubud">Ubud</option>
                    <option value="Seminyak">Seminyak</option>
                    <option value="Nusa Dua">Nusa Dua</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${getTextThemeClasses()}`}>
                    Resort Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 ${getTextThemeClasses()} ${getCardThemeClasses()} focus:outline-none focus:ring-2`}
                  >
                    <option value="All">All Types</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Boutique">Boutique</option>
                    <option value="All-Inclusive">All-Inclusive</option>
                    <option value="Family">Family</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className={`${getTextThemeClasses()} opacity-70`}>
            Showing {resorts.length} of {pagination.total_items} luxury resorts
          </p>
        </div>

        {/* Resorts Grid */}
        {resorts.length === 0 ? (
          <div className="text-center py-16">
            <div className={`text-6xl font-bold ${getTextThemeClasses()} opacity-50 mb-4`}>
              No resorts found
            </div>
            <p className={`${getTextThemeClasses()} opacity-70 mb-8`}>
              Try adjusting your search or filters to find the perfect resort
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All")
                setSelectedCountry("All")
                setSelectedCity("All")
                setSelectedType("All")
              }}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resorts.map((resort) => (
              <div
                key={resort.id}
                className={`group cursor-pointer rounded-xl border overflow-hidden transition-all duration-300 ${getCardThemeClasses()} hover:shadow-xl hover:scale-105`}
                onClick={() => router.push(`/resorts/${resort.id}`)}
              >
                {/* Resort Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={resort.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop'}
                    alt={resort.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSave(resort.id)
                    }}
                    className={`absolute top-3 right-3 rounded-full p-2 backdrop-blur-sm transition-colors hover:bg-white/20 ${
                      savedResorts.includes(resort.id) ? 'text-red-500' : 'text-white'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${savedResorts.includes(resort.id) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Resort Type Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-gray-900">
                      {resort.type || 'Luxury Resort'}
                    </span>
                  </div>
                </div>

                {/* Resort Content */}
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className={`text-lg font-semibold mb-1 ${getTextThemeClasses()}`}>
                      {resort.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{resort.city}, {resort.country}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(resort.rating || 4.5)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-1">
                        {resort.rating || 4.5}
                      </span>
                    </div>
                    <p className={`text-sm ${getTextThemeClasses()} opacity-70 line-clamp-2`}>
                      {resort.description || 'Experience luxury and comfort at this world-class resort with premium amenities and exceptional service.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-lg font-bold ${getTextThemeClasses()}`}>
                        ${resort.price_per_night || '500'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per night
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation() // Prevent card click
                          openBookingSheet(resort.id, resort.name)
                        }} 
                        className="w-full flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                      >
                        Book Now
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation() // Prevent card click
                          router.push(`/resorts/${resort.id}`)
                        }} 
                        className="w-full flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${getTextThemeClasses()} hover:bg-muted"
                      >
                        Explore
                        <X className="h-4 w-4 rotate-180" />
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation() // Prevent card click
                          
                          // Only pass to map if coordinates exist
                          const hasCoordinates = (resort.latitude && resort.longitude) ||
                                            (resort.lat && resort.lng) ||
                                            (resort.coordinates)
                          
                          if (!hasCoordinates) {
                            console.warn('Resort missing coordinates:', resort.name)
                            console.log('Available fields:', Object.keys(resort))
                            
                            // Show modal with user-friendly message
                            setModalMessage(`Map coordinates are not available for "${resort.name}". This resort cannot be displayed on the map.`)
                            setShowCoordinateModal(true)
                            return
                          }
                          
                          // Pass resort data to map with coordinates
                          const mapData = {
                            id: resort.id,
                            name: resort.name,
                            latitude: resort.latitude || resort.lat || (resort.coordinates ? resort.coordinates.split(',')[0] : ''),
                            longitude: resort.longitude || resort.lng || (resort.coordinates ? resort.coordinates.split(',')[1] : ''),
                            type: 'resort',
                            address: resort.address,
                            city: resort.city,
                            country: resort.country,
                            star_rating: resort.star_rating,
                            price_per_night: resort.price_per_night,
                            amenities: resort.amenities,
                            images: resort.images
                          }
                          // Store in sessionStorage for map to use
                          sessionStorage.setItem('mapFocusLocation', JSON.stringify(mapData))
                          router.push('/map')
                        }} 
                        className="w-full flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${getTextThemeClasses()} hover:bg-muted"
                      >
                        <Map className="h-4 w-4" />
                        View on Map
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pagination.current_page === 1
                    ? 'opacity-50 cursor-not-allowed'
                    : `${getTextThemeClasses()} hover:bg-primary/10`
                }`}
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(pagination.total_pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      pagination.current_page === i + 1
                        ? 'bg-primary text-primary-foreground'
                        : `${getTextThemeClasses()} hover:bg-primary/10`
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.total_pages}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pagination.current_page === pagination.total_pages
                    ? 'opacity-50 cursor-not-allowed'
                    : `${getTextThemeClasses()} hover:bg-primary/10`
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Booking Sheet */}
      <BookingSheet
        isOpen={bookingSheet.isOpen}
        onClose={closeBookingSheet}
        destinationId={bookingSheet.resortId}
        destinationName={bookingSheet.resortName}
      />

      {/* Coordinates Missing Modal */}
      {showCoordinateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`mx-4 max-w-md rounded-lg border p-6 ${getCardThemeClasses()}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${getTextThemeClasses()}`}>
                  Map Location Unavailable
                </h3>
              </div>
            </div>
            
            <p className={`${getTextThemeClasses()} mb-6`}>
              {modalMessage}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCoordinateModal(false)}
                className={`flex-1 rounded-lg border px-4 py-2 font-medium transition-colors ${getTextThemeClasses()} hover:bg-muted`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowCoordinateModal(false)
                  router.push('/resorts')
                }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Browse Other Resorts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
