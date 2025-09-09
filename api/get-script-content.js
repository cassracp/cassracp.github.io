export default async function handler(request, response) {
  // Configuração do repositório (deve ser a mesma da outra função)
  const GITHUB_OWNER = 'demariainfo';
  const GITHUB_REPO = 'doc-windows2017';
  const GITHUB_BRANCH = 'bombeiro';

  // Pega o caminho do arquivo do parâmetro da URL (ex: ?path=scripts/001.sql)
  const { path } = request.query;

  if (!path) {
    return response.status(400).json({ error: 'O caminho do arquivo é obrigatório.' });
  }

  const token = process.env.GITHUB_PAT;
  if (!token) {
    return response.status(500).json({ error: 'Token de acesso não configurado.' });
  }

  // A API para buscar o conteúdo de um arquivo é a mesma, mas com o caminho completo do arquivo
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`;

  try {
    const githubResponse = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!githubResponse.ok) {
      throw new Error(`Erro do GitHub: ${githubResponse.statusText}`);
    }

    const data = await githubResponse.json();

    // O conteúdo do arquivo vem codificado em Base64, precisamos decodificar.
    const contentBase64 = data.content;
    const contentDecoded = Buffer.from(contentBase64, 'base64').toString('utf-8');

    response.setHeader('Access-Control-Allow-Origin', '*');
    // Retorna o conteúdo como texto puro
    return response.status(200).send(contentDecoded);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Erro ao buscar conteúdo do arquivo.' });
  }
}