export default function HubPage(){
  const roles:[string,string][] = [
    ['Турист','/hub/tours'],
    ['Туроператор','/hub/operators'],
    ['Гид','/hub/guides'],
    ['Трансфер','/hub/transfer'],
    ['Размещение','/hub/stay'],
    ['Сувениры','/hub/souvenirs'],
    ['Прокат снаряжения','/hub/gear'],
    ['Прокат авто','/hub/cars'],
  ];
  return (
    <main className="py-10 grid gap-6">
      <h1 className="text-2xl font-extrabold">Кому это нужно</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {roles.map(([t,href])=> (
          <a key={t} href={href} className="rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 p-4 transition">
            <div className="font-extrabold">{t}</div>
            <div className="text-sm text-neutral-400">Персональные инструменты и витрины</div>
          </a>
        ))}
      </div>
    </main>
  );
}
