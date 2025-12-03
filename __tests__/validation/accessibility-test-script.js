/**
 * Accessibility Testing Helper Script
 * 
 * This script helps automate accessibility testing by checking
 * common WCAG compliance issues.
 */

class AccessibilityTestHelper {
  constructor() {
    this.results = {
      errors: [],
      warnings: [],
      passes: []
    };
  }

  /**
   * Check for missing alt text
   */
  checkAltText() {
    console.log('🖼️ Checking image alt text...');
    
    const images = document.querySelectorAll('img');
    const issues = [];
    
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push({
          index,
          src: img.src,
          issue: 'Missing alt text'
        });
      } else if (img.alt === img.src) {
        issues.push({
          index,
          src: img.src,
          issue: 'Alt text is same as src'
        });
      }
    });
    
    if (issues.length > 0) {
      console.error(`❌ Found ${issues.length} images with alt text issues:`);
      console.table(issues);
      this.results.errors.push(...issues);
    } else {
      console.log('✅ All images have proper alt text');
      this.results.passes.push('All images have alt text');
    }
    
    return issues;
  }

  /**
   * Check heading hierarchy
   */
  checkHeadingHierarchy() {
    console.log('📑 Checking heading hierarchy...');
    
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const hierarchy = [];
    const issues = [];
    
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1]);
      hierarchy.push({
        index,
        tag: heading.tagName,
        text: heading.textContent.trim().substring(0, 50)
      });
      
      // Check for skipped levels
      if (level > lastLevel + 1) {
        issues.push({
          index,
          issue: `Skipped from h${lastLevel} to h${level}`,
          text: heading.textContent.trim().substring(0, 50)
        });
      }
      
      lastLevel = level;
    });
    
    console.log('Heading structure:');
    console.table(hierarchy);
    
    if (issues.length > 0) {
      console.warn(`⚠️ Found ${issues.length} heading hierarchy issues:`);
      console.table(issues);
      this.results.warnings.push(...issues);
    } else {
      console.log('✅ Heading hierarchy is correct');
      this.results.passes.push('Heading hierarchy is correct');
    }
    
    return { hierarchy, issues };
  }

  /**
   * Check ARIA attributes
   */
  checkARIA() {
    console.log('🏷️ Checking ARIA attributes...');
    
    const issues = [];
    
    // Check for aria-label on icon buttons
    const iconButtons = document.querySelectorAll('button:not([aria-label])');
    iconButtons.forEach((button, index) => {
      if (button.textContent.trim() === '' || button.querySelector('svg')) {
        issues.push({
          index,
          element: 'button',
          issue: 'Icon button missing aria-label',
          html: button.outerHTML.substring(0, 100)
        });
      }
    });
    
    // Check for proper role usage
    const customRoles = document.querySelectorAll('[role]');
    customRoles.forEach((el, index) => {
      const role = el.getAttribute('role');
      console.log(`Element with role="${role}":`, el.tagName);
    });
    
    if (issues.length > 0) {
      console.warn(`⚠️ Found ${issues.length} ARIA issues:`);
      console.table(issues);
      this.results.warnings.push(...issues);
    } else {
      console.log('✅ ARIA attributes look good');
      this.results.passes.push('ARIA attributes are correct');
    }
    
    return issues;
  }

  /**
   * Check color contrast
   */
  checkColorContrast() {
    console.log('🎨 Checking color contrast...');
    
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span');
    const issues = [];
    
    textElements.forEach((el, index) => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Note: Actual contrast calculation requires a library
      // This is a simplified check
      if (color === backgroundColor) {
        issues.push({
          index,
          element: el.tagName,
          issue: 'Text color same as background',
          text: el.textContent.trim().substring(0, 30)
        });
      }
    });
    
    console.log('⚠️ Note: Use a tool like axe DevTools for accurate contrast checking');
    
    if (issues.length > 0) {
      console.error(`❌ Found ${issues.length} potential contrast issues:`);
      console.table(issues);
      this.results.errors.push(...issues);
    } else {
      console.log('✅ No obvious contrast issues found');
      this.results.passes.push('No obvious contrast issues');
    }
    
    return issues;
  }

  /**
   * Check keyboard navigation
   */
  checkKeyboardNavigation() {
    console.log('⌨️ Checking keyboard navigation...');
    
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    const issues = [];
    
    interactiveElements.forEach((el, index) => {
      const tabindex = el.getAttribute('tabindex');
      
      // Check for positive tabindex (anti-pattern)
      if (tabindex && parseInt(tabindex) > 0) {
        issues.push({
          index,
          element: el.tagName,
          issue: 'Positive tabindex (anti-pattern)',
          tabindex
        });
      }
      
      // Check for missing focus styles
      const styles = window.getComputedStyle(el, ':focus');
      if (styles.outline === 'none' && styles.boxShadow === 'none') {
        issues.push({
          index,
          element: el.tagName,
          issue: 'No visible focus indicator',
          text: el.textContent.trim().substring(0, 30)
        });
      }
    });
    
    console.log(`Found ${interactiveElements.length} interactive elements`);
    
    if (issues.length > 0) {
      console.warn(`⚠️ Found ${issues.length} keyboard navigation issues:`);
      console.table(issues);
      this.results.warnings.push(...issues);
    } else {
      console.log('✅ Keyboard navigation looks good');
      this.results.passes.push('Keyboard navigation is correct');
    }
    
    return issues;
  }

  /**
   * Check reduced motion support
   */
  checkReducedMotion() {
    console.log('🎬 Checking reduced motion support...');
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    console.log(`Prefers reduced motion: ${prefersReducedMotion}`);
    
    // Check for motion context
    const hasMotionContext = !!document.querySelector('[data-motion-context]');
    console.log(`Motion context found: ${hasMotionContext}`);
    
    // Check for animations
    const animatedElements = document.querySelectorAll('[style*="animation"], [style*="transition"], [class*="animate"]');
    console.log(`Animated elements found: ${animatedElements.length}`);
    
    if (prefersReducedMotion && animatedElements.length > 0) {
      console.warn('⚠️ User prefers reduced motion but animations are present');
      console.log('Check if animations are properly disabled via motion context');
      this.results.warnings.push({
        issue: 'Animations present with reduced motion preference',
        count: animatedElements.length
      });
    } else {
      console.log('✅ Reduced motion support looks good');
      this.results.passes.push('Reduced motion support is correct');
    }
    
    return {
      prefersReducedMotion,
      hasMotionContext,
      animatedElementsCount: animatedElements.length
    };
  }

  /**
   * Check semantic HTML
   */
  checkSemanticHTML() {
    console.log('📝 Checking semantic HTML...');
    
    const issues = [];
    
    // Check for main landmark
    const main = document.querySelector('main');
    if (!main) {
      issues.push({ issue: 'Missing <main> landmark' });
    }
    
    // Check for header
    const header = document.querySelector('header');
    if (!header) {
      issues.push({ issue: 'Missing <header> landmark' });
    }
    
    // Check for footer
    const footer = document.querySelector('footer');
    if (!footer) {
      issues.push({ issue: 'Missing <footer> landmark' });
    }
    
    // Check for nav
    const nav = document.querySelector('nav');
    if (!nav) {
      issues.push({ issue: 'Missing <nav> landmark' });
    }
    
    // Check for divs that should be buttons
    const clickableDivs = document.querySelectorAll('div[onclick], div[class*="click"]');
    if (clickableDivs.length > 0) {
      issues.push({
        issue: 'Clickable divs found (should use <button>)',
        count: clickableDivs.length
      });
    }
    
    if (issues.length > 0) {
      console.warn(`⚠️ Found ${issues.length} semantic HTML issues:`);
      console.table(issues);
      this.results.warnings.push(...issues);
    } else {
      console.log('✅ Semantic HTML structure is good');
      this.results.passes.push('Semantic HTML is correct');
    }
    
    return issues;
  }

  /**
   * Check form accessibility
   */
  checkFormAccessibility() {
    console.log('📋 Checking form accessibility...');
    
    const forms = document.querySelectorAll('form');
    const issues = [];
    
    forms.forEach((form, formIndex) => {
      // Check for labels
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach((input, inputIndex) => {
        const id = input.id;
        const label = id ? form.querySelector(`label[for="${id}"]`) : null;
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledby = input.getAttribute('aria-labelledby');
        
        if (!label && !ariaLabel && !ariaLabelledby) {
          issues.push({
            form: formIndex,
            input: inputIndex,
            type: input.type,
            issue: 'Input missing label'
          });
        }
      });
      
      // Check for required fields
      const requiredInputs = form.querySelectorAll('[required]');
      requiredInputs.forEach((input, index) => {
        if (!input.getAttribute('aria-required')) {
          issues.push({
            form: formIndex,
            input: index,
            issue: 'Required input missing aria-required'
          });
        }
      });
    });
    
    if (forms.length === 0) {
      console.log('ℹ️ No forms found on this page');
    } else if (issues.length > 0) {
      console.warn(`⚠️ Found ${issues.length} form accessibility issues:`);
      console.table(issues);
      this.results.warnings.push(...issues);
    } else {
      console.log('✅ Form accessibility is good');
      this.results.passes.push('Form accessibility is correct');
    }
    
    return issues;
  }

  /**
   * Run all accessibility tests
   */
  async runAllTests() {
    console.log('🧪 Running all accessibility tests...\n');
    
    const results = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      tests: {}
    };
    
    // Run tests
    results.tests.altText = this.checkAltText();
    results.tests.headingHierarchy = this.checkHeadingHierarchy();
    results.tests.aria = this.checkARIA();
    results.tests.colorContrast = this.checkColorContrast();
    results.tests.keyboardNavigation = this.checkKeyboardNavigation();
    results.tests.reducedMotion = this.checkReducedMotion();
    results.tests.semanticHTML = this.checkSemanticHTML();
    results.tests.formAccessibility = this.checkFormAccessibility();
    
    // Summary
    console.log('\n📊 Accessibility Test Summary:');
    console.log(`✅ Passes: ${this.results.passes.length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`❌ Errors: ${this.results.errors.length}`);
    
    if (this.results.errors.length === 0 && this.results.warnings.length === 0) {
      console.log('\n🎉 All accessibility tests passed!');
    } else {
      console.log('\n⚠️  Some issues found. Please review and fix.');
    }
    
    console.log('\n💡 Recommended next steps:');
    console.log('  1. Run axe DevTools for comprehensive testing');
    console.log('  2. Test with screen readers (NVDA, JAWS, VoiceOver)');
    console.log('  3. Test keyboard navigation manually');
    console.log('  4. Run WAVE evaluation');
    
    results.summary = {
      passes: this.results.passes.length,
      warnings: this.results.warnings.length,
      errors: this.results.errors.length
    };
    
    this.results.fullResults = results;
    return results;
  }

  /**
   * Export results
   */
  exportResults() {
    console.log('📥 Exporting results...');
    console.log(JSON.stringify(this.results.fullResults, null, 2));
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(this.results.fullResults, null, 2));
      console.log('✅ Results copied to clipboard!');
    }
    
    return this.results.fullResults;
  }
}

// Create global instance
window.accessibilityTestHelper = new AccessibilityTestHelper();

console.log('✅ Accessibility Test Helper loaded!');
console.log('📖 Usage:');
console.log('  - accessibilityTestHelper.runAllTests() - Run all tests');
console.log('  - accessibilityTestHelper.checkAltText() - Check image alt text');
console.log('  - accessibilityTestHelper.checkHeadingHierarchy() - Check heading structure');
console.log('  - accessibilityTestHelper.checkARIA() - Check ARIA attributes');
console.log('  - accessibilityTestHelper.checkKeyboardNavigation() - Check keyboard nav');
console.log('  - accessibilityTestHelper.checkReducedMotion() - Check reduced motion');
console.log('  - accessibilityTestHelper.exportResults() - Export test results');
