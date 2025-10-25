import Link from 'next/link';
import React from 'react';

export const metadata = {
  title: 'Transfer Operator Admin',
};

export default function TransferOperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold mb-4">Управление трансферами</h1>
      <nav className="flex gap-4 mb-6 text-sm">
        <Link className="underline" href="/hub/transfer-operator">Главная</Link>
        <Link className="underline" href="/hub/transfer-operator/routes">Маршруты</Link>
        <Link className="underline" href="/hub/transfer-operator/vehicles">Транспорт</Link>
        <Link className="underline" href="/hub/transfer-operator/drivers">Водители</Link>
        <Link className="underline" href="/hub/transfer-operator/schedules">Расписания</Link>
        <Link className="underline" href="/hub/transfer-operator/import">Импорт</Link>
        <Link className="underline" href="/hub/transfer-operator/holds">Холды</Link>
      </nav>
      <div>{children}</div>
    </div>
  );
}
