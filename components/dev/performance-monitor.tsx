'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
}

/**
 * Development-only performance monitor
 * Shows real-time FPS and frame time in the corner of the screen
 * Only renders in development mode
 */
export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    let frameCount = 0;
    let lastTime = performance.now();
    let lastFrameTime = lastTime;
    const frameTimes: number[] = [];
    let animationFrameId: number;

    const measurePerformance = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTime;
      
      frameTimes.push(frameTime);
      if (frameTimes.length > 60) frameTimes.shift();
      
      frameCount++;
      lastFrameTime = currentTime;

      // Update metrics every second
      if (currentTime >= lastTime + 1000) {
        const avgFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        const fps = Math.round(1000 / avgFrameTime);
        
        setMetrics({
          fps,
          frameTime: Math.round(avgFrameTime * 100) / 100,
          memoryUsage: (performance as any).memory?.usedJSHeapSize 
            ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
            : undefined,
        });

        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measurePerformance);
    };

    animationFrameId = requestAnimationFrame(measurePerformance);

    // Toggle visibility with Ctrl+Shift+P
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isVisible) return null;

  const fpsColor = metrics.fps >= 55 ? '#10b981' : metrics.fps >= 45 ? '#f59e0b' : '#ef4444';
  const frameTimeColor = metrics.frameTime <= 16 ? '#10b981' : metrics.frameTime <= 20 ? '#f59e0b' : '#ef4444';

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 9999,
        minWidth: '180px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '13px' }}>
        Performance Monitor
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span>FPS:</span>
        <span style={{ color: fpsColor, fontWeight: 'bold' }}>
          {metrics.fps}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span>Frame Time:</span>
        <span style={{ color: frameTimeColor, fontWeight: 'bold' }}>
          {metrics.frameTime}ms
        </span>
      </div>
      {metrics.memoryUsage !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Memory:</span>
          <span style={{ color: '#8b5cf6' }}>
            {metrics.memoryUsage}MB
          </span>
        </div>
      )}
      <div style={{ 
        marginTop: '8px', 
        paddingTop: '8px', 
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        fontSize: '10px',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}
