import { useEffect, useRef } from 'react';

interface WhopCheckoutProps {
  planId?: string;
  theme?: 'light' | 'dark' | 'system';
  accentColor?: string;
}

declare global {
  interface Window {
    whopCheckoutLoader?: { scan?: () => void };
  }
}

export function WhopCheckout({ 
  planId = 'plan_6qlhHFelOu6cx',
  theme = 'system',
  accentColor = 'orange'
}: WhopCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Whop checkout script
    const script = document.createElement('script');
    script.src = 'https://js.whop.com/static/checkout/loader.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.whopCheckoutLoader?.scan?.();
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="whop-checkout-embed"
      data-whop-checkout-plan-id={planId}
      data-whop-checkout-theme={theme}
      data-whop-checkout-theme-accent-color={accentColor}
    />
  );
}

