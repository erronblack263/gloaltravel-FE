import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get the token from the request headers
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '') || ''

    console.log('Logout request received with token:', token ? 'exists' : 'none')

    // Call your FastAPI backend logout endpoint
    const backendUrl = 'http://localhost:8000/api/v1/auth/logout'
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    console.log('Backend logout response status:', response.status)

    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch {
        errorData = { error: 'Unknown error from backend' }
      }
      
      console.log('Backend error response:', errorData)
      
      return NextResponse.json(
        { 
          error: errorData.error || 'Logout failed',
          backendStatus: response.status,
          backendResponse: errorData
        },
        { status: response.status || 500 }
      )
    }

    const data = await response.json()
    console.log('Backend logout success response:', data)
    
    return NextResponse.json({
      message: 'Logout successful',
      success: true,
      backendData: data
    }, { status: 200 })
    
  } catch (error) {
    console.error('Logout route error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect to authentication service',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
