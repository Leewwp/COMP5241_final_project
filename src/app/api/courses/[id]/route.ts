import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Course from '@/models/Course'
import Activity from '@/models/Activity'
import ActivityResponse from '@/models/ActivityResponse'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    // Find the course
    const course = await Course.findById(params.id)
      .populate('instructorId', 'name email')
      .populate('studentIds', 'name email studentId')

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this course
    const isInstructor = session.user.role === 'teacher' && course.instructorId._id.toString() === session.user.id
    const isStudent = session.user.role === 'student' && course.studentIds.some(
      (student: any) => student._id.toString() === session.user.id
    )

    if (!isInstructor && !isStudent) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    // Get activities for this course
    const activities = await Activity.find({ courseId: params.id })
      .sort({ createdAt: -1 })

    // Get participant counts for each activity
    const activitiesWithParticipants = await Promise.all(
      activities.map(async (activity) => {
        const participantCount = await ActivityResponse.countDocuments({
          activityId: activity._id
        })
        
        return {
          _id: activity._id,
          title: activity.title,
          type: activity.type,
          status: activity.status,
          createdAt: activity.createdAt,
          participants: participantCount
        }
      })
    )

    const courseDetail = {
      _id: course._id,
      title: course.title,
      description: course.description,
      code: course.code,
      instructorId: course.instructorId._id,
      instructor: course.instructorId,
      studentIds: course.studentIds.map((student: any) => student._id),
      students: course.studentIds,
      activities: activitiesWithParticipants,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    }

    return NextResponse.json(courseDetail)
  } catch (error) {
    console.error('Course detail fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const course = await Course.findById(params.id)
    
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if user is the instructor
    if (course.instructorId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    const { title, description, code } = await request.json()

    const updatedCourse = await Course.findByIdAndUpdate(
      params.id,
      { title, description, code },
      { new: true, runValidators: true }
    )
      .populate('instructorId', 'name email')
      .populate('studentIds', 'name email studentId')

    if (!updatedCourse) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      )
    }

    // Get activities for this course
    const activities = await Activity.find({ courseId: params.id })
      .sort({ createdAt: -1 })

    // Get participant counts for each activity
    const activitiesWithParticipants = await Promise.all(
      activities.map(async (activity) => {
        const participantCount = await ActivityResponse.countDocuments({
          activityId: activity._id
        })
        
        return {
          _id: activity._id,
          title: activity.title,
          type: activity.type,
          status: activity.status,
          createdAt: activity.createdAt,
          participants: participantCount
        }
      })
    )

    const courseDetail = {
      _id: updatedCourse._id,
      title: updatedCourse.title,
      description: updatedCourse.description,
      code: updatedCourse.code,
      instructorId: updatedCourse.instructorId._id,
      instructor: updatedCourse.instructorId,
      studentIds: updatedCourse.studentIds.map((student: any) => student._id),
      students: updatedCourse.studentIds,
      activities: activitiesWithParticipants,
      createdAt: updatedCourse.createdAt,
      updatedAt: updatedCourse.updatedAt
    }

    return NextResponse.json(courseDetail)
  } catch (error) {
    console.error('Course update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'teacher') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    const course = await Course.findById(params.id)
    
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      )
    }

    // Check if user is the instructor
    if (course.instructorId.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete all activities for this course
    await Activity.deleteMany({ courseId: params.id })
    
    // Delete the course
    await Course.findByIdAndDelete(params.id)

    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    console.error('Course deletion error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
