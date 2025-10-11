// api/gemini.js
// Usando CommonJS (compatível com Vercel Functions)
export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  // Só permite POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { prompt, model = 'gemini-2.0-flash-lite' } = await req.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt é obrigatório' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Chama a Gemini API usando a variável de ambiente
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Erro Gemini API:', errorBody);
      
      return new Response(JSON.stringify({ 
        error: `Erro na API Gemini: ${response.status}`,
        details: errorBody 
      }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta';
    
    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na function:', error);
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
