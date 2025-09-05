import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../../components/admin/Header';
import { useOutletContext } from 'react-router-dom';
import { processProfilePictureUrl } from '../../utils/profilePicture';

const OrdersContainer = styled.div`
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

const FiltersContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
`;

const FilterSelect = styled.select`
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
  
  &::placeholder {
    color: var(--text-color);
    opacity: 0.5;
  }
`;

const OrdersTable = styled.div`
  background-color: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 10px var(--shadow-color);
  border: 1px solid var(--border-color);
  overflow-x: auto;
  margin-bottom: 1.5rem;
  @media (max-width: 600px) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
  @media (max-width: 900px) {
    min-width: 600px;
  }
  @media (max-width: 600px) {
    min-width: unset;
    width: 100%;
    font-size: 0.85rem;
  }
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    font-weight: 600;
    color: var(--text-color);
    font-size: 0.9rem;
    background-color: var(--input-bg);
  }
  
  td {
    font-size: 0.9rem;
    color: var(--text-color);
  }
  
  tbody tr:hover {
    background-color: var(--input-bg);
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  background-color: ${props => {
    switch(props.status) {
      case 'pending': return 'rgba(255, 152, 0, 0.1)';
      case 'processing': return 'rgba(33, 150, 243, 0.1)';
      case 'shipped': return 'rgba(156, 39, 176, 0.1)';
      case 'delivered': return 'rgba(76, 175, 80, 0.1)';
      case 'return_requested': return 'rgba(244, 67, 54, 0.1)';
      case 'returned': return 'rgba(121, 85, 72, 0.1)';
      default: return 'rgba(158, 158, 158, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'pending': return '#ff9800';
      case 'processing': return '#2196f3';
      case 'shipped': return '#9c27b0';
      case 'delivered': return '#4caf50';
      case 'return_requested': return '#f44336';
      case 'returned': return '#795548';
      default: return '#9e9e9e';
    }
  }};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(255, 107, 107, 0.1);
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--card-bg);
  border-top: 1px solid var(--border-color);
`;

const PageInfo = styled.div`
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
`;

const PageControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--input-bg)'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: 1px solid ${props => props.active ? 'var(--primary-color)' : 'var(--input-border)'};
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-hover)' : 'var(--border-color)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const OrderModal = styled.div`
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
  border-radius: 8px;
  box-shadow: 0 5px 15px var(--shadow-color);
  border: 1px solid var(--border-color);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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
    color: var(--text-color);
    opacity: 1;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const OrderInfo = styled.div`
  margin-bottom: 1.5rem;
`;

const OrderInfoTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

const OrderInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const OrderInfoItem = styled.div`
  font-size: 0.9rem;
  
  span {
    display: block;
    color: var(--text-color);
    opacity: 0.7;
    margin-bottom: 0.2rem;
  }
  
  strong {
    color: var(--text-color);
  }
`;

const OrderItems = styled.div`
  margin-bottom: 1.5rem;
`;

const OrderItemsList = styled.div`
  border-radius: 4px;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 1rem;
  background-color: var(--input-bg);
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 0.2rem;
`;

const ItemPrice = styled.div`
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.7;
`;

const ItemQuantity = styled.div`
  font-size: 0.9rem;
  color: var(--text-color);
  width: 50px;
  text-align: center;
`;

const ItemTotal = styled.div`
  font-weight: 500;
  color: var(--text-color);
  width: 80px;
  text-align: right;
`;

const OrderSummary = styled.div`
  margin-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-color);
  
  &.total {
    font-weight: 600;
    font-size: 1.1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
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
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const ApproveButton = styled(Button)`
  background-color: var(--success-color);
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  
  &:hover {
    background-color: #388e3c;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: var(--input-bg);
  color: var(--text-color);
  border: 1px solid var(--input-border);
  
  &:hover {
    background-color: var(--border-color);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const UpdateButton = styled(Button)`
  background-color: var(--primary-color);
  color: white;
  border: none;
  
  &:hover {
    background-color: var(--primary-hover);
  }
`;

const ProfilePic = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--input-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--text-color);
  font-size: 1rem;
  overflow: hidden;
  margin-right: 0.5rem;
  @media (max-width: 600px) {
    width: 18px;
    height: 18px;
    font-size: 0.7rem;
    margin-right: 0.15rem;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
    display: block;
  }
`;

const CustomerCell = styled.td`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 90px;
  @media (max-width: 600px) {
    gap: 0.15rem;
    min-width: 60px;
    font-size: 0.85em;
  }
`;
const CustomerName = styled.span`
  font-size: 1em;
  @media (max-width: 600px) {
    display: none;
  }
`;

const OrdersCardGrid = styled.div`
  display: none;
  @media (max-width: 600px) {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
    width: 100%;
  }
`;

const OrderCard = styled.div`
  background: var(--card-bg);
  border-radius: 8px;
  box-shadow: 0 2px 10px var(--shadow-color);
  border: 1px solid var(--border-color);
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  font-size: 0.97em;
`;

const OrderCardRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const OrderCardLabel = styled.span`
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.85em;
  margin-right: 0.3em;
`;

const OrderCardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Orders = (props) => {
  const { onMenuClick } = useOutletContext() || {};
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false); // NEW
  const [statusUpdating, setStatusUpdating] = useState({}); // { [orderId]: 'approve' | 'cancel' }
  const ordersPerPage = 5;

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
          setOrders(data);
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      }
    };
    fetchOrders();
  }, []);

  // Scroll to top when component mounts and filter pending orders
  useEffect(() => {
    window.scrollTo(0, 0);
    setPendingOrders(orders.filter(order => order.status === 'pending' || order.status === 'return_requested'));
  }, [orders]);

  // Filter orders based on status and search term
  useEffect(() => {
    let result = orders;
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    if (searchTerm) {
      result = result.filter(order => {
        const idMatch = String(order.id).toLowerCase().includes(searchTerm.toLowerCase());
        const nameMatch = order.name && order.name.toLowerCase().includes(searchTerm.toLowerCase());
        const emailMatch = order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase());
        return idMatch || nameMatch || emailMatch;
      });
    }
    setFilteredOrders(result);
    setCurrentPage(1);
  }, [statusFilter, searchTerm, orders]);
  
  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  
  // Fetch a single order with items
  const fetchOrderDetail = async (orderId) => {
    setOrderLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedOrder(data);
      } else {
        setSelectedOrder(null);
      }
    } catch {
      setSelectedOrder(null);
    } finally {
      setOrderLoading(false);
    }
  };
  
  const handleViewOrder = (order) => {
    setIsModalOpen(true);
    fetchOrderDetail(order.id);
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        return false;
      }
      // Update local state: orders, filteredOrders, pendingOrders, selectedOrder
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setFilteredOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setPendingOrders(prev => prev.filter(o => o.id !== orderId));
      setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status } : prev);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleApproveOrder = async (orderId) => {
    // prevent double clicks
    if (statusUpdating[orderId]) return;
    setStatusUpdating(prev => ({ ...prev, [orderId]: 'approve' }));
    try {
      await updateOrderStatus(orderId, 'processing');
    } finally {
      setStatusUpdating(prev => { const copy = { ...prev }; delete copy[orderId]; return copy; });
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (statusUpdating[orderId]) return;
    setStatusUpdating(prev => ({ ...prev, [orderId]: 'cancel' }));
    try {
      await updateOrderStatus(orderId, 'cancelled');
    } finally {
      setStatusUpdating(prev => { const copy = { ...prev }; delete copy[orderId]; return copy; });
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Dhaka'
    });
  };
  
  return (
    <>
      <Header title="Orders" onMenuClick={onMenuClick} />
      <OrdersContainer>
        {/* Pending Orders as Cards on mobile */}
        {pendingOrders.length > 0 && (
          <>
            <SectionTitle>Pending Orders & Return Requests</SectionTitle>
            <OrdersTable style={{ marginBottom: '2rem' }}>
              <Table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOrders.map(order => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <CustomerCell>
                        <ProfilePic>
                          {order.picture ? (
                            <img 
                              src={processProfilePictureUrl(order.picture)} 
                              alt="Profile" 
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : null}
                          <span style={{ display: order.picture ? 'none' : 'inline' }}>
                            {order.name ? order.name.charAt(0).toUpperCase() : '?'}
                          </span>
                        </ProfilePic>
                        <CustomerName>{order.name || 'N/A'}</CustomerName>
                      </CustomerCell>
                      <td>{formatDate(order.date)}</td>
                      <td>${Number(order.total || 0).toFixed(2)}</td>
                      <td>
                        <StatusBadge status={order.status}>
                          {order.status === 'pending' ? 'New Order' : order.status === 'cancelled' ? 'Admin Cancelled' : order.status === 'user_cancelled' ? 'User Cancelled' : 'Return Request'}
                        </StatusBadge>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {order.status === 'pending' ? (
                            <>
                            <ApproveButton onClick={() => handleApproveOrder(order.id)} disabled={!!statusUpdating[order.id]}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px', marginRight: '5px', verticalAlign: 'middle' }}>
                                <path d="M20 6L9 17L4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              {statusUpdating[order.id] === 'approve' ? 'Approving…' : 'Approve'}
                            </ApproveButton>
                            <CancelButton onClick={() => handleCancelOrder(order.id)} disabled={statusUpdating[order.id] === 'approve'}>
                              {statusUpdating[order.id] === 'cancel' ? 'Cancelling…' : 'Cancel'}
                            </CancelButton>
                            </>
                          ) : order.status === 'return_requested' ? (
                            <ApproveButton onClick={() => handleApproveOrder(order.id)}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px', marginRight: '5px', verticalAlign: 'middle' }}>
                                <path d="M20 6L9 17L4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Approve Return
                            </ApproveButton>
                          ) : null}
                          <ActionButton onClick={() => handleViewOrder(order)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px', marginRight: '5px', verticalAlign: 'middle' }}>
                              <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            View
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </OrdersTable>
            <OrdersCardGrid>
              {pendingOrders.map(order => (
                <OrderCard key={order.id}>
                  <OrderCardRow>
                    <OrderCardLabel>Order ID:</OrderCardLabel>
                    <span>{order.id}</span>
                  </OrderCardRow>
                  <OrderCardRow>
                    <OrderCardLabel>Customer:</OrderCardLabel>
                    <span>{order.name || 'N/A'}</span>
                  </OrderCardRow>
                  <OrderCardRow>
                    <OrderCardLabel>Date:</OrderCardLabel>
                    <span>{formatDate(order.date)}</span>
                  </OrderCardRow>
                  <OrderCardRow>
                    <OrderCardLabel>Total:</OrderCardLabel>
                    <span>${Number(order.total || 0).toFixed(2)}</span>
                  </OrderCardRow>
                  <OrderCardRow>
                    <OrderCardLabel>Type:</OrderCardLabel>
                    <StatusBadge status={order.status}>
                      {order.status === 'pending' ? 'New Order' : 'Return Request'}
                    </StatusBadge>
                  </OrderCardRow>
                  <OrderCardActions>
                    {order.status === 'pending' ? (
                      <ApproveButton onClick={() => handleApproveOrder(order.id)}>
                        Approve
                      </ApproveButton>
                    ) : order.status === 'return_requested' ? (
                      <ApproveButton onClick={() => handleApproveOrder(order.id)}>
                        Approve Return
                      </ApproveButton>
                    ) : null}
                    <ActionButton onClick={() => handleViewOrder(order)}>
                      View
                    </ActionButton>
                  </OrderCardActions>
                </OrderCard>
              ))}
            </OrdersCardGrid>
          </>
        )}
        {/* All Orders as Cards on mobile */}
        <SectionTitle>All Orders</SectionTitle>
        <FiltersContainer>
          <FilterGroup>
            <FilterLabel>Status:</FilterLabel>
            <FilterSelect 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="return_requested">Return Requested</option>
              <option value="returned">Returned</option>
            </FilterSelect>
          </FilterGroup>
          
          <SearchInput 
            type="text" 
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FiltersContainer>
        
        <OrdersTable>
          <Table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <CustomerCell>
                    <ProfilePic>
                      {order.picture ? (
                        <img 
                          src={processProfilePictureUrl(order.picture)} 
                          alt="Profile" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : null}
                      <span style={{ display: order.picture ? 'none' : 'inline' }}>
                        {order.name ? order.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </ProfilePic>
                    <CustomerName>{order.name || 'N/A'}</CustomerName>
                  </CustomerCell>
                  <td>{formatDate(order.date)}</td>
                  <td>${Number(order.total || 0).toFixed(2)}</td>
                  <td>
                     <StatusBadge status={order.status}>
                       {order.status === 'return_requested' ? 'Return Requested' : 
                        order.status === 'returned' ? 'Returned' :
                        order.status === 'user_cancelled' ? 'User Cancelled' :
                        order.status === 'cancelled' ? 'Admin Cancelled' :
                        order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                     </StatusBadge>
                  </td>
                  <td>
                    <ActionButton onClick={() => handleViewOrder(order)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px', marginRight: '5px', verticalAlign: 'middle' }}>
                        <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      View Details
                    </ActionButton>
                    {order.status === 'pending' && (
                      <>
                        <ApproveButton onClick={() => handleApproveOrder(order.id)} style={{ marginLeft: 8 }} disabled={!!statusUpdating[order.id]}>
                          {statusUpdating[order.id] === 'approve' ? 'Approving…' : 'Approve'}
                        </ApproveButton>
                        <CancelButton onClick={() => handleCancelOrder(order.id)} style={{ marginLeft: 6 }} disabled={statusUpdating[order.id] === 'approve'}>
                          {statusUpdating[order.id] === 'cancel' ? 'Cancelling…' : 'Cancel'}
                        </CancelButton>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <Pagination>
            <PageInfo>
              Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
            </PageInfo>
            
            <PageControls>
              <PageButton 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </PageButton>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PageButton 
                  key={page}
                  active={currentPage === page}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PageButton>
              ))}
              
              <PageButton 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </PageButton>
            </PageControls>
          </Pagination>
        </OrdersTable>
        <OrdersCardGrid>
          {currentOrders.map(order => (
            <OrderCard key={order.id}>
              <OrderCardRow>
                <OrderCardLabel>Order ID:</OrderCardLabel>
                <span>{order.id}</span>
              </OrderCardRow>
              <OrderCardRow>
                <OrderCardLabel>Customer:</OrderCardLabel>
                <span>{order.name || 'N/A'}</span>
              </OrderCardRow>
              <OrderCardRow>
                <OrderCardLabel>Date:</OrderCardLabel>
                <span>{formatDate(order.date)}</span>
              </OrderCardRow>
              <OrderCardRow>
                <OrderCardLabel>Total:</OrderCardLabel>
                <span>${Number(order.total || 0).toFixed(2)}</span>
              </OrderCardRow>
              <OrderCardRow>
                <OrderCardLabel>Status:</OrderCardLabel>
                <StatusBadge status={order.status}>
                  {order.status === 'return_requested' ? 'Return Requested' : 
                   order.status === 'returned' ? 'Returned' : 
                   order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </StatusBadge>
              </OrderCardRow>
              <OrderCardActions>
                <ActionButton onClick={() => handleViewOrder(order)}>
                  View Details
                </ActionButton>
                {order.status === 'pending' && (
                  <>
                    <ApproveButton onClick={() => handleApproveOrder(order.id)} disabled={!!statusUpdating[order.id]}>
                      {statusUpdating[order.id] === 'approve' ? 'Approving…' : 'Approve'}
                    </ApproveButton>
                    <CancelButton onClick={() => handleCancelOrder(order.id)} disabled={statusUpdating[order.id] === 'approve'}>
                      {statusUpdating[order.id] === 'cancel' ? 'Cancelling…' : 'Cancel'}
                    </CancelButton>
                  </>
                )}
              </OrderCardActions>
            </OrderCard>
          ))}
        </OrdersCardGrid>
      </OrdersContainer>
      
      {/* Order Details Modal */}
      {isModalOpen && (
        <OrderModal isOpen={isModalOpen}>
          <ModalContent>
            {orderLoading || !selectedOrder ? (
              <ModalBody style={{ minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span>Loading order details...</span>
              </ModalBody>
            ) : (
              <>
                <ModalHeader>
                  <ModalTitle>Order Details - {selectedOrder.id}</ModalTitle>
                  <CloseButton onClick={() => setIsModalOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </CloseButton>
                </ModalHeader>
                
                <ModalBody>
                  <OrderInfo>
                    <OrderInfoTitle>Order Information</OrderInfoTitle>
                    <OrderInfoGrid>
                      <OrderInfoItem>
                        <span>Order Date</span>
                        <strong>{formatDate(selectedOrder.order_date || selectedOrder.date)}</strong>
                      </OrderInfoItem>
                      <OrderInfoItem>
                        <span>Status</span>
                    <StatusBadge status={selectedOrder.status}>
                          {selectedOrder.status === 'return_requested' ? 'Return Requested' : 
                           selectedOrder.status === 'returned' ? 'Returned' : 
                           selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                        </StatusBadge>
                      </OrderInfoItem>
                      <OrderInfoItem>
                        <span>Payment Method</span>
                        <strong>{selectedOrder.paymentMethod}</strong>
                      </OrderInfoItem>
                      {selectedOrder.returnReason && (
                        <OrderInfoItem>
                          <span>Return Reason</span>
                          <strong>{selectedOrder.returnReason}</strong>
                        </OrderInfoItem>
                      )}
                      {selectedOrder.refundDate && (
                        <OrderInfoItem>
                          <span>Refund Date</span>
                          <strong>{formatDate(selectedOrder.refundDate)}</strong>
                        </OrderInfoItem>
                      )}
                    </OrderInfoGrid>
                  </OrderInfo>
                  
                   <OrderInfo>
                    <OrderInfoTitle>Customer Information</OrderInfoTitle>
                    <OrderInfoGrid>
                       <OrderInfoItem>
                         <span>Name</span>
                         <strong>{selectedOrder.customer_name || selectedOrder.name || 'N/A'}</strong>
                       </OrderInfoItem>
                      <OrderInfoItem>
                        <span>Email</span>
                        <strong>{selectedOrder.email || 'N/A'}</strong>
                      </OrderInfoItem>
                      <OrderInfoItem>
                         <span>Shipping Address</span>
                         <strong>{selectedOrder.address || 'N/A'}</strong>
                      </OrderInfoItem>
                       <OrderInfoItem>
                         <span>Phone</span>
                         <strong>{selectedOrder.phone || 'N/A'}</strong>
                       </OrderInfoItem>
                    </OrderInfoGrid>
                  </OrderInfo>
                  
                  <OrderItems>
                    <OrderInfoTitle>Order Items</OrderInfoTitle>
                    <OrderItemsList>
                      {(selectedOrder.items || []).map((item, index) => (
                        <OrderItem key={index}>
                          <ItemDetails>
                            {item.image && (
                              <img src={item.image} alt={item.title} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, marginRight: 12 }} />
                            )}
                            <div>
                              <ItemName>{item.title}</ItemName>
                              <ItemPrice>${(item.price || 0).toFixed(2)}</ItemPrice>
                            </div>
                          </ItemDetails>
                          <ItemQuantity>x{item.quantity || 0}</ItemQuantity>
                          <ItemTotal>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</ItemTotal>
                        </OrderItem>
                      ))}
                    </OrderItemsList>
                    
                    <OrderSummary>
                      <SummaryRow>
                        <span>Subtotal</span>
                        <span>${Number(selectedOrder.total || 0).toFixed(2)}</span>
                      </SummaryRow>
                      <SummaryRow>
                        <span>Shipping</span>
                        <span>$0.00</span>
                      </SummaryRow>
                      <SummaryRow>
                        <span>Tax</span>
                        <span>Included</span>
                      </SummaryRow>
                      <SummaryRow className="total">
                        <span>Total</span>
                        <span>${Number(selectedOrder.total || 0).toFixed(2)}</span>
                      </SummaryRow>
                    </OrderSummary>
                  </OrderItems>
                </ModalBody>
                
                <ModalFooter>
                  <CancelButton onClick={() => setIsModalOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ width: '16px', height: '16px', marginRight: '5px', verticalAlign: 'middle' }}>
                      <path d="M18 6L6 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Close
                  </CancelButton>
                  {selectedOrder.status === 'pending' && (
                    <>
                      <ApproveButton onClick={() => handleApproveOrder(selectedOrder.id)} disabled={!!statusUpdating[selectedOrder.id]}>
                        {statusUpdating[selectedOrder.id] === 'approve' ? 'Approving…' : 'Approve (Processing)'}
                      </ApproveButton>
                      <CancelButton onClick={() => handleCancelOrder(selectedOrder.id)} disabled={statusUpdating[selectedOrder.id] === 'approve'}>
                        {statusUpdating[selectedOrder.id] === 'cancel' ? 'Cancelling…' : 'Cancel Order'}
                      </CancelButton>
                    </>
                  )}
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </OrderModal>
      )}
    </>
  );
};

export default Orders;