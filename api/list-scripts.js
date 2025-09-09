// export default define a função principal que a Vercel irá executar.
export default async function handler(request, response) {
  // Configuração do seu repositório privado
  const GITHUB_OWNER = 'demariainfo';
  const GITHUB_REPO = 'doc-windows2017';
  const PATH_TO_SCRIPTS = 'scripts';
  const GITHUB_BRANCH = 'bombeiro'; // NOVO: Especificamos a branch correta

  // Acessa a chave secreta que você salvou nas Variáveis de Ambiente da Vercel
  const token = process.env.GITHUB_PAT;

  // Medida de segurança: Se o token não estiver configurado no servidor, retorna um erro.
  if (!token) {
    return response.status(500).json({ error: 'Token de acesso do GitHub não configurado no servidor.' });
  }

  // URL da API do GitHub, agora incluindo a referência para a branch (?ref=...)
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PATH_TO_SCRIPTS}?ref=${GITHUB_BRANCH}`;

  try {
    // Faz a chamada para a API do GitHub, incluindo o token de autorização
    const githubResponse = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    // Se a resposta do GitHub não for bem-sucedida, retorna um erro
    if (!githubResponse.ok) {
      const errorData = await githubResponse.json();
      return response.status(githubResponse.status).json({ 
        message: 'Erro ao buscar dados do GitHub.',
        details: errorData.message 
      });
    }

    // Converte a resposta do GitHub para JSON
    const data = await githubResponse.json();

    // Filtra os resultados para pegar apenas os arquivos .sql
    const scripts = data
      .filter(item => 
        item.type === 'file' && 
        item.name.toUpperCase().startsWith('UPDATE_') && 
        item.name.endsWith('.sql')
      )
      .map(item => ({
        // Extrai apenas as informações que nossa ferramenta precisa
        name: item.name,
        path: item.path,
        download_url: item.download_url
      }));
      
    // Medida de segurança (CORS): Permite que seu site no GitHub Pages acesse esta API
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Retorna a lista de scripts com sucesso!
    return response.status(200).json(scripts);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
  }
}