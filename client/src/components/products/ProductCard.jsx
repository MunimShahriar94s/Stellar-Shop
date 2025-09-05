import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../../context/CartContext';
import { useEffect } from 'react';

const Card = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px var(--shadow-color);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px var(--shadow-color);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  height: 200px;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 100%);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${Card}:hover & {
    transform: scale(1.1);
  }
`;

const QuickView = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--card-bg);
  color: var(--text-color);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
  
  ${Card}:hover & {
    opacity: 1;
  }
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
`;

const ViewDetails = styled(Link)`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--primary-color);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
  font-size: 0.9rem;
  
  ${Card}:hover & {
    opacity: 1;
    bottom: 20px;
  }
  
  &:hover {
    background-color: var(--primary-hover);
    transform: translateX(-50%) translateY(-3px);
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Category = styled.span`
  color: var(--primary-color);
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const ProductName = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
`;

const ProductDescription = styled.p`
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  flex-grow: 1;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const StockStatus = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.5rem;
  color: ${props => props.inStock ? 'var(--success-color, #28a745)' : 'var(--danger-color, #dc3545)'};
`;

const Price = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-color);
`;

const AddToCartButton = styled.button`
  background-color: ${props => props.disabled ? '#ccc' : 'var(--primary-color)'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.7rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: ${props => props.disabled ? 0.7 : 1};
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:hover {
    background-color: ${props => props.disabled ? '#ccc' : 'var(--primary-hover)'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${props => (props.isOpen ? '1' : '0')};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow: auto;
  transform: ${props => (props.isOpen ? 'scale(1)' : 'scale(0.9)')};
  transition: transform 0.3s ease;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const ModalImage = styled.div`
  flex: 1;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px 0 0 8px;
  }
  
  @media (max-width: 767px) {
    img {
      border-radius: 8px 8px 0 0;
      max-height: 300px;
    }
  }
`;

const ModalDetails = styled.div`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: var(--card-bg);
  color: var(--text-color);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
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

const ProductCard = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart, cartItems, toast, clearToast } = useCart();
  
  // Check if product is already in cart and get current quantity
  const existingItem = cartItems.find(item => item.id === product.id);
  const currentQuantity = existingItem ? existingItem.quantity : 0;
  const maxQuantity = 10; // Hard limit of 10 items per product
  const canAddToCart = product.stock > 0 && currentQuantity < maxQuantity;
  
  const openModal = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const handleAddToCart = () => {
    if (!canAddToCart) {
      window.dispatchEvent(new CustomEvent('cart-toast', {
        detail: {
          open: true,
          message: 'Maximum 10 items per product allowed',
          type: 'warning'
        }
      }));
      return;
    }
    addToCart(product);
  };
  
  return (
    <>
      <Card className="product-card">
        <ImageContainer>
          <ProductImage src={product.image} alt={product.title} />
          <QuickView onClick={openModal}>Quick View</QuickView>
          <ViewDetails to={`/product/${product.id}`}>View Details</ViewDetails>
        </ImageContainer>
        <CardContent>
          <Category>{product.category}</Category>
          <ProductName>{product.title}</ProductName>
          <ProductDescription>{product.description}</ProductDescription>
          <StockStatus inStock={product.stock > 0}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </StockStatus>
          <PriceRow>
            <Price>${product.price.toFixed(2)}</Price>
            <AddToCartButton 
              disabled={!canAddToCart}
              onClick={handleAddToCart}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {currentQuantity > 0 ? `In Cart (${currentQuantity})` : 'Add'}
            </AddToCartButton>
          </PriceRow>
        </CardContent>
      </Card>
      
      <Modal isOpen={isModalOpen} onClick={closeModal}>
        <ModalContent isOpen={isModalOpen} onClick={(e) => e.stopPropagation()}>
          <ModalImage>
            <img src={product.image} alt={product.title} />
          </ModalImage>
          <ModalDetails>
            <Category>{product.category}</Category>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--text-color)' }}>{product.title}</h2>
            <p style={{ color: 'var(--text-color)', opacity: 0.7, marginBottom: '1.5rem' }}>{product.description}</p>
                          <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Features:</h4>
                <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-color)', opacity: 0.7 }}>
                <li>Premium quality materials</li>
                <li>Designed for durability and performance</li>
                <li>Modern aesthetic that fits any style</li>
                <li>Satisfaction guaranteed</li>
              </ul>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <StockStatus inStock={product.stock > 0} style={{ fontSize: '1rem' }}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </StockStatus>
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Price style={{ fontSize: '1.5rem' }}>${product.price.toFixed(2)}</Price>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <AddToCartButton 
                  style={{ padding: '0.8rem 1.5rem' }} 
                  disabled={!canAddToCart}
                  onClick={handleAddToCart}
                >
                  {currentQuantity > 0 ? `In Cart (${currentQuantity})` : 'Add to Cart'}
                </AddToCartButton>
                <Link 
                  to={`/product/${product.id}`} 
                  style={{ 
                    padding: '0.8rem 1.5rem',
                    background: 'var(--input-bg)',
                    color: 'var(--text-color)',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  View Details
                </Link>
              </div>
            </div>
          </ModalDetails>
          <CloseButton onClick={closeModal}>✕</CloseButton>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductCard;