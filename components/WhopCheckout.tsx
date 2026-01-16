import { useEffect, useRef } from 'react';

interface WhopCheckoutProps {
  planId?: string;
  theme?: 'light' | 'dark' | 'system';
  accentColor?: string;
  onComplete?: () => void;
  isVisible?: boolean;
  checkoutKey?: number;
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
  onComplete,
  isVisible = true,
  checkoutKey
}: WhopCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    // Don't initialize if not visible
    if (!isVisible) return;
    
    let mounted = true;
    let messageHandler: ((event: MessageEvent) => void) | null = null;

    const initializeCheckout = async () => {
      try {
        // Load script (only loads once globally)
        await loadWhopCheckoutScript();

        if (!mounted) return;

        // Wait for DOM element to be ready - wait for modal animation
        let retries = 0;
        while (retries < 20 && (!containerRef.current || containerRef.current.offsetParent === null)) {
          await new Promise(resolve => setTimeout(resolve, 100));
          retries++;
        }

        if (!mounted || !containerRef.current) return;

        // Ensure container is visible
        if (containerRef.current.offsetParent === null) {
          console.warn('Checkout container not visible yet');
        }

        // Clear any existing content completely
        if (containerRef.current) {
          // Remove all children
          while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
          }
          
          // Remove all attributes
          const attrs = Array.from(containerRef.current.attributes);
          attrs.forEach(attr => {
            containerRef.current?.removeAttribute(attr.name);
          });
          
          // Re-add the class and data attributes fresh
          containerRef.current.className = 'whop-checkout-embed';
          containerRef.current.setAttribute('data-whop-checkout-plan-id', planId);
          containerRef.current.setAttribute('data-whop-checkout-theme', theme);
          containerRef.current.setAttribute('data-whop-checkout-theme-accent-color', accentColor);
        }

        // Wait for modal animation to complete
        await new Promise(resolve => setTimeout(resolve, 600));

        // Scan for checkout embeds - call multiple times with delays
        if (window.whopCheckoutLoader?.scan) {
          // Force immediate scan
          window.whopCheckoutLoader.scan();
          hasScannedRef.current = true;
          
          // Multiple scans at intervals
          const scanDelays = [300, 600, 1000, 1500];
          scanDelays.forEach(delay => {
            setTimeout(() => {
              if (mounted && window.whopCheckoutLoader?.scan && containerRef.current && containerRef.current.offsetParent !== null) {
                // Force rescan
                window.whopCheckoutLoader.scan();
              }
            }, delay);
          });
          
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
    // BUT only if content hasn't loaded yet
    const retryInterval = setInterval(() => {
      if (!mounted || !containerRef.current || !window.whopCheckoutLoader?.scan) return;
      
      // Check if checkout has rendered (has children, iframe, form, or input)
      const hasContent = containerRef.current.children.length > 0 || 
                        containerRef.current.querySelector('iframe') ||
                        containerRef.current.querySelector('form') ||
                        containerRef.current.querySelector('input');
      
      // Only scan if content hasn't loaded - never clear if it has!
      if (!hasContent) {
        window.whopCheckoutLoader.scan();
      } else {
        // Content loaded, stop retrying
        clearInterval(retryInterval);
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
  }, [planId, theme, accentColor, onComplete, isVisible]);

  // When visibility changes, set up checkout and scan
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    
    let mounted = true;
    let hasLoaded = false;
    let cleanupTimeouts: NodeJS.Timeout[] = [];
    
    const clearAllTimeouts = () => {
      cleanupTimeouts.forEach(timeout => clearTimeout(timeout));
      cleanupTimeouts = [];
    };
    
    const checkIfContentLoaded = (): boolean => {
      if (!containerRef.current) return false;
      return containerRef.current.children.length > 0 || 
             containerRef.current.querySelector('iframe') !== null ||
             containerRef.current.querySelector('form') !== null ||
             containerRef.current.querySelector('input') !== null;
    };
    
    const setupAndScan = async () => {
      // Remove OTHER checkout elements (not this one)
      const allCheckouts = document.querySelectorAll('.whop-checkout-embed, [data-whop-checkout-plan-id]');
      allCheckouts.forEach(el => {
        if (el !== containerRef.current && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      
      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!mounted || !containerRef.current) return;
      
      // Set up container attributes
      if (!containerRef.current.hasAttribute('data-whop-checkout-plan-id')) {
        containerRef.current.className = 'whop-checkout-embed pointer-events-auto';
        containerRef.current.setAttribute('data-whop-checkout-plan-id', planId);
        containerRef.current.setAttribute('data-whop-checkout-theme', theme);
        containerRef.current.setAttribute('data-whop-checkout-theme-accent-color', accentColor);
      }
      
      // Wait for modal animation
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (!mounted || !containerRef.current) return;
      
      // Load script if needed
      try {
        await loadWhopCheckoutScript();
      } catch (error) {
        console.warn('Script load warning:', error);
      }
      
      // Initial scan
      if (window.whopCheckoutLoader?.scan && mounted) {
        window.whopCheckoutLoader.scan();
        
        // Retry scans - but stop if content loads
        const scanDelays = [300, 600, 1000, 1500];
        scanDelays.forEach(delay => {
          const timeout = setTimeout(() => {
            if (!mounted) return;
            
            // Check if content loaded - if yes, stop retrying
            if (checkIfContentLoaded()) {
              hasLoaded = true;
              return;
            }
            
            // Only scan if content hasn't loaded yet
            if (window.whopCheckoutLoader?.scan && containerRef.current && !hasLoaded) {
              window.whopCheckoutLoader.scan();
            }
          }, delay);
          cleanupTimeouts.push(timeout);
        });
      }
    };
    
    setupAndScan();
    
    return () => {
      mounted = false;
      hasLoaded = false;
      clearAllTimeouts();
    };
  }, [isVisible, planId, theme, accentColor, checkoutKey]);

  const uniqueId = useRef(`whop-checkout-${Date.now()}-${Math.random()}`);

  return (
    <div 
      ref={containerRef}
      id={uniqueId.current}
      className="whop-checkout-embed pointer-events-auto"
      data-whop-checkout-plan-id={planId}
      data-whop-checkout-theme={theme}
      data-whop-checkout-theme-accent-color={accentColor}
      style={{ pointerEvents: 'auto' }}
    />
  );
}

