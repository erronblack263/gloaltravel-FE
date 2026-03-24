'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Clock, X, CreditCard, Wallet } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { toast, Toaster } from 'sonner'

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
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState<Booking | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentIntentData, setPaymentIntentData] = useState<any>(null)
  const [paymentConfirming, setPaymentConfirming] = useState(false)

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

  const openPaymentModal = (booking: Booking) => {
    setSelectedPaymentBooking(booking)
    setPaymentModalOpen(true)
  }

  const closePaymentModal = () => {
    setPaymentModalOpen(false)
    setSelectedPaymentBooking(null)
  }

  const handlePaymentMethod = async (method: string) => {
    if (!selectedPaymentBooking) return
    
    console.log(`Selected payment method: ${method} for booking:`, selectedPaymentBooking.id)
    
    try {
      setPaymentLoading(true)
      setPaymentError('')
      setPaymentSuccess(false)
      
      // Get token from localStorage
      const token = localStorage.getItem('authToken')
      
      if (method === 'stripe') {
        // Initiate Stripe payment flow
        console.log('Initiating Stripe payment...')
        
        const response = await fetch(`http://localhost:8000/api/v1/payments/create-payment-intent?booking_id=${selectedPaymentBooking.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('Stripe payment intent created:', data)
          
          // Here you would redirect to Stripe Checkout or handle the client secret
          if (data.client_secret) {
            // For Stripe, you would typically use the client_secret with Stripe.js
            console.log('Stripe client secret received:', data.client_secret)
            
            // Store payment intent data and show confirmation screen
            setPaymentIntentData(data)
            setPaymentSuccess(true)
          } else {
            setPaymentError('No client secret received from server')
          }
        } else {
          // Try to get error data, handle empty response
          let errorData: any = {}
          try {
            const responseText = await response.text()
            if (responseText) {
              errorData = JSON.parse(responseText)
            }
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError)
            errorData = { error: `Failed to create payment intent with status ${response.status}` }
          }
          
          console.error('Failed to create Stripe payment intent:', errorData)
          setPaymentError((errorData as any)?.error || 'Failed to create payment intent')
        }
      } else if (method === 'paypal') {
        // Initiate PayPal payment flow
        console.log('Initiating PayPal payment...')
        
        // TODO: Implement PayPal payment flow
        // This would typically involve creating a PayPal order and redirecting to PayPal
        setPaymentIntentData({ method: 'paypal', status: 'created' })
        setPaymentSuccess(true)
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPaymentError('Payment failed. Please try again.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleApprovePayment = async () => {
    if (!selectedPaymentBooking || !paymentIntentData) return
    
    console.log('Payment approved:', paymentIntentData)
    console.log('Booking details:', selectedPaymentBooking)
    
    try {
      // Start payment processing
      setPaymentConfirming(true)
      
      // Get token from localStorage
      const token = localStorage.getItem('authToken')
      
      // Call payment confirmation endpoint
      const response = await fetch('http://localhost:8000/api/v1/payments/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          booking_id: selectedPaymentBooking.id,
          payment_intent_id: paymentIntentData.payment_intent_id || paymentIntentData.id,
          payment_method: paymentIntentData.client_secret ? 'stripe' : 'paypal',
          amount: selectedPaymentBooking.total_price
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Payment confirmed:', data)
        
        // Show success notification
        toast.success('Payment successful! Your booking has been confirmed.', {
          description: `Booking #${selectedPaymentBooking.id} for ${selectedPaymentBooking.destination_name}`,
          duration: 5000
        })
        
        // Close sheet and reset state
        closePaymentModal()
        setPaymentSuccess(false)
        setPaymentIntentData(null)
        setPaymentConfirming(false)
        
        // Refresh bookings to update status
        // You might want to refetch bookings here
        window.location.reload()
        
      } else {
        // Try to get error data, handle empty response
        let errorData: any = {}
        try {
          const responseText = await response.text()
          if (responseText) {
            errorData = JSON.parse(responseText)
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorData = { error: `Payment failed with status ${response.status}` }
        }
        
        console.error('Payment confirmation failed:', errorData)
        
        // Show error notification
        toast.error('Payment failed', {
          description: errorData.error || errorData.message || 'Unable to complete payment. Please try again.',
          duration: 5000
        })
      }
      
    } catch (error) {
      console.error('Payment confirmation error:', error)
      
      // Show error notification
      toast.error('Payment error', {
        description: 'Network error occurred while processing payment. Please check your connection and try again.',
        duration: 5000
      })
    } finally {
      // Always stop processing spinner
      setPaymentConfirming(false)
    }
  }

  const handleCancelPayment = () => {
    console.log('Payment cancelled')
    // Reset to initial state to show payment options again
    setPaymentSuccess(false)
    setPaymentIntentData(null)
    setPaymentError('')
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
    <>
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

                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${getTextThemeClasses()} hover:bg-primary/10`}
                    >
                      View Details
                    </button>
                    
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => openPaymentModal(booking)}
                        className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                      >
                        Proceed to Payment
                      </button>
                    )}
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
      
      {/* Payment Sheet */}
      <Sheet open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              Complete Your Payment
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            {!paymentSuccess ? (
              <>
                <div>
                  <p className={`text-sm ${getTextThemeClasses()} opacity-70 mb-4`}>
                    Choose your preferred payment method for {selectedPaymentBooking?.destination_name}
                  </p>
                  
                  <div className={`rounded-lg border p-4 ${getCardThemeClasses()}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`${getTextThemeClasses()} font-medium`}>Booking Amount</span>
                      <span className={`text-lg font-bold ${getTextThemeClasses()}`}>
                        {selectedPaymentBooking?.total_price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`${getTextThemeClasses()} opacity-70`}>Booking ID</span>
                      <span className={`${getTextThemeClasses()} opacity-70`}>#{selectedPaymentBooking?.id}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handlePaymentMethod('stripe')}
                    disabled={paymentLoading}
                    className={`w-full flex items-center justify-center gap-3 rounded-lg border px-4 py-3 font-medium transition-colors hover:bg-primary/10 ${
                      paymentLoading ? 'opacity-50 cursor-not-allowed' : getTextThemeClasses()
                    }`}
                  >
                    {paymentLoading ? (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <CreditCard className="h-5 w-5" />
                    )}
                    {paymentLoading ? 'Processing...' : 'Pay with Stripe'}
                  </button>
                  
                  <button
                    onClick={() => handlePaymentMethod('paypal')}
                    disabled={paymentLoading}
                    className={`w-full flex items-center justify-center gap-3 rounded-lg border px-4 py-3 font-medium transition-colors hover:bg-primary/10 ${
                      paymentLoading ? 'opacity-50 cursor-not-allowed' : getTextThemeClasses()
                    }`}
                  >
                    {paymentLoading ? (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <Wallet className="h-5 w-5" />
                    )}
                    {paymentLoading ? 'Processing...' : 'Pay with PayPal'}
                  </button>
                </div>

                {paymentError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                    <p className="text-sm text-red-700">{paymentError}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className={`text-xl font-bold ${getTextThemeClasses()} mb-2`}>
                  Payment Intent Ready!
                </h3>
                <p className={`${getTextThemeClasses()} opacity-70 mb-6`}>
                  Your payment intent has been created. Please review the details below and confirm to proceed with payment.
                </p>
                
                {/* Complete Booking Details */}
                <div className={`rounded-lg border p-4 ${getCardThemeClasses()} mb-6 text-left`}>
                  <h4 className={`font-semibold mb-4 ${getTextThemeClasses()}`}>Booking Details</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`${getTextThemeClasses()} opacity-70`}>Destination/Resort</span>
                      <span className={`${getTextThemeClasses()} font-medium`}>
                        {selectedPaymentBooking?.destination_name}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={`${getTextThemeClasses()} opacity-70`}>Location</span>
                      <span className={`${getTextThemeClasses()} font-medium`}>
                        {selectedPaymentBooking?.city && selectedPaymentBooking?.country 
                          ? `${selectedPaymentBooking.city}, ${selectedPaymentBooking.country}`
                          : 'Location not specified'
                        }
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={`${getTextThemeClasses()} opacity-70`}>Booking ID</span>
                      <span className={`${getTextThemeClasses()} font-medium`}>
                        #{selectedPaymentBooking?.id}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={`${getTextThemeClasses()} opacity-70`}>Category</span>
                      <span className={`${getTextThemeClasses()} font-medium capitalize`}>
                        {selectedPaymentBooking?.category}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={`${getTextThemeClasses()} opacity-70`}>Check-in Date</span>
                      <span className={`${getTextThemeClasses()} font-medium`}>
                        {selectedPaymentBooking?.check_in_date || 'Not specified'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={`${getTextThemeClasses()} opacity-70`}>Check-out Date</span>
                      <span className={`${getTextThemeClasses()} font-medium`}>
                        {selectedPaymentBooking?.check_out_date || 'Not specified'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className={`${getTextThemeClasses()} opacity-70`}>Number of Guests</span>
                      <span className={`${getTextThemeClasses()} font-medium`}>
                        {selectedPaymentBooking?.number_of_guests || '1'} guest(s)
                      </span>
                    </div>
                    
                    {selectedPaymentBooking?.special_requests && (
                      <div>
                        <span className={`${getTextThemeClasses()} opacity-70`}>Special Requests</span>
                        <p className={`${getTextThemeClasses()} font-medium mt-1`}>
                          {selectedPaymentBooking.special_requests}
                        </p>
                      </div>
                    )}
                    
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className={`${getTextThemeClasses()} font-semibold`}>Total Amount</span>
                        <span className={`text-xl font-bold ${getTextThemeClasses()}`}>
                          {selectedPaymentBooking?.total_price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Method Info */}
                <div className={`rounded-lg border p-4 ${getCardThemeClasses()} mb-6 text-left`}>
                  <h4 className={`font-semibold mb-2 ${getTextThemeClasses()}`}>Payment Method</h4>
                  <div className="flex items-center gap-2">
                    {paymentIntentData?.client_secret ? (
                      <>
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <span className={`${getTextThemeClasses()}`}>Stripe</span>
                      </>
                    ) : paymentIntentData?.method === 'paypal' ? (
                      <>
                        <Wallet className="h-5 w-5 text-blue-600" />
                        <span className={`${getTextThemeClasses()}`}>PayPal</span>
                      </>
                    ) : (
                      <span className={`${getTextThemeClasses()}`}>Payment method selected</span>
                    )}
                  </div>
                  {paymentIntentData?.payment_intent_id && (
                    <p className={`text-sm ${getTextThemeClasses()} opacity-60 mt-1`}>
                      Payment Intent ID: {paymentIntentData.payment_intent_id}
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelPayment}
                    disabled={paymentConfirming}
                    className={`flex-1 rounded-lg border px-4 py-3 font-medium transition-colors hover:bg-primary/10 ${
                      paymentConfirming ? 'opacity-50 cursor-not-allowed' : getTextThemeClasses()
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprovePayment}
                    disabled={paymentConfirming}
                    className={`flex-1 rounded-lg px-4 py-3 font-medium text-white transition ${
                      paymentConfirming 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {paymentConfirming ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </div>
                    ) : (
                      'Approve & Pay'
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="text-center">
              <p className={`text-xs ${getTextThemeClasses()} opacity-60`}>
                By proceeding, you agree to the payment terms and conditions
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      </div>
      <Toaster position="top-left" />
    </>
  )
}
