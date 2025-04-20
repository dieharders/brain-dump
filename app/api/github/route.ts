import { getLatestRelease } from '@/app/server-actions'
import { NextResponse } from 'next/server'

const getAllowedOrigin = (origin: string) => {
  const parsedOrigins = origin?.split(':')
  const parsedOrigin = `${parsedOrigins?.[0]}:${parsedOrigins?.[1]}`
  const allowedOrigins = ['http://localhost', 'http://127.0.0.1']
  return parsedOrigin && allowedOrigins.includes(parsedOrigin) ? origin : ''
}

export async function GET(request: Request) {
  const githubToken = process.env.GITHUB_TOKEN

  if (!githubToken) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 })
  }

  const result = await getLatestRelease(githubToken)
  const origin = request.headers.get('origin') || ''
  const allowedOrigin = getAllowedOrigin(origin)

  return NextResponse.json(result, {
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin') || ''
  const allowedOrigin = getAllowedOrigin(origin)

  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    },
  )
}
