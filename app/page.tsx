"use client";
export default function Page() {
  return (
    <div className="py-10 grid gap-8">
      <section className="grid gap-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Экосистема туризма Камчатки</h1>
        <p className="text-neutral-300">Туры, партнёры, CRM, бронирование, безопасность, рефералы и экология — в едином центре.</p>
      </section>

      <section className="card-dark p-5 grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Кому это нужно</h2>
          <div className="text-sm text-neutral-400">Выберите роль, чтобы продолжить</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['Турист','/hub/tours'],
            ['Туроператор','/hub/operators'],
            ['Гид','/hub/guides'],
            ['Трансфер','/hub/transfer'],
            ['Размещение','/hub/stay'],
            ['Сувениры','/hub/souvenirs'],
            ['Прокат снаряжения','/hub/gear'],
            ['Прокат авто','/hub/cars'],
          ].map(([t,href]) => (
            <a key={t} href={href} className="rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 p-4 transition">
              <div className="font-extrabold">{t}</div>
              <div className="text-sm text-neutral-400">Персональные инструменты и витрины</div>
            </a>
          ))}
        </div>
      </section>

      <section className="card-dark p-5 grid gap-3">
        <div className="text-sm text-neutral-400">AI.Kam</div>
        <form action="/api/ai" method="post" className="flex gap-2 items-center">
          <input name="prompt" placeholder="AI‑Кам: спросите о турах, местах, маршрутах" className="flex-1 h-11 rounded-lg px-3 bg-neutral-900 border border-neutral-800" />
          <button className="button-gold h-11">Спросить</button>
        </form>
      </section>
    </div>
  )
}

