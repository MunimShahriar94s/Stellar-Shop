import { Link, useLocation } from 'react-router-dom';
import AdminButton from './AdminButton';
import styled from 'styled-components';
import { useNavAnimation } from '../../hooks/useGsapAnimations';
import { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { processProfilePictureUrl, getInitials } from '../../utils/profilePicture';

const DarkModeToggle = styled.button`
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 2rem;
  background-color: var(--nav-bg);
  box-shadow: 0 2px 10px var(--shadow-color);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: transform 0.3s ease;
  height: 70px; /* Fixed height for desktop */
  @media (max-width: 768px) {
    padding: 0.3rem 1rem;
    height: 65px; /* Fixed height for tablet */
  }
  @media (max-width: 600px) {
    padding: 0.15rem 0.5rem;
    height: 60px; /* Fixed height for mobile */
    max-width: 100vw;
  }
`;

const Logo = styled(Link)`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  .logo-image {
    height: 40px;
    width: auto;
    max-width: 150px;
    object-fit: contain;
    transition: all 0.3s ease;
  }
  
  .logo-text {
    color: var(--primary-color);
    transition: all 0.3s ease;
  }
  
  &:hover {
    .logo-image {
      filter: drop-shadow(0 0 8px ${props => props.settings?.appearance?.logoGlowColor || 'var(--primary-color)'});
      transform: scale(1.05);
    }
    .logo-text {
      text-shadow: 0 0 8px ${props => props.settings?.appearance?.logoGlowColor || 'var(--primary-color)'};
      transform: scale(1.05);
    }
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    .logo-image {
      height: 35px;
      max-width: 120px;
    }
  }
  @media (max-width: 600px) {
    font-size: 0.95rem;
    min-width: 0;
    max-width: 100vw;
    overflow-x: hidden;
    .logo-image {
      height: 30px;
      max-width: 100px;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;

  @media (max-width: 768px) {
    display: ${props => props.isopen === "true" ? 'flex' : 'none'};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: var(--nav-bg);
    padding: 0.8rem;
    box-shadow: 0 5px 10px var(--shadow-color);
    gap: 0.8rem;
    transform: ${props => props.isopen === "true" ? 'translateY(0)' : 'translateY(-10px)'};
    opacity: ${props => props.isopen === "true" ? 1 : 0};
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
`;

const NavLink = styled(Link)`
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  position: relative;
  opacity: 0.8;
  
  &:hover {
    color: var(--primary-color);
    opacity: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: ${props => props.isactive === "true" ? '100%' : '0'};
    height: 2px;
    bottom: -3px;
    left: 0;
    background-color: var(--primary-color);
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const CartButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background-color: var(--primary-color);
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  
  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
  }
`;

const LoginButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    color: var(--primary-color);
    transform: translateY(-2px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem;
  
  svg {
    width: 20px;
    height: 20px;
    color: var(--text-color);
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: rotate(180deg);
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const CartCount = styled.span`
  background-color: white;
  color: var(--primary-color);
  font-size: 0.7rem;
  font-weight: bold;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: -5px;
  right: -5px;
`;

const CartButtonWrapper = styled.div`
  position: relative;
`;

const ProfilePic = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f1f1f1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #666;
  font-size: 1rem;
  overflow: hidden;
  position: relative;
`;

const SidebarOverlay = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: ${props => props.isopen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.25);
    z-index: 999;
  }
`;

const SideMenu = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    right: 0;
    width: 70vw;
    max-width: 340px;
    height: 100vh;
    background: var(--nav-bg);
    box-shadow: -2px 0 16px var(--shadow-color);
    z-index: 1000;
    padding: 2.2rem 1.2rem 1.2rem 1.2rem;
    gap: 1.2rem;
    transform: ${props => props.isopen ? 'translateX(0)' : 'translateX(100vw)'};
    transition: transform 0.3s cubic-bezier(0.7,0,0.3,1);
    overflow-y: auto;
  }
`;

const SideMenuLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const SideMenuLink = styled(Link)`
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  transition: color 0.2s;
  &.active {
    color: var(--primary-color);
    font-weight: 700;
  }
  &:hover {
    color: var(--primary-color);
  }
`;

const SideMenuClose = styled.button`
  position: absolute;
  top: 1.1rem;
  right: 1.1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-color);
  cursor: pointer;
  z-index: 1001;
`;

const Navbar = () => {
  const { navRef } = useNavAnimation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();
  const { cartCount, loading, merging } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { settings, updateSettings, updateDarkModePreference } = useSettings();
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const navbar = navRef.current;
      
      if (!navbar) return;
      
      // Get navbar height
      const navbarHeight = navbar.offsetHeight;
      
      // Only hide navbar when scrolling down and the navbar is no longer visible from viewport
      if (currentScrollY > lastScrollY && currentScrollY > navbarHeight) {
        // Scrolling down and navbar is out of viewport
        gsap.to(navbar, { y: '-100%', duration: 0.3, ease: 'power2.out' });
      } else {
        // Scrolling up or navbar is still visible
        gsap.to(navbar, { y: '0%', duration: 0.3, ease: 'power2.out' });
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, navRef]);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !settings.appearance?.enableDarkMode;
    updateDarkModePreference(newDarkMode);
  };
  
  return (
    <>
      <NavContainer ref={navRef}>
        <Logo to="/" className="logo" settings={settings}>
          {settings.appearance?.logo && settings.appearance.logo !== '/logo.png' ? (
            <img 
              src={settings.appearance.logo} 
              alt={settings.general?.storeName || 'Store Logo'} 
              className="logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'inline';
              }}
            />
          ) : null}
          <span className="logo-text" style={{ display: settings.appearance?.logo && settings.appearance.logo !== '/logo.png' ? 'none' : 'inline' }}>
            {settings.general?.storeName || 'StellarShop'}
          </span>
        </Logo>
        {isMobile && (
          <MenuButton onClick={toggleMenu} aria-label="Open menu">
            {isMenuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21M3 6H21M3 18H21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </MenuButton>
        )}
        {/* Desktop nav links */}
        <NavLinks isopen={isMenuOpen ? "true" : "false"} style={isMobile ? { display: 'none' } : {}}>
          <NavLink to="/" className="nav-item" isactive={(location.pathname === '/').toString()}>Home</NavLink>
          <NavLink to="/products" className="nav-item" isactive={(location.pathname === '/products').toString()}>Products</NavLink>
          <NavLink to="/contact" className="nav-item" isactive={(location.pathname === '/contact').toString()}>Contact</NavLink>
          {user && (
            <NavLink to="/orders" className="nav-item" isactive={(location.pathname.startsWith('/orders')).toString()}>My Orders</NavLink>
          )}
        </NavLinks>
        <NavActions style={isMobile ? { display: 'none' } : {}}>
          {isAdmin && <AdminButton />}
          <DarkModeToggle onClick={toggleDarkMode} title={settings.appearance?.enableDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {settings.appearance?.enableDarkMode ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </DarkModeToggle>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            {user && (
              <>
                <ProfilePic>
                  {user.picture ? (
                    <img 
                      src={processProfilePictureUrl(user.picture)} 
                      alt="Profile" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        borderRadius: '50%',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ 
                    display: user.picture ? 'none' : 'flex',
                    width: '100%', 
                    height: '100%', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-color)',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}>
                    {getInitials(user.name)}
                  </div>
                </ProfilePic>
              </>
            )}
            {!user ? (
              <>
                <LoginButton to="/login" className="nav-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Login
                </LoginButton>
                <LoginButton to="/signup" className="nav-item" style={{ color: 'var(--primary-color)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20 8v6m-3-3h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sign Up
                </LoginButton>
              </>
            ) : (
              <LoginButton as="button" onClick={() => { logout(); window.location.href = '/'; }} className="nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17l5-5-5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </LoginButton>
            )}
          </div>
          <CartButtonWrapper>
            <CartButton 
              to="/cart" 
              className="nav-item" 
              style={location.pathname === '/cart' ? { backgroundColor: 'var(--primary-hover)' } : {}}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Cart
            </CartButton>
            {(!loading && !merging && cartCount > 0) && <CartCount>{cartCount}</CartCount>}
          </CartButtonWrapper>
        </NavActions>
      </NavContainer>
      {/* Sidebar overlay and menu for mobile/tablet - now outside NavContainer */}
      <SidebarOverlay isopen={isMenuOpen} onClick={toggleMenu} />
      <SideMenu isopen={isMenuOpen}>
        <SideMenuClose onClick={toggleMenu} aria-label="Close menu">&times;</SideMenuClose>
        <SideMenuLinks>
          <SideMenuLink to="/" onClick={toggleMenu} className={location.pathname === '/' ? 'active' : ''}>Home</SideMenuLink>
          <SideMenuLink to="/products" onClick={toggleMenu} className={location.pathname === '/products' ? 'active' : ''}>Products</SideMenuLink>
          <SideMenuLink to="/contact" onClick={toggleMenu} className={location.pathname === '/contact' ? 'active' : ''}>Contact</SideMenuLink>
          <SideMenuLink to="/cart" onClick={toggleMenu} className={location.pathname === '/cart' ? 'active' : ''}>Cart</SideMenuLink>
          {user && (
            <SideMenuLink to="/orders" onClick={toggleMenu} className={location.pathname.startsWith('/orders') ? 'active' : ''}>My Orders</SideMenuLink>
          )}

          {isAdmin && <AdminButton style={{ width: '100%', margin: '0.5rem 0' }} />}
          <SideMenuLink as="button" onClick={toggleDarkMode} className="nav-item">
            {settings.appearance?.enableDarkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
          </SideMenuLink>
          {!user ? (
            <>
              <SideMenuLink to="/login" onClick={toggleMenu} className={location.pathname === '/login' ? 'active' : ''}>Login</SideMenuLink>
              <SideMenuLink to="/signup" onClick={toggleMenu} className={location.pathname === '/signup' ? 'active' : ''}>Sign Up</SideMenuLink>
            </>
          ) : (
            <SideMenuLink as="button" onClick={() => { logout(); window.location.href = '/'; }}>Logout</SideMenuLink>
          )}
        </SideMenuLinks>
      </SideMenu>
    </>
  );
};

export default Navbar;