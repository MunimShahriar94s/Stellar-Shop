import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useHeroAnimation } from '../../hooks/useGsapAnimations';

const HeroSection = styled.section`
  position: relative;
  height: 85vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  margin-top: 0;
  @media (max-width: 600px) {
    height: 70vh;
    min-height: 370px;
    margin-top: 0;
  }
`;

const SlideContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${props => props.active ? 1 : 0};
  transition: opacity 0.8s ease-in-out;
  display: flex;
  align-items: center;
`;

const SlideBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  opacity: 1;
  transition: all 0.8s ease-in-out;
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 2;
  width: 100%;
  @media (max-width: 600px) {
    padding: 0 1rem;
  }
`;

const HeroText = styled.div`
  max-width: 600px;
  color: white;
  opacity: ${props => props.active ? 1 : 0};
  transform: translateY(${props => props.active ? '0' : '30px'});
  transition: all 0.8s ease-in-out 0.3s;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  @media (max-width: 600px) {
    max-width: 100%;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  
  span {
    color: var(--primary-color);
  }
  @media (max-width: 600px) {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
`;

const HeroDescription = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  @media (max-width: 600px) {
    font-size: 1rem;
    margin-bottom: 1.2rem;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.2rem;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.7rem;
    align-items: stretch;
    margin-top: 1.1rem;
    width: 100%;
  }
`;

const PrimaryButton = styled(Link)`
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
  @media (max-width: 600px) {
    width: 100%;
    text-align: center;
    padding: 0.7rem 0;
  }
`;

const SecondaryButton = styled(Link)`
  display: inline-block;
  background-color: transparent;
  color: white;
  padding: 0.8rem 2rem;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-3px);
  }
  @media (max-width: 600px) {
    width: 100%;
    text-align: center;
    padding: 0.7rem 0;
  }
`;

const FloatingShapes = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  
  .shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 107, 107, 0.1);
    animation: float 15s infinite;
    
    &:nth-child(1) {
      width: 300px;
      height: 300px;
      top: -150px;
      right: 10%;
      animation-delay: 0s;
    }
    
    &:nth-child(2) {
      width: 200px;
      height: 200px;
      bottom: 5%;
      left: 10%;
      animation-delay: 2s;
    }
    
    &:nth-child(3) {
      width: 150px;
      height: 150px;
      bottom: 30%;
      right: 20%;
      animation-delay: 4s;
    }
  }
  
  @keyframes float {
    0% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
    }
    100% {
      transform: translateY(0) rotate(360deg);
    }
  }
`;

const NavigationContainer = styled.div`
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 0.3rem;
  background: rgba(0, 0, 0, 0.4);
  padding: 0.5rem 0.8rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
`;

const Dot = styled.button`
  width: 8px;
  height: 8px;
  min-width: 8px;
  min-height: 8px;
  padding: 0;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.4)'};
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-hover)' : 'rgba(255, 255, 255, 0.6)'};
    transform: scale(1.2);
  }
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  border: none;
  color: white;
  font-size: 1.5rem;
  padding: 1rem 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(0, 0, 0, 0.5);
  }
  
  &.prev {
    left: 1rem;
  }
  
  &.next {
    right: 1rem;
  }
  
  @media (max-width: 600px) {
    padding: 0.5rem 0.3rem;
    font-size: 1.2rem;
    
    &.prev {
      left: 0.5rem;
    }
    
    &.next {
      right: 0.5rem;
    }
  }
`;

const HeroSlideshow = ({ slides = [], settings = {} }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef(null);
  const { heroRef, textRef, ctaRef } = useHeroAnimation();

  let {
    autoPlay = true,
    autoPlaySpeed = 5000,
    showDots = true,
    showArrows = true
  } = settings;

  const activeSlides = slides.filter(slide => slide.active);

  useEffect(() => {
    if (activeSlides.length === 0) return;

    if (autoPlay && activeSlides.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % activeSlides.length);
      }, autoPlaySpeed);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlaySpeed, activeSlides.length]);

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    
    setIsTransitioning(true);
    setCurrentSlide(index);
    
    // Reset autoplay timer
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % activeSlides.length);
      }, autoPlaySpeed);
    }
    
    setTimeout(() => setIsTransitioning(false), 800);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    goToSlide(currentSlide === 0 ? activeSlides.length - 1 : currentSlide - 1);
  };

  // If no slides or only one slide, don't show navigation
  if (activeSlides.length <= 1) {
    showDots = false;
    showArrows = false;
  }

  if (activeSlides.length === 0) {
    return (
      <HeroSection ref={heroRef}>
        <SlideBackground image="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" />
        <HeroContent>
          <HeroText ref={textRef}>
            <HeroTitle>
              Welcome to <span>Our Store</span>
            </HeroTitle>
            <HeroDescription>
              Discover amazing products and great deals.
            </HeroDescription>
            <HeroButtons ref={ctaRef}>
              <PrimaryButton to="/products">Shop Now</PrimaryButton>
              <SecondaryButton to="/about">Learn More</SecondaryButton>
            </HeroButtons>
          </HeroText>
        </HeroContent>
      </HeroSection>
    );
  }

  return (
    <HeroSection ref={heroRef}>
      
      {activeSlides.map((slide, index) => (
        <SlideContainer key={slide.id} active={index === currentSlide}>
          <SlideBackground image={slide.backgroundImage} />
          <HeroContent>
            <HeroText ref={index === 0 ? textRef : null} active={index === currentSlide}>
              <HeroTitle dangerouslySetInnerHTML={{ __html: slide.title }} />
              <HeroDescription>{slide.description}</HeroDescription>
              <HeroButtons ref={index === 0 ? ctaRef : null}>
                <PrimaryButton to={slide.buttonLink || '/products'}>
                  {slide.buttonText || 'Shop Now'}
                </PrimaryButton>
                {slide.secondaryButtonText && (
                  <SecondaryButton to={slide.secondaryButtonLink || '/about'}>
                    {slide.secondaryButtonText}
                  </SecondaryButton>
                )}
              </HeroButtons>
            </HeroText>
          </HeroContent>
        </SlideContainer>
      ))}
      
      {showArrows && (
        <>
          <ArrowButton className="prev" onClick={prevSlide}>
            ‹
          </ArrowButton>
          <ArrowButton className="next" onClick={nextSlide}>
            ›
          </ArrowButton>
        </>
      )}
      
      {showDots && (
        <NavigationContainer>
          {activeSlides.map((_, index) => (
            <Dot
              key={index}
              active={index === currentSlide}
              onClick={() => goToSlide(index)}
            />
          ))}
        </NavigationContainer>
      )}
    </HeroSection>
  );
};

export default HeroSlideshow;
