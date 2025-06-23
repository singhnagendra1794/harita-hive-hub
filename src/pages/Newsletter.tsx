
import Layout from "../components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, FileText, Calendar, Download, Upload } from "lucide-react";
import { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const newsletters = [
    {
      id: 1,
      title: "GIS Trends 2024",
      description: "Latest developments in geospatial technology and industry insights",
      date: "June 2024",
      downloadUrl: "#",
      featured: true
    },
    {
      id: 2,
      title: "QGIS Tips & Tricks",
      description: "Weekly collection of QGIS shortcuts and advanced techniques",
      date: "May 2024",
      downloadUrl: "#",
      featured: false
    },
    {
      id: 3,
      title: "Spatial AI Revolution",
      description: "How artificial intelligence is transforming spatial analysis",
      date: "April 2024",
      downloadUrl: "#",
      featured: false
    }
  ];

  const handleSubscribe = () => {
    if (email) {
      setIsSubscribed(true);
      setEmail("");
    }
  };

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Newsletter</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest in geospatial technology, industry news, and expert insights
          </p>
        </div>

        {/* Subscription Section */}
        <Card className="max-w-2xl mx-auto mb-12">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Mail className="h-5 w-5" />
              Subscribe to Our Newsletter
            </CardTitle>
            <CardDescription>
              Get weekly updates on GIS trends, tutorials, and industry insights directly to your inbox
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubscribed ? (
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSubscribe} disabled={!email}>
                  Subscribe
                </Button>
              </div>
            ) : (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium">✅ Successfully subscribed!</p>
                <p className="text-green-600 text-sm mt-1">You'll receive our next newsletter soon.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Newsletter Archives */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Newsletter Archives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsletters.map((newsletter) => (
              <Card key={newsletter.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{newsletter.title}</CardTitle>
                    {newsletter.featured && <Badge>Featured</Badge>}
                  </div>
                  <CardDescription>{newsletter.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {newsletter.date}
                    </div>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Admin Upload Section (for content creators) */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Newsletter
            </CardTitle>
            <CardDescription>
              Content creators can upload new newsletter editions here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Newsletter Title</label>
              <Input placeholder="Enter newsletter title" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea placeholder="Brief description of the newsletter content" />
            </div>
            <div>
              <label className="text-sm font-medium">Upload PDF</label>
              <Input type="file" accept=".pdf" />
            </div>
            <Button className="w-full">
              Upload Newsletter
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Newsletter;
