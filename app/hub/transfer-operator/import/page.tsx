"use client";
import React, { useState } from 'react';

const defaultJson = `{
  "routes": [],
  "vehicles": [],
  "drivers": [],
  "schedules": []
}`;

export default function ImportAdminPage() {
  const [jsonText, setJsonText] = useState(defaultJson);
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    let payload: any;
    try {
      payload = JSON.parse(jsonText);
    } catch (e: any) {
      setStatus(`Ошибка JSON: ${e.message}`);
      return;
    }
    const res = await fetch('/api/transfers/admin/import', { method: 'POST', body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.success) setStatus(`Импорт завершён: ${data.summary}`);
    else setStatus(`Ошибка: ${data.error}`);
  }

  return (
    <div className="max-w-3xl">
      <h2 className="text-xl font-semibold mb-3">Импорт тестовых данных</h2>
      <form onSubmit={submit} className="grid gap-3">
        <textarea
          className="border p-2 h-64 font-mono text-sm"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
        <button className="bg-black text-white p-2">Импортировать</button>
      </form>
      {status && <p className="mt-3 text-sm">{status}</p>}
    </div>
  );
}
