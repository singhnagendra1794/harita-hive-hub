import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLMSData, BatchLiveSession, BatchRecording, BatchStudyMaterial } from '@/hooks/useLMSData';
import { 
  Radio, 
  Play, 
  FileText, 
  Calendar, 
  Clock, 
  Video, 
  Download,
  ExternalLink,
  Lock,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface StudentBatchDashboardProps {
  batchId: string;
  batchName: string;
  courseTitle: string;
  hasAccess: boolean;
}

const StudentBatchDashboard = ({ 
  batchId, 
  batchName, 
  courseTitle, 
  hasAccess 
}: StudentBatchDashboardProps) => {
  const { 
    fetchBatchLiveSessions, 
    fetchBatchRecordings, 
    fetchBatchMaterials 
  } = useLMSData();

  const [liveSessions, setLiveSessions] = useState<BatchLiveSession[]>([]);
  const [recordings, setRecordings] = useState<BatchRecording[]>([]);
  const [materials, setMaterials] = useState<BatchStudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    const loadBatchContent = async () => {
      if (!hasAccess) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [sessions, recs, mats] = await Promise.all([
          fetchBatchLiveSessions(batchId),
          fetchBatchRecordings(batchId),
          fetchBatchMaterials(batchId)
        ]);

        setLiveSessions(sessions);
        setRecordings(recs);
        setMaterials(mats);
      } catch (error) {
        console.error('Error loading batch content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBatchContent();
  }, [batchId, hasAccess]);

  if (!hasAccess) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-8 text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
          <p className="text-muted-foreground mb-4">
            Complete payment to access live sessions, recordings, and study materials for this batch.
          </p>
          <Button>Complete Payment</Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading batch content...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {batchName}
            </CardTitle>
            <CardDescription>{courseTitle}</CardDescription>
          </div>
          <Badge variant="default">Active Access</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              Live Sessions ({liveSessions.filter(s => s.status === 'scheduled' || s.status === 'live').length})
            </TabsTrigger>
            <TabsTrigger value="recordings" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Recordings ({recordings.length})
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Materials ({materials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-6">
            {liveSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No upcoming live sessions scheduled.
              </div>
            ) : (
              <div className="space-y-4">
                {liveSessions.map((session) => (
                  <Card key={session.id} className="border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {session.status === 'live' && (
                              <Badge variant="destructive" className="animate-pulse">
                                🔴 LIVE
                              </Badge>
                            )}
                            <h4 className="font-semibold">{session.title}</h4>
                          </div>
                          {session.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {session.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(session.scheduled_at), 'PPP')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(new Date(session.scheduled_at), 'p')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Video className="h-4 w-4" />
                              {session.duration_minutes} min
                            </span>
                          </div>
                        </div>
                        {session.meeting_link && (
                          <Button 
                            asChild 
                            variant={session.status === 'live' ? 'default' : 'outline'}
                          >
                            <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              {session.status === 'live' ? 'Join Now' : 'Open Link'}
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recordings" className="mt-6">
            {recordings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recordings available yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recordings.map((recording) => (
                  <Card key={recording.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      {recording.thumbnail_url && (
                        <div className="relative mb-3">
                          <img 
                            src={recording.thumbnail_url} 
                            alt={recording.title}
                            className="w-full h-32 object-cover rounded-md"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="h-12 w-12 text-white" />
                          </div>
                        </div>
                      )}
                      <h4 className="font-semibold mb-1">{recording.title}</h4>
                      {recording.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {recording.description}
                        </p>
                      )}
                      {recording.duration_seconds && (
                        <span className="text-xs text-muted-foreground">
                          Duration: {Math.floor(recording.duration_seconds / 60)} min
                        </span>
                      )}
                      <Button className="w-full mt-3" variant="outline" asChild>
                        <a href={recording.video_url} target="_blank" rel="noopener noreferrer">
                          <Play className="h-4 w-4 mr-2" />
                          Watch Recording
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="materials" className="mt-6">
            {materials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No study materials uploaded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {materials.map((material) => (
                  <Card key={material.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{material.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">
                                {material.category}
                              </Badge>
                              {material.file_type && (
                                <span className="uppercase">{material.file_type}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default StudentBatchDashboard;
