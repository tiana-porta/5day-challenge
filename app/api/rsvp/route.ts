import { NextRequest, NextResponse } from 'next/server'

// In-memory store (will reset on server restart)
// For production, you'd want to use a database like Vercel KV, Upstash, or similar
let rsvpCount = 0

export const dynamic = 'force-dynamic'

// GET: Get current RSVP count
export async function GET() {
  return NextResponse.json({ count: rsvpCount })
}

// POST: Increment RSVP count
export async function POST(request: NextRequest) {
  rsvpCount += 1
  console.log(`📝 RSVP incremented! New count: ${rsvpCount}`)
  return NextResponse.json({ count: rsvpCount, success: true })
}

