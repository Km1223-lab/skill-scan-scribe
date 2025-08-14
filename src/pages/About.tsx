import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Users, 
  Clock, 
  Shield,
  Target,
  Heart,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';

const About = () => {
  const stats = [
    { icon: Users, label: 'Happy Clients', value: '1000+' },
    { icon: Clock, label: 'Years Experience', value: '5+' },
    { icon: Award, label: 'Success Rate', value: '99%' },
    { icon: Shield, label: 'Secure Processing', value: '100%' }
  ];

  const values = [
    {
      icon: Target,
      title: 'Excellence',
      description: 'We strive for excellence in every service we provide, ensuring the highest quality standards.'
    },
    {
      icon: Heart,
      title: 'Customer Focus',
      description: 'Our clients are at the heart of everything we do. We prioritize your needs and satisfaction.'
    },
    {
      icon: Shield,
      title: 'Integrity',
      description: 'We maintain the highest ethical standards and handle all documents with complete confidentiality.'
    },
    {
      icon: CheckCircle,
      title: 'Reliability',
      description: 'You can count on us to deliver on time, every time, with consistent quality and professionalism.'
    }
  ];

  const team = [
    {
      name: 'Kevin Githinji',
      role: 'Founder & CEO',
      description: 'With over 5 years of experience in digital services and design, Kevin leads our team with passion and expertise.',
      expertise: ['Business Strategy', 'Client Relations', 'Digital Services']
    },
    {
      name: 'Grace Wanjiku',
      role: 'Senior Design Specialist',
      description: 'Grace brings creativity and technical excellence to all our graphic design and branding projects.',
      expertise: ['Graphic Design', 'Brand Identity', 'Visual Communication']
    },
    {
      name: 'David Mwangi',
      role: 'Document Processing Expert',
      description: 'David ensures all government document applications are processed efficiently and accurately.',
      expertise: ['E-Citizen Services', 'Document Processing', 'Government Relations']
    }
  ];

  return (
    <div className="min-h-screen py-12">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About <span className="bg-gradient-primary bg-clip-text text-transparent">KG Designs</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              We are Kenya's trusted partner for digital services, creative design, and professional consultation. 
              Our mission is to simplify complex processes and deliver exceptional results.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  KG Designs was founded with a simple yet powerful vision: to make essential services 
                  accessible, affordable, and efficient for every Kenyan. What started as a small 
                  initiative to help friends and family navigate government digital services has grown 
                  into a comprehensive service provider.
                </p>
                <p>
                  Today, we proudly serve over 1000 satisfied clients across Kenya, offering everything 
                  from E-Citizen services and visa applications to creative design and branding solutions. 
                  Our team combines deep local knowledge with international best practices to deliver 
                  exceptional results.
                </p>
                <p>
                  We believe that everyone deserves access to professional services that can help them 
                  achieve their goals, whether that's obtaining important documents, traveling abroad, 
                  or building a strong brand for their business.
                </p>
              </div>
              <Button asChild className="mt-6">
                <Link to="/contact">
                  Work With Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 p-6 rounded-lg">
                <Award className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Quality Assured</h3>
                <p className="text-sm text-muted-foreground">
                  Every service is delivered with meticulous attention to detail
                </p>
              </div>
              <div className="bg-primary/5 p-6 rounded-lg">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Expert Team</h3>
                <p className="text-sm text-muted-foreground">
                  Experienced professionals dedicated to your success
                </p>
              </div>
              <div className="bg-primary/5 p-6 rounded-lg">
                <Clock className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">On Time</h3>
                <p className="text-sm text-muted-foreground">
                  We respect deadlines and deliver when promised
                </p>
              </div>
              <div className="bg-primary/5 p-6 rounded-lg">
                <Shield className="h-12 w-12 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Your documents and data are handled with utmost security
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg flex-shrink-0">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The passionate professionals behind KG Designs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center group hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm mb-4">
                    {member.description}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.expertise.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="text-center md:text-left">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
              <p className="text-muted-foreground">
                To simplify complex processes and provide accessible, professional services that empower 
                individuals and businesses to achieve their goals efficiently and confidently.
              </p>
            </div>
            
            <div className="text-center md:text-left">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-6">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
              <p className="text-muted-foreground">
                To become Kenya's leading service provider for digital solutions, creative design, and 
                professional consultation, known for excellence, reliability, and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Work Together?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of satisfied clients who trust KG Designs for their service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/contact">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/services">View Our Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;