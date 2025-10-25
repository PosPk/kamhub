"use client";
import React, { useState } from 'react';

export default function HoldsPage() {
  const [scheduleId, setScheduleId] = useState('');
  const [requestedSeats, setRequestedSeats] = useState(1);
  const [ttlSec, setTtlSec] = useState(600);
  const [holdId, setHoldId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function createHold(e: React.FormEvent) {
    e.preventDefault();
    setStatus('');
    const res = await fetch('/api/transfers/holds/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleId, requestedSeats, ttlSec })
    });
    const data = await res.json();
    if (data.success) {
      setHoldId(data.data.holdId);
      setStatus(`Создан hold до ${data.data.expiresAt}`);
    } else {
      setStatus(`Ошибка: ${data.error}`);
    }
  }

  async function confirmHold() {
    if (!holdId) return;
    setStatus('');
    const res = await fetch('/api/transfers/holds/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holdId })
    });
    const data = await res.json();
    setStatus(data.success ? `Подтверждено: ${data.data.status}` : `Ошибка: ${data.error}`);
  }

  async function cancelHold() {
    if (!holdId) return;
    setStatus('');
    const res = await fetch('/api/transfers/holds/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ holdId })
    });
    const data = await res.json();
    setStatus(data.success ? `Отменено: ${data.data.status}` : `Ошибка: ${data.error}`);
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">Холды мест (TTL)</h1>
      <form onSubmit={createHold} className="space-y-3 mb-4">
        <div>
          <label className="block text-sm mb-1">Schedule ID</label>
          <input className="border p-2 w-full" value={scheduleId} onChange={e => setScheduleId(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm mb-1">Места</label>
            <input type="number" className="border p-2 w-full" value={requestedSeats} onChange={e => setRequestedSeats(parseInt(e.target.value || '1'))} />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">TTL (сек)</label>
            <input type="number" className="border p-2 w-full" value={ttlSec} onChange={e => setTtlSec(parseInt(e.target.value || '600'))} />
          </div>
        </div>
        <button className="px-4 py-2 bg-black text-white rounded" type="submit">Создать hold</button>
      </form>

      <div className="flex gap-3 mb-2">
        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={confirmHold} disabled={!holdId}>Подтвердить</button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded" onClick={cancelHold} disabled={!holdId}>Отменить</button>
      </div>
      {holdId && <p className="text-sm text-gray-600">holdId: {holdId}</p>}
      {status && <p className="mt-2 text-sm">{status}</p>}
    </div>
  );
}
