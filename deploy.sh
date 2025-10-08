#!/bin/bash

# Interactive Learning Platform - Deployment Script
# This script helps you deploy the application to Vercel with proper environment variables

echo "🚀 Interactive Learning Platform - Deployment Script"
echo "=================================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Setting up environment variables for Vercel..."

# Set environment variables
echo "Setting MONGODB_URI..."
vercel env add MONGODB_URI production <<< "mongodb+srv://25065865g:root_231228@comp5241.mjsdsjc.mongodb.net/?retryWrites=true&w=majority&appName=COMP5241"

echo "Setting NEXTAUTH_SECRET..."
vercel env add NEXTAUTH_SECRET production <<< "your-production-secret-key-change-this"

echo "Setting NEXTAUTH_URL..."
vercel env add NEXTAUTH_URL production <<< "https://your-app-name.vercel.app"

echo "Setting OPENAI_API_KEY..."
vercel env add OPENAI_API_KEY production <<< "your-openai-api-key-here"

echo "Setting NEXT_PUBLIC_SOCKET_URL..."
vercel env add NEXT_PUBLIC_SOCKET_URL production <<< "https://your-socket-server-url"

echo "Setting NEXT_PUBLIC_URL..."
vercel env add NEXT_PUBLIC_URL production <<< "https://your-app-name.vercel.app"

echo "Setting NODE_ENV..."
vercel env add NODE_ENV production <<< "production"

echo "✅ Environment variables set successfully!"
echo ""
echo "🌐 Now deploying to Vercel..."
vercel --prod

echo ""
echo "🎉 Deployment completed!"
echo "📝 Don't forget to:"
echo "   1. Update NEXTAUTH_URL with your actual Vercel URL"
echo "   2. Update NEXT_PUBLIC_URL with your actual Vercel URL"
echo "   3. Deploy Socket.io server separately (Railway, Heroku, or Vercel Functions)"
echo "   4. Update NEXT_PUBLIC_SOCKET_URL with your Socket.io server URL"
