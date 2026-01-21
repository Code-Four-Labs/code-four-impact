'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Navbar from './layouts/Navbar';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Frames scattered INSIDE elliptical area with organic, randomized offsets
// showOnMobile: true for frames to show on mobile (reduced set for simplicity)
// Mobile uses a VERTICAL ellipse pattern - frames spread organically to fill space
const slidesData = [
  // Mobile: Clear zone 35%-60% for title. All frames well-spaced with varied sizes.
  // TOP LEFT AREA - larger frame
  { img: '/codefour/sections/never-miss-frame/frame-demo-01.png', width: 140, mobileWidth: 100, height: 105, mobileHeight: 75, x: '16%', xMobile: '20%', y: '15%', yMobile: '13%', showOnMobile: true },
  { img: '/codefour/sections/never-miss-frame/frame-demo-02.png', width: 130, height: 98, x: '35%', xMobile: '30%', y: '10%', yMobile: '10%', showOnMobile: false },
  { img: '/codefour/sections/never-miss-frame/frame-demo-03.png', width: 125, height: 94, x: '25%', xMobile: '22%', y: '33%', yMobile: '33%', showOnMobile: false },
  { img: '/codefour/sections/never-miss-frame/frame-demo-04.png', width: 120, height: 90, x: '10%', xMobile: '10%', y: '46%', yMobile: '46%', showOnMobile: false },
  // TOP CENTER - medium frame
  { img: '/codefour/sections/never-miss-frame/frame-demo-05.png', width: 135, mobileWidth: 85, height: 101, mobileHeight: 64, x: '65%', xMobile: '50%', y: '14%', yMobile: '22%', showOnMobile: true },
  { img: '/codefour/sections/never-miss-frame/frame-demo-06.png', width: 142, height: 107, x: '84%', xMobile: '86%', y: '20%', yMobile: '20%', showOnMobile: false },
  { img: '/codefour/sections/never-miss-frame/frame-demo-07.png', width: 122, height: 92, x: '74%', xMobile: '77%', y: '37%', yMobile: '37%', showOnMobile: false },
  { img: '/codefour/sections/never-miss-frame/frame-demo-09.png', width: 118, height: 89, x: '93%', xMobile: '92%', y: '44%', yMobile: '44%', showOnMobile: false },
  // TOP RIGHT - smaller frame
  { img: '/codefour/sections/never-miss-frame/frame-demo-10.png', width: 120, mobileWidth: 70, height: 90, mobileHeight: 53, x: '9%', xMobile: '78%', y: '58%', yMobile: '15%', showOnMobile: true },
  { img: '/codefour/sections/never-miss-frame/frame-demo-11.png', width: 125, height: 94, x: '26%', xMobile: '23%', y: '68%', yMobile: '68%', showOnMobile: false },
  { img: '/codefour/sections/never-miss-frame/frame-demo-12.png', width: 126, height: 95, x: '36%', xMobile: '32%', y: '87%', yMobile: '87%', showOnMobile: false },
  { img: '/codefour/sections/never-miss-frame/frame-demo-13.png', width: 140, height: 105, x: '15%', xMobile: '13%', y: '81%', yMobile: '81%', showOnMobile: false },
  // MID-LEFT (above title) - small frame
  { img: '/codefour/sections/never-miss-frame/frame-demo-14.png', width: 118, mobileWidth: 65, height: 89, mobileHeight: 49, x: '88%', xMobile: '25%', y: '60%', yMobile: '35%', showOnMobile: true },
  { img: '/codefour/sections/never-miss-frame/frame-demo-15.png', width: 125, height: 94, x: '70%', xMobile: '73%', y: '63%', yMobile: '63%', showOnMobile: false },
  { img: '/codefour/sections/never-miss-frame/frame-demo-16.png', width: 130, height: 98, x: '64%', xMobile: '68%', y: '88%', yMobile: '88%', showOnMobile: false },
  { img: '/codefour/sections/never-miss-frame/frame-demo-17.png', width: 138, height: 104, x: '85%', xMobile: '83%', y: '76%', yMobile: '76%', showOnMobile: false },
  // MID-RIGHT (above title) - small frame
  { img: '/codefour/sections/never-miss-frame/frame-demo-18.png', width: 130, mobileWidth: 65, height: 98, mobileHeight: 49, x: '48%', xMobile: '72%', y: '26%', yMobile: '33%', showOnMobile: true },
  // BOTTOM LEFT - large frame
  { img: '/codefour/sections/never-miss-frame/frame-demo-19.png', width: 128, mobileWidth: 95, height: 96, mobileHeight: 71, x: '53%', xMobile: '22%', y: '74%', yMobile: '75%', showOnMobile: true },
  // BOTTOM CENTER - medium frame
  { img: '/codefour/sections/never-miss-frame/frame-demo-20.png', width: 115, mobileWidth: 80, height: 86, mobileHeight: 60, x: '30%', xMobile: '50%', y: '52%', yMobile: '85%', showOnMobile: true },
  // BOTTOM RIGHT - medium frame
  { img: '/codefour/sections/never-miss-frame/frame-demo-21.png', width: 115, mobileWidth: 85, height: 86, mobileHeight: 64, x: '71%', xMobile: '75%', y: '48%', yMobile: '72%', showOnMobile: true }
];

// Mobile web connections - defines which mobile frames connect (indices in slidesData that have showOnMobile: true)
// Mobile indices: 0 (top-left), 4 (top-center), 8 (top-right), 12 (mid-left), 16 (mid-right), 17 (bottom-left), 18 (bottom-center), 19 (bottom-right)
const mobileWebConnections = [
  // Top cluster connections
  { from: 0, to: 4, x1Mobile: '20%', y1Mobile: '13%', x2Mobile: '50%', y2Mobile: '22%' },
  { from: 4, to: 8, x1Mobile: '50%', y1Mobile: '22%', x2Mobile: '78%', y2Mobile: '15%' },
  { from: 0, to: 12, x1Mobile: '20%', y1Mobile: '13%', x2Mobile: '25%', y2Mobile: '35%' },
  { from: 8, to: 16, x1Mobile: '78%', y1Mobile: '15%', x2Mobile: '72%', y2Mobile: '33%' },
  // Middle connections (bridging top and bottom)
  { from: 12, to: 17, x1Mobile: '25%', y1Mobile: '35%', x2Mobile: '22%', y2Mobile: '75%' },
  { from: 16, to: 19, x1Mobile: '72%', y1Mobile: '33%', x2Mobile: '75%', y2Mobile: '72%' },
  // Bottom cluster connections
  { from: 17, to: 18, x1Mobile: '22%', y1Mobile: '75%', x2Mobile: '50%', y2Mobile: '85%' },
  { from: 18, to: 19, x1Mobile: '50%', y1Mobile: '85%', x2Mobile: '75%', y2Mobile: '72%' },
];

// Web connections: [fromFrameIndex, toFrameIndex, x1, y1, x2, y2]
// Each connection defines which two frames are connected
const webConnections = [
  { from: 0, to: 1, x1: '16%', y1: '15%', x2: '35%', y2: '10%' },
  { from: 1, to: 16, x1: '35%', y1: '10%', x2: '48%', y2: '26%' },
  { from: 0, to: 2, x1: '16%', y1: '15%', x2: '25%', y2: '33%' },
  { from: 2, to: 18, x1: '25%', y1: '33%', x2: '30%', y2: '52%' },
  { from: 2, to: 16, x1: '25%', y1: '33%', x2: '48%', y2: '26%' },
  { from: 3, to: 2, x1: '10%', y1: '46%', x2: '25%', y2: '33%' },
  { from: 3, to: 8, x1: '10%', y1: '46%', x2: '9%', y2: '58%' },
  { from: 8, to: 9, x1: '9%', y1: '58%', x2: '26%', y2: '68%' },
  { from: 9, to: 18, x1: '26%', y1: '68%', x2: '30%', y2: '52%' },
  { from: 9, to: 10, x1: '26%', y1: '68%', x2: '36%', y2: '87%' },
  { from: 11, to: 9, x1: '15%', y1: '81%', x2: '26%', y2: '68%' },
  { from: 11, to: 10, x1: '15%', y1: '81%', x2: '36%', y2: '87%' },
  { from: 10, to: 17, x1: '36%', y1: '87%', x2: '53%', y2: '74%' },
  { from: 4, to: 16, x1: '65%', y1: '14%', x2: '48%', y2: '26%' },
  { from: 4, to: 5, x1: '65%', y1: '14%', x2: '84%', y2: '20%' },
  { from: 5, to: 6, x1: '84%', y1: '20%', x2: '74%', y2: '37%' },
  { from: 6, to: 19, x1: '74%', y1: '37%', x2: '71%', y2: '48%' },
  { from: 6, to: 7, x1: '74%', y1: '37%', x2: '93%', y2: '44%' },
  { from: 7, to: 12, x1: '93%', y1: '44%', x2: '88%', y2: '60%' },
  { from: 12, to: 13, x1: '88%', y1: '60%', x2: '70%', y2: '63%' },
  { from: 13, to: 19, x1: '70%', y1: '63%', x2: '71%', y2: '48%' },
  { from: 13, to: 17, x1: '70%', y1: '63%', x2: '53%', y2: '74%' },
  { from: 13, to: 14, x1: '70%', y1: '63%', x2: '64%', y2: '88%' },
  { from: 14, to: 15, x1: '64%', y1: '88%', x2: '85%', y2: '76%' },
  { from: 15, to: 12, x1: '85%', y1: '76%', x2: '88%', y2: '60%' },
  { from: 16, to: 4, x1: '48%', y1: '26%', x2: '65%', y2: '14%' },
  { from: 17, to: 14, x1: '53%', y1: '74%', x2: '64%', y2: '88%' },
  { from: 18, to: 19, x1: '30%', y1: '52%', x2: '71%', y2: '48%' },
  { from: 16, to: 17, x1: '48%', y1: '26%', x2: '53%', y2: '74%' },
];

const initialZ = -16000;
// Staggered z-positions for each slide (all within -6000 to -18000 for visibility)
const staggeredZPositions = [
  -14000,  // slide 0
  -10000,  // slide 1
  -17500,  // slide 2
  -8000,   // slide 3
  -12000,  // slide 4
  -6000,   // slide 5 - closest
  -16500,  // slide 6
  -15000,  // slide 7
  -9000,   // slide 8
  -18000,  // slide 9 - furthest
  -11000,  // slide 10
  -7000,   // slide 11
  -15500,  // slide 12
  -13000,  // slide 13
  -17000,  // slide 14
  -6500,   // slide 15 - very close
  -16000,  // slide 16
  -14500,  // slide 17
  -13500,  // slide 18
  -12500,  // slide 19
];

export default function Home() {
  const mainContainer = useRef<HTMLDivElement | null>(null);
  // Our Products States
  const ourProductLeftBlock = useRef<HTMLDivElement | null>(null);
  const ourProductRightBlock = useRef<HTMLDivElement | null>(null);
  const ourProductGradient = useRef<HTMLDivElement | null>(null);
  const [ourProductSelectedIndex, setOurProductSelectedIndex] = useState<number | null>(0);
  // Never Miss A Frame State
  const neverMissAFrame = useRef<HTMLDivElement | null>(null);
  const slidesRef = useRef<HTMLDivElement[]>([]);
  const webLinesRef = useRef<SVGLineElement[]>([]);
  const mobileWebLinesRef = useRef<SVGLineElement[]>([]);
  const visibleFrames = useRef<boolean[]>(new Array(20).fill(false));
  const frameAnimationComplete = useRef<boolean[]>(new Array(20).fill(false));
  // Why Choose Code Four States
  const [whyChooseActiveIndex, setWhyChooseActiveIndex] = useState<number | null>(0);
  //Faq States
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);



  // Our Products Animation
  useGSAP(() => {
    const ctx = gsap.context(() => {
      const leftBlock = ourProductLeftBlock.current;
      const rightBlock = ourProductRightBlock.current;
      const gradient = ourProductGradient.current;
      const singleProductCards = leftBlock?.querySelectorAll('.single-product__card');

      if (!leftBlock || !rightBlock || !gradient || !singleProductCards) return;

      // Left Block Pin
      ScrollTrigger.create({
        trigger: leftBlock.parentElement,
        pin: gradient,
        start: 'top top',
        end: 'bottom bottom',
      });

      /// Right Block Pin
      ScrollTrigger.create({
        trigger: rightBlock.parentElement,
        pin: rightBlock,
        start: 'top top',
        end: 'bottom bottom',
        pinSpacing: false,
        onUpdate: (self) => {
          const pinElement = self.pin as HTMLElement | null;

          if (pinElement?.parentElement) {
            pinElement.parentElement.classList.add("disable-pointer");
          }
        },
      });

      // Product Image Change On Scroll
      singleProductCards.forEach((card, index) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top center",
          end: 'bottom center',
          onEnter: () => setOurProductSelectedIndex(index),
          onEnterBack: () => setOurProductSelectedIndex(index),
        });
      });
    });

    return () => {
      ctx.revert();
    }
  }, { scope: mainContainer });

  // Never Miss A Frame
  useGSAP(() => {
    const container = neverMissAFrame.current;
    if (!container) return;

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const contentBlock = container?.querySelector('.content__block');

      /// content block pin
      ScrollTrigger.create({
        trigger: container,
        pin: contentBlock,
        start: 'top top',
        end: 'bottom bottom',
        pinSpacing: false,
        anticipatePin: 0,
      });

      const slides = slidesRef.current;
      const slider = contentBlock?.querySelector<HTMLElement>('.slider');
      if (!slider) return;

      slides.forEach((slide, i) => {
        // Use staggered z-positions for different starting depths
        const zPosition = staggeredZPositions[i] || initialZ;

        mm.add('(min-width: 768px)', () => {
          const { x, y } = slidesData[i];

          gsap.set(slide, {
            top: y,
            left: x,
            xPercent: -50,
            yPercent: -50,
            z: zPosition,
            position: 'absolute',
          });
        });
        mm.add('(max-width: 767px)', () => {
          const { xMobile, yMobile } = slidesData[i];

          gsap.set(slide, {
            top: yMobile,
            left: xMobile,
            xPercent: -50,
            yPercent: -50,
            z: zPosition,
            position: 'absolute',
          });
        })
      });

      slides.forEach((slide, i) => {
        const zPosition = staggeredZPositions[i] || initialZ;
        
        // Calculate when this slide should start appearing based on its z-position
        const minZ = -18000;
        const maxZ = -6000;
        const normalizedProgress = (zPosition - minZ) / (maxZ - minZ);
        
        // Frames appear in first 60% of scroll, then stay stationary for web lines
        // Closest starts at 0.02, furthest at 0.55 - all done by 60%
        const opacityThreshold = 0.02 + (1 - normalizedProgress) * 0.53;

        gsap.to(slide, {
          translateZ: 0,
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: '60% bottom', // Zoom completes in first 60% of scroll
            scrub: 0.5, // Faster scrub for quicker zoom
            onUpdate: (self) => {
              const progress = self.progress;

              // Frame appears immediately at opacityThreshold
              if (progress >= opacityThreshold) {
                slide.style.opacity = '1';
                visibleFrames.current[i] = true;
              } else {
                slide.style.opacity = '0';
                visibleFrames.current[i] = false;
                frameAnimationComplete.current[i] = false;
              }
              
              // Frame animation is COMPLETE when it reaches the end (progress = 1.0)
              // This means translateZ has reached 0 and the frame has stopped moving
              if (progress >= 1.0) {
                frameAnimationComplete.current[i] = true;
              } else {
                // If we scroll back up before animation completes, mark as incomplete
                frameAnimationComplete.current[i] = false;
              }
              
              // Check and update all web connections with STAGED drawing
              // Lines draw/undraw based on scroll position - reversible animation
              
              // Desktop connections
              webConnections.forEach((conn, lineIndex) => {
                const line = webLinesRef.current[lineIndex];
                if (!line) return;
                
                // Both frames must have their animations complete (translateZ = 0, stopped moving)
                const fromComplete = frameAnimationComplete.current[conn.from];
                const toComplete = frameAnimationComplete.current[conn.to];
                
                if (fromComplete && toComplete) {
                  line.style.transitionDelay = `${lineIndex * 0.05}s`; // 50ms stagger per line
                  line.style.strokeDashoffset = '0';
                } else {
                  const reverseStagger = ((webConnections.length - lineIndex - 1) / webConnections.length) * 0.3;
                  line.style.transitionDelay = `${reverseStagger}s`;
                  line.style.strokeDashoffset = '1000';
                }
              });
              
              // Mobile connections - same logic
              mobileWebConnections.forEach((conn, lineIndex) => {
                const line = mobileWebLinesRef.current[lineIndex];
                if (!line) return;
                
                const fromComplete = frameAnimationComplete.current[conn.from];
                const toComplete = frameAnimationComplete.current[conn.to];
                
                if (fromComplete && toComplete) {
                  line.style.transitionDelay = `${lineIndex * 0.08}s`; // Slightly slower stagger for mobile
                  line.style.strokeDashoffset = '0';
                } else {
                  const reverseStagger = ((mobileWebConnections.length - lineIndex - 1) / mobileWebConnections.length) * 0.4;
                  line.style.transitionDelay = `${reverseStagger}s`;
                  line.style.strokeDashoffset = '1000';
                }
              });
            },
          }
        })
      });
    });

    return () => {
      mm.revert();
      ctx.revert();
    }
  }, { scope: mainContainer });

  return (
    <div ref={mainContainer} className='min-h-screen bg-black'>
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <div className='relative w-full h-auto md:h-[825px] pt-[126px] md:pt-[98px] flex flex-col justify-start items-center gap-[74px] max-md:px-[16px]'>
        {/* Noise Bg */}
        <div className='absolute top-0 left-0 w-full h-full pointer-events-none opacity-[.5]'>
          <Image
            src={'/codefour/hero/background-noise.png'}
            width={1459}
            height={829}
            quality={100}
            alt='Code Four'
            draggable={false}
            className='w-full h-full object-cover mix-blend-exclusion'
          />
        </div>

        {/* Light Gradient */}
        <div className='absolute -bottom-[91px] left-0 w-full h-[466px] pointer-events-none'>
          <div className='max-w-[1265px] w-full h-full mx-auto rounded-[100px] opacity-[.4] bg-[radial-gradient(50%_50%_at_50%_50%,#004B9C_42.31%,#001A36_100%)] blur-[150px]'></div>
        </div>

        <div className='max-w-[418px] w-full flex flex-col items-center'>
          <div className='flex flex-col items-center gap-[8px] opacity-[.8] mb-[16px]'>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16" fill="none">
              <path d="M18.8176 7.80084L19.1602 6.82783L18.2448 7.39823L18.5705 7.45974L17.7338 8.51663L17.3576 8.76268L17.5204 8.79061L17.1891 9.19884L17.279 8.76825L18.6492 6.7048L18.8232 6.95646L19.0703 5.96666L18.2167 6.60975L18.5425 6.64329L17.9697 7.50446L18.11 6.67683L18.0427 6.73835L18.1606 5.88278L17.2396 6.76071H17.2509L16.4759 7.64428L16.8297 7.6107L16.4591 8.49423L16.4085 7.72254L15.8751 8.47187L15.8021 8.09162L15.2967 9.04227L15.6055 8.93603L15.2293 10.8653C14.752 10.5689 14.3926 11.4468 14.387 11.4468C13.9602 11.4468 13.6232 11.2511 13.4267 11.1672C13.4155 10.9212 13.2976 10.8261 13.2189 10.7814C13.2189 10.7814 13.2751 10.6751 13.2751 10.6695C13.1628 10.334 12.6293 10.1774 12.6293 10.1551C12.6293 10.0153 12.3822 9.96495 12.1801 9.85868C12.0677 9.79717 11.9217 9.70212 11.815 9.6406C11.8487 9.54555 11.8824 9.45607 11.9105 9.36658C12.1969 9.66857 12.2081 9.20445 12.2194 9.21563C12.5844 9.5847 12.5619 8.85773 12.5732 8.86331C13.2358 9.3778 13.0112 8.67877 13.0224 8.68998C13.5278 9.03666 13.3593 8.33209 13.3762 8.33767C13.977 8.68995 13.7187 7.96302 13.7299 7.96859C14.4206 8.40479 14.1174 7.63867 14.1174 7.63867C14.7463 8.06365 14.387 7.18011 14.387 7.18011C15.1507 7.50446 14.7351 6.81665 14.7351 6.81665C15.3753 6.9117 14.8755 6.38606 14.9036 6.38606C15.8526 6.3637 15.1057 5.82684 15.145 5.82127C16.1446 5.54725 15.2911 5.27327 15.3023 5.26766C16.4422 4.94331 15.2854 4.74759 15.3191 4.73084C16.5096 4.14926 15.3921 4.10453 15.3978 4.09335C16.5208 3.20421 15.7572 3.28251 15.7572 3.28251C16.5882 2.55555 15.8751 2.60027 15.8807 2.58909C16.8409 1.69437 16.1109 1.78382 16.1109 1.78382C17.5654 0.525641 17.2958 0 17.2958 0C16.9701 0.0950548 16.4535 0.413797 15.0945 1.19667C12.4103 2.78481 12.2362 3.67952 12.5001 4.19959C12.663 4.53512 12.8483 4.8818 12.8483 4.8874C12.7585 5.25648 13.0224 5.5864 13.0224 5.5864C12.6574 5.93311 12.59 6.31337 12.5788 6.31337C12.3485 6.31337 12.1407 6.36927 12.006 6.41403C11.9217 6.00581 11.8263 5.73179 11.7757 5.70382L11.7196 5.67027L11.6634 5.69824C11.5399 5.77094 11.4163 5.82684 11.304 5.87717C11.2366 5.68706 11.1299 5.48017 11.0233 5.30681L11.0345 5.31799C11.0233 5.30681 11.012 5.29002 11.0064 5.27884C10.984 5.2453 10.9559 5.20615 10.939 5.1726C10.5179 4.42885 10.7369 3.1427 10.282 2.90222L10.4505 2.87986C10.0855 2.63381 9.71485 2.48285 9.43967 2.41573C8.38958 2.18086 8.35026 2.66178 8.35026 2.66178C8.33343 2.68414 7.2721 2.58348 7.87294 3.66834C7.87294 3.66834 7.8954 3.37757 8.17059 3.2769C8.37272 3.3496 8.7546 3.53413 8.85565 3.93675C8.92305 4.22195 8.6198 4.52951 8.28289 4.80353C7.86172 5.12785 7.76624 5.22851 7.77749 5.2453C7.6034 5.44659 7.47988 5.68706 7.39001 5.87717C7.2721 5.82684 7.14294 5.77094 7.01378 5.69264L6.95762 5.6647L6.90147 5.69824C6.85093 5.72621 6.75545 6.0002 6.67122 6.40842C6.53085 6.35809 6.32868 6.30776 6.09843 6.30776C6.09282 6.30776 6.03106 5.93311 5.66043 5.58083C5.65483 5.58083 5.77274 5.14463 5.67729 4.76995C5.67729 4.75877 7.65394 3.85848 3.5827 1.19667C2.26865 0.341104 1.70711 0.0950548 1.39824 0C1.39824 0 1.13431 0.525641 2.57752 1.78382C2.56627 1.78382 1.86995 1.70556 2.81898 2.58909C2.82459 2.60588 2.1002 2.56112 2.93689 3.28251C2.93689 3.28251 2.17318 3.20421 3.2963 4.09335C3.30752 4.10453 2.19003 4.15487 3.37492 4.73084C3.40861 4.74759 2.24619 4.94331 3.38614 5.26766C3.403 5.27327 2.54944 5.54725 3.55463 5.82127C3.57706 5.82684 2.83581 6.36927 3.79045 6.38606C3.81291 6.38606 3.32438 6.9117 3.96454 6.81665C3.96454 6.81665 3.54898 7.50446 4.30709 7.18011C4.30709 7.18011 3.94768 8.05807 4.57103 7.63867C4.57103 7.63867 4.28463 8.40479 4.95287 7.96859C4.97533 7.96302 4.71701 8.68995 5.32349 8.33767C5.34035 8.33209 5.16626 9.03666 5.66043 8.68998C5.67729 8.67877 5.45265 9.3778 6.11529 8.86331C6.13215 8.85773 6.09843 9.5847 6.4747 9.21563C6.48591 9.20445 6.49713 9.66296 6.77792 9.37219C6.82846 9.51758 6.8734 9.66297 6.94076 9.80839C6.88461 9.84193 6.82285 9.88108 6.76106 9.91462C6.55892 10.0265 6.31746 10.088 6.31746 10.2222C6.31746 10.2445 5.78399 10.3899 5.66604 10.7255C5.66604 10.731 5.73345 10.8373 5.73345 10.8373C5.65483 10.8932 5.54249 10.9771 5.52006 11.184C5.31788 11.2735 5.00341 11.4524 4.59349 11.4524C4.58785 11.4524 4.22287 10.5018 3.6894 11.3126C3.63321 11.2735 3.58831 11.2287 3.53216 11.1896C3.67254 11.184 3.77923 11.0777 3.77923 10.938C3.77923 10.8485 3.72869 10.7702 3.66132 10.7255C3.81852 10.5577 4.0881 10.3788 4.49801 10.2669C5.09328 10.0992 4.92479 9.66857 5.31788 9.36658C5.31788 9.36658 4.73387 9.17648 4.18354 9.65739C4.18354 9.65739 4.30149 9.29389 4.24533 9.03666C4.18915 8.84094 4.3127 8.65641 4.38571 8.62847C4.38571 8.62847 3.5827 8.4663 3.2963 10.2669C3.184 10.2837 3.09974 10.3844 3.09974 10.5074C3.09974 10.6024 3.16153 10.6863 3.24576 10.7255C3.24015 10.787 3.23451 10.8485 3.2289 10.91C3.2289 10.9324 2.81898 10.7199 2.88635 10.2837C2.90882 10.2893 2.93689 10.2949 2.95936 10.2949C3.08852 10.2949 3.20083 10.1886 3.20083 10.0544C3.20083 9.97053 3.15028 9.89226 3.08852 9.85311C3.09413 9.84193 3.10538 9.83075 3.11099 9.81957C3.13346 9.78599 3.34685 9.3554 3.2907 8.79061C3.26823 8.53899 3.15028 8.43272 3.26262 8.1028C3.26262 8.1028 2.75719 8.71792 2.65614 8.92482C2.52698 9.17648 2.47083 9.40574 2.45397 9.62385C2.44275 9.62385 2.4315 9.61824 2.42028 9.61824C2.36974 9.61824 2.33041 9.62942 2.29112 9.65178C2.28551 9.59027 2.28551 9.52876 2.28551 9.45607C2.37535 9.4281 2.44836 9.33865 2.44836 9.23799C2.44836 9.13732 2.38096 9.04784 2.29112 9.01991C2.44275 8.88009 2.64489 8.59489 2.62806 7.99095C2.62806 7.94062 2.63928 7.38705 2.75158 7.21926C2.75158 7.21926 2.02719 7.45413 1.97104 8.14195C1.94857 8.13637 1.9205 8.13077 1.89803 8.13077C1.79133 8.13077 1.7015 8.22025 1.7015 8.32648C1.7015 8.388 1.72393 8.43833 1.76887 8.47748C1.75765 8.48866 1.67903 8.55017 1.67903 8.63404C1.67903 8.63404 1.4151 8.36003 1.89242 7.69457C1.90924 7.66664 2.19564 7.33111 2.08334 6.55942C2.06648 6.48672 1.97665 6.20713 2.13949 5.95547C2.13949 5.95547 1.69586 6.05053 1.60041 6.54824C1.60041 6.54824 1.53301 6.26304 1.39824 6.08968C1.37577 6.06171 1.28594 5.93311 1.29715 5.70943C1.29715 5.70943 0.84791 6.01138 0.965855 7.02355C0.965855 7.02355 0.673849 6.80547 0.511004 6.72716C0.359375 6.65447 0.297615 6.63211 0.190921 6.44196C0.190921 6.44196 0.00560802 7.64985 1.04447 8.15313C1.08377 8.21464 1.15117 8.24818 1.22979 8.24818C1.241 8.24818 1.25225 8.24818 1.26347 8.24818C1.28594 8.25379 1.31962 8.26497 1.34209 8.27058C1.36456 8.27615 1.34209 8.39918 1.42071 8.5222C1.42071 8.5222 1.22979 8.3097 0.746859 8.26497C0.656989 8.24818 0.482928 8.19789 0.286364 7.94623C0.286364 7.94623 0.0561515 8.49984 0.662598 8.81858C0.662598 8.81858 0.275148 8.91924 0 8.71235C0 8.71235 0.123519 9.70212 1.48811 9.62385C1.48247 9.64621 1.47686 9.67415 1.47686 9.70212C1.47686 9.83075 1.58355 9.93698 1.71271 9.93698C1.82502 9.93698 1.9205 9.85311 1.94857 9.74687C2.0328 9.81396 2.09456 9.90901 2.08895 10.0488C2.08895 10.0544 1.71271 9.88665 1.19046 9.93698C1.15117 9.94816 0.409918 9.97053 0.303223 9.78599C0.303223 9.78599 0.292007 10.2278 0.735608 10.334C0.735608 10.334 0.550295 10.5241 0.168453 10.5241C0.168453 10.5241 0.567154 11.1225 1.88117 10.7087C1.88117 10.7087 1.89242 10.7031 1.90364 10.6975C1.94296 10.7366 2.00472 10.7702 2.07212 10.7702C2.19564 10.7702 2.29112 10.6751 2.30798 10.5577C2.49326 10.5409 2.70668 10.5913 2.88074 10.8653C2.88074 10.8653 2.85267 10.8708 2.80773 10.8765C2.76844 10.8093 2.69543 10.7702 2.6112 10.7702C2.48765 10.7702 2.39221 10.8597 2.36974 10.9771C2.34727 10.9715 2.33041 10.9659 2.30234 10.9659C2.2125 10.9659 2.13388 11.0162 2.09456 11.0889C1.89242 11.1784 1.69586 11.2958 1.56673 11.4524C1.49372 11.5419 1.45439 11.7488 0.965855 11.9725C0.965855 11.9725 1.44318 12.2073 2.06648 11.9949C2.06648 11.9949 1.65096 12.4702 1.90924 13.2754C1.90924 13.2754 2.08895 12.9511 2.47643 12.7498C2.57752 12.6882 2.8302 12.431 2.93689 11.911C2.97058 11.9669 3.03237 12.0228 3.11099 12.0899C3.13907 12.1235 2.76844 12.6323 3.48722 12.6827C3.54898 12.6882 3.76237 13.0965 3.98701 12.8616C3.98701 12.8672 3.99262 12.8728 3.99262 12.8728C3.99262 12.8728 4.4194 12.7833 4.61596 12.5261C4.91358 12.9343 5.14379 13.4096 5.1101 13.8514C5.07642 14.131 5.04274 14.4162 5.29542 14.4553C5.43579 14.4665 5.81767 13.5886 4.7114 12.2688C4.7114 12.2129 4.7058 12.157 4.68333 12.0899C4.65525 12.0116 5.45826 11.7712 5.86821 11.6649C5.82889 11.7152 5.7896 11.7656 5.7896 11.8047C5.7896 11.8159 6.01981 11.8718 6.09843 11.8718C6.09843 11.8718 6.07035 11.9109 6.07035 11.9613C6.07035 11.9613 6.46344 12.0396 6.96884 11.8103C7.06432 11.7712 7.23277 11.732 7.36754 11.5643C7.44055 11.486 7.83364 11.307 7.98527 11.2903C7.99649 11.2903 8.00771 11.2903 8.01896 11.2846C8.03017 11.2958 8.04703 11.307 8.05825 11.3182C8.08633 11.4748 8.13126 11.6873 8.1818 11.7097C8.19302 11.7152 8.15934 11.8494 8.19302 11.9892C7.79996 12.3136 6.9183 13.13 6.84532 14.0527C6.84532 14.0918 7.07553 14.0303 7.2103 13.9576C7.21595 13.9465 7.098 14.254 7.17101 14.6287C7.17101 14.651 7.40126 14.5895 7.52478 14.4721C7.54164 14.4553 7.47424 14.8635 7.63708 15.1767C7.64833 15.1935 7.91226 15.0816 8.0021 14.9866C8.01896 14.9642 8.01896 15.4955 8.2885 15.7471C8.31096 15.7694 8.55804 15.6185 8.74896 15.3277C8.7546 15.3109 8.90619 15.7471 9.28243 15.9987C9.31054 16.0211 9.69238 15.7471 9.92263 15.255C9.92263 15.2326 10.1978 15.5905 10.4392 15.652C10.4505 15.6632 10.6077 15.5402 10.7032 15.0481C10.7144 15.0201 10.866 15.1879 11.0626 15.2046C11.085 15.2046 11.2198 14.953 11.231 14.5504C11.231 14.528 11.4332 14.6622 11.6578 14.6343C11.6803 14.6343 11.7196 14.2205 11.641 13.9017C11.641 13.8682 11.7982 14.008 11.9723 13.9688C12.0004 13.9688 11.9667 12.8225 10.5572 11.8383C10.5628 11.7991 10.5684 11.7712 10.574 11.7656C10.6246 11.7488 10.6526 11.5028 10.6751 11.3182C10.7369 11.2623 10.793 11.212 10.8492 11.156C10.8997 11.1952 10.9559 11.2287 11.0176 11.2343C11.1749 11.2399 11.5118 11.4189 11.5736 11.5083C11.7196 11.6705 11.9105 11.7208 12.0004 11.7656C12.517 11.9837 12.9213 11.9054 12.9213 11.8886C12.9213 11.8383 12.8876 11.8047 12.8876 11.8047C12.9775 11.8047 13.2077 11.7376 13.2077 11.732C13.2077 11.7152 13.1965 11.6985 13.1796 11.6649C13.6008 11.7712 14.3701 12.006 14.3533 12.0843C14.3027 12.2241 14.3196 12.336 14.3589 12.431L14.2578 12.5317L13.8928 12.5261L12.5675 13.7619L12.9045 13.7675H12.9157L12.7865 13.9353L13.0168 13.9912L12.9831 14.0583L13.101 14.1366L13.0336 14.3547L13.4604 14.3379L13.5502 14.3714L13.6345 14.6175L13.9377 14.5504L13.8872 14.6566L14.0444 14.7125L14.1006 14.6007L14.1904 14.7573L14.4712 14.6287L14.5667 14.707L14.6902 14.6678L14.9036 14.8076L15.1956 13.2307L14.9934 12.9678L15.0103 12.8784C15.0215 12.884 15.0327 12.884 15.0327 12.884C15.0327 12.884 15.0327 12.8784 15.0384 12.8672C15.2461 13.1133 15.4708 12.6939 15.5381 12.6882C16.2513 12.6491 15.8807 12.1346 15.9144 12.0955C16.3243 11.76 16.1221 11.5755 15.9874 11.4972L18.301 9.73566L18.3796 10.0265L18.9187 9.13733L17.9079 9.5064L18.2167 9.64621L17.1779 10.4347L17.5316 9.65178L17.3856 9.72448L17.9472 9.15411L17.9528 9.16529L17.9584 9.14293L18.812 8.28176L18.9299 8.56696L19.3623 7.62188L18.3964 8.09722L18.7165 8.18667L18.0539 8.86891L18.2729 8.19789L18.0932 8.3153L18.6997 7.55479L18.8176 7.80084ZM17.7787 6.82783L17.8405 6.90052L17.6664 7.05709L17.7787 6.82783ZM17.2733 7.83999L17.5036 7.38705H17.6215L17.3014 7.94623L17.3182 7.79523L17.2733 7.83999ZM17.2846 6.76071L17.5878 6.75513L17.2565 7.4038L17.2846 6.76071ZM17.2621 8.2594L17.7282 7.43734L17.8742 7.61631L17.2284 8.57814L17.2621 8.2594ZM1.86434 9.16529C1.86434 9.16529 1.71271 8.70117 1.77447 8.5222C1.78012 8.51663 1.78012 8.50545 1.78012 8.49984C1.80255 8.51102 1.83066 8.51663 1.85874 8.51663C1.89242 8.51663 1.9261 8.50545 1.95418 8.49423C1.97104 8.68438 1.98786 8.9584 1.86434 9.16529ZM1.99911 9.38898C2.02719 9.41692 2.07212 9.44489 2.11142 9.45607C2.10581 9.55673 2.11142 9.67415 2.13388 9.74127C2.13949 9.73566 1.99911 9.5847 1.99911 9.38898ZM2.35849 10.0768C2.36413 10.0768 2.36974 10.0768 2.37535 10.0768C2.39781 10.0768 2.42589 10.0712 2.44836 10.0656C2.47083 10.1774 2.51012 10.2781 2.53819 10.3676C2.5438 10.3732 2.44836 10.2725 2.35849 10.0768ZM9.96192 11.5643V7.75051H10.3999V11.2343C10.2652 11.3518 10.1192 11.458 9.96192 11.5643ZM9.55761 11.7991C9.4846 11.8383 9.40598 11.8774 9.32736 11.911C9.24874 11.8774 9.17013 11.8327 9.09712 11.7991V7.7449H9.552L9.55761 11.7991ZM8.69841 11.5698C8.54121 11.4692 8.39519 11.3573 8.25481 11.2399V7.75608H8.69841V11.5698ZM7.85611 10.8541C7.69327 10.6751 7.54725 10.485 7.41808 10.2837V7.75608H7.85611V10.8541ZM7.00817 9.4281C6.99131 9.37219 6.97445 9.31629 6.95202 9.26035C6.78914 8.73471 6.73863 8.22025 6.73298 7.75051H7.00817V9.4281ZM10.8099 7.75051H11.2535V10.2669C11.1243 10.4738 10.9783 10.6639 10.8099 10.8485V7.75051ZM11.9274 7.75051C11.9274 8.21464 11.8656 8.7291 11.714 9.25478C11.6971 9.31629 11.6803 9.37219 11.6522 9.4337V7.75608H11.9274V7.75051ZM6.99692 5.93311C8.2211 6.58739 9.07468 5.89396 9.32736 5.6423C9.42845 5.74858 9.63623 5.92751 9.92824 6.05614C10.3045 6.22389 10.911 6.33573 11.6634 5.93311C11.7308 6.14562 11.8937 6.73277 11.9217 7.4821H6.73298C6.77231 6.73277 6.92955 6.15119 6.99692 5.93311ZM17.6552 8.81858L17.6777 8.82419L17.3351 9.21563L17.6552 8.81858ZM17.1386 9.37219L17.1667 9.40016L17.1105 9.46167L17.1386 9.37219ZM17.0038 7.67221L17.088 7.75608L16.8241 8.28176L16.6949 8.41036L17.0038 7.67221ZM16.8971 9.40574L17.015 9.57352L15.8021 10.9771L16.8971 9.40574ZM16.0098 10.4571L16.6332 9.33304L16.7904 9.34422L16.0098 10.4571ZM16.7904 9.05345L16.9589 8.75146L17.0487 8.84655L16.7904 9.05345ZM16.577 8.6732L16.7792 8.66759L15.9144 10.2334L16.577 8.6732ZM16.1053 8.5222L15.9593 8.95279L15.8863 8.56696L16.1053 8.5222ZM15.3865 10.6416L15.7291 8.93603L15.92 9.06463L15.3865 10.6416ZM15.4876 10.7646L16.2288 8.56696L16.3692 8.67877L15.4876 10.7646ZM15.6111 11.4021L16.6669 10.1719L16.8578 10.2334L15.6167 11.4021C15.6167 11.4021 15.6167 11.4021 15.6111 11.4021ZM15.8189 11.4301C15.8077 11.4245 15.7965 11.4245 15.7852 11.4189L16.9645 10.3117L17.0375 10.513L15.8189 11.4301ZM16.9645 9.91462L16.8353 9.98732L17.7843 8.89128L17.863 9.01991L16.9645 9.91462Z" fill="white" />
            </svg>

            <span className='text-[12px] leading-[115%] font-[400] text-white -tracking-[.24px]'>PROUDLY MADE IN AMERICA</span>
          </div>

          <div className='w-full flex flex-col gap-[16px] mb-[72px] md:mb-[32px]'>
            <h1 className='text-[26px] md:text-[40px] font-[500] leading-[115%] -tracking-[1.3px] md:-tracking-[2px] uppercase text-white text-center'>From Bodycam to Reports in Seconds</h1>
            <span className='text-[14px] leading-[150%] font-[400] -tracking-[.42px] text-center opacity-[.8] text-white'>Meet the AI-powered video analysis and report generation system for modern law enforcement.</span>
          </div>

          <a href='https://cal.com/codefour' target='_blank' rel='noopener noreferrer' className='max-md:w-full py-[8px] pl-[16px] pr-[14px] h-[44px] flex items-center justify-center gap-[8px] select-none cursor-pointer group relative border-[.5px] border-[rgba(255,255,255,0.20)] bg-white backdrop-blur-[15px] hover:bg-[rgba(0,0,0,0.20)] transition-all duration-300'>
            {/* Top Left */}
            <svg className='absolute -top-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M0.25 7.25V0.25H7.25" stroke="white" strokeWidth="0.5" />
            </svg>
            {/* Top Right */}
            <svg className='absolute -top-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M7 7.25V0.25H2.6077e-07" stroke="white" strokeWidth="0.5" />
            </svg>
            {/* Bottom Left */}
            <svg className='absolute -bottom-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M0.25 0V7H7.25" stroke="white" strokeWidth="0.5" />
            </svg>
            {/* Bottom Right */}
            <svg className='absolute -bottom-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M7 0V7H2.6077e-07" stroke="white" strokeWidth="0.5" />
            </svg>

            <span className='text-[14px] leadcing-[100%] font-[500] -tracking-[.28px] uppercase text-black group-hover:text-white transition-all duration-300'>request a demo</span>

            <svg className='w-[16px] h-[16px]' xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path className='group-hover:stroke-white transition-all duration-300' d="M6.99943 2.91724L11.0828 7.00057L6.99943 11.0839" stroke="black" strokeWidth="1.16667" />
              <path className='group-hover:stroke-white transition-all duration-300' d="M2.9161 7L11.0828 7" stroke="black" strokeWidth="1.16667" />
            </svg>
          </a>
        </div>

        <div className='w-full h-auto md:h-[327px] flex justify-center overflow-hidden'>
          <div className='w-full h-auto md:h-[280px] flex items-center justify-center gap-[16px]'>
            <div className='min-w-[451px] h-[209px] relative hidden md:flex items-center justify-center border-[rgba(255,255,255,0.10)] border-opacity-50 opacity-[.2]'>
              <Image
                src={'/codefour/hero/carousel-01.png'}
                width={604}
                height={280}
                draggable={false}
                alt='Code Four'
                quality={100}
                className='w-full h-full object-cover'
              />
            </div>

            <div className='min-w-[451px] h-[209px] relative hidden md:flex items-center justify-center border-[rgba(255,255,255,0.10)] border-opacity-50 opacity-[.5]'>
              <Image
                src={'/codefour/hero/carousel-01.png'}
                width={604}
                height={280}
                draggable={false}
                alt='Code Four'
                quality={100}
                className='w-full h-full object-cover'
              />
            </div>

            <div className='w-full md:min-w-[604px] h-full relative flex max-md:flex-col items-center justify-center max-md:gap-[8px] border-white border-opacity-70 shadow-[0_0_20px_rgba(0,0,0,0.5)]'>
              <Image
                src={'/codefour/hero/carousel-02.png'}
                width={604}
                height={280}
                draggable={false}
                alt='Code Four'
                quality={100}
                className='w-full h-full object-cover'
              />

              <div className='relative md:absolute md:top-[calc(100%+15px)] md:left-0 flex flex-col gap-[9px] w-full'>
                <div className='w-full flex justify-between items-center gap-[24px]'>
                  <h5 className='text-[7px] md:text-[12px] leading-[115%] -tracking-[.24px] text-white uppercase font-[400]'>The suspect fled on foot, prompting officers to initiate a pursuit.</h5>
                  <span className='text-[7px] md:text-[12px] leading-[115%] -tracking-[.24px] text-white uppercase font-[400] opacity-[.6]'>SHOW TRANSCRIPT</span>
                </div>

                <div className='w-full flex items-center gap-[8px]'>
                  <span className='whitespace-nowrap text-[6px] md:text-[10px] leading-[115%] -tracking-[.02px] text-white uppercase font-[400] opacity-[.8]'>From: 16:43:32 -0700</span>

                  <div className='w-full h-[1px] relative'>
                    <div className='relative h-[1px] w-[25%] bg-white'>
                      <div className='absolute top-1/2 right-0 -translate-y-1/2 w-[1px] h-[9px] bg-white'></div>
                    </div>

                    <div className='absolute top-1/2 left-0 w-full h-[.5px] -translate-y-1/2 bg-white opacity-[.2]'></div>
                  </div>

                  <span className='whitespace-nowrap text-[6px] md:text-[10px] leading-[115%] -tracking-[.02px] text-white uppercase font-[400] opacity-[.8]'>To: 17:23:02 -0700</span>
                </div>
              </div>
            </div>

            <div className='min-w-[451px] h-[209px] relative hidden md:flex items-center justify-center border-[rgba(255,255,255,0.10)] border-opacity-50 opacity-[.5]'>
              <Image
                src={'/codefour/hero/carousel-03.png'}
                width={604}
                height={280}
                draggable={false}
                alt='Code Four'
                quality={100}
                className='w-full h-full object-cover'
              />
            </div>

            <div className='min-w-[451px] h-[209px] relative hidden md:flex items-center justify-center border-[rgba(255,255,255,0.10)] border-opacity-50 opacity-[.2 ]'>
              <Image
                src={'/codefour/hero/carousel-03.png'}
                width={604}
                height={280}
                draggable={false}
                alt='Code Four'
                quality={100}
                className='w-full h-full object-cover'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Never Miss A Frame */}
      <div ref={neverMissAFrame} className='w-full h-[230vh] relative'>
        <div className='content__block w-full h-[100vh] overflow-hidden relative border-b border-[rgba(255,255,255,0.10)]'>
          {/* Noise Bg */}
          <div className='absolute top-0 left-0 w-full h-[525px] pointer-events-none opacity-[.3]'>
            <Image
              src={'/codefour/sections/never-miss-frame/background-noise.png'}
              width={1440}
              height={525}
              quality={100}
              alt='Code Four'
              draggable={false}
              className='w-full h-full object-cover mix-blend-exclusion'
            />
          </div>

          {/* Dots Bg */}
          <div className='absolute top-0 left-0 w-full h-full flex items-center pointer-events-none opacity-[1]'>
            <Image
              src={'/codefour/sections/never-miss-frame/background-dots.png'}
              width={1440}
              height={626}
              quality={100}
              alt='Code Four'
              draggable={false}
              className='w-full h-full object-cover mix-blend-exclusion'
            />
          </div>

          <div className='absolute top-0 left-0 w-full h-[100vh] flex items-center justify-center z-20'>
            <div className='flex flex-col max-w-[418px] items-center gap-[16px] max-md:px-[16px]'>
              <h2 className='text-[26px] md:text-[40px] leading-[115%] -tracking-[1.3px] md:-tracking-[2px] font-[500] text-white text-center uppercase [text-shadow:0_0_30px_rgba(0,0,0,0.25)] inline'>
                never miss a <p className='inline-flex relative w-[90px] md:w-[140px] h-[32px] md:h-[44px] justify-center items-center bg-[rgba(255,255,255,0.10)] border-[.5px] border-[rgba(255,255,255,0.20)] backdrop-blur-[15px] p-[]'>
                  frame
                  {/* Top Left */}
                  <svg className='absolute -top-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M0.25 7.25V0.25H7.25" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Top Right */}
                  <svg className='absolute -top-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M7 7.25V0.25H2.6077e-07" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Bottom Left */}
                  <svg className='absolute -bottom-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M0.25 0V7H7.25" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Bottom Right */}
                  <svg className='absolute -bottom-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M7 0V7H2.6077e-07" stroke="white" strokeWidth="0.5" />
                  </svg>
                </p>
              </h2>

              <span className='text-[14px] leading-[150%] text-center -tracking-[.42px] font-[400] text-white opacity-[.8] [text-shadow:0_0_30px_rgba(0,0,0,0.25)]'>Code Four ingests audio, visual, and other meta data from each frame of an officer&apos;s body-worn camera to create a comprehensive narrative of every situation.</span>
            </div>
          </div>

          {/* Web Connections SVG - Animated lines that draw as frames appear */}
          <svg className='absolute top-0 left-0 w-full h-full z-5 pointer-events-none'>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
              </linearGradient>
            </defs>
            {/* Web connections between frames - each line animates when both connected frames are visible */}
            {/* Desktop connections */}
            {webConnections.map((conn, i) => (
              <line
                key={i}
                ref={(el) => { if (el) webLinesRef.current[i] = el; }}
                x1={conn.x1}
                y1={conn.y1}
                x2={conn.x2}
                y2={conn.y2}
                stroke="url(#lineGradient)"
                strokeWidth="1"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                className="hidden md:block"
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            ))}
            {/* Mobile connections - animated like desktop, draw after frames are stationary */}
            {mobileWebConnections.map((conn, i) => (
              <line
                key={`mobile-${i}`}
                ref={(el) => { if (el) mobileWebLinesRef.current[i] = el; }}
                x1={conn.x1Mobile}
                y1={conn.y1Mobile}
                x2={conn.x2Mobile}
                y2={conn.y2Mobile}
                stroke="url(#lineGradient)"
                strokeWidth="1"
                strokeDasharray="1000"
                strokeDashoffset="1000"
                className="md:hidden"
                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
              />
            ))}
          </svg>

          {/* Images Block */}
          <div className='slider absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d] [perspective:500px] w-full h-full z-10'>
            {
              slidesData.map((slide, i) => (
                <div
                  key={i}
                  ref={(el) => {
                    if (el) slidesRef.current[i] = el;
                  }}
                  className={`slide__wrapper md:absolute top-1/2 left-1/2 opacity-0 ${!slide.showOnMobile ? 'hidden md:block' : ''}`}
                  style={{
                    willChange: 'transform, opacity',
                    transition: 'opacity .3s ease-in'
                  }}
                >
                  <div className={`slide-img__wrapper`} style={{
                    // Scale frame sizes based on viewport width
                    // Desktop: 1440px base design, Mobile: use mobileWidth if defined
                    width: `clamp(${(slide.mobileWidth || slide.width * 0.65)}px, ${(slide.width / 1440) * 100}vw, ${slide.width}px)`,
                    height: 'auto',
                    aspectRatio: `${slide.width} / ${slide.height}`
                  }}>
                    <Image
                      src={slide.img}
                      width={slide.width}
                      height={slide.height}
                      quality={100}
                      draggable={false}
                      alt={`image ${i + 1}`}
                      className={`object-cover w-full h-full`}
                    />

                    <svg className='absolute -top-[5px] -left-[5px]' xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 7 7" fill="none">
                      <rect x="3" width="1" height="7" fill="white" />
                      <rect x="7" y="3" width="1" height="7" transform="rotate(90 7 3)" fill="white" />
                    </svg>
                    <svg className='absolute -top-[5px] -right-[5px]' xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 7 7" fill="none">
                      <rect x="3" width="1" height="7" fill="white" />
                      <rect x="7" y="3" width="1" height="7" transform="rotate(90 7 3)" fill="white" />
                    </svg>
                    <svg className='absolute -bottom-[5px] -left-[5px]' xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 7 7" fill="none">
                      <rect x="3" width="1" height="7" fill="white" />
                      <rect x="7" y="3" width="1" height="7" transform="rotate(90 7 3)" fill="white" />
                    </svg>
                    <svg className='absolute -bottom-[5px] -right-[5px]' xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 7 7" fill="none">
                      <rect x="3" width="1" height="7" fill="white" />
                      <rect x="7" y="3" width="1" height="7" transform="rotate(90 7 3)" fill="white" />
                    </svg>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Our Products */}
      <div className='w-full h-auto relative flex bg-black border-b border-[rgba(255,255,255,0.10)]'>
        <div className='w-full h-[200vh] px-[16px] md:px-[48px] xl:px-[64px] 2xl:px-[80px] flex items-start lg:items-center relative overflow-hidden justify-end gap-[64px] 2xl:gap-[264px]'>
          {/* Gradient Top */}
          <div ref={ourProductGradient} className='flex md:hidden lg:flex absolute top-[238px] md:top-[238px] lg:top-0 left-0 w-full h-[180px] md:h-[311px] lg:h-[311px] z-10 pointer-events-none' style={{ background: 'linear-gradient(180deg, #000 20%, rgba(0, 0, 0, 0.00) 100%)' }}></div>

          {/* Left Block */}
          <div ref={ourProductLeftBlock} className='max-w-[1280px] w-full relative mx-auto flex flex-col lg:gap-[172px] z-0'>
            {/* Single Product Item */}
            <div className='single-product__card max-w-[100%] lg:max-w-[418px] w-full lg:w-[40%] max-lg:h-[100vh] flex flex-col max-lg:justify-end items-start gap-[32px] py-[56px] lg:py-[32px]'>
              <span className={`text-[16px] leading-[115%] -tracking-[.08px] font-[500] text-white uppercase transition-opacity duration-500 ${ourProductSelectedIndex === 0 ? 'opacity-[.6]' : 'opacity-[.3]'}`}>Our products</span>
              
              <div className='w-full flex flex-col gap-[16px] pt-[32px] lg:pt-0 lg:border-t lg:border-b border-[rgba(255,255,255,0.10)]'>
                <div className='w-full flex flex-col gap-[8px] items-start lg:pt-[32px]'>
                  <h2 className={`text-[24px] md:text-[48px] leading-[115%] font-[500] -tracking-[1.2px] md:-tracking-[2px] text-white uppercase transition-all duration-500 ${ourProductSelectedIndex === 0 ? 'opacity-100' : 'opacity-[.7]'}`}>report</h2>
                  <span className={`flex max-w-[347px] text-[14px] leading-[150%] -tracking-[.42px] font-[400] text-white transition-opacity duration-500 ${ourProductSelectedIndex === 0 ? 'opacity-[.8]' : 'opacity-[.5]'}`}>AI-powered video analysis that transforms body-cam footage into comprehensive, ready-to-file reports.</span>
                </div>

                <div className='flex max-md:flex-col max-md:w-full md:items-center gap-[16px] lg:pb-[32px]'>
                {/* Custom Button */}
                <Link href='/products/report' className='py-[8px] pl-[16px] pr-[14px] h-[44px] flex items-center justify-center gap-[8px] select-none cursor-pointer group relative border-[.5px] border-[rgba(255,255,255,0.20)] bg-white backdrop-blur-[15px] hover:bg-[rgba(0,0,0,0.20)] transition-all duration-300'>
                  {/* Top Left */}
                  <svg className='absolute -top-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M0.25 7.25V0.25H7.25" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Top Right */}
                  <svg className='absolute -top-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M7 7.25V0.25H2.6077e-07" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Bottom Left */}
                  <svg className='absolute -bottom-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M0.25 0V7H7.25" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Bottom Right */}
                  <svg className='absolute -bottom-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M7 0V7H2.6077e-07" stroke="white" strokeWidth="0.5" />
                  </svg>

                  <span className='text-[14px] leadcing-[100%] font-[500] -tracking-[.28px] uppercase text-black group-hover:text-white transition-all duration-300'>learn more</span>

                  <svg className='w-[16px] h-[16px]' xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path className='group-hover:stroke-white transition-all duration-300' d="M6.99943 2.91724L11.0828 7.00057L6.99943 11.0839" stroke="black" strokeWidth="1.16667" />
                    <path className='group-hover:stroke-white transition-all duration-300' d="M2.9161 7L11.0828 7" stroke="black" strokeWidth="1.16667" />
                  </svg>
                </Link>

                {/* Custom Button */}
                <Link href='/connect' className='py-[8px] pl-[16px] pr-[14px] h-[44px] flex items-center justify-center gap-[8px] select-none cursor-pointer group relative border-[.5px] border-[rgba(255,255,255,0.20)] bg-[rgba(0,0,0,0.20)] backdrop-blur-[15px] hover:bg-white transition-all duration-300'>
                  {/* Top Left */}
                  <svg className='absolute -top-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M0.25 7.25V0.25H7.25" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Top Right */}
                  <svg className='absolute -top-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M7 7.25V0.25H2.6077e-07" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Bottom Left */}
                  <svg className='absolute -bottom-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M0.25 0V7H7.25" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Bottom Right */}
                  <svg className='absolute -bottom-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M7 0V7H2.6077e-07" stroke="white" strokeWidth="0.5" />
                  </svg>

                  <span className='text-[14px] leadcing-[100%] font-[500] -tracking-[.28px] uppercase text-white group-hover:text-black transition-all duration-300'>see it in action</span>

                  <svg className='w-[16px] h-[16px]' xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path className='group-hover:stroke-black transition-all duration-300' d="M6.99943 2.91724L11.0828 7.00057L6.99943 11.0839" stroke="white" strokeWidth="1.16667" />
                    <path className='group-hover:stroke-black transition-all duration-300' d="M2.9161 7L11.0828 7" stroke="white" strokeWidth="1.16667" />
                  </svg>
                </Link>
              </div>
              </div>
            </div>

            {/* Single Product Item */}
            <div className='single-product__card max-w-[100%] lg:max-w-[418px] w-full lg:w-[40%] max-lg:h-[100vh] flex flex-col max-lg:justify-end items-start gap-[32px] py-[56px] lg:py-[32px] lg:border-t lg:border-b border-[rgba(255,255,255,0.10)]'>
              <div className='w-full flex flex-col gap-[16px]'>
                <div className='w-full flex flex-col gap-[8px] items-start'>
                  <h2 className={`text-[24px] md:text-[48px] leading-[115%] font-[500] -tracking-[1.2px] md:-tracking-[2px] text-white uppercase transition-all duration-500 ${ourProductSelectedIndex === 1 ? 'opacity-100' : 'opacity-[.7]'}`}>REDACTIONS</h2>
                  <span className={`flex max-w-[347px] text-[14px] leading-[150%] -tracking-[.42px] font-[400] text-white transition-opacity duration-500 ${ourProductSelectedIndex === 1 ? 'opacity-[.8]' : 'opacity-[.5]'}`}>Most powerful redaction tool for all your FOIA requests</span>
                </div>
              </div>

              <div className='flex max-md:flex-col max-md:w-full md:items-center gap-[16px]'>
                {/* Custom Button */}
                <Link href='/products/redactions' className='py-[8px] pl-[16px] pr-[14px] h-[44px] flex items-center justify-center gap-[8px] select-none cursor-pointer group relative border-[.5px] border-[rgba(255,255,255,0.20)] bg-white backdrop-blur-[15px] hover:bg-[rgba(0,0,0,0.20)] transition-all duration-300'>
                  {/* Top Left */}
                  <svg className='absolute -top-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M0.25 7.25V0.25H7.25" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Top Right */}
                  <svg className='absolute -top-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M7 7.25V0.25H2.6077e-07" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Bottom Left */}
                  <svg className='absolute -bottom-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M0.25 0V7H7.25" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Bottom Right */}
                  <svg className='absolute -bottom-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M7 0V7H2.6077e-07" stroke="white" strokeWidth="0.5" />
                  </svg>

                  <span className='text-[14px] leadcing-[100%] font-[500] -tracking-[.28px] uppercase text-black group-hover:text-white transition-all duration-300'>learn more</span>

                  <svg className='w-[16px] h-[16px]' xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path className='group-hover:stroke-white transition-all duration-300' d="M6.99943 2.91724L11.0828 7.00057L6.99943 11.0839" stroke="black" strokeWidth="1.16667" />
                    <path className='group-hover:stroke-white transition-all duration-300' d="M2.9161 7L11.0828 7" stroke="black" strokeWidth="1.16667" />
                  </svg>
                </Link>

                {/* Custom Button */}
                <Link href='/connect' className='py-[8px] pl-[16px] pr-[14px] h-[44px] flex items-center justify-center gap-[8px] select-none cursor-pointer group relative border-[.5px] border-[rgba(255,255,255,0.20)] bg-[rgba(0,0,0,0.20)] backdrop-blur-[15px] hover:bg-white transition-all duration-300'>
                  {/* Top Left */}
                  <svg className='absolute -top-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M0.25 7.25V0.25H7.25" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Top Right */}
                  <svg className='absolute -top-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M7 7.25V0.25H2.6077e-07" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Bottom Left */}
                  <svg className='absolute -bottom-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M0.25 0V7H7.25" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Bottom Right */}
                  <svg className='absolute -bottom-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M7 0V7H2.6077e-07" stroke="white" strokeWidth="0.5" />
                  </svg>

                  <span className='text-[14px] leadcing-[100%] font-[500] -tracking-[.28px] uppercase text-white group-hover:text-black transition-all duration-300'>see it in action</span>

                  <svg className='w-[16px] h-[16px]' xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path className='group-hover:stroke-black transition-all duration-300' d="M6.99943 2.91724L11.0828 7.00057L6.99943 11.0839" stroke="white" strokeWidth="1.16667" />
                    <path className='group-hover:stroke-black transition-all duration-300' d="M2.9161 7L11.0828 7" stroke="white" strokeWidth="1.16667" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Block */}
          <div ref={ourProductRightBlock} className='absolute top-0 right-0 w-full h-[100vh] px-[15px] md:px-[44px] xl:px-[64px] 2xl:px-[80px] flex pointer-events-none max-lg:z-10'>
            {/* Tablet & Mobile Layer For Visibility */}
            <div className='flex lg:hidden absolute top-0 left-0 w-full h-[calc(238px+10%)] md:h-[5%] bg-black z-0'></div>

            <div className='max-w-[1280px] w-full mx-auto flex items-center justify-end relative z-10'>
              <div className='w-full lg:w-[60%] h-[100vh] flex justify-end items-start lg:items-center'>
                <div className={`w-full h-[238px] md:h-auto aspect-[1920/1202] flex items-center justify-center relative max-md:top-[10%] max-lg:top-[5%] overflow-hidden border bg-black lg:bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.1)_100%)] shadow-[0_4px_250px_0_rgba(255,255,255,0.10)] transition-all duration-700 ease-out ${ourProductSelectedIndex === 0 ? 'border-[rgba(255,255,255,0.15)] scale-[0.98]' : 'border-[rgba(255,255,255,0.20)] scale-100'}`}>
                  <Image
                    src='/codefour/hero/carousel-02.png'
                    width={1920}
                    height={1202}
                    quality={100}
                    alt='Code Four Report'
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${ourProductSelectedIndex === 0 ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <Image
                    src='/codefour/hero/carousel-02.png'
                    width={1920}
                    height={1202}
                    quality={100}
                    alt='Code Four Redactions'
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${ourProductSelectedIndex === 1 ? 'opacity-100' : 'opacity-0'}`}
                  />

                  {/* Top Left */}
                  <svg className='absolute top-0 left-0' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M0.25 7.25V0.25H7.25" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Top Right */}
                  <svg className='absolute top-0 right-0' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M7 7.25V0.25H2.6077e-07" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Bottom Left */}
                  <svg className='absolute bottom-0 left-0' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M0.25 0V7H7.25" stroke="white" strokeWidth="0.5" />
                  </svg>
                  {/* Bottom Right */}
                  <svg className='absolute bottom-0 right-0' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M7 0V7H2.6077e-07" stroke="white" strokeWidth="0.5" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Code Four */}
      <div className='w-full h-auto relative flex pt-[48px] md:pt-[90px] pb-[48px] md:pb-[172px] px-[16px] md:px-[48px] xl:px-[64px] 2xl:px-[80px] overflow-hidden border-b border-[rgba(255,255,255,0.10)]'>
        <div className='max-w-[1280px] w-full mx-auto flex flex-col items-center gap-[48px] md:gap-[69px]'>
          {/* Top Block */}
          <div className='max-w-[502px] w-full flex flex-col items-center gap-[12px] max-md:px-[32px]'>
            <h2 className='text-[26px] md:text-[40px] leading-[115%] font-[500] -tracking-[1.3px] md:-tracking-[2px] text-center text-white uppercase'>Why Choose Code Four?</h2>
            <span className='flex text-[14px] leading-[150%] -tracking-[.42px] font-[400] text-center text-white opacity-[.8]'>We&apos;re transforming the modern law enforcement workflow.</span>
          </div>

          {/* Bottom Block */}
          <div className='w-full flex max-lg:flex-col max-lg:flex-nowrap max-xl:flex-wrap items-start justify-start gap-x-[24px] gap-y-[24px] md:gap-y-[96px]'>
            <div className={`${whyChooseActiveIndex === 0 ? 'w-[100%] lg:w-[50%]' : 'w-full lg:w-[390px]'} lg:h-[500px] relative flex flex-col items-start gap-[16px] md:gap-[24px] transition-all duration-500`} onMouseEnter={() => setWhyChooseActiveIndex(0)}>
              <div className={`${whyChooseActiveIndex === 0 ? 'w-full' : 'w-full lg:w-0'} h-full border-r border-[#333] transition-all duration-500`}>
                <Image
                  src={'/codefour/features/lightning_fast.png'}
                  width={627}
                  height={374}
                  alt='Code Four'
                  draggable={false}
                  quality={100}
                  className='w-full h-full object-cover'
                />
              </div>

              <div className='lg:absolute lg:top-[calc(100%+24px)] lg:left-0 w-full flex max-md:flex-col items-start justify-between gap-[12px] md:gap-[24px]'>
                <h5 className='text-[18px] leading-[115%] font-[500] -tracking-[.9px] text-white uppercase whitespace-nowrap'>Lightning Fast </h5>
                <span className={`flex w-full max-w-[374px] text-[14px] leading-[150%] -tracking-[.42px] font-[400] text-white ${whyChooseActiveIndex === 0 ? 'opacity-[.8]' : 'opacity-[.8] lg:opacity-0'} transition-all duration-500`}>Process hours of footage in minutes, with results delivered in seconds. Our AI works at speeds that revolutionize your workflow.</span>
              </div>
            </div>

            <div className={`${whyChooseActiveIndex === 1 ? 'w-[100%] lg:w-[50%]' : 'w-full lg:w-[390px]'} lg:h-[500px] relative flex flex-col items-start gap-[16px] md:gap-[24px] transition-all duration-500`} onMouseEnter={() => setWhyChooseActiveIndex(1)}>
              <div className={`${whyChooseActiveIndex === 1 ? 'w-full' : 'w-full lg:w-0'} h-full border-r border-[#333] transition-all duration-500`}>
                <Image
                  src={'/codefour/features/unmatched_security.jpg'}
                  width={627}
                  height={374}
                  alt='Code Four'
                  draggable={false}
                  quality={100}
                  className='w-full h-full object-cover'
                />
              </div>

              <div className='lg:absolute lg:top-[calc(100%+24px)] lg:left-0 w-full flex max-md:flex-col items-start justify-between gap-[12px] md:gap-[24px]'>
                <h5 className='text-[18px] leading-[115%] font-[500] -tracking-[.9px] text-white uppercase whitespace-nowrap'>Unmatched Security</h5>
                <span className={`flex w-full max-w-[374px] text-[14px] leading-[150%] -tracking-[.42px] font-[400] text-white ${whyChooseActiveIndex === 1 ? 'opacity-[.8]' : 'opacity-[.8] lg:opacity-0'} transition-all duration-500`}>Enterprise-grade security with end-to-end encryption and compliance with FBI Criminal Justice Information Services equivalency along with a fully protected chain of custody.</span>
              </div>
            </div>

            <div className={`${whyChooseActiveIndex === 2 ? 'w-[100%] lg:w-[50%]' : 'w-full lg:w-[390px]'} lg:h-[500px] relative flex flex-col items-start gap-[16px] md:gap-[24px] transition-all duration-500`} onMouseEnter={() => setWhyChooseActiveIndex(2)}>
              <div className={`${whyChooseActiveIndex === 2 ? 'w-full' : 'w-full lg:w-0'} h-full border-r border-[#333] transition-all duration-500`}>
                <Image
                  src={'/codefour/features/department_ready.png'}
                  width={627}
                  height={374}
                  alt='Code Four'
                  draggable={false}
                  quality={100}
                  className='w-full h-full object-cover'
                />
              </div>

              <div className='lg:absolute lg:top-[calc(100%+24px)] lg:left-0 w-full flex max-md:flex-col items-start justify-between gap-[12px] md:gap-[24px] transition-all duration-500'>
                <h5 className='text-[18px] leading-[115%] font-[500] -tracking-[.9px] text-white uppercase whitespace-nowrap'>Department-Ready</h5>
                <span className={`flex w-full max-w-[374px] text-[14px] leading-[150%] -tracking-[.42px] font-[400] text-white ${whyChooseActiveIndex === 2 ? 'opacity-[.8]' : 'opacity-[.8] lg:opacity-0'} transition-all duration-500`}>Designed with input from law enforcement professionals, our solution integrates seamlessly with existing workflows and RMS/CAD systems.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className='overflow-hidden w-full h-auto relative flex pt-[48px] pb-[98px] md:py-[80px] px-[16px] md:px-[48px] xl:px-[64px] 2xl:px-[80px] border-b border-[rgba(255,255,255,0.10)]'>
        <div className='max-w-[1280px] w-full mx-auto flex max-lg:flex-col items-start gap-[20px] lg:gap-[64px]'>
          {/* Left Block */}
          <div className='py-[16px] w-full flex flex-col items-center md:items-start gap-[12px]'>
            <h2 className='text-[26px] md:text-[32px] leading-[115%] font-[500] max-md:text-center -tracking-[1.3px] md:-tracking-[1.6px] text-white uppercase'>Frequently Asked Questions</h2>
            <span className='flex text-[14px] leading-[150%] -tracking-[.42px] max-md:text-center font-[400] text-white opacity-[.8]'>Answers to your burning questions</span>
          </div>

          {/* Right Block */}
          <div className='w-full'>
            {[
              {
                question: "Does it matter what bodyworn camera provider we use?",
                answer: "Code Four is able to integrate and build on-top of any bodyworn camera system, including Axon, LensLock, i-PRO, Motorola, Getac, and others."
              },
              {
                question: "What does it cost?",
                answer: "$35/month per officer who uses the platform."
              },
              {
                question: "Is Code Four CJIS compliant?",
                answer: "Yes, we meet all CJIS controls including keeping a chain of custody, encryption in transit/at rest, and others to ensure your department's data is safe. We are also working on a state-by-state level with State Emergency Management Agencies (SEMAs) to ensure full compliance."
              },
              {
                question: "Does it hold up in court?",
                answer: "Think of us as a copilot - we provide suggestions for the first draft of the report. The officer reviews the report and submits the final version to court. Officers still own what they write and sign at the end of the day."
              },
              {
                question: "How do you mitigate the integration of AI systems in policing?",
                answer: "While there are risks to all frontier technologies, Code Four is not meant to replace officer report writing. Code Four creates an ecosystem where the officer can be the verifier rather than the creator of reports. We also build in safeguards, draft versioning, and a full chain of custody to meet any compliance standard and ensure full transparency."
              },
              {
                question: "What is your typical implementation timeline?",
                answer: "For most departments, our solution can be fully implemented within days, with minimal disruption to existing workflows."
              },
              {
                question: "How does Code Four integrate with existing systems?",
                answer: "Our platform is designed to integrate seamlessly with most records management systems (RMS) and computer-aided dispatch (CAD) solutions already in use by departments."
              },
              {
                question: "What languages do you support?",
                answer: "We support over 40 major languages including English, Spanish, Chinese, and more, as well as strong understanding of different dialects and accents."
              },
            ].map((faq, index) => (
              <div key={index} className="border-b-[.5px] border-[rgba(255,255,255,0.30)] py-3">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full flex items-center justify-between gap-[20px] text-left py-3"
                >
                  <h3 className="text-[16px] md:text-[18px] leading-[136%] font-[500] -tracking-[0.9px] text-white">{faq.question}</h3>
                  {
                    openFaqIndex !== index ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className='min-w-[24px]' width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12H19M12 5V19"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className='min-w-[24px]' width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <g opacity="0.8">
                          <path
                            d="M5 12H19"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                        </g>
                      </svg>
                    )
                  }
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    maxHeight: openFaqIndex === index ? '200px' : '0',
                    opacity: openFaqIndex === index ? 1 : 0
                  }}
                >
                  <p className="flex text-[14px] leading-[150%] -tracking-[.42px] font-[400] text-white opacity-[.8]">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Capture The Future */}
      <div className='w-full h-auto relative overflow-hidden'>
        {/* Noise Bg */}
        <div className='absolute top-0 left-0 w-full h-full pointer-events-none'>
          <Image
            src={'/codefour/sections/capture-future/background-noise.png'}
            width={1440}
            height={1071}
            quality={100}
            alt='Code Four'
            draggable={false}
            className='w-full h-full object-cover mix-blend-exclusion'
          />
        </div>

        {/* Dots Bg */}
        <div className='absolute -top-[109px] left-0 w-full h-[640px] overflow-hidden flex items-center pointer-events-none opacity-[1]'>
          <Image
            src={'/codefour/sections/capture-future/background-dots.png'}
            width={1440}
            height={690}
            quality={100}
            alt='Code Four'
            draggable={false}
            className='w-full h-[690px] object-cover mix-blend-exclusion'
          />
        </div>

        {/* Light Gradient */}
        <div className='absolute top-[277px] left-0 w-full h-[216px] pointer-events-none'>
          <div className='max-w-[1265px] w-full h-full mx-auto rounded-[100px] opacity-[.4] bg-[radial-gradient(50%_50%_at_50%_50%,#004B9C_42.31%,#001A36_100%)] blur-[150px]'></div>
        </div>

        <div className='w-full h-auto md:h-[462px] flex items-center justify-center z-10'>
          <div className='max-w-[478px] w-full flex flex-col items-center gap-[32px] max-md:px-[16px] py-[80px] md:py-[32px]'>
            <div className='w-full flex flex-col gap-[16px]'>
              <div className='w-full flex flex-col items-center gap-[8px]'>
                <h2 className='text-[26px] md:text-[40px] leading-[115%] font-[500] -tracking-[1.3px] md:-tracking-[2px] text-center text-white uppercase'>Capture the Future, Starting Today.</h2>
                <span className='flex w-full text-[14px] leading-[150%] -tracking-[.42px] text-center font-[400] text-white opacity-[.8]'>Join departments across the country who are saving thousands of hours with our AI-powered solution.</span>
              </div>
            </div>

            <a href='https://cal.com/codefour' target='_blank' rel='noopener noreferrer' className='max-md:w-full py-[8px] pl-[16px] pr-[14px] h-[44px] flex items-center justify-center gap-[8px] select-none cursor-pointer group relative border-[.5px] border-[rgba(255,255,255,0.20)] bg-white backdrop-blur-[15px] hover:bg-[rgba(0,0,0,0.20)] transition-all duration-300'>
              {/* Top Left */}
              <svg className='absolute -top-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M0.25 7.25V0.25H7.25" stroke="white" strokeWidth="0.5" />
              </svg>
              {/* Top Right */}
              <svg className='absolute -top-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M7 7.25V0.25H2.6077e-07" stroke="white" strokeWidth="0.5" />
              </svg>
              {/* Bottom Left */}
              <svg className='absolute -bottom-[1px] -left-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M0.25 0V7H7.25" stroke="white" strokeWidth="0.5" />
              </svg>
              {/* Bottom Right */}
              <svg className='absolute -bottom-[1px] -right-[1px]' xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M7 0V7H2.6077e-07" stroke="white" strokeWidth="0.5" />
              </svg>

              <span className='text-[14px] leadcing-[100%] font-[500] -tracking-[.28px] uppercase text-black group-hover:text-white transition-all duration-300'>request a demo</span>

              <svg className='w-[16px] h-[16px]' xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path className='group-hover:stroke-white transition-all duration-300' d="M6.99943 2.91724L11.0828 7.00057L6.99943 11.0839" stroke="black" strokeWidth="1.16667" />
                <path className='group-hover:stroke-white transition-all duration-300' d="M2.9161 7L11.0828 7" stroke="black" strokeWidth="1.16667" />
              </svg>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className='w-full flex flex-col px-[16px] md:px-[48px] xl:px-[64px] 2xl:px-[80px] relative'>
          <div className='max-w-[1280px] w-full mx-auto flex flex-col gap-[64px] pt-[32px] pb-[64px] md:py-[80px]'>
            <div className='w-full flex max-md:flex-col max-md:gap-[48px] items-start justify-between'>
              {/* Left Block */}
              <div className='max-w-[338px] w-full flex flex-col items-start gap-[16px]'>
                {/* Logo */}
                <div className='flex items-center justify-center'>
                  <Link href={'/'}>
                    <Image
                      src={'/codefour/branding/logo.svg'}
                      width={107}
                      height={24}
                      alt='Code Four'
                      quality={100}
                      draggable={false}
                      className='w-[134px] h-auto object-cover'
                    />
                  </Link>
                </div>

                <span className='flex w-full text-[14px] leading-[150%] -tracking-[.42px] text-start font-[400] text-white opacity-[.6]'>AI-powered video analysis and report generation for law enforcement agencies.</span>
                
                {/* Social Icons */}
                <div className='flex items-center gap-[16px]'>
                  <a href='https://www.linkedin.com/company/codefourus/' target='_blank' rel='noopener noreferrer' className='w-[32px] h-[32px] flex items-center justify-center border border-[rgba(255,255,255,0.20)] bg-[rgba(255,255,255,0.05)] hover:bg-white transition-all duration-300 group'>
                    <svg className='w-[16px] h-[16px]' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path className='group-hover:fill-black transition-all duration-300' d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="white"/>
                    </svg>
                  </a>
                  <a href='https://x.com/GetCodeFour' target='_blank' rel='noopener noreferrer' className='w-[32px] h-[32px] flex items-center justify-center border border-[rgba(255,255,255,0.20)] bg-[rgba(255,255,255,0.05)] hover:bg-white transition-all duration-300 group'>
                    <svg className='w-[16px] h-[16px]' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path className='group-hover:fill-black transition-all duration-300' d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="white"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Right Block */}
              <div className='flex flex-wrap max-md:flex-col max-md:gap-[48px] items-start gap-x-[48px] gap-y-[32px] justify-end'>
                <div className='flex flex-col gap-[20px]'>
                  <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white opacity-[.6]'>Products</span>

                  <div className='flex flex-col gap-[16px]'>
                    <Link href='/products/report'>
                      <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white hover:opacity-[.8] transition-opacity cursor-pointer'>report</span>
                    </Link>
                    <Link href='/products/redactions'>
                      <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white hover:opacity-[.8] transition-opacity cursor-pointer'>redaction</span>
                    </Link>
                  </div>
                </div>

                <div className='flex flex-col gap-[20px]'>
                  <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white opacity-[.6]'>resources</span>

                  <div className='flex flex-col gap-[16px]'>
                    <a href='/blog' target='_blank' rel='noopener noreferrer'>
                      <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white hover:opacity-[.8] transition-opacity cursor-pointer'>Blog</span>
                    </a>
                    <a href='http://codefour.us/blog/pocatello-police-case-study' target='_blank' rel='noopener noreferrer'>
                      <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white hover:opacity-[.8] transition-opacity cursor-pointer'>case studies</span>
                    </a>
                    <a href='mailto:support@codefour.us'>
                      <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white hover:opacity-[.8] transition-opacity cursor-pointer'>support</span>
                    </a>
                  </div>
                </div>

                <div className='flex flex-col gap-[20px]'>
                  <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white opacity-[.6]'>company</span>

                  <div className='flex flex-col gap-[16px]'>
                    <Link href='/blog/why-code-four-exists'>
                      <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white hover:opacity-[.8] transition-opacity cursor-pointer'>about us</span>
                    </Link>
                    <a href='https://www.workatastartup.com/companies/code-four' target='_blank' rel='noopener noreferrer'>
                      <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white hover:opacity-[.8] transition-opacity cursor-pointer'>careers</span>
                    </a>
                    <a href='mailto:founders@codefour.us'>
                      <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white hover:opacity-[.8] transition-opacity cursor-pointer'>contact</span>
                    </a>
                  </div>
                </div>

                <div className='flex flex-col gap-[20px]'>
                  <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white opacity-[.6]'>compare</span>

                  <div className='flex flex-col gap-[16px]'>
                    <Link href='/compare/axon'>
                      <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white hover:opacity-[.8] transition-opacity cursor-pointer'>vs Axon</span>
                    </Link>
                    <Link href='/compare/truleo'>
                      <span className='text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white hover:opacity-[.8] transition-opacity cursor-pointer'>vs Truleo</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className='w-full flex max-lg:flex-col gap-[12px] items-center justify-between'>
              <span className='w-full text-[14px] leading-[normal] -tracking-[.28px] text-center lg:text-start uppercase font-[400] text-white opacity-[.6]'>© {new Date().getFullYear()} Code Four Labs, Corp. All rights reserved.</span>

              <div className='flex whitespace-nowrap gap-[16px]'>
                <Link href='/privacy-policy'>
                  <span className='w-full text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white opacity-[.6] hover:opacity-[1] cursor-pointer transition-opacity'>Privacy Policy</span>
                </Link>
                <Link href='/terms-of-service'>
                  <span className='w-full text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white opacity-[.6] hover:opacity-[1] cursor-pointer transition-opacity'>Terms of Service</span>
                </Link>
                <Link href='/cookie-policy'>
                  <span className='w-full text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white opacity-[.6] hover:opacity-[1] cursor-pointer transition-opacity'>Cookie Policy</span>
                </Link>
                <Link href='/model'>
                  <span className='w-full text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white opacity-[.6] hover:opacity-[1] cursor-pointer transition-opacity'>Model</span>
                </Link>
                <a href='https://trust.codefour.us/' target='_blank' rel='noopener noreferrer'>
                  <span className='w-full text-[14px] leading-[normal] -tracking-[.28px] text-start uppercase font-[400] text-white opacity-[.6] hover:opacity-[1] cursor-pointer transition-opacity'>Trust Center</span>
                </a>
              </div>
            </div>
          </div>

          <div className='w-full h-auto relative max-md:bottom-[24px]'>
              <Image
              src={'/codefour/branding/logo-footer.png'}
              width={1364}
              height={234}
              alt='Code Four Logo'
              draggable={false}
              quality={100}
              className='w-full h-full object-cover brightness-[200] contrast-10 opacity-10000'
            />
          </div>
        </div>
      </div>
    </div>
  )
}
