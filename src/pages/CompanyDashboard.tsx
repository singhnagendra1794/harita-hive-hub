import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building, Users, Trophy, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';

interface StudentProfile {
  id: string;
  user_id: string;
  bio?: string;
  skills?: string[];
  availability?: string;
  profiles?: {
    full_name?: string;
  };
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  votes: number;
  submission_link: string;
  description: string;
  profiles?: {
    full_name?: string;
  };
}

const CompanyDashboard = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const skills = [
    'GIS Analysis',
    'Python',
    'QGIS',
    'Remote Sensing',
    'Cartography',
    'Spatial Analysis',
    'Machine Learning'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch student portfolios
      const { data: studentData, error: studentError } = await supabase
        .from('student_portfolios')
        .select(`
          *,
          profiles (
            full_name
          )
        `);

      if (studentError) throw studentError;

      // Fetch leaderboard data
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('challenge_submissions')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('votes', { ascending: false })
        .limit(20);

      if (leaderboardError) throw leaderboardError;

      const studentsWithProfiles = (studentData || []).map(student => ({
        ...student,
        profiles: student.profiles || { full_name: 'Anonymous' }
      }));

      const leaderboardWithProfiles = (leaderboardData || []).map(entry => ({
        ...entry,
        profiles: entry.profiles || { full_name: 'Anonymous' }
      }));

      setStudents(studentsWithProfiles);
      setLeaderboard(leaderboardWithProfiles);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.bio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = selectedSkill === 'all' || 
                        student.skills?.includes(selectedSkill);
    return matchesSearch && matchesSkill;
  });

  const handleInviteStudent = async (studentId: string) => {
    try {
      // In a real implementation, this would send an email or notification
      toast({
        title: "Invitation Sent",
        description: "Interview invitation has been sent to the student.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Company Talent Dashboard
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover top geospatial talent, view student portfolios, and connect with skilled professionals
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">{students.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Active Submissions</p>
                    <p className="text-2xl font-bold">{leaderboard.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Building className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Available for Hire</p>
                    <p className="text-2xl font-bold">
                      {students.filter(s => s.availability === 'available').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="students">Student Profiles</TabsTrigger>
              <TabsTrigger value="leaderboard">Top Performers</TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-6">
              {/* Filters */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search students by name or bio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="w-full md:w-48">
                      <select
                        value={selectedSkill}
                        onChange={(e) => setSelectedSkill(e.target.value)}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="all">All Skills</option>
                        {skills.map(skill => (
                          <option key={skill} value={skill}>{skill}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {student.profiles?.full_name || 'Anonymous Student'}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {student.bio || 'No bio available'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Skills */}
                        <div>
                          <p className="text-sm font-medium mb-2">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {student.skills?.slice(0, 3).map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {student.skills && student.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{student.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Availability:
                          </span>
                          <Badge 
                            variant={student.availability === 'available' ? 'default' : 'secondary'}
                          >
                            {student.availability || 'Not specified'}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <Button 
                          onClick={() => handleInviteStudent(student.id)}
                          className="w-full"
                        >
                          Invite for Interview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No students found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria to find more students.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Challenge Performers</CardTitle>
                  <CardDescription>
                    Students with the highest-voted challenge submissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leaderboard.map((entry, index) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {entry.profiles?.full_name || 'Anonymous'}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {entry.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">
                            {entry.votes} votes
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(entry.submission_link, '_blank')}
                          >
                            View Project
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default CompanyDashboard;