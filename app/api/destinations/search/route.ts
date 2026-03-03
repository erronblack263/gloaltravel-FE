import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get search parameters from URL
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name') || ''
    
    console.log(' API Route - Search destinations by name:', { name })

    if (!name) {
      return NextResponse.json(
        { 
          error: 'Name parameter is required',
          message: 'Please provide a destination name to search'
        },
        { status: 400 }
      )
    }

    // Call the FastAPI search endpoint
    const backendUrl = `http://localhost:8000/api/v1/destinations/search?name=${encodeURIComponent(name)}`
    console.log(' API Route - Backend search URL:', backendUrl)
    
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

    console.log(' API Route - Backend search response status:', response.status)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: 'Unknown error from backend' }
      }
      
      console.log(' API Route - Backend search error response:', errorData)
      
      return NextResponse.json(
        { 
          error: errorData.error || 'Failed to search destinations',
          backendStatus: response.status,
          backendResponse: errorData
        },
        { status: response.status || 500 }
      )
    }

    const data = await response.json()
    console.log(' API Route - Backend search success response:', data)
    
    // Handle different response formats from backend
    let searchResults = []
    if (Array.isArray(data)) {
      // Backend returned array directly
      searchResults = data
    } else if (data.destinations) {
      // Backend returned with destinations property
      searchResults = data.destinations
    } else if (data.results) {
      // Backend returned with results property
      searchResults = data.results
    }
    
    console.log(' API Route - Search results count:', searchResults.length)
    
    // Transform backend data to match frontend expectations
    const transformedResults = searchResults.map((item: any) => {
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
      
      console.log(` API Route - Search result ${item.name} (${item.city}, ${item.country}): Using static image ${cacheBustedImage}`)
      
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
    
    console.log(' API Route - Final transformed search results:', transformedResults.length, 'items')
    
    return NextResponse.json({
      destinations: transformedResults,
      search_query: name,
      total_results: transformedResults.length,
      success: true
    }, { status: 200 })
    
  } catch (error) {
    console.error(' API Route - Search destinations route error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect to search service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
