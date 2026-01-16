import { NextRequest, NextResponse } from 'next/server'

// In-memory store (will reset on server restart)
// For production, you'd want to use a database like Vercel KV, Upstash, or similar
let rsvpCount = 38

export const dynamic = 'force-dynamic'

// GET: Get current RSVP count
export async function GET(request: NextRequest) {
  console.log(`📊 GET /api/rsvp - Current count: ${rsvpCount}`)
  return NextResponse.json({ count: rsvpCount })
}

// POST: Increment RSVP count
export async function POST(request: NextRequest) {
  const previousCount = rsvpCount
  rsvpCount += 1
  console.log(`📝 POST /api/rsvp - RSVP incremented! Previous: ${previousCount}, New: ${rsvpCount}`)
  console.log(`✅ RSVP count updated successfully. Total RSVPs: ${rsvpCount}`)
  return NextResponse.json({ count: rsvpCount, success: true })
}

