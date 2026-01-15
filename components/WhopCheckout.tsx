import { useEffect, useRef } from 'react';

interface WhopCheckoutProps {
  planId?: string;
  theme?: 'light' | 'dark' | 'system';
  accentColor?: string;
  onComplete?: () => void;
}

declare global {
  interface Window {
    whopCheckoutLoader?: { scan?: () => void };
    whopCheckoutScriptLoaded?: boolean;
  }
}

// Load script only once globally
function loadWhopCheckoutScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (window.whopCheckoutLoader?.scan) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    if (window.whopCheckoutScriptLoaded) {
      // Wait for script to load
      const checkInterval = setInterval(() => {
        if (window.whopCheckoutLoader?.scan) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (window.whopCheckoutLoader?.scan) {
          resolve();
        } else {
          reject(new Error('Script load timeout'));
        }
      }, 5000);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src="https://js.whop.com/static/checkout/loader.js"]');
    if (existingScript) {
      window.whopCheckoutScriptLoaded = true;
      // Wait for it to load
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Script load failed')));
      return;
    }

    // Load the script
    window.whopCheckoutScriptLoaded = true;
    const script = document.createElement('script');
    script.src = 'https://js.whop.com/static/checkout/loader.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      window.whopCheckoutScriptLoaded = false;
      reject(new Error('Failed to load Whop checkout script'));
    };

    document.head.appendChild(script);
  });
}

export function WhopCheckout({ 
  planId = 'plan_6qlhHFelOu6cx',
  theme = 'system',
  accentColor = 'orange',
  onComplete
}: WhopCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const initializeCheckout = async () => {
      try {
        // Load script (only loads once globally)
        await loadWhopCheckoutScript();

        if (!mounted) return;

        // Wait a bit for the DOM element to be ready
        await new Promise(resolve => setTimeout(resolve, 100));

        // Scan for checkout embeds
        if (window.whopCheckoutLoader?.scan) {
          window.whopCheckoutLoader.scan();
          hasScannedRef.current = true;
          
          // Listen for checkout completion events
          if (onComplete && containerRef.current) {
            // Whop checkout emits events on the container
            const handleComplete = () => {
              onComplete();
            };
            
            // Listen for messages from Whop checkout iframe
            const messageHandler = (event: MessageEvent) => {
              // Check if message is from Whop checkout
              if (event.data && typeof event.data === 'object') {
                if (event.data.type === 'whop-checkout-complete' || event.data.event === 'checkout.completed') {
                  handleComplete();
                }
              }
            };
            
            window.addEventListener('message', messageHandler);
            
            return () => {
              window.removeEventListener('message', messageHandler);
            };
          }
        }
      } catch (error) {
        console.error('Error loading Whop checkout:', error);
      }
    };

    initializeCheckout();

    // Re-scan if loader becomes available later
    const retryInterval = setInterval(() => {
      if (mounted && containerRef.current && window.whopCheckoutLoader?.scan && !hasScannedRef.current) {
        window.whopCheckoutLoader.scan();
        hasScannedRef.current = true;
      }
    }, 500);

    return () => {
      mounted = false;
      clearInterval(retryInterval);
      hasScannedRef.current = false; // Reset so it can scan again when remounted
    };
  }, [planId, theme, accentColor, onComplete]);

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

