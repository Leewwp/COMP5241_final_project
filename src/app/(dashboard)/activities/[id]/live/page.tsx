'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, Pause, Square, Users, Clock } from 'lucide-react'
import Link from 'next/link'
import { useSocket } from '@/components/socket-provider'
import toast from 'react-hot-toast'

interface Activity {
  _id: string
  title: string
  type: string
  content: any
  settings: any
}

interface Session {
  _id: string
  status: string
  participants: string[]
  results?: any
}

export default function LiveActivityPage() {
  const params = useParams()
  const router = useRouter()
  const { socket } = useSocket()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [participants, setParticipants] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!socket) return

    // Join the activity room
    socket.emit('join-activity', params.id)

    // Listen for activity updates
    socket.on('activity-updated', (data) => {
      setActivity(data)
    })

    socket.on('session-updated', (data) => {
      setSession(data)
    })

    socket.on('participant-count', (count) => {
      setParticipants(count)
    })

    socket.on('error', (error) => {
      toast.error(error.message)
    })

    return () => {
      socket.emit('leave-activity', params.id)
      socket.off('activity-updated')
      socket.off('session-updated')
      socket.off('participant-count')
      socket.off('error')
    }
  }, [socket, params.id])

  useEffect(() => {
    // Fetch activity data
    const fetchActivity = async () => {
      try {
        const response = await fetch(`/api/activities/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setActivity(data)
        }
      } catch (error) {
        toast.error('Failed to load activity')
      } finally {
        setIsLoading(false)
      }
    }

    fetchActivity()
  }, [params.id])

  const startSession = () => {
    if (socket) {
      socket.emit('start-session', params.id)
      toast.success('Session started!')
    }
  }

  const pauseSession = () => {
    if (socket) {
      socket.emit('pause-session', params.id)
      toast.success('Session paused')
    }
  }

  const endSession = () => {
    if (socket) {
      socket.emit('end-session', params.id)
      toast.success('Session ended')
      router.push(`/activities/${params.id}/results`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading activity...</p>
        </div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity not found</h2>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
                <p className="text-gray-600">Live Activity Session</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={session?.status === 'active' ? 'default' : 'secondary'}>
                {session?.status || 'waiting'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Activity Details</CardTitle>
                <CardDescription>
                  {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} Activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activity.content.instructions && (
                    <div>
                      <h4 className="font-medium mb-2">Instructions</h4>
                      <p className="text-gray-600">{activity.content.instructions}</p>
                    </div>
                  )}
                  
                  {activity.content.questions && (
                    <div>
                      <h4 className="font-medium mb-2">Questions ({activity.content.questions.length})</h4>
                      <div className="space-y-2">
                        {activity.content.questions.map((question: any, index: number) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <p className="font-medium">{index + 1}. {question.text}</p>
                            {question.options && (
                              <div className="mt-2 space-y-1">
                                {question.options.map((option: string, optIndex: number) => (
                                  <div key={optIndex} className="text-sm text-gray-600">
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Controls */}
          <div className="space-y-6">
            {/* Session Status */}
            <Card>
              <CardHeader>
                <CardTitle>Session Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Participants</span>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="font-bold">{participants}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={session?.status === 'active' ? 'default' : 'secondary'}>
                      {session?.status || 'waiting'}
                    </Badge>
                  </div>

                  {activity.settings.timeLimit && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Time Limit</span>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{activity.settings.timeLimit} min</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Session Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Session Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {session?.status === 'waiting' && (
                    <Button onClick={startSession} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Session
                    </Button>
                  )}

                  {session?.status === 'active' && (
                    <>
                      <Button onClick={pauseSession} variant="outline" className="w-full">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Session
                      </Button>
                      <Button onClick={endSession} variant="destructive" className="w-full">
                        <Square className="h-4 w-4 mr-2" />
                        End Session
                      </Button>
                    </>
                  )}

                  {session?.status === 'paused' && (
                    <Button onClick={startSession} className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Resume Session
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Live Results Preview */}
            {session?.results && (
              <Card>
                <CardHeader>
                  <CardTitle>Live Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    {Object.keys(session.results).length} responses received
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
