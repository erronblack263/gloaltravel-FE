import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get country parameter from URL
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    console.log(' API Route - Get destinations by country:', { country, page, limit })

    if (!country) {
      return NextResponse.json(
        { 
          error: 'Country parameter is required',
          message: 'Please provide a country name to filter destinations'
        },
        { status: 400 }
      )
    }

    // Call the FastAPI country endpoint
    const backendUrl = `http://localhost:8000/api/v1/destinations/country/${encodeURIComponent(country)}/?page=${page}&limit=${limit}`
    console.log(' API Route - Backend country URL:', backendUrl)
    
    // Get token from request headers (passed from frontend)
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '') || ''
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    }
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
    })

    console.log(' API Route - Backend country response status:', response.status)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: 'Unknown error from backend' }
      }
      
      console.log(' API Route - Backend country error response:', errorData)
      
      return NextResponse.json(
        { 
          error: errorData.error || 'Failed to fetch destinations by country',
          backendStatus: response.status,
          backendResponse: errorData
        },
        { status: response.status || 500 }
      )
    }

    const data = await response.json()
    console.log(' API Route - Backend country success response:', data)
    
    // Handle different response formats from backend
    let countryDestinations = []
    if (Array.isArray(data)) {
      // Backend returned array directly
      countryDestinations = data
    } else if (data.destinations) {
      // Backend returned with destinations property
      countryDestinations = data.destinations
    } else if (data.results) {
      // Backend returned with results property
      countryDestinations = data.results
    }
    
    console.log(' API Route - Country destinations count:', countryDestinations.length)
    console.log(' API Route - Country destination types:', countryDestinations.map((d: any) => d.type))
    
    // Transform backend data to match frontend expectations
    const transformedDestinations = countryDestinations.map((item: any) => {
      let finalImage = '/images/greece.jpg' // Default fallback
      
      // Try to use the first image from the database if available
      if (item.images && item.images.length > 0 && typeof item.images[0] === 'string') {
        const dbImage = item.images[0]
        // Use the static folder path directly (assuming Next.js serves static folder)
        if (dbImage.startsWith('/static/images/')) {
          finalImage = dbImage // Keep as /static/images/...
        } else {
          finalImage = dbImage
        }
      }
       
      // Add cache-busting parameter to prevent browser caching issues
      const cacheBustedImage = `${finalImage}?v=${item.id}&t=${Date.now()}`
      
      console.log(` API Route - Country destination ${item.name} (${item.city}, ${item.country}): Using static image ${cacheBustedImage}`)
      
      return {
        id: item.id,
        name: item.name,
        location: `${item.city}, ${item.country}`,
        rating: 4.5 + Math.random() * 0.5, // Generate random rating between 4.5-5.0
        price: item.entry_fee === '0.00' ? 'Free' : `$${item.entry_fee}`,
        duration: `${3 + Math.floor(Math.random() * 5)} days`, // Random duration 3-7 days
        image: cacheBustedImage,
        description: `Experience the beauty of ${item.name}, ${item.city}, ${item.country}`,
        highlights: [item.type, `${item.city}`, `${item.country}`],
        saved: false,
        type: item.type,
        city: item.city,
        country: item.country,
        entry_fee: item.entry_fee
      }
    })
    
    // Calculate total pages and validate current page
    const totalPages = Math.ceil((transformedDestinations.length) / limit)
    const validPage = Math.min(Math.max(page, 1), totalPages) // Ensure page is between 1 and totalPages
    
    // Apply pagination on the frontend since backend doesn't paginate
    const startIndex = (validPage - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDestinations = transformedDestinations.slice(startIndex, endIndex)
    
    console.log(' API Route - Final transformed country destinations:', paginatedDestinations.length, 'items')
    console.log(' API Route - Final country destination types:', paginatedDestinations.map((d: any) => d.type))
    
    return NextResponse.json({
      destinations: paginatedDestinations,
      pagination: {
        current_page: validPage,
        total_pages: totalPages,
        total_items: transformedDestinations.length,
        items_per_page: limit,
        has_next: validPage < totalPages,
        has_prev: validPage > 1
      },
      country_filter: country,
      success: true
    }, { status: 200 })
    
  } catch (error) {
    console.error(' API Route - Country destinations route error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect to country service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
