import { Link } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 250px;
  background-color: var(--card-bg);
  border-radius: 8px;
  padding: 1.5rem;
  height: fit-content;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 10px var(--shadow-color);
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 1.5rem;
  }
`;

const SidebarTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color);
`;

const SidebarList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SidebarItem = styled.li`
  margin-bottom: 0.8rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SidebarLink = styled(Link)`
  display: block;
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem 0;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  
  &:hover {
    color: var(--primary-color);
    padding-left: 0.5rem;
  }
  
  &.active {
    color: var(--primary-color);
    font-weight: 500;
  }
`;

const SidebarButton = styled(Link)`
  display: block;
  background-color: var(--primary-color);
  color: white;
  text-align: center;
  padding: 0.8rem;
  border-radius: 4px;
  margin-top: 1.5rem;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    background-color: var(--primary-hover);
  }
`;

const Sidebar = ({ title, items, buttonText, buttonLink }) => {
  return (
    <SidebarContainer>
      {title && <SidebarTitle>{title}</SidebarTitle>}
      
      {items && items.length > 0 && (
        <SidebarList>
          {items.map((item, index) => (
            <SidebarItem key={index}>
              <SidebarLink 
                to={item.link} 
                className={item.active ? 'active' : ''}
              >
                {item.text}
              </SidebarLink>
            </SidebarItem>
          ))}
        </SidebarList>
      )}
      
      {buttonText && buttonLink && (
        <SidebarButton to={buttonLink}>{buttonText}</SidebarButton>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;