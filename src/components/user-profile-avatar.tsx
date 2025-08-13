'use client';

import * as React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { authenticatedFetch } from '@/lib/auth-client';

interface UserProfileAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fallbackText?: string;
  showFallback?: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string;
}

export function UserProfileAvatar({ 
  className, 
  size = 'md', 
  fallbackText,
  showFallback = true 
}: UserProfileAvatarProps) {
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authenticatedFetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarFallback className="animate-pulse bg-slate-200">
          <div className="h-full w-full bg-slate-300 rounded-full" />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {profile?.profilePhoto && (
        <AvatarImage 
          src={profile.profilePhoto} 
          alt={`${profile.name} profile photo`}
          className="object-cover"
        />
      )}
      {showFallback && (
        <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
          {fallbackText || (profile?.name ? getInitials(profile.name) : 'U')}
        </AvatarFallback>
      )}
    </Avatar>
  );
}

export function useUserProfile() {
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authenticatedFetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setProfile(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, isLoading, setProfile };
}