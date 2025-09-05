import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import ProductGrid from '../components/products/ProductGrid';
import ProductSidebar from '../components/products/ProductSidebar';
import { productsAPI } from '../services/api';
import { getAllCategories } from '../services/categoriesService';


const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
  }
`;

const SidebarContainer = styled.div`
  width: 250px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const MainContent = styled.div`
  flex: 1;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
  
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
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
`;

const FilterTag = styled.div`
  background-color: var(--primary-color);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    padding: 0;
  }
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--input-bg)'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: 1px solid var(--input-border);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-hover)' : 'var(--border-color)'};
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
`;

const SearchInput = styled.input`
  padding: 0.8rem 1rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  width: 100%;
  max-width: 500px;
  font-size: 1rem;
  background-color: var(--input-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.2);
  }
  
  &::placeholder {
    color: var(--text-color);
    opacity: 0.5;
  }
`;

const NoResults = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-color);
  opacity: 0.7;
`;

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productsList, setProductsList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch products from API when component mounts
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        setLoading(true);
        const data = await productsAPI.getAll();
        
        setProductsList(data);
        setFilteredProducts(data);
        setError('');
      } catch (err) {
        console.error('Error fetching products:', err);
        setProductsList([]);
        setFilteredProducts([]);
        setError('Failed to fetch products from server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductsData();
    window.scrollTo(0, 0);
  }, []);
  
  // Get unique categories from API
  const [categories, setCategories] = useState(['all']);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        const categoryNames = ['all', ...categoriesData.map(cat => cat.name)];
        setCategories(categoryNames);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to product categories if API fails
        const productCategories = ['all', ...new Set(productsList.map(product => product.category))];
        setCategories(productCategories);
      }
    };
    
    if (productsList.length > 0) {
      fetchCategories();
    }
  }, [productsList]);
  
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setActiveCategory(category);
    }
    
    const minPrice = searchParams.get('minPrice');
    if (minPrice) {
      setMinPriceFilter(minPrice);
    }
    
    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) {
      setMaxPriceFilter(maxPrice);
    }
  }, [searchParams]);
  
  useEffect(() => {
    if (productsList.length === 0) return;
    
    let result = [...productsList];
    
    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(product => product.category === activeCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by price range
    if (minPriceFilter !== '') {
      result = result.filter(product => product.price >= parseFloat(minPriceFilter));
    }
    
    if (maxPriceFilter !== '') {
      result = result.filter(product => product.price <= parseFloat(maxPriceFilter));
    }
    
    setFilteredProducts(result);
  }, [activeCategory, searchTerm, minPriceFilter, maxPriceFilter, productsList]);
  
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handlePriceFilterApply = (min, max) => {
    setMinPriceFilter(min);
    setMaxPriceFilter(max);
    
    // Update URL params
    if (min) {
      searchParams.set('minPrice', min);
    } else {
      searchParams.delete('minPrice');
    }
    
    if (max) {
      searchParams.set('maxPrice', max);
    } else {
      searchParams.delete('maxPrice');
    }
    
    setSearchParams(searchParams);
  };
  
  const clearPriceFilter = () => {
    setMinPriceFilter('');
    setMaxPriceFilter('');
    searchParams.delete('minPrice');
    searchParams.delete('maxPrice');
    setSearchParams(searchParams);
  };
  
  return (
    <PageContainer>
      <SidebarContainer>
        <ProductSidebar 
          onPriceFilterApply={handlePriceFilterApply}
          minPriceFilter={minPriceFilter}
          maxPriceFilter={maxPriceFilter}
        />
      </SidebarContainer>
      
      <MainContent>
        <PageHeader>
          <PageTitle>Our Products</PageTitle>
        </PageHeader>
        
        <SearchContainer>
          <SearchInput 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={handleSearch}
          />
        </SearchContainer>
        
        <FiltersContainer>
          {categories.map(category => (
            <FilterButton 
              key={category} 
              active={activeCategory === category}
              onClick={() => handleCategoryChange(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </FilterButton>
          ))}
        </FiltersContainer>
        
        {(minPriceFilter || maxPriceFilter) && (
          <ActiveFilters>
            <FilterTag>
              Price: 
              {minPriceFilter ? `$${minPriceFilter}` : '$0'} 
              {' - '} 
              {maxPriceFilter ? `$${maxPriceFilter}` : 'Any'}
              <button onClick={clearPriceFilter}>×</button>
            </FilterTag>
          </ActiveFilters>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>Loading products...</h3>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--danger-color)' }}>
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <NoResults>
            <h3>No products found</h3>
            <p>Try changing your search criteria or browse all products.</p>
          </NoResults>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default ProductsPage;