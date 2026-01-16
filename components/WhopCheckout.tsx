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

      // Timeout after 10 seconds (increased for slower connections)
      setTimeout(() => {
        clearInterval(checkInterval);
        if (window.whopCheckoutLoader?.scan) {
          resolve();
        } else {
          // Don't reject, just resolve - script might load later
          console.warn('Whop checkout script taking longer than expected to load');
          resolve();
        }
      }, 10000);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src="https://js.whop.com/static/checkout/loader.js"]');
    if (existingScript) {
      window.whopCheckoutScriptLoaded = true;
      // Wait for it to load
      const loadHandler = () => {
        existingScript.removeEventListener('load', loadHandler);
        resolve();
      };
      const errorHandler = () => {
        existingScript.removeEventListener('error', errorHandler);
        // Don't reject, just resolve and let retry mechanism handle it
        console.warn('Existing Whop checkout script had error, will retry');
        resolve();
      };
      existingScript.addEventListener('load', loadHandler);
      existingScript.addEventListener('error', errorHandler);
      
      // If script is already loaded, resolve immediately
      if (window.whopCheckoutLoader?.scan) {
        existingScript.removeEventListener('load', loadHandler);
        existingScript.removeEventListener('error', errorHandler);
        resolve();
      }
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
      // Don't reject immediately, might be a temporary network issue
      // The retry mechanism will handle it
      console.warn('Whop checkout script failed to load, will retry');
      resolve(); // Resolve anyway so we can retry later
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

        // Wait for DOM element to be ready - longer wait for modal animations
        await new Promise(resolve => setTimeout(resolve, 500));

        if (!mounted || !containerRef.current) return;

        // Clear any existing content completely
        if (containerRef.current) {
          // Remove all children
          while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
          }
          
          // Remove all attributes
          const attrs = containerRef.current.attributes;
          while (attrs.length > 0) {
            containerRef.current.removeAttribute(attrs[0].name);
          }
          
          // Re-add the class and data attributes fresh
          containerRef.current.className = 'whop-checkout-embed';
          containerRef.current.setAttribute('data-whop-checkout-plan-id', planId);
          containerRef.current.setAttribute('data-whop-checkout-theme', theme);
          containerRef.current.setAttribute('data-whop-checkout-theme-accent-color', accentColor);
        }

        // Wait a bit more to ensure container is fully ready
        await new Promise(resolve => setTimeout(resolve, 200));

        // Scan for checkout embeds - call multiple times with delays
        if (window.whopCheckoutLoader?.scan) {
          // First scan
          window.whopCheckoutLoader.scan();
          hasScannedRef.current = true;
          
          // Second scan after delay
          setTimeout(() => {
            if (mounted && window.whopCheckoutLoader?.scan && containerRef.current) {
              window.whopCheckoutLoader.scan();
            }
          }, 500);
          
          // Third scan to be safe
          setTimeout(() => {
            if (mounted && window.whopCheckoutLoader?.scan && containerRef.current) {
              window.whopCheckoutLoader.scan();
            }
          }, 1000);
          
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

  const uniqueId = useRef(`whop-checkout-${Date.now()}-${Math.random()}`);

  return (
    <div 
      ref={containerRef}
      id={uniqueId.current}
      className="whop-checkout-embed"
      data-whop-checkout-plan-id={planId}
      data-whop-checkout-theme={theme}
      data-whop-checkout-theme-accent-color={accentColor}
    />
  );
}

