import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const AdminButtonLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 768px) {
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
  }
`;

const AdminButton = () => {
  return (
    <AdminButtonLink to="/admin">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Admin
    </AdminButtonLink>
  );
};

export default AdminButton;