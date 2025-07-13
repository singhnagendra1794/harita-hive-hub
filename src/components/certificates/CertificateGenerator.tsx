import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Download, Award, Calendar, User } from 'lucide-react';
// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.vfs;

interface CertificateData {
  id: string;
  student_name: string;
  course_name: string;
  completion_date: string;
  certificate_hash: string;
  certificate_type: string;
}

interface CertificateGeneratorProps {
  courseId?: string;
  learningPathId?: string;
  courseName: string;
  completionDate: string;
  onCertificateGenerated?: (certificateId: string) => void;
}

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  courseId,
  learningPathId,
  courseName,
  completionDate,
  onCertificateGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const generateCertificateHash = (data: string) => {
    return btoa(data + Date.now().toString()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  };

  const createPDFDefinition = (certData: CertificateData) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return {
      pageSize: 'A4',
      pageOrientation: 'landscape' as const,
      pageMargins: [40, 40, 40, 40],
      content: [
        {
          text: 'CERTIFICATE OF COMPLETION',
          style: 'header',
          alignment: 'center',
          margin: [0, 60, 0, 40]
        },
        {
          text: 'This is to certify that',
          style: 'subheader',
          alignment: 'center' as const,
          margin: [0, 0, 0, 20] as [number, number, number, number]
        },
        {
          text: certData.student_name,
          style: 'studentName',
          alignment: 'center' as const,
          margin: [0, 0, 0, 30] as [number, number, number, number]
        },
        {
          text: 'has successfully completed the course',
          style: 'bodyText',
          alignment: 'center' as const,
          margin: [0, 0, 0, 20] as [number, number, number, number]
        },
        {
          text: certData.course_name,
          style: 'courseName',
          alignment: 'center' as const,
          margin: [0, 0, 0, 40] as [number, number, number, number]
        },
        {
          text: `Completed on: ${new Date(certData.completion_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}`,
          style: 'dateText',
          alignment: 'center' as const,
          margin: [0, 0, 0, 60] as [number, number, number, number]
        },
        {
          columns: [
            {
              text: '________________________\nHarita Hive\nLearning Platform',
              style: 'signature',
              alignment: 'center' as const
            },
            {
              text: `________________________\nCertificate ID: ${certData.certificate_hash}\nIssued on: ${currentDate}`,
              style: 'signature',
              alignment: 'center' as const
            }
          ],
          margin: [0, 40, 0, 0] as [number, number, number, number]
        }
      ],
      styles: {
        header: {
          fontSize: 28,
          bold: true,
          color: '#1e40af'
        },
        subheader: {
          fontSize: 16,
          italics: true,
          color: '#64748b'
        },
        studentName: {
          fontSize: 32,
          bold: true,
          color: '#0f172a',
          decoration: 'underline' as const
        },
        bodyText: {
          fontSize: 16,
          color: '#475569'
        },
        courseName: {
          fontSize: 24,
          bold: true,
          color: '#1e40af',
          italics: true
        },
        dateText: {
          fontSize: 14,
          color: '#64748b'
        },
        signature: {
          fontSize: 12,
          color: '#64748b'
        }
      }
    };
  };

  const generateCertificate = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate your certificate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const studentName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student';
      const certificateHash = generateCertificateHash(studentName + courseName + completionDate);

      // Save certificate to database
      const { data: certData, error } = await supabase
        .from('certificates')
        .insert({
          user_id: user.id,
          course_id: courseId || null,
          learning_path_id: learningPathId || null,
          certificate_type: courseId ? 'course' : 'learning_path',
          student_name: studentName,
          course_name: courseName,
          completion_date: completionDate,
          certificate_hash: certificateHash
        })
        .select()
        .single();

      if (error) throw error;

      setCertificate(certData);
      onCertificateGenerated?.(certData.id);

      toast({
        title: "Certificate generated!",
        description: "Your certificate has been created successfully.",
      });

    } catch (error: any) {
      console.error('Error generating certificate:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate certificate",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = async (certData: CertificateData) => {
    try {
      const docDefinition = createPDFDefinition(certData);
      const pdfDocGenerator = pdfMake.createPdf(docDefinition as any);
      
      pdfDocGenerator.download(`${certData.course_name.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`);

      toast({
        title: "Download started",
        description: "Your certificate is being downloaded.",
      });
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast({
        title: "Download failed",
        description: "Failed to download certificate",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Course Certificate
        </CardTitle>
        <CardDescription>
          Generate and download your completion certificate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Completed: {new Date(completionDate).toLocaleDateString()}
          </div>
        </div>

        <div className="font-medium text-center p-4 bg-muted rounded-lg">
          {courseName}
        </div>

        {!certificate ? (
          <Button 
            onClick={generateCertificate} 
            disabled={isGenerating}
            className="w-full"
          >
            <Award className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Certificate'}
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="text-sm text-center text-green-600 font-medium">
              Certificate Generated ✓
            </div>
            <Button 
              onClick={() => downloadCertificate(certificate)}
              variant="outline"
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <div className="text-xs text-center text-muted-foreground">
              Certificate ID: {certificate.certificate_hash}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificateGenerator;