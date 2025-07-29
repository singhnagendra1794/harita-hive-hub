import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { RefreshCw, Calendar, Play, Square, Edit, Link, Youtube, Settings, Clock, CheckCircle } from "lucide-react"

interface LiveStream {
  id: string
  title: string
  description: string
  starts_at?: string
  scheduled_start_time?: string
  status: string
  youtube_id?: string
  youtube_broadcast_id?: string
  youtube_url?: string
  embed_url?: string
  rtmp_url?: string
  stream_key?: string
  thumbnail_url?: string
  course_day?: number
  instructor?: string
  access_tier?: string
}

export function SuperAdminLiveControls() {
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(false)
  const [manualTitle, setManualTitle] = useState('')
  const [manualDescription, setManualDescription] = useState('')
  const [manualYouTubeUrl, setManualYouTubeUrl] = useState('')

  useEffect(() => {
    fetchActiveStreams()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActiveStreams, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchActiveStreams = async () => {
    try {
      const { data: liveStreams, error } = await supabase
        .from('live_classes')
        .select('*')
        .in('status', ['scheduled', 'live'])
        .order('starts_at', { ascending: true })
        .limit(10)

      if (error) throw error
      setStreams(liveStreams || [])
    } catch (error) {
      console.error('Error fetching streams:', error)
      toast.error('Failed to fetch stream data')
    }
  }

  const createStreamFromSchedule = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('youtube-course-automation', {
        body: {
          action: 'create_from_schedule'
        }
      })

      if (error) throw error

      toast.success('Stream created from schedule: ' + data.title)
      fetchActiveStreams()
    } catch (error: any) {
      toast.error('Error creating stream: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const bulkCreateWeekSessions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('youtube-course-automation', {
        body: {
          action: 'bulk_create_week'
        }
      })

      if (error) throw error

      toast.success(`Bulk creation complete: ${data.created_sessions} created, ${data.failed_sessions} failed`)
      fetchActiveStreams()
    } catch (error: any) {
      toast.error('Error in bulk creation: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const manualCreateStream = async () => {
    if (!manualTitle || !manualDescription) {
      toast.error('Please provide both title and description')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('youtube-course-automation', {
        body: {
          action: 'create_from_schedule',
          config: {
            manualTitle,
            manualDescription,
            scheduledTime: new Date(Date.now() + 60000).toISOString() // Start in 1 minute
          }
        }
      })

      if (error) throw error

      toast.success('Manual stream created: ' + manualTitle)
      setManualTitle('')
      setManualDescription('')
      fetchActiveStreams()
    } catch (error: any) {
      toast.error('Error creating manual stream: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const linkExistingYouTubeStream = async () => {
    if (!manualYouTubeUrl) {
      toast.error('Please provide a YouTube URL')
      return
    }

    setLoading(true)
    try {
      // Extract video ID from YouTube URL
      const videoId = manualYouTubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL')
      }

      const { error } = await supabase
        .from('live_classes')
        .insert({
          title: `Manual Stream - ${new Date().toLocaleDateString()}`,
          description: 'Manually linked YouTube stream',
          youtube_url: manualYouTubeUrl,
          starts_at: new Date().toISOString(),
          status: 'live',
          access_tier: 'professional',
          instructor: 'Admin',
          created_by: (await supabase.auth.getUser()).data.user?.id,
          stream_key: 'manual-link'
        })

      if (error) throw error

      toast.success('YouTube stream linked successfully')
      setManualYouTubeUrl('')
      fetchActiveStreams()
    } catch (error: any) {
      toast.error('Error linking stream: ' + error.message)
    } finally {
      setLoading(false)
    }
  }


  const forceSync = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.functions.invoke('youtube-auto-sync')
      
      if (error) throw error

      toast.success('YouTube data synced successfully')
      fetchActiveStreams()
    } catch (error: any) {
      toast.error('Sync error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500'
      case 'scheduled': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            YouTube Live Stream Controls
          </CardTitle>
          <CardDescription>
            Automated OBS integration with course scheduling and GEOVA AI mentor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={createStreamFromSchedule} disabled={loading}>
              <Calendar className="h-4 w-4 mr-2" />
              Create Next Scheduled Stream
            </Button>
            <Button onClick={bulkCreateWeekSessions} disabled={loading} variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              Create Week Sessions
            </Button>
            <Button onClick={forceSync} disabled={loading} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Sync
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Stream Creation */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Stream Creation</CardTitle>
          <CardDescription>
            Create a custom YouTube live stream
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Stream Title"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
          />
          <Textarea
            placeholder="Stream Description"
            value={manualDescription}
            onChange={(e) => setManualDescription(e.target.value)}
            rows={3}
          />
          <Button onClick={manualCreateStream} disabled={loading}>
            <Play className="h-4 w-4 mr-2" />
            Create Manual Stream
          </Button>
        </CardContent>
      </Card>

      {/* Link Existing YouTube Stream */}
      <Card>
        <CardHeader>
          <CardTitle>Link Existing YouTube Stream</CardTitle>
          <CardDescription>
            Add an existing YouTube live stream to HaritaHive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
            value={manualYouTubeUrl}
            onChange={(e) => setManualYouTubeUrl(e.target.value)}
          />
          <Button onClick={linkExistingYouTubeStream} disabled={loading}>
            <Youtube className="h-4 w-4 mr-2" />
            Link YouTube Stream
          </Button>
        </CardContent>
      </Card>

      {/* Active Streams */}
      <Card>
        <CardHeader>
          <CardTitle>Active Live Streams</CardTitle>
          <CardDescription>
            Current and upcoming YouTube live streams
          </CardDescription>
        </CardHeader>
        <CardContent>
          {streams.length === 0 ? (
            <p className="text-muted-foreground">No active streams found</p>
          ) : (
            <div className="space-y-4">
              {streams.map((stream) => (
                <div key={stream.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{stream.title}</h3>
                        <Badge className={getStatusColor(stream.status)}>
                          {stream.status}
                        </Badge>
                        {stream.course_day && (
                          <Badge variant="outline">Day {stream.course_day}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {stream.description?.substring(0, 100)}...
                      </p>
                      <div className="text-xs text-muted-foreground">
                        <p>Scheduled: {new Date(stream.starts_at || stream.scheduled_start_time || '').toLocaleString()}</p>
                        {stream.youtube_url && (
                          <p>YouTube: <a href={stream.youtube_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Stream</a></p>
                        )}
                        {stream.access_tier && (
                          <p>Access: {stream.access_tier}</p>
                        )}
                        {stream.instructor && (
                          <p>Instructor: {stream.instructor}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}