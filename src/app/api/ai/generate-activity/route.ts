import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateActivityFromContent } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { content, activityType, topic } = await request.json()

    if (!content || !activityType || !topic) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const generatedActivity = await generateActivityFromContent(content, activityType, topic)

    return NextResponse.json(generatedActivity)
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { message: 'Failed to generate activity' },
      { status: 500 }
    )
  }
}
