import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  name: string
  role: 'teacher' | 'student' | 'admin'
  institution: string
  studentId?: string
  avatar?: string
  password?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['teacher', 'student', 'admin'],
    required: true,
    default: 'student'
  },
  institution: {
    type: String,
    required: true,
    default: 'PolyU'
  },
  studentId: {
    type: String,
    sparse: true,
    unique: true,
    index: true
  },
  avatar: {
    type: String
  },
  password: {
    type: String,
    required: function() {
      return this.role !== 'student' // Students don't need passwords for now
    }
  }
}, {
  timestamps: true
})

// Indexes
UserSchema.index({ role: 1 })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
