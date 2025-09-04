/*
Este arquivo contém as funções JavaScript para a interatividade da página principal (index.html),
incluindo manipulação do editor TinyMCE, modais e chamadas de API.
*/

/**
 * Chama a API do Gemini para gerar texto com base em um prompt.
 * @param {string} prompt O texto de entrada para a IA.
 * @returns {Promise<string>} O texto gerado pela IA.
 */
async function gerarTextoComGemini(prompt) {
    const model = 'gemini-2.5-flash-preview-05-20';
    const apiKey = 'AIzaSyA2OQvGwLMD2DJiES4k4uNyx1F4QP_JEsE'; // A chave da API será fornecida pelo ambiente de execução.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
    };

    let response;
    let delay = 1000; // Começa com 1 segundo de espera
    for (let i = 0; i < 5; i++) { // Tenta até 5 vezes
        try {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const result = await response.json();
                if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
                    return result.candidates[0].content.parts[0].text;
                } else {
                    throw new Error('Resposta da API inválida');
                }
            } else if (response.status === 429 || response.status >= 500) {
                // Erro de servidor ou excesso de requisições, espera e tenta novamente.
                console.warn(`Tentativa ${i + 1} falhou com status ${response.status}. Tentando novamente em ${delay}ms.`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Dobra o tempo de espera
            } else {
                // Outros erros (4xx), não tenta novamente.
                const errorResult = await response.json();
                throw new Error(errorResult.error.message || 'Erro ao comunicar com a API');
            }
        } catch (error) {
            if (i === 4) { // Se for a última tentativa
                throw error;
            }
            console.warn(`Tentativa ${i + 1} falhou. Tentando novamente em ${delay}ms.`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
    
    throw new Error('Não foi possível obter uma resposta da API após várias tentativas.');
}


/**
 * Copia o conteúdo HTML do editor para a área de transferência.
 * @param {tinymce.Editor} editor A instância do editor TinyMCE.
 */
function copiarHTML(editor) {
    const htmlContent = editor.getContent();
    if (!htmlContent) {
        Swal.fire('Atenção', 'Não há conteúdo para copiar.', 'warning');
        return;
    }
    navigator.clipboard.writeText(htmlContent).then(() => {
        console.log('HTML copiado com sucesso!');
    }).catch(err => {
        console.error('Erro ao copiar o HTML: ', err);
        Swal.fire('Erro', 'Não foi possível copiar o conteúdo.', 'error');
    });
}

/**
 * Exibe uma confirmação e, se o usuário concordar, limpa o conteúdo do editor.
 * @param {tinymce.Editor} editor A instância do editor TinyMCE.
 */
function LimparEditor(editor) {
    confirmacao("Limpar Editor?", "Tem certeza que deseja apagar todo o conteúdo?", () => {
        editor.setContent('');
        editor.focus();
    });
}

/**
 * Exibe o conteúdo do editor em um modal de pré-visualização.
 * @param {tinymce.Editor} editor A instância do editor TinyMCE.
 */
function ExibirPrevia(editor) {
    const formattedText = editor.getContent();
    if (!formattedText) {
        Swal.fire('Atenção', 'O editor está vazio.', 'warning');
        return;
    }
    document.getElementById("modalPreviaContent").innerHTML = formattedText;
    const previaModal = new bootstrap.Modal(document.getElementById('previaModal'));
    previaModal.show();
}


/**
 * Salva o conteúdo do editor como um arquivo .html.
 * @param {tinymce.Editor} editor A instância do editor TinyMCE.
 */
function salvarComoHTML(editor) {
    const editorContent = editor.getContent();
    if (!editorContent) {
        Swal.fire('Atenção', 'Não há conteúdo para salvar.', 'warning');
        return;
    }

    const blob = new Blob([editorContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'conteudo_editado.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Funções para abrir as ferramentas em janelas do TinyMCE
function ExibirFormatarTelefone() {
    tinymce.activeEditor.windowManager.openUrl({
        title: 'Formatar Telefone',
        url: 'site/numertel.html', // Caminho corrigido
        width: 800,
        height: 450
    });
}

function ExibirTopicoTarefa() {
    tinymce.activeEditor.windowManager.openUrl({
        title: 'Tópico Tarefa',
        url: 'site/topicotarefa.html', // Caminho corrigido
        width: 1200,
        height: 600
    });
}

function ExibirTopicoOS() {
    tinymce.activeEditor.windowManager.openUrl({
        title: 'Tópico OS',
        url: 'site/topicoos.html', // Caminho corrigido
        width: 1200,
        height: 800
    });
}

/**
 * Função de confirmação genérica usando SweetAlert2.
 * @param {string} titulo O título do alerta.
 * @param {string} mensagem O texto do alerta.
 * @param {function} callbackConfirm Função a ser executada se o usuário confirmar.
 */
function confirmacao(titulo, mensagem, callbackConfirm) {
    Swal.fire({
        title: titulo,
        text: mensagem,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: "Sim",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            callbackConfirm();
        }
    });
}

