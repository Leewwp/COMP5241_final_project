export interface User {
  _id: string
  email: string
  name: string
  role: 'teacher' | 'student' | 'admin'
  institution: string
  studentId?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Course {
  _id: string
  title: string
  description: string
  instructorId: string
  instructor: User
  students: User[]
  activities: Activity[]
  createdAt: Date
  updatedAt: Date
}

export interface Activity {
  _id: string
  courseId: string
  type: 'poll' | 'quiz' | 'wordcloud' | 'shortanswer' | 'minigame'
  title: string
  content: ActivityContent
  settings: ActivitySettings
  status: 'draft' | 'active' | 'completed'
  createdAt: Date
  updatedAt: Date
}

export interface ActivityContent {
  questions?: Question[]
  options?: string[]
  instructions?: string
  timeLimit?: number
  allowMultiple?: boolean
  wordCloudSettings?: WordCloudSettings
  gameSettings?: GameSettings
}

export interface Question {
  id: string
  text: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay'
  options?: string[]
  correctAnswer?: string | string[]
  points: number
}

export interface ActivitySettings {
  isAnonymous: boolean
  showResults: boolean
  allowMultipleAttempts: boolean
  shuffleQuestions: boolean
  timeLimit?: number
  dueDate?: Date
}

export interface WordCloudSettings {
  maxWords: number
  minWordLength: number
  excludeCommon: boolean
  colorScheme: string
}

export interface GameSettings {
  gameType: 'memory' | 'matching' | 'puzzle' | 'trivia'
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit?: number
  maxPlayers?: number
}

export interface ActivityResponse {
  _id: string
  activityId: string
  studentId: string
  student: User
  responseData: any
  submittedAt: Date
  score?: number
  feedback?: string
}

export interface Session {
  _id: string
  courseId: string
  activityId: string
  status: 'waiting' | 'active' | 'paused' | 'completed'
  startedAt: Date
  endedAt?: Date
  participants: string[]
  results?: any
}

export interface Analytics {
  totalActivities: number
  totalResponses: number
  averageScore: number
  participationRate: number
  topPerformers: User[]
  activityBreakdown: ActivityAnalytics[]
}

export interface ActivityAnalytics {
  activityId: string
  activityTitle: string
  totalResponses: number
  averageScore: number
  participationRate: number
  commonAnswers?: string[]
  wordCloudData?: { word: string; count: number }[]
}

export interface LeaderboardEntry {
  user: User
  score: number
  rank: number
  activitiesCompleted: number
  streak: number
}

export interface DashboardData {
  user: User
  courses: Course[]
  recentActivities: Activity[]
  analytics: Analytics
  leaderboard: LeaderboardEntry[]
  notifications: Notification[]
}

export interface Notification {
  _id: string
  userId: string
  type: 'activity_created' | 'activity_completed' | 'grade_received' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  actionUrl?: string
}
