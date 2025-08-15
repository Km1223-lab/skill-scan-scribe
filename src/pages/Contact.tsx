import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  MessageCircle,
  Send,
  FileText,
  Globe,
  Palette,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for your inquiry. We'll get back to you within 24 hours.",
    });
    setFormData({ name: '', email: '', phone: '', service: '', message: '' });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+254748166300'],
      description: 'Mon-Fri 8AM-6PM, Sat 9AM-4PM'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['mrkg848@gmail.com'],
      description: 'We respond within 2 hours'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['Nairobi CBD', 'Kenya'],
      description: 'By appointment only'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Mon-Fri: 8AM-6PM', 'Sat: 9AM-4PM'],
      description: 'Closed on Sundays'
    }
  ];

  const services = [
    { value: 'e-citizen', label: 'E-Citizen Services', icon: FileText },
    { value: 'visa', label: 'Visa Applications', icon: Globe },
    { value: 'design', label: 'Graphic Design', icon: Palette },
    { value: 'branding', label: 'Branding & Consultation', icon: Users },
    { value: 'other', label: 'Other Services', icon: MessageCircle }
  ];

  const faqs = [
    {
      question: 'How long does document processing take?',
      answer: 'Processing times vary by service type. E-Citizen services typically take 3-7 business days, while visa applications can take 7-45 days depending on the country.'
    },
    {
      question: 'Do you offer emergency services?',
      answer: 'Yes, we provide rush processing for urgent cases at an additional fee. Contact us to discuss your timeline and requirements.'
    },
    {
      question: 'What documents do I need to provide?',
      answer: 'Required documents vary by service. We provide a detailed checklist once you specify your needs. Our team guides you through the entire process.'
    },
    {
      question: 'Are your services available nationwide?',
      answer: 'Yes, we serve clients across Kenya. For those outside Nairobi, we offer digital consultation and document collection services.'
    }
  ];

  return (
    <div className="min-h-screen py-12">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Contact <span className="bg-gradient-primary bg-clip-text text-transparent">KG Designs</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Ready to get started? Contact us today for professional consultation and exceptional service delivery.
          </p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you within 24 hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+254 XXX XXX XXX"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="service">Service Needed *</Label>
                    <Select value={formData.service} onValueChange={(value) => handleInputChange('service', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.value} value={service.value}>
                            <div className="flex items-center space-x-2">
                              <service.icon className="h-4 w-4" />
                              <span>{service.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Please describe your needs in detail..."
                      rows={4}
                      required
                    />
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full">
                    <Send className="mr-2 h-5 w-5" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Get In Touch</h2>
                <p className="text-muted-foreground mb-8">
                  We're here to help you with all your service needs. Choose the most convenient way to reach us.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm mb-1">{info.title}</h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-foreground">{detail}</p>
                        ))}
                        <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Quick Service Selector */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4">Quick Service Request</h3>
                <div className="grid grid-cols-2 gap-3">
                  {services.slice(0, 4).map((service) => (
                    <Button
                      key={service.value}
                      variant="outline"
                      size="sm"
                      className="justify-start h-auto py-3"
                      onClick={() => handleInputChange('service', service.value)}
                    >
                      <service.icon className="mr-2 h-4 w-4" />
                      <span className="text-xs">{service.label}</span>
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Quick answers to common questions about our services
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-lg text-foreground mb-3">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Visit Our Office</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold">Location</h3>
                    <p className="text-muted-foreground">
                      Nairobi Central Business District<br />
                      Kenya
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold">Business Hours</h3>
                    <div className="text-muted-foreground space-y-1">
                      <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p>Saturday: 9:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="p-6 bg-gradient-card">
              <h3 className="font-semibold text-lg mb-4">Schedule a Consultation</h3>
              <p className="text-muted-foreground mb-6">
                Book a free consultation to discuss your specific needs and get expert advice on the best solutions for you.
              </p>
                <Button asChild className="w-full">
                  <a href="tel:+254748166300">
                    <Phone className="mr-2 h-5 w-5" />
                    Call to Schedule
                  </a>
                </Button>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;