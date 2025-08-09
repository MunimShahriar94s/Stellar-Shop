import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export const useHeroAnimation = () => {
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    const text = textRef.current;
    const cta = ctaRef.current;

    if (!hero || !text || !cta) return;

    const tl = gsap.timeline();

    tl.fromTo(
      hero,
      { opacity: 0, scale: 1.1 },
      { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }
    )
      .fromTo(
        text,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
        "-=0.5"
      )
      .fromTo(
        cta,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.3"
      );

    return () => {
      tl.kill();
    };
  }, []);

  return { heroRef, textRef, ctaRef };
};

export const useProductAnimation = () => {
  const productsRef = useRef(null);

  useEffect(() => {
    const products = productsRef.current;
    if (!products) return;

    const productItems = products.querySelectorAll('.product-card');
    
    gsap.set(productItems, { y: 50, opacity: 0 });
    
    ScrollTrigger.batch(productItems, {
      onEnter: batch => gsap.to(batch, {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "power3.out"
      }),
      start: "top 85%",
      once: false
    });

    // Refresh ScrollTrigger on window resize for responsiveness
    window.addEventListener('resize', () => {
      ScrollTrigger.refresh();
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      window.removeEventListener('resize', () => {
        ScrollTrigger.refresh();
      });
    };
  }, []);

  return { productsRef };
};

export const useNavAnimation = () => {
  const navRef = useRef(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const navItems = nav.querySelectorAll('.nav-item');
    const logo = nav.querySelector('.logo');

    const tl = gsap.timeline();

    tl.fromTo(
      logo,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    ).fromTo(
      navItems,
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out" },
      "-=0.3"
    );

    return () => {
      tl.kill();
    };
  }, []);

  return { navRef };
};

export const useSectionAnimation = () => {
  const sectionRef = useRef(null);
  
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    
    ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      onEnter: () => {
        gsap.fromTo(
          section,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
        );
      },
      once: false
    });
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  
  return { sectionRef };
};

export const useFeatureAnimation = () => {
  const featuresRef = useRef(null);
  
  useEffect(() => {
    const features = featuresRef.current;
    if (!features) return;
    
    const featureCards = features.querySelectorAll('.feature-card');
    
    gsap.set(featureCards, { y: 30, opacity: 0 });
    
    ScrollTrigger.batch(featureCards, {
      trigger: features,
      start: "top 75%",
      onEnter: batch => gsap.to(batch, {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 0.8,
        ease: "back.out(1.7)"
      }),
      once: false
    });
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);
  
  return { featuresRef };
};

export const useLoginAnimation = () => {
  const formRef = useRef(null);
  const socialRef = useRef(null);
  
  useEffect(() => {
    const form = formRef.current;
    const social = socialRef.current;
    
    if (!form || !social) return;
    
    const tl = gsap.timeline();
    
    tl.fromTo(
      form,
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
    ).fromTo(
      social.querySelectorAll('.oauth-btn'),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "back.out(1.7)" },
      "-=0.4"
    );
    
    return () => {
      tl.kill();
    };
  }, []);
  
  return { formRef, socialRef };
};

