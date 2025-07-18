

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", category: "general" });

  const notes = [
    {
      id: 1,
      title: "QGIS Buffer Analysis Notes",
      content: "Buffer analysis is used to create zones around geographic features...",
      category: "qgis",
      date: "2024-06-22",
      tags: ["buffer", "analysis", "spatial"]
    },
    {
      id: 2,
      title: "Python Automation Scripts",
      content: "Collection of useful Python scripts for GIS automation...",
      category: "python",
      date: "2024-06-21",
      tags: ["python", "automation", "scripting"]
    },
    {
      id: 3,
      title: "Remote Sensing Principles",
      content: "Key concepts in remote sensing and satellite imagery analysis...",
      category: "remote-sensing",
      date: "2024-06-20",
      tags: ["satellite", "imagery", "analysis"]
    }
  ];

  const categories = [
    { value: "all", label: "All Notes" },
    { value: "qgis", label: "QGIS" },
    { value: "python", label: "Python" },
    { value: "remote-sensing", label: "Remote Sensing" },
    { value: "general", label: "General" }
  ];

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateNote = () => {
    // Here you would typically save to a database
    console.log("Creating note:", newNote);
    setIsCreating(false);
    setNewNote({ title: "", content: "", category: "general" });
  };

  return (
    <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">My Notes</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize and access your GIS learning notes and documentation
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        {/* Create Note Modal */}
        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Note</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newNote.title}
                  onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                  placeholder="Enter note title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={newNote.category}
                  onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  {categories.filter(cat => cat.value !== "all").map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                  placeholder="Write your note content..."
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateNote}>Save Note</Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <Badge variant="secondary">
                    {categories.find(cat => cat.value === note.category)?.label}
                  </Badge>
                </div>
                <CardDescription className="text-sm text-muted-foreground">
                  {note.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm line-clamp-3">{note.content}</p>
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notes found matching your criteria.</p>
          </div>
        )}
    </div>
  );
};

export default Notes;
