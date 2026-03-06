import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the request
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const country = searchParams.get('country') || ''
    const city = searchParams.get('city') || ''
    const type = searchParams.get('type') || ''

    console.log('🏨 Resorts API Request:', { page, limit, search, category, country, city, type })

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    // Build the URL with query parameters for FastAPI backend
    let backendUrl = `http://localhost:8000/api/v1/resorts/?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    
    console.log('🏨 Resorts API - Backend URL:', backendUrl)
    
    // Use category endpoint if a specific category is selected
    if (category && category !== 'All' && category !== '') {
      backendUrl = `http://localhost:8000/api/v1/resorts/category/${encodeURIComponent(category)}/?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
      console.log('🏨 Resorts API - Using category endpoint for:', category)
      console.log('🏨 Resorts API - Backend URL:', backendUrl)
    } else {
      console.log('🏨 Resorts API - Using general resorts endpoint')
      console.log('🏨 Resorts API - Backend URL:', backendUrl)
    }

    // Prepare headers for the backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    }

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    // Make request to FastAPI backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: headers,
    })

    console.log('📊 Backend Response Status:', response.status)
    console.log('📊 Backend Response Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Backend Error Response:', errorText)
      
      // Return error response
      return NextResponse.json(
        { 
          success: false, 
          error: `Backend request failed: ${response.status} ${response.statusText}`,
          details: errorText,
          backendUrl: backendUrl
        },
        { status: response.status }
      )
    }

    // Parse the JSON response from FastAPI
    const data = await response.json()
    console.log('📦 Backend Response Data:', data)
    console.log('📦 Backend Response Type:', typeof data)
    console.log('📦 Backend Response Keys:', Object.keys(data))

    // Transform the data to match frontend expectations
    let resortsArray = []
    
    // Handle different response formats from FastAPI
    if (Array.isArray(data)) {
      // If data is directly an array of resorts
      resortsArray = data
      console.log('🏨 Resorts API - Data is direct array')
    } else if (data.resorts && Array.isArray(data.resorts)) {
      // If data has resorts array
      resortsArray = data.resorts
      console.log('🏨 Resorts API - Data has resorts array')
    } else if (data.results && Array.isArray(data.results)) {
      // If data has results array
      resortsArray = data.results
      console.log('🏨 Resorts API - Data has results array')
    } else if (data && typeof data === 'object') {
      // If data is a single resort object, wrap it in array
      resortsArray = [data]
      console.log('🏨 Resorts API - Single resort object wrapped in array')
    }

    console.log('🏨 Resorts API - Final resorts array length:', resortsArray.length)
    console.log('🏨 Resorts API - Sample resort:', resortsArray[0])

    const transformedData = {
      success: true,
      resorts: resortsArray,
      pagination: data.pagination || {
        current_page: parseInt(page),
        total_pages: 1,
        total_items: resortsArray.length,
        items_per_page: parseInt(limit)
      }
    }

    console.log('✅ Transformed Data:', transformedData)

    // Return the transformed data
    return NextResponse.json(transformedData)

  } catch (error) {
    console.error('❌ Resorts API Error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}
