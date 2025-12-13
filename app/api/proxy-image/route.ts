import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get('url')
  
  if (!imageUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 })
  }
  
  try {
    // Fetch the image from the original URL
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status })
    }
    
    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return new NextResponse('Proxy error', { status: 500 })
  }
}
