
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState('admin@spektra.com');
  const [password, setPassword] = React.useState('password123');
  const [error, setError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSignIn}>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">SPEKTOR SDSC</CardTitle>
          <CardDescription>
            Sign in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-blue-800 font-medium">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address" 
              required 
              className="border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 focus:border-blue-400 focus:ring-blue-200 placeholder:text-blue-400"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="password" className="text-blue-800 font-medium">Password</Label>
            </div>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required 
                className="pr-10 border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 focus:border-blue-400 focus:ring-blue-200 placeholder:text-blue-400"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 rounded-full bg-blue-100 opacity-20"></div>
            <div className="relative">
              <div className="text-center mb-3">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Demo Credentials</h4>
                <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-blue-700 font-medium">Email:</span>
                  <code className="px-2 py-1 bg-white/80 rounded text-blue-800 text-xs font-mono border border-blue-200">
                    admin@spektra.com
                  </code>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-blue-700 font-medium">Password:</span>
                  <code className="px-2 py-1 bg-white/80 rounded text-blue-800 text-xs font-mono border border-blue-200">
                    password123
                  </code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
