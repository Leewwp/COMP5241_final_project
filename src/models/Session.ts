import mongoose, { Schema, Document } from 'mongoose'

export interface ISession extends Document {
  courseId: mongoose.Types.ObjectId
  activityId: mongoose.Types.ObjectId
  status: 'waiting' | 'active' | 'paused' | 'completed'
  startedAt: Date
  endedAt?: Date
  participants: mongoose.Types.ObjectId[]
  results?: any
}

const SessionSchema = new Schema<ISession>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  activityId: {
    type: Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'paused', 'completed'],
    default: 'waiting'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  results: Schema.Types.Mixed
}, {
  timestamps: true
})

// Indexes
SessionSchema.index({ courseId: 1 })
SessionSchema.index({ activityId: 1 })
SessionSchema.index({ status: 1 })

export default mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema)
