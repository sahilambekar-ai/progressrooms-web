"use client";
import { StoreCheckout } from './StoreCheckout';
export function EnrollmentModal({ sessionId, sessionName, price, currency, isOpen, onClose, totalClasses, validityDays }: {
  sessionId: string; sessionName: string; price: number; currency: string; isOpen: boolean; onClose: () => void;
  totalClasses?: number; validityDays?: number;
}) {
  if (!isOpen) return null;
  return <StoreCheckout offering={{ id:sessionId,kind:'class',name:sessionName,price,currency,total_classes:totalClasses,validity_days:validityDays }} onClose={onClose} />;
}
