import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Code2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return;
    }
    
    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);
    
    if (!error) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/5 p-4">
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
          
          <h2 className="text-xl font-semibold text-center mb-2 text-foreground">Create Account</h2>
          <p className="text-center text-muted-foreground mb-6 text-sm">Sign up to get started</p>
          
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
                minLength={6}
                className="glass border-border/50 mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="glass border-border/50 mt-1.5"
              />
              {password !== confirmPassword && confirmPassword && (
                <p className="text-sm text-destructive mt-1.5">Passwords do not match</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full hover-lift" 
              disabled={isLoading || password !== confirmPassword}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium transition-all duration-300">
              Sign in
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
