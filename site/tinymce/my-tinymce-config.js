tinymce.init({
    selector: '#editor', // Seletor mais específico para o seu textarea
    language_url: 'my_tinymce_app/langs/pt_BR.js',
    language: 'pt_BR', // Define o idioma para Português do Brasil
    plugins: [
        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'advlist', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
        'code', 'insertdatetime', 'help', 'quickbars',
        'visualchars', 'fullscreen', 'preview'
    ],
    codesample_languages: [
        {text: 'SQL', value: 'sql'},
        {text: 'HTML/XML', value: 'markup'},
        {text: 'JavaScript', value: 'javascript'},
        {text: 'Python', value: 'python'},
        {text: 'Java', value: 'java'},
        {text: 'C#', value: 'csharp'}
    ],
    menu: {
        file: { title: 'Arquivo', items: 'novodocumento copyhtml savehtml | print' },
        insert: { title: 'Inserir', items: 'hr | image imagemComLink link media linkOS linkTarefa inseriraudio emoticons charmap | insertdatetime insertCalendarDate | codesample' },
        format: { 
            title: 'Formatar', 
            items: 'bold italic underline strikethrough superscript subscript codeformat | upperCaselowerCaseMenu | melhorarTextoIAMenu | blockformats align lineheight forecolor backcolor removeformat blockquote' 
        },
        tools: { 
            title: 'Ferramentas', 
            items: 'spellchecker charmap emoticons | formatarTelefone topicoTarefa topicoOS | gerarTextoGemini | responderMensagem' 
        },
        table: { title: 'Tabela', items: 'inserttable | cell row column | deletetable' },
        help: { title: 'Ajuda', items: 'help' }
    },
    toolbar: 'undo redo | novodocumento copyhtml savehtml | blocks fontfamily fontsize | forecolor backcolor bold italic underline strikethrough togglecodeformat blockquote  removeformat align lineheight numlist bullist indent outdent hr | responderMensagem linkOS linkTarefa link imagemComLink inseriraudio insertCalendarDate codesample | formatarTelefone topicoTarefa topicoOS | gerarTextoGemini code fullscreen preview',
    font_family_formats: 
    'Andale Mono=andale mono,times;' +
    'Arial=arial,helvetica,sans-serif;' +
    'Arial Black=arial black,avant garde;' +
    'Book Antiqua=book antiqua,palatino;' +
    'Comic Sans MS=comic sans ms,sans-serif;' +
    'Consolas=Consolas,monospace;' +
    'Courier New=courier new,courier;' +
    'Georgia=georgia,palatino;' +
    'Helvetica=helvetica;' +
    'Impact=impact,chicago;' +
    'Tahoma=tahoma,arial,helvetica,sans-serif;' +
    'Terminal=terminal,monaco;' +
    'Times New Roman=times new roman,times;' +
    'Trebuchet MS=trebuchet ms,geneva;' +
    'Verdana=verdana,geneva;',
    font_size_formats: '6pt 8pt 10pt 12pt 14pt 16pt 18pt 24pt 26pt 32pt 48pt',
    insertdatetime_timeformat: '%H:%M:%S',
    insertdatetime_formats: ['%d/%m/%Y', '%d-%m-%Y', '%d/%m/%Y às %H:%M', '%d-%m-%Y às %H:%M', '%H:%M (Brasília, GMT -03:00)'],
    browser_spellcheck: true,
    contextmenu: "bold italic underline forecolor | lists | link openlink unlink | insertdatetime | imagemComLink image | table",
    link_default_target: '_blank',
    lineheight_formats: '1 1.2 1.4 1.5 1.6 1.8 2 2.5 3',
    content_style: "body { line-height: 1.4; font-size: 10pt; } blockquote { font-family: 'Courier New', Courier, monospace; font-size: 8pt; }",
    quickbars_insert_toolbar: false,
    quickbars_selection_toolbar: 'bold italic underline togglecodeformat | upperCaselowerCase melhorarTextoIA | removeformat | fontfamily fontsize fontsizeselect forecolor backcolor  quicklink blockquote indent outdent',
    quickbars_image_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | imageoptions',
    forced_root_block: '',
    setup: function (editor) {
        editor.on('contextmenu', function (event) {
            if (event.ctrlKey) {
                return;
            }
            event.preventDefault();
            editor.execCommand('mceContextMenu', false);
        });

// ===================================================================================
// == FUNÇÕES AUXILIARES =============================================================
// ===================================================================================
        const FormatarUpperCase = (editor) => {
            const bookmark = editor.selection.getBookmark();
            const selectedText = editor.selection.getContent({ format: 'text' });
            if (selectedText.length > 0) {
                editor.selection.setContent(selectedText.toUpperCase());
                editor.selection.moveToBookmark(bookmark);
            }
        };

        const FormatarLowerCase = (editor) => {
            const bookmark = editor.selection.getBookmark();
            const selectedText = editor.selection.getContent({ format: 'text' });
            if (selectedText.length > 0) {
                editor.selection.setContent(selectedText.toLowerCase());
                editor.selection.moveToBookmark(bookmark);
            }
        };

        const extrairExtensao = (url) => {
            try {
                const caminho = new URL(url).pathname;
                const nomeArquivo = caminho.split('/').pop();
                return nomeArquivo.split('.').pop().split(/[?#]/)[0].toLowerCase();
            } catch {
                return url.split('.').pop().split(/[?#]/)[0].toLowerCase();
            }
        };
        
        const FormatarAudio = (url) => {
            const extensao = extrairExtensao(url);
            const tipoMIME = { mp3: 'audio/mpeg', ogg: 'audio/ogg', opus: 'audio/ogg', oga: 'audio/ogg', wav: 'audio/wav', aac: 'audio/aac', m4a: 'audio/mp4' };
            return tipoMIME[extensao] ? `<audio controls><source src="${url}" type="${tipoMIME[extensao]}"></audio>` : "";
        };
        
        const openLinkOSDialog = (editor) => {
            editor.windowManager.open({
                title: 'Inserir Link OS',
                body: {
                    type: 'panel',
                    items: [{ type: 'input', name: 'nOS', label: 'Nº da OS:', inputType: 'number', placeholder: 'Digite apenas números' }]
                },
                buttons: [ { text: 'Cancelar', type: 'cancel' }, { text: 'Salvar', type: 'submit', primary: true } ],
                onSubmit: (dialog) => {
                    const data = dialog.getData();
                    if (data.nOS && SomenteNumeros(data.nOS)) {
                        editor.insertContent(InserirLinkOS(data.nOS));
                        dialog.close();
                    } else {
                        Swal.fire({ title: 'Erro', text: 'Por favor, digite apenas números!', icon: 'error' });
                    }
                }
            });
        };
        
        const openLinkTarefaDialog = (editor) => {
            editor.windowManager.open({
                title: 'Inserir Link Tarefa',
                body: {
                    type: 'panel',
                    items: [{ type: 'input', name: 'nTarefa', label: 'Nº da Tarefa:', inputType: 'number', placeholder: 'Digite apenas números' }]
                },
                buttons: [ { text: 'Cancelar', type: 'cancel' }, { text: 'Salvar', type: 'submit', primary: true } ],
                onSubmit: (dialog) => {
                    const data = dialog.getData();
                    if (data.nTarefa && SomenteNumeros(data.nTarefa)) {
                        editor.insertContent(InserirLinkTarefa(data.nTarefa));
                        dialog.close();
                    } else {
                        Swal.fire({ title: 'Erro', text: 'Por favor, digite apenas números!', icon: 'error' });
                    }
                }
            });
        };

        const openInsertAudioDialog = (editor) => {
            editor.windowManager.open({
                title: 'Inserir Áudio',
                body: {
                    type: 'panel',
                    items: [{ type: 'input', name: 'audioUrl', label: 'URL do Áudio', placeholder: 'Insira a URL do áudio'}]
                },
                buttons: [ { text: 'Cancelar', type: 'cancel' }, { text: 'Salvar', type: 'submit', primary: true } ],
                onSubmit: (dialog) => {
                    const data = dialog.getData();
                    if (data.audioUrl) {
                        editor.insertContent(FormatarAudio(data.audioUrl));
                    }
                    dialog.close();
                }
            });
        };
        
        const openCalendarDialog = (editor) => {
            const hoje = new Date().toISOString().split('T')[0];
            editor.windowManager.open({
                title: "Escolha a Data",
                body: {
                    type: "panel",
                    items: [{
                        type: "htmlpanel",
                        html: `<label for="datepicker-field" style="display: block; margin-bottom: 5px;">Data:</label><input type="date" id="datepicker-field" value="${hoje}" style="width: 100%; padding: 8px; font-size: 14px; border-radius: 4px; border: 1px solid #ccc;" />`
                    }]
                },
                buttons: [ { text: 'Cancelar', type: 'cancel' }, { text: 'Salvar', type: 'submit', primary: true } ],
                onSubmit: (dialog) => {
                    const dataSelecionada = document.getElementById("datepicker-field").value;
                    if (dataSelecionada) {
                        const data = new Date(dataSelecionada + 'T00:00:00');
                        const dataFormatada = data.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
                        editor.insertContent(`<p>${dataFormatada}</p>`);
                    }
                    dialog.close();
                }
            });
        };

         // Função para abrir o modal e lidar com a geração de texto usando Gemini AI.
        const openGeminiModal = function () {
            editor.windowManager.open({
                title: 'Gerar Texto com Gemini AI',
                body: {
                    type: 'panel',
                    items: [
                        {
                            type: 'textarea',
                            name: 'prompt',
                            label: 'Descreva o que você quer gerar:',
                            placeholder: 'Ex: Escreva um email para o cliente X confirmando a instalação...'
                        }
                    ]
                },
                buttons: [
                    { text: 'Cancelar', type: 'cancel' },
                    { text: 'Gerar', type: 'submit', primary: true }
                ],
                onSubmit: async function (dialog) {
                    const data = dialog.getData();
                    const prompt = data.prompt.trim();

                    if (!prompt) {
                        Swal.fire({ icon: 'error', title: 'Erro', text: 'Por favor, insira uma descrição.'});
                        return;
                    }
                    
                    dialog.close();
                    
                    Swal.fire({
                        title: 'Gerando texto...',
                        text: 'Aguarde enquanto a IA processa sua solicitação.',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    try {
                        const generatedText = await gerarTextoComGemini(prompt);
                        editor.insertContent(generatedText.replace(/\n/g, '<br>'));
                        Swal.close();
                        
                    } catch (error) {
                        console.error("Erro ao chamar a API Gemini:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Não foi possível gerar o texto. Tente novamente mais tarde.'
                        });
                    }
                }
            });
        };

         const melhorarTextoComIA = async (action, editor) => {
            const selectedText = editor.selection.getContent({ format: 'text' });

            if (!selectedText || selectedText.trim().length === 0) {
                Swal.fire({ icon: 'info', title: 'Nenhum texto selecionado', text: 'Por favor, selecione o texto que deseja modificar.'});
                return;
            }

            let promptAction;
            let titleAction;
            switch (action) {
                case 'melhorar':
                    promptAction = 'Reescreva o texto a seguir para melhorar a clareza e o estilo';
                    titleAction = 'Melhorando escrita...';
                    break;
                case 'corrigir':
                    promptAction = 'Corrija a gramática e a ortografia do texto a seguir';
                    titleAction = 'Corrigindo texto...';
                    break;
                case 'encurtar':
                    promptAction = 'Torne o texto a seguir mais conciso, mantendo o significado original';
                    titleAction = 'Encurtando texto...';
                    break;
                case 'expandir':
                    promptAction = 'Expanda o texto a seguir, adicionando mais detalhes e elaboração';
                    titleAction = 'Expandindo texto...';
                    break;
                default:
                    return;
            }

            const prompt = `${promptAction}: "${selectedText}"`;
            const bookmark = editor.selection.getBookmark();

            Swal.fire({
                title: titleAction,
                text: 'Aguarde enquanto a IA processa sua solicitação.',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            try {
                // Assume que `gerarTextoComGemini` é uma função global que você já possui
                const generatedText = await gerarTextoComGemini(prompt); 
                editor.selection.moveToBookmark(bookmark);
                editor.insertContent(generatedText.replace(/\n/g, '<br>'));
                Swal.close();
            } catch (error) {
                console.error("Erro ao chamar a API Gemini:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Não foi possível processar o texto. Tente novamente mais tarde.'
                });
            }
        };

        const abrirPainelImagemComLink = function(imgUrl = '', descrImagem = '') {
                    editor.windowManager.open({
                        title: 'Inserir Imagem com Link',
                        body: {
                            type: 'panel',
                            items: [
                                { type: 'input', name: 'imgUrl', label: 'URL da Imagem', placeholder: 'https://exemplo.com/imagem.jpg', value: imgUrl },
                                { type: 'input', name: 'descr', label: 'Descrição da Imagem', placeholder: 'Imagem de exemplo', value: descrImagem }
                            ],
                        },
                        buttons: [
                            { text: 'Cancelar', type: 'cancel' },
                            { text: 'Inserir', type: 'submit', primary: true }
                        ],
                        onSubmit: function (dialog) {
                            var data = dialog.getData();
                            var imgUrl = data.imgUrl.trim();
                            var descrImagem = data.descr.trim();
                            
                            if (!imgUrl) {
                                Swal.fire({ icon: 'error', title: 'Erro', text: 'Preencha a URL da Imagem!'});
                                return;
                            }
                            
                            var html = `<a href="${imgUrl}" target="_blank" rel="noopener"><img src="${imgUrl}" style="max-width: 100%; height: auto;" alt="${descrImagem}" title="${descrImagem}"></a>`;
                            if (descrImagem) {
                                html += `<br><small style="color:gray;">(${descrImagem})</small>`;
                            }
                            
                            editor.insertContent(html);
                            dialog.close();
                        }
                    });
                };

        const responderMensagem = function () {
            const selectedContent = editor.selection.getContent({ format: 'html' });
            const insertFormattedReply = (content) => {
                const replyHtml = `<blockquote>${content.trim()}</blockquote><p><strong>Resposta:</strong></p><p>&nbsp;</p>`;
                editor.execCommand('mceInsertContent', false, replyHtml);
                editor.focus();
            };
            if (selectedContent && selectedContent.trim().length > 0) {
                insertFormattedReply(selectedContent);
            } else {
                editor.windowManager.open({
                    title: 'Responder Mensagem',
                    body: {
                        type: 'panel',
                        items: [{ type: 'textarea', name: 'originalMessage', label: 'Cole a mensagem original para responder:', placeholder: 'Cole o texto aqui...', maximized: true }]
                    },
                    buttons: [
                        { text: 'Cancelar', type: 'cancel' },
                        { text: 'Inserir Resposta', type: 'submit', primary: true }
                    ],
                    onSubmit: function (dialog) {
                        const data = dialog.getData();
                        const originalMessage = data.originalMessage.trim();
                        if (originalMessage) {
                            const messageAsHtml = originalMessage.replace(/\n/g, '<br />');
                            insertFormattedReply(messageAsHtml);
                        }
                        dialog.close();
                    }
                });
            }
        };

        const novodocumento = function () {
                confirmacao("Limpar Editor?", "Todo o conteúdo não salvo será perdido.", () => editor.setContent(''));
        };

        editor.on('contextmenu', function (event) {
            if (event.ctrlKey) { return; }
            event.preventDefault();
            editor.execCommand('mceContextMenu', false);
        });

// ===================================================================================
// == ÍCONES PERSONALIZADOS ==========================================================
// ===================================================================================

        editor.ui.registry.addIcon('sparkles', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.25L13.06 5.69L16.5 6.75L13.06 7.81L12 11.25L10.94 7.81L7.5 6.75L10.94 5.69L12 2.25ZM6 9L7.06 12.44L10.5 13.5L7.06 14.56L6 18L4.94 14.56L1.5 13.5L4.94 12.44L6 9ZM18 12L16.94 15.44L13.5 16.5L16.94 17.56L18 21L19.06 17.56L22.5 16.5L19.06 15.44L18 12Z" fill="currentColor"/></svg>');
        editor.ui.registry.addIcon('edit-sparkles', '<svg width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" /><path d="M13.5 6.5l4 4" /><path d="M18 19l2 1l1 -2l-1 -2l-2 -1l-1 2l2 1z" /><path d="M14 13l2 1l1 -2l-1 -2l-2 -1l-1 2l2 1z" /></svg>');
        editor.ui.registry.addIcon('fone', '<i class="fa-solid fa-phone fa-lg"></i>');
        editor.ui.registry.addIcon('topicotarefa', '<i class="fa-solid fa-message fa-lg"></i>');
        editor.ui.registry.addIcon('topicoos', '<i class="fa-solid fa-headset fa-lg"></i>');
        editor.ui.registry.addIcon('reply', '<i class="fa-solid fa-reply fa-lg"></i>');
        editor.ui.registry.addIcon('inseriraudio', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" /><path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" /></svg>');
        editor.ui.registry.addIcon('uppercase', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_iconCarrier"> <path d="M9 9L9 4M9 9L6.5 7M9 9L11.5 7" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.5861 19.1946C10.5203 18.9868 10.3274 18.8455 10.1094 18.8455H7.55474C7.33675 18.8455 7.14388 18.9868 7.07807 19.1946L6.65978 20.5154C6.59397 20.7233 6.4011 20.8645 6.18311 20.8645H4.72359C4.37391 20.8645 4.13223 20.5148 4.2559 20.1877L7.60741 11.3232C7.68095 11.1287 7.86717 11 8.0751 11H9.58987C9.7974 11 9.98336 11.1282 10.0572 11.3222L13.4308 20.1867C13.5553 20.5139 13.3136 20.8645 12.9635 20.8645H11.4811C11.2631 20.8645 11.0702 20.7233 11.0044 20.5154L10.5861 19.1946ZM7.79577 16.9252C7.75489 17.0541 7.85115 17.1856 7.98642 17.1856H9.66955C9.80482 17.1856 9.90108 17.0541 9.8602 16.9252L9.01863 14.2707C8.95964 14.0846 8.69633 14.0846 8.63734 14.2707L7.79577 16.9252Z" fill="#000000"></path> <path d="M18.1268 20.8645C18.0402 20.8645 17.9763 20.8529 17.9413 20.7736C17.8621 20.5943 17.6066 20.4922 17.4472 20.6064C17.0811 20.8688 16.6326 21 16.1016 21C15.3584 21 14.7409 20.7967 14.2491 20.3902C13.7628 19.9837 13.5196 19.4575 13.5196 18.8117C13.5196 18.0438 13.8147 17.4499 14.4048 17.0298C15.0005 16.6098 15.8557 16.3952 16.9705 16.3862H17.1754C17.4516 16.3862 17.6754 16.1623 17.6754 15.8862V15.7967C17.6754 15.467 17.6071 15.2344 17.4705 15.0989C17.3339 14.9634 17.1344 14.8957 16.8721 14.8957C16.4947 14.8957 16.2402 15.0146 16.1087 15.2523C15.9751 15.494 15.7794 15.7358 15.5032 15.7358H14.1835C13.9074 15.7358 13.6755 15.5083 13.7433 15.2406C13.8596 14.7814 14.1457 14.3887 14.6016 14.0623C15.2191 13.6197 15.9978 13.3984 16.9377 13.3984C17.9104 13.3984 18.6618 13.6084 19.1918 14.0285C19.7274 14.444 19.9951 15.0402 19.9951 15.8171V19.2656C20.0061 19.8979 19.9951 20.3651 19.9951 20.7493C19.9951 20.8129 19.9436 20.8645 19.88 20.8645H18.1268ZM16.618 19.4959C16.8748 19.4959 17.0934 19.453 17.2738 19.3672C17.389 19.3124 17.4853 19.251 17.5626 19.1833C17.6435 19.1124 17.6754 19.0042 17.6754 18.8966V18.0379C17.6754 17.7618 17.4516 17.5379 17.1754 17.5379H17.118C16.7246 17.5379 16.4131 17.6418 16.1836 17.8496C15.9595 18.0574 15.8475 18.3351 15.8475 18.6829C15.8475 19.2249 16.1043 19.4959 16.618 19.4959Z" fill="#000000"></path> </g></svg>');
        editor.ui.registry.addIcon('lowercase', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_iconCarrier"> <path d="M17 9L17 4M17 9L14.5 7M17 9L19.5 7" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.5861 19.1946C10.5203 18.9868 10.3274 18.8455 10.1094 18.8455H7.55474C7.33675 18.8455 7.14388 18.9868 7.07807 19.1946L6.65978 20.5154C6.59397 20.7233 6.4011 20.8645 6.18311 20.8645H4.72359C4.37391 20.8645 4.13223 20.5148 4.2559 20.1877L7.60741 11.3232C7.68095 11.1287 7.86717 11 8.0751 11H9.58987C9.7974 11 9.98336 11.1282 10.0572 11.3222L13.4308 20.1867C13.5553 20.5139 13.3136 20.8645 12.9635 20.8645H11.4811C11.2631 20.8645 11.0702 20.7233 11.0044 20.5154L10.5861 19.1946ZM7.79577 16.9252C7.75489 17.0541 7.85115 17.1856 7.98642 17.1856H9.66955C9.80482 17.1856 9.90108 17.0541 9.8602 16.9252L9.01863 14.2707C8.95964 14.0846 8.69633 14.0846 8.63734 14.2707L7.79577 16.9252Z" fill="#000000"></path> <path d="M18.1268 20.8645C18.0402 20.8645 17.9763 20.8529 17.9413 20.7736C17.8621 20.5943 17.6066 20.4922 17.4472 20.6064C17.0811 20.8688 16.6326 21 16.1016 21C15.3584 21 14.7409 20.7967 14.2491 20.3902C13.7628 19.9837 13.5196 19.4575 13.5196 18.8117C13.5196 18.0438 13.8147 17.4499 14.4048 17.0298C15.0005 16.6098 15.8557 16.3952 16.9705 16.3862H17.1754C17.4516 16.3862 17.6754 16.1623 17.6754 15.8862V15.7967C17.6754 15.467 17.6071 15.2344 17.4705 15.0989C17.3339 14.9634 17.1344 14.8957 16.8721 14.8957C16.4947 14.8957 16.2402 15.0146 16.1087 15.2523C15.9751 15.494 15.7794 15.7358 15.5032 15.7358H14.1835C13.9074 15.7358 13.6755 15.5083 13.7433 15.2406C13.8596 14.7814 14.1457 14.3887 14.6016 14.0623C15.2191 13.6197 15.9978 13.3984 16.9377 13.3984C17.9104 13.3984 18.6618 13.6084 19.1918 14.0285C19.7274 14.444 19.9951 15.0402 19.9951 15.8171V19.2656C20.0061 19.8979 19.9951 20.3651 19.9951 20.7493C19.9951 20.8129 19.9436 20.8645 19.88 20.8645H18.1268ZM16.618 19.4959C16.8748 19.4959 17.0934 19.453 17.2738 19.3672C17.389 19.3124 17.4853 19.251 17.5626 19.1833C17.6435 19.1124 17.6754 19.0042 17.6754 18.8966V18.0379C17.6754 17.7618 17.4516 17.5379 17.1754 17.5379H17.118C16.7246 17.5379 16.4131 17.6418 16.1836 17.8496C15.9595 18.0574 15.8475 18.3351 15.8475 18.6829C15.8475 19.2249 16.1043 19.4959 16.618 19.4959Z" fill="#000000"></path> </g></svg>');
        editor.ui.registry.addIcon('upperlowercase', '<svg width="25px" height="25px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.495 9.052l.891 2.35h1.091L6.237 3h-1.02L2 11.402h1.095l.838-2.35h3.562zM5.811 4.453l.044.135 1.318 3.574H4.255l1.307-3.574.044-.135.038-.156.032-.152.021-.126h.023l.024.126.029.152.038.156zm7.984 6.011v.936h.96V7.498c0-.719-.18-1.272-.539-1.661-.359-.389-.889-.583-1.588-.583-.199 0-.401.019-.606.056a4.875 4.875 0 0 0-1.078.326 2.081 2.081 0 0 0-.343.188v.984c.266-.23.566-.411.904-.54a2.927 2.927 0 0 1 1.052-.193c.188 0 .358.028.513.085a.98.98 0 0 1 .396.267c.109.121.193.279.252.472.059.193.088.427.088.7l-1.811.252c-.344.047-.64.126-.888.237a1.947 1.947 0 0 0-.615.419 1.6 1.6 0 0 0-.36.58 2.134 2.134 0 0 0-.117.721c0 .246.042.475.124.688.082.213.203.397.363.551.16.154.36.276.598.366.238.09.513.135.826.135.402 0 .76-.092 1.075-.278.315-.186.572-.454.771-.806h.023zm-2.128-1.743c.176-.064.401-.114.674-.149l1.465-.205v.609c0 .246-.041.475-.123.688a1.727 1.727 0 0 1-.343.557 1.573 1.573 0 0 1-.524.372 1.63 1.63 0 0 1-.668.135c-.187 0-.353-.025-.495-.076a1.03 1.03 0 0 1-.357-.211.896.896 0 0 1-.22-.316A1.005 1.005 0 0 1 11 9.732a1.6 1.6 0 0 1 .055-.44.739.739 0 0 1 .202-.334 1.16 1.16 0 0 1 .41-.237z"></path></g></svg>');
        editor.ui.registry.addIcon('calendar-days', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 11.993a.75.75 0 0 0-.75.75v.006c0 .414.336.75.75.75h.006a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75H12ZM12 16.494a.75.75 0 0 0-.75.75v.005c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H12ZM8.999 17.244a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.006ZM7.499 16.494a.75.75 0 0 0-.75.75v.005c0 .414.336.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H7.5ZM13.499 14.997a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.005a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.005ZM14.25 16.494a.75.75 0 0 0-.75.75v.006c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75h-.005ZM15.75 14.995a.75.75 0 0 1 .75-.75h.005a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75H16.5a.75.75 0 0 1-.75-.75v-.006ZM13.498 12.743a.75.75 0 0 1 .75-.75h2.25a.75.75 0 1 1 0 1.5h-2.25a.75.75 0 0 1-.75-.75ZM6.748 14.993a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" /><path fill-rule="evenodd" d="M18 2.993a.75.75 0 0 0-1.5 0v1.5h-9V2.994a.75.75 0 1 0-1.5 0v1.497h-.752a3 3 0 0 0-3 3v11.252a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3V7.492a3 3 0 0 0-3-3H18V2.993ZM3.748 18.743v-7.5a1.5 1.5 0 0 1 1.5-1.5h13.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-13.5a1.5 1.5 0 0 1-1.5-1.5Z" clip-rule="evenodd" /></svg>');
        editor.ui.registry.addIcon('linkos', '<i class="fa-solid fa-arrow-up-right-from-square"></i>'); 
        editor.ui.registry.addIcon('linktarefa', '<i class="fa-solid fa-square-arrow-up-right fa-lg"></i>');

// ===================================================================================
// == REGISTRO DE BOTÕES E ITENS DE MENU =============================================
// ===================================================================================

        editor.ui.registry.addButton('gerarTextoGemini', { icon: 'sparkles', tooltip: 'Gerar texto com IA', onAction: openGeminiModal });
        editor.ui.registry.addMenuItem('gerarTextoGemini', { text: 'Gerar Texto com IA', icon: 'sparkles', onAction: openGeminiModal });

        editor.ui.registry.addButton('responderMensagem', { icon: 'reply', tooltip: 'Responder Mensagem', onAction: responderMensagem });
        editor.ui.registry.addMenuItem('responderMensagem', { text: 'Responder Mensagem', icon: 'reply', onAction: responderMensagem }); 

        editor.ui.registry.addButton('inserirAudio', { icon: 'inseriraudio', tooltip: 'Inserir Áudio', onAction: () => openInsertAudioDialog(editor) });
        editor.ui.registry.addMenuItem('inserirAudio', { text: 'Inserir Áudio', icon: 'inseriraudio', onAction: () => openInsertAudioDialog(editor) });

        editor.ui.registry.addButton('inserirData', { icon: 'calendar-days', tooltip: 'Inserir Data', onAction: () => openCalendarDialog(editor) });
        editor.ui.registry.addMenuItem('inserirData', { text: 'Inserir Data', icon: 'calendar-days', onAction: () => openCalendarDialog(editor) });

        editor.ui.registry.addButton('imagemComLink', { icon: 'image', tooltip: 'Inserir imagem com link', onAction: abrirPainelImagemComLink });
        editor.ui.registry.addMenuItem('imagemComLink', { text: 'Inserir imagem com link', icon: 'image', onAction: abrirPainelImagemComLink });

        editor.ui.registry.addButton('novodocumento', { icon: 'new-document', tooltip: 'Novo documento (Alt+N)', onAction: novodocumento });
        editor.ui.registry.addMenuItem('novodocumento', { text: 'Novo documento', icon: 'new-document', shortcut: 'Alt+N', onAction: novodocumento });
        
        editor.ui.registry.addButton('savehtml', { icon: 'save', tooltip: 'Salvar HTML (Ctrl+S)', onAction: () => salvarComoHTML(editor) });
        editor.ui.registry.addMenuItem('savehtml', { text: 'Salvar HTML', icon: 'save', shortcut: 'Ctrl+S', onAction: () => salvarComoHTML(editor) });
        
        editor.ui.registry.addButton('copyhtml', { icon: 'copy', tooltip: 'Copiar HTML (Ctrl+Shift+C)', onAction: () => copiarHTML(editor) });
        editor.ui.registry.addMenuItem('copyhtml', { text: 'Copiar HTML', icon: 'copy', shortcut: 'Ctrl+Shift+C', onAction: () => copiarHTML(editor) });

        editor.ui.registry.addButton('formatarTelefone', { icon: 'fone', tooltip: 'Formatar Telefone', onAction: () => ExibirFormatarTelefone() });
        editor.ui.registry.addMenuItem('formatarTelefone', { text: 'Formatar Telefone',icon: 'fone', onAction: () => ExibirFormatarTelefone() });

        editor.ui.registry.addButton('topicoTarefa', { icon: 'topicotarefa', tooltip: 'Tópico Tarefa', onAction: () => ExibirTopicoTarefa() });
        editor.ui.registry.addMenuItem('topicoTarefa', { text: 'Tópico Tarefa', icon: 'topicotarefa', onAction: () => ExibirTopicoTarefa() });

        editor.ui.registry.addButton('topicoOS', { icon: 'topicoos', tooltip: 'Tópico OS', onAction: () => ExibirTopicoOS() });
        editor.ui.registry.addMenuItem('topicoOS', { text: 'Tópico OS', icon: 'topicoos', onAction: () => ExibirTopicoOS() });

        editor.ui.registry.addButton("insertCalendarDate", { icon: "calendar-days", tooltip: "Inserir data formatada", onAction: () => openCalendarDialog(editor) });
        editor.ui.registry.addMenuItem('insertCalendarDate', { text: "Data Formatada", icon: "calendar-days", onAction: () => openCalendarDialog(editor) });

        editor.ui.registry.addButton('linkOS', { icon: 'linkos', tooltip: 'Inserir Link OS', onAction: () => openLinkOSDialog(editor) });        
        editor.ui.registry.addMenuItem('linkOS', { text: 'Link de OS...', icon: 'linkos', onAction: () => openLinkOSDialog(editor) });

        editor.ui.registry.addButton('linkTarefa', { icon: 'linktarefa', tooltip: 'Inserir Link Tarefa', onAction: () => openLinkTarefaDialog(editor) });
        editor.ui.registry.addMenuItem('linkTarefa', { text: 'Link de Tarefa...', icon: 'linktarefa', onAction: () => openLinkTarefaDialog(editor) });
        
        // Menu e botão suspenso para Maiúsculas/Minúsculas
        editor.ui.registry.addNestedMenuItem('upperCaselowerCaseMenu', {
            text: 'Maiúsculas/Minúsculas',
            icon: 'upperlowercase',
            getSubmenuItems: () => [
                { type: 'menuitem', text: 'Tudo Maiúsculo', icon: 'uppercase', onAction: () => FormatarUpperCase(editor) },
                { type: 'menuitem', text: 'Tudo Minúsculo', icon: 'lowercase', onAction: () => FormatarLowerCase(editor) }
            ]
        });
        editor.ui.registry.addMenuButton('upperCaselowerCase', {
            icon: 'upperlowercase',
            tooltip: 'Maiúsculas/Minúsculas',
            fetch: function (callback) {
                var items = [
                    { type: 'menuitem', text: 'Tudo Maiúsculo', icon: 'uppercase', onAction: () => FormatarUpperCase(editor) },
                    { type: 'menuitem', text: 'Tudo Minúsculo', icon: 'lowercase', onAction: () => FormatarLowerCase(editor) }
                ];
                callback(items);
            }
        });

        // Botão de formatação monoespaçada personalizada
        editor.ui.registry.addButton('togglecodeformat', {
            icon: 'sourcecode',
            tooltip: 'Monoespaçado',
            onAction: () => editor.execCommand('mceToggleFormat', false, 'code'),
            onSetup: function (api) {
                const unbind = editor.formatter.formatChanged('code', (state) => {
                    api.setActive(state);
                });
                return unbind;
            }
        });

        editor.ui.registry.addNestedMenuItem('melhorarTextoIAMenu', {
            text: 'Editar com IA',
            icon: 'edit-sparkles',
            getSubmenuItems: () => [
                { type: 'menuitem', text: 'Melhorar Escrita', onAction: () => melhorarTextoComIA('melhorar', editor) },
                { type: 'menuitem', text: 'Corrigir Gramática', onAction: () => melhorarTextoComIA('corrigir', editor) },
                { type: 'menuitem', text: 'Tornar mais Curto', onAction: () => melhorarTextoComIA('encurtar', editor) },
                { type: 'menuitem', text: 'Tornar mais Longo', onAction: () => melhorarTextoComIA('expandir', editor) }
            ]
        });

        editor.ui.registry.addMenuButton('melhorarTextoIA', {
            icon: 'edit-sparkles',
            tooltip: 'Editar com IA',
            fetch: (callback) => {
                const items = [
                    { type: 'menuitem', text: 'Melhorar Escrita', onAction: () => melhorarTextoComIA('melhorar', editor) },
                    { type: 'menuitem', text: 'Corrigir Gramática', onAction: () => melhorarTextoComIA('corrigir', editor) },
                    { type: 'menuitem', text: 'Tornar mais Curto', onAction: () => melhorarTextoComIA('encurtar', editor) },
                    { type: 'menuitem', text: 'Tornar mais Longo', onAction: () => melhorarTextoComIA('expandir', editor) }
                ];
                callback(items);
            }
        });

// ===================================================================================
// == ATALHOS E EVENTOS ==============================================================
// ===================================================================================

        editor.addShortcut('ctrl+s', 'Salvar HTML', () => salvarComoHTML(editor));
        editor.addShortcut('ctrl+shift+c', 'Copiar HTML', () => copiarHTML(editor));
        editor.addShortcut('alt+n', 'Novo documento', () => editor.ui.registry.getAll().buttons.novodocumento.onAction());

        let timeoutId;
        const salvarTextoComoLocalStorage = () => {
            localStorage.setItem('textoSalvo', editor.getContent());
        };
        const carregarTextoDoLocalStorage = () => {
            const textoSalvo = localStorage.getItem('textoSalvo');
            if (textoSalvo) {
                editor.setContent(textoSalvo);
            }
        };
        const iniciarTemporizador = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(salvarTextoComoLocalStorage, 3000);
        };

        editor.on('init', carregarTextoDoLocalStorage);
        editor.on('input', iniciarTemporizador);
    }
});

// ===================================================================================
// == FUNÇÕES GLOBAIS ================================================================
// ===================================================================================

 function SomenteNumeros(texto) {
            return /^\d+$/.test(texto);
        }

function InserirLinkOS (nOS) {
    return `<a href="https://app.pipefy.com/pipes/1576343301#cards/${nOS}" target="_blank" rel="noopener">OS ${nOS}</a>`;
}

function confirmacao(titulo, mensagem, callbackConfirm, callbackCancel) {
    Swal.fire({
        title: titulo,
        text: mensagem,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "OK",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            if (callbackConfirm) callbackConfirm();
        } else {
            if (callbackCancel) callbackCancel();
        }
    });
}