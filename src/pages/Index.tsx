import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Code2, Zap, Shield, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Code2 className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-4">ScriptSmith</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-Powered Code Analysis & Documentation Platform
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/signup')}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <Card className="p-6">
            <Zap className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Instant Analysis</h3>
            <p className="text-muted-foreground">
              Get comprehensive code analysis with quality metrics, issues detection, and improvement suggestions in seconds.
            </p>
          </Card>

          <Card className="p-6">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Documentation</h3>
            <p className="text-muted-foreground">
              Auto-generate professional docstrings and documentation for your code with AI assistance.
            </p>
          </Card>

          <Card className="p-6">
            <History className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-muted-foreground">
              Keep a complete history of all your code analyses and track improvements over time.
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="p-8 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to improve your code?</h2>
            <p className="text-muted-foreground mb-6">
              Join ScriptSmith today and start analyzing your code with AI-powered insights.
            </p>
            <Button size="lg" onClick={() => navigate('/signup')}>
              Create Free Account
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;