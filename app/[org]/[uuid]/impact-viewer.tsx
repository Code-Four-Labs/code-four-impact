'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ColorBends from '@/app/components/ColorBends';
import { ImpactReportData } from '@/lib/services/gcs-impact.service';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

gsap.registerPlugin(ScrollTrigger);

interface ImpactViewerProps {
  data: ImpactReportData;
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

// Animated section divider line component - clean animation from center outward
// Hidden when scrolled past navbar (top: 56px)
function SectionDividerLine({ isVisible, position = 'top' }: { isVisible: boolean; position?: 'top' | 'bottom' }) {
  return (
    <div 
      className={`absolute ${position === 'top' ? 'top-0' : 'bottom-0'} left-6 right-6 h-[2px] overflow-hidden`}
      style={{ clipPath: 'inset(0 0 0 0)' }} // Ensures proper clipping within section
    >
      {/* Single animated line - expands from center */}
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

// Fixed header line under navbar - animates in on load
function NavbarLine({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="fixed left-6 right-6 z-40 pointer-events-none h-[2px]" style={{ top: '72px' }}>
      {/* Single animated line - expands from center */}
      <div 
        className="absolute left-1/2 top-0 h-full bg-white/25 transition-all duration-1000 ease-out"
        style={{ 
          width: isVisible ? '100%' : '0%',
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
}

function ReportLocationsMap({ locations }: { locations: Array<{ lat: number; lon: number; count: number }> }) {
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

    const avgLat = locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length;
    const avgLon = locations.reduce((sum, loc) => sum + loc.lon, 0) / locations.length;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [avgLon, avgLat],
      zoom: 6.5,
      interactive: false,
    });

    map.current.on('load', () => {
      if (!map.current) return;

      const size = 100;
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
          const duration = 1500;
          const t = (performance.now() % duration) / duration;
          const radius = (size / 2) * 0.3;
          const outerRadius = (size / 2) * 0.7 * t + radius;
          const context = this.context;
          if (!context) return false;

          context.clearRect(0, 0, this.width, this.height);

          context.beginPath();
          context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
          context.fillStyle = `rgba(0, 75, 156, ${1 - t})`;
          context.fill();

          context.beginPath();
          context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
          context.fillStyle = '#003165';
          context.strokeStyle = '#004B9C';
          context.lineWidth = 2 + 4 * (1 - t);
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
      <div className="w-full h-[400px] rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
        <p className="text-white/40 text-sm">{mapError || 'No location data available'}</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-[400px] rounded-xl overflow-hidden border border-white/10"
      style={{ background: '#0a0a0a' }}
    />
  );
}

export function ImpactViewer({ data }: ImpactViewerProps) {
  const mainContainer = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [colorBendsOpacity, setColorBendsOpacity] = useState(1);
  const [sectionProgress, setSectionProgress] = useState([0, 0, 0, 0, 0]);
  const [navbarLineVisible, setNavbarLineVisible] = useState(false);

  // Animate navbar line on mount
  useEffect(() => {
    const timer = setTimeout(() => setNavbarLineVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const report = data.metadata.report;
  const timeSavedMinutes = Math.round(report.minutesProcessed * 0.25);
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

      // Progress tracking for animated lines
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          setSectionProgress(prev => {
            const newProgress = [...prev];
            newProgress[i] = self.progress;
            return newProgress;
          });
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
      {/* Fixed Navbar - Transparent or solid black based on scroll */}
      {/* The navbar covers the full height including the line below it to hide scrolling dividers */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          colorBendsOpacity === 0 ? 'bg-black' : 'bg-transparent'
        }`}
        style={{ height: '74px' }} // Covers past the navbar line at 72px
      >
        <div className="px-6 pt-6 pb-3 flex items-center justify-between">
          <Link href="https://codefour.us" className="flex items-center gap-2">
            <Image
              src="/codefour/branding/logo.svg"
              width={120}
              height={28}
              alt="Code Four"
              style={{ width: 'auto', height: 28 }}
            />
          </Link>
          <div className="flex items-center gap-6">
            <a 
              href="https://app.codefour.us"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white text-sm font-medium uppercase tracking-wider transition-colors"
            >
              App
            </a>
            <a 
              href="mailto:founders@codefour.us"
              className="text-white/60 hover:text-white text-sm font-medium uppercase tracking-wider transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Fixed line under navbar - animated */}
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

      {/* Progress Indicator */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`progress-dot ${currentSection === i ? 'progress-dot--active' : 'progress-dot--inactive'}`}
          />
        ))}
      </div>

      {/* Section 1: Home / Trial Recap */}
      <section className="impact-section pt-24 relative overflow-hidden">
        <SectionDividerLine isVisible={currentSection >= 1} position="bottom" />
        <div className="section-content text-center">
          <div className="mb-6">
            <span className="section-label !mb-0">{report.orgName}</span>
          </div>

          <h1 className="impact-title">
            Your Trial Period
            <br />
            <span className="impact-subtitle">Recapped</span>
          </h1>

          <p className="text-white/60 text-lg mb-8">
            {report.trialPeriod}
          </p>

          <div className="scroll-indicator">
            <span className="text-sm uppercase tracking-wider">Scroll to explore</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Section 2: Reports Generated */}
      <section className="impact-section bg-black relative overflow-hidden">
        <SectionDividerLine isVisible={currentSection >= 2} position="top" />
        <SectionDividerLine isVisible={currentSection >= 2} position="bottom" />
        <div className="section-content text-center">
          <span className="section-label">Reports Generated</span>

          <div className="mb-8">
            <span className="stat-number">
              <AnimatedCounter value={report.reportsGenerated} />
            </span>
          </div>

          <p className="section-description">
            Among <span className="text-white font-medium">{report.activeUsers} officers</span>, each contributing an average of{' '}
            <span className="text-white font-medium">{avgReportsPerOfficer} reports</span> during your trial period.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-medium text-white mb-2">
                <AnimatedCounter value={report.activeUsers} />
              </div>
              <p className="text-white/40 text-sm uppercase">Across Officers</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-medium text-white mb-2">
                <AnimatedCounter value={report.avgWordLength} />
              </div>
              <p className="text-white/40 text-sm uppercase">Average Word Count</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-medium text-white mb-2">{report.avgIncidentLength}</div>
              <p className="text-white/40 text-sm uppercase">Average Incident Length</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Time Saved */}
      <section className="impact-section bg-black relative overflow-hidden">
        <SectionDividerLine isVisible={currentSection >= 3} position="top" />
        <SectionDividerLine isVisible={currentSection >= 3} position="bottom" />
        <div className="section-content text-center">
          <span className="section-label">Time Saved</span>

          <div className="mb-4">
            <span className="stat-number">
              <AnimatedCounter value={timeSavedHours} />
            </span>
            <span className="text-4xl md:text-6xl font-bold text-white/60 ml-4">hours</span>
          </div>

          <p className="section-subtitle">
            Based on {report.minutesProcessed.toLocaleString()} minutes of footage processed
          </p>

          <p className="section-description">
            That&apos;s roughly <span className="text-white font-medium">{Math.round(timeSavedHours / 8)} full work days</span> your officers can spend back in the community.
          </p>

          <div className="mt-12 flex items-center justify-center gap-4 flex-wrap">
            <div className="stat-box">
              <div className="text-2xl font-medium text-white mb-1">
                {report.minutesProcessed.toLocaleString()}
              </div>
              <p className="text-white/40 text-xs uppercase">Minutes Processed</p>
            </div>
            <div className="text-white/40 text-2xl">×</div>
            <div className="stat-box">
              <div className="text-2xl font-medium text-white mb-1">0.25</div>
              <p className="text-white/40 text-xs uppercase">Time Multiplier</p>
            </div>
            <div className="text-white/40 text-2xl">=</div>
            <div className="stat-box--highlight">
              <div className="text-2xl font-medium text-white mb-1">
                {timeSavedMinutes.toLocaleString()} min
              </div>
              <p className="text-white/40 text-xs uppercase">Time Saved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Report Locations Map */}
      <section className="impact-section bg-black relative overflow-hidden">
        <SectionDividerLine isVisible={currentSection >= 4} position="top" />
        <SectionDividerLine isVisible={currentSection >= 4} position="bottom" />
        <div className="section-content">
          <div className="text-center mb-8">
            <span className="section-label">Report Locations</span>

            <p className="section-description !mb-0 mt-4">
              Geographic distribution of AI-generated reports during your trial
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ReportLocationsMap locations={report.reportLocations} />
          </div>

          <div className="mt-8 flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <div className="text-2xl font-medium text-white mb-1">
                <AnimatedCounter value={report.reportLocations.reduce((sum, loc) => sum + loc.count, 0)} />
              </div>
              <p className="text-white/40 text-xs uppercase">Total Incidents</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Active Users & Leaderboard */}
      <section className="impact-section pb-24 bg-black relative overflow-hidden">
        <div className="section-content">
          <div className="text-center mb-12">
            <span className="section-label">Active Users</span>

            <div className="mb-8">
              <span className="stat-number-sm">
                <AnimatedCounter value={report.activeUsers} />
              </span>
            </div>

            <p className="section-description !mb-0">
              Officers using Code Four during your trial
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            <h3 className="text-white/60 text-sm uppercase tracking-wider mb-4 text-center">
              Top Contributors
            </h3>

            <div className="space-y-3">
              {report.leaderboard.map((user, index) => {
                const styles = getLeaderboardStyles(index);
                return (
                  <div key={user.name} className={`leaderboard-item ${styles.item}`}>
                    <div className={`leaderboard-rank ${styles.rank}`}>#{user.rank}</div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{user.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-xl">{user.reports}</div>
                      <div className="text-white/40 text-xs uppercase">Reports</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-white/60 mb-6">Ready to continue the momentum?</p>
            <a
              href="https://cal.com/codefour"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Start Your Subscription
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="impact-footer">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-center">
          <p className="text-white/40 text-sm">
            © 2026 Code Four Labs, Corp.
          </p>
        </div>
      </footer>
    </div>
  );
}
