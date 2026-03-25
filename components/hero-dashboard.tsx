"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Calendar, Users, Star, ChevronRight, Menu, X, Plane, Compass, User, Settings, LogOut, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { ThemeSwitcher } from "@/components/theme-switcher"
import Image from "next/image"

const destinations = [
  {
    id: 1,
    name: "Bali Paradise",
    location: "Indonesia",
    rating: 4.8,
    price: "$1,299",
    duration: "7 days",
    image: "/images/phuket-hero.jpg"
  },
  {
    id: 2,
    name: "Santorini Dreams",
    location: "Greece", 
    rating: 4.9,
    price: "$2,199",
    duration: "5 days",
    image: "/images/greece.jpg"
  },
  {
    id: 3,
    name: "Singapore Adventure",
    location: "Singapore",
    rating: 4.7,
    price: "$1,899",
    duration: "6 days", 
    image: "/images/singapore.jpg"
  }
]

const heroImages = [
  "/images/amsterdam.jpg",
  "/images/greece.jpg", 
  "/images/phuket-hero.jpg",
  "/images/singapore.jpg",
  "/images/japan.jpg"
]

export function HeroDashboard() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDestination, setSelectedDestination] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const router = useRouter()

  const handleLogout = async () => {
    setShowLogoutConfirm(true)
    setProfileDropdownOpen(false)
  }

  const confirmLogout = async () => {
    try {
      const token = localStorage.getItem('authToken')
      
      console.log('Attempting logout with token:', token ? 'exists' : 'none')
      console.log('Token value:', token)
      
      // Always clear local storage first
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
      setCurrentUser(null)
      
      // Try to call backend, but don't wait for it to succeed
      if (token) {
        try {
          const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          })

          console.log('Logout response status:', response.status)
          
          const data = await response.json()
          console.log('Logout response data:', data)
          
          if (data.success) {
            console.log('Backend logout successful')
          } else {
            console.log('Backend logout failed, but local logout completed:', data.error)
            console.log('Backend response details:', data.backendResponse)
          }
        } catch (backendError) {
          console.log('Backend logout error, but local logout completed:', backendError)
        }
      }
      
      // Always redirect to auth page
      console.log('Redirecting to auth page')
      router.push('/auth')
      
    } catch (error) {
      console.error('Logout error:', error)
      // Even if everything fails, clear storage and redirect
      localStorage.removeItem('authToken')
      localStorage.removeItem('currentUser')
      setCurrentUser(null)
      router.push('/auth')
    }
    
    setShowLogoutConfirm(false)
  }

  useEffect(() => {
    setMounted(true)
    
    // Load current user from localStorage on mount
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('currentUser')
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        setCurrentUser(user)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)
    }, 15000) // Change every 15 seconds

    return () => clearInterval(interval)
  }, [])

  const getThemeClasses = () => {
    if (!mounted) return "bg-gray-100"
    
    switch (theme) {
      case "light":
        return "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      case "dim":
        return "bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800"
      case "dark":
        return "bg-gradient-to-br from-gray-900 via-black to-gray-900"
      default:
        return "bg-gradient-to-br from-blue-50 via-white to-purple-50"
    }
  }

  const getTextThemeClasses = () => {
    if (!mounted) return "text-gray-900"
    
    switch (theme) {
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
    
    switch (theme) {
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

  const getOverlayClasses = () => {
    if (!mounted) return "bg-black/40"
    
    switch (theme) {
      case "light":
        return "bg-gradient-to-t from-black/60 via-black/20 to-transparent"
      case "dim":
        return "bg-gradient-to-t from-black/80 via-black/40 to-transparent"
      case "dark":
        return "bg-gradient-to-t from-black/90 via-black/50 to-transparent"
      default:
        return "bg-gradient-to-t from-black/60 via-black/20 to-transparent"
    }
  }

  return (
    <div className={`min-h-screen ${getThemeClasses()}`}>
      {/* Header Navigation */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-lg ${getCardThemeClasses()}`}>
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Plane className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className={`text-xl font-bold ${getTextThemeClasses()}`}>
                GlobalTravel
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { name: "Explore", icon: Compass, href: "/dashboard" },
                { name: "Destinations", icon: MapPin, href: "/destinations" },
                { name: "Resorts", icon: Users, href: "/resorts" },
                { name: "Map View", icon: MapPin, href: "/map" },
                { name: "About", icon: Plane, href: "#" }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                    item.name === "Explore" ? "text-primary" : getTextThemeClasses()
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-2 h-10 px-3 rounded-full border-2 ${getCardThemeClasses()} ${getTextThemeClasses()} transition-colors hover:scale-105`}
                >
                  {currentUser ? (
                    <>
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <span className="text-xs font-medium text-primary-foreground">
                          {currentUser.username?.charAt(0).toUpperCase() || currentUser.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {currentUser.username || currentUser.name || 'User'}
                      </span>
                    </>
                  ) : (
                    <>
                      <User className="h-5 w-5" />
                      <span className="text-sm font-medium">Profile</span>
                    </>
                  )}
                </button>
                
                {profileDropdownOpen && (
                  <div className={`absolute right-0 top-12 w-48 rounded-lg border shadow-lg ${getCardThemeClasses()} overflow-hidden z-50`}>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push("/profile")
                          setProfileDropdownOpen(false)
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/10 ${getTextThemeClasses()}`}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </button>
                      
                      <button
                        onClick={() => {
                          router.push("/bookings")
                          setProfileDropdownOpen(false)
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/10 ${getTextThemeClasses()}`}
                      >
                        <Calendar className="h-4 w-4" />
                        My Bookings
                      </button>
                      
                      <button
                        onClick={() => {
                          router.push("/settings")
                          setProfileDropdownOpen(false)
                        }}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-primary/10 ${getTextThemeClasses()}`}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      
                      <hr className={`my-2 ${getTextThemeClasses()} opacity-20`} />
                      
                      <button
                        onClick={handleLogout}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-destructive/10 ${getTextThemeClasses()}`}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push("/auth")}
                className={`hidden rounded-lg px-4 py-2 text-sm font-medium transition-colors md:block ${getTextThemeClasses()} hover:bg-primary/10`}
              >
                Sign In
              </button>
              
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden ${getTextThemeClasses()}`}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className={`md:hidden border-t ${getCardThemeClasses()}`}>
              <nav className="px-4 py-4">
                {[
                  { name: "Explore", icon: Compass, href: "/dashboard" },
                  { name: "Destinations", icon: MapPin, href: "/destinations" },
                  { name: "Resorts", icon: Users, href: "/resorts" },
                  { name: "Map View", icon: MapPin, href: "/map" },
                  { name: "About", icon: Plane, href: "#" }
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.href)
                      setMobileMenuOpen(false)
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-3 text-sm font-medium transition-colors hover:bg-primary/10 ${getTextThemeClasses()}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </button>
                ))}
                <div className="mt-4 flex items-center justify-between gap-4">
                  <ThemeSwitcher />
                  <button
                    onClick={() => {
                      router.push("/auth")
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${getTextThemeClasses()} hover:bg-primary/10`}
                  >
                    Sign In
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden">
        <Image
          src={heroImages[currentImageIndex]}
          alt="Travel Hero"
          fill
          className="object-cover transition-opacity duration-1000"
          priority
        />
        <div className={`absolute inset-0 ${getOverlayClasses()}`} />
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-white w-8"
                  : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold md:text-6xl lg:text-7xl">
            Discover Your Next Adventure
          </h1>
          <p className="mb-8 max-w-2xl text-lg md:text-xl lg:text-2xl text-white/90">
            Explore breathtaking destinations around the world and create memories that last a lifetime
          </p>
          
          {/* Search Bar */}
          <div className="w-full max-w-2xl">
            <div className="flex items-center rounded-full bg-white/10 backdrop-blur-md">
              <Search className="ml-4 h-5 w-5 text-white/70" />
              <input
                type="text"
                placeholder="Search destinations, hotels, activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-4 py-4 text-white placeholder-white/70 outline-none"
              />
              <button className="mr-2 rounded-full bg-white px-6 py-2 font-semibold text-gray-900 transition hover:bg-gray-100">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { icon: MapPin, label: "Destinations", value: "150+" },
            { icon: Users, label: "Happy Travelers", value: "50K+" },
            { icon: Star, label: "Average Rating", value: "4.8" },
            { icon: Calendar, label: "Years Experience", value: "15+" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className={`text-2xl font-bold ${getTextThemeClasses()}`}>
                {stat.value}
              </div>
              <div className={`text-sm ${getTextThemeClasses()} opacity-70`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-8">
          <h2 className={`mb-2 text-3xl font-bold ${getTextThemeClasses()}`}>
            Popular Destinations
          </h2>
          <p className={`${getTextThemeClasses()} opacity-70`}>
            Handpicked destinations loved by travelers worldwide
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${getCardThemeClasses()}`}
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Rating Badge */}
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {destination.rating}
                </div>
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {destination.location}
                  </span>
                </div>
                
                <h3 className={`mb-2 font-semibold ${getTextThemeClasses()}`}>
                  {destination.name}
                </h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-lg font-bold ${getTextThemeClasses()}`}>
                      {destination.price}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {destination.duration}
                    </div>
                  </div>
                  
                  <button className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                    Explore
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`mx-4 max-w-sm rounded-lg border shadow-xl ${getCardThemeClasses()} p-6`}>
            <div className="mb-4">
              <h3 className={`text-lg font-semibold ${
                theme === 'light' ? 'text-gray-900' : 'text-gray-100'
              }`}>
                Confirm Logout
              </h3>
              <p className={`mt-2 text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Are you sure you want to logout? You'll need to sign in again to access your account.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  theme === 'light' 
                    ? 'text-gray-700 border-gray-300 hover:bg-gray-50' 
                    : 'text-gray-300 border-gray-600 hover:bg-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
