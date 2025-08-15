import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useSettings } from '../../context/SettingsContext';
import { useHeroAnimation } from '../../hooks/useGsapAnimations';

const HeroSection = styled.section`
  position: relative;
  height: 85vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  margin-top: 1.2rem;
  @media (max-width: 600px) {
    height: 70vh;
    min-height: 370px;
    padding: 0;
    margin-top: 0.5rem;
  }
`;

const SlideContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Slide = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: ${props => props.active ? 1 : 0};
  transition: opacity 0.8s ease-in-out;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
`;

const SlideOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
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
  color: rgba(255, 255, 255, 0.8);
  @media (max-width: 600px) {
    font-size: 1rem;
    margin-bottom: 1.2rem;
  }
`;

const ProductInfo = styled.div`
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  color: white;
  text-align: right;
  max-width: 300px;
  z-index: 3;
  
  @media (max-width: 600px) {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
    text-align: left;
  }
`;

const ProductTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const ProductDescription = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  margin-bottom: 0.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
`;

const ProductPrice = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;

const SlideControls = styled.div`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 3;
  
  @media (max-width: 600px) {
    bottom: 1rem;
  }
`;

const SlideDot = styled.button`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${props => props.active ? 'var(--primary-color)' : 'rgba(255, 255, 255, 0.3)'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 'var(--primary-hover)' : 'rgba(255, 255, 255, 0.5)'};
  }
`;

const SlideArrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 3;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
    transform: translateY(-50%) scale(1.1);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  &.prev {
    left: 2rem;
  }
  
  &.next {
    right: 2rem;
  }
  
  @media (max-width: 600px) {
    width: 40px;
    height: 40px;
    
    &.prev {
      left: 1rem;
    }
    
    &.next {
      right: 1rem;
    }
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

const HeroSlideshow = () => {
  const { settings } = useSettings();
  const { heroRef, textRef } = useHeroAnimation();
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const autoPlayRef = useRef(null);

  // Fetch hero slides
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch('/api/hero-slides');
        if (response.ok) {
          const data = await response.json();
          setSlides(data);
        }
      } catch (error) {
        console.error('Error fetching hero slides:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (slides.length > 1 && settings.hero?.autoPlay !== 'false') {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, parseInt(settings.hero?.autoPlaySpeed) || 5000);
      
      autoPlayRef.current = interval;
      
      return () => clearInterval(interval);
    }
  }, [slides.length, settings.hero?.autoPlay, settings.hero?.autoPlaySpeed]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    // Reset auto-play timer
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const handleSlideClick = (slide) => {
    if (slide.product_id) {
      window.location.href = `/products/${slide.product_id}`;
    }
  };

  if (loading) {
    return (
      <HeroSection ref={heroRef}>
        <HeroContent>
          <HeroText ref={textRef}>
            <HeroTitle>Loading...</HeroTitle>
          </HeroText>
        </HeroContent>
      </HeroSection>
    );
  }

  if (slides.length === 0) {
    return (
      <HeroSection ref={heroRef}>
        <FloatingShapes>
          <div className="shape"></div>
          <div className="shape"></div>
          <div className="shape"></div>
        </FloatingShapes>
        <HeroContent>
          <HeroText ref={textRef}>
            <HeroTitle>
              {settings.hero?.title || 'Discover Premium Products for Your Lifestyle'}
            </HeroTitle>
            <HeroDescription>
              {settings.hero?.description || 'Explore our curated collection of high-quality products designed to enhance your everyday life.'}
            </HeroDescription>
          </HeroText>
        </HeroContent>
      </HeroSection>
    );
  }

  return (
    <HeroSection ref={heroRef}>
      <SlideContainer>
        {slides.map((slide, index) => (
          <Slide
            key={slide.id}
            active={index === currentSlide}
            style={{ backgroundImage: `url(${slide.image})` }}
            onClick={() => handleSlideClick(slide)}
          >
            <SlideOverlay />
            
            {/* Slide's own title and description */}
            <HeroContent>
              <HeroText>
                <HeroTitle>
                  {slide.title || settings.hero?.title || 'Discover Premium Products'}
                </HeroTitle>
                <HeroDescription>
                  {slide.description || settings.hero?.description || 'Explore our curated collection of high-quality products.'}
                </HeroDescription>
              </HeroText>
            </HeroContent>
            
            {/* Product information as text */}
            {slide.product_title && (
              <ProductInfo>
                <ProductTitle>{slide.product_title}</ProductTitle>
                {slide.product_description && (
                  <ProductDescription>
                    {slide.product_description.length > 100 
                      ? `${slide.product_description.substring(0, 100)}...` 
                      : slide.product_description}
                  </ProductDescription>
                )}
                {slide.price && (
                  <ProductPrice>${slide.price.toFixed(2)}</ProductPrice>
                )}
              </ProductInfo>
            )}
          </Slide>
        ))}
      </SlideContainer>

      {slides.length > 1 && (
        <>
          <SlideArrow className="prev" onClick={prevSlide} disabled={currentSlide === 0}>
            ‹
          </SlideArrow>
          <SlideArrow className="next" onClick={nextSlide} disabled={currentSlide === slides.length - 1}>
            ›
          </SlideArrow>
          
          <SlideControls>
            {slides.map((_, index) => (
              <SlideDot
                key={index}
                active={index === currentSlide}
                onClick={() => goToSlide(index)}
              />
            ))}
          </SlideControls>
        </>
      )}

      <FloatingShapes>
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </FloatingShapes>
    </HeroSection>
  );
};

export default HeroSlideshow;
