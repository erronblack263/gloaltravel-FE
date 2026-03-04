'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Star, Heart, Calendar, DollarSign, Users, Globe, Camera, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import BookingSheet from '@/components/BookingSheet'

export default function DestinationDetailPage() {
  const params = useParams()
  const router = useRouter()

  // Open booking sheet
  const openBookingSheet = () => {
    if (!destination) return
    setBookingSheet({
      isOpen: true,
      destinationId: destination.id,
      destinationName: destination.name
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
  const [destination, setDestination] = useState<any>(null)
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
    const fetchDestination = async () => {
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
        
        // Fetch specific destination by ID from FastAPI backend
        const response = await fetch(`http://localhost:8000/api/v1/destinations/${params.id}`, {
          headers
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data && data.id) {
            // Transform the data to match frontend expectations
            const transformedDestination = {
              id: data.id,
              name: data.name,
              location: `${data.city}, ${data.country}`,
              rating: 4.5 + Math.random() * 0.5, // Generate random rating between 4.5-5.0
              price: data.entry_fee === '0.00' ? 'Free' : `$${data.entry_fee}`,
              duration: `${3 + Math.floor(Math.random() * 5)} days`, // Random duration 3-7 days
              image: data.images && data.images.length > 0 && typeof data.images[0] === 'string' && data.images[0].startsWith('http')
                ? data.images[0].replace('w=800', 'w=1200').replace('h=600', 'h=800')
                : data.images && data.images.length > 0 && typeof data.images[0] === 'string'
                  ? `http://localhost:8000${data.images[0]}`
                  : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
              description: `Experience the beauty of ${data.name}, ${data.city}, ${data.country}`,
              highlights: [data.type, `${data.city}`, `${data.country}`],
              saved: false,
              type: data.type,
              city: data.city,
              country: data.country,
              entry_fee: data.entry_fee
            }
            
            setDestination(transformedDestination)
            
            // Check if saved
            const savedDestinations = JSON.parse(localStorage.getItem('savedDestinations') || '[]')
            setSaved(savedDestinations.includes(transformedDestination.id))
          } else {
            console.error('Invalid destination data received')
          }
        } else {
          console.error('Failed to fetch destination:', response.status)
        }
      } catch (error) {
        console.error('Error fetching destination:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDestination()
  }, [params.id])

  const toggleSave = () => {
    if (!destination) return
    
    const savedDestinations = JSON.parse(localStorage.getItem('savedDestinations') || '[]')
    const newSaved = savedDestinations.includes(destination.id)
      ? savedDestinations.filter((id: number) => id !== destination.id)
      : [...savedDestinations, destination.id]
    
    localStorage.setItem('savedDestinations', JSON.stringify(newSaved))
    setSaved(!saved)
  }

  // Create gallery images array with destination-specific images from static folder
  const getDestinationGallery = (destinationName: string) => {
    // Convert destination name to format suitable for image files
    const formatName = (name: string) => {
      return name
        .replace(/[^a-zA-Z0-9\s_]/g, '') // Remove special characters except underscore and space
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/^(.)/, (match) => match.toUpperCase()) // Capitalize first letter
    }
    
    const formattedName = formatName(destinationName)
    
    // Generate image paths based on the pattern: [DestinationName]_0, [DestinationName]_1, [DestinationName]_2
    const galleryImages = [
      `/static/images/${formattedName}_0.jpg`,
      `/static/images/${formattedName}_1.jpg`,
      `/static/images/${formattedName}_2.jpg`
    ]
    
    return galleryImages
  }

  const galleryImages = destination ? getDestinationGallery(destination.name) : []
  
  // Debug: Log destination name and gallery images
  console.log('Destination:', destination?.name)
  console.log('Gallery Images:', galleryImages)

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getBackgroundThemeClasses()}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className={`mt-4 ${getTextThemeClasses()} opacity-70`}>
            Loading destination details...
          </p>
        </div>
      </div>
    )
  }

  if (!destination) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getBackgroundThemeClasses()}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold ${getTextThemeClasses()} mb-4`}>
            Destination Not Found
          </h1>
          <button
            onClick={() => router.push('/destinations')}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Back to Destinations
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
          src={destination.image}
          alt={destination.name}
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
              router.push('/destinations')
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
              {destination.name}
            </h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{destination.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{destination.rating}</span>
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
                About This Destination
              </h2>
              <p className={`${getSubtleTextClasses()} leading-relaxed`}>
                {destination.description}
              </p>
            </div>

            {/* Highlights */}
            <div className={`rounded-xl border p-6 ${getCardThemeClasses()}`}>
              <h2 className={`text-xl font-semibold mb-4 ${getTextThemeClasses()}`}>
                Highlights
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {destination.highlights?.map((highlight: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <span className={`${getSubtleTextClasses()}`}>
                      {highlight}
                    </span>
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
                      alt={`${destination.name} - Image ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Camera className="h-8 w-8 text-white" />
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
                    {destination.price}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    per person
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className={`${getSubtleTextClasses()}`}>
                      {destination.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className={`${getSubtleTextClasses()}`}>
                      2-10 travelers
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className={`${getSubtleTextClasses()}`}>
                      Available year-round
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
                    {destination.highlights?.[0] || 'Adventure'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Difficulty</span>
                  <span className={`${getSubtleTextClasses()}`}>
                    Moderate
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Best Time</span>
                  <span className={`${getSubtleTextClasses()}`}>
                    Year-round
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
              alt={`${destination.name} - Enlarged view`}
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
