'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

interface OrderStatus {
  order_number: string;
  status: string;
  payment_status: string;
  total_amount?: number;
  currency?: string;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order') || '';
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    fetch(`/api/user/order-status?order=${encodeURIComponent(orderNumber)}`)
      .then(r => r.json())
      .then(d => setOrderStatus(d.data || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderNumber]);

  const isPaid = orderStatus?.payment_status === 'paid' || orderStatus?.status === 'completed';
  const isPending = orderStatus?.payment_status === 'pending' || orderStatus?.status === 'pending';

  return (
    <div className="inner-wrap">
      <div className="success-page">
        {loading ? (
          <>
            <div className="inline-loader">
              <div className="spinner" />
              <span>Verifying payment...</span>
            </div>
          </>
        ) : (
          <>
            <div className="success-icon-circle" style={isPaid ? {} : { background: isPending ? '#FBBF24' : '#94a3b8' }}>
              {isPaid ? '\u2713' : isPending ? '\u23F3' : '?'}
            </div>
            <div className="success-title">
              {isPaid ? 'Payment Complete!' : isPending ? 'Payment Processing' : 'Order Received'}
            </div>
            <div className="success-desc">
              {isPaid
                ? 'Thank you for your purchase. Your order has been confirmed. You will receive credentials and access details via email shortly.'
                : isPending
                  ? 'Your payment is being processed. This page will update once the payment is confirmed. You can also check your order status from your dashboard.'
                  : 'Your order has been received. Please check your dashboard for the latest status.'}
            </div>
            <div className="success-details">
              {orderNumber && (
                <div className="sd-row">
                  <span className="sd-key">Order Number</span>
                  <span className="sd-val mono">{orderNumber}</span>
                </div>
              )}
              <div className="sd-row">
                <span className="sd-key">Status</span>
                <span className="sd-val">{isPaid ? 'Paid' : isPending ? 'Processing' : orderStatus?.status || 'Checking...'}</span>
              </div>
              <div className="sd-row">
                <span className="sd-key">Payment</span>
                <span className="sd-val">Mayar</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href="/" className="btn btn-accent">Continue Shopping</Link>
              <Link href="/dashboard/orders" className="btn btn-outline">View Orders</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="inner-wrap">
        <div className="inline-loader">
          <div className="spinner" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
