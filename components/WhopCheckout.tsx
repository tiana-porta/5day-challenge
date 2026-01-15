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
    let messageHandler: ((event: MessageEvent) => void) | null = null;

    const initializeCheckout = async () => {
      try {
        // Load script (only loads once globally)
        await loadWhopCheckoutScript();

        if (!mounted) return;

        // Wait for DOM element to be ready
        await new Promise(resolve => setTimeout(resolve, 200));

        if (!mounted || !containerRef.current) return;

        // Clear any existing content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          // Re-add the data attributes
          containerRef.current.className = 'whop-checkout-embed';
          containerRef.current.setAttribute('data-whop-checkout-plan-id', planId);
          containerRef.current.setAttribute('data-whop-checkout-theme', theme);
          containerRef.current.setAttribute('data-whop-checkout-theme-accent-color', accentColor);
        }

        // Scan for checkout embeds - call multiple times to ensure it picks up
        if (window.whopCheckoutLoader?.scan) {
          // Call scan immediately
          window.whopCheckoutLoader.scan();
          hasScannedRef.current = true;
          
          // Call scan again after a short delay to ensure it catches the element
          setTimeout(() => {
            if (mounted && window.whopCheckoutLoader?.scan) {
              window.whopCheckoutLoader.scan();
            }
          }, 300);
          
          // Listen for checkout completion events
          if (onComplete) {
            messageHandler = (event: MessageEvent) => {
              // Check if message is from Whop checkout
              if (event.data && typeof event.data === 'object') {
                if (event.data.type === 'whop-checkout-complete' || 
                    event.data.event === 'checkout.completed' ||
                    event.data.whopCheckoutComplete) {
                  onComplete();
                }
              }
            };
            
            window.addEventListener('message', messageHandler);
          }
        }
      } catch (error) {
        console.error('Error loading Whop checkout:', error);
      }
    };

    initializeCheckout();

    // Re-scan if loader becomes available later or if element wasn't found
    const retryInterval = setInterval(() => {
      if (mounted && containerRef.current && window.whopCheckoutLoader?.scan) {
        // Check if checkout has rendered (has children or iframe)
        const hasContent = containerRef.current.children.length > 0 || 
                          containerRef.current.querySelector('iframe');
        
        if (!hasContent) {
          window.whopCheckoutLoader.scan();
        }
      }
    }, 500);

    return () => {
      mounted = false;
      clearInterval(retryInterval);
      if (messageHandler) {
        window.removeEventListener('message', messageHandler);
      }
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

