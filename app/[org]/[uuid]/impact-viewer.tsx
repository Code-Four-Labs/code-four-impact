'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ColorBends from '@/app/components/ColorBends';
import { ImpactReportData } from '@/lib/services/gcs-impact.service';
import { getPdfDownloadUrlAction } from './actions';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

// Dynamically import Three.js components (client-side only)
const ReportsWireframe = dynamic(
  () => import('@/app/components/WireframeVisualizations').then(mod => mod.ReportsWireframe),
  { ssr: false, loading: () => <div className="w-full h-full bg-transparent" /> }
);

const TimeWireframe = dynamic(
  () => import('@/app/components/WireframeVisualizations').then(mod => mod.TimeWireframe),
  { ssr: false, loading: () => <div className="w-full h-full bg-transparent" /> }
);

interface ImpactViewerProps {
  data: ImpactReportData;
  hasPdf: boolean;
  org: string;
  uuid: string;
}

function AnimatedCounter({ value, duration = 2, suffix = '' }: { value: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const end = value;
          const increment = end / (duration * 60);
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 1000 / 60);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function getLeaderboardStyles(index: number) {
  if (index === 0) return { item: 'leaderboard-item--gold', rank: 'leaderboard-rank--gold' };
  if (index === 1) return { item: 'leaderboard-item--silver', rank: 'leaderboard-rank--silver' };
  if (index === 2) return { item: 'leaderboard-item--bronze', rank: 'leaderboard-rank--bronze' };
  return { item: 'leaderboard-item--default', rank: 'leaderboard-rank--default' };
}

// Custom hook for one-time animation trigger
// Uses "adjusting state during render" pattern from React docs
// https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
function useOneTimeAnimation(shouldAnimate: boolean) {
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // ✅ Good: Adjust state during rendering (React approved pattern)
  // React will immediately re-render with updated state, avoiding cascading effects
  if (shouldAnimate && !hasAnimated) {
    setHasAnimated(true);
  }
  
  return hasAnimated;
}

// Static section divider line - once animated, stays visible (doesn't re-animate on scroll up)
function SectionDividerLine({ shouldAnimate, position = 'top' }: { shouldAnimate: boolean; position?: 'top' | 'bottom' }) {
  const isVisible = useOneTimeAnimation(shouldAnimate);
  
  return (
    <div 
      className={`absolute ${position === 'top' ? 'top-0' : 'bottom-0'} left-6 right-6 h-[2px] overflow-hidden`}
      style={{ clipPath: 'inset(0 0 0 0)' }}
    >
      <div 
        className="absolute left-1/2 top-0 h-full bg-white/30 transition-all duration-1000 ease-out"
        style={{ 
          width: isVisible ? '100%' : '0%',
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
}

// Animated vertical divider - connects to top/bottom horizontal dividers, spans full section height
function VerticalDivider({ shouldAnimate, delay = 0 }: { shouldAnimate: boolean; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const hasTriggered = useRef(false);
  
  useEffect(() => {
    if (shouldAnimate && !hasTriggered.current) {
      hasTriggered.current = true;
      // Delay vertical line slightly after horizontal lines start
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [shouldAnimate, delay]);
  
  return (
    <div className="w-[2px] self-stretch relative overflow-hidden flex-shrink-0" style={{ marginTop: '-3rem', marginBottom: '-3rem' }}>
      <div 
        className="absolute top-0 left-0 w-full bg-white/30 transition-all duration-1000 ease-out"
        style={{ 
          height: isVisible ? '100%' : '0%',
        }}
      />
    </div>
  );
}

// Fixed header line under navbar - animates in on load
function NavbarLine({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="fixed left-6 right-6 z-40 pointer-events-none h-[2px]" style={{ top: '72px' }}>
      <div 
        className="absolute left-1/2 top-0 h-full bg-white/30 transition-all duration-1000 ease-out"
        style={{ 
          width: isVisible ? '100%' : '0%',
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
}

// Confetti effect for the winner
function triggerConfetti() {
  const colors = ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB', '#32CD32'];
  
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6, x: 0.5 },
    colors: colors,
  });
  
  // Second burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0.3, y: 0.6 },
      colors: colors,
    });
  }, 200);
  
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 0.7, y: 0.6 },
      colors: colors,
    });
  }, 400);
}

// Download Report Button - calls server action to get signed URL and opens in new tab
function DownloadReportButton({ org, uuid }: { org: string; uuid: string }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDownload = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await getPdfDownloadUrlAction(org, uuid);
      
      if (result.success && result.url) {
        // Open PDF in new tab
        window.open(result.url, '_blank', 'noopener,noreferrer');
      } else {
        console.error('[Download] Failed:', result.error);
        // Could show a toast here, but for now just log
      }
    } catch (error) {
      console.error('[Download] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleDownload}
      disabled={isLoading}
      className="text-white/50 hover:text-white text-xs sm:text-sm uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <svg className="animate-spin sm:w-4 sm:h-4" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-4 sm:h-4">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      )}
      {isLoading ? 'Loading...' : 'Download Report'}
    </button>
  );
}

function ReportLocationsMapResponsive({ locations }: { locations: Array<{ lat: number; lon: number; count: number }> }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current || locations.length === 0) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setMapError('Map preview requires configuration');
      return;
    }

    mapboxgl.accessToken = token;

    // Calculate bounds from all location points
    const lats = locations.map(loc => loc.lat);
    const lons = locations.map(loc => loc.lon);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    // Calculate center
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    
    // Calculate span for zoom determination
    const latSpan = maxLat - minLat;
    const lonSpan = maxLon - minLon;
    const maxSpan = Math.max(latSpan, lonSpan);
    
    // Determine zoom level based on data spread
    // If data is tightly clustered (small span), zoom in more
    let initialZoom = 12; // Default for tightly clustered data
    if (maxSpan > 0.1) initialZoom = 11;
    if (maxSpan > 0.2) initialZoom = 10;
    if (maxSpan > 0.5) initialZoom = 9;
    if (maxSpan > 1) initialZoom = 8;
    if (maxSpan > 2) initialZoom = 7;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [centerLon, centerLat],
      zoom: initialZoom,
      interactive: false,
    });

    map.current.on('load', () => {
      if (!map.current) return;
      
      // Fit bounds for precise positioning if we have spread data
      if (locations.length > 1 && maxSpan > 0.001) {
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach(loc => {
          bounds.extend([loc.lon, loc.lat]);
        });
        
        map.current.fitBounds(bounds, {
          padding: { top: 60, bottom: 60, left: 60, right: 60 },
          maxZoom: 14,
          duration: 0
        });
      }

      // Pulsing dot marker - subtle and slow
      const size = 80;
      const pulsingDot = {
        width: size,
        height: size,
        data: new Uint8Array(size * size * 4),
        onAdd: function () {
          const canvas = document.createElement('canvas');
          canvas.width = this.width;
          canvas.height = this.height;
          this.context = canvas.getContext('2d');
        },
        render: function () {
          // Slower pulse (3 seconds instead of 1.5)
          const duration = 3000;
          const t = (performance.now() % duration) / duration;
          // Smaller inner radius
          const radius = (size / 2) * 0.25;
          // Smaller outer expansion (0.4 instead of 0.7)
          const outerRadius = (size / 2) * 0.4 * t + radius;
          const context = this.context;
          if (!context) return false;

          context.clearRect(0, 0, this.width, this.height);

          // Outer pulsing ring - more subtle opacity
          context.beginPath();
          context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
          context.fillStyle = `rgba(0, 75, 156, ${0.4 * (1 - t)})`; // Max 40% opacity instead of 100%
          context.fill();

          // Inner solid dot
          context.beginPath();
          context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
          context.fillStyle = '#004B9C';
          context.strokeStyle = '#0066CC';
          context.lineWidth = 2;
          context.fill();
          context.stroke();

          this.data = new Uint8Array(context.getImageData(0, 0, this.width, this.height).data);
          map.current?.triggerRepaint();
          return true;
        },
        context: null as CanvasRenderingContext2D | null,
      };

      map.current.addImage('pulsing-dot', pulsingDot as mapboxgl.StyleImageInterface, { pixelRatio: 2 });

      const features = locations.map(loc => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [loc.lon, loc.lat]
        },
        properties: {
          count: loc.count
        }
      }));

      map.current.addSource('reports', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        }
      });

      map.current.addLayer({
        id: 'report-points',
        type: 'symbol',
        source: 'reports',
        layout: {
          'icon-image': 'pulsing-dot',
          'icon-allow-overlap': true
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [locations]);

  if (mapError || locations.length === 0) {
    return (
      <div className="w-full h-[280px] sm:h-[350px] lg:h-[400px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        <p className="text-white/40 text-sm">{mapError || 'No location data available'}</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-[280px] sm:h-[350px] lg:h-[400px] rounded-xl overflow-hidden border border-white/10"
      style={{ background: '#0a0a0a' }}
    />
  );
}

export function ImpactViewer({ data, hasPdf, org, uuid }: ImpactViewerProps) {
  const mainContainer = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [colorBendsOpacity, setColorBendsOpacity] = useState(1);
  const [navbarLineVisible, setNavbarLineVisible] = useState(false);
  const confettiTriggered = useRef(false);
  const leaderboardRef = useRef<HTMLDivElement>(null);

  // Animate navbar line on mount
  useEffect(() => {
    const timer = setTimeout(() => setNavbarLineVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Confetti effect for leaderboard winner
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !confettiTriggered.current) {
          confettiTriggered.current = true;
          setTimeout(() => triggerConfetti(), 500);
        }
      },
      { threshold: 0.3 }
    );

    if (leaderboardRef.current) observer.observe(leaderboardRef.current);
    return () => observer.disconnect();
  }, []);

  const report = data.metadata.report;
  // Time saved calculation: 20 minutes per report generated
  const timeSavedMinutes = report.reportsGenerated * 20;
  const timeSavedHours = Math.round(timeSavedMinutes / 60);
  const avgReportsPerOfficer = Math.round(report.reportsGenerated / report.activeUsers);

  useGSAP(() => {
    const sections = gsap.utils.toArray<HTMLElement>('.impact-section');
    
    sections.forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          setCurrentSection(i);
          setColorBendsOpacity(i === 0 ? 1 : 0);
        },
        onEnterBack: () => {
          setCurrentSection(i);
          setColorBendsOpacity(i === 0 ? 1 : 0);
        },
      });
    });

    sections.forEach((section) => {
      const content = section.querySelector('.section-content');
      if (content) {
        gsap.fromTo(content, 
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 70%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    });
  }, { scope: mainContainer });

  return (
    <div ref={mainContainer} className="min-h-screen bg-black relative">
      {/* Fixed Navbar */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          colorBendsOpacity === 0 ? 'bg-black' : 'bg-transparent'
        }`}
        style={{ height: '74px' }}
      >
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 flex items-center justify-between">
          <Link href="https://codefour.us" className="flex items-center gap-2">
            <Image
              src="/codefour/branding/logo.svg"
              width={120}
              height={28}
              alt="Code Four"
              className="h-6 sm:h-7 w-auto"
              style={{ width: 'auto' }}
            />
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <a 
              href="https://app.codefour.us"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white text-xs sm:text-sm font-medium uppercase tracking-wider transition-colors"
            >
              App
            </a>
            <a 
              href="mailto:founders@codefour.us"
              className="text-white/60 hover:text-white text-xs sm:text-sm font-medium uppercase tracking-wider transition-colors hidden sm:block"
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Fixed line under navbar */}
      <NavbarLine isVisible={navbarLineVisible} />

      {/* Fixed Background - ColorBends */}
      <div 
        className="fixed top-0 left-0 w-screen h-screen z-0 transition-opacity duration-700"
        style={{ opacity: colorBendsOpacity }}
      >
        <ColorBends
          colors={["#004B9C", "#001A36", "#003165", "#001123"]}
          rotation={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
          transparent={false}
          autoRotate={0}
          className="w-full h-full"
        />
      </div>

      {/* Progress Indicator - hidden on mobile, visible on larger screens */}
      <div className="hidden sm:flex fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-50 flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`progress-dot ${currentSection === i ? 'progress-dot--active' : 'progress-dot--inactive'}`}
          />
        ))}
      </div>

      {/* Section 1: Home / Trial Recap */}
      <section className="impact-section pt-20 sm:pt-24 relative overflow-hidden">
        {/* Bottom divider animates when entering Section 2 */}
        <SectionDividerLine shouldAnimate={currentSection >= 1} position="bottom" />
        <div className="section-content text-center px-4 sm:px-6">
          <div className="mb-4 sm:mb-6">
            <span className="section-label !mb-0 text-xs sm:text-sm">{report.orgName}</span>
          </div>

          <h1 className="impact-title text-3xl sm:text-5xl md:text-7xl">
            Your Trial Period
            <br />
            <span className="impact-subtitle">Recapped</span>
          </h1>

          <p className="text-white/60 text-base sm:text-lg mb-6 sm:mb-8">
            {report.trialPeriod}
          </p>

          <div className="scroll-indicator">
            <span className="text-xs sm:text-sm uppercase tracking-wider">Scroll to explore</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Section 2: Reports Generated - Split Layout */}
      <section className="impact-section bg-black relative overflow-hidden">
        {/* Bottom divider animates when entering Section 3 */}
        <SectionDividerLine shouldAnimate={currentSection >= 2} position="bottom" />
        <div className="section-content !max-w-none w-full">
          <div className="flex flex-col lg:flex-row items-stretch min-h-[70vh] w-full max-w-[1800px] mx-auto">
            {/* Left side - Three.js Wireframe (Reports visualization - stacked documents) */}
            {/* Mobile: order-3 (last), Desktop: order-1 (first) */}
            <div className="flex-1 flex items-center justify-center px-6 lg:pl-16 lg:pr-8 py-8 lg:py-0 order-3 lg:order-1">
              <div className="w-full max-w-lg h-[280px] sm:h-[350px] lg:h-[400px]">
                <Suspense fallback={<div className="w-full h-full bg-transparent" />}>
                  <ReportsWireframe />
                </Suspense>
              </div>
            </div>
            
            {/* Vertical Divider - hidden on mobile, visible on desktop (order-2 in middle) */}
            <div className="hidden lg:flex self-stretch lg:order-2">
              <VerticalDivider shouldAnimate={currentSection >= 1} delay={300} />
            </div>
            
            {/* Horizontal divider for mobile - between stats and wireframe */}
            {/* Mobile: order-2 (middle), Hidden on desktop */}
            <div className="lg:hidden w-full px-6 order-2 py-4">
              <div className="h-[2px] bg-white/30 w-full" />
            </div>
            
            {/* Right side - Stats (centered on mobile, right-aligned on desktop) */}
            {/* Mobile: order-1 (first), Desktop: order-3 (last) */}
            <div className="flex-1 flex items-center justify-center px-6 lg:pl-8 lg:pr-16 py-8 lg:py-0 order-1 lg:order-3">
              <div className="text-center lg:text-right max-w-lg w-full">
                <span className="section-label inline-block">Reports Generated</span>

                <div className="mb-6 lg:mb-8">
                  <span className="stat-number">
                    <AnimatedCounter value={report.reportsGenerated} />
                  </span>
                </div>

                <p className="section-description text-center lg:text-right max-w-md mx-auto lg:ml-auto lg:mr-0">
                  Among <span className="text-white font-medium">{report.activeUsers} officers</span>, each contributing an average of{' '}
                  <span className="text-white font-medium">{avgReportsPerOfficer} reports</span> during your trial period.
                </p>

                <div className="mt-8 lg:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                  <div className="text-center lg:text-right">
                    <div className="text-2xl lg:text-3xl font-medium text-white mb-1 lg:mb-2">
                      <AnimatedCounter value={report.activeUsers} />
                    </div>
                    <p className="text-white/40 text-xs lg:text-sm uppercase">Across Officers</p>
                  </div>
                  <div className="text-center lg:text-right">
                    <div className="text-2xl lg:text-3xl font-medium text-white mb-1 lg:mb-2">
                      <AnimatedCounter value={report.avgWordLength} />
                    </div>
                    <p className="text-white/40 text-xs lg:text-sm uppercase">Avg Word Count</p>
                  </div>
                  <div className="text-center lg:text-right">
                    <div className="text-2xl lg:text-3xl font-medium text-white mb-1 lg:mb-2">{report.avgIncidentLength}</div>
                    <p className="text-white/40 text-xs lg:text-sm uppercase">Avg Length</p>
                  </div>
                  {report.totalMediaBytesProcessed !== undefined && report.totalMediaBytesProcessed > 0 && (
                    <div className="text-center lg:text-right">
                      <div className="text-2xl lg:text-3xl font-medium text-white mb-1 lg:mb-2">
                        {(report.totalMediaBytesProcessed / (1024 * 1024 * 1024)).toFixed(1)} GB
                      </div>
                      <p className="text-white/40 text-xs lg:text-sm uppercase">Media Processed</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Time Saved - Split Layout (reversed) */}
      <section className="impact-section bg-black relative overflow-hidden">
        {/* Bottom divider animates when entering Section 4 */}
        <SectionDividerLine shouldAnimate={currentSection >= 3} position="bottom" />
        <div className="section-content !max-w-none w-full">
          <div className="flex flex-col lg:flex-row items-stretch min-h-[70vh] w-full max-w-[1800px] mx-auto">
            {/* Left side - Stats (centered on mobile, left-aligned on desktop) */}
            {/* Mobile: order-1 (first), Desktop: order-1 (first) */}
            <div className="flex-1 flex items-center justify-center px-6 lg:pl-16 lg:pr-8 py-8 lg:py-0 order-1 lg:order-1">
              <div className="text-center lg:text-left max-w-lg w-full">
                <span className="section-label inline-block">Time Saved</span>

                <div className="mb-4">
                  <span className="stat-number">
                    <AnimatedCounter value={timeSavedHours} />
                  </span>
                  <span className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white/60 ml-2 sm:ml-4">hours</span>
                </div>

                <p className="section-subtitle text-center lg:text-left">
                  Based on {report.reportsGenerated.toLocaleString()} reports generated
                </p>

                <p className="section-description text-center lg:text-left max-w-md mx-auto lg:mx-0">
                  That&apos;s roughly <span className="text-white font-medium">{Math.round(timeSavedHours / 8)} full work days</span> your officers can spend back in the community.
                </p>

                {/* Stats calculation - stacked on mobile, inline on desktop */}
                <div className="mt-8 lg:mt-12 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 flex-wrap">
                  <div className="stat-box w-full sm:w-auto">
                    <div className="text-xl lg:text-2xl font-medium text-white mb-1">
                      {report.reportsGenerated.toLocaleString()}
                    </div>
                    <p className="text-white/40 text-xs uppercase">Reports Generated</p>
                  </div>
                  <div className="text-white/40 text-xl lg:text-2xl hidden sm:block">×</div>
                  <div className="stat-box w-full sm:w-auto">
                    <div className="text-xl lg:text-2xl font-medium text-white mb-1">20 min</div>
                    <p className="text-white/40 text-xs uppercase">Per Report</p>
                  </div>
                  <div className="text-white/40 text-xl lg:text-2xl hidden sm:block">=</div>
                  <div className="stat-box--highlight w-full sm:w-auto">
                    <div className="text-xl lg:text-2xl font-medium text-white mb-1">
                      {timeSavedMinutes.toLocaleString()} min
                    </div>
                    <p className="text-white/40 text-xs uppercase">Est. Time Saved</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Vertical Divider - hidden on mobile, visible on desktop (order-2 in middle) */}
            <div className="hidden lg:flex self-stretch lg:order-2">
              <VerticalDivider shouldAnimate={currentSection >= 2} delay={300} />
            </div>
            
            {/* Horizontal divider for mobile - between stats and wireframe */}
            {/* Mobile: order-2 (middle), Hidden on desktop */}
            <div className="lg:hidden w-full px-6 order-2 py-4">
              <div className="h-[2px] bg-white/30 w-full" />
            </div>
            
            {/* Right side - Three.js Wireframe (Time visualization - hourglass) */}
            {/* Mobile: order-3 (last), Desktop: order-3 (last) */}
            <div className="flex-1 flex items-center justify-center px-6 lg:pl-8 lg:pr-16 py-8 lg:py-0 order-3 lg:order-3">
              <div className="w-full max-w-lg h-[280px] sm:h-[350px] lg:h-[400px]">
                <Suspense fallback={<div className="w-full h-full bg-transparent" />}>
                  <TimeWireframe />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Report Locations Map */}
      <section className="impact-section bg-black relative overflow-hidden">
        {/* Bottom divider animates when entering Section 5 */}
        <SectionDividerLine shouldAnimate={currentSection >= 4} position="bottom" />
        <div className="section-content px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-8">
            <span className="section-label">Report Locations</span>

            <p className="section-description text-base sm:text-xl !mb-0 mt-4">
              Geographic distribution of AI-generated reports during your trial
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ReportLocationsMapResponsive locations={report.reportLocations} />
          </div>

          <div className="mt-6 sm:mt-8 flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-medium text-white mb-1">
                <AnimatedCounter value={report.reportLocations.reduce((sum, loc) => sum + loc.count, 0)} />
              </div>
              <p className="text-white/40 text-xs uppercase">Total Incidents</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Active Users & Leaderboard */}
      <section className="impact-section pb-16 sm:pb-24 pt-12 sm:pt-16 bg-black relative overflow-hidden">
        {/* No top divider - Section 4's bottom serves as the boundary */}
        <div className="section-content px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 mt-4 sm:mt-8">
            <span className="section-label">Active Users</span>

            <div className="mb-6 sm:mb-8">
              <span className="stat-number-sm">
                <AnimatedCounter value={report.activeUsers} />
              </span>
            </div>

            <p className="section-description text-base sm:text-xl !mb-0">
              Officers using Code Four during your trial
            </p>
          </div>

          <div ref={leaderboardRef} className="max-w-xl mx-auto">
            <h3 className="text-white/60 text-xs sm:text-sm uppercase tracking-wider mb-3 sm:mb-4 text-center">
              Top Contributors
            </h3>

            <div className="space-y-2 sm:space-y-3">
              {report.leaderboard.map((user, index) => {
                const styles = getLeaderboardStyles(index);
                return (
                  <div key={user.name} className={`leaderboard-item ${styles.item} ${index === 0 ? 'relative' : ''} p-3 sm:p-4`}>
                    <div className={`leaderboard-rank ${styles.rank} text-sm sm:text-base`}>#{user.rank}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm sm:text-base truncate">{user.name}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white font-bold text-lg sm:text-xl">{user.reports}</div>
                      <div className="text-white/40 text-[10px] sm:text-xs uppercase">Reports</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-white/60 text-sm sm:text-base mb-4 sm:mb-6">Ready to continue the momentum?</p>
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <a
                href="https://cal.com/codefour"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4"
              >
                Schedule a Call
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              {hasPdf && (
                <DownloadReportButton org={org} uuid={uuid} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="impact-footer">
        <div className="h-[2px] bg-white/30 mx-6 mb-8" />
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center">
          <p className="text-white/40 text-sm">
            © 2026 Code Four Labs, Corp.
          </p>
        </div>
      </footer>
    </div>
  );
}
