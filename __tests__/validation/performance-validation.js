/**
 * Performance Validation Script
 * Measures FPS during scroll, Lighthouse scores, and animation frame budget
 * Requirements: 1.3, 8.1, 8.3
 */

const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const { URL } = require('url');

// Performance thresholds
const THRESHOLDS = {
  FPS_TARGET: 60,
  FPS_MIN_ACCEPTABLE: 55,
  LCP_TARGET: 2500, // 2.5s in ms
  CLS_TARGET: 0.1,
  FRAME_BUDGET: 16, // 16ms per frame for 60fps
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logResult(label, value, threshold, isLower = true) {
  const passed = isLower ? value <= threshold : value >= threshold;
  const status = passed ? '✓' : '✗';
  const color = passed ? colors.green : colors.red;
  log(`${status} ${label}: ${value} (threshold: ${isLower ? '≤' : '≥'} ${threshold})`, color);
  return passed;
}

async function measureScrollFPS(page) {
  log('\n📊 Measuring Scroll FPS...', colors.blue);
  
  // Inject FPS measurement script
  const fpsData = await page.evaluate(() => {
    return new Promise((resolve) => {
      const frames = [];
      let lastTime = performance.now();
      let frameCount = 0;
      const duration = 3000; // 3 seconds of scrolling
      const startTime = performance.now();

      function measureFrame() {
        const currentTime = performance.now();
        const delta = currentTime - lastTime;
        
        if (delta > 0) {
          const fps = 1000 / delta;
          frames.push(fps);
        }
        
        lastTime = currentTime;
        frameCount++;

        if (currentTime - startTime < duration) {
          requestAnimationFrame(measureFrame);
        } else {
          // Calculate statistics
          const avgFPS = frames.reduce((a, b) => a + b, 0) / frames.length;
          const minFPS = Math.min(...frames);
          const maxFPS = Math.max(...frames);
          const droppedFrames = frames.filter(fps => fps < 55).length;
          
          resolve({
            avgFPS: Math.round(avgFPS * 10) / 10,
            minFPS: Math.round(minFPS * 10) / 10,
            maxFPS: Math.round(maxFPS * 10) / 10,
            droppedFrames,
            totalFrames: frames.length,
            droppedPercentage: Math.round((droppedFrames / frames.length) * 100 * 10) / 10
          });
        }
      }

      // Start scrolling and measuring
      let scrollPosition = 0;
      const scrollInterval = setInterval(() => {
        scrollPosition += 10;
        window.scrollTo(0, scrollPosition);
        
        if (performance.now() - startTime >= duration) {
          clearInterval(scrollInterval);
        }
      }, 16);

      requestAnimationFrame(measureFrame);
    });
  });

  log(`  Average FPS: ${fpsData.avgFPS}`);
  log(`  Min FPS: ${fpsData.minFPS}`);
  log(`  Max FPS: ${fpsData.maxFPS}`);
  log(`  Dropped Frames: ${fpsData.droppedFrames}/${fpsData.totalFrames} (${fpsData.droppedPercentage}%)`);

  const passed = logResult('Scroll FPS', fpsData.avgFPS, THRESHOLDS.FPS_MIN_ACCEPTABLE, false);
  
  return { passed, data: fpsData };
}

async function measureAnimationFrameBudget(page) {
  log('\n⏱️  Measuring Animation Frame Budget...', colors.blue);
  
  const frameBudgetData = await page.evaluate(() => {
    return new Promise((resolve) => {
      const frameTimes = [];
      let lastTime = performance.now();
      const duration = 2000; // 2 seconds
      const startTime = performance.now();

      function measureFrame() {
        const currentTime = performance.now();
        const frameTime = currentTime - lastTime;
        
        if (frameTime > 0) {
          frameTimes.push(frameTime);
        }
        
        lastTime = currentTime;

        if (currentTime - startTime < duration) {
          requestAnimationFrame(measureFrame);
        } else {
          const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          const maxFrameTime = Math.max(...frameTimes);
          const framesOverBudget = frameTimes.filter(t => t > 16).length;
          
          resolve({
            avgFrameTime: Math.round(avgFrameTime * 100) / 100,
            maxFrameTime: Math.round(maxFrameTime * 100) / 100,
            framesOverBudget,
            totalFrames: frameTimes.length,
            overBudgetPercentage: Math.round((framesOverBudget / frameTimes.length) * 100 * 10) / 10
          });
        }
      }

      requestAnimationFrame(measureFrame);
    });
  });

  log(`  Average Frame Time: ${frameBudgetData.avgFrameTime}ms`);
  log(`  Max Frame Time: ${frameBudgetData.maxFrameTime}ms`);
  log(`  Frames Over Budget: ${frameBudgetData.framesOverBudget}/${frameBudgetData.totalFrames} (${frameBudgetData.overBudgetPercentage}%)`);

  const passed = logResult('Avg Frame Time', frameBudgetData.avgFrameTime, THRESHOLDS.FRAME_BUDGET, true);
  
  return { passed, data: frameBudgetData };
}

async function runLighthouseAudit(url, browser) {
  log('\n🔦 Running Lighthouse Audit...', colors.blue);
  
  try {
    const { lhr } = await lighthouse(url, {
      port: new URL(browser.wsEndpoint()).port,
      output: 'json',
      onlyCategories: ['performance'],
      formFactor: 'desktop',
      screenEmulation: {
        mobile: false,
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        disabled: false,
      },
      throttling: {
        rttMs: 40,
        throughputKbps: 10240,
        cpuSlowdownMultiplier: 1,
      },
    });

    const metrics = lhr.audits;
    const lcp = metrics['largest-contentful-paint'].numericValue;
    const cls = metrics['cumulative-layout-shift'].numericValue;
    const fcp = metrics['first-contentful-paint'].numericValue;
    const tbt = metrics['total-blocking-time'].numericValue;
    const si = metrics['speed-index'].numericValue;
    const performanceScore = lhr.categories.performance.score * 100;

    log(`  Performance Score: ${performanceScore}/100`);
    log(`  First Contentful Paint: ${Math.round(fcp)}ms`);
    log(`  Largest Contentful Paint: ${Math.round(lcp)}ms`);
    log(`  Cumulative Layout Shift: ${cls.toFixed(3)}`);
    log(`  Total Blocking Time: ${Math.round(tbt)}ms`);
    log(`  Speed Index: ${Math.round(si)}ms`);

    const lcpPassed = logResult('LCP', Math.round(lcp), THRESHOLDS.LCP_TARGET, true);
    const clsPassed = logResult('CLS', cls, THRESHOLDS.CLS_TARGET, true);

    return {
      passed: lcpPassed && clsPassed,
      data: {
        performanceScore,
        lcp: Math.round(lcp),
        cls,
        fcp: Math.round(fcp),
        tbt: Math.round(tbt),
        si: Math.round(si),
      }
    };
  } catch (error) {
    log(`  Error running Lighthouse: ${error.message}`, colors.red);
    return { passed: false, data: null };
  }
}

async function identifyBottlenecks(page) {
  log('\n🔍 Identifying Performance Bottlenecks...', colors.blue);
  
  const bottlenecks = await page.evaluate(() => {
    const issues = [];
    
    // Check for large images
    const images = Array.from(document.querySelectorAll('img'));
    const largeImages = images.filter(img => {
      const size = img.naturalWidth * img.naturalHeight;
      return size > 2000000; // 2MP
    });
    
    if (largeImages.length > 0) {
      issues.push({
        type: 'Large Images',
        count: largeImages.length,
        recommendation: 'Optimize images using next/image with proper sizing'
      });
    }

    // Check for unoptimized animations
    const animatedElements = Array.from(document.querySelectorAll('[style*="transition"], [class*="animate"]'));
    const expensiveAnimations = animatedElements.filter(el => {
      const style = window.getComputedStyle(el);
      const transition = style.transition || style.animation;
      return transition.includes('width') || transition.includes('height') || transition.includes('top') || transition.includes('left');
    });
    
    if (expensiveAnimations.length > 0) {
      issues.push({
        type: 'Expensive Animations',
        count: expensiveAnimations.length,
        recommendation: 'Use transform and opacity for animations instead of layout properties'
      });
    }

    // Check for excessive DOM nodes
    const domNodeCount = document.querySelectorAll('*').length;
    if (domNodeCount > 1500) {
      issues.push({
        type: 'Excessive DOM Nodes',
        count: domNodeCount,
        recommendation: 'Reduce DOM complexity or implement virtualization'
      });
    }

    // Check for render-blocking resources
    const scripts = Array.from(document.querySelectorAll('script[src]:not([async]):not([defer])'));
    if (scripts.length > 0) {
      issues.push({
        type: 'Render-Blocking Scripts',
        count: scripts.length,
        recommendation: 'Add async or defer attributes to script tags'
      });
    }

    return issues;
  });

  if (bottlenecks.length === 0) {
    log('  ✓ No major bottlenecks detected', colors.green);
  } else {
    log('  Bottlenecks found:', colors.yellow);
    bottlenecks.forEach(issue => {
      log(`    • ${issue.type}: ${issue.count}`, colors.yellow);
      log(`      → ${issue.recommendation}`, colors.reset);
    });
  }

  return bottlenecks;
}

async function runPerformanceValidation(url = 'http://localhost:3000') {
  log('\n🚀 Starting Performance Validation', colors.blue);
  log(`   Target URL: ${url}\n`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to page
    log('Loading page...', colors.blue);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(1000); // Let animations settle

    // Run all performance tests
    const fpsResult = await measureScrollFPS(page);
    const frameBudgetResult = await measureAnimationFrameBudget(page);
    const lighthouseResult = await runLighthouseAudit(url, browser);
    const bottlenecks = await identifyBottlenecks(page);

    // Summary
    log('\n' + '='.repeat(60), colors.blue);
    log('PERFORMANCE VALIDATION SUMMARY', colors.blue);
    log('='.repeat(60), colors.blue);

    const allPassed = fpsResult.passed && frameBudgetResult.passed && lighthouseResult.passed;
    
    if (allPassed) {
      log('\n✓ All performance metrics passed!', colors.green);
    } else {
      log('\n✗ Some performance metrics failed', colors.red);
    }

    log('\nResults:', colors.blue);
    log(`  Scroll FPS: ${fpsResult.passed ? '✓ PASS' : '✗ FAIL'}`, fpsResult.passed ? colors.green : colors.red);
    log(`  Frame Budget: ${frameBudgetResult.passed ? '✓ PASS' : '✗ FAIL'}`, frameBudgetResult.passed ? colors.green : colors.red);
    log(`  Lighthouse Metrics: ${lighthouseResult.passed ? '✓ PASS' : '✗ FAIL'}`, lighthouseResult.passed ? colors.green : colors.red);
    log(`  Bottlenecks: ${bottlenecks.length === 0 ? '✓ None' : `⚠ ${bottlenecks.length} found`}`, bottlenecks.length === 0 ? colors.green : colors.yellow);

    log('\n' + '='.repeat(60) + '\n', colors.blue);

    return {
      success: allPassed,
      results: {
        fps: fpsResult.data,
        frameBudget: frameBudgetResult.data,
        lighthouse: lighthouseResult.data,
        bottlenecks
      }
    };

  } catch (error) {
    log(`\n✗ Error during performance validation: ${error.message}`, colors.red);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const url = process.argv[2] || 'http://localhost:3000';
  
  runPerformanceValidation(url)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runPerformanceValidation };
