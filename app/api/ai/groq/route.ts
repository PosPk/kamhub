import { NextRequest } from 'next/server';
export async function POST(req: NextRequest){
  try{
    const { model, prompt } = await req.json();
    if(!prompt) return new Response(JSON.stringify({error:'prompt required'}),{status:400});
    const key = process.env.OPENROUTER_API_KEY || process.env.GROQ_API_KEY;
    if(!key) return new Response(JSON.stringify({error:'AI key missing'}),{status:500});
    const url = process.env.OPENROUTER_API_KEY ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.groq.com/openai/v1/chat/completions';
    const r = await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({
      model: model || 'llama-3.1-70b',
      messages:[
        {role:'system',content:'Ты ai.Kam — помоги составить маршрут по Камчатке кратко и по делу.'},
        {role:'user',content: prompt}
      ],
      temperature:0.4,max_tokens:600
    })});
    const j = await r.json();
    const itinerary = j?.choices?.[0]?.message?.content || '';
    return new Response(JSON.stringify({itinerary}),{status:200,headers:{'Content-Type':'application/json'}});
  }catch(e:any){
    return new Response(JSON.stringify({error:e?.message||'failed'}),{status:500});
  }
}

