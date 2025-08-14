import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, BarChart3, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface ScoreData {
  overallScore: number;
  categories: {
    formatting: { score: number; feedback: string[]; };
    keywords: { score: number; feedback: string[]; };
    structure: { score: number; feedback: string[]; };
    readability: { score: number; feedback: string[]; };
  };
  recommendations: string[];
}

interface ResumeScorerProps {
  onBack: () => void;
}

export const ResumeScorer = ({ onBack }: ResumeScorerProps) => {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);

  const simulateAnalysis = () => {
    setProgress(0);
    const steps = [
      { label: "Parsing document structure...", progress: 20 },
      { label: "Analyzing keywords and phrases...", progress: 40 },
      { label: "Checking ATS compatibility...", progress: 60 },
      { label: "Evaluating formatting...", progress: 80 },
      { label: "Generating recommendations...", progress: 100 }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].progress);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 500);

    return interval;
  };

  const analyzeResume = async (file: File) => {
    setIsAnalyzing(true);
    const analysisInterval = simulateAnalysis();

    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock score data
    const mockScore: ScoreData = {
      overallScore: 78,
      categories: {
        formatting: {
          score: 85,
          feedback: [
            "Clean, professional layout detected",
            "Consistent font usage throughout",
            "Proper use of white space"
          ]
        },
        keywords: {
          score: 72,
          feedback: [
            "Good industry keyword coverage",
            "Missing some key technical terms",
            "Consider adding more action verbs"
          ]
        },
        structure: {
          score: 90,
          feedback: [
            "Clear section headers found",
            "Logical information flow",
            "Contact information properly placed"
          ]
        },
        readability: {
          score: 65,
          feedback: [
            "Some bullet points too long",
            "Good use of quantifiable achievements",
            "Consider shortening summary section"
          ]
        }
      },
      recommendations: [
        "Add more industry-specific keywords to improve ATS matching",
        "Shorten bullet points to 1-2 lines for better readability",
        "Include more quantified achievements with specific numbers",
        "Add a skills section if not present",
        "Ensure consistent date formatting throughout"
      ]
    };

    clearInterval(analysisInterval);
    setProgress(100);
    setScoreData(mockScore);
    setIsAnalyzing(false);

    toast({
      title: "Analysis Complete!",
      description: `Your resume scored ${mockScore.overallScore}/100 for ATS compatibility.`,
    });
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'application/pdf' || file.type.includes('document'))) {
      analyzeResume(file);
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
      analyzeResume(file);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-success" />;
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-warning" />;
    return <XCircle className="h-5 w-5 text-destructive" />;
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
          <h1 className="text-2xl font-bold">ATS Resume Scorer</h1>
          <p className="text-muted-foreground">Get detailed feedback on your resume's ATS compatibility</p>
        </div>
      </div>

      {!scoreData && !isAnalyzing && (
        <Card className="bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Upload Resume for Analysis</CardTitle>
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
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Drop your resume here for ATS analysis
              </h3>
              <p className="text-muted-foreground mb-4">
                We'll analyze formatting, keywords, structure, and readability
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline">
                Select Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isAnalyzing && (
        <Card className="bg-gradient-card border-0">
          <CardHeader>
            <CardTitle>Analyzing Your Resume...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-8 w-8 text-primary animate-pulse" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Running comprehensive ATS compatibility analysis...
                </p>
                <Progress value={progress} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {scoreData && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="bg-gradient-primary border-0 text-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-6xl font-bold mb-2">{scoreData.overallScore}</div>
                <div className="text-xl opacity-90">ATS Compatibility Score</div>
                <div className="text-sm opacity-75 mt-2">
                  {scoreData.overallScore >= 80 ? 'Excellent! Your resume is highly ATS-friendly.' :
                   scoreData.overallScore >= 60 ? 'Good! Some improvements recommended.' :
                   'Needs improvement for better ATS compatibility.'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Scores */}
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(scoreData.categories).map(([category, data]) => (
              <Card key={category} className="bg-gradient-card border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize text-lg">{category}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(data.score)}
                      <span className={`font-bold ${getScoreColor(data.score)}`}>
                        {data.score}/100
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={data.score} className="mb-3" />
                  <ul className="space-y-1 text-sm">
                    {data.feedback.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recommendations */}
          <Card className="bg-gradient-card border-0">
            <CardHeader>
              <CardTitle>Improvement Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scoreData.recommendations.map((rec, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              onClick={() => {
                setScoreData(null);
                setProgress(0);
              }}
              variant="outline"
              className="flex-1"
            >
              Analyze Another Resume
            </Button>
            <Button className="flex-1 bg-gradient-primary">
              Generate Improved Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};