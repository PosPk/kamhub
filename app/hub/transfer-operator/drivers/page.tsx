"use client";
import React, { useState } from 'react';

export default function DriversAdminPage() {
  const [form, setForm] = useState({
    operatorId: '',
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    languages: '',
    rating: '',
    totalTrips: '',
  });
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const body = {
      operatorId: form.operatorId,
      name: form.name,
      phone: form.phone,
      email: form.email || undefined,
      licenseNumber: form.licenseNumber || undefined,
      languages: form.languages ? form.languages.split(',').map(s => s.trim()) : undefined,
      rating: form.rating ? Number(form.rating) : undefined,
      totalTrips: form.totalTrips ? Number(form.totalTrips) : undefined,
    };
    const res = await fetch('/api/transfers/admin/drivers', { method: 'POST', body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) setStatus(`Создан водитель: ${data.id}`);
    else setStatus(`Ошибка: ${data.error}`);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-3">Водители</h2>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <input name="operatorId" placeholder="Operator ID" value={form.operatorId} onChange={onChange} className="border p-2 col-span-2" />
        <input name="name" placeholder="ФИО" value={form.name} onChange={onChange} className="border p-2 col-span-2" />
        <input name="phone" placeholder="Телефон" value={form.phone} onChange={onChange} className="border p-2 col-span-2" />
        <input name="email" placeholder="Email" value={form.email} onChange={onChange} className="border p-2 col-span-2" />
        <input name="licenseNumber" placeholder="Номер лицензии" value={form.licenseNumber} onChange={onChange} className="border p-2 col-span-2" />
        <input name="languages" placeholder="Языки (через запятую)" value={form.languages} onChange={onChange} className="border p-2 col-span-2" />
        <input name="rating" placeholder="Рейтинг (0-5)" value={form.rating} onChange={onChange} className="border p-2" />
        <input name="totalTrips" placeholder="Рейсов всего" value={form.totalTrips} onChange={onChange} className="border p-2" />
        <button className="bg-black text-white p-2 col-span-2">Сохранить</button>
      </form>
      {status && <p className="mt-3 text-sm">{status}</p>}
    </div>
  );
}
