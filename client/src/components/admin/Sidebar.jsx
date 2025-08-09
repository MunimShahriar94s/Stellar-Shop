import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';

const MobileSidebarHeader = styled.div`
  display: none;
  @media (max-width: 600px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.2rem 1.2rem 0.7rem 1.2rem;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    background: #2c3e50;
    position: sticky;
    top: 0;
    z-index: 1301;
  }
`;
const MobileLogo = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--primary-color, #ff6b6b);
  letter-spacing: 0.02em;
`;
const MobileCloseBtn = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 2.2rem;
  cursor: pointer;
  line-height: 1;
  padding: 0 0.2rem;
`;
const SidebarContainer = styled.div`
  width: 250px;
  height: 100vh;
  background-color: #2c3e50;
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  padding: 2rem 0;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1200;
  transition: left 0.3s, width 0.3s, transform 0.35s cubic-bezier(0.7,0,0.3,1);
  box-sizing: border-box;
  font-size: 0.92em;
  @media (max-width: 768px) {
    position: fixed;
    width: 50vw;
    max-width: 50vw;
    min-width: 0;
    height: 100vh;
    left: 0;
    top: 0;
    padding: 0 0 2rem 0;
    transform: ${props => props.open ? 'translateX(0)' : 'translateX(-100vw)'};
    box-shadow: none;
    border-radius: 0 12px 12px 0;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    overflow-x: hidden;
    box-sizing: border-box;
  }
`;
const MobileOverlay = styled.div`
  display: none;
  @media (max-width: 600px) {
    display: ${props => props.open ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100dvh;
    background: rgba(0,0,0,0.35);
    z-index: 1100;
    transition: opacity 0.3s;
    opacity: ${props => props.open ? 1 : 0};
    pointer-events: ${props => props.open ? 'auto' : 'none'};
  }
`;
const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  padding: 0 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 2rem;
  span {
    color: var(--primary-color);
  }
  @media (max-width: 768px) {
    display: none;
    font-size: 1.1rem;
    padding: 0 0.5rem 1rem;
  }
`;
const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  @media (max-width: 600px) {
    width: 100%;
    padding: 0.7rem 0.2rem;
  }
`;
const NavItem = styled.li`
  margin-bottom: 0.5rem;
  @media (max-width: 600px) {
    margin-bottom: 0.2rem;
  }
`;
const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.8rem 1.5rem;
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  text-decoration: none;
  transition: all 0.3s ease;
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border-left: 4px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  svg {
    width: 22px;
    height: 22px;
    margin-right: 1.5rem;
  }
  @media (max-width: 768px) {
    padding: 0.7rem 0.5rem;
    font-size: 0.95em;
    svg {
      width: 18px;
      height: 18px;
      margin-right: 1.5rem;
    }
  }
`;

const NoHorizontalScroll = createGlobalStyle`
  html, body {
    overflow-x: hidden !important;
  }
`;

const Sidebar = ({ open = true, onClose }) => {
  const location = useLocation();
  const path = location.pathname;
  useEffect(() => {
    if (typeof window !== 'undefined' && window.document && window.innerWidth <= 900) {
      document.body.style.overflowX = open ? 'hidden' : '';
    }
    return () => {
      if (typeof window !== 'undefined' && window.document) {
        document.body.style.overflowX = '';
      }
    };
  }, [open]);
  return (
    <>
      {open && <NoHorizontalScroll />}
      <MobileOverlay open={open} onClick={onClose} />
      <SidebarContainer open={open}>
        <MobileSidebarHeader>
          <MobileLogo>🛒</MobileLogo>
          <MobileCloseBtn onClick={onClose}>&times;</MobileCloseBtn>
        </MobileSidebarHeader>
        <Logo>
          Admin<span>Panel</span>
        </Logo>
        
        <NavMenu>
          <NavItem>
            <NavLink to="/admin" active={path === '/admin' ? 1 : 0} onClick={() => window.innerWidth <= 600 && onClose && onClose()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Dashboard</span>
            </NavLink>
          </NavItem>
          
          <NavItem>
            <NavLink to="/admin/orders" active={path === '/admin/orders' ? 1 : 0} onClick={() => window.innerWidth <= 600 && onClose && onClose()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Orders</span>
            </NavLink>
          </NavItem>
          
          <NavItem>
            <NavLink to="/admin/products" active={path === '/admin/products' ? 1 : 0} onClick={() => window.innerWidth <= 600 && onClose && onClose()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 3H4C2.89543 3 2 3.89543 2 5V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V5C22 3.89543 21.1046 3 20 3Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3V21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 3V21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 9H8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 15H8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 9H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 15H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Products</span>
            </NavLink>
          </NavItem>
          
          <NavItem>
            <NavLink to="/admin/categories" active={path === '/admin/categories' ? 1 : 0} onClick={() => window.innerWidth <= 600 && onClose && onClose()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.5 2H20V22H6.5A2.5 2.5 0 0 1 4 19.5V2.5A2.5 2.5 0 0 1 6.5 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Categories</span>
            </NavLink>
          </NavItem>
          
          <NavItem>
            <NavLink to="/admin/customers" active={path === '/admin/customers' ? 1 : 0} onClick={() => window.innerWidth <= 600 && onClose && onClose()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Users</span>
            </NavLink>
          </NavItem>
          
          <NavItem>
            <NavLink to="/admin/analytics" active={path === '/admin/analytics' ? 1 : 0} onClick={() => window.innerWidth <= 600 && onClose && onClose()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 20V10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 20V4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 20V14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Analytics</span>
            </NavLink>
          </NavItem>
          
          <NavItem>
            <NavLink to="/admin/settings" active={path === '/admin/settings' ? 1 : 0} onClick={() => window.innerWidth <= 600 && onClose && onClose()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Settings</span>
            </NavLink>
          </NavItem>
          

        </NavMenu>
        
        <NavMenu style={{ marginTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem' }}>
          <NavItem>
            <NavLink to="/" active={0} onClick={() => window.innerWidth <= 600 && onClose && onClose()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17L21 12L16 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Back to Store</span>
            </NavLink>
          </NavItem>
        </NavMenu>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;