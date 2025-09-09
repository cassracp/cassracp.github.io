/**
 * Funções utilitárias globais para o Auxiliar DeMaria.
 * Estas funções são usadas em múltiplas páginas.
 */

/**
 * Copia o texto de um elemento para a área de transferência.
 * @param {string} elementId - O ID do elemento (textarea, input) de onde o texto será copiado.
 */
function copiarTexto(elementId) {
    const textarea = document.getElementById(elementId);
    if (textarea && textarea.value) {
        textarea.select();
        document.execCommand('copy');
        showCustomAlert('Texto copiado para a área de transferência!');
    } else {
        showCustomAlert('Nenhum texto para copiar!');
    }
}

/**
 * Salva o conteúdo de um elemento de texto em um arquivo .txt.
 * @param {string} content - O conteúdo a ser salvo.
 * @param {string} filename - O nome do arquivo a ser criado.
 */
function salvarTexto(content, filename) {
    if (!content) {
        showCustomAlert('Não há conteúdo para salvar!');
        return;
    }
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showCustomAlert('Arquivo salvo com sucesso!');
}

/**
 * Limpa o conteúdo de um elemento (ex: textarea).
 * @param {string} elementId - O ID do elemento a ser limpo.
 */
function limparTexto(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = '';
    }
}

/**
 * Adiciona um texto específico no final do conteúdo de um elemento.
 * @param {string} elementId - O ID do elemento (textarea).
 * @param {string} textToAdd - O texto a ser adicionado.
 */
function adicionarTexto(elementId, textToAdd) {
    const textarea = document.getElementById(elementId);
    if (textarea) {
        textarea.value += textToAdd;
    }
}

/**
 * Envolve o texto selecionado em uma textarea com textos de prefixo e sufixo.
 * @param {string} elementId - O ID da textarea.
 * @param {string} prefix - O texto a ser adicionado antes da seleção.
 * @param {string} suffix - O texto a ser adicionado depois da seleção.
 */
function adicionarTextoAntesDepois(elementId, prefix, suffix) {
    const textarea = document.getElementById(elementId);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = prefix + selectedText + suffix;

    textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    textarea.focus();
    textarea.selectionStart = start + prefix.length;
    textarea.selectionEnd = end + prefix.length;
}

/**
 * Mostra um popup de ajuda.
 */
function showPopup() {
    document.getElementById('help-popup').style.display = 'block';
}

/**
 * Esconde o popup de ajuda.
 */
function hidePopup() {
    document.getElementById('help-popup').style.display = 'none';
}

/**
 * Exibe um alerta customizado na tela.
 * @param {string} message - A mensagem a ser exibida.
 */
function showCustomAlert(message) {
    const alertBox = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    if (alertBox && alertMessage) {
        alertMessage.textContent = message;
        alertBox.style.display = 'block';
        setTimeout(() => {
            alertBox.style.display = 'none';
        }, 3000);
    }
}

/**
 * Converte uma string para o formato "Title Case".
 * @param {string} str - A string a ser convertida.
 * @returns {string} A string convertida.
 */
function TitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

/**
 * Aplica o tema (claro/escuro) em um modal lendo a configuração do localStorage da janela principal.
 * Deve ser chamado no evento DOMContentLoaded do modal.
 */
function applyModalTheme() {
    try {
        // Acessa o localStorage da janela pai para pegar o nome EXATO do tema
        const activeTheme = window.parent.localStorage.getItem('tinymceActiveTheme');

        // Se um tema foi encontrado, aplica o nome dele diretamente como o atributo data-theme
        if (activeTheme) {
            document.body.setAttribute('data-theme', activeTheme);
        }
    } catch (e) {
        console.error("Não foi possível aplicar o tema do modal a partir do localStorage.", e);
    }
}

function InserirLinkOS(nOS) {
    return `<a href="https://www.sacdemaria.com.br/adm/os/consulta_os.php?id=${nOS}" target="_blank" rel="noopener">OS ${nOS}</a>`;
    }

function InserirLinkTarefa(nTarefa) {
    return `<a href="https://www.demaria.com.br/intranet/v3/tarefa/detalhe.php?tarefa_id=${nTarefa}" target="_blank" rel="noopener">Tarefa ${nTarefa}</a>`;
}

function SomenteNumeros(texto) {
    return /^\d+$/.test(texto);
}

// Funções de Tópicos e Telefone (mantidas para compatibilidade)
function ExibirFormatarTelefone() { console.log("Formatar Telefone chamado"); }
function ExibirTopicoTarefa() { console.log("Tópico Tarefa chamado"); }
function ExibirTopicoOS() { console.log("Tópico OS chamado"); }
function confirmacao(titulo, mensagem, callbackConfirm, callbackCancel) {
    Swal.fire({
        title: titulo,
        text: mensagem,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            if (callbackConfirm) callbackConfirm();
        } else {
            if (callbackCancel) callbackCancel();
        }
    });
}

/**
 * Salva o conteúdo de um elemento de texto em um arquivo com uma codificação específica.
 * Requer a biblioteca 'text-encoding'.
 * @param {string} content - O conteúdo a ser salvo.
 * @param {string} filename - O nome do arquivo a ser criado.
 * @param {string} encoding - A codificação do arquivo (ex: 'windows-1252').
 */
function salvarTextoComEncoding(content, filename, encoding) {
    if (!content) {
        showCustomAlert('Não há conteúdo para salvar!');
        return;
    }

    try {
        // Usa o TextEncoder da biblioteca que incluímos para codificar a string
        const encoder = new TextEncoder(encoding, { NONSTANDARD_allowLegacyEncoding: true });
        const encodedData = encoder.encode(content); // Gera um array de bytes na codificação correta

        // Cria o Blob a partir dos bytes codificados
        const blob = new Blob([encodedData], { type: 'text/plain;charset=' + encoding });
        
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

    } catch (ex) {
        console.error("Erro ao salvar com encoding:", ex);
        showCustomAlert('Ocorreu um erro ao gerar o arquivo com a codificação específica.');
    }
}