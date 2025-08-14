import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Search, Star, Upload, Plus, BarChart3 } from 'lucide-react';
import { ResumeGenerator } from './ResumeGenerator';
import { ResumeParser } from './ResumeParser';
import { ResumeScorer } from './ResumeScorer';

type ActiveTool = 'dashboard' | 'generator' | 'parser' | 'scorer';

const Dashboard = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('dashboard');

  const renderContent = () => {
    switch (activeTool) {
      case 'generator':
        return <ResumeGenerator onBack={() => setActiveTool('dashboard')} />;
      case 'parser':
        return <ResumeParser onBack={() => setActiveTool('dashboard')} />;
      case 'scorer':
        return <ResumeScorer onBack={() => setActiveTool('dashboard')} />;
      default:
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12 px-4 bg-gradient-hero rounded-2xl shadow-glow">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                ATS Resume Suite
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Create, parse, and optimize your resume for Applicant Tracking Systems
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => setActiveTool('generator')}
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Start Building
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setActiveTool('scorer')}
                  className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Test Resume
                </Button>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-elegant transition-all duration-300 bg-gradient-card border-0"
                onClick={() => setActiveTool('generator')}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Resume Generator</CardTitle>
                  <CardDescription>
                    Create ATS-optimized resumes with our guided builder
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Start Creating
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-elegant transition-all duration-300 bg-gradient-card border-0"
                onClick={() => setActiveTool('parser')}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">Resume Parser</CardTitle>
                  <CardDescription>
                    Extract and analyze information from existing resumes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Upload Resume
                  </Button>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-elegant transition-all duration-300 bg-gradient-card border-0"
                onClick={() => setActiveTool('scorer')}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 shadow-glow">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">ATS Scorer</CardTitle>
                  <CardDescription>
                    Get your resume scored for ATS compatibility
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Score Resume
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Features Section */}
            <div className="text-center py-8">
              <h2 className="text-3xl font-bold mb-6">Why Choose Our ATS Suite?</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center mx-auto">
                    <Search className="h-6 w-6 text-success-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">ATS Optimized</h3>
                  <p className="text-muted-foreground">
                    Built with ATS parsing algorithms in mind for maximum compatibility
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center mx-auto">
                    <BarChart3 className="h-6 w-6 text-warning-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">Real-time Scoring</h3>
                  <p className="text-muted-foreground">
                    Get instant feedback and suggestions to improve your resume
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mx-auto">
                    <FileText className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">Professional Templates</h3>
                  <p className="text-muted-foreground">
                    Choose from modern, clean templates that recruiters love
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;