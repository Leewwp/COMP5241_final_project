import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, Brain, BarChart3, Gamepad2, Cloud } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Interactive Learning Platform</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" asChild>
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Your Teaching with
            <span className="text-blue-600"> Interactive Learning</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Empower Hong Kong university lecturers to create, generate, and manage 
            engaging learning activities that boost student participation and learning outcomes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/register">Start Teaching Better</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h3>
            <p className="text-xl text-gray-600">Everything you need to create engaging learning experiences</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Course Management</CardTitle>
                <CardDescription>
                  Create courses and import students with PolyU student IDs for seamless integration
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Gamepad2 className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Interactive Activities</CardTitle>
                <CardDescription>
                  Polls, quizzes, word clouds, mini-games, and short-answer questions for engaging learning
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>AI-Powered Generation</CardTitle>
                <CardDescription>
                  Generate activities from teaching content and analyze student responses with GenAI
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Comprehensive dashboards and reports for instructors and students with leaderboards
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Cloud className="h-12 w-12 text-cyan-600 mb-4" />
                <CardTitle>Real-time Collaboration</CardTitle>
                <CardDescription>
                  Synchronous learning activities that work both in-class and remotely
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Mobile Responsive</CardTitle>
                <CardDescription>
                  Works perfectly on all devices - desktop, tablet, and mobile for maximum accessibility
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Teaching?</h3>
          <p className="text-xl text-blue-100 mb-8">
            Join Hong Kong's leading interactive learning platform
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/register">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">Interactive Learning Platform</span>
            </div>
            <p className="text-gray-400">
              Empowering educators to create engaging learning experiences
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
