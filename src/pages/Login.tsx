import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await signIn(email, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md p-8 glass-strong shadow-xl">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 mb-3">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">ScriptSmith</h1>
          </div>
          
          <h2 className="text-xl font-semibold text-center mb-2 text-foreground">Welcome Back</h2>
          <p className="text-center text-muted-foreground mb-6 text-sm">Sign in to continue</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="glass border-border/50 mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="glass border-border/50 mt-1.5"
              />
            </div>
            
            <Button type="submit" className="w-full hover-lift" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium transition-all duration-300">
              Sign up
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
