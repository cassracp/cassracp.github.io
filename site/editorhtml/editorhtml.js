/**
 * Funções específicas para a página do editor de HTML (editorhtml.html).
 * Controla as ações dos botões e a interação com o editor TinyMCE.
 */

document.addEventListener('DOMContentLoaded', function() {
    // Vincula as funções aos botões assim que o DOM estiver pronto
    document.getElementById('btn-link').addEventListener('click', adicionarLink);
    document.getElementById('btn-img').addEventListener('click', adicionarImagem);
    document.getElementById('btn-ul').addEventListener('click', adicionarLista);
    document.getElementById('btn-ol').addEventListener('click', adicionarListaNumerada);
    document.getElementById('btn-p').addEventListener('click', adicionarParagrafo);
    document.getElementById('btn-br').addEventListener('click', adicionarQuebraDeLinha);
    document.getElementById('btn-spoiler').addEventListener('click', adicionarSpoiler);
    document.getElementById('btn-quote').addEventListener('click', adicionarCitacao);
    document.getElementById('btn-audio').addEventListener('click', adicionarAudio);
    document.getElementById('btn-pre').addEventListener('click', adicionarPreformatado);
    document.getElementById('btn-aumentar-fonte').addEventListener('click', aumentarFonte);
    document.getElementById('btn-diminuir-fonte').addEventListener('click', diminuirFonte);
    document.getElementById('btn-mudar-cor').addEventListener('click', mudarCor);
    document.getElementById('btn-visualizar').addEventListener('click', visualizarHTML);
    document.getElementById('btn-limpar').addEventListener('click', limparEditor);
    document.getElementById('btn-salvar').addEventListener('click', salvarConteudo);
    document.getElementById('btn-copiar-codigo').addEventListener('click', copiarCodigo);
});

function formatarTexto(command, value = null) {
    tinymce.activeEditor.execCommand(command, false, value);
}

function adicionarLink() {
    const url = prompt("Digite a URL do link:");
    if (url) {
        tinymce.activeEditor.execCommand('mceInsertLink', false, { href: url, target: '_blank' });
    }
}

function adicionarImagem() {
    const url = prompt("Digite a URL da imagem:");
    if (url) {
        tinymce.activeEditor.execCommand('mceInsertContent', false, `<img src="${url}" alt="Imagem">`);
    }
}

function adicionarLista() {
    tinymce.activeEditor.execCommand('InsertUnorderedList');
}

function adicionarListaNumerada() {
    tinymce.activeEditor.execCommand('InsertOrderedList');
}

function adicionarParagrafo() {
    tinymce.activeEditor.execCommand('mceInsertContent', false, '<p>Seu parágrafo aqui.</p>');
}

function adicionarQuebraDeLinha() {
    tinymce.activeEditor.execCommand('mceInsertContent', false, '<br>');
}

function adicionarSpoiler() {
    const selection = tinymce.activeEditor.selection.getContent({ format: 'text' });
    if (selection) {
        tinymce.activeEditor.execCommand('mceInsertContent', false, `<details><summary>Spoiler</summary>${selection}</details>`);
    } else {
        showCustomAlert("Selecione um texto para adicionar o spoiler.");
    }
}

function adicionarCitacao() {
    const selection = tinymce.activeEditor.selection.getContent({ format: 'html' });
    if (selection) {
        tinymce.activeEditor.execCommand('mceInsertContent', false, `<blockquote>${selection}</blockquote>`);
    } else {
        showCustomAlert("Selecione um texto para a citação.");
    }
}

function adicionarAudio() {
    const url = prompt("Digite a URL do áudio:");
    if (url) {
        tinymce.activeEditor.execCommand('mceInsertContent', false, `<audio controls><source src="${url}" type="audio/mpeg">Seu navegador não suporta o elemento de áudio.</audio>`);
    }
}

function adicionarPreformatado() {
    const selection = tinymce.activeEditor.selection.getContent({ format: 'text' });
    if (selection) {
        tinymce.activeEditor.execCommand('mceInsertContent', false, `<pre>${selection}</pre>`);
    } else {
        showCustomAlert("Selecione um texto para o bloco pré-formatado.");
    }
}

function aumentarFonte() {
    tinymce.activeEditor.execCommand('fontSize', false, '1.2em');
}

function diminuirFonte() {
    tinymce.activeEditor.execCommand('fontSize', false, '0.8em');
}

function mudarCor() {
    const color = prompt("Digite a cor (ex: #ff0000 ou red):");
    if (color) {
        tinymce.activeEditor.execCommand('forecolor', false, color);
    }
}

function visualizarHTML() {
    const content = tinymce.activeEditor.getContent();
    const previewWindow = window.open();
    previewWindow.document.write(content);
    previewWindow.document.close();
}

function limparEditor() {
    tinymce.activeEditor.setContent('');
}

function salvarConteudo() {
    const content = tinymce.activeEditor.getContent();
    salvarTexto(content, 'editor_conteudo.html');
}

function copiarCodigo() {
    const content = tinymce.activeEditor.getContent({ source_view: true });
    
    // Usa uma área de transferência temporária para copiar o HTML bruto
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = content;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);
    
    showCustomAlert('Código HTML copiado!');
}
