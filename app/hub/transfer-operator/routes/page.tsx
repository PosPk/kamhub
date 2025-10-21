"use client";
import React, { useState } from 'react';

export default function RoutesAdminPage() {
  const [form, setForm] = useState({
    name: '',
    fromLocation: '',
    toLocation: '',
    fromLat: '',
    fromLng: '',
    toLat: '',
    toLng: '',
    distanceKm: '',
    estimatedDurationMinutes: '',
  });
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const body = {
      name: form.name,
      fromLocation: form.fromLocation,
      toLocation: form.toLocation,
      fromCoordinates: { lat: Number(form.fromLat), lng: Number(form.fromLng) },
      toCoordinates: { lat: Number(form.toLat), lng: Number(form.toLng) },
      distanceKm: form.distanceKm ? Number(form.distanceKm) : undefined,
      estimatedDurationMinutes: form.estimatedDurationMinutes ? Number(form.estimatedDurationMinutes) : undefined,
    };
    const res = await fetch('/api/transfers/admin/routes', { method: 'POST', body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) setStatus(`Создан маршрут: ${data.id}`);
    else setStatus(`Ошибка: ${data.error}`);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-3">Маршруты</h2>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <input name="name" placeholder="Название" value={form.name} onChange={onChange} className="border p-2 col-span-2" />
        <input name="fromLocation" placeholder="Откуда" value={form.fromLocation} onChange={onChange} className="border p-2" />
        <input name="toLocation" placeholder="Куда" value={form.toLocation} onChange={onChange} className="border p-2" />
        <input name="fromLat" placeholder="От lat" value={form.fromLat} onChange={onChange} className="border p-2" />
        <input name="fromLng" placeholder="От lng" value={form.fromLng} onChange={onChange} className="border p-2" />
        <input name="toLat" placeholder="До lat" value={form.toLat} onChange={onChange} className="border p-2" />
        <input name="toLng" placeholder="До lng" value={form.toLng} onChange={onChange} className="border p-2" />
        <input name="distanceKm" placeholder="Дистанция, км" value={form.distanceKm} onChange={onChange} className="border p-2" />
        <input name="estimatedDurationMinutes" placeholder="Длительность, мин" value={form.estimatedDurationMinutes} onChange={onChange} className="border p-2" />
        <button className="bg-black text-white p-2 col-span-2">Сохранить</button>
      </form>
      {status && <p className="mt-3 text-sm">{status}</p>}
    </div>
  );
}
