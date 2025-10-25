"use client";
import React, { useState } from 'react';

export default function SchedulesAdminPage() {
  const [form, setForm] = useState({
    routeId: '',
    vehicleId: '',
    driverId: '',
    departureTime: '',
    arrivalTime: '',
    pricePerPerson: '',
    availableSeats: '',
  });
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const body = {
      routeId: form.routeId,
      vehicleId: form.vehicleId,
      driverId: form.driverId,
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      pricePerPerson: Number(form.pricePerPerson),
      availableSeats: Number(form.availableSeats),
    };
    const res = await fetch('/api/transfers/admin/schedules', { method: 'POST', body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) setStatus(`Создано расписание: ${data.id}`);
    else setStatus(`Ошибка: ${data.error}`);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-3">Расписания</h2>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <input name="routeId" placeholder="Route ID" value={form.routeId} onChange={onChange} className="border p-2 col-span-2" />
        <input name="vehicleId" placeholder="Vehicle ID" value={form.vehicleId} onChange={onChange} className="border p-2 col-span-2" />
        <input name="driverId" placeholder="Driver ID" value={form.driverId} onChange={onChange} className="border p-2 col-span-2" />
        <input name="departureTime" placeholder="Отправление (HH:MM)" value={form.departureTime} onChange={onChange} className="border p-2" />
        <input name="arrivalTime" placeholder="Прибытие (HH:MM)" value={form.arrivalTime} onChange={onChange} className="border p-2" />
        <input name="pricePerPerson" placeholder="Цена за пассажира" value={form.pricePerPerson} onChange={onChange} className="border p-2" />
        <input name="availableSeats" placeholder="Свободные места" value={form.availableSeats} onChange={onChange} className="border p-2" />
        <button className="bg-black text-white p-2 col-span-2">Сохранить</button>
      </form>
      {status && <p className="mt-3 text-sm">{status}</p>}
    </div>
  );
}
