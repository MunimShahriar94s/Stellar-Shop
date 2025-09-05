import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { processProfilePictureUrl } from '../../utils/profilePicture';
import { useCart } from '../../context/CartContext';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color, #ff6b6b);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
  
  &:hover {
    background: rgba(255, 107, 107, 0.1);
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CustomerInfoSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  margin-bottom: 2rem;
  overflow: hidden;
`;

const CustomerHeader = styled.div`
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  border-bottom: 1px solid #e1e8ed;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 2rem;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const CustomerDetails = styled.div`
  flex: 1;
  
  .customer-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }
  
  .customer-email {
    color: #6c757d;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  .customer-date {
    color: #adb5bd;
    font-size: 0.9rem;
  }
`;

const CustomerStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 1.5rem 2rem;
`;

const Stat = styled.div`
  text-align: center;
  
  .stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--primary-color, #ff6b6b);
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    color: #6c757d;
    font-size: 0.9rem;
    font-weight: 500;
  }
`;

const CustomerMeta = styled.div`
  padding: 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e1e8ed;
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .meta-label {
    font-weight: 600;
    color: #6c757d;
    font-size: 0.9rem;
  }
  
  .meta-value {
    color: #2c3e50;
    font-size: 0.9rem;
  }
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

const OrdersSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e8ed;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e1e8ed;
  background: #f8f9fa;
  
  h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: #2c3e50;
  }
`;

const OrdersList = styled.div`
  max-height: 500px;
  overflow-y: auto;
`;

const OrderItem = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const OrderInfo = styled.div`
  flex: 1;
  
  .order-id {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.25rem;
  }
  
  .order-date {
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }
  
  .order-items {
    color: #adb5bd;
    font-size: 0.8rem;
  }
`;

const OrderStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const StatusIndicator = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#d4edda';
      case 'pending': return '#fff3cd';
      case 'cancelled': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#155724';
      case 'pending': return '#856404';
      case 'cancelled': return '#721c24';
      default: return '#6c757d';
    }
  }};
  text-transform: capitalize;
`;

const OrderTotal = styled.div`
  font-weight: 600;
  color: var(--primary-color, #ff6b6b);
  font-size: 1.1rem;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #6c757d;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  
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
  }
`;

const CustomerDetail = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useCart();
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }

      const data = await response.json();
      setCustomerData(data);
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError('Failed to load customer details. Please try again.');
      showToast('error', 'Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleBack = () => {
    navigate('/admin/customers');
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Loading customer details...</LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleBack}>←</BackButton>
          <Title>Customer Details</Title>
        </Header>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!customerData) {
    return (
      <Container>
        <Header>
          <BackButton onClick={handleBack}>←</BackButton>
          <Title>Customer Details</Title>
        </Header>
        <EmptyState>
          <div className="empty-icon">👤</div>
          <div className="empty-title">Customer not found</div>
          <div className="empty-description">The customer you're looking for doesn't exist.</div>
        </EmptyState>
      </Container>
    );
  }

  const { customer, orders, statistics } = customerData;

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>←</BackButton>
        <Title>Customer Details</Title>
      </Header>

      <CustomerInfoSection>
        <CustomerHeader>
          <Avatar>
            {customer.picture ? (
              <img src={processProfilePictureUrl(customer.picture)} alt={customer.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              customer.name ? customer.name.charAt(0).toUpperCase() : 'U'
            )}
          </Avatar>
          <CustomerDetails>
            <div className="customer-name">{customer.name}</div>
            <div className="customer-email">{customer.email}</div>
            <div className="customer-date">Member since {formatDate(customer.created_at)}</div>
          </CustomerDetails>
        </CustomerHeader>

        <CustomerStats>
          <Stat>
            <div className="stat-value">{statistics.totalOrders}</div>
            <div className="stat-label">Total Orders</div>
          </Stat>
          <Stat>
            <div className="stat-value">{formatCurrency(statistics.totalSpent)}</div>
            <div className="stat-label">Total Spent</div>
          </Stat>
          <Stat>
            <div className="stat-value">{formatCurrency(statistics.averageOrderValue)}</div>
            <div className="stat-label">Avg. Order Value</div>
          </Stat>
          <Stat>
            <div className="stat-value">{orders.length > 0 ? formatDate(orders[0].order_date) : 'N/A'}</div>
            <div className="stat-label">Last Order</div>
          </Stat>
        </CustomerStats>

        <CustomerMeta>
          <MetaItem>
            <span className="meta-label">Status:</span>
            <StatusBadge verified={customer.email_verified}>
              {customer.email_verified ? 'Verified' : 'Unverified'}
            </StatusBadge>
          </MetaItem>
          <MetaItem>
            <span className="meta-label">Provider:</span>
            {customer.provider !== 'local' ? (
              <ProviderBadge>{customer.provider}</ProviderBadge>
            ) : (
              <span className="meta-value">Local</span>
            )}
          </MetaItem>
          <MetaItem>
            <span className="meta-label">Role:</span>
            <span className="meta-value">{customer.role}</span>
          </MetaItem>
          <MetaItem>
            <span className="meta-label">Customer ID:</span>
            <span className="meta-value">#{customer.id}</span>
          </MetaItem>
        </CustomerMeta>
      </CustomerInfoSection>

      <OrdersSection>
        <SectionHeader>
          <h2>Order History ({orders.length} orders)</h2>
        </SectionHeader>
        
        {orders.length === 0 ? (
          <EmptyState>
            <div className="empty-icon">📦</div>
            <div className="empty-title">No orders yet</div>
            <div className="empty-description">This customer hasn't placed any orders.</div>
          </EmptyState>
        ) : (
          <OrdersList>
            {orders.map((order) => (
              <OrderItem key={order.id}>
                <OrderInfo>
                  <div className="order-id">Order #{order.id}</div>
                  <div className="order-date">{formatDate(order.order_date)}</div>
                  <div className="order-items">{order.item_count} items</div>
                </OrderInfo>
                <OrderStatus>
                  <StatusIndicator status={order.status}>{order.status}</StatusIndicator>
                  <OrderTotal>{formatCurrency(order.total_price)}</OrderTotal>
                </OrderStatus>
              </OrderItem>
            ))}
          </OrdersList>
        )}
      </OrdersSection>
    </Container>
  );
};

export default CustomerDetail;
