import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { RefreshCw, Calendar, Play, Square, Edit, Link } from "lucide-react"

interface LiveStream {
  id: string
  title: string
  description: string
  scheduled_start_time: string
  status: string
  youtube_broadcast_id: string
  rtmp_url?: string
  stream_key?: string
  thumbnail_url?: string
}

export function SuperAdminLiveControls() {
  const [activeStream, setActiveStream] = useState<LiveStream | null>(null)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [overrideId, setOverrideId] = useState('')
  
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    scheduled_start_time: '',
  })

  useEffect(() => {
    fetchActiveStream()
  }, [])

  const fetchActiveStream = async () => {
    try {
      const { data: response, error } = await supabase.functions.invoke('youtube-live-manager', {
        body: { action: 'get_active_stream' }
      })
      
      if (error) throw error
      
      if (response?.stream) {
        setActiveStream(response.stream)
        setEditForm({
          title: response.stream.title,
          description: response.stream.description || '',
          scheduled_start_time: new Date(response.stream.scheduled_start_time).toISOString().slice(0, 16),
        })
      }
    } catch (error) {
      console.error('Error fetching active stream:', error)
      toast.error('Failed to fetch stream data')
    }
  }

  const createLiveStream = async () => {
    try {
      setLoading(true)
      
      const { data: response, error } = await supabase.functions.invoke('youtube-live-manager', {
        body: {
          action: 'create_live_stream',
          title: 'Geospatial Technology Unlocked - Live Session',
          description: 'Interactive AI-powered learning session covering geospatial concepts and tools',
          scheduled_start_time: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          privacy_status: 'unlisted'
        }
      })
      
      if (error) throw error
      
      toast.success('Ultra Low Latency stream created successfully!')
      await fetchActiveStream()
    } catch (error) {
      console.error('Error creating stream:', error)
      toast.error('Failed to create live stream')
    } finally {
      setLoading(false)
    }
  }

  const startStream = async () => {
    if (!activeStream) return
    
    try {
      setLoading(true)
      
      const { error } = await supabase.functions.invoke('youtube-live-manager', {
        body: {
          action: 'start_live_stream',
          schedule_id: activeStream.id
        }
      })
      
      if (error) throw error
      
      toast.success('Stream started successfully!')
      await fetchActiveStream()
    } catch (error) {
      console.error('Error starting stream:', error)
      toast.error('Failed to start stream')
    } finally {
      setLoading(false)
    }
  }

  const endStream = async () => {
    if (!activeStream) return
    
    try {
      setLoading(true)
      
      const { error } = await supabase.functions.invoke('youtube-live-manager', {
        body: {
          action: 'end_live_stream',
          schedule_id: activeStream.id
        }
      })
      
      if (error) throw error
      
      toast.success('Stream ended successfully!')
      await fetchActiveStream()
    } catch (error) {
      console.error('Error ending stream:', error)
      toast.error('Failed to end stream')
    } finally {
      setLoading(false)
    }
  }

  const updateStreamDetails = async () => {
    if (!activeStream) return
    
    try {
      setLoading(true)
      
      const { error } = await supabase.functions.invoke('youtube-live-manager', {
        body: {
          action: 'update_stream_details',
          schedule_id: activeStream.id,
          title: editForm.title,
          description: editForm.description,
          scheduled_start_time: new Date(editForm.scheduled_start_time).toISOString()
        }
      })
      
      if (error) throw error
      
      toast.success('Stream details updated successfully!')
      setIsEditing(false)
      await fetchActiveStream()
    } catch (error) {
      console.error('Error updating stream:', error)
      toast.error('Failed to update stream details')
    } finally {
      setLoading(false)
    }
  }

  const overrideStream = async (videoId?: string) => {
    const targetVideoId = videoId || overrideId.trim()
    if (!targetVideoId) {
      toast.error('Please enter a YouTube video ID')
      return
    }
    
    try {
      setLoading(true)
      
      const { error } = await supabase.functions.invoke('youtube-live-manager', {
        body: {
          action: 'override_stream',
          youtube_video_id: targetVideoId
        }
      })
      
      if (error) throw error
      
      toast.success('Stream override successful!')
      setOverrideId('')
      await fetchActiveStream()
    } catch (error) {
      console.error('Error overriding stream:', error)
      toast.error('Failed to override stream')
    } finally {
      setLoading(false)
    }
  }

  // Auto-override with the new video ID
  React.useEffect(() => {
    const autoOverride = async () => {
      await overrideStream('94NaFHNEi9k')
    }
    autoOverride()
  }, [])

  const forceSync = async () => {
    try {
      setLoading(true)
      
      const { error } = await supabase.functions.invoke('youtube-live-manager', {
        body: { action: 'manual_refresh' }
      })
      
      if (error) throw error
      
      toast.success('YouTube sync completed!')
      await fetchActiveStream()
    } catch (error) {
      console.error('Error syncing:', error)
      toast.error('Failed to sync with YouTube')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">YouTube Live Controls</h2>
        <Button 
          onClick={forceSync} 
          disabled={loading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Force Sync
        </Button>
      </div>

      {/* Current Stream Status */}
      {activeStream ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span>{activeStream.title}</span>
                <Badge variant={activeStream.status === 'live' ? 'destructive' : 'secondary'}>
                  {activeStream.status.toUpperCase()}
                </Badge>
              </CardTitle>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Stream Title"
                />
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Stream Description"
                  rows={3}
                />
                <Input
                  type="datetime-local"
                  value={editForm.scheduled_start_time}
                  onChange={(e) => setEditForm(prev => ({ ...prev, scheduled_start_time: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button onClick={updateStreamDetails} disabled={loading}>
                    Save Changes
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{activeStream.description}</p>
                <p className="text-sm">
                  <strong>Scheduled:</strong> {new Date(activeStream.scheduled_start_time).toLocaleString()}
                </p>
                {activeStream.rtmp_url && (
                  <div className="space-y-1">
                    <p className="text-sm"><strong>RTMP URL:</strong> {activeStream.rtmp_url}</p>
                    <p className="text-sm"><strong>Stream Key:</strong> {activeStream.stream_key}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Stream Controls */}
            <div className="flex gap-2">
              {activeStream.status === 'scheduled' && (
                <Button onClick={startStream} disabled={loading}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Stream
                </Button>
              )}
              {activeStream.status === 'live' && (
                <Button onClick={endStream} disabled={loading} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  End Stream
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">No active stream found</p>
            <Button onClick={createLiveStream} disabled={loading}>
              <Calendar className="h-4 w-4 mr-2" />
              Create Ultra Low Latency Stream
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stream Override */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Override</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Override the current stream with a specific YouTube video ID
          </p>
          <div className="flex gap-2">
            <Input
              value={overrideId}
              onChange={(e) => setOverrideId(e.target.value)}
              placeholder="YouTube Video ID (e.g., dQw4w9WgXcQ)"
            />
            <Button onClick={() => overrideStream()} disabled={loading}>
              <Link className="h-4 w-4 mr-2" />
              Override
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}