import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Activity from '@/models/Activity'
import ActivityResponse from '@/models/ActivityResponse'
import Course from '@/models/Course'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7d'
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Get teacher's courses
    const courses = await Course.find({ instructorId: session.user.id })
    const courseIds = courses.map(course => course._id)

    // Get activities for teacher's courses
    const activities = await Activity.find({ 
      courseId: { $in: courseIds },
      createdAt: { $gte: startDate }
    }).populate('courseId', 'title code')

    // Get all activity responses for these activities
    const activityIds = activities.map(activity => activity._id)
    const responses = await ActivityResponse.find({
      activityId: { $in: activityIds }
    }).populate('studentId', 'name email')

    // Calculate key metrics
    const totalActivities = activities.length
    const totalResponses = responses.length
    const averageScore = responses.length > 0 
      ? responses.reduce((sum, response) => sum + (response.score || 0), 0) / responses.length 
      : 0

    // Calculate participation rate
    const totalStudents = await User.countDocuments({ role: 'student' })
    const uniqueParticipants = new Set(responses.map(r => r.studentId._id.toString())).size
    const participationRate = totalStudents > 0 ? (uniqueParticipants / totalStudents) * 100 : 0

    // Activity performance data
    const activityPerformance = activities.map(activity => {
      const activityResponses = responses.filter(r => r.activityId.toString() === activity._id.toString())
      const avgScore = activityResponses.length > 0
        ? activityResponses.reduce((sum, r) => sum + (r.score || 0), 0) / activityResponses.length
        : 0
      
      return {
        name: activity.title,
        responses: activityResponses.length,
        avgScore: Math.round(avgScore)
      }
    })

    // Activity types distribution
    const activityTypes = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const activityTypesData = Object.entries(activityTypes).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: getActivityTypeColor(type)
    }))

    // Weekly participation trend (last 7 days)
    const weeklyParticipation = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.setHours(0, 0, 0, 0))
      const dayEnd = new Date(date.setHours(23, 59, 59, 999))
      
      const dayResponses = responses.filter(r => {
        const responseDate = new Date(r.submittedAt)
        return responseDate >= dayStart && responseDate <= dayEnd
      })
      
      const uniqueDayParticipants = new Set(dayResponses.map(r => r.studentId._id.toString())).size
      const dayParticipationRate = totalStudents > 0 ? (uniqueDayParticipants / totalStudents) * 100 : 0
      
      weeklyParticipation.push({
        name: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        participation: Math.round(dayParticipationRate)
      })
    }

    // Top performing students
    const studentPerformance = responses.reduce((acc, response) => {
      const studentId = response.studentId._id.toString()
      if (!acc[studentId]) {
        acc[studentId] = {
          name: response.studentId.name,
          totalScore: 0,
          activityCount: 0
        }
      }
      acc[studentId].totalScore += response.score || 0
      acc[studentId].activityCount += 1
      return acc
    }, {} as Record<string, { name: string; totalScore: number; activityCount: number }>)

    const topPerformers = Object.values(studentPerformance)
      .map(student => ({
        name: student.name,
        score: Math.round(student.totalScore / student.activityCount),
        activities: student.activityCount
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    // Calculate trends (compare with previous period)
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - (now.getDate() - startDate.getDate()))
    
    const previousActivities = await Activity.find({
      courseId: { $in: courseIds },
      createdAt: { $gte: previousStartDate, $lt: startDate }
    })
    
    const previousResponses = await ActivityResponse.find({
      activityId: { $in: previousActivities.map(a => a._id) }
    })

    const activitiesTrend = totalActivities - previousActivities.length
    const responsesTrend = totalResponses - previousResponses.length
    const scoreTrend = averageScore - (previousResponses.length > 0 
      ? previousResponses.reduce((sum, r) => sum + (r.score || 0), 0) / previousResponses.length 
      : 0)

    const analytics = {
      totalActivities,
      totalResponses,
      averageScore: Math.round(averageScore),
      participationRate: Math.round(participationRate),
      topPerformers,
      activityPerformance,
      activityTypes: activityTypesData,
      weeklyParticipation,
      trends: {
        activities: activitiesTrend,
        responses: responsesTrend,
        score: Math.round(scoreTrend)
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getActivityTypeColor(type: string): string {
  const colors = {
    poll: '#0088FE',
    quiz: '#00C49F',
    wordcloud: '#FFBB28',
    shortanswer: '#FF8042',
    minigame: '#8884D8'
  }
  return colors[type as keyof typeof colors] || '#8884D8'
}
