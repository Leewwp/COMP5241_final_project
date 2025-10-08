const { Server } = require('socket.io')
const http = require('http')
const express = require('express')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_PUBLIC_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Store active sessions
const activeSessions = new Map()
const activityRooms = new Map()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join activity room
  socket.on('join-activity', (activityId) => {
    socket.join(`activity-${activityId}`)
    socket.currentActivity = activityId
    
    // Update participant count
    const room = io.sockets.adapter.rooms.get(`activity-${activityId}`)
    const participantCount = room ? room.size : 0
    
    // Store in activity rooms
    if (!activityRooms.has(activityId)) {
      activityRooms.set(activityId, new Set())
    }
    activityRooms.get(activityId).add(socket.id)
    
    // Emit participant count to all in room
    io.to(`activity-${activityId}`).emit('participant-count', participantCount)
    
    console.log(`User ${socket.id} joined activity ${activityId}`)
  })

  // Leave activity room
  socket.on('leave-activity', (activityId) => {
    socket.leave(`activity-${activityId}`)
    
    if (activityRooms.has(activityId)) {
      activityRooms.get(activityId).delete(socket.id)
    }
    
    const room = io.sockets.adapter.rooms.get(`activity-${activityId}`)
    const participantCount = room ? room.size : 0
    io.to(`activity-${activityId}`).emit('participant-count', participantCount)
    
    console.log(`User ${socket.id} left activity ${activityId}`)
  })

  // Start session
  socket.on('start-session', (activityId) => {
    const sessionId = `session-${activityId}-${Date.now()}`
    const session = {
      id: sessionId,
      activityId,
      status: 'active',
      startedAt: new Date(),
      participants: Array.from(activityRooms.get(activityId) || []),
      results: {}
    }
    
    activeSessions.set(activityId, session)
    
    // Notify all participants
    io.to(`activity-${activityId}`).emit('session-started', session)
    io.to(`activity-${activityId}`).emit('session-updated', session)
    
    console.log(`Session started for activity ${activityId}`)
  })

  // Pause session
  socket.on('pause-session', (activityId) => {
    const session = activeSessions.get(activityId)
    if (session) {
      session.status = 'paused'
      activeSessions.set(activityId, session)
      
      io.to(`activity-${activityId}`).emit('session-updated', session)
      console.log(`Session paused for activity ${activityId}`)
    }
  })

  // End session
  socket.on('end-session', (activityId) => {
    const session = activeSessions.get(activityId)
    if (session) {
      session.status = 'completed'
      session.endedAt = new Date()
      activeSessions.set(activityId, session)
      
      io.to(`activity-${activityId}`).emit('session-ended', session)
      io.to(`activity-${activityId}`).emit('session-updated', session)
      
      console.log(`Session ended for activity ${activityId}`)
    }
  })

  // Submit response
  socket.on('submit-response', (data) => {
    const { activityId, response } = data
    const session = activeSessions.get(activityId)
    
    if (session && session.status === 'active') {
      session.results[socket.id] = {
        response,
        submittedAt: new Date()
      }
      
      activeSessions.set(activityId, session)
      
      // Emit updated results to instructor
      io.to(`activity-${activityId}`).emit('response-received', {
        participantId: socket.id,
        response,
        totalResponses: Object.keys(session.results).length
      })
      
      console.log(`Response received for activity ${activityId}`)
    }
  })

  // Get session status
  socket.on('get-session-status', (activityId) => {
    const session = activeSessions.get(activityId)
    if (session) {
      socket.emit('session-updated', session)
    }
  })

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    // Remove from all activity rooms
    for (const [activityId, participants] of activityRooms.entries()) {
      if (participants.has(socket.id)) {
        participants.delete(socket.id)
        const room = io.sockets.adapter.rooms.get(`activity-${activityId}`)
        const participantCount = room ? room.size : 0
        io.to(`activity-${activityId}`).emit('participant-count', participantCount)
      }
    }
  })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})
