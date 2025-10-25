"use client";
import React, { useState } from 'react';

export default function VehiclesAdminPage() {
  const [form, setForm] = useState({
    operatorId: '',
    vehicleType: 'economy',
    make: '',
    model: '',
    year: '',
    capacity: '',
    features: '',
    licensePlate: '',
  });
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const body = {
      operatorId: form.operatorId,
      vehicleType: form.vehicleType,
      make: form.make,
      model: form.model,
      year: form.year ? Number(form.year) : undefined,
      capacity: Number(form.capacity),
      features: form.features ? form.features.split(',').map(s => s.trim()) : undefined,
      licensePlate: form.licensePlate || undefined,
    };
    const res = await fetch('/api/transfers/admin/vehicles', { method: 'POST', body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) setStatus(`Создан транспорт: ${data.id}`);
    else setStatus(`Ошибка: ${data.error}`);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-3">Транспорт</h2>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <input name="operatorId" placeholder="Operator ID" value={form.operatorId} onChange={onChange} className="border p-2 col-span-2" />
        <select name="vehicleType" value={form.vehicleType} onChange={onChange} className="border p-2">
          <option value="economy">economy</option>
          <option value="comfort">comfort</option>
          <option value="business">business</option>
          <option value="minibus">minibus</option>
          <option value="bus">bus</option>
        </select>
        <input name="make" placeholder="Марка" value={form.make} onChange={onChange} className="border p-2" />
        <input name="model" placeholder="Модель" value={form.model} onChange={onChange} className="border p-2" />
        <input name="year" placeholder="Год" value={form.year} onChange={onChange} className="border p-2" />
        <input name="capacity" placeholder="Вместимость" value={form.capacity} onChange={onChange} className="border p-2" />
        <input name="features" placeholder="Фичи (через запятую)" value={form.features} onChange={onChange} className="border p-2 col-span-2" />
        <input name="licensePlate" placeholder="Госномер" value={form.licensePlate} onChange={onChange} className="border p-2 col-span-2" />
        <button className="bg-black text-white p-2 col-span-2">Сохранить</button>
      </form>
      {status && <p className="mt-3 text-sm">{status}</p>}
    </div>
  );
}
