import mongoose, { Schema, Document } from 'mongoose'

export interface ICourse extends Document {
  title: string
  description: string
  code: string
  instructorId: mongoose.Types.ObjectId
  studentIds: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const CourseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  instructorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
})

// Indexes
CourseSchema.index({ instructorId: 1 })
CourseSchema.index({ studentIds: 1 })

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)
