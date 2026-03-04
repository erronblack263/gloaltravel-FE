"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Star, Calendar, Users, Filter, ChevronDown, Heart, ArrowRight } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { ThemeSwitcher } from "@/components/theme-switcher"
import Image from "next/image"
import BookingSheet from "@/components/BookingSheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const categories = ["All", "Beach", "City", "Mountain", "Cultural", "Adventure"]
const countries = [
  { name: "All", flag: "🌍" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Greece", flag: "🇬🇷" },
  { name: "Thailand", flag: "🇹🇭" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "United States", flag: "🇺🇸" },
  { name: "France", flag: "🇫🇷" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "India", flag: "🇮🇳" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "Maldives", flag: "🇲🇻" }
]
const cities = [
  "Male", "Rome", "Athens", "Bangkok", "Tokyo", "Paris", "London", 
  "New York", "Sydney", "Mumbai", "Cairo", "Barcelona", "Amsterdam"
]
const types = ["", "Beach", "City", "Mountain", "Cultural", "Adventure", "Historical", "Nature", "Urban"]
const sortOptions = ["Popular", "Price: Low to High", "Price: High to Low", "Rating", "Duration"]

export default function DestinationsPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedCountry, setSelectedCountry] = useState("All")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [sortBy, setSortBy] = useState("Popular")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [savedDestinations, setSavedDestinations] = useState<number[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [destinations, setDestinations] = useState<any[]>([])
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<number, number>>({})
  const [autoPlayIntervals, setAutoPlayIntervals] = useState<Record<number, NodeJS.Timeout>>({})
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 6,
    has_next: false,
    has_prev: false
  })
  const [bookingSheet, setBookingSheet] = useState({
    isOpen: false,
    destinationId: 0,
    destinationName: ''
  })
  const router = useRouter()

  // Open booking sheet
  const openBookingSheet = (destinationId: number, destinationName: string) => {
    setBookingSheet({
      isOpen: true,
      destinationId,
      destinationName
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

  // Carousel navigation functions
  const nextImage = (destinationId: number, totalImages: number) => {
    setCurrentImageIndices(prev => ({
      ...prev,
      [destinationId]: (prev[destinationId] || 0) >= totalImages - 1 ? 0 : (prev[destinationId] || 0) + 1
    }))
  }

  const prevImage = (destinationId: number, totalImages: number) => {
    setCurrentImageIndices(prev => ({
      ...prev,
      [destinationId]: (prev[destinationId] || 0) <= 0 ? totalImages - 1 : (prev[destinationId] || 0) - 1
    }))
  }

  // Auto-play functions
  const startAutoPlay = (destinationId: number) => {
    // Clear any existing interval for this destination
    if (autoPlayIntervals[destinationId]) {
      clearInterval(autoPlayIntervals[destinationId])
    }
    
    // Start new interval
    const interval = setInterval(() => {
      nextImage(destinationId, 3)
    }, 3000) // Change image every 3 seconds
    
    setAutoPlayIntervals(prev => ({
      ...prev,
      [destinationId]: interval
    }))
  }

  const stopAutoPlay = (destinationId: number) => {
    if (autoPlayIntervals[destinationId]) {
      clearInterval(autoPlayIntervals[destinationId])
      setAutoPlayIntervals(prev => {
        const newIntervals = { ...prev }
        delete newIntervals[destinationId]
        return newIntervals
      })
    }
  }

  // Start auto-play for all destinations when they load
  useEffect(() => {
    destinations.forEach(destination => {
      startAutoPlay(destination.id)
    })
    
    // Cleanup all intervals when component unmounts
    return () => {
      Object.values(autoPlayIntervals).forEach(interval => clearInterval(interval))
    }
  }, [destinations])

  // Get all images for a destination
  const getDestinationImages = (destination: any) => {
    // Generate 3 images based on destination name
    const baseName = destination.name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_')
    return [
      `http://localhost:8000/static/images/${baseName}_0.jpg`,
      `http://localhost:8000/static/images/${baseName}_1.jpg`, 
      `http://localhost:8000/static/images/${baseName}_2.jpg`
    ]
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch destinations from API
  const fetchDestinations = async (page: number = 1, search: string = '', category: string = 'All', country: string = 'All', city: string = '', type: string = '') => {
    try {
      setLoading(true)
      
      // Get token from localStorage
      const token = localStorage.getItem('authToken')
      
      console.log('🔍 Fetching destinations:', { page, search, category, country, city, type })
      
      let apiUrl = ''
      let response
      
      if (search && search.trim() !== '') {
        // Use dedicated search endpoint when there's a search query
        apiUrl = `/api/destinations/search?name=${encodeURIComponent(search.trim())}`
        console.log('🔍 Using dedicated search endpoint:', apiUrl)
        
        response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        })
      } else if (city || type || (country && country !== 'All')) {
        // Use advanced filter endpoint when specific filters are applied
        const queryParams = new URLSearchParams()
        if (city) queryParams.append('city', city)
        if (country && country !== 'All') queryParams.append('country', country)
        if (type) queryParams.append('type', type)
        queryParams.append('page', page.toString())
        queryParams.append('limit', '10')
        
        apiUrl = `/api/destinations/filter?${queryParams.toString()}`
        console.log('🎛️ Using advanced filter endpoint:', apiUrl)
        
        response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        })
      } else if (country && country !== 'All') {
        // Use country endpoint when only country is selected
        apiUrl = `/api/destinations/country?country=${encodeURIComponent(country)}&page=${page}&limit=10`
        console.log('🌍 Using country endpoint:', apiUrl)
        
        response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        })
      } else {
        // Use general destinations endpoint when no filters
        apiUrl = `/api/destinations?page=${page}&limit=10`
        if (category && category !== 'All') {
          apiUrl += `&category=${encodeURIComponent(category)}`
          console.log('🏔️ Using category filter for:', category)
        }
        console.log('📡 Using general destinations endpoint:', apiUrl)
        
        response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        })
      }
      
      console.log('📊 Response status:', response.status)
      
      const data = await response.json()
      console.log('📦 Response data:', data)
      
      if (data.success) {
        console.log('✅ Success! Setting destinations:', data.destinations?.length || 0, 'items')
        console.log('🏷️ Destinations types:', data.destinations?.map((d: any) => d.type))
        setDestinations(data.destinations || [])
        setPagination(data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_items: 0,
          items_per_page: 10,
          has_next: false,
          has_prev: false
        })
        console.log('Destinations loaded:', data.fallback ? 'Using fallback data' : 'Using backend data')
      } else {
        console.error('❌ Failed to fetch destinations:', data.error)
        // Set empty array to prevent undefined issues
        setDestinations([])
      }
    } catch (error) {
      console.error('💥 Error fetching destinations:', error)
      // Set empty array to prevent undefined issues
      setDestinations([])
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and when search, category, country, city, or type changes
  useEffect(() => {
    if (mounted) {
      fetchDestinations(1, searchQuery, selectedCategory, selectedCountry, selectedCity, selectedType)
    }
  }, [mounted, searchQuery, selectedCategory, selectedCountry, selectedCity, selectedType])

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

  const getSubtleTextClasses = () => {
    switch (theme) {
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

  const getSkeletonThemeClasses = () => {
    switch (theme) {
      case "light":
        return "bg-gray-200"
      case "dim":
        return "bg-gray-700"
      case "dark":
        return "bg-gray-800"
      default:
        return "bg-gray-200"
    }
  }

  // Skeleton Card Component
  const DestinationCardSkeleton = () => (
    <div className={`overflow-hidden rounded-xl border ${getCardThemeClasses()}`}>
      <div className="relative h-48 overflow-hidden">
        {mounted ? (
          <Skeleton className={`h-full w-full ${getSkeletonThemeClasses()}`} />
        ) : (
          <div className="h-full w-full bg-gray-200 animate-pulse" />
        )}
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          {mounted ? (
            <>
              <Skeleton className={`h-4 w-4 rounded-full ${getSkeletonThemeClasses()}`} />
              <Skeleton className={`h-4 w-24 rounded ${getSkeletonThemeClasses()}`} />
            </>
          ) : (
            <>
              <div className="h-4 w-4 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-24 rounded bg-gray-200 animate-pulse" />
            </>
          )}
        </div>
        
        {mounted ? (
          <Skeleton className={`mb-2 h-6 w-3/4 rounded ${getSkeletonThemeClasses()}`} />
        ) : (
          <div className="mb-2 h-6 w-3/4 rounded bg-gray-200 animate-pulse" />
        )}
        
        {mounted ? (
          <>
            <Skeleton className={`mb-4 h-4 w-full rounded ${getSkeletonThemeClasses()}`} />
            <Skeleton className={`mb-4 h-4 w-2/3 rounded ${getSkeletonThemeClasses()}`} />
          </>
        ) : (
          <>
            <div className="mb-4 h-4 w-full rounded bg-gray-200 animate-pulse" />
            <div className="mb-4 h-4 w-2/3 rounded bg-gray-200 animate-pulse" />
          </>
        )}
        
        <div className="mb-4 flex gap-2">
          {mounted ? (
            <>
              <Skeleton className={`h-6 w-16 rounded-full ${getSkeletonThemeClasses()}`} />
              <Skeleton className={`h-6 w-20 rounded-full ${getSkeletonThemeClasses()}`} />
            </>
          ) : (
            <>
              <div className="h-6 w-16 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-6 w-20 rounded-full bg-gray-200 animate-pulse" />
            </>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            {mounted ? (
              <>
                <Skeleton className={`h-5 w-16 rounded ${getSkeletonThemeClasses()}`} />
                <Skeleton className={`h-4 w-12 rounded mt-1 ${getSkeletonThemeClasses()}`} />
              </>
            ) : (
              <>
                <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-12 rounded mt-1 bg-gray-200 animate-pulse" />
              </>
            )}
          </div>
          {mounted ? (
            <Skeleton className={`h-8 w-20 rounded-lg ${getSkeletonThemeClasses()}`} />
          ) : (
            <div className="h-8 w-20 rounded-lg bg-gray-200 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  )

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

  const toggleSave = (id: number) => {
    setSavedDestinations(prev => 
      prev.includes(id) 
        ? prev.filter(destId => destId !== id)
        : [...prev, id]
    )
  }

  // Pagination controls
  const handlePageChange = (page: number) => {
    fetchDestinations(page, searchQuery, selectedCategory, selectedCountry, selectedCity, selectedType)
  }

  const filteredDestinations = destinations // No client-side filtering needed - using dedicated search endpoint

  return (
    <div className={`min-h-screen ${getThemeClasses()} transition-colors duration-300`}>
      {/* Header Navigation */}
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { name: "Explore", icon: MapPin, href: "/dashboard" },
                { name: "Destinations", icon: MapPin, href: "/destinations" },
                { name: "Hotels", icon: MapPin, href: "#" },
                { name: "About", icon: MapPin, href: "#" }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                    item.name === "Destinations" ? "text-primary" : getTextThemeClasses()
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                  {item.name === "Explore" && (
                    <span className="ml-1 text-xs opacity-70">(Dashboard)</span>
                  )}
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
              <ThemeSwitcher />
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
                {mobileMenuOpen ? <ChevronDown className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb Navigation */}
      <div className={`border-b ${getCardThemeClasses()}`}>
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Destinations</BreadcrumbPage>
              </BreadcrumbItem>
              {selectedCountry !== "All" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {countries.find(c => c.name === selectedCountry)?.flag} {selectedCountry}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
              {selectedCategory !== "All" && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{selectedCategory}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
              {searchQuery && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Search: "{searchQuery}"</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-[40vh] overflow-hidden">
        <Image
          src="/images/greece.jpg"
          alt="Destinations Hero"
          fill
          className="object-cover"
          priority
        />
        <div className={`absolute inset-0 ${getOverlayClasses()}`} />
        
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            Explore Destinations
          </h1>
          <p className="mb-8 max-w-2xl text-lg md:text-xl text-white/90">
            Discover amazing places around the world and create unforgettable memories
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-lg border pl-10 pr-4 py-3 ${getCardThemeClasses()} ${getTextThemeClasses()} placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            {/* Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-2 rounded-lg border px-4 py-3 ${getCardThemeClasses()} ${getTextThemeClasses()}`}>
                  <Filter className="h-4 w-4" />
                  <span>{selectedCategory}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {categories.map(category => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => {
                      console.log('🎯 Category clicked:', category)
                      setSelectedCategory(category)
                      console.log('🔄 Category set to:', category)
                    }}
                    className="cursor-pointer"
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Country Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-2 rounded-lg border px-4 py-3 ${getCardThemeClasses()} ${getTextThemeClasses()}`}>
                  <MapPin className="h-4 w-4" />
                  <span>{countries.find(c => c.name === selectedCountry)?.flag || '🌍'} {selectedCountry}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {countries.map(country => (
                  <DropdownMenuItem
                    key={country.name}
                    onClick={() => {
                      console.log('🌍 Country clicked:', country.name)
                      setSelectedCountry(country.name)
                      console.log('🔄 Country set to:', country.name)
                    }}
                    className="cursor-pointer"
                  >
                    <span className="mr-2">{country.flag}</span>
                    {country.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Options */}
            <div className="relative">
              <button className={`flex items-center gap-2 rounded-lg border px-4 py-3 ${getCardThemeClasses()} ${getTextThemeClasses()}`}>
                <span>{sortBy}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Advanced Filters */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-2 rounded-lg border px-4 py-3 ${getCardThemeClasses()} ${getTextThemeClasses()}`}>
                  <Filter className="h-4 w-4" />
                  <span>Advanced</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                <div className="p-2 space-y-3">
                  {/* City Filter */}
                  <div>
                    <label className={`text-xs font-medium mb-1 block ${getTextThemeClasses()}`}>City</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={`w-full flex items-center justify-between rounded border px-3 py-2 text-sm ${getCardThemeClasses()} ${getTextThemeClasses()} hover:border-primary`}>
                          <span className={selectedCity ? '' : 'opacity-60'}>
                            {selectedCity || 'Select city'}
                          </span>
                          <ChevronDown className="h-3 w-3 opacity-60" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem
                          onClick={() => setSelectedCity('')}
                          className="cursor-pointer text-sm"
                        >
                          <span className="opacity-60">All Cities</span>
                        </DropdownMenuItem>
                        {cities.map(city => (
                          <DropdownMenuItem
                            key={city}
                            onClick={() => setSelectedCity(city)}
                            className="cursor-pointer text-sm"
                          >
                            {city}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className={`text-xs font-medium mb-1 block ${getTextThemeClasses()}`}>Type</label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={`w-full flex items-center justify-between rounded border px-3 py-2 text-sm ${getCardThemeClasses()} ${getTextThemeClasses()} hover:border-primary`}>
                          <span className={selectedType ? '' : 'opacity-60'}>
                            {selectedType || 'Select type'}
                          </span>
                          <ChevronDown className="h-3 w-3 opacity-60" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        {types.map(type => (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className="cursor-pointer text-sm"
                          >
                            {type || 'All Types'}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Clear Filters */}
                  <div className="pt-2 border-t">
                    <button
                      onClick={() => {
                        setSelectedCity('')
                        setSelectedType('')
                        setSelectedCountry('All')
                        setSelectedCategory('All')
                        setSearchQuery('')
                      }}
                      className={`w-full rounded border px-3 py-2 text-sm transition-colors ${getCardThemeClasses()} ${getTextThemeClasses()} hover:bg-destructive/10 hover:border-destructive hover:text-destructive`}
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="mx-auto max-w-7xl px-4 pb-16">
        {/* Loading State - Skeleton Cards */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <DestinationCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Destinations Grid */}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDestinations.map((destination: any, index: number) => {
              console.log(`Rendering destination ${index}: ${destination.name} with image: ${destination.image}`)
              return (
              <div
                key={destination.id}
                className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${getCardThemeClasses()}`}
              >
                <div className="relative h-48 overflow-hidden">
                  {/* Carousel Images */}
                  <div className="relative h-full">
                    {getDestinationImages(destination).map((image: string, imageIndex: number) => (
                      <img
                        key={imageIndex}
                        src={image}
                        alt={`${destination.name} ${imageIndex + 1}`}
                        className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                          imageIndex === (currentImageIndices[destination.id] || 0) ? 'block' : 'hidden'
                        }`}
                        onError={(e) => {
                          // Fallback to a local image if the original fails to load
                          const target = e.target as HTMLImageElement
                          if (!target.src.includes('images/greece.jpg')) {
                            target.src = '/images/greece.jpg'
                          }
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Carousel Controls */}
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        stopAutoPlay(destination.id)
                        prevImage(destination.id, 3)
                        setTimeout(() => startAutoPlay(destination.id), 5000) // Resume after 5 seconds
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white transition-opacity hover:bg-black/70 opacity-0 group-hover:opacity-100"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Next Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        stopAutoPlay(destination.id)
                        nextImage(destination.id, 3)
                        setTimeout(() => startAutoPlay(destination.id), 5000) // Resume after 5 seconds
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white transition-opacity hover:bg-black/70 opacity-0 group-hover:opacity-100"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {[0, 1, 2].map((index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation()
                            stopAutoPlay(destination.id)
                            setCurrentImageIndices(prev => ({ ...prev, [destination.id]: index }))
                            setTimeout(() => startAutoPlay(destination.id), 5000) // Resume after 5 seconds
                          }}
                          className={`h-1 w-6 rounded-full transition-colors ${
                            index === (currentImageIndices[destination.id] || 0)
                              ? 'bg-white'
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getCardThemeClasses()} backdrop-blur-sm`}>
                      {destination.highlights?.[0] || 'Destination'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation() // Prevent card click
                      toggleSave(destination.id)
                    }}
                    className="absolute top-4 right-4 rounded-full p-2 backdrop-blur-sm transition-colors hover:bg-white/20"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        savedDestinations.includes(destination.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-white'
                      }`}
                    />
                  </button>
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
                  
                  <p className={`mb-3 text-sm ${getTextThemeClasses()} opacity-70 line-clamp-2`}>
                    {destination.description}
                  </p>

                  {/* Highlights */}
                  <div className="mb-4 flex flex-wrap gap-1">
                    {destination.highlights.slice(0, 2).map((highlight: any, index: any) => (
                      <span
                        key={index}
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          theme === "light" 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-blue-900/30 text-blue-300"
                        }`}
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-lg font-bold ${getTextThemeClasses()}`}>
                        {destination.price}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {destination.duration}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation() // Prevent card click
                          openBookingSheet(destination.id, destination.name)
                        }} 
                        className="w-full flex items-center justify-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                      >
                        Book Now
                      </button>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation() // Prevent card click
                          router.push(`/destinations/${destination.id}`)
                        }} 
                        className="w-full flex items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${getTextThemeClasses()} hover:bg-muted"
                      >
                        Explore
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredDestinations.length === 0 && (
          <div className="py-16 text-center">
            <div className={`text-6xl font-bold ${getTextThemeClasses()} opacity-50 mb-4`}>
              No destinations found
            </div>
            <p className={`${getTextThemeClasses()} opacity-70`}>
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && pagination.total_pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={!pagination.has_prev}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pagination.has_prev
                  ? `${getTextThemeClasses()} border hover:bg-muted`
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === pagination.current_page
                      ? 'bg-primary text-primary-foreground'
                      : `${getTextThemeClasses()} hover:bg-muted`
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={!pagination.has_next}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pagination.has_next
                  ? `${getTextThemeClasses()} border hover:bg-muted`
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
      
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
