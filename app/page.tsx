import KamchatkaOutlineButton from "../components/KamchatkaOutlineButton"

export default function Page() {
  return (
    <main className="min-h-screen bg-premium-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl mx-6 mb-8">
        <div className="absolute inset-0 -z-10">
          <video 
            className="w-full h-[48vh] object-cover" 
            autoPlay 
            muted 
            loop 
            playsInline 
            poster="https://images.unsplash.com/photo-1520496938500-76fd098ad75a?q=80&w=1920&auto=format&fit=crop"
          >
            <source src="https://cdn.coverr.co/videos/coverr-aurora-over-mountains-0157/1080p.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 gradient-gold-aurora animate-aurora"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute inset-0 p-8 grid content-end gap-4">
          <h1 className="font-display text-4xl sm:text-6xl font-black leading-tight">
            Экосистема туризма Камчатки
          </h1>
          <p className="max-w-2xl text-white/85">
            Туры, партнёры, CRM, бронирование, безопасность, рефералы и экология — в едином центре.
          </p>
          <form className="flex gap-2 items-center" action="/search">
            <input 
              placeholder="Куда поедем? вулканы, океан, медведи…" 
              className="flex-1 h-12 rounded-xl px-4 text-slate-900" 
              name="q" 
            />
            <button className="h-12 rounded-xl px-5 font-bold bg-premium-gold text-premium-black">
              Искать
            </button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 py-6 grid gap-4">
        <div className="grid gap-1 text-center">
          <div className="font-display text-3xl sm:text-5xl font-black leading-tight text-gold gold-glow">
            Камчатка.
          </div>
          <div className="font-display text-3xl sm:text-5xl font-black leading-tight text-gold gold-glow">
            экосистема путешествий.
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Кому это нужно</h2>
          <div className="text-white/70 text-sm">Выберите роль, чтобы продолжить</div>
        </div>
        
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          {[
            ['Турист', '/hub/tourist'],
            ['Туроператор', '/hub/operator'],
            ['Гид', '/hub/guide'],
            ['Трансфер', '/hub/transfer'],
            ['Размещение', '/hub/stay'],
            ['Сувениры', '/hub/souvenirs'],
            ['Прокат снаряжения', '/hub/gear'],
            ['Прокат авто', '/hub/cars'],
          ].map(([title, href]) => (
            <a 
              key={title} 
              href={href} 
              className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition"
            >
              <div className="text-lg font-extrabold">{title}</div>
              <div className="text-sm text-white/70">Персональные инструменты и витрины</div>
            </a>
          ))}
        </div>
      </section>

      {/* SOS and Ecology Section */}
      <section className="px-6 py-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 grid gap-4 sm:grid-cols-2 sm:items-start">
          <div className="grid gap-4">
            <div className="text-sm text-white/70">SOS и безопасность</div>
            <div className="grid gap-3">
              <a href="#" className="rounded-xl bg-premium-gold text-premium-black text-center py-3 font-bold">
                SOS
              </a>
              <a href="#" className="rounded-xl bg-white/10 text-center py-3 font-bold">
                МЧС
              </a>
              <a href="#" className="rounded-xl bg-white/10 text-center py-3 font-bold">
                Сейсмика
              </a>
            </div>
            <div className="text-white/70 text-xs">Тестовый режим: интеграции в процессе</div>
          </div>
          <div className="w-full h-72 rounded-2xl overflow-hidden border border-white/10 bg-black grid place-items-center cursor-pointer group">
            <div className="w-[70%] sm:w-[80%]">
              <a href="/hub/safety" target="_blank" rel="noopener noreferrer" className="group inline-block w-full max-w-[520px]">
                <div className="rounded-2xl border border-white/10 bg-black grid place-items-center map-button-glow w-full">
                  <img src="/graphics/kamchatka-button.svg" alt="Камчатка" className="kamchatka-button w-full h-auto" />
                </div>
              </a>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 grid gap-2">
          <div className="text-sm text-white/70">Экология</div>
          <div className="text-2xl font-black text-premium-gold">Eco‑points: 0</div>
          <div className="text-white/70 text-sm">Собирайте баллы за бережное поведение</div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="px-6 py-8 grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Быстрые переходы</h2>
        </div>
        <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
          {[
            ['Каталог туров', '/partners'],
            ['Поиск', '/search'],
            ['Витрина Commerce', '/premium'],
            ['Витрина Adventure', '/premium2'],
            ['Размещение', '/hub/stay'],
            ['Безопасность', '/hub/safety'],
            ['Рефералы и бусты', '/hub/operator'],
          ].map(([title, href]) => (
            <a 
              key={title} 
              href={href} 
              className="text-center font-semibold border border-white/10 rounded-xl p-3 bg-white/5 hover:bg-white/10"
            >
              {title}
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}

