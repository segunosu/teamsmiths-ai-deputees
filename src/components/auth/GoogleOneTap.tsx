import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Lightweight Google One Tap integration.
// It will auto-initialize if a Google Client ID is available via either:
// 1) window.GOOGLE_CLIENT_ID (set in index.html before main script), or
// 2) <meta name="google-client-id" content="YOUR_CLIENT_ID"> in index.html
// If neither is present, it no-ops gracefully.

declare global {
  interface Window {
    google?: any;
    GOOGLE_CLIENT_ID?: string;
  }
}

const loadScript = (src: string, id: string) =>
  new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.id = id;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });

export default function GoogleOneTap() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const clientId =
      window.GOOGLE_CLIENT_ID ||
      document.querySelector<HTMLMetaElement>('meta[name="google-client-id"]')?.content;

    if (!clientId) return; // No client ID configured — safely skip
    
    // Only show One Tap on production domain
    if (!window.location.origin.includes('teamsmiths.ai')) return;

    let cancelled = false;

    const init = async () => {
      try {
        await loadScript("https://accounts.google.com/gsi/client", "google-gsi-client");
        if (cancelled || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            try {
              const idToken = response?.credential;
              if (!idToken) return;

              const { data, error } = await supabase.auth.signInWithIdToken({
                provider: "google",
                token: idToken,
              });

              if (error) {
                toast({ title: "One Tap failed", description: error.message, variant: "destructive" });
                return;
              }

              // Successful login — go home
              navigate("/");
            } catch (e: any) {
              toast({ title: "One Tap error", description: e?.message ?? "Unexpected error", variant: "destructive" });
            }
          },
          auto_select: true,
          cancel_on_tap_outside: false,
          context: "signin",
        });

        // Show the One Tap prompt
        window.google.accounts.id.prompt();
      } catch (e) {
        // Silently ignore script loading errors
        console.warn("Google One Tap failed to load", e);
      }
    };

    init();

    return () => {
      cancelled = true;
      try {
        window.google?.accounts?.id?.cancel();
      } catch {}
    };
  }, [navigate, toast]);

  return null;
}
