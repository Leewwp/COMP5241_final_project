import mongoose, { Schema, Document } from 'mongoose'

export interface IActivity extends Document {
  courseId: mongoose.Types.ObjectId
  type: 'poll' | 'quiz' | 'wordcloud' | 'shortanswer' | 'minigame'
  title: string
  content: {
    questions?: Array<{
      id: string
      text: string
      type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
      options?: string[]
      correctAnswer?: string | string[]
      points: number
    }>
    options?: string[]
    instructions?: string
    timeLimit?: number
    allowMultiple?: boolean
    wordCloudSettings?: {
      maxWords: number
      minWordLength: number
      excludeCommon: boolean
      colorScheme: string
    }
    gameSettings?: {
      gameType: 'memory' | 'matching' | 'puzzle' | 'trivia'
      difficulty: 'easy' | 'medium' | 'hard'
      timeLimit?: number
      maxPlayers?: number
    }
  }
  settings: {
    isAnonymous: boolean
    showResults: boolean
    allowMultipleAttempts: boolean
    shuffleQuestions: boolean
    timeLimit?: number
    dueDate?: Date
  }
  status: 'draft' | 'active' | 'completed'
  createdAt: Date
  updatedAt: Date
}

const ActivitySchema = new Schema<IActivity>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  type: {
    type: String,
    enum: ['poll', 'quiz', 'wordcloud', 'shortanswer', 'minigame'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    questions: [{
      id: String,
      text: String,
      type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer', 'essay']
      },
      options: [String],
      correctAnswer: Schema.Types.Mixed,
      points: Number
    }],
    options: [String],
    instructions: String,
    timeLimit: Number,
    allowMultiple: Boolean,
    wordCloudSettings: {
      maxWords: Number,
      minWordLength: Number,
      excludeCommon: Boolean,
      colorScheme: String
    },
    gameSettings: {
      gameType: {
        type: String,
        enum: ['memory', 'matching', 'puzzle', 'trivia']
      },
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard']
      },
      timeLimit: Number,
      maxPlayers: Number
    }
  },
  settings: {
    isAnonymous: {
      type: Boolean,
      default: false
    },
    showResults: {
      type: Boolean,
      default: true
    },
    allowMultipleAttempts: {
      type: Boolean,
      default: false
    },
    shuffleQuestions: {
      type: Boolean,
      default: false
    },
    timeLimit: Number,
    dueDate: Date
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed'],
    default: 'draft'
  }
}, {
  timestamps: true
})

// Indexes
ActivitySchema.index({ courseId: 1 })
ActivitySchema.index({ type: 1 })
ActivitySchema.index({ status: 1 })

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema)
