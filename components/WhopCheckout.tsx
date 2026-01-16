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

  // Listen for checkout completion events
  useEffect(() => {
    if (!onComplete) return;
    
    let messageHandler: ((event: MessageEvent) => void) | null = null;
    let hasCompleted = false;
    
    messageHandler = (event: MessageEvent) => {
      // Prevent duplicate calls
      if (hasCompleted) return;
      
      // Check if message is from Whop checkout
      if (event.data && typeof event.data === 'object') {
        const data = event.data;
        
        // Multiple ways Whop checkout can signal completion
        const isComplete = 
          data.type === 'whop-checkout-complete' || 
          data.event === 'checkout.completed' ||
          data.whopCheckoutComplete === true ||
          data.status === 'completed' ||
          (data.type === 'whop' && data.action === 'checkout-complete') ||
          (typeof data === 'string' && data.includes('checkout-complete'));
        
        if (isComplete) {
          hasCompleted = true;
          console.log('Checkout completed! Incrementing RSVP count...');
          onComplete();
        }
      }
      
      // Also check for success indicators in the DOM
      // Whop checkout might add success classes or elements
      if (containerRef.current) {
        const successIndicator = containerRef.current.querySelector(
          '[class*="success"], [class*="complete"], [data-success]'
        );
        if (successIndicator && !hasCompleted) {
          hasCompleted = true;
          console.log('Checkout completed (DOM detected)! Incrementing RSVP count...');
          onComplete();
        }
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Also poll for completion indicators in case message events don't fire
    const completionPoll = setInterval(() => {
      if (hasCompleted || !containerRef.current || !onComplete) {
        clearInterval(completionPoll);
        return;
      }
      
      // Look for Whop checkout success indicators
      const successElements = containerRef.current.querySelectorAll(
        '[class*="success"], [class*="complete"], [class*="thank"], [data-status="completed"]'
      );
      
      // Also check if we can find a "thank you" or "success" message
      const text = containerRef.current.textContent || '';
      const hasSuccessText = /thank|success|complete|confirmation/i.test(text);
      
      if ((successElements.length > 0 || hasSuccessText) && containerRef.current.children.length > 0) {
        hasCompleted = true;
        console.log('Checkout completed (poll detected)! Incrementing RSVP count...');
        clearInterval(completionPoll);
        onComplete();
      }
    }, 2000); // Check every 2 seconds
    
    return () => {
      if (messageHandler) {
        window.removeEventListener('message', messageHandler);
      }
      clearInterval(completionPoll);
    };
  }, [onComplete]);

  // Set up checkout when visible - only initialize once, never clear once loaded
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    
    let mounted = true;
    let hasLoaded = false;
    let retryInterval: NodeJS.Timeout | null = null;
    let cleanupTimeouts: NodeJS.Timeout[] = [];
    
    const clearAllTimeouts = () => {
      cleanupTimeouts.forEach(timeout => clearTimeout(timeout));
      cleanupTimeouts = [];
      if (retryInterval) {
        clearInterval(retryInterval);
        retryInterval = null;
      }
    };
    
    const checkIfContentLoaded = (): boolean => {
      if (!containerRef.current) return false;
      return containerRef.current.children.length > 0 || 
             containerRef.current.querySelector('iframe') !== null ||
             containerRef.current.querySelector('form') !== null ||
             containerRef.current.querySelector('input') !== null ||
             containerRef.current.querySelector('button') !== null;
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
      
      // Check if content already loaded - if so, don't do anything!
      if (checkIfContentLoaded()) {
        hasLoaded = true;
        return;
      }
      
      // Set up container attributes only if not already set
      if (!containerRef.current.hasAttribute('data-whop-checkout-plan-id')) {
        containerRef.current.className = 'whop-checkout-embed pointer-events-auto';
        containerRef.current.setAttribute('data-whop-checkout-plan-id', planId);
        containerRef.current.setAttribute('data-whop-checkout-theme', theme);
        containerRef.current.setAttribute('data-whop-checkout-theme-accent-color', accentColor);
      }
      
      // Wait for modal animation
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (!mounted || !containerRef.current || hasLoaded) return;
      
      // Load script if needed
      try {
        await loadWhopCheckoutScript();
      } catch (error) {
        console.warn('Script load warning:', error);
      }
      
      if (!mounted || !containerRef.current || hasLoaded) return;
      
      // Initial scan
      if (window.whopCheckoutLoader?.scan) {
        window.whopCheckoutLoader.scan();
        
        // Retry scans - but stop immediately if content loads
        const scanDelays = [300, 600, 1000];
        scanDelays.forEach(delay => {
          const timeout = setTimeout(() => {
            if (!mounted || hasLoaded) {
              return;
            }
            
            // Check if content loaded - if yes, stop ALL retries immediately
            if (checkIfContentLoaded()) {
              hasLoaded = true;
              clearAllTimeouts();
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
      
      // Fallback retry interval - but stops immediately when content loads
      retryInterval = setInterval(() => {
        if (!mounted || hasLoaded || !containerRef.current || !window.whopCheckoutLoader?.scan) {
          if (hasLoaded && retryInterval) {
            clearInterval(retryInterval);
            retryInterval = null;
          }
          return;
        }
        
        // Check if content loaded - if yes, stop immediately
        if (checkIfContentLoaded()) {
          hasLoaded = true;
          clearAllTimeouts();
          return;
        }
        
        // Only scan if content hasn't loaded
        if (!hasLoaded) {
          window.whopCheckoutLoader.scan();
        }
      }, 1000);
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

