'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Clock, X } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'

export default function BookingsPage() {
  const router = useRouter()
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Define booking type interface
  interface Booking {
    id: number
    destination_name: string
    destination_id: number
    check_in_date: string
    check_out_date: string
    number_of_guests: number
    special_requests: string
    status: string
    created_at: string
    total_price: string
    category: 'destination' | 'resort'
    country?: string
    city?: string
  }

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all') // 'all', 'destinations', 'resorts'

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

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        
        // Get token from localStorage
        const token = localStorage.getItem('authToken')
        
        if (!token) {
          router.push('/auth')
          return
        }
        
        // Fetch both destination and resort bookings
        const [destinationsResponse, resortsResponse] = await Promise.all([
          fetch('http://localhost:8000/api/v1/destination-bookings/', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('http://localhost:8000/api/v1/resort-bookings/', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
        ])
        
        let allBookings: Booking[] = []
        
        if (destinationsResponse.ok) {
          const destinationsData = await destinationsResponse.json()
          const transformedDestinations = destinationsData.map((booking: any) => ({
            id: booking.id,
            destination_name: booking.destination_name || booking.name || 'Unknown destination',
            destination_id: booking.destination_id,
            check_in_date: booking.check_in_date,
            check_out_date: booking.check_out_date,
            number_of_guests: booking.number_of_guests,
            special_requests: booking.special_requests,
            status: booking.status || 'confirmed',
            created_at: booking.created_at,
            total_price: booking.total_price || 'Calculated at checkout',
            category: 'destination',
            country: booking.country || '',
            city: booking.city || ''
          }))
          allBookings = [...allBookings, ...transformedDestinations]
        } else {
          console.error('Failed to fetch destination bookings:', destinationsResponse.status)
        }
        
        if (resortsResponse.ok) {
          const resortsData = await resortsResponse.json()
          const transformedResorts = resortsData.map((booking: any) => ({
            id: booking.id,
            destination_name: booking.resort_name || 'Unknown Resort',
            destination_id: booking.resort_id,
            check_in_date: booking.check_in_date,
            check_out_date: booking.check_out_date,
            number_of_guests: booking.number_of_guests,
            special_requests: booking.special_requests,
            status: booking.status || 'confirmed',
            created_at: booking.created_at,
            total_price: booking.total_amount || 'Calculated at checkout',
            category: 'resort',
            country: booking.resort_country || '',
            city: booking.resort_city || ''
          }))
          allBookings = [...allBookings, ...transformedResorts]
        } else {
          console.error('Failed to fetch resort bookings:', resortsResponse.status)
        }
        
        // Sort by created_at date (newest first)
        allBookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          
        setBookings(allBookings)
      } catch (error) {
        console.error('Error fetching bookings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  // Filter bookings by category
  const filteredBookings = selectedCategory === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.category === selectedCategory)

  const categoryStats = {
    all: bookings.length,
    destinations: bookings.filter(b => b.category === 'destination').length,
    resorts: bookings.filter(b => b.category === 'resort').length
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${getBackgroundThemeClasses()}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className={`mt-4 ${getTextThemeClasses()} opacity-70`}>
            Loading your bookings...
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
                GlobalTravel
              </span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              
              <button
                onClick={() => router.push('/dashboard')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${getTextThemeClasses()} hover:bg-primary/10`}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${getTextThemeClasses()} mb-2`}>
            My Bookings
          </h1>
          <p className={`${getTextThemeClasses()} opacity-70`}>
            Manage and view all your destination bookings
          </p>
        </div>

        {/* Category Filter */}
        <div className={`rounded-xl border p-4 mb-6 ${getCardThemeClasses()}`}>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : `${getTextThemeClasses()} hover:bg-primary/10`
              }`}
            >
              All ({categoryStats.all})
            </button>
            <button
              onClick={() => setSelectedCategory('destinations')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'destinations' 
                  ? 'bg-primary text-primary-foreground' 
                  : `${getTextThemeClasses()} hover:bg-primary/10`
              }`}
            >
              Destinations ({categoryStats.destinations})
            </button>
            <button
              onClick={() => setSelectedCategory('resorts')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'resorts' 
                  ? 'bg-primary text-primary-foreground' 
                  : `${getTextThemeClasses()} hover:bg-primary/10`
              }`}
            >
              Resorts ({categoryStats.resorts})
            </button>
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className={`text-6xl font-bold ${getTextThemeClasses()} opacity-50 mb-4`}>
              No {selectedCategory === 'all' ? '' : selectedCategory} bookings yet
            </div>
            <p className={`${getTextThemeClasses()} opacity-70 mb-8`}>
              You haven't made any {selectedCategory === 'all' ? '' : selectedCategory} bookings yet. Start exploring destinations and book your first trip!
            </p>
            <button
              onClick={() => router.push('/destinations')}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              Explore Destinations
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className={`rounded-xl border p-6 transition-all duration-300 ${getCardThemeClasses()} hover:shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className={`text-xl font-semibold ${getTextThemeClasses()} mb-2`}>
                        {booking.destination_name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className={`${getTextThemeClasses()} opacity-70`}>
                            {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className={`${getTextThemeClasses()} opacity-70`}>
                            {booking.number_of_guests} guests
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className={`text-sm font-medium ${getTextThemeClasses()} mb-1`}>
                          Booking ID
                        </p>
                        <p className={`text-sm ${getTextThemeClasses()} opacity-70`}>
                          #{booking.id}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${getTextThemeClasses()} mb-1`}>
                          Total Price
                        </p>
                        <p className={`text-lg font-semibold ${getTextThemeClasses()}`}>
                          {booking.total_price}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${getTextThemeClasses()} mb-1`}>
                          Status
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${getTextThemeClasses()} mb-1`}>
                          Booked on
                        </p>
                        <p className={`text-sm ${getTextThemeClasses()} opacity-70`}>
                          {formatDate(booking.created_at)}
                        </p>
                      </div>
                    </div>

                    {booking.special_requests && (
                      <div className="mt-4">
                        <p className={`text-sm font-medium ${getTextThemeClasses()} mb-1`}>
                          Special Requests
                        </p>
                        <p className={`text-sm ${getTextThemeClasses()} opacity-70`}>
                          {booking.special_requests}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${getTextThemeClasses()} hover:bg-primary/10`}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div 
            className={`relative max-w-2xl w-full rounded-xl border p-6 ${getCardThemeClasses()}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBooking(null)}
              className={`absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-primary/10 ${getTextThemeClasses()}`}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className={`text-2xl font-bold ${getTextThemeClasses()} mb-6`}>
              Booking Details
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className={`text-lg font-semibold ${getTextThemeClasses()} mb-3`}>
                  Destination Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`${getTextThemeClasses()} opacity-70`}>Destination</span>
                    <span className={`${getTextThemeClasses()} font-medium`}>
                      {selectedBooking.destination_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${getTextThemeClasses()} opacity-70`}>Booking ID</span>
                    <span className={`${getTextThemeClasses()} font-medium`}>
                      #{selectedBooking.id}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold ${getTextThemeClasses()} mb-3`}>
                  Travel Dates
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`${getTextThemeClasses()} opacity-70`}>Check-in</span>
                    <span className={`${getTextThemeClasses()} font-medium`}>
                      {formatDate(selectedBooking.check_in_date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${getTextThemeClasses()} opacity-70`}>Check-out</span>
                    <span className={`${getTextThemeClasses()} font-medium`}>
                      {formatDate(selectedBooking.check_out_date)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-semibold ${getTextThemeClasses()} mb-3`}>
                  Guest Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={`${getTextThemeClasses()} opacity-70`}>Number of Guests</span>
                    <span className={`${getTextThemeClasses()} font-medium`}>
                      {selectedBooking.number_of_guests}
                    </span>
                  </div>
                </div>
              </div>

              {selectedBooking.special_requests && (
                <div>
                  <h3 className={`text-lg font-semibold ${getTextThemeClasses()} mb-3`}>
                    Special Requests
                  </h3>
                  <p className={`${getTextThemeClasses()} opacity-70`}>
                    {selectedBooking.special_requests}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <span className={`${getTextThemeClasses()} opacity-70`}>Total Price</span>
                  <span className={`text-2xl font-bold ${getTextThemeClasses()}`}>
                    {selectedBooking.total_price}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
