'use client';
import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Navbar() {
   const productPopup = useRef<HTMLDivElement>(null);
   const popupGradient = useRef<HTMLDivElement>(null);
   const menu = useRef<HTMLDivElement>(null);
   const [productsPopupIsActive, setProductsPopupIsActive] = useState(false);
   const [menuIsActive, setMenuIsActive] = useState<boolean | null>(false);

   // Product Popup Actions
   useGSAP(() => {
      const menuBlock = menu.current;
      if (!menuBlock) return;

      if (menuIsActive) {
         gsap.to(menuBlock, {
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            duration: .5,
            ease: 'power1.out'
         });
         document.body.style.overflow = 'hidden';
      } else {
         gsap.to(menuBlock, {
            clipPath: 'polygon(0 0, 100% 0, 100% 0%, 0 0%)',
            duration: .5,
            ease: 'power1.out'
         });
         document.body.style.overflow = 'auto';
      }
   }, { scope: menu, dependencies: [menuIsActive] })

   useGSAP(() => {
      const popup = productPopup.current;
      const gradient = popupGradient.current;

      if (!popup || !gradient) return;
      gsap.set(gradient, { autoAlpha: 0 });

      if (productsPopupIsActive) {
         gsap.to(popup, {
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            duration: .5,
            ease: 'power1.out'
         });
         gsap.to(gradient, {
            opacity: .68,
            ease: 'power1.out',
            duration: .5,
            autoAlpha: 1
         });
      } else {
         gsap.to(popup, {
            clipPath: 'polygon(0 0, 100% 0, 100% 0%, 0 0%)',
            duration: .5,
            ease: 'power1.out'
         });
         gsap.to(gradient, {
            opacity: 0,
            ease: 'power1.out',
            duration: .5,
            autoAlpha: 1
         });
      };

   }, { scope: productPopup, dependencies: [productsPopupIsActive] });

   return (
      <div className='absolute top-0 left-0 w-full h-[64px] px-[16px] md:px-[48px] xl:px-[64px] 2xl:px-[80px] z-50'>
         {/* Products Popup */}
         <div ref={popupGradient} className='absolute top-0 left-0 w-full h-[100vh] bg-black opacity-0 pointer-events-none'></div>

         <div ref={productPopup} className='w-full absolute top-[64px] left-0 flex items-center bg-transparent' style={{ clipPath: 'polygon(0 0, 100% 0, 100% 0%, 0 0%)' }} onMouseEnter={() => setProductsPopupIsActive(true)} onMouseLeave={() => setProductsPopupIsActive(false)}>
            <div className='w-full max-w-[1280px] h-[260px] mx-auto flex items-center pt-[32px]'>
               <div className='w-full h-full bg-black border-[1px] border-[rgba(255,255,255,0.10)] overflow-hidden relative'>
                  <div className='w-full absolute bottom-0 left-0 p-[24px] flex flex-col items-start gap-[32px]'>
                     <div className='flex flex-col gap-[8px]'>
                        <h2 className='text-[24px] leadcing-[115%] font-[500] -tracking-[1.2px] uppercase text-white'>report</h2>
                        <span className='flex max-w-[335px] text-[14px] leadcing-[150%] font-[400] opacity-[.42] -tracking-[.36px] text-white'>AI-powered video analysis that transforms body-cam footage into comprehensive, ready-to-file reports.</span>
                     </div>

                     {/* Custom Button */}
                     <Link href={'/products/report'}>
                        <div className='py-[8px] pl-[16px] pr-[14px] h-[44px] flex items-center justify-center gap-[8px] select-none cursor-pointer group relative border-[.5px] border-[rgba(255,255,255,0.20)] bg-[rgba(0,0,0,0.20)] backdrop-blur-[15px] hover:bg-white transition-all duration-300'>
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

                           <span className='text-[14px] leadcing-[100%] font-[500] -tracking-[.28px] uppercase text-white group-hover:text-black transition-all duration-300'>learn more</span>

                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path className='group-hover:stroke-black transition-all duration-300' d="M6.99943 2.91724L11.0828 7.00057L6.99943 11.0839" stroke="white" strokeWidth="1.16667" />
                              <path className='group-hover:stroke-black transition-all duration-300' d="M2.9161 7L11.0828 7" stroke="white" strokeWidth="1.16667" />
                           </svg>
                        </div>
                     </Link>
                  </div>
               </div>

               <div className='w-full h-full bg-black border-[1px] border-[rgba(255,255,255,0.10)] overflow-hidden relative'>
                  <div className='w-full absolute bottom-0 left-0 p-[24px] flex flex-col items-start gap-[32px]'>
                     <div className='flex flex-col gap-[8px]'>
                        <h2 className='text-[24px] leadcing-[115%] font-[500] -tracking-[1.2px] uppercase text-white'>redactions</h2>
                        <span className='flex max-w-[335px] text-[14px] leadcing-[150%] font-[400] opacity-[.42] -tracking-[.36px] text-white'>Automated detection and redaction of faces, license plates, and sensitive content in video footage.</span>
                     </div>

                     {/* Custom Button */}
                     <Link href={'/products/redactions'}>
                        <div className='py-[8px] pl-[16px] pr-[14px] h-[44px] flex items-center justify-center gap-[8px] select-none cursor-pointer group relative border-[.5px] border-[rgba(255,255,255,0.20)] bg-[rgba(0,0,0,0.20)] backdrop-blur-[15px] hover:bg-white transition-all duration-300'>
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

                           <span className='text-[14px] leadcing-[100%] font-[500] -tracking-[.28px] uppercase text-white group-hover:text-black transition-all duration-300'>learn more</span>

                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path className='group-hover:stroke-black transition-all duration-300' d="M6.99943 2.91724L11.0828 7.00057L6.99943 11.0839" stroke="white" strokeWidth="1.16667" />
                              <path className='group-hover:stroke-black transition-all duration-300' d="M2.9161 7L11.0828 7" stroke="white" strokeWidth="1.16667" />
                           </svg>
                        </div>
                     </Link>
                  </div>
               </div>
            </div>
         </div>

         {/* Menu */}
         <div ref={menu} className='w-full h-[100dvh] absolute top-0 left-0 pt-[64px] pb-[48px] px-[16px] bg-black' style={{ clipPath: 'polygon(0 0, 100% 0, 100% 0%, 0 0%)' }}>
            <div className='w-full h-full flex flex-col justify-between'>
               {/* Navs */}
               <div className='w-full flex flex-col'>
                  {/* Single Nav Item */}
                  <div className='w-full py-[28px] border-b border-[rgba(255,255,255,0.10)]'>
                     <Link href={'/products/report'}>
                        <span className='text-[16px] leading-[115%] -tracking-[.42px] text-white font-500 uppercase'>report</span>
                     </Link>
                  </div>

                  {/* Single Nav Item */}
                  <div className='w-full py-[28px] border-b border-[rgba(255,255,255,0.10)]'>
                     <Link href={'/products/redactions'}>
                        <span className='text-[16px] leading-[115%] -tracking-[.42px] text-white font-500 uppercase'>redactions</span>
                     </Link>
                  </div>

                  {/* Single Nav Item */}
                  <div className='w-full py-[28px] border-b border-[rgba(255,255,255,0.10)]'>
                     <Link href={'/blog'}>
                        <span className='text-[16px] leading-[115%] -tracking-[.42px] text-white font-500 uppercase'>blog</span>
                     </Link>
                  </div>

                  {/* Single Nav Item */}
                  <div className='w-full py-[28px] border-b border-[rgba(255,255,255,0.10)]'>
                     <Link href={'/blog/why-code-four-exists'}>
                        <span className='text-[16px] leading-[115%] -tracking-[.42px] text-white font-500 uppercase'>about us</span>
                     </Link>
                  </div>

                  {/* Single Nav Item */}
                  <div className='w-full py-[28px] border-b border-[rgba(255,255,255,0.10)]'>
                     <a href='https://www.workatastartup.com/companies/code-four' target='_blank' rel='noopener noreferrer'>
                        <span className='text-[16px] leading-[115%] -tracking-[.42px] text-white font-500 uppercase'>careers</span>
                     </a>
                  </div>
               </div>

               {/* Buttons */}
               <div className='w-full flex flex-col gap-[16px]'>
                  <Link href={'https://app.codefour.us/signin'}>
                     <button className='w-full h-[44px] px-[10px] py-[8px] border-[.5px] border-[rgba(255,255,255,0.30)] backdrop-blur-[2px] flex items-center justify-center group hover:bg-white transition-all duration-300'>
                        <span className='text-[14px] leading-[100%] text-[#fff] font-[500] -tracking-[.36px] text-center uppercase group-hover:text-black transition-all duration-300'>SIGN IN</span>
                     </button>
                  </Link>

                  <Link href={'/connect'}>
                     <button className='w-full h-[44px] px-[10px] py-[8px] border-[.5px] border-[rgba(255,255,255,0.30)] backdrop-blur-[2px] flex items-center justify-center bg-white group hover:bg-transparent transition-all duration-300'>
                        <span className='text-[14px] leading-[100%] text-black font-[500] -tracking-[.36px] text-center uppercase group-hover:text-white transition-all duration-300'>Let&apos;s Connect</span>
                     </button>
                  </Link>
               </div>
            </div>
         </div>

         {/* Navbar Inner */}
         <div className='relative w-full max-w-[1280px] mx-auto h-full flex items-center justify-between'>
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
                     className='w-[107px] h-auto object-cover'
                  />
               </Link>
            </div>

            {/* Navs */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full hidden md:flex items-center gap-[32px]">
               <div className='h-full flex items-center group' onMouseEnter={() => setProductsPopupIsActive(true)} onMouseLeave={() => setProductsPopupIsActive(false)}>
                  <span className='text-[12px] leading-[100%] font-[500] text-[#fff] opacity-[.8] uppercase group-hover:opacity-[1] transition-all duration-300'>products</span>
               </div>

               <Link className='h-full flex' href={'/blog'}>
                  <div className='h-full flex items-center group'>
                     <span className='text-[12px] leading-[100%] font-[500] text-[#fff] opacity-[.8] uppercase group-hover:opacity-[1] transition-all duration-300'>blog</span>
                  </div>
               </Link>

               <Link className='h-full flex' href={'/blog/why-code-four-exists'}>
                  <div className='h-full flex items-center group'>
                     <span className='text-[12px] leading-[100%] font-[500] text-[#fff] opacity-[.8] uppercase group-hover:opacity-[1] transition-all duration-300'>about us</span>
                  </div>
               </Link>

               <a className='h-full flex' href='https://www.workatastartup.com/companies/code-four' target='_blank' rel='noopener noreferrer'>
                  <div className='h-full flex items-center group'>
                     <span className='text-[12px] leading-[100%] font-[500] text-[#fff] opacity-[.8] uppercase group-hover:opacity-[1] transition-all duration-300'>careers</span>
                  </div>
               </a>
            </div>

            {/* Buttons */}
            <div className='h-full flex items-center overflow-hidden'>
               <div className='hidden md:flex items-center gap-[8px]'>
                  <Link href={'https://app.codefour.us/signin'}>
                     <button className='h-[28px] px-[10px] py-[8px] border-[.5px] border-[rgba(255,255,255,0.30)] backdrop-blur-[2px] flex items-center group hover:bg-white transition-all duration-300'>
                        <span className='text-[12px] leading-[100%] text-[#fff] font-[500] -tracking-[.36px] uppercase group-hover:text-black transition-all duration-300'>SIGN IN</span>
                     </button>
                  </Link>

                  <Link href={'/connect'}>
                     <button className='h-[28px] px-[10px] py-[8px] border-[.5px] border-[rgba(255,255,255,0.30)] backdrop-blur-[2px] flex items-center bg-white group hover:bg-transparent transition-all duration-300'>
                        <span className='text-[12px] leading-[100%] text-black font-[500] -tracking-[.36px] uppercase group-hover:text-white transition-all duration-300'>Let&apos;s Connect</span>
                     </button>
                  </Link>
               </div>

               <button
                  className={`burger__btn relative flex md:hidden w-[64px] h-[64px] -mr-5 items-center justify-center cursor-pointer ${menuIsActive ? "active" : ""}`}
                  onClick={() => setMenuIsActive(!menuIsActive)}
               >
                  <span className="line line-1 absolute w-[18px] h-[1.5px] bg-white rounded transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] origin-center -translate-y-[6px]"></span>
                  <span className="line line-2 absolute w-[18px] h-[1.5px] bg-white rounded transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] origin-center"></span>
                  <span className="line line-3 absolute w-[18px] h-[1.5px] bg-white rounded transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] origin-center translate-y-[6px]"></span>
               </button>
            </div>
         </div>
      </div>
   )
}
