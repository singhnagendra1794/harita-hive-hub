import React, { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Calendar, Lock, Users, BookOpen } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

interface LiveClass {
  id: string
  title: string
  description: string
  starts_at: string
  ends_at?: string
  is_live: boolean
  youtube_url?: string
  embed_url?: string
  thumbnail_url?: string
  instructor: string
  access_tier: string
  course_name?: string
  course_day?: number
  viewer_count?: number
}

interface LiveClassCardProps {
  liveClass: LiveClass
  onJoin?: () => void
}

export function LiveClassCard({ liveClass, onJoin }: LiveClassCardProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [timeUntilStart, setTimeUntilStart] = useState<string>('')

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const startTime = new Date(liveClass.starts_at)
      const diff = startTime.getTime() - now.getTime()

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 0) {
          setTimeUntilStart(`${days}d ${hours}h ${minutes}m`)
        } else if (hours > 0) {
          setTimeUntilStart(`${hours}h ${minutes}m`)
        } else {
          setTimeUntilStart(`${minutes}m`)
        }
      } else {
        setTimeUntilStart('')
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [liveClass.starts_at])

  const isLive = () => {
    const now = new Date()
    const startTime = new Date(liveClass.starts_at)
    const endTime = liveClass.ends_at ? new Date(liveClass.ends_at) : new Date(startTime.getTime() + 2 * 60 * 60 * 1000) // Default 2 hours
    return now >= startTime && now <= endTime && liveClass.is_live
  }

  const isUpcoming = () => {
    const now = new Date()
    const startTime = new Date(liveClass.starts_at)
    return now < startTime
  }

  const hasAccess = () => {
    // For now, assuming professional tier access
    // This should be connected to actual user subscription check
    return user && liveClass.access_tier === 'professional'
  }

  const handleJoinClass = () => {
    if (!user) {
      toast.error('Please sign in to join the class')
      navigate('/auth')
      return
    }

    if (!hasAccess()) {
      toast.error('This class requires a Professional Plan subscription')
      return
    }

    if (isLive()) {
      navigate(`/live-class/${liveClass.id}`)
    } else {
      toast.info('Class is not live yet')
    }

    onJoin?.()
  }

  const getStatusBadge = () => {
    if (isLive()) {
      return (
        <Badge variant="destructive" className="animate-pulse">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
          LIVE NOW
        </Badge>
      )
    } else if (isUpcoming()) {
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Starts in {timeUntilStart}
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline">
          <Calendar className="w-3 h-3 mr-1" />
          Scheduled
        </Badge>
      )
    }
  }

  const getButtonText = () => {
    if (isLive()) {
      return 'Join Live Class'
    } else if (isUpcoming()) {
      return 'Set Reminder'
    } else {
      return 'View Details'
    }
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          {liveClass.thumbnail_url ? (
            <img
              src={liveClass.thumbnail_url}
              alt={liveClass.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-primary/40" />
            </div>
          )}
          
          {/* Live indicator overlay */}
          {isLive() && (
            <div className="absolute top-4 left-4">
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            </div>
          )}

          {/* Access tier indicator */}
          {liveClass.access_tier === 'professional' && (
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Lock className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              {getStatusBadge()}
              {liveClass.viewer_count && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  {liveClass.viewer_count}
                </div>
              )}
            </div>
            
            {liveClass.course_name && liveClass.course_day && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>{liveClass.course_name} - Day {liveClass.course_day}</span>
              </div>
            )}
          </div>

          {/* Title and Description */}
          <div>
            <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
              {liveClass.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-3 mt-2">
              {liveClass.description}
            </p>
          </div>

          {/* Class Details */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDateTime(liveClass.starts_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Instructor: {liveClass.instructor}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleJoinClass}
            className="w-full"
            variant={isLive() ? "default" : "outline"}
          >
            {isLive() && <Play className="w-4 h-4 mr-2" />}
            {getButtonText()}
          </Button>

          {/* Access notice */}
          {!hasAccess() && liveClass.access_tier === 'professional' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-yellow-800">
                <Lock className="w-4 h-4" />
                <span>Professional Plan required to access this class</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}