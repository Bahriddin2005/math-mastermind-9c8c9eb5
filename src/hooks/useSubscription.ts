import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

// Stripe product IDs
const STRIPE_TIERS = {
  pro: {
    product_id: "prod_TfvzOLBhYojy4e",
  },
  premium: {
    product_id: "prod_Tfvz8P0qtLknhc",
  }
};

export type SubscriptionTier = 'free' | 'pro' | 'premium';

interface SubscriptionStatus {
  subscribed: boolean;
  product_id: string | null;
  subscription_end: string | null;
  tier: SubscriptionTier;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    subscribed: false,
    product_id: null,
    subscription_end: null,
    tier: 'free',
  });
  const [loading, setLoading] = useState(true);

  const getTier = useCallback((productId: string | null): SubscriptionTier => {
    if (!productId) return 'free';
    if (productId === STRIPE_TIERS.premium.product_id) return 'premium';
    if (productId === STRIPE_TIERS.pro.product_id) return 'pro';
    return 'free';
  }, []);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscription({
        subscribed: false,
        product_id: null,
        subscription_end: null,
        tier: 'free',
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;

      const tier = getTier(data?.product_id || null);
      setSubscription({
        subscribed: data?.subscribed || false,
        product_id: data?.product_id || null,
        subscription_end: data?.subscription_end || null,
        tier,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({
        subscribed: false,
        product_id: null,
        subscription_end: null,
        tier: 'free',
      });
    } finally {
      setLoading(false);
    }
  }, [user, getTier]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Check if user has access to a feature
  const hasAccess = useCallback((requiredTier: SubscriptionTier): boolean => {
    const tierOrder: Record<SubscriptionTier, number> = {
      free: 0,
      pro: 1,
      premium: 2,
    };
    return tierOrder[subscription.tier] >= tierOrder[requiredTier];
  }, [subscription.tier]);

  // Check if user has Pro or higher
  const hasPro = useCallback((): boolean => {
    return hasAccess('pro');
  }, [hasAccess]);

  // Check if user has Premium
  const hasPremium = useCallback((): boolean => {
    return hasAccess('premium');
  }, [hasAccess]);

  // Get daily problem limit based on subscription
  const getDailyProblemLimit = useCallback((): number => {
    if (hasPro()) return Infinity; // Cheksiz
    return 20; // Bepul: kunlik 20 ta
  }, [hasPro]);

  // Check if user can solve more problems today
  const canSolveMoreProblems = useCallback(async (todaySolved: number): Promise<boolean> => {
    if (hasPro()) return true; // Pro va Premium uchun cheksiz
    return todaySolved < 20; // Bepul uchun 20 ta limit
  }, [hasPro]);

  return {
    subscription,
    tier: subscription.tier,
    hasAccess,
    hasPro,
    hasPremium,
    loading,
    refresh: checkSubscription,
    getDailyProblemLimit,
    canSolveMoreProblems,
  };
};

