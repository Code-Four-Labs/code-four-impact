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
      {/* Fixed Background - Code Four brand colors: deep blues and blacks */}
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
        />
      </div>

      {/* Progress Indicator */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSection === i ? 'bg-white scale-150' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Section 1: Home / Trial Recap */}
      <section className="impact-section min-h-screen flex items-center justify-center relative z-10 px-6">
        <div className="section-content max-w-4xl w-full text-center">
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
            <span className="inline-block px-4 py-2 border border-white/20 text-white/60 text-sm uppercase tracking-wider">
              {impactData.orgName}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-medium text-white uppercase tracking-tight mb-6">
            Your Trial Period
            <br />
            <span className="text-white/80">Recapped</span>
          </h1>

          <p className="text-white/60 text-lg mb-8">
            {impactData.trialPeriod}
          </p>

          <div className="flex items-center justify-center gap-2 text-white/40 animate-bounce">
            <span className="text-sm uppercase tracking-wider">Scroll to explore</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Section 2: Reports Generated */}
      <section className="impact-section min-h-screen flex items-center justify-center relative z-10 px-6">
        <div className="section-content max-w-4xl w-full text-center">
          <span className="inline-block px-4 py-2 border border-white/20 text-white/60 text-sm uppercase tracking-wider mb-8">
            Reports Generated
          </span>

          <div className="mb-8">
            <span className="text-8xl md:text-[12rem] font-bold text-white leading-none">
              <AnimatedCounter value={impactData.reportsGenerated} />
            </span>
          </div>

          <p className="text-white/60 text-xl max-w-xl mx-auto">
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
              <div className="text-3xl font-medium text-white mb-2">
                &lt;2min
              </div>
              <p className="text-white/40 text-sm uppercase">Avg Processing</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-medium text-white mb-2">
                24/7
              </div>
              <p className="text-white/40 text-sm uppercase">Availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Time Saved */}
      <section className="impact-section min-h-screen flex items-center justify-center relative z-10 px-6">
        <div className="section-content max-w-4xl w-full text-center">
          <span className="inline-block px-4 py-2 border border-white/20 text-white/60 text-sm uppercase tracking-wider mb-8">
            Time Saved
          </span>

          <div className="mb-4">
            <span className="text-8xl md:text-[12rem] font-bold text-white leading-none">
              <AnimatedCounter value={timeSavedHours} />
            </span>
            <span className="text-4xl md:text-6xl font-bold text-white/60 ml-4">hours</span>
          </div>

          <p className="text-white/40 text-lg mb-8">
            Based on {impactData.minutesProcessed.toLocaleString()} minutes of footage processed
          </p>

          <p className="text-white/60 text-xl max-w-xl mx-auto">
            That&apos;s roughly <span className="text-white font-medium">{Math.round(timeSavedHours / 8)} full work days</span> your officers can spend back in the community.
          </p>

          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="px-6 py-4 border border-white/10 bg-white/5">
              <div className="text-2xl font-medium text-white mb-1">
                {impactData.minutesProcessed.toLocaleString()}
              </div>
              <p className="text-white/40 text-xs uppercase">Minutes Processed</p>
            </div>
            <div className="text-white/40 text-2xl">×</div>
            <div className="px-6 py-4 border border-white/10 bg-white/5">
              <div className="text-2xl font-medium text-white mb-1">
                0.25
              </div>
              <p className="text-white/40 text-xs uppercase">Time Multiplier</p>
            </div>
            <div className="text-white/40 text-2xl">=</div>
            <div className="px-6 py-4 border border-white/20 bg-white/10">
              <div className="text-2xl font-medium text-white mb-1">
                {timeSavedMinutes.toLocaleString()} min
              </div>
              <p className="text-white/40 text-xs uppercase">Time Saved</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Active Users & Leaderboard */}
      <section className="impact-section min-h-screen flex items-center justify-center relative z-10 px-6 pb-24">
        <div className="section-content max-w-4xl w-full">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 border border-white/20 text-white/60 text-sm uppercase tracking-wider mb-8">
              Active Users
            </span>

            <div className="mb-8">
              <span className="text-8xl md:text-[10rem] font-bold text-white leading-none">
                <AnimatedCounter value={impactData.activeUsers} />
              </span>
            </div>

            <p className="text-white/60 text-xl">
              Officers using Code Four during your trial
            </p>
          </div>

          {/* Leaderboard */}
          <div className="max-w-xl mx-auto">
            <h3 className="text-white/60 text-sm uppercase tracking-wider mb-4 text-center">
              Top Contributors
            </h3>

            <div className="space-y-3">
              {impactData.leaderboard.map((user, index) => (
                <div
                  key={user.name}
                  className={`flex items-center gap-4 p-4 border transition-all ${
                    index === 0
                      ? 'border-yellow-500/50 bg-yellow-500/10'
                      : index === 1
                      ? 'border-gray-400/50 bg-gray-400/10'
                      : index === 2
                      ? 'border-orange-600/50 bg-orange-600/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center font-bold ${
                    index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-white/40'
                  }`}>
                    #{user.rank}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium">{user.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-xl">{user.reports}</div>
                    <div className="text-white/40 text-xs uppercase">Reports</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 text-center">
            <p className="text-white/60 mb-6">Ready to continue the momentum?</p>
            <a
              href="https://cal.com/codefour"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-medium uppercase tracking-wider hover:bg-white/90 transition-all"
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
      <footer className="relative z-10 py-8 border-t border-white/10">
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
