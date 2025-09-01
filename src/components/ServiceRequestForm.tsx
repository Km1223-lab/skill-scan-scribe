import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Globe, 
  Palette, 
  Users,
  Send,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ServiceRequestFormProps {
  onBack: () => void;
  selectedService?: string;
}

export const ServiceRequestForm = ({ onBack, selectedService }: ServiceRequestFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimate, setEstimate] = useState<{cost: number, days: number} | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    serviceCategory: selectedService || '',
    serviceType: '',
    description: '',
    urgency: 'normal'
  });

  const serviceCategories = {
    'e-citizen': {
      title: 'E-Citizen Services',
      icon: FileText,
      color: 'bg-blue-500/10 text-blue-500',
      services: [
        { value: 'birth-certificate', label: 'Birth Certificate Application', cost: 500, days: 5 },
        { value: 'national-id', label: 'National ID Services', cost: 300, days: 7 },
        { value: 'passport', label: 'Passport Services', cost: 1000, days: 14 },
        { value: 'business-registration', label: 'Business Registration', cost: 2000, days: 3 },
        { value: 'police-clearance', label: 'Police Clearance Certificate', cost: 800, days: 10 },
        { value: 'marriage-certificate', label: 'Marriage Certificate', cost: 600, days: 5 }
      ]
    },
    'visa': {
      title: 'Visa Applications',
      icon: Globe,
      color: 'bg-green-500/10 text-green-500',
      services: [
        { value: 'tourist', label: 'Tourist Visas', cost: 5000, days: 21 },
        { value: 'business', label: 'Business Visas', cost: 7000, days: 21 },
        { value: 'student', label: 'Student Visas', cost: 10000, days: 30 },
        { value: 'work-permit', label: 'Work Permits', cost: 15000, days: 45 },
        { value: 'transit', label: 'Transit Visas', cost: 3000, days: 14 },
        { value: 'family', label: 'Family Visas', cost: 8000, days: 30 }
      ]
    },
    'design': {
      title: 'Graphic Design',
      icon: Palette,
      color: 'bg-purple-500/10 text-purple-500',
      services: [
        { value: 'logo', label: 'Logo Design', cost: 3000, days: 5 },
        { value: 'business-cards', label: 'Business Cards', cost: 1500, days: 3 },
        { value: 'flyers', label: 'Flyers & Posters', cost: 2000, days: 4 },
        { value: 'social-media', label: 'Social Media Graphics', cost: 1000, days: 2 },
        { value: 'brochures', label: 'Brochures & Catalogs', cost: 5000, days: 7 },
        { value: 'website-graphics', label: 'Website Graphics', cost: 2500, days: 5 }
      ]
    },
    'branding': {
      title: 'Branding & Consultation',
      icon: Users,
      color: 'bg-orange-500/10 text-orange-500',
      services: [
        { value: 'brand-strategy', label: 'Brand Strategy Development', cost: 15000, days: 14 },
        { value: 'brand-identity', label: 'Brand Identity Package', cost: 10000, days: 10 },
        { value: 'market-research', label: 'Market Research', cost: 8000, days: 7 },
        { value: 'consultation', label: 'Business Consultation', cost: 5000, days: 2 },
        { value: 'brand-guidelines', label: 'Brand Guidelines', cost: 7000, days: 5 },
        { value: 'marketing-strategy', label: 'Marketing Strategy', cost: 12000, days: 10 }
      ]
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update estimate when service type changes
    if (field === 'serviceType' || field === 'serviceCategory') {
      const category = serviceCategories[formData.serviceCategory as keyof typeof serviceCategories];
      if (category) {
        const service = category.services.find(s => s.value === (field === 'serviceType' ? value : formData.serviceType));
        if (service) {
          setEstimate({ cost: service.cost, days: service.days });
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('service-request', {
        body: {
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          serviceCategory: formData.serviceCategory,
          serviceType: formData.serviceType,
          description: formData.description,
          urgency: formData.urgency
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Service Request Submitted!",
        description: `Your request has been received. Reference ID: ${data.requestId.slice(0, 8)}`,
      });

      // Reset form
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        serviceCategory: '',
        serviceType: '',
        description: '',
        urgency: 'normal'
      });
      setEstimate(null);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = formData.serviceCategory ? serviceCategories[formData.serviceCategory as keyof typeof serviceCategories] : null;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button onClick={onBack} variant="ghost" className="mb-4">
            ← Back to Services
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">Request a Service</h1>
          <p className="text-muted-foreground">
            Fill out the form below to request any of our professional services. We'll get back to you within 2 hours with a detailed quote.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Service Request Details</CardTitle>
                <CardDescription>
                  Please provide as much detail as possible to help us serve you better.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Full Name *</Label>
                      <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) => handleInputChange('clientName', e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientPhone">Phone Number *</Label>
                      <Input
                        id="clientPhone"
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                        placeholder="+254 XXX XXX XXX"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="clientEmail">Email Address *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  {/* Service Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="serviceCategory">Service Category *</Label>
                      <Select value={formData.serviceCategory} onValueChange={(value) => handleInputChange('serviceCategory', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(serviceCategories).map(([key, category]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center space-x-2">
                                <category.icon className="h-4 w-4" />
                                <span>{category.title}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedCategory && (
                      <div>
                        <Label htmlFor="serviceType">Specific Service *</Label>
                        <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedCategory.services.map((service) => (
                              <SelectItem key={service.value} value={service.value}>
                                {service.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="urgency">Priority Level</Label>
                    <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal Priority</SelectItem>
                        <SelectItem value="urgent">Urgent (Rush Processing)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Project Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Please provide detailed information about your requirements, deadlines, and any specific needs..."
                      rows={4}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Submit Service Request
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Estimate Card */}
            {estimate && (
              <Card className="bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Estimated Quote
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Estimated Cost:</span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      KSh {estimate.cost.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Timeline:</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{estimate.days} days</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This is an estimated quote. Final pricing may vary based on specific requirements.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Process Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Review & Contact</h4>
                    <p className="text-sm text-muted-foreground">We'll review your request and contact you within 2 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Consultation</h4>
                    <p className="text-sm text-muted-foreground">We'll discuss details and provide a final quote</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Get Started</h4>
                    <p className="text-sm text-muted-foreground">Once approved, we begin working on your project</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <strong>Phone:</strong> +254748166300
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> mrkg848@gmail.com
                </p>
                <p className="text-sm">
                  <strong>Hours:</strong> Mon-Fri 8AM-6PM
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};