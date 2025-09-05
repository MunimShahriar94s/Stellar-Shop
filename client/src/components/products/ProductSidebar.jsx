import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from '../layout/Sidebar';
import { getAllCategories } from '../../services/categoriesService';

const FilterSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
`;

const FilterTitle = styled.h4`
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--text-color);
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--text-color);
  
  input {
    cursor: pointer;
  }
`;

const PriceRange = styled.div`
  margin-bottom: 1.5rem;
`;

const PriceInputs = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
`;

const PriceInput = styled.input`
  width: 80px;
  padding: 0.5rem;
  border: 1px solid var(--input-border);
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: var(--input-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
  
  &::placeholder {
    color: var(--text-color);
    opacity: 0.5;
  }
`;

const ApplyButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 1rem;
  
  &:hover {
    background-color: var(--primary-hover);
  }
`;

const ProductSidebar = ({ onPriceFilterApply, minPriceFilter, maxPriceFilter }) => {
  const [minPrice, setMinPrice] = useState(minPriceFilter || '');
  const [maxPrice, setMaxPrice] = useState(maxPriceFilter || '');
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Fallback to default categories
        setCategories([
          { id: 'furniture', name: 'Furniture' },
          { id: 'lighting', name: 'Lighting' },
          { id: 'decor', name: 'Home Decor' },
          { id: 'kitchen', name: 'Kitchen' },
          { id: 'bedroom', name: 'Bedroom' }
        ]);
      }
    };
    
    fetchCategories();
  }, []);
  
  const sidebarItems = [
    { text: 'All Products', link: '/products', active: true },
    { text: 'New Arrivals', link: '/products?filter=new' },
    { text: 'Best Sellers', link: '/products?filter=bestsellers' },
    { text: 'On Sale', link: '/products?filter=sale' }
  ];

  const handleApplyPriceFilter = () => {
    onPriceFilterApply(minPrice, maxPrice);
  };
  
  return (
    <>
      <Sidebar 
        title="Product Categories" 
        items={sidebarItems}
      />
      
      <FilterSection>
        <FilterTitle>Filter by Category</FilterTitle>
        <CheckboxGroup>
          {categories.map(category => (
            <CheckboxLabel key={category.id}>
              <input type="checkbox" id={category.id} />
              {category.name}
            </CheckboxLabel>
          ))}
        </CheckboxGroup>
        
        <FilterTitle>Price Range</FilterTitle>
        <PriceRange>
          <PriceInputs>
            <PriceInput 
              type="number" 
              placeholder="Min" 
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span>to</span>
            <PriceInput 
              type="number" 
              placeholder="Max" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </PriceInputs>
          <ApplyButton onClick={handleApplyPriceFilter}>Apply Filter</ApplyButton>
        </PriceRange>
      </FilterSection>
    </>
  );
};

export default ProductSidebar;