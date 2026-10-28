import '../../../src/app/globals.css';
// Test-only gallery: these are the production components, with no production route added.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StoreCheckout } from '../../../src/components/StoreCheckout';
import { StudioClasses } from '../../../src/components/StudioClasses';
import { FeedbackProvider } from '../../../src/components/FeedbackProvider';
import { SaaSBilling } from '../../../src/components/SaaSBilling';
const params = new URLSearchParams(location.search);
function CycleGallery() {
  const [view, setView] = useState<string | null>(null);
  return <main><button onClick={() => setView('checkout')}>Mount checkout</button><button onClick={() => setView('billing')}>Mount billing</button><button onClick={() => setView(null)}>Unmount</button>
    {view === 'checkout' && <StoreCheckout offering={{ id:'class-1',kind:'class',name:'Yoga',price:0,currency:'INR' }} onClose={() => setView(null)} />}
    {view === 'billing' && <SaaSBilling orgId="studio-1" />}</main>;
}
createRoot(document.getElementById('root')!).render(params.get('view') === 'classes' ? <FeedbackProvider><StudioClasses orgId="studio" /></FeedbackProvider> : params.get('view') === 'cycles' ? <CycleGallery /> : params.get('view') === 'billing' ? <SaaSBilling orgId="studio-1" /> : <StoreCheckout offering={{ id: 'class-1', kind: 'class', name: 'Yoga', price: params.has('paid') ? 100 : 0, currency: 'INR' }} onClose={() => {}} />);
