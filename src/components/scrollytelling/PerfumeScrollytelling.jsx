import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import ScrollyScene from './ScrollyScene';
import ScrollyProgress from './ScrollyProgress';
import './scrollytelling.css';

gsap.registerPlugin(ScrollTrigger);

export default function PerfumeScrollytelling() {
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const lenisRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isCtaInteractive, setIsCtaInteractive] = useState(false);

  useEffect(() => {
    // 1. Accessibility Check: prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    // 2. Initialize Lenis (Smooth Scroll)
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickHandler = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickHandler);
    gsap.ticker.lagSmoothing(0);

    // 3. Setup GSAP ScrollTrigger Context
    const ctx = gsap.context(() => {
      const wrapper = wrapperRef.current;
      const scenes = wrapper.querySelectorAll('.scrolly-scene');
      const images = wrapper.querySelectorAll('.scrolly-scene img');
      const ctaContainer = wrapper.querySelector('.final-cta-container');

      if (scenes.length < 4 || images.length < 4) return;

      // Initial visual states
      gsap.set(scenes, { opacity: 0, visibility: 'hidden' });
      gsap.set(scenes[0], { opacity: 1, visibility: 'visible' });
      gsap.set(images[0], { scale: 1.06 });

      // Build main editorial timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: "top top",
          end: "+=450%",
          scrub: 1,      
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            
            let active = 0;
            if (progress > 0.77) active = 3;
            else if (progress > 0.52) active = 2;
            else if (progress > 0.27) active = 1;
            
            setActiveStep(active);

            // Make CTA clickable/interactive only when visible (last scene progress > 90%)
            if (progress > 0.90) {
              setIsCtaInteractive(true);
            } else {
              setIsCtaInteractive(false);
            }
          }
        }
      });

      // --- CENA 01 — ABERTURA ---
      // Scale down image from 1.06 to 1.0 and fade it in at the very start
      tl.to(images[0], { scale: 1.0, duration: 0.1, ease: 'none' })
        // Subtle Ken Burns slow zoom (1.0 to 1.035) during Scene 1 active state
        .to(images[0], { scale: 1.035, duration: 1.0, ease: 'none' })

      // --- TRANSIÇÃO 01 → 02 ---
      tl.to(scenes[0], { opacity: 0, visibility: 'hidden', duration: 0.3, ease: 'none' }, 't1-t2')
        .to(images[0], { scale: 1.07, filter: 'blur(3px)', duration: 0.3, ease: 'none' }, 't1-t2')
        
        .fromTo(scenes[1], 
          { opacity: 0, visibility: 'hidden' }, 
          { opacity: 1, visibility: 'visible', duration: 0.3, ease: 'none' }, 
          't1-t2'
        )
        .fromTo(images[1], 
          { scale: 0.97, filter: 'blur(2px)' }, 
          { scale: 1.0, filter: 'blur(0px)', duration: 0.3, ease: 'none' }, 
          't1-t2'
        )

      // --- CENA 02 — ROTINA ---
      // Parallax translateY effect & scale zoom during Scene 2 active state
      tl.to(images[1], { yPercent: -5, scale: 1.025, duration: 1.0, ease: 'none' })

      // --- TRANSIÇÃO 02 → 03 ---
      tl.to(scenes[1], { opacity: 0, visibility: 'hidden', duration: 0.3, ease: 'none' }, 't2-t3')
        .to(images[1], { xPercent: -2.5, duration: 0.3, ease: 'none' }, 't2-t3')
        
        .fromTo(scenes[2], 
          { opacity: 0, visibility: 'hidden' }, 
          { opacity: 1, visibility: 'visible', duration: 0.3, ease: 'none' }, 
          't2-t3'
        )
        .fromTo(images[2], 
          { xPercent: 2.5, scale: 1.0 }, 
          { xPercent: 0, scale: 1.0, duration: 0.3, ease: 'none' }, 
          't2-t3'
        )

      // --- CENA 03 — MEMÓRIAS ---
      // Visual breathing breathing effect (scale 1.0 -> 1.04 -> 1.015)
      tl.to(images[2], { scale: 1.04, duration: 0.5, ease: 'none' })
        .to(images[2], { scale: 1.015, duration: 0.5, ease: 'none' })

      // --- TRANSIÇÃO 03 → 04 ---
      tl.to(scenes[2], { opacity: 0, visibility: 'hidden', duration: 0.3, ease: 'none' }, 't3-t4')
        .to(images[2], { scale: 1.06, filter: 'brightness(1.08)', duration: 0.3, ease: 'none' }, 't3-t4')
        
        .fromTo(scenes[3], 
          { opacity: 0, visibility: 'hidden' }, 
          { opacity: 1, visibility: 'visible', duration: 0.3, ease: 'none' }, 
          't3-t4'
        )
        .fromTo(images[3], 
          { scale: 0.98, filter: 'brightness(0.9)' }, 
          { scale: 1.0, filter: 'brightness(1.0)', duration: 0.3, ease: 'none' }, 
          't3-t4'
        )

      // --- CENA 04 — FINAL / CTA ---
      // First 60% of Cena 04: Image is practically fixed, CTA is hidden
      tl.to(images[3], { scale: 1.015, duration: 0.6, ease: 'none' })
        // Last 40% of Cena 04: CTA animates into view
        .to(ctaContainer, { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.4, 
          ease: 'power2.out' 
        })
      // End of the scrollytelling section, releases pinning
      tl.to({}, { duration: 0.1 }); 

      triggerRef.current = tl.scrollTrigger;

    }, wrapperRef);

    // 4. Cleanup on Unmount
    return () => {
      ctx.revert();
      lenisRef.current?.destroy();
      gsap.ticker.remove(tickHandler);
    };
  }, []);

  // Programmatic scroll-to-scene triggered from progress dots
  const handleDotClick = (index) => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const start = trigger.start;
    const end = trigger.end;
    const total = end - start;

    // Define target progress percentages mapped to step centers
    const targetProgress = [0.05, 0.35, 0.65, 0.95];
    const targetScroll = start + targetProgress[index] * total;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetScroll, { offset: 0 });
    } else {
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="scrolly-container">
      <section className="perfume-scrolly" ref={wrapperRef}>
        {/* Visual Hidden Content for SEO/Accessibility */}
        <div className="sr-only">
          <h2>Pequenos Frascos, Grandes Histórias</h2>
          <p>Explore a narrativa dos perfumes da Snack Store: miniaturas importadas exclusivas.</p>
          
          <h3>Cena 1: Abertura</h3>
          <p>Pequenos Frascos, Grandes Histórias. Apresentação da bolsa de miniaturas de campanha.</p>
          
          <h3>Cena 2: Rotina</h3>
          <p>Cabe na bolsa, acompanha sua rotina. Destacando o perfume Majestade.</p>
          
          <h3>Cena 3: Memórias e Identidade</h3>
          <p>Aromas que marcam. Histórias que ficam. Destacando o perfume Fleur Gold.</p>
          
          <h3>Cena 4: Qualidade e Exclusividade</h3>
          <p>Exclusividade em cada detalhe. Qualidade Premium. Arabic Collection.</p>
        </div>

        <div className="scrolly-sticky">
          <ScrollyScene
            desktop="/scrollytelling/desktop/01.webp"
            mobile="/scrollytelling/mobile/01.webp"
            alt="Pequenos Frascos, Grandes Histórias - Bolsa de miniaturas"
            isFirst={true}
          />

          <ScrollyScene
            desktop="/scrollytelling/desktop/02.webp"
            mobile="/scrollytelling/mobile/02.webp"
            alt="Cabe na bolsa. Acompanha sua rotina. Perfume Majestade"
          />

          <ScrollyScene
            desktop="/scrollytelling/desktop/03.webp"
            mobile="/scrollytelling/mobile/03.webp"
            alt="Aromas que marcam. Histórias que ficam. Perfume Fleur Gold"
          />

          <ScrollyScene
            desktop="/scrollytelling/desktop/04.webp"
            mobile="/scrollytelling/mobile/04.webp"
            alt="Exclusividade em cada detalhe. Qualidade Premium. Arabic Collection"
          />

          <ScrollyProgress 
            activeStep={activeStep} 
            totalSteps={4} 
            onDotClick={handleDotClick} 
          />

          <div className={`final-cta-container ${isCtaInteractive ? 'interactive' : ''}`}>
            <a href="/mini-perfumes-importados" className="final-cta">
              VER MINIATURAS <span className="cta-arrow">→</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
