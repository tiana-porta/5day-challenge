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

  // When visibility changes, completely reset and rescan with aggressive retry
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
      const hasContent = containerRef.current.children.length > 0 || 
                        containerRef.current.querySelector('iframe') ||
                        containerRef.current.querySelector('form') ||
                        containerRef.current.querySelector('input') ||
                        containerRef.current.innerHTML.trim() !== '';
      return hasContent;
    };
    
    const resetAndRescan = async () => {
      // Check if content is already loaded - if so, don't clear it!
      if (checkIfContentLoaded()) {
        hasLoaded = true;
        return;
      }
      
      // Remove ALL Whop checkout elements from the page first (except our container)
      const allCheckouts = document.querySelectorAll('.whop-checkout-embed, [data-whop-checkout-plan-id], [id*="whop-checkout"]');
      allCheckouts.forEach(el => {
        if (el !== containerRef.current && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
      
      // Only clear if content hasn't loaded yet
      if (containerRef.current && mounted && !hasLoaded) {
        // Remove all children
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        
        // Remove all attributes except ref
        const attrs = Array.from(containerRef.current.attributes);
        attrs.forEach(attr => {
          if (attr.name !== 'ref') {
            containerRef.current?.removeAttribute(attr.name);
          }
        });
      }
      
      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (!mounted || !containerRef.current || hasLoaded) return;
      
      // Re-setup container
      containerRef.current.className = 'whop-checkout-embed';
      containerRef.current.setAttribute('data-whop-checkout-plan-id', planId);
      containerRef.current.setAttribute('data-whop-checkout-theme', theme);
      containerRef.current.setAttribute('data-whop-checkout-theme-accent-color', accentColor);
      
      // Wait for modal animation and DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (!mounted || !containerRef.current || hasLoaded) return;
      
      // Ensure container is visible
      if (containerRef.current.offsetParent === null) {
        // Container not visible yet, wait more
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (!mounted || !containerRef.current || hasLoaded) return;
      
      // Load script first if not already loaded
      try {
        await loadWhopCheckoutScript();
      } catch (error) {
        console.warn('Script load warning:', error);
      }
      
      // Force multiple scans with increasing delays - but stop if content loads
      if (window.whopCheckoutLoader?.scan && !hasLoaded) {
        // Scan immediately
        window.whopCheckoutLoader.scan();
        
        // Retry scans at increasing intervals - but only if content hasn't loaded
        const scanDelays = [200, 400, 600, 1000, 1500, 2000, 3000];
        scanDelays.forEach(delay => {
          const timeout = setTimeout(() => {
            if (!mounted || hasLoaded) return;
            
            if (window.whopCheckoutLoader?.scan && containerRef.current) {
              // Check if content has loaded - if yes, stop all retries
              if (checkIfContentLoaded()) {
                hasLoaded = true;
                clearAllTimeouts();
                return;
              }
              
              // Only scan if content hasn't loaded
              if (!hasLoaded) {
                window.whopCheckoutLoader.scan();
              }
            }
          }, delay);
          cleanupTimeouts.push(timeout);
        });
      }
      
      // Final retry after longer delay if still no content - but check first!
      const finalTimeout = setTimeout(() => {
        if (!mounted || hasLoaded) return;
        
        if (containerRef.current && window.whopCheckoutLoader?.scan) {
          // Check if content has loaded before clearing
          if (checkIfContentLoaded()) {
            hasLoaded = true;
            clearAllTimeouts();
            return;
          }
          
          // Only clear if content still hasn't loaded
          if (!hasLoaded && containerRef.current) {
            console.log('Final retry: forcing checkout reload');
            // Last resort: clear and rescan
            containerRef.current.innerHTML = '';
            containerRef.current.setAttribute('data-whop-checkout-plan-id', planId);
            containerRef.current.setAttribute('data-whop-checkout-theme', theme);
            containerRef.current.setAttribute('data-whop-checkout-theme-accent-color', accentColor);
            window.whopCheckoutLoader.scan();
          }
        }
      }, 4000);
      cleanupTimeouts.push(finalTimeout);
    };
    
    resetAndRescan();
    
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

