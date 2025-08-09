import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Hero from '../components/hero/Hero';
import ProductGrid from '../components/products/ProductGrid';
import { products as mockProducts } from '../data/products';
import { productsAPI } from '../services/api';
import { useSectionAnimation, useFeatureAnimation } from '../hooks/useGsapAnimations';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const HomeContainer = styled.div`
  width: 100%;
`;

const Section = styled.section`
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
  color: var(--text-color);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background-color: var(--primary-color);
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionDescription = styled.p`
  color: var(--text-color);
  opacity: 0.7;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const FeaturesSection = styled.section`
  padding: 5rem 2rem;
  background-color: var(--bg-color);

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FeatureCard = styled.div`
  background-color: var(--card-bg);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow-color);
  text-align: center;
  transition: transform 0.3s ease;
  border: 1px solid var(--border-color);
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 6px 25px var(--shadow-color);
  }
`;

const FeatureIcon = styled.div`
  width: 70px;
  height: 70px;
  background-color: rgba(255, 107, 107, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  
  svg {
    color: var(--primary-color);
    width: 35px;
    height: 35px;
  }
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--text-color);
`;

const FeatureDescription = styled.p`
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.95rem;
`;

const CTASection = styled.section`
  padding: 5rem 2rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  text-align: center;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTADescription = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.8);

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    padding: 0.8rem 2rem;
  }
`;

const HomePage = () => {
  // State for products
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { sectionRef } = useSectionAnimation();
  const { featuresRef } = useFeatureAnimation();
  const location = useLocation();
  const { setUser, setIsAdmin } = useAuth();
  const { toast, clearToast } = useCart();
  
  // Handle OAuth login redirect with token
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const loginSuccess = params.get('login');
    const token = params.get('token');
    
    if (loginSuccess === 'success' && token) {
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Fetch user data
      fetch('/auth/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          if (data.isAuthenticated) {
            setUser(data.user);
            setIsAdmin(data.isAdmin);
      
          }
        })
        .catch(err => console.error('Error fetching user data:', err));
      
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
    }
  }, [location, setUser, setIsAdmin]);
  
  // Fetch products when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getAll();
        
        // If API returns actual product data, use it
        if (Array.isArray(data)) {
          // Display only 8 featured products
          setFeaturedProducts(data.slice(0, 8));
        } else {
          // Fallback to mock data if API doesn't return an array
    
          setFeaturedProducts(mockProducts.slice(0, 8));
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        // Fallback to mock data on error
        setFeaturedProducts(mockProducts.slice(0, 8));
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
    window.scrollTo(0, 0);
  }, []);
  
  // REMOVE Toast and useEffect for toast here, as it is now handled globally
  
  return (
    <HomeContainer>
      <Hero />
      
      <Section ref={sectionRef}>
        <SectionHeader>
          <SectionTitle>Featured Products</SectionTitle>
          <SectionDescription>
            Discover our handpicked selection of premium products that combine quality, style, and functionality.
          </SectionDescription>
        </SectionHeader>
        
        <ProductGrid products={featuredProducts} />
        
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <CTAButton to="/products">View All Products</CTAButton>
        </div>
      </Section>
      
      <FeaturesSection>
        <SectionHeader>
          <SectionTitle>Why Choose Us</SectionTitle>
          <SectionDescription>
            We're committed to providing the best shopping experience with premium products and exceptional service.
          </SectionDescription>
        </SectionHeader>
        
        <FeaturesGrid ref={featuresRef}>
          <FeatureCard className="feature-card">
            <FeatureIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 7H7.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </FeatureIcon>
            <FeatureTitle>Premium Quality</FeatureTitle>
            <FeatureDescription>
              We source only the highest quality products that meet our strict standards for durability and performance.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard className="feature-card">
            <FeatureIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12H2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.45 5.11L2 12V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 12V16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 12V16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 12V16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 12V16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </FeatureIcon>
            <FeatureTitle>Fast Shipping</FeatureTitle>
            <FeatureDescription>
              Enjoy quick and reliable shipping options to get your products delivered right to your doorstep.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard className="feature-card">
            <FeatureIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 14C20.49 12.54 22 10.79 22 8.5C22 7.04131 21.4205 5.64236 20.3891 4.61091C19.3576 3.57946 17.9587 3 16.5 3C14.74 3 13.5 3.5 12 5C10.5 3.5 9.26 3 7.5 3C6.04131 3 4.64236 3.57946 3.61091 4.61091C2.57946 5.64236 2 7.04131 2 8.5C2 10.8 3.5 12.55 5 14L12 21L19 14Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </FeatureIcon>
            <FeatureTitle>Customer Satisfaction</FeatureTitle>
            <FeatureDescription>
              Your satisfaction is our priority. We offer hassle-free returns and dedicated customer support.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>
      
      <CTASection>
        <CTAContent>
          <CTATitle>Ready to Elevate Your Shopping Experience?</CTATitle>
          <CTADescription>
            Join thousands of satisfied customers who have discovered the perfect products for their lifestyle. Start exploring our collection today!
          </CTADescription>
          <CTAButton to="/products">Shop Now</CTAButton>
        </CTAContent>
      </CTASection>

      {/* Toast popup */}
      {/* REMOVE Toast and useEffect for toast here, as it is now handled globally */}
    </HomeContainer>
  );
};

export default HomePage;