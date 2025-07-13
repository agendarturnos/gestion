import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function ClientDashboard() {
  const [tenant, setTenant] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (user) {
        const q = query(collection(db, 'tenants'), where('companyId', '==', user.uid));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          setTenant(null);
        } else {
          setTenant({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        }
      }
    });
    return () => unsub();
  }, []);

  if (!tenant) {
    return <p className="p-4">No active subscription.</p>;
  }

  const lastPayment = tenant.payments ? tenant.payments[tenant.payments.length - 1] : null;

  return (
    <div className="p-4">
      {lastPayment && (
        <div>
          <p>
            Last payment: {lastPayment.amount} on {lastPayment.date}
          </p>
        </div>
      )}
      <p>Next payment date: {tenant.nextPayment}</p>
    </div>
  );
}
