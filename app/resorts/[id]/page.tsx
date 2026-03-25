'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Star, Heart, Calendar, DollarSign, Users, Wifi, Car, Coffee, Dumbbell, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import BookingSheet from '@/components/BookingSheet'

export default function ResortDetailPage() {
  const params = useParams()
  const router = useRouter()

  // Open booking sheet
  const openBookingSheet = () => {
    if (!resort) return
    setBookingSheet({
      isOpen: true,
      destinationId: resort.id,
      destinationName: resort.name
    })
  }

  // Close booking sheet
  const closeBookingSheet = () => {
    setBookingSheet({
      isOpen: false,
      destinationId: 0,
      destinationName: ''
    })
  }

  const { theme, systemTheme } = useTheme()
  const [resort, setResort] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [bookingSheet, setBookingSheet] = useState({
    isOpen: false,
    destinationId: 0,
    destinationName: ''
  })

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

  const getSubtleTextClasses = () => {
    if (!mounted) return "text-gray-600"
    
    switch (currentTheme) {
      case "light":
        return "text-gray-600"
      case "dim":
        return "text-gray-300"
      case "dark":
        return "text-gray-400"
      default:
        return "text-gray-600"
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

  useEffect(() => {
    const fetchResort = async () => {
      if (!params.id) return
      
      try {
        setLoading(true)
        
        // Get token from localStorage
        const token = localStorage.getItem('authToken')
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }
        
        // Add authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        // Fetch specific resort by ID from FastAPI backend
        const response = await fetch(`http://localhost:8000/api/v1/resorts/${params.id}`, {
          headers
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data && data.id) {
            // Transform the data to match frontend expectations
            const transformedResort = {
              id: data.id,
              name: data.name,
              location: `${data.city}, ${data.country}`,
              rating: 4.0 + Math.random() * 1.0, // Generate random rating between 4.0-5.0
              price: data.price_per_night ? `$${data.price_per_night}/night` : '$200/night',
              duration: 'Flexible stay',
              image: data.images && data.images.length > 0 && typeof data.images[0] === 'string' && data.images[0].startsWith('http')
                ? data.images[0].replace('w=800', 'w=1200').replace('h=600', 'h=800')
                : data.images && data.images.length > 0 && typeof data.images[0] === 'string'
                  ? `http://localhost:8000${data.images[0]}`
                  : getResortMainImage(data.name)[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
              description: `Experience luxury and comfort at ${data.name}, a premier resort in ${data.city}, ${data.country}. Enjoy world-class amenities and exceptional service.`,
              highlights: [data.star_rating ? `${data.star_rating} Stars` : '5 Stars', `${data.city}`, 'Luxury Resort'],
              saved: false,
              type: 'resort',
              city: data.city,
              country: data.country,
              star_rating: data.star_rating,
              price_per_night: data.price_per_night,
              amenities: data.amenities || ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym']
            }
            
            setResort(transformedResort)
            
            // Check if saved
            const savedResorts = JSON.parse(localStorage.getItem('savedResorts') || '[]')
            setSaved(savedResorts.includes(transformedResort.id))
          } else {
            console.error('Invalid resort data received')
          }
        } else {
          console.log('Resorts API not available, using fallback data')
          // Use fallback data when API is not available
          const fallbackResorts = [
            {
              id: 1001,
              name: "Tropical Paradise Resort",
              city: "Maldives",
              country: "Maldives",
              star_rating: 5,
              price_per_night: "450.00",
              description: "Experience ultimate luxury in this stunning overwater villa resort. Crystal-clear waters, pristine beaches, and world-class amenities await.",
              highlights: ["5 Stars", "Overwater Villas", "Private Beach", "World-Class Spa", "Fine Dining"],
              amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Water Sports", "Bar", "Concierge"]
            },
            {
              id: 1002,
              name: "Mountain View Resort",
              city: "Swiss Alps",
              country: "Switzerland",
              star_rating: 4,
              price_per_night: "320.00",
              description: "Nestled in the heart of the Swiss Alps, this resort offers breathtaking mountain views, world-class skiing, and luxurious alpine accommodations.",
              highlights: ["4 Stars", "Mountain Views", "Ski-in/Ski-out", "Alpine Spa", "Fine Dining"],
              amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Ski Rental", "Fireplace", "Bar"]
            },
            {
              id: 1003,
              name: "Beachfront Luxury Resort",
              city: "Santorini",
              country: "Greece",
              star_rating: 5,
              price_per_night: "380.00",
              description: "Perched on the cliffs of Santorini, this luxury resort offers stunning caldera views, infinity pools, and authentic Greek hospitality.",
              highlights: ["5 Stars", "Caldera Views", "Infinity Pool", "Sunset Terrace", "Greek Cuisine"],
              amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Beach Access", "Bar", "Concierge"]
            },
            {
              id: 1004,
              name: "Urban Luxury Hotel",
              city: "Tokyo",
              country: "Japan",
              star_rating: 4,
              price_per_night: "280.00",
              description: "Experience modern luxury in the heart of Tokyo. This urban resort combines contemporary design with traditional Japanese hospitality.",
              highlights: ["4 Stars", "City Views", "Modern Design", "Japanese Cuisine", "Central Location"],
              amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Business Center", "Bar", "Concierge"]
            },
            {
              id: 1005,
              name: "Safari Lodge Resort",
              city: "Kenya",
              country: "Kenya",
              star_rating: 5,
              price_per_night: "520.00",
              description: "Experience the magic of African wildlife from this luxury safari lodge. Guided tours, luxury accommodations, and unforgettable sunsets.",
              highlights: ["5 Stars", "Wildlife Views", "Safari Tours", "Luxury Tents", "Bush Dining"],
              amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Bar", "Safari Tours", "Game Drives", "Concierge"]
            }
          ]

          const found = fallbackResorts.find(r => r.id.toString() === params.id)
          if (found) {
            const transformedResort = {
              id: found.id,
              name: found.name,
              location: `${found.city}, ${found.country}`,
              rating: 4.0 + Math.random() * 1.0,
              price: `$${found.price_per_night}/night`,
              duration: 'Flexible stay',
              image: getResortMainImage(found.name)[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
              description: found.description,
              highlights: found.highlights,
              saved: false,
              type: 'resort',
              city: found.city,
              country: found.country,
              star_rating: found.star_rating,
              price_per_night: found.price_per_night,
              amenities: found.amenities
            }
            
            setResort(transformedResort)
            
            // Check if saved
            const savedResorts = JSON.parse(localStorage.getItem('savedResorts') || '[]')
            setSaved(savedResorts.includes(transformedResort.id))
          } else {
            console.error('Resort not found in fallback data')
          }
        }
      } catch (error) {
        console.error('Error fetching resort:', error)
        console.log('Using fallback data due to error')
        
        // Use fallback data when there's an error
        const fallbackResort = {
          id: parseInt(params.id as string) || 1001,
          name: "Luxury Resort",
          city: "Unknown",
          country: "Unknown",
          star_rating: 4,
          price_per_night: "300.00",
          description: "Experience luxury and comfort at this beautiful resort. Enjoy world-class amenities, exceptional service, and unforgettable memories.",
          highlights: ["4 Stars", "Luxury Accommodations", "World-Class Service", "Fine Dining", "Spa & Wellness"],
          amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Bar", "Concierge"]
        }
        
        const transformedResort = {
          id: fallbackResort.id,
          name: fallbackResort.name,
          location: `${fallbackResort.city}, ${fallbackResort.country}`,
          rating: 4.5,
          price: `$${fallbackResort.price_per_night}/night`,
          duration: 'Flexible stay',
          image: getResortMainImage(fallbackResort.name)[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=800&fit=crop',
          description: fallbackResort.description,
          highlights: fallbackResort.highlights,
          saved: false,
          type: 'resort',
          city: fallbackResort.city,
          country: fallbackResort.country,
          star_rating: fallbackResort.star_rating,
          price_per_night: fallbackResort.price_per_night,
          amenities: fallbackResort.amenities
        }
        
        setResort(transformedResort)
      } finally {
        setLoading(false)
      }
    }

    fetchResort()
  }, [params.id])

  const toggleSave = () => {
    if (!resort) return
    
    const savedResorts = JSON.parse(localStorage.getItem('savedResorts') || '[]')
    const newSaved = savedResorts.includes(resort.id)
      ? savedResorts.filter((id: number) => id !== resort.id)
      : [...savedResorts, resort.id]
    
    localStorage.setItem('savedResorts', JSON.stringify(newSaved))
    setSaved(!saved)
  }

  // Create gallery images array with resort-specific images from static folder
  const getResortGallery = (resortName: string) => {
    // Convert resort name to format suitable for image files
    const formatName = (name: string) => {
      return name
        .replace(/[^a-zA-Z0-9\s_]/g, '') // Remove special characters except underscore and space
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/^(.)/, (match) => match.toUpperCase()) // Capitalize first letter
    }
    
    const formattedName = formatName(resortName)
    
    // Generate image paths based on the pattern: [ResortName]_0, [ResortName]_1, [ResortName]_2
    const galleryImages = [
      `/static/images/${formattedName}_0.jpg`,
      `/static/images/${formattedName}_1.jpg`,
      `/static/images/${formattedName}_2.jpg`
    ]
    
    return galleryImages
  }

  const getResortMainImage = (resortName: string) => {
    // Convert resort name to format suitable for image files
    const formatName = (name: string) => {
      return name
        .replace(/[^a-zA-Z0-9\s_]/g, '') // Remove special characters except underscore and space
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/^(.)/, (match) => match.toUpperCase()) // Capitalize first letter
    }
    
    const formattedName = formatName(resortName)
    
    // Try multiple naming patterns for the main image
    const possibleNames = [
      `${formattedName}_0.jpg`,
      `${formattedName}.jpg`,
      `${formattedName.replace(/_/g, '')}_0.jpg`,
      `${formattedName.replace(/_/g, '')}.jpg`
    ]
    
    return possibleNames
  }

  const galleryImages = resort ? getResortGallery(resort.name) : []
  
  // Debug: Log resort name and gallery images
  console.log('Resort:', resort?.name)
  console.log('Gallery Images:', galleryImages)

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getBackgroundThemeClasses()}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className={`mt-4 ${getTextThemeClasses()} opacity-70`}>
            Loading resort details...
          </p>
        </div>
      </div>
    )
  }

  if (!resort) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getBackgroundThemeClasses()}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold ${getTextThemeClasses()} mb-4`}>
            Resort Not Found
          </h1>
          <button
            onClick={() => router.push('/resorts')}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Back to Resorts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${getBackgroundThemeClasses()}`}>
      {/* Hero Section with Image */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={resort.image}
          alt={resort.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => {
            try {
              router.back()
            } catch (error) {
              console.error('Router.back failed:', error)
              router.push('/resorts')
            }
          }}
          className={`absolute top-4 left-4 rounded-full p-2 backdrop-blur-sm transition-colors hover:bg-white/20 ${getCardThemeClasses()}`}
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        {/* Save Button */}
        <button
          onClick={toggleSave}
          className={`absolute top-4 right-4 rounded-full p-2 backdrop-blur-sm transition-colors hover:bg-white/20 ${getCardThemeClasses()}`}
        >
          <Heart
            className={`h-5 w-5 ${
              saved ? 'fill-red-500 text-red-500' : 'text-white'
            }`}
          />
        </button>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className={`text-4xl font-bold text-white mb-2`}>
              {resort.name}
            </h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{resort.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{resort.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className={`rounded-xl border p-6 ${getCardThemeClasses()}`}>
              <h2 className={`text-xl font-semibold mb-4 ${getTextThemeClasses()}`}>
                About This Resort
              </h2>
              <p className={`${getSubtleTextClasses()} leading-relaxed`}>
                {resort.description}
              </p>
            </div>

            {/* Highlights */}
            <div className={`rounded-xl border p-6 ${getCardThemeClasses()}`}>
              <h2 className={`text-xl font-semibold mb-4 ${getTextThemeClasses()}`}>
                Highlights
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {resort.highlights?.map((highlight: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className={`${getSubtleTextClasses()}`}>
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className={`rounded-xl border p-6 ${getCardThemeClasses()}`}>
              <h2 className={`text-xl font-semibold mb-4 ${getTextThemeClasses()}`}>
                Amenities
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {(resort.amenities || ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Bar']).map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    {amenity.toLowerCase().includes('wifi') && <Wifi className="h-4 w-4 text-blue-500" />}
                    {amenity.toLowerCase().includes('pool') && <div className="h-4 w-4 rounded-full bg-blue-500"></div>}
                    {amenity.toLowerCase().includes('parking') || amenity.toLowerCase().includes('car') ? <Car className="h-4 w-4 text-blue-500" /> : null}
                    {amenity.toLowerCase().includes('coffee') || amenity.toLowerCase().includes('restaurant') ? <Coffee className="h-4 w-4 text-blue-500" /> : null}
                    {amenity.toLowerCase().includes('gym') || amenity.toLowerCase().includes('fitness') ? <Dumbbell className="h-4 w-4 text-blue-500" /> : null}
                    {!['wifi', 'pool', 'parking', 'car', 'coffee', 'restaurant', 'gym', 'fitness'].some(keyword => amenity.toLowerCase().includes(keyword)) && <div className="h-4 w-4 rounded-full bg-blue-500"></div>}
                    <span className={`${getSubtleTextClasses()}`}>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            <div className={`rounded-xl border p-6 ${getCardThemeClasses()}`}>
              <h2 className={`text-xl font-semibold mb-4 ${getTextThemeClasses()}`}>
                Gallery
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {galleryImages.map((image, index) => (
                  <div 
                    key={index}
                    className="relative h-48 overflow-hidden rounded-lg cursor-pointer group"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`${resort.name} - Image ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <X className="h-8 w-8 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <div className={`rounded-xl border p-6 ${getCardThemeClasses()}`}>
              <div className="space-y-4">
                <div>
                  <div className={`text-2xl font-bold ${getTextThemeClasses()}`}>
                    {resort.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per night
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className={`${getSubtleTextClasses()}`}>
                      Flexible stay
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className={`${getSubtleTextClasses()}`}>
                      1-10 guests
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className={`${getSubtleTextClasses()}`}>
                      {resort.star_rating || '5'} Star Resort
                    </span>
                  </div>
                </div>

                <button 
                  onClick={openBookingSheet}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700"
                >
                  Book Now
                </button>

                <button className="w-full rounded-lg border px-4 py-3 text-sm font-medium transition hover:bg-accent">
                  Add to Wishlist
                </button>
              </div>
            </div>

            {/* Quick Info */}
            <div className={`rounded-xl border p-6 ${getCardThemeClasses()}`}>
              <h3 className={`font-semibold mb-4 ${getTextThemeClasses()}`}>
                Quick Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className={`${getSubtleTextClasses()} capitalize`}>
                    Luxury Resort
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rating</span>
                  <span className={`${getSubtleTextClasses()}`}>
                    {resort.star_rating || '5'} Stars
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className={`${getSubtleTextClasses()}`}>
                    3:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className={`${getSubtleTextClasses()}`}>
                    11:00 AM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal/Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(null)
              }}
              className="absolute -top-12 right-0 rounded-full p-2 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={selectedImage}
              alt={`${resort.name} - Enlarged view`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              Click anywhere to close
            </div>
          </div>
        </div>
      )}
      
      {/* Booking Sheet */}
      <BookingSheet
        isOpen={bookingSheet.isOpen}
        onClose={closeBookingSheet}
        destinationId={bookingSheet.destinationId}
        destinationName={bookingSheet.destinationName}
      />
    </div>
  )
}
