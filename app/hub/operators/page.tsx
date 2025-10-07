"use client";
import { useState } from 'react';

export default function OperatorsPage(){
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState('');
  async function onSubmit(e:any){
    e.preventDefault(); setMsg(''); setLoading(true);
    const f=e.currentTarget as HTMLFormElement;
    const data={
      user_email: (f.elements.namedItem('email') as HTMLInputElement).value,
      name: (f.elements.namedItem('name') as HTMLInputElement).value,
      categories: Array.from(f.querySelectorAll('input[name="cat"]:checked')).map((el:any)=>el.value),
      phone: (f.elements.namedItem('phone') as HTMLInputElement).value,
      website: (f.elements.namedItem('website') as HTMLInputElement).value,
      description: (f.elements.namedItem('description') as HTMLTextAreaElement).value,
    };
    const r=await fetch('/api/partners/apply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    const j=await r.json().catch(()=>({}));
    setLoading(false);
    setMsg(j.ok? 'Заявка отправлена. Статус: pending' : (j?.error||'Ошибка'));
  }
  return (
    <main style={{minHeight:'100vh',background:'#000',color:'#fff',padding:24}}>
      <a href="/" style={{color:'#E6C149'}}>← На главную</a>
      <h1 style={{fontWeight:900,fontSize:28,marginTop:12}}>Стать партнёром</h1>
      <p style={{color:'#aaa'}}>Заполните форму. Мы проверим и активируем кабинет.</p>
      <form onSubmit={onSubmit} style={{display:'grid',gap:10,marginTop:12,maxWidth:560}}>
        <input name="email" placeholder="Email" required style={{padding:'10px 12px',borderRadius:8,color:'#111'}} />
        <input name="name" placeholder="Название компании/бренда" required style={{padding:'10px 12px',borderRadius:8,color:'#111'}} />
        <div style={{display:'grid',gap:6}}>
          <div style={{color:'#aaa',fontSize:12}}>Категории</div>
          {[
            ['operator','Туроператор'],['guide','Гид'],['transfer','Трансфер'],['stay','Размещение'],['souvenir','Сувениры'],['gear','Прокат снаряжения'],['cars','Прокат авто'],['restaurant','Ресторан'],
          ].map(([v,l])=> (
            <label key={v} style={{display:'flex',gap:8,alignItems:'center'}}>
              <input type="checkbox" name="cat" value={v} /> <span>{l}</span>
            </label>
          ))}
        </div>
        <input name="phone" placeholder="Телефон" style={{padding:'10px 12px',borderRadius:8,color:'#111'}} />
        <input name="website" placeholder="Сайт/соцсеть" style={{padding:'10px 12px',borderRadius:8,color:'#111'}} />
        <textarea name="description" placeholder="Краткое описание" rows={4} style={{padding:'10px 12px',borderRadius:8,color:'#111'}} />
        <button type="submit" disabled={loading} style={{background:'#E6C149',color:'#111',padding:'10px 16px',borderRadius:10,fontWeight:700}}>{loading? 'Отправка…':'Отправить заявку'}</button>
        <div style={{minHeight:24,color:'#E6C149'}}>{msg}</div>
      </form>
    </main>
  );
}
