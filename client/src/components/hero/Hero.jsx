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
  margin-top: 1.2rem;
  @media (max-width: 600px) {
    height: 70vh;
    min-height: 370px;
    padding: 0;
    margin-top: 0.5rem;
  }
`;

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.0.3');
  background-size: cover;
  background-position: center;
  opacity: 0.2;
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

const Hero = () => {
  const { heroRef, textRef, ctaRef } = useHeroAnimation();
  
  return (
    <HeroSection ref={heroRef}>
      <HeroBackground />
      <FloatingShapes>
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </FloatingShapes>
      <HeroContent>
        <HeroText ref={textRef}>
          <HeroTitle>
            Discover <span>Premium</span> Products for Your Lifestyle
          </HeroTitle>
          <HeroDescription>
            Explore our curated collection of high-quality products designed to enhance your everyday life. From cutting-edge electronics to stylish home decor, we have everything you need.
          </HeroDescription>
          <HeroButtons ref={ctaRef}>
            <PrimaryButton to="/products">Shop Now</PrimaryButton>
            <SecondaryButton to="/about">Learn More</SecondaryButton>
          </HeroButtons>
        </HeroText>
      </HeroContent>
    </HeroSection>
  );
};

export default Hero;