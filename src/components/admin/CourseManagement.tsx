
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Eye, Upload, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  status: string;
  created_at: string;
  price: number;
  is_free: boolean;
}

export const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: '',
    difficulty_level: 'beginner',
    price: 0,
    is_free: true
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      const { error } = await supabase
        .from('courses')
        .insert([{
          ...newCourse,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course created successfully",
      });

      setIsCreateDialogOpen(false);
      setNewCourse({
        title: '',
        description: '',
        category: '',
        difficulty_level: 'beginner',
        price: 0,
        is_free: true
      });
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
    }
  };

  const updateCourseStatus = async (courseId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ 
          status,
          published_at: status === 'published' ? new Date().toISOString() : null
        })
        .eq('id', courseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Course ${status} successfully`,
      });

      fetchCourses();
    } catch (error) {
      console.error('Error updating course status:', error);
      toast({
        title: "Error",
        description: "Failed to update course status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'coming_soon': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div>Loading courses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-muted-foreground">Create, edit, and manage your courses</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Fill in the course details to get started
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter course description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newCourse.category}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., GIS, Remote Sensing"
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={newCourse.difficulty_level}
                    onValueChange={(value) => setNewCourse(prev => ({ ...prev, difficulty_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_free"
                    checked={newCourse.is_free}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, is_free: e.target.checked }))}
                  />
                  <Label htmlFor="is_free">Free Course</Label>
                </div>
                {!newCourse.is_free && (
                  <div>
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCourse}>
                  Create Course
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {course.title}
                    <Badge className={getStatusColor(course.status)}>
                      {course.status.replace('_', ' ')}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Category: {course.category}</span>
                  <span>Level: {course.difficulty_level}</span>
                  <span>Price: {course.is_free ? 'Free' : `₹${course.price}`}</span>
                </div>
                <div className="flex items-center gap-2">
                  {course.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => updateCourseStatus(course.id, 'published')}
                    >
                      Publish
                    </Button>
                  )}
                  {course.status === 'published' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCourseStatus(course.id, 'draft')}
                    >
                      Unpublish
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateCourseStatus(course.id, 'coming_soon')}
                  >
                    Mark Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first course to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Course
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
