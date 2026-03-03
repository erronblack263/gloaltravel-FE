"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Plane, Hotel, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { AuthCarousel } from "@/components/auth-carousel"
import { useToast } from "@/hooks/use-toast"

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",  // Changed from email to username
    password: "",
    name: "",
  })
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? theme : systemTheme

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSignIn) {
      // Sign in logic - call your FastAPI backend
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password
          }),
        })

        const data = await response.json()
        
        if (data.success) {
          console.log('Login successful:', data)
          // Store token and user data in localStorage
          if (data.token) {
            localStorage.setItem('authToken', data.token)
          }
          if (data.user) {
            localStorage.setItem('currentUser', JSON.stringify(data.user))
          }
          toast({
            title: "Welcome back! 🎉",
            description: "Successfully signed in to your account",
          })
          router.push('/dashboard')
        } else {
          console.error('Login failed:', data.error)
          // Show error message to user
          toast({
            variant: "destructive",
            title: "Oops! Something went wrong",
            description: "Invalid username or password. Please check your credentials and try again.",
          })
        }
      } catch (error) {
        console.error('Login error:', error)
        // Show error message to user
        toast({
          variant: "destructive",
          title: "Connection Error",
          description: "Unable to connect to server. Please try again later.",
        })
      }
    } else {
      // Sign up logic - you might want to create a separate endpoint
      console.log("Sign up submitted:", formData)
      router.push("/dashboard")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Auth Carousel */}
      <div className="hidden w-1/2 lg:block">
        <AuthCarousel />
      </div>

      {/* Right side - Auth form */}
      <div className="flex w-full flex-col justify-center p-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-md">
          {/* Theme indicator */}
          <div className="mb-8 flex items-center justify-center">
            <div className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              <span className="capitalize">{mounted ? currentTheme : "system"}</span>
              <span>•</span>
              <span>{isSignIn ? "Sign In" : "Sign Up"}</span>
            </div>
          </div>

          {/* Header with travel icons */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Plane className="h-6 w-6" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Hotel className="h-6 w-6" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MapPin className="h-6 w-6" />
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">
              {isSignIn ? "Welcome Back" : "Start Your Journey"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignIn
                ? "Sign in to continue exploring amazing destinations"
                : "Join thousands of travelers discovering the world"}
            </p>
          </div>

          {/* Form toggle */}
          <div className="mb-8 flex items-center justify-center">
            <div className="flex rounded-full bg-muted p-1">
              <button
                onClick={() => setIsSignIn(true)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                  isSignIn
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignIn(false)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                  !isSignIn
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isSignIn && (
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={isSignIn ? "" : formData.name}
                    onChange={isSignIn ? undefined : handleInputChange}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required={isSignIn ? false : true}
                    disabled={isSignIn}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-input bg-background pl-10 pr-12 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:scale-[1.02]"
            >
              {isSignIn ? "Sign In to Explore" : "Start Your Journey"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="mx-4 text-xs text-muted-foreground">OR</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Social login options */}
          <div className="space-y-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Additional links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isSignIn ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsSignIn(!isSignIn)}
                className="ml-1 font-medium text-primary hover:underline"
              >
                {isSignIn ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          {/* Back to home */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to explore destinations
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
