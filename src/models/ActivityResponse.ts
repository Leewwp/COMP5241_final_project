import mongoose, { Schema, Document } from 'mongoose'

export interface IActivityResponse extends Document {
  activityId: mongoose.Types.ObjectId
  studentId: mongoose.Types.ObjectId
  responseData: any
  submittedAt: Date
  score?: number
  feedback?: string
}

const ActivityResponseSchema = new Schema<IActivityResponse>({
  activityId: {
    type: Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  responseData: {
    type: Schema.Types.Mixed,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  score: Number,
  feedback: String
}, {
  timestamps: true
})

// Indexes
ActivityResponseSchema.index({ activityId: 1 })
ActivityResponseSchema.index({ studentId: 1 })
ActivityResponseSchema.index({ activityId: 1, studentId: 1 }, { unique: true })

export default mongoose.models.ActivityResponse || mongoose.model<IActivityResponse>('ActivityResponse', ActivityResponseSchema)
