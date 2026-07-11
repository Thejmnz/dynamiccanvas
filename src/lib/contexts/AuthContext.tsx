"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { type User, type Session, type AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let isMounted = true;
        const initializationTimeout = window.setTimeout(() => {
            if (!isMounted) return;

            console.warn("Supabase auth initialization timed out");
            setLoading(false);
        }, 5000);

        // Supabase emits INITIAL_SESSION immediately after subscribing. Using
        // that single source avoids competing session locks during hydration.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            if (!isMounted) return;

            window.clearTimeout(initializationTimeout);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            isMounted = false;
            window.clearTimeout(initializationTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        } catch (error) {
            console.error('Error signing in (email/password):', error);
            throw error; // Re-throw to allow UI to handle
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
        } catch (error) {
            console.error('Error signing up:', error);
            throw error; // Re-throw to allow UI to handle
        }
    };

    const signInWithGoogle = async () => {
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: typeof window !== 'undefined'
                        ? `${window.location.origin}/auth/callback`
                        : undefined,
                },
            });
        } catch (error) {
            console.error('Error signing in with Google (Supabase):', error);
        }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out (Supabase):', error);
        }
        window.location.href = '/sign-in';
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signIn, signUp, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
