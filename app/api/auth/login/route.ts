import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Call your FastAPI backend
    const backendUrl = 'http://localhost:8000/api/v1/auth/login'
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: body.username,
        password: body.password
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error || 'Authentication failed' },
        { status: response.status || 500 }
      )
    }

    const data = await response.json()
    
    console.log('Backend response:', data)
    
    // Use the real token from your FastAPI backend
    return NextResponse.json({
      message: 'Login successful',
      user: data.user || {
        id: 1,
        username: body.username,
        email: `${body.username}@example.com`
      },
      token: data.access_token, // Use the real JWT token from backend
      refresh_token: data.refresh_token, // Also include refresh token
      token_type: data.token_type,
      expires_in: data.expires_in,
      success: true
    }, { status: 200 })
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to authentication service' },
      { status: 500 }
    )
  }
}
