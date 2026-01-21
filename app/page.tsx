'use client'

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ColorBends from './components/ColorBends';

gsap.registerPlugin(ScrollTrigger);

// Mock data - replace with real data from your API
const impactData = {
  orgName: "Your Department",
  trialPeriod: "Jan 1 - Jan 31, 2026",
  reportsGenerated: 247,
  minutesProcessed: 18420,
  activeUsers: 12,
  leaderboard: [
    { name: "Officer Johnson", reports: 45, rank: 1 },
    { name: "Officer Smith", reports: 38, rank: 2 },
    { name: "Officer Davis", reports: 34, rank: 3 },
    { name: "Officer Wilson", reports: 28, rank: 4 },
    { name: "Officer Martinez", reports: 25, rank: 5 },
  ]
};

// Calculate time saved (minutes processed * 0.25)
const timeSavedMinutes = Math.round(impactData.minutesProcessed * 0.25);
const timeSavedHours = Math.round(timeSavedMinutes / 60);

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

// Helper to get leaderboard styles
function getLeaderboardStyles(index: number) {
  if (index === 0) return { item: 'leaderboard-item--gold', rank: 'leaderboard-rank--gold' };
  if (index === 1) return { item: 'leaderboard-item--silver', rank: 'leaderboard-rank--silver' };
  if (index === 2) return { item: 'leaderboard-item--bronze', rank: 'leaderboard-rank--bronze' };
  return { item: 'leaderboard-item--default', rank: 'leaderboard-rank--default' };
}

export default function ImpactPage() {
  const mainContainer = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);

  useGSAP(() => {
    const sections = gsap.utils.toArray<HTMLElement>('.impact-section');
    
    sections.forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setCurrentSection(i),
        onEnterBack: () => setCurrentSection(i),
      });
    });

    // Animate sections on scroll
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
      {/* Fixed Background - Code Four landing theme: deep navy blues */}
      <div className="fixed inset-0 z-0">
        <ColorBends
          colors={["#001A36", "#004B9C", "#000810", "#002855"]}
          rotation={45}
          speed={0.1}
          scale={1.5}
          frequency={0.6}
          warpStrength={0.6}
          mouseInfluence={0.3}
          parallax={0.2}
          noise={0.08}
          transparent={false}
          autoRotate={0}
        />
      </div>

      {/* Progress Indicator */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`progress-dot ${currentSection === i ? 'progress-dot--active' : 'progress-dot--inactive'}`}
          />
        ))}
      </div>

      {/* Section 1: Home / Trial Recap */}
      <section className="impact-section">
        <div className="section-content text-center">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/">
              <Image
                src="/codefour/branding/logo.svg"
                width={150}
                height={34}
                alt="Code Four"
                className="mx-auto"
              />
            </Link>
          </div>

          <div className="mb-6">
            <span className="section-label !mb-0">{impactData.orgName}</span>
          </div>

          <h1 className="impact-title">
            Your Trial Period
            <br />
            <span className="impact-subtitle">Recapped</span>
          </h1>

          <p className="text-white/60 text-lg mb-8">
            {impactData.trialPeriod}
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
      <section className="impact-section">
        <div className="section-content text-center">
          <span className="section-label">Reports Generated</span>

          <div className="mb-8">
            <span className="stat-number">
              <AnimatedCounter value={impactData.reportsGenerated} />
            </span>
          </div>

          <p className="section-description">
            AI-powered reports created during your trial, each one saving approximately 30 minutes of manual documentation.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-medium text-white mb-2">
                <AnimatedCounter value={Math.round(impactData.reportsGenerated * 0.95)} suffix="%" />
              </div>
              <p className="text-white/40 text-sm uppercase">Accuracy Rate</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-medium text-white mb-2">&lt;2min</div>
              <p className="text-white/40 text-sm uppercase">Avg Processing</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-medium text-white mb-2">24/7</div>
              <p className="text-white/40 text-sm uppercase">Availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Time Saved */}
      <section className="impact-section">
        <div className="section-content text-center">
          <span className="section-label">Time Saved</span>

          <div className="mb-4">
            <span className="stat-number">
              <AnimatedCounter value={timeSavedHours} />
            </span>
            <span className="text-4xl md:text-6xl font-bold text-white/60 ml-4">hours</span>
          </div>

          <p className="section-subtitle">
            Based on {impactData.minutesProcessed.toLocaleString()} minutes of footage processed
          </p>

          <p className="section-description">
            That&apos;s roughly <span className="text-white font-medium">{Math.round(timeSavedHours / 8)} full work days</span> your officers can spend back in the community.
          </p>

          <div className="mt-12 flex items-center justify-center gap-4 flex-wrap">
            <div className="stat-box">
              <div className="text-2xl font-medium text-white mb-1">
                {impactData.minutesProcessed.toLocaleString()}
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

      {/* Section 4: Active Users & Leaderboard */}
      <section className="impact-section pb-24">
        <div className="section-content">
          <div className="text-center mb-12">
            <span className="section-label">Active Users</span>

            <div className="mb-8">
              <span className="stat-number-sm">
                <AnimatedCounter value={impactData.activeUsers} />
              </span>
            </div>

            <p className="section-description !mb-0">
              Officers using Code Four during your trial
            </p>
          </div>

          {/* Leaderboard */}
          <div className="max-w-xl mx-auto">
            <h3 className="text-white/60 text-sm uppercase tracking-wider mb-4 text-center">
              Top Contributors
            </h3>

            <div className="space-y-3">
              {impactData.leaderboard.map((user, index) => {
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

          {/* CTA */}
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
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link href="/">
            <Image
              src="/codefour/branding/logo.svg"
              width={100}
              height={22}
              alt="Code Four"
            />
          </Link>
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} Code Four Labs, Corp.
          </p>
        </div>
      </footer>
    </div>
  );
}
