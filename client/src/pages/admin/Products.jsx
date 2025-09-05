import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/admin/Header';
import { checkAdminStatus } from '../../utils/adminCheck';
import { useOutletContext } from 'react-router-dom';
import editIcon from '../../assets/edit-icon.svg';
import deleteIcon from '../../assets/delete-icon.svg';

// Toast animation keyframes
const slideIn = keyframes`
  from { transform: translateX(120%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;
const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(120%); opacity: 0; }
`;

const ToastContainer = styled.div`
  position: fixed;
  bottom: 2.5rem;
  right: 2.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

// PATCH: Update Toast to greenish glassy design and fix animation logic
const ToastBox = styled.div`
  min-width: 320px;
  max-width: 400px;
  background: rgba(40, 220, 120, 0.25);
  backdrop-filter: blur(8px) saturate(1.5);
  color: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(30, 60, 30, 0.18);
  padding: 1.25rem 2.5rem 1.25rem 1.5rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  font-size: 1.1rem;
  font-weight: 500;
  letter-spacing: 0.01em;
  animation: ${props => props.hide ? slideOut : slideIn} 0.5s cubic-bezier(0.7,0,0.3,1);
  transition: box-shadow 0.2s, background 0.2s;
  position: relative;
  border: 2px solid #3be07a;
  background-image: linear-gradient(135deg, rgba(40,220,120,0.25) 0%, rgba(60,255,180,0.18) 100%);
`;

const ToastIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(60,255,180,0.12);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
`;

const ToastClose = styled.button`
  position: absolute;
  top: 0.7rem;
  right: 1rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
  &:hover { opacity: 1; }
`;

function Toast({ show, onClose, message }) {
  const [hide, setHide] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const timerRef = useRef();

  useEffect(() => {
    if (show) {
      setHide(false);
      setHasShown(true);
      timerRef.current = setTimeout(() => {
        setHide(true);
        setTimeout(() => {
          setHasShown(false);
          onClose();
        }, 500); // match slideOut duration
      }, 2000);
    }
    return () => clearTimeout(timerRef.current);
  }, [show, onClose]);

  if ((!show && !hide) || !hasShown) return null;
  return (
    <ToastContainer>
      <ToastBox hide={hide}>
        <ToastIcon>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3be07a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
        </ToastIcon>
        <span>{message}</span>
        <ToastClose onClick={() => { setHide(true); setTimeout(() => { setHasShown(false); onClose(); }, 500); }}>&times;</ToastClose>
      </ToastBox>
    </ToastContainer>
  );
}

const ProductsContainer = styled.div`
  padding: 1.5rem;
  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 2rem 0 1rem;
  color: var(--text-color);
  
  &:first-child {
    margin-top: 0;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  font-size: 0.9rem;
  width: 250px;
  background-color: var(--input-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.1);
  }
`;

// PATCH: Improve Add Product button hover animation and ensure plus sign on both
const AddButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.08);
  will-change: transform, box-shadow;
  &:hover {
    background-color: var(--primary-hover);
    transform: scale(1.06) translateY(-2px);
    box-shadow: 0 6px 18px rgba(255, 107, 107, 0.18);
  }
  svg {
    width: 16px;
    height: 16px;
    margin-right: 0.2rem;
  }
  @media (max-width: 768px) {
    padding: 0.5rem 0.7rem;
    border-radius: 50%;
    min-width: 0;
    width: 40px;
    height: 40px;
    justify-content: center;
    font-size: 1.2rem;
    svg {
      margin-right: 0;
      width: 22px;
      height: 22px;
    }
  }
`;

// Restore EmptyAddButton to always show text and be wide, regardless of screen size.
const EmptyAddButton = styled.button`
  margin-top: 0.5rem;
  font-size: 1.05rem;
  padding: 0.7rem 2.2rem;
  border-radius: 6px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.08);
  transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
  font-weight: 600;
  svg {
    width: 20px;
    height: 20px;
    margin-right: 0.4rem;
  }
  &:hover {
    background-color: var(--primary-hover);
    transform: scale(1.04) translateY(-2px);
    box-shadow: 0 6px 18px rgba(255, 107, 107, 0.18);
  }
`;

const AddProductText = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 0.7rem;
    min-width: unset;
  }
`;

const ProductCard = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow-color);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  @media (max-width: 600px) {
    border-radius: 8px;
    font-size: 0.95rem;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 25px var(--shadow-color);
  }
`;

const ProductImage = styled.div`
  height: 200px;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  ${ProductCard}:hover & img {
    transform: scale(1.05);
  }
`;

const ProductActions = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.75rem;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${ProductCard}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ActionButton = styled.button`
  background-color: rgba(255, 255, 255, 0.95);
  color: #333;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  
  &:hover {
    background-color: ${props => props.delete ? '#f44336' : 'var(--primary-color)'};
    color: white;
    transform: scale(1.1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  img {
    width: 18px;
    height: 18px;
    transition: all 0.3s ease;
    filter: ${props => props.delete ? 'brightness(0)' : 'none'};
  }
  
  &:hover img {
    filter: ${props => props.delete ? 'invert(1)' : 'invert(1)'};
  }
  
  @media (max-width: 600px) {
    width: 44px;
    height: 44px;
    img {
      width: 24px;
      height: 24px;
    }
  }
`;

const ProductContent = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const ProductPrice = styled.div`
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const ProductCategory = styled.div`
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 0.5rem;
`;

const ProductStock = styled.div`
  font-size: 0.8rem;
  color: ${props => props.inStock ? 'var(--success-color)' : 'var(--danger-color)'};
`;

const ProductModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 8px 32px var(--shadow-color);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  @media (max-width: 600px) {
    max-width: 100vw;
    padding: 0.5rem;
  }
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-color);
  opacity: 0.7;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    color: var(--primary-color);
    opacity: 1;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: var(--input-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  font-size: 0.9rem;
  min-height: 100px;
  resize: vertical;
  background-color: var(--input-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: var(--input-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 200px;
  border: 1px dashed var(--input-border);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
  background-color: var(--input-bg);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UploadButton = styled.label`
  display: inline-block;
  background-color: var(--input-bg);
  color: var(--text-color);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--input-border);
  
  &:hover {
    background-color: var(--border-color);
  }
  
  input {
    display: none;
  }
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const CancelButton = styled(Button)`
  background-color: var(--input-bg);
  color: var(--text-color);
  border: 1px solid var(--input-border);
  
  &:hover {
    background-color: var(--border-color);
  }
`;

const SaveButton = styled(Button)`
  background-color: var(--primary-color);
  color: white;
  border: none;
  
  &:hover {
    background-color: var(--primary-hover);
  }
`;

// PATCH: Update empty state for no products
const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem 2rem 2rem;
  background: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 20px var(--shadow-color);
  margin: 2rem auto;
  max-width: 420px;
  border: 2px dashed var(--primary-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: fadeIn 0.7s cubic-bezier(0.7,0,0.3,1);
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1.2rem;
    color: var(--primary-color);
    font-weight: 700;
    letter-spacing: 0.01em;
  }
  p {
    color: var(--text-color);
    margin-bottom: 2.2rem;
    font-size: 1.05rem;
  }
  button {
    background: linear-gradient(90deg, var(--primary-color, #ff6b6b) 0%, var(--primary-hover, #ff8787) 100%);
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 0.7rem 2.2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.12);
    transition: background 0.2s, box-shadow 0.2s;
    &:hover {
      background: linear-gradient(90deg, var(--primary-hover, #ff8787) 0%, var(--primary-color, #ff6b6b) 100%);
      box-shadow: 0 4px 16px rgba(255, 107, 107, 0.18);
    }
  }
`;

// Add error box styles
const ErrorBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 3rem auto;
  max-width: 420px;
  padding: 2.5rem 2rem 2rem 2rem;
  background: rgba(255, 80, 80, 0.12);
  border: 2px solid #ff6b6b;
  border-radius: 16px;
  box-shadow: 0 2px 18px rgba(255, 80, 80, 0.08);
  animation: fadeIn 0.7s cubic-bezier(0.7,0,0.3,1);
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
const ErrorIcon = styled.div`
  margin-bottom: 1.2rem;
  svg {
    width: 48px;
    height: 48px;
    stroke: #ff6b6b;
    display: block;
  }
`;
const ErrorHeading = styled.h3`
  color: #ff6b6b;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.7rem;
`;
const ErrorText = styled.p`
  color: #b23b3b;
  font-size: 1.05rem;
  margin-bottom: 2rem;
  text-align: center;
`;
const RetryButton = styled.button`
  background: linear-gradient(90deg, #ff6b6b 0%, #ff8787 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.7rem 2.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.12);
  transition: background 0.2s, box-shadow 0.2s;
  &:hover {
    background: linear-gradient(90deg, #ff8787 0%, #ff6b6b 100%);
    box-shadow: 0 4px 16px rgba(255, 107, 107, 0.18);
  }
`;

const ConfirmationModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1001;
`;

const ConfirmationContent = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 10px 30px var(--shadow-color);
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 400px;
  margin: 1rem;
`;

const ConfirmationHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ConfirmationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.type === 'warning' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(220, 53, 69, 0.1)'};
  color: ${props => props.type === 'warning' ? 'var(--warning-color)' : 'var(--danger-color)'};
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const ConfirmationTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
`;

const ConfirmationBody = styled.div`
  padding: 1.5rem;
`;

const ConfirmationMessage = styled.p`
  color: var(--text-color);
  line-height: 1.5;
  margin: 0;
`;

const ConfirmationFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const ConfirmationButton = styled.button`
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  
  &.cancel {
    background-color: var(--input-bg);
    color: var(--text-color);
    border: 1px solid var(--input-border);
    
    &:hover {
      background-color: var(--border-color);
    }
  }
  
  &.confirm {
    background-color: var(--danger-color);
    color: white;
    
    &:hover {
      background-color: #c82333;
    }
  }
  
  &.okay {
    background-color: var(--primary-color);
    color: white;
    
    &:hover {
      background-color: var(--primary-hover);
    }
  }
`;



const Products = (props) => {
  const { onMenuClick } = useOutletContext() || {};
  const [searchParams] = useSearchParams();
  const [productsList, setProductsList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [fetchError, setFetchError] = useState(false);
  
  // Add local state to track focus for price and stock
  const [priceFocused, setPriceFocused] = useState(false);
  const [stockFocused, setStockFocused] = useState(false);
  
  // Confirmation modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'delete', // 'delete' or 'warning'
    title: '',
    message: '',
    onConfirm: null
  });

  // Get category filter from URL
  const categoryFilter = searchParams.get('category');
  const categoryName = searchParams.get('categoryName');

  // Helper function to get category name by ID
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find(cat => cat.id == categoryId);
    return category ? category.name : 'Uncategorized';
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const categoriesData = await response.json();
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Move fetchProducts out of useEffect for retry
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      setFetchError(false);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/products/admin', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Unexpected response format');
      }
      const normalizedProducts = data.map(product => {
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        const normalizedProduct = {
          ...product,
          price: isNaN(price) ? 0 : price,
          stock: parseInt(product.stock) || 0
        };
        return normalizedProduct;
      });
      const sortedProducts = [...normalizedProducts].sort((a, b) => a.id - b.id);
      setProductsList(sortedProducts);
      setFilteredProducts(sortedProducts);
      setError('');
      setFetchError(false);
    } catch (err) {
      setProductsList([]);
      setFilteredProducts([]);
      setError('Failed to load products. Please try again.');
      setFetchError(true);
    } finally {
      setLoading(false); // Always set loading to false after fetch
    }
  };
  
  // Filter products based on search term and category filter
  useEffect(() => {
    let filtered = productsList;
    
    // Apply category filter if present
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category_id == categoryFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(product.category_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [searchTerm, productsList, categoryFilter]);
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    window.scrollTo(0, 0);
  }, []);
  
  const handleAddProduct = () => {
    setCurrentProduct({
      title: '',
      description: '',
      price: 0,
      category_id: '',
      stock: 0,
      image: ''
    });
    setSelectedImageFile(null);
    setIsModalOpen(true);
  };
  
  const handleEditProduct = async (product) => {
    try {
      setCurrentProduct({ ...product });
      setSelectedImageFile(null);
      setIsModalOpen(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
      setCurrentProduct({ ...product });
      setSelectedImageFile(null);
      setIsModalOpen(true);
    }
  };
  
  const handleDeleteProduct = async (id) => {
    const product = productsList.find(p => p.id === id);
    if (!product) return;

    // Show confirmation popup for deletion
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            setConfirmationModal({
              isOpen: true,
              type: 'warning',
              title: 'Error',
              message: 'You must be logged in to perform this action.',
              onConfirm: () => setConfirmationModal({ isOpen: false, type: 'delete', title: '', message: '', onConfirm: null })
            });
            return;
          }
          
          const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          });
          
          if (!response.ok) {
            throw new Error('Failed to delete product');
          }
          
          // Update local state after successful delete
          setProductsList(prevProducts => prevProducts.filter(product => product.id !== id));
          setConfirmationModal({ isOpen: false, type: 'delete', title: '', message: '', onConfirm: null });
          
          // Show success toast
          setToastMessage('Product deleted successfully');
          setShowToast(true);
        } catch (err) {
          console.error('Error deleting product:', err);
          setConfirmationModal({
            isOpen: true,
            type: 'warning',
            title: 'Error',
            message: `Failed to delete product: ${err.message}`,
            onConfirm: () => setConfirmationModal({ isOpen: false, type: 'delete', title: '', message: '', onConfirm: null })
          });
        }
      }
    });
  };
  
  const handleSaveProduct = async () => {
    try {
      setSaveLoading(true);
      setSaveSuccess(false);
      const adminCheck = await checkAdminStatus();
      if (!adminCheck.isAdmin) {
        alert(`Admin access required. Your current role is: ${adminCheck.role || 'unknown'}`);
        setSaveLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to perform this action');
        setSaveLoading(false);
        return;
      }
      let imageUrl = currentProduct.image;
      // --- FIX 2: Only upload if a new file is selected ---
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append('image', selectedImageFile);
        const uploadResponse = await fetch('/admin/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Failed to upload image: ${errorText}`);
        }
        const imageData = await uploadResponse.json();
        imageUrl = imageData.imageUrl;
      }
      const productToSave = {
        ...currentProduct,
        title: currentProduct.title,
        price: currentProduct.price === '' ? 0 : Number(currentProduct.price),
        category_id: currentProduct.category_id || null,
        image: imageUrl
      };
      const res = await fetch(`/api/products${currentProduct.id ? `/${currentProduct.id}` : ''}`, {
        method: currentProduct.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productToSave),
        credentials: 'include',
      });
      if (!res.ok) {
        let errorMsg = 'Unknown error';
        try {
        const errorData = await res.json();
          errorMsg = errorData.details || errorData.error || errorMsg;
        } catch {}
        throw new Error(`Failed to save product: ${errorMsg}`);
        }
      let savedProduct = await res.json();
      savedProduct = {
        ...savedProduct,
        price: Number(savedProduct.price)
      };
      setProductsList(prevProducts => {
        if (currentProduct.id) {
          return prevProducts.map(p => (p.id === savedProduct.id ? savedProduct : p));
        } else {
          return [...prevProducts, savedProduct];
        }
      });
      setSelectedImageFile(null);
      setIsModalOpen(false);
      setSaveSuccess(true);
      setToastMessage('Product saved successfully!');
      setShowToast(true);
    } catch (err) {
      alert(`Error saving product: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock'
        ? (value === '' ? 0 : Number(value))
        : value
    }));
  };
  
  return (
    <>
      <Header title={categoryName ? `Products - ${categoryName}` : "Products"} onMenuClick={onMenuClick} />
      <ProductsContainer>
        <ActionBar>
          <SearchInput 
            type="text" 
            placeholder={categoryName ? `Search products in ${categoryName}...` : "Search products..."} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AddButton onClick={handleAddProduct} aria-label="Add Product">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12H19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <AddProductText>Add Product</AddProductText>
          </AddButton>
        </ActionBar>

        {categoryName && (
          <div style={{ marginBottom: '1rem', padding: '0.5rem 1rem', backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Showing products in category: <strong>{categoryName}</strong></span>
            <button 
              onClick={() => window.history.back()} 
              style={{ 
                background: 'none', 
                border: '1px solid white', 
                color: 'white', 
                padding: '0.25rem 0.5rem', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Clear Filter
            </button>
          </div>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>
        ) : fetchError ? (
          <ErrorBox>
            <ErrorIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            </ErrorIcon>
            <ErrorHeading>Failed to load products</ErrorHeading>
            <ErrorText>We couldn't load your products. Please check your connection or try again.</ErrorText>
            <RetryButton onClick={fetchProducts}>Retry</RetryButton>
          </ErrorBox>
        ) : filteredProducts.length === 0 ? (
          <EmptyState>
            <h3>Nothing to see here!</h3>
            <p>No products found. Click the button below to add your first product.</p>
            <EmptyAddButton onClick={handleAddProduct}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 12H19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add Product
            </EmptyAddButton>
          </EmptyState>
        ) : (
          <ProductsGrid>
          {filteredProducts.map(product => (
            <ProductCard key={product.id}>
              <ProductImage>
                <img src={product.image} alt={product.title} />
                <ProductActions>
                  <ActionButton onClick={() => handleEditProduct(product)} title="Edit Product">
                    <img src={editIcon} alt="Edit" />
                  </ActionButton>
                  <ActionButton delete onClick={() => handleDeleteProduct(product.id)} title="Delete Product">
                    <img src={deleteIcon} alt="Delete" />
                  </ActionButton>
                </ProductActions>
              </ProductImage>
              <ProductContent>
                <ProductName>{product.title == null ? 'No Title' : product.title}</ProductName>
                <ProductPrice>
                  ${!isNaN(product.price) ? Number(product.price).toFixed(2) : '0.00'}
                </ProductPrice>

                <ProductCategory>Category: {getCategoryName(product.category_id)}</ProductCategory>
                <ProductStock inStock={product.stock > 0}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </ProductStock>
              </ProductContent>
            </ProductCard>
          ))}
        </ProductsGrid>
        )}
      </ProductsContainer>
      
      {/* Product Edit/Add Modal */}
      <ProductModal isOpen={isModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>{currentProduct?.id ? 'Edit Product' : 'Add New Product'}</ModalTitle>
            <CloseButton onClick={() => setIsModalOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </CloseButton>
          </ModalHeader>
          
          <ModalBody>
            {currentProduct && (
              <>
                <FormGroup>
                  <Label htmlFor="image">Product Image</Label>
                  <ImagePreview>
                    {currentProduct.image ? (
                      <img src={currentProduct.image} alt="Product Preview" />
                    ) : (
                      <span>No image selected</span>
                    )}
                  </ImagePreview>
                  <UploadButton>
                    Upload Image
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setSelectedImageFile(file);

                        // Show a preview locally
                        const imageURL = URL.createObjectURL(file);
                        setCurrentProduct(prev => ({
                          ...prev,
                          image: imageURL // temporary preview URL
                        }));
                      }} 
                    />
                  </UploadButton>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="title">Product Name</Label>
                  <Input 
                    type="text" 
                    id="title" 
                    name="title" 
                    value={currentProduct.title} 
                    onChange={handleInputChange} 
                    required 
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input 
                    type="number" 
                    id="price" 
                    name="price" 
                    min="0" 
                    step="0.01" 
                    value={priceFocused && Number(currentProduct.price) === 0 ? '' : currentProduct.price}
                    onFocus={() => setPriceFocused(true)}
                    onBlur={e => {
                      setPriceFocused(false);
                      if (e.target.value === '' || isNaN(Number(e.target.value))) {
                        setCurrentProduct(prev => ({ ...prev, price: 0 }));
                      }
                    }}
                    onChange={handleInputChange} 
                    required 
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="category_id">Category</Label>
                  <Select 
                    id="category_id" 
                    name="category_id" 
                    value={currentProduct.category_id || ''} 
                    onChange={handleInputChange} 
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input 
                    type="number" 
                    id="stock" 
                    name="stock" 
                    min="0" 
                    value={stockFocused && Number(currentProduct.stock) === 0 ? '' : currentProduct.stock}
                    onFocus={() => setStockFocused(true)}
                    onBlur={e => {
                      setStockFocused(false);
                      if (e.target.value === '' || isNaN(Number(e.target.value))) {
                        setCurrentProduct(prev => ({ ...prev, stock: 0 }));
                      }
                    }}
                    onChange={handleInputChange} 
                    required 
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="description">Description</Label>
                  <TextArea 
                    id="description" 
                    name="description" 
                    value={currentProduct.description} 
                    onChange={handleInputChange} 
                    required 
                  />
                </FormGroup>
              </>
            )}
          </ModalBody>
          
          <ModalFooter>
            <CancelButton onClick={() => setIsModalOpen(false)} disabled={saveLoading}>
              Cancel
            </CancelButton>
            <SaveButton onClick={handleSaveProduct} disabled={saveLoading}>
              {saveLoading ? 'Saving...' : 'Save Product'}
            </SaveButton>
          </ModalFooter>
        </ModalContent>
      </ProductModal>

      {/* Confirmation Modal */}
      <ConfirmationModal isOpen={confirmationModal.isOpen}>
        <ConfirmationContent>
          <ConfirmationHeader>
            <ConfirmationIcon type={confirmationModal.type}>
              {confirmationModal.type === 'warning' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="10" y1="11" x2="10" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="14" y1="11" x2="14" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </ConfirmationIcon>
            <ConfirmationTitle>{confirmationModal.title}</ConfirmationTitle>
          </ConfirmationHeader>
          
          <ConfirmationBody>
            <ConfirmationMessage>{confirmationModal.message}</ConfirmationMessage>
          </ConfirmationBody>
          
          <ConfirmationFooter>
            {confirmationModal.type === 'delete' ? (
              <>
                <ConfirmationButton 
                  className="cancel" 
                  onClick={() => setConfirmationModal({ isOpen: false, type: 'delete', title: '', message: '', onConfirm: null })}
                >
                  Cancel
                </ConfirmationButton>
                <ConfirmationButton 
                  className="confirm" 
                  onClick={confirmationModal.onConfirm}
                >
                  Delete
                </ConfirmationButton>
              </>
            ) : (
              <ConfirmationButton 
                className="okay" 
                onClick={confirmationModal.onConfirm}
              >
                Okay
              </ConfirmationButton>
            )}
          </ConfirmationFooter>
        </ConfirmationContent>
      </ConfirmationModal>

      <Toast show={showToast} onClose={() => setShowToast(false)} message={toastMessage} />
    </>
  );
};

export default Products;