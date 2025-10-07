 
export default function Page() {
  return (
    <div className="py-10 grid gap-8">
      <section className="grid gap-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Экосистема туризма Камчатки</h1>
        <p className="text-neutral-300">Туры, партнёры, CRM, бронирование, безопасность, рефералы и экология — в едином центре.</p>
      </section>

      <section className="card-dark p-5 grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Активности</h2>
          <div className="text-sm text-neutral-400">Выберите интерес</div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['Вулканы','volcano'],
            ['Гейзеры','geysers'],
            ['Хайкинг','hiking'],
            ['Медведи','bears'],
            ['Рыбалка','fishing'],
            ['Серфинг','surfing'],
            ['Озёра','lakes'],
            ['Снегоходы','snowmobiles'],
          ].map(([title,icon]) => (
            <a key={String(icon)} href={`/hub/tours?act=${encodeURIComponent(String(icon))}`} className="rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 p-4 transition flex items-center gap-3">
              <img src={`/graphics/activities/${icon}.svg`} alt={String(icon)} className="w-6 h-6" />
              <div className="font-extrabold">{title}</div>
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

