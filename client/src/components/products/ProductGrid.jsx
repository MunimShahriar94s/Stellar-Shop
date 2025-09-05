import styled from 'styled-components';
import ProductCard from './ProductCard';
import { useProductAnimation } from '../../hooks/useGsapAnimations';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const ProductGrid = ({ products }) => {
  const { productsRef } = useProductAnimation();
  
  return (
    <Grid ref={productsRef}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Grid>
  );
};

export default ProductGrid;