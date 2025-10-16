
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

const Contact = () => {
  return (
    <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get in touch with our team for support, partnerships, or any questions about Harita Hive.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Support
              </CardTitle>
              <CardDescription>
                Reach out to us via email for detailed inquiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="mailto:contact@haritahive.com" 
                className="text-primary hover:underline text-lg font-medium"
              >
                contact@haritahive.com
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Phone Support
              </CardTitle>
              <CardDescription>
                Call us directly for immediate assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="tel:+919027608557" 
                className="text-primary hover:underline text-lg font-medium"
              >
                +91 9027608557
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                WhatsApp Support
              </CardTitle>
              <CardDescription>
                Chat with us on WhatsApp for quick support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a 
                href="https://wa.me/919027608557" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-lg font-medium"
              >
                Message on WhatsApp
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Our Location
              </CardTitle>
              <CardDescription>
                Visit us at our headquarters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <address className="text-lg not-italic">
                Sambhal, Uttar Pradesh<br />
                India, 244304
              </address>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <h2 className="text-2xl font-bold mb-4">Business Hours</h2>
          <p className="text-muted-foreground">
            Monday - Friday: 9:00 AM - 6:00 PM (IST)<br />
            Saturday: 10:00 AM - 4:00 PM (IST)<br />
            Sunday: Closed
          </p>
        </div>
      </div>
  );
};

export default Contact;