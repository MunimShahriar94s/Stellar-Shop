import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({}); // { [id]: true }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/orders/user/history', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          credentials: 'include'
        });
        const data = await res.json();
        if (res.ok) setOrders(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, navigate]);

  const cancelOrder = async (orderId) => {
    if (updating[orderId]) return;
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`/api/orders/user/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include'
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
      }
    } finally {
      setUpdating(prev => { const c = { ...prev }; delete c[orderId]; return c; });
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>;

  if (!orders.length) return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h2>Your Orders</h2>
      <p>You have no orders yet.</p>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 16 }}>Your Orders</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        {orders.map(order => {
          const canCancel = ['pending', 'processing'].includes(order.status);
          return (
            <div key={order.id} style={{ border: '1px solid var(--border-color)', background: 'var(--card-bg)', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Order #{order.id}</div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>{new Date(order.order_date || order.date).toLocaleString()}</div>
                </div>
                <div>
                  <span style={{ padding: '4px 8px', borderRadius: 6, background: 'var(--input-bg)', textTransform: 'capitalize' }}>
                    {['cancelled','user_cancelled'].includes(order.status) ? 'Cancelled' : order.status}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', fontSize: 14, opacity: 0.9, marginTop: 8 }}>
                <div>Subtotal: ${Number(order.subtotal ?? 0).toFixed(2)}</div>
                <div>Shipping: {Number(order.shipping ?? 0) === 0 ? 'Free' : `$${Number(order.shipping ?? 0).toFixed(2)}`}</div>
                <div>Tax: ${Number(order.tax ?? 0).toFixed(2)}</div>
                <div style={{ fontWeight: 600 }}>Total: ${Number(order.total ?? 0).toFixed(2)}</div>
              </div>
              {canCancel && (
                <div style={{ marginTop: 12, textAlign: 'right' }}>
                  <button
                    onClick={() => cancelOrder(order.id)}
                    disabled={!!updating[order.id]}
                    style={{
                      background: 'var(--danger-color)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6,
                      opacity: updating[order.id] ? 0.7 : 1, cursor: updating[order.id] ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {updating[order.id] ? 'Cancelling…' : 'Cancel Order'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


