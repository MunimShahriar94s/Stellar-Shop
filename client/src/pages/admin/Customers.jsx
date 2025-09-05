import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { processProfilePictureUrl } from '../../utils/profilePicture';
import { useCart } from '../../context/CartContext';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow-color);
  border: 1px solid var(--border-color);
  
  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0.5rem;
  }
  
  .stat-label {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.9rem;
    font-weight: 500;
  }
`;

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow-color);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: 0 6px 25px var(--shadow-color);
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
  }
`;

const SearchInputWrapper = styled.div`
  flex: 1;
  position: relative;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-color);
    opacity: 0.7;
    width: 1.2rem;
    height: 1.2rem;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:focus-within svg {
    color: var(--primary-color);
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 2px solid var(--input-border);
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--input-bg);
  color: var(--text-color);
  font-weight: 500;
  transform: translateY(0);
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: var(--border-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--shadow-color);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &::placeholder {
    color: var(--text-color);
    opacity: 0.5;
    font-weight: 400;
  }
`;

const FilterWrapper = styled.div`
  position: relative;
  min-width: 180px;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-color);
    opacity: 0.7;
    width: 1.2rem;
    height: 1.2rem;
    pointer-events: none;
    z-index: 1;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover svg {
    color: var(--primary-color);
    opacity: 1;
    transform: translateY(-50%) scale(1.05);
  }
  
  &:focus-within svg {
    color: var(--primary-color);
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
  }
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 2px solid var(--input-border);
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  background: var(--input-bg);
  cursor: pointer;
  appearance: none;
  color: var(--text-color);
  font-weight: 500;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236c757d' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1em;
  padding-right: 2.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(0);
  
  &:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ff6b6b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: var(--border-color);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--shadow-color);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  option {
    padding: 0.75rem;
    color: var(--text-color);
    background: var(--input-bg);
    font-weight: 500;
    
    &:hover {
      background: var(--border-color);
    }
  }
`;

const CustomersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CustomerCard = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 20px var(--shadow-color);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px var(--shadow-color);
  }
`;

const CustomerHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2rem;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const CustomerInfo = styled.div`
  flex: 1;
  
  .customer-name {
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 0.25rem;
    font-size: 1.1rem;
  }
  
  .customer-email {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }
  
  .customer-date {
    color: var(--text-color);
    opacity: 0.5;
    font-size: 0.8rem;
  }
`;

const CustomerStats = styled.div`
  padding: 1rem 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const Stat = styled.div`
  text-align: center;
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    color: var(--text-color);
    opacity: 0.7;
    font-size: 0.8rem;
    font-weight: 500;
  }
`;

const CustomerFooter = styled.div`
  padding: 1rem 1.5rem;
  background: var(--input-bg);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    if (props.verified) return '#d4edda';
    return '#f8d7da';
  }};
  color: ${props => {
    if (props.verified) return '#155724';
    return '#721c24';
  }};
`;

const ProviderBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  background: #e3f2fd;
  color: #1976d2;
  text-transform: uppercase;
`;

const ViewButton = styled.button`
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: var(--primary-hover);
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: var(--text-color);
  opacity: 0.7;
`;

const ErrorMessage = styled.div`
  background: var(--danger-color);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid var(--danger-color);
  opacity: 0.9;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-color);
  
  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .empty-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .empty-description {
    font-size: 1rem;
    opacity: 0.7;
  }
`;

const MakeAdminButton = styled.button`
  background: var(--success-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #218838;
  }
  
  &:disabled {
    background: var(--text-color);
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled.div`
  background: var(--card-bg);
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 25px var(--shadow-color);
  border: 1px solid var(--border-color);
  
  h2 {
    margin: 0 0 1rem 0;
    color: var(--text-color);
    font-size: 1.5rem;
  }
  
  p {
    color: var(--text-color);
    opacity: 0.7;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--input-border);
  border-radius: 6px;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  background-color: var(--input-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &.primary {
    background: var(--primary-color);
    color: white;
    
    &:hover {
      background: var(--primary-hover);
    }
    
    &:disabled {
      background: var(--text-color);
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  &.secondary {
    background: var(--text-color);
    opacity: 0.7;
    color: white;
    
    &:hover {
      opacity: 0.9;
    }
  }
`;

const RoleBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${props => props.role === 'admin' ? '#dc3545' : '#6c757d'};
  color: white;
  text-transform: uppercase;
  margin-left: 0.5rem;
`;

const Customers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useCart();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showMakeAdminModal, setShowMakeAdminModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [makingAdmin, setMakingAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    verifiedCustomers: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, filterBy]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data);
      
      // Calculate stats
      const totalCustomers = data.length;
      const verifiedCustomers = data.filter(c => c.email_verified).length;
      const totalRevenue = data.reduce((sum, c) => sum + c.total_spent, 0);
      const totalOrders = data.reduce((sum, c) => sum + c.total_orders, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      setStats({
        totalCustomers,
        verifiedCustomers,
        totalRevenue,
        averageOrderValue
      });
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Failed to load customers. Please try again.');
      showToast('error', 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

         // Apply status filter
     switch (filterBy) {
       case 'customers':
         filtered = filtered.filter(customer => customer.role === 'user');
         break;
       case 'admins':
         filtered = filtered.filter(customer => customer.role === 'admin');
         break;
       case 'verified':
         filtered = filtered.filter(customer => customer.email_verified);
         break;
       case 'unverified':
         filtered = filtered.filter(customer => !customer.email_verified);
         break;
       case 'with-orders':
         filtered = filtered.filter(customer => customer.total_orders > 0);
         break;
       case 'no-orders':
         filtered = filtered.filter(customer => customer.total_orders === 0);
         break;
       default:
         break;
     }

    setFilteredCustomers(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleCustomerClick = (customerId) => {
    navigate(`/admin/customers/${customerId}`);
  };

  const handleMakeAdmin = (customer) => {
    setSelectedCustomer(customer);
    setAdminEmail(customer.email);
    setShowMakeAdminModal(true);
  };

  const submitMakeAdmin = async () => {
    if (!adminEmail.trim()) {
      showToast('error', 'Please enter an email address');
      return;
    }

    try {
      setMakingAdmin(true);
      const response = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email: adminEmail })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to make user admin');
      }

      const result = await response.json();
      showToast('success', result.message);
      setShowMakeAdminModal(false);
      setAdminEmail('');
      setSelectedCustomer(null);
      
      // Refresh customers list to show updated roles
      fetchCustomers();
    } catch (err) {
      console.error('Error making user admin:', err);
      showToast('error', err.message);
    } finally {
      setMakingAdmin(false);
    }
  };

  const closeMakeAdminModal = () => {
    setShowMakeAdminModal(false);
    setAdminEmail('');
    setSelectedCustomer(null);
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading customers...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
             <Header>
         <Title>User Management</Title>
       </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

             <StatsGrid>
         <StatCard>
           <div className="stat-value">{stats.totalCustomers}</div>
           <div className="stat-label">Total Users</div>
         </StatCard>
         <StatCard>
           <div className="stat-value">{stats.verifiedCustomers}</div>
           <div className="stat-label">Verified Users</div>
         </StatCard>
         <StatCard>
           <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
           <div className="stat-label">Total Revenue</div>
         </StatCard>
         <StatCard>
           <div className="stat-value">{formatCurrency(stats.averageOrderValue)}</div>
           <div className="stat-label">Avg. Order Value</div>
         </StatCard>
       </StatsGrid>

             <SearchBar>
         <SearchInputWrapper>
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
             <circle cx="11" cy="11" r="8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
           <SearchInput
             type="text"
             placeholder="Search users by name or email..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </SearchInputWrapper>
         <FilterWrapper>
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
             <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
           <FilterSelect value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
             <option value="all">All Users</option>
             <option value="customers">Customers Only</option>
             <option value="admins">Admins Only</option>
             <option value="verified">Verified Only</option>
             <option value="unverified">Unverified Only</option>
             <option value="with-orders">With Orders</option>
             <option value="no-orders">No Orders</option>
           </FilterSelect>
         </FilterWrapper>
       </SearchBar>

      {filteredCustomers.length === 0 ? (
                 <EmptyState>
           <div className="empty-icon">👥</div>
           <div className="empty-title">No users found</div>
           <div className="empty-description">
             {searchTerm || filterBy !== 'all' 
               ? 'Try adjusting your search or filter criteria'
               : 'No users have registered yet'
             }
           </div>
         </EmptyState>
      ) : (
        <CustomersGrid>
          {filteredCustomers.map((customer) => (
            <CustomerCard key={customer.id} onClick={() => handleCustomerClick(customer.id)}>
              <CustomerHeader>
                <Avatar>
                  {customer.picture ? (
                    <img src={processProfilePictureUrl(customer.picture)} alt={customer.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    customer.name ? customer.name.charAt(0).toUpperCase() : 'U'
                  )}
                </Avatar>
                <CustomerInfo>
                  <div className="customer-name">{customer.name}</div>
                  <div className="customer-email">{customer.email}</div>
                  <div className="customer-date">Joined {formatDate(customer.created_at)}</div>
                </CustomerInfo>
              </CustomerHeader>
              
              <CustomerStats>
                <Stat>
                  <div className="stat-value">{customer.total_orders}</div>
                  <div className="stat-label">Orders</div>
                </Stat>
                <Stat>
                  <div className="stat-value">{formatCurrency(customer.total_spent)}</div>
                  <div className="stat-label">Total Spent</div>
                </Stat>
              </CustomerStats>
              
                             <CustomerFooter>
                 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                   <StatusBadge verified={customer.email_verified}>
                     {customer.email_verified ? 'Verified' : 'Unverified'}
                   </StatusBadge>
                   {customer.provider !== 'local' && (
                     <ProviderBadge>{customer.provider}</ProviderBadge>
                   )}
                   <RoleBadge role={customer.role}>{customer.role}</RoleBadge>
                 </div>
                 <div style={{ display: 'flex', gap: '0.5rem' }}>
                   {customer.role === 'user' && (
                     <MakeAdminButton 
                       onClick={(e) => {
                         e.stopPropagation();
                         handleMakeAdmin(customer);
                       }}
                     >
                       Make Admin
                     </MakeAdminButton>
                   )}
                   <ViewButton>View Details</ViewButton>
                 </div>
               </CustomerFooter>
            </CustomerCard>
          ))}
                 </CustomersGrid>
       )}

       {/* Make Admin Modal */}
       {showMakeAdminModal && (
         <ModalOverlay onClick={closeMakeAdminModal}>
           <Modal onClick={(e) => e.stopPropagation()}>
             <h2>Make User Admin</h2>
             <p>
               Are you sure you want to make <strong>{selectedCustomer?.name}</strong> an admin? 
               This will give them full administrative access to the system.
             </p>
             <ModalInput
               type="email"
               placeholder="Email address"
               value={adminEmail}
               onChange={(e) => setAdminEmail(e.target.value)}
               disabled={makingAdmin}
             />
             <ModalButtons>
               <ModalButton 
                 className="secondary" 
                 onClick={closeMakeAdminModal}
                 disabled={makingAdmin}
               >
                 Cancel
               </ModalButton>
               <ModalButton 
                 className="primary" 
                 onClick={submitMakeAdmin}
                 disabled={makingAdmin}
               >
                 {makingAdmin ? 'Making Admin...' : 'Make Admin'}
               </ModalButton>
             </ModalButtons>
           </Modal>
         </ModalOverlay>
       )}
     </Container>
   );
 };

export default Customers;
