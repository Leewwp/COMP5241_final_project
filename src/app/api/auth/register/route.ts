import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, institution, studentId } = await request.json()

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['teacher', 'student', 'admin'].includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role' },
        { status: 400 }
      )
    }

    // Validate student ID for students
    if (role === 'student' && !studentId) {
      return NextResponse.json(
        { message: 'Student ID is required for students' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email },
        ...(studentId ? [{ studentId }] : [])
      ]
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email or student ID' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      institution: institution || 'PolyU',
      ...(studentId && { studentId })
    })

    await user.save()

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
