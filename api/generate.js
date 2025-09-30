// Importa as ferramentas necessárias do Vercel AI SDK e do provedor da Groq.
import { Groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// Permite que a Vercel execute esta função na borda (edge) para mais velocidade.
export const runtime = 'edge';

// Cria uma nova instância do cliente da Groq.
// O SDK automaticamente buscará a chave de API da variável de ambiente GROQ_API_KEY.
const groq = new Groq();

export default async function POST(req) {
  // Extrai a mensagem (prompt) do corpo da requisição enviada pelo editor.
  const { prompt } = await req.json();

  // Chama a API da Groq com o prompt e o modelo desejado.
  const result = await streamText({
    model: groq('llama3-8b-8192'), // Usando o mesmo modelo Llama 3
    prompt: prompt,
  });

  // Retorna a resposta da IA como um fluxo de texto (streaming).
  return result.toAIStreamResponse();
}