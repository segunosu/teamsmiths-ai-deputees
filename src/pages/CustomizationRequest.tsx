import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Check, Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  title: string;
  description: string;
  base_price: number;
  category: { name: string };
}

const CustomizationRequest = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const templateName = searchParams.get('template');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    company_name: '',
    contact_email: user?.email || '',
    contact_phone: '',
    project_title: '',
    base_template: templateName || '',
    custom_requirements: '',
    budget_range: '',
    timeline_preference: '',
    urgency_level: 'standard',
    additional_context: ''
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, title, description, base_price, category:categories(name)')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setProduct(data);
      setFormData(prev => ({
        ...prev,
        base_template: data.title,
        project_title: `Custom ${data.title} Solution`
      }));
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('customization_requests')
        .insert({
          ...formData,
          user_id: user?.id,
          product_id: id || null
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Request Submitted!",
        description: "We'll review your customization requirements and get back to you within 24 hours.",
      });
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Request Submitted!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Thank you for your customization request. Our team will review your requirements and contact you within 24 hours.
            </p>
            <div className="space-y-4">
              <Button asChild size="lg">
                <Link to="/catalog">Browse More Templates</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/dashboard">View My Requests</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link to={id ? `/product/${id}` : '/catalog'}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {id ? 'Back to Template' : 'Back to Catalog'}
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Customization Request</CardTitle>
                <CardDescription>
                  Tell us about your specific requirements and we'll create a tailored solution for you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Company & Contact */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_email">Contact Email *</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        required
                        value={formData.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_phone">Phone Number</Label>
                      <Input
                        id="contact_phone"
                        value={formData.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="project_title">Project Title *</Label>
                      <Input
                        id="project_title"
                        required
                        value={formData.project_title}
                        onChange={(e) => handleInputChange('project_title', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Template Base */}
                  <div>
                    <Label htmlFor="base_template">Starting Template</Label>
                    <Input
                      id="base_template"
                      value={formData.base_template}
                      onChange={(e) => handleInputChange('base_template', e.target.value)}
                      placeholder="e.g., Lead Generation Pack, or 'Custom from scratch'"
                    />
                  </div>

                  {/* Requirements */}
                  <div>
                    <Label htmlFor="custom_requirements">Customization Requirements *</Label>
                    <Textarea
                      id="custom_requirements"
                      required
                      rows={6}
                      value={formData.custom_requirements}
                      onChange={(e) => handleInputChange('custom_requirements', e.target.value)}
                      placeholder="Please describe your specific requirements, modifications needed, additional features, integrations, etc."
                    />
                  </div>

                  {/* Budget & Timeline */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="budget_range">Budget Range</Label>
                      <Select onValueChange={(value) => handleInputChange('budget_range', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under-5k">Under £5,000</SelectItem>
                          <SelectItem value="5k-15k">£5,000 - £15,000</SelectItem>
                          <SelectItem value="15k-50k">£15,000 - £50,000</SelectItem>
                          <SelectItem value="50k-plus">£50,000+</SelectItem>
                          <SelectItem value="discuss">Prefer to discuss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timeline_preference">Timeline</Label>
                      <Select onValueChange={(value) => handleInputChange('timeline_preference', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asap">ASAP (Rush job)</SelectItem>
                          <SelectItem value="1-2weeks">1-2 weeks</SelectItem>
                          <SelectItem value="3-4weeks">3-4 weeks</SelectItem>
                          <SelectItem value="1-2months">1-2 months</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="urgency_level">Urgency</Label>
                      <Select value={formData.urgency_level} onValueChange={(value) => handleInputChange('urgency_level', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low priority</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="high">High priority</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Additional Context */}
                  <div>
                    <Label htmlFor="additional_context">Additional Context</Label>
                    <Textarea
                      id="additional_context"
                      rows={3}
                      value={formData.additional_context}
                      onChange={(e) => handleInputChange('additional_context', e.target.value)}
                      placeholder="Any additional information, specific tools/platforms you use, team size, etc."
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? 'Submitting...' : (
                      <>
                        Submit Customization Request
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Review (24 hours)</div>
                    <div className="text-sm text-muted-foreground">Our team reviews your requirements</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Consultation Call</div>
                    <div className="text-sm text-muted-foreground">15-30 min discussion of your needs</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Custom Quote</div>
                    <div className="text-sm text-muted-foreground">Detailed proposal with timeline & pricing</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <div className="font-medium">Project Start</div>
                    <div className="text-sm text-muted-foreground">Milestone-based delivery begins</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {product && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Base Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="secondary">{product.category.name}</Badge>
                    <h3 className="font-medium">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                    <div className="text-lg font-bold text-primary">
                      From £{(product.base_price / 100).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationRequest;