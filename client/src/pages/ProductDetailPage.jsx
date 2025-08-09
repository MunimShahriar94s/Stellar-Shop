import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { fetchProductById, fetchProducts } from '../services/productService';
import { gsap } from 'gsap';
import { useCart } from '../context/CartContext';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  
  a {
    color: #666;
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: var(--primary-color);
    }
  }
  
  span {
    margin: 0 0.5rem;
    color: #999;
  }
  
  .current {
    color: var(--primary-color);
    font-weight: 500;
  }
`;

const ProductContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '';
    display: block;
    padding-top: 100%;
  }
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Category = styled.span`
  color: var(--primary-color);
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const ProductTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Price = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--text-color);
`;

const Description = styled.p`
  color: var(--text-color);
  opacity: 0.7;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 2rem 0;
`;

const QuantitySelector = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  
  button {
    background-color: var(--input-bg);
    border: 1px solid var(--input-border);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.3rem;
    font-weight: 600;
    transition: all 0.3s ease;
    border-radius: 8px;
    color: var(--text-color);
    
    &:hover:not(:disabled) {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
      transform: scale(1.05);
    }
    
    &:disabled {
      background-color: var(--input-bg);
      color: var(--text-color);
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  span {
    width: 60px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--input-border);
    margin: 0 0.5rem;
    border-radius: 8px;
    background-color: var(--card-bg);
    font-weight: 600;
    color: var(--text-color);
    font-size: 1.1rem;
  }
`;

const AddToCartButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Features = styled.div`
  margin-top: 2rem;
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
    
    li {
      padding: 0.5rem 0;
      display: flex;
      align-items: center;
      
      &::before {
        content: '✓';
        color: var(--primary-color);
        margin-right: 0.5rem;
        font-weight: bold;
      }
    }
  }
`;

const RelatedProducts = styled.div`
  margin-top: 4rem;
  
  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    text-align: center;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background-color: var(--primary-color);
    }
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ProductCard = styled(Link)`
  background-color: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px var(--shadow-color);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px var(--shadow-color);
  }
`;

const CardImage = styled.div`
  height: 200px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  ${ProductCard}:hover & img {
    transform: scale(1.1);
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const CardPrice = styled.div`
  font-weight: 700;
  color: var(--primary-color);
`;

const Toast = styled.div`
  position: fixed;
  left: 50%;
  bottom: 40px;
  transform: translateX(-50%);
  min-width: 220px;
  background: ${({ type }) => type === 'success' ? '#4BB543' : '#d9534f'};
  color: white;
  padding: 1rem 2rem;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  font-size: 1rem;
  z-index: 9999;
  opacity: 0.97;
  animation: fadeIn 0.3s;
  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 0.97; transform: translateX(-50%) translateY(0); }
  }
`;

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const imageRef = useRef(null);
  const infoRef = useRef(null);
  const { addToCart, toast, clearToast } = useCart();
  
  useEffect(() => {
    const getProductDetails = async () => {
      try {
        setLoading(true);
        const productId = parseInt(id);
        const productData = await fetchProductById(productId);
        setProduct(productData);
        
        // Get related products (same category, excluding current product)
        const allProducts = await fetchProducts();
        const related = allProducts
          .filter(p => p.category === productData.category && p.id !== productId)
          .slice(0, 4);
        
        setRelatedProducts(related);
        setError('');
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
      
      // Scroll to top when product changes
      window.scrollTo(0, 0);
    };
    
    getProductDetails();
  }, [id]);
  
  useEffect(() => {
    if (imageRef.current && infoRef.current) {
      // Animate product details on page load
      gsap.fromTo(
        imageRef.current,
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
      
      gsap.fromTo(
        infoRef.current,
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );
    }
  }, [product]);
  
  const incrementQuantity = () => {
    const maxQuantity = 10; // Hard limit of 10 items per product
    if (quantity < maxQuantity) {
      setQuantity(prev => prev + 1);
    }
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  // REMOVE Toast and useEffect for toast here, as it is now handled at the app/page level
  
  if (loading) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Loading product...</h2>
        </div>
      </PageContainer>
    );
  }
  
  if (error || !product) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>Product not found</h2>
          <p>{error || "The product you're looking for doesn't exist or has been removed."}</p>
          <Link to="/products" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
            Browse all products
          </Link>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <Breadcrumbs>
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category.toLowerCase()}`}>{product.category}</Link>
        <span>/</span>
        <span className="current">{product.title}</span>
      </Breadcrumbs>
      
      <ProductContainer>
        <ImageContainer ref={imageRef}>
          <img src={product.image} alt={product.title} />
        </ImageContainer>
        
        <ProductInfo ref={infoRef}>
          <Category>{product.category}</Category>
          <ProductTitle>{product.title}</ProductTitle>
          <Price>${product.price.toFixed(2)}</Price>
          <Description>{product.description}</Description>
          
          <Features>
            <h3>Features</h3>
            <ul>
              <li>Premium quality materials</li>
              <li>Designed for durability and performance</li>
              <li>Modern aesthetic that fits any style</li>
              <li>Satisfaction guaranteed</li>
            </ul>
          </Features>
          
          <Divider />
          
          <QuantitySelector>
            <button 
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              -
            </button>
            <span>{quantity}</span>
            <button 
              onClick={incrementQuantity}
              disabled={quantity >= 10}
            >
              +
            </button>
          </QuantitySelector>
          
          <AddToCartButton onClick={() => {
            // Add product to cart with selected quantity
            addToCart({...product, quantity});
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Add to Cart
          </AddToCartButton>
        </ProductInfo>
      </ProductContainer>
      
      {relatedProducts.length > 0 && (
        <RelatedProducts>
          <h2>Related Products</h2>
          <ProductGrid>
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} to={`/product/${relatedProduct.id}`}>
                <CardImage>
                  <img src={relatedProduct.image} alt={relatedProduct.title} />
                </CardImage>
                <CardContent>
                  <CardTitle>{relatedProduct.title}</CardTitle>
                  <CardPrice>${relatedProduct.price.toFixed(2)}</CardPrice>
                </CardContent>
              </ProductCard>
            ))}
          </ProductGrid>
        </RelatedProducts>
      )}
    </PageContainer>
  );
};

export default ProductDetailPage;