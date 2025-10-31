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

    // Get teacher's courses
    const courses = await Course.find({ instructorId: session.user.id })
    const courseIds = courses.map(course => course._id)

    // Get activities for teacher's courses
    const activities = await Activity.find({ 
      courseId: { $in: courseIds }
    }).populate('courseId', 'title code')

    // Get all activity responses for these activities
    const activityIds = activities.map(activity => activity._id)
    const responses = await ActivityResponse.find({
      activityId: { $in: activityIds }
    }).populate('studentId', 'name email')

    // Calculate dashboard metrics
    const totalCourses = courses.length
    const totalActivities = activities.length
    
    // Count unique students across all courses
    const uniqueStudents = new Set()
    courses.forEach(course => {
      if (course.studentIds) {
        course.studentIds.forEach((studentId: any) => uniqueStudents.add(studentId.toString()))
      }
    })
    const totalStudents = uniqueStudents.size

    // Calculate average score
    const averageScore = responses.length > 0 
      ? responses.reduce((sum, response) => sum + (response.score || 0), 0) / responses.length 
      : 0

    // Get recent courses (last 5)
    const recentCourses = courses
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(course => ({
        id: course._id,
        title: course.title,
        code: course.code,
        studentCount: course.studentIds ? course.studentIds.length : 0
      }))

    // Calculate trends (compare with last month)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    const lastMonthActivities = await Activity.find({
      courseId: { $in: courseIds },
      createdAt: { $gte: lastMonth }
    })
    
    const lastMonthResponses = await ActivityResponse.find({
      activityId: { $in: lastMonthActivities.map(a => a._id) }
    })

    const lastMonthAvgScore = lastMonthResponses.length > 0 
      ? lastMonthResponses.reduce((sum, r) => sum + (r.score || 0), 0) / lastMonthResponses.length 
      : 0

    const scoreTrend = averageScore - lastMonthAvgScore
    const activitiesTrend = totalActivities - lastMonthActivities.length

    const dashboardData = {
      stats: {
        totalCourses,
        totalStudents,
        totalActivities,
        averageScore: Math.round(averageScore)
      },
      trends: {
        courses: 0, // New courses this month
        students: 0, // New students this month  
        activities: activitiesTrend,
        score: Math.round(scoreTrend)
      },
      recentCourses
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
