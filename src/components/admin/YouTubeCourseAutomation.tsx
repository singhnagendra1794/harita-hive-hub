import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { 
  Calendar, 
  Play, 
  Clock, 
  BookOpen, 
  Youtube, 
  Copy, 
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Settings
} from "lucide-react"

interface UpcomingSession {
  id: string
  day_number: number
  topic_title: string
  topic_description: string
  scheduled_date: string
  scheduled_time: string
  status: string
  session_id: string | null
  learning_objectives: string[]
}

interface StreamCredentials {
  rtmp_url: string
  stream_key: string
  youtube_url: string
  broadcast_id: string
}

export function YouTubeCourseAutomation() {
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])
  const [streamCredentials, setStreamCredentials] = useState<StreamCredentials | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  
  const [manualStreamForm, setManualStreamForm] = useState({
    title: '',
    description: '',
    scheduledTime: '',
    thumbnailUrl: ''
  })

  useEffect(() => {
    fetchUpcomingSessions()
  }, [])

  const fetchUpcomingSessions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('youtube-course-automation', {
        body: { action: 'get_next_scheduled' }
      })
      
      if (error) throw error
      
      if (data?.upcoming_sessions) {
        setUpcomingSessions(data.upcoming_sessions)
      }
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error)
      toast.error('Failed to fetch upcoming sessions')
    }
  }

  const createStreamFromDay = async (dayNumber: number) => {
    try {
      setLoading(true)
      setSelectedDay(dayNumber)
      
      const { data: response, error } = await supabase.functions.invoke('youtube-course-automation', {
        body: { 
          action: 'create_from_schedule',
          config: { dayNumber }
        }
      })
      
      if (error) throw error
      
      setStreamCredentials({
        rtmp_url: response.rtmp_url,
        stream_key: response.stream_key,
        youtube_url: response.youtube_url,
        broadcast_id: response.broadcast_id
      })
      
      toast.success(`YouTube Live stream created for Day ${dayNumber}!`)
      await fetchUpcomingSessions()
    } catch (error) {
      console.error('Error creating stream:', error)
      toast.error('Failed to create YouTube stream')
    } finally {
      setLoading(false)
      setSelectedDay(null)
    }
  }

  const createManualStream = async () => {
    if (!manualStreamForm.title || !manualStreamForm.description) {
      toast.error('Please fill in title and description')
      return
    }

    try {
      setLoading(true)
      
      const { data: response, error } = await supabase.functions.invoke('youtube-course-automation', {
        body: { 
          action: 'create_from_schedule',
          config: {
            manualTitle: manualStreamForm.title,
            manualDescription: manualStreamForm.description,
            scheduledTime: manualStreamForm.scheduledTime || new Date(Date.now() + 3600000).toISOString(),
            thumbnailUrl: manualStreamForm.thumbnailUrl
          }
        }
      })
      
      if (error) throw error
      
      setStreamCredentials({
        rtmp_url: response.rtmp_url,
        stream_key: response.stream_key,
        youtube_url: response.youtube_url,
        broadcast_id: response.broadcast_id
      })
      
      toast.success('Manual YouTube Live stream created!')
      setManualStreamForm({ title: '', description: '', scheduledTime: '', thumbnailUrl: '' })
      await fetchUpcomingSessions()
    } catch (error) {
      console.error('Error creating manual stream:', error)
      toast.error('Failed to create manual stream')
    } finally {
      setLoading(false)
    }
  }

  const bulkCreateWeek = async () => {
    try {
      setLoading(true)
      
      const { data: response, error } = await supabase.functions.invoke('youtube-course-automation', {
        body: { action: 'bulk_create_week' }
      })
      
      if (error) throw error
      
      toast.success(`Created ${response.created_sessions} sessions, ${response.failed_sessions} failed`)
      await fetchUpcomingSessions()
    } catch (error) {
      console.error('Error bulk creating:', error)
      toast.error('Failed to bulk create sessions')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const formatDate = (date: string, time: string) => {
    return new Date(`${date}T${time || '05:00:00'}`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">YouTube Course Automation</h2>
          <p className="text-muted-foreground">Auto-create YouTube Live streams for Geospatial Technology Unlocked course</p>
        </div>
        <Button 
          onClick={bulkCreateWeek} 
          disabled={loading}
          variant="outline"
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calendar className="h-4 w-4 mr-2" />}
          Bulk Create Week
        </Button>
      </div>

      {/* OBS Stream Credentials */}
      {streamCredentials && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Settings className="h-5 w-5" />
              OBS Stream Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">RTMP Server URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input value={streamCredentials.rtmp_url} readOnly className="font-mono text-sm" />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(streamCredentials.rtmp_url, 'RTMP URL')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Stream Key</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={streamCredentials.stream_key} 
                      readOnly 
                      className="font-mono text-sm"
                      type="password"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(streamCredentials.stream_key, 'Stream Key')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(streamCredentials.youtube_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on YouTube
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(streamCredentials.youtube_url, 'YouTube URL')}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy YouTube URL
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-green-700 bg-green-100 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <strong>Next Steps:</strong>
              </div>
              <ol className="list-decimal list-inside space-y-1 ml-6">
                <li>Copy the RTMP URL and Stream Key to OBS</li>
                <li>Configure OBS with these settings</li>
                <li>Click "Start Streaming" in OBS when ready</li>
                <li>The stream will automatically go live on YouTube</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Stream Creation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5" />
            Create Manual Stream
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Stream Title</label>
              <Input
                value={manualStreamForm.title}
                onChange={(e) => setManualStreamForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Day 15 – Advanced GIS Analysis"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Scheduled Time</label>
              <Input
                type="datetime-local"
                value={manualStreamForm.scheduledTime}
                onChange={(e) => setManualStreamForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={manualStreamForm.description}
              onChange={(e) => setManualStreamForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the session objectives and content..."
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Custom Thumbnail URL (Optional)</label>
            <Input
              value={manualStreamForm.thumbnailUrl}
              onChange={(e) => setManualStreamForm(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>
          
          <Button onClick={createManualStream} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Create Manual Stream
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Upcoming Course Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming sessions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div 
                  key={session.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">Day {session.day_number}</Badge>
                      {session.session_id ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          YouTube Created
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium">{session.topic_title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {session.topic_description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(session.scheduled_date, session.scheduled_time)}
                      </div>
                      {session.learning_objectives && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {session.learning_objectives.length} objectives
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {session.session_id ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${session.session_id}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Stream
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => createStreamFromDay(session.day_number)}
                        disabled={loading}
                        size="sm"
                      >
                        {loading && selectedDay === session.day_number ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Youtube className="h-4 w-4 mr-2" />
                        )}
                        Create Stream
                      </Button>
                    )}
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