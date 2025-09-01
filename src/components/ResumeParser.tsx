import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface ParsedData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
  }>;
  skills: string[];
}

interface ResumeParserProps {
  onBack: () => void;
}

export const ResumeParser = ({ onBack }: ResumeParserProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    return interval;
  };

  const parseFile = async (file: File) => {
    setIsProcessing(true);
    const progressInterval = simulateProgress();

    try {
      // Convert file to text (simplified - in production use proper PDF/DOC parsing)
      const text = await file.text();
      
      // Use AI document detector to analyze the content
      const { data, error } = await supabase.functions.invoke('ai-document-detector', {
        body: {
          documentContent: text,
          documentName: file.name
        }
      });

      if (error) {
        throw error;
      }

      // Simulate additional processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock parsed data (in production, use proper resume parsing)
      const mockData: ParsedData = {
        personalInfo: {
          name: "John Smith",
          email: "john.smith@email.com",
          phone: "+1 (555) 123-4567",
          location: "San Francisco, CA"
        },
        summary: "Experienced software engineer with 5+ years of experience in full-stack development. Proficient in modern web technologies and passionate about creating scalable solutions.",
        experience: [
          {
            company: "Tech Corp",
            position: "Senior Software Engineer",
            duration: "Jan 2022 - Present",
            description: "Led development of microservices architecture serving 1M+ users. Implemented CI/CD pipelines reducing deployment time by 60%."
          },
          {
            company: "StartupXYZ",
            position: "Full Stack Developer",
            duration: "Jun 2019 - Dec 2021",
            description: "Built responsive web applications using React and Node.js. Collaborated with UX team to improve user engagement by 40%."
          }
        ],
        education: [
          {
            institution: "Stanford University",
            degree: "Bachelor of Science in Computer Science",
            year: "2019"
          }
        ],
        skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "Kubernetes", "SQL", "Git"]
      };

      clearInterval(progressInterval);
      setProgress(100);
      setParsedData(mockData);
      setIsProcessing(false);

      toast({
        title: "Resume Parsed Successfully!",
        description: "Your resume has been analyzed and data extracted.",
      });
    } catch (error) {
      console.error('Error parsing resume:', error);
      clearInterval(progressInterval);
      setIsProcessing(false);
      setProgress(0);
      
      toast({
        title: "Error",
        description: "Failed to parse resume. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      parseFile(file);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document.",
        variant: "destructive",
      });
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      parseFile(file);
    }
  };

  const exportParsedData = () => {
    if (!parsedData) return;
    
    const dataStr = JSON.stringify(parsedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'parsed-resume-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Resume Parser</h1>
          <p className="text-muted-foreground">Upload and extract data from existing resumes</p>
        </div>
      </div>

      {!parsedData && !isProcessing && (
        <Card className="bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Drop your resume here or click to upload
              </h3>
              <p className="text-muted-foreground mb-4">
                Supports PDF and Word documents up to 10MB
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline">
                Select File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isProcessing && (
        <Card className="bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Processing Resume...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary animate-pulse" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Analyzing document structure and extracting information...
                </p>
                <Progress value={progress} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {parsedData && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Parsed Resume Data</h2>
            <Button onClick={exportParsedData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>

          <div className="grid gap-6">
            {/* Personal Information */}
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{parsedData.personalInfo.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium">{parsedData.personalInfo.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="font-medium">{parsedData.personalInfo.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="font-medium">{parsedData.personalInfo.location}</p>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{parsedData.summary}</p>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {parsedData.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{exp.position}</h4>
                        <p className="text-muted-foreground">{exp.company}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{exp.duration}</span>
                    </div>
                    <p className="text-sm">{exp.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {parsedData.education.map((edu, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <h4 className="font-semibold">{edu.degree}</h4>
                      <p className="text-muted-foreground">{edu.institution}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{edu.year}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="bg-gradient-card border-0">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={() => {
                setParsedData(null);
                setProgress(0);
              }}
              variant="outline"
              className="flex-1"
            >
              Parse Another Resume
            </Button>
            <Button className="flex-1 bg-gradient-primary">
              Use This Data in Generator
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};