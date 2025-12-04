/**
 * Responsive Testing Helper Script
 * 
 * This script helps automate responsive testing by simulating
 * different viewport sizes and checking breakpoint behavior.
 */

class ResponsiveTestHelper {
  constructor() {
    this.breakpoints = {
      mobile: { width: 375, height: 667, name: 'Mobile (iPhone SE)' },
      mobileLarge: { width: 414, height: 896, name: 'Mobile Large (iPhone 11)' },
      tablet: { width: 768, height: 1024, name: 'Tablet (iPad)' },
      tabletLarge: { width: 1024, height: 1366, name: 'Tablet Large (iPad Pro)' },
      laptop: { width: 1366, height: 768, name: 'Laptop' },
      desktop: { width: 1920, height: 1080, name: 'Desktop (Full HD)' },
      desktopLarge: { width: 2560, height: 1440, name: 'Desktop Large (2K)' }
    };
    this.results = {};
  }

  /**
   * Set viewport size
   */
  setViewport(width, height) {
    // Note: This only works in responsive design mode or with browser automation
    console.log(`📱 Setting viewport to ${width}x${height}`);
    
    // For manual testing, log the size
    console.log(`Current viewport: ${window.innerWidth}x${window.innerHeight}`);
    console.log(`Please resize your browser to ${width}x${height} or use DevTools responsive mode`);
  }

  /**
   * Check current breakpoint
   */
  getCurrentBreakpoint() {
    const width = window.innerWidth;
    
    if (width < 640) return 'mobile';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    if (width < 1536) return 'xl';
    return '2xl';
  }

  /**
   * Test breakpoint transitions
   */
  testBreakpointTransitions() {
    console.log('🔄 Testing breakpoint transitions...');
    console.log(`Current breakpoint: ${this.getCurrentBreakpoint()}`);
    console.log(`Viewport: ${window.innerWidth}x${window.innerHeight}`);
    
    // Check for layout shifts
    let clsScore = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      }
    });
    observer.observe({ entryTypes: ['layout-shift'] });
    
    // Log current layout
    this.logLayoutInfo();
    
    return {
      breakpoint: this.getCurrentBreakpoint(),
      viewport: { width: window.innerWidth, height: window.innerHeight },
      clsScore
    };
  }

  /**
   * Log layout information
   */
  logLayoutInfo() {
    console.log('\n📐 Layout Information:');
    
    // Check hero section
    const hero = document.querySelector('[class*="hero"]') || document.querySelector('section:first-of-type');
    if (hero) {
      console.log('Hero Section:', {
        height: hero.offsetHeight,
        padding: window.getComputedStyle(hero).padding
      });
    }
    
    // Check feature cards
    const cards = document.querySelectorAll('[class*="card"]');
    if (cards.length > 0) {
      console.log(`Feature Cards: ${cards.length} found`);
      console.log('Card Layout:', {
        display: window.getComputedStyle(cards[0].parentElement).display,
        gridColumns: window.getComputedStyle(cards[0].parentElement).gridTemplateColumns
      });
    }
    
    // Check spacing
    const sections = document.querySelectorAll('section');
    if (sections.length > 1) {
      const spacing = sections[1].offsetTop - (sections[0].offsetTop + sections[0].offsetHeight);
      console.log(`Section Spacing: ${spacing}px`);
    }
  }

  /**
   * Test touch interactions
   */
  testTouchInteractions() {
    console.log('👆 Testing touch interactions...');
    
    // Check touch target sizes
    const buttons = document.querySelectorAll('button, a[href]');
    const smallTargets = [];
    
    buttons.forEach((button, index) => {
      const rect = button.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      
      if (size < 44) {
        smallTargets.push({
          element: button.tagName,
          size: `${rect.width.toFixed(0)}x${rect.height.toFixed(0)}`,
          text: button.textContent.trim().substring(0, 30)
        });
      }
    });
    
    if (smallTargets.length > 0) {
      console.warn(`⚠️ Found ${smallTargets.length} touch targets smaller than 44x44px:`);
      console.table(smallTargets);
    } else {
      console.log('✅ All touch targets meet minimum size requirements (44x44px)');
    }
    
    return {
      totalTargets: buttons.length,
      smallTargets: smallTargets.length,
      details: smallTargets
    };
  }

  /**
   * Test image loading
   */
  testImageLoading() {
    console.log('🖼️ Testing image loading...');
    
    const images = document.querySelectorAll('img');
    const imageInfo = [];
    
    images.forEach((img, index) => {
      const info = {
        index,
        src: img.currentSrc || img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        displayWidth: img.width,
        displayHeight: img.height,
        loading: img.loading,
        hasSrcset: !!img.srcset,
        loaded: img.complete
      };
      
      imageInfo.push(info);
      
      // Check if image is appropriately sized
      const oversized = img.naturalWidth > img.width * 2;
      if (oversized) {
        console.warn(`⚠️ Image ${index} may be oversized:`, info);
      }
    });
    
    console.log(`Found ${images.length} images`);
    console.table(imageInfo);
    
    return imageInfo;
  }

  /**
   * Test parallax behavior
   */
  testParallaxBehavior() {
    console.log('🎢 Testing parallax behavior...');
    
    const breakpoint = this.getCurrentBreakpoint();
    const shouldHaveParallax = breakpoint !== 'mobile' && breakpoint !== 'sm';
    
    // Check for parallax elements
    const parallaxElements = document.querySelectorAll('[style*="transform"]');
    
    console.log(`Current breakpoint: ${breakpoint}`);
    console.log(`Should have parallax: ${shouldHaveParallax}`);
    console.log(`Parallax elements found: ${parallaxElements.length}`);
    
    if (shouldHaveParallax && parallaxElements.length === 0) {
      console.warn('⚠️ Expected parallax effects but none found');
    } else if (!shouldHaveParallax && parallaxElements.length > 0) {
      console.warn('⚠️ Parallax effects found on mobile (should be disabled)');
    } else {
      console.log('✅ Parallax behavior is correct for this breakpoint');
    }
    
    return {
      breakpoint,
      shouldHaveParallax,
      parallaxElementsFound: parallaxElements.length
    };
  }

  /**
   * Test horizontal scrolling
   */
  testHorizontalScroll() {
    console.log('↔️ Testing for horizontal scroll...');
    
    const bodyWidth = document.body.scrollWidth;
    const viewportWidth = window.innerWidth;
    const hasHorizontalScroll = bodyWidth > viewportWidth;
    
    if (hasHorizontalScroll) {
      console.error(`❌ Horizontal scroll detected! Body width: ${bodyWidth}px, Viewport: ${viewportWidth}px`);
      
      // Find elements causing overflow
      const elements = document.querySelectorAll('*');
      const overflowing = [];
      
      elements.forEach(el => {
        if (el.scrollWidth > viewportWidth) {
          overflowing.push({
            tag: el.tagName,
            class: el.className,
            width: el.scrollWidth
          });
        }
      });
      
      console.log('Elements causing overflow:');
      console.table(overflowing.slice(0, 10));
    } else {
      console.log('✅ No horizontal scroll detected');
    }
    
    return {
      hasHorizontalScroll,
      bodyWidth,
      viewportWidth
    };
  }

  /**
   * Test text readability
   */
  testTextReadability() {
    console.log('📖 Testing text readability...');
    
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button');
    const issues = [];
    
    textElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      const fontSize = parseFloat(styles.fontSize);
      const lineHeight = parseFloat(styles.lineHeight);
      
      // Check minimum font size (14px for body text, 12px for small text)
      if (fontSize < 14 && !el.classList.contains('text-xs')) {
        issues.push({
          element: el.tagName,
          issue: 'Font too small',
          fontSize: `${fontSize}px`,
          text: el.textContent.trim().substring(0, 30)
        });
      }
      
      // Check line height (should be at least 1.5 for body text)
      if (lineHeight / fontSize < 1.4 && el.tagName === 'P') {
        issues.push({
          element: el.tagName,
          issue: 'Line height too small',
          lineHeight: (lineHeight / fontSize).toFixed(2),
          text: el.textContent.trim().substring(0, 30)
        });
      }
    });
    
    if (issues.length > 0) {
      console.warn(`⚠️ Found ${issues.length} readability issues:`);
      console.table(issues);
    } else {
      console.log('✅ Text readability is good');
    }
    
    return issues;
  }

  /**
   * Run all responsive tests
   */
  async runAllTests() {
    console.log('🧪 Running all responsive tests...\n');
    
    const results = {
      timestamp: new Date().toISOString(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      breakpoint: this.getCurrentBreakpoint(),
      tests: {}
    };
    
    // Run tests
    results.tests.breakpointTransitions = this.testBreakpointTransitions();
    results.tests.touchInteractions = this.testTouchInteractions();
    results.tests.imageLoading = this.testImageLoading();
    results.tests.parallaxBehavior = this.testParallaxBehavior();
    results.tests.horizontalScroll = this.testHorizontalScroll();
    results.tests.textReadability = this.testTextReadability();
    
    console.log('\n✅ All responsive tests completed!');
    console.log('📊 Results:', results);
    
    this.results = results;
    return results;
  }

  /**
   * Test all breakpoints
   */
  testAllBreakpoints() {
    console.log('📱 Testing all breakpoints...');
    console.log('Please manually resize your browser or use DevTools responsive mode to test each breakpoint:\n');
    
    Object.entries(this.breakpoints).forEach(([key, bp]) => {
      console.log(`${bp.name}: ${bp.width}x${bp.height}`);
    });
    
    console.log('\nAfter resizing to each breakpoint, run:');
    console.log('responsiveTestHelper.runAllTests()');
  }

  /**
   * Export results
   */
  exportResults() {
    console.log('📥 Exporting results...');
    console.log(JSON.stringify(this.results, null, 2));
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(this.results, null, 2));
      console.log('✅ Results copied to clipboard!');
    }
    
    return this.results;
  }
}

// Create global instance
window.responsiveTestHelper = new ResponsiveTestHelper();

console.log('✅ Responsive Test Helper loaded!');
console.log('📖 Usage:');
console.log('  - responsiveTestHelper.runAllTests() - Run all tests at current viewport');
console.log('  - responsiveTestHelper.testAllBreakpoints() - Show all breakpoints to test');
console.log('  - responsiveTestHelper.testTouchInteractions() - Check touch target sizes');
console.log('  - responsiveTestHelper.testImageLoading() - Check image optimization');
console.log('  - responsiveTestHelper.testParallaxBehavior() - Check parallax at breakpoint');
console.log('  - responsiveTestHelper.testHorizontalScroll() - Check for overflow');
console.log('  - responsiveTestHelper.exportResults() - Export test results');
