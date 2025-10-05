"use client";
import { useState } from 'react';
export default function ToursPage() {
  const [open,setOpen]=useState(false),[loading,setLoading]=useState(false),[text,setText]=useState('');
  async function onSubmit(e:any){e.preventDefault();const f=e.currentTarget as HTMLFormElement;
    const dates=(f.elements.namedItem('dates') as HTMLInputElement).value;
    const guests=(f.elements.namedItem('guests') as HTMLInputElement).value;
    const interests=(f.elements.namedItem('interests') as HTMLInputElement).value;
    const budget=(f.elements.namedItem('budget') as HTMLInputElement).value;
    setLoading(true);setText('');
    const prompt=`Составь 2-дневный план по Камчатке. Даты: ${dates}. Гостей: ${guests}. Интересы: ${interests}. Бюджет: ${budget} RUB.`;
    const r=await fetch('/api/ai/groq',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'llama-3.1-70b',prompt})});
    const j=await r.json(); setText(j.itinerary||j.error||''); setLoading(false);
  }
  return (<main style={{minHeight:'100vh',background:'#000',color:'#fff',padding:24}}>
    <a href="/" style={{color:'#E6C149'}}>← На главную</a>
    <h1 style={{fontWeight:900,fontSize:28,marginTop:12}}>Туры</h1>
    <button onClick={()=>setOpen(true)} style={{background:'#E6C149',color:'#111',padding:'10px 16px',borderRadius:10,fontWeight:700,marginTop:12}}>AI.KAM</button>
    {open&&(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'grid',placeItems:'center',zIndex:50}}>
      <div style={{background:'#0b0b0b',border:'1px solid #222',borderRadius:12,padding:16,width:520,maxWidth:'90vw'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><b>ai.Kam · подбор маршрута</b><button onClick={()=>setOpen(false)} style={{color:'#aaa'}}>✕</button></div>
        <form onSubmit={onSubmit} style={{display:'grid',gap:8,marginTop:12}}>
          <input name="dates" placeholder="Даты" style={{padding:'10px 12px',borderRadius:8,color:'#111'}} />
          <input name="guests" placeholder="Гостей" type="number" min={1} defaultValue={2} style={{padding:'10px 12px',borderRadius:8,color:'#111'}} />
          <input name="interests" placeholder="Интересы (вулканы, рыбалка...)" style={{padding:'10px 12px',borderRadius:8,color:'#111'}} />
          <input name="budget" placeholder="Бюджет (RUB)" type="number" style={{padding:'10px 12px',borderRadius:8,color:'#111'}} />
          <button type="submit" disabled={loading} style={{background:'#E6C149',color:'#111',padding:'10px 16px',borderRadius:10,fontWeight:700}}>{loading?'Генерация...':'Получить маршрут'}</button>
          <div style={{whiteSpace:'pre-wrap',minHeight:80}}>{text}</div>
        </form>
      </div></div>)}
  </main>);
}

