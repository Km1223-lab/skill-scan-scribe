import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Globe, 
  Palette, 
  Users,
  CreditCard,
  MapPin,
  Briefcase,
  GraduationCap,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Services = () => {
  const serviceCategories = [
    {
      title: 'E-Citizen Services',
      icon: FileText,
      description: 'Complete assistance with all Kenyan government digital services',
      color: 'bg-blue-500/10 text-blue-500',
      services: [
        {
          name: 'Birth Certificate Application',
          description: 'Get your birth certificate processed quickly and efficiently',
          price: 'From KSh 500',
          duration: '3-5 business days'
        },
        {
          name: 'National ID Services',
          description: 'New ID applications, replacements, and renewals',
          price: 'From KSh 300',
          duration: '5-7 business days'
        },
        {
          name: 'Passport Services',
          description: 'New passport applications and renewals',
          price: 'From KSh 1,000',
          duration: '7-14 business days'
        },
        {
          name: 'Business Registration',
          description: 'Register your business with ease',
          price: 'From KSh 2,000',
          duration: '2-3 business days'
        },
        {
          name: 'Police Clearance Certificate',
          description: 'Criminal background check certificates',
          price: 'From KSh 800',
          duration: '5-10 business days'
        },
        {
          name: 'Marriage Certificate',
          description: 'Marriage certificate applications and copies',
          price: 'From KSh 600',
          duration: '3-5 business days'
        }
      ]
    },
    {
      title: 'Visa Applications',
      icon: Globe,
      description: 'Professional visa application services for international travel',
      color: 'bg-green-500/10 text-green-500',
      services: [
        {
          name: 'Tourist Visas',
          description: 'Vacation and leisure travel visas worldwide',
          price: 'From KSh 5,000',
          duration: '7-21 business days'
        },
        {
          name: 'Business Visas',
          description: 'Business travel and conference visas',
          price: 'From KSh 7,000',
          duration: '7-21 business days'
        },
        {
          name: 'Student Visas',
          description: 'Study abroad visa applications',
          price: 'From KSh 10,000',
          duration: '14-30 business days'
        },
        {
          name: 'Work Permits',
          description: 'Employment-based visa applications',
          price: 'From KSh 15,000',
          duration: '21-45 business days'
        },
        {
          name: 'Transit Visas',
          description: 'Airport transit and short-stay visas',
          price: 'From KSh 3,000',
          duration: '5-14 business days'
        },
        {
          name: 'Family Visas',
          description: 'Family reunion and dependent visas',
          price: 'From KSh 8,000',
          duration: '14-30 business days'
        }
      ]
    },
    {
      title: 'Graphic Design',
      icon: Palette,
      description: 'Creative design solutions for all your visual needs',
      color: 'bg-purple-500/10 text-purple-500',
      services: [
        {
          name: 'Logo Design',
          description: 'Professional logo design for your brand',
          price: 'From KSh 3,000',
          duration: '3-5 business days'
        },
        {
          name: 'Business Cards',
          description: 'Professional business card design and printing',
          price: 'From KSh 1,500',
          duration: '2-3 business days'
        },
        {
          name: 'Flyers & Posters',
          description: 'Marketing materials and promotional designs',
          price: 'From KSh 2,000',
          duration: '2-4 business days'
        },
        {
          name: 'Social Media Graphics',
          description: 'Engaging graphics for social media platforms',
          price: 'From KSh 1,000',
          duration: '1-2 business days'
        },
        {
          name: 'Brochures & Catalogs',
          description: 'Professional brochure and catalog design',
          price: 'From KSh 5,000',
          duration: '5-7 business days'
        },
        {
          name: 'Website Graphics',
          description: 'Web banners, headers, and digital graphics',
          price: 'From KSh 2,500',
          duration: '3-5 business days'
        }
      ]
    },
    {
      title: 'Branding & Consultation',
      icon: Users,
      description: 'Strategic branding and business consultation services',
      color: 'bg-orange-500/10 text-orange-500',
      services: [
        {
          name: 'Brand Strategy Development',
          description: 'Comprehensive brand strategy and positioning',
          price: 'From KSh 15,000',
          duration: '7-14 business days'
        },
        {
          name: 'Brand Identity Package',
          description: 'Complete brand identity including logo, colors, fonts',
          price: 'From KSh 10,000',
          duration: '5-10 business days'
        },
        {
          name: 'Market Research',
          description: 'Industry analysis and competitor research',
          price: 'From KSh 8,000',
          duration: '5-7 business days'
        },
        {
          name: 'Business Consultation',
          description: 'Strategic business advice and planning',
          price: 'From KSh 5,000',
          duration: '1-2 business days'
        },
        {
          name: 'Brand Guidelines',
          description: 'Comprehensive brand usage guidelines',
          price: 'From KSh 7,000',
          duration: '3-5 business days'
        },
        {
          name: 'Marketing Strategy',
          description: 'Digital and traditional marketing planning',
          price: 'From KSh 12,000',
          duration: '7-10 business days'
        }
      ]
    }
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Consultation',
      description: 'We discuss your needs and provide expert guidance'
    },
    {
      step: '02', 
      title: 'Documentation',
      description: 'We help gather and prepare all required documents'
    },
    {
      step: '03',
      title: 'Processing',
      description: 'We handle the application process efficiently'
    },
    {
      step: '04',
      title: 'Delivery',
      description: 'We deliver your completed service on time'
    }
  ];

  return (
    <div className="min-h-screen py-12">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="bg-gradient-primary bg-clip-text text-transparent">Services</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Comprehensive solutions for all your documentation, visa, design, and branding needs
          </p>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Process
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple, efficient, and reliable service delivery
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary text-primary-foreground w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {serviceCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-20">
              <div className="text-center mb-12">
                <div className={`inline-flex items-center space-x-3 px-6 py-3 rounded-full ${category.color} mb-4`}>
                  <category.icon className="h-6 w-6" />
                  <span className="font-semibold">{category.title}</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  {category.title}
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  {category.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.services.map((service, serviceIndex) => (
                  <Card key={serviceIndex} className="group hover:shadow-elegant transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Starting from:</span>
                          <Badge variant="outline" className="font-semibold">{service.price}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Processing time:</span>
                          <span className="text-sm font-medium">{service.duration}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Our Services?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Expert Guidance</h3>
                <p className="text-muted-foreground">Professional advice and support throughout the process</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Fast Processing</h3>
                <p className="text-muted-foreground">Quick turnaround times without compromising quality</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Affordable Pricing</h3>
                <p className="text-muted-foreground">Competitive rates for all our services</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Secure Handling</h3>
                <p className="text-muted-foreground">Safe and confidential document processing</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-muted-foreground">Round-the-clock customer support</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Satisfaction Guarantee</h3>
                <p className="text-muted-foreground">100% satisfaction or money back guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Contact us today to discuss your specific needs and get a personalized quote.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/contact">
              Get Your Quote Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Services;