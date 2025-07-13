import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';

export default function AdminDashboard() {
  const [tenants, setTenants] = useState([]);
  const [form, setForm] = useState({
    companyId: '',
    name: '',
    amount: '',
    paymentDate: '',
    dueDate: '',
    receiptUrl: ''
  });

  const fetchTenants = async () => {
    const snapshot = await getDocs(collection(db, 'tenants'));
    setTenants(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addTenant = async e => {
    e.preventDefault();
    await addDoc(collection(db, 'tenants'), {
      companyId: form.companyId,
      name: form.name,
      lastPayment: form.paymentDate,
      nextPayment: form.dueDate,
      payments: [
        {
          amount: form.amount,
          date: form.paymentDate,
          receiptUrl: form.receiptUrl
        }
      ]
    });
    setForm({
      companyId: '',
      name: '',
      amount: '',
      paymentDate: '',
      dueDate: '',
      receiptUrl: ''
    });
    fetchTenants();
  };

  const removeTenant = async id => {
    await deleteDoc(doc(db, 'tenants', id));
    fetchTenants();
  };

  return (
    <div className="p-4 space-y-8">
      <form onSubmit={addTenant} className="space-y-2">
        <input
          name="companyId"
          value={form.companyId}
          onChange={handleChange}
          placeholder="Company ID"
          className="border p-2"
        />
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="border p-2"
        />
        <input
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Amount"
          className="border p-2"
        />
        <input
          name="paymentDate"
          value={form.paymentDate}
          onChange={handleChange}
          type="date"
          className="border p-2"
        />
        <input
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          type="date"
          className="border p-2"
        />
        <input
          name="receiptUrl"
          value={form.receiptUrl}
          onChange={handleChange}
          placeholder="Receipt URL"
          className="border p-2"
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2">
          Add Client
        </button>
      </form>
      <div>
        <h2 className="text-lg font-bold mb-2">Clients</h2>
        <ul className="space-y-2">
          {tenants.map(t => (
            <li key={t.id} className="border p-2">
              <div>
                {t.companyId} - {t.name}
              </div>
              <div>Last Payment: {t.lastPayment}</div>
              <div>Next Payment: {t.nextPayment}</div>
              <div>
                Payments:
                <ul>
                  {t.payments &&
                    t.payments.map((p, idx) => (
                      <li key={idx} className="ml-4">
                        {p.amount} - {p.date}
                      </li>
                    ))}
                </ul>
              </div>
              <button
                onClick={() => removeTenant(t.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
