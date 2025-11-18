import chardet from 'chardet';

export default async function handler(request, response) {
  // Configuração do repositório
  const GITHUB_OWNER = 'demariainfo';
  const GITHUB_REPO = 'doc-windows2017';
  const GITHUB_BRANCH = 'bombeiro';

  const { path } = request.query;

  if (!path) {
    return response.status(400).json({ error: 'O caminho do arquivo é obrigatório.' });
  }

  const token = process.env.GITHUB_PAT;
  if (!token) {
    return response.status(500).json({ error: 'Token de acesso não configurado.' });
  }

  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;

  try {
    const githubResponse = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!githubResponse.ok) {
      throw new Error(`Erro do GitHub: ${githubResponse.statusText}`);
    }

    const data = await githubResponse.json();
    const contentBase64 = data.content;

    // 1. Manter o conteúdo como um Buffer (array de bytes)
    const contentBuffer = Buffer.from(contentBase64, 'base64');

    // 2. Detectar o encoding a partir do Buffer
    // chardet.detect retorna uma string como 'UTF-8', 'ISO-8859-1', etc.
    // Usamos um fallback para 'UTF-8' se a detecção falhar.
    const detectedEncoding = chardet.detect(contentBuffer, { returnAllMatches: false }) || 'UTF-8';

    // ISO-8859-1 é frequentemente como o Win-1252 é detectado.
    // Para o TextDecoder do navegador, 'windows-1252' é mais robusto.
    const finalEncoding = detectedEncoding.toUpperCase().includes('8859') ? 'windows-1252' : detectedEncoding;

    // 3. Montar a nova resposta da API
    const responsePayload = {
      detected_encoding: finalEncoding,
      content_base64: contentBase64
    };
    
    response.setHeader('Access-Control-Allow-Origin', '*');
    // 4. Retornar o objeto JSON
    return response.status(200).json(responsePayload);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Erro ao buscar conteúdo do arquivo.' });
  }
}