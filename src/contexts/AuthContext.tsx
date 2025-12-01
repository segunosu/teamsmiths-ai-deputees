import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signInWithGoogle: () => Promise<{ error?: any }>;
  signOut: () => Promise<{ error?: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Link briefs to user and handle user type setup when they sign in
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            linkBriefsToUser(session.user);
            setupUserProfile(session.user);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const linkBriefsToUser = async (user: User) => {
    if (!user.email) return;
    
    try {
      console.log('Linking briefs to user:', user.email);
      await supabase.rpc('link_briefs_to_user_by_email', {
        _email: user.email,
        _user_id: user.id
      });
      console.log('Successfully linked briefs to user');
    } catch (error) {
      console.error('Error linking briefs to user:', error);
      // Don't throw error, just log it
    }
  };

  const setupUserProfile = async (user: User) => {
    try {
      const userType = user.user_metadata?.user_type as string | undefined;

      // Get existing profile (created by trigger) if present
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();

      if (userType) {
        if (existingProfile) {
          // Set or correct the user_type if missing or different
          if (existingProfile.user_type !== userType) {
            await supabase
              .from('profiles')
              .update({ user_type: userType })
              .eq('user_id', user.id);
          }
        } else {
          // Fallback: create a profile row if for some reason it doesn't exist yet
          await supabase.from('profiles').insert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name,
            user_type: userType,
          });
        }

        // Ensure freelancer specific record exists
        if (userType === 'freelancer') {
          const { data: fp } = await supabase
            .from('freelancer_profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!fp) {
            await supabase.from('freelancer_profiles').insert({ user_id: user.id });
          }
        }
      }
    } catch (error) {
      console.error('Error setting up user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: fullName ? { full_name: fullName } : undefined
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link.",
      });

      return {};
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return {};
    } catch (error: any) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return {};
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });

      return {};
    } catch (error: any) {
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};