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
        insert: { title: 'Inserir', items: 'hr | image imagemComLink link media inseriraudio emoticons charmap | insertdatetime | codesample' },
        format: { 
            title: 'Formatar', 
            items: 'bold italic underline strikethrough superscript subscript codeformat blockformats align lineheight forecolor backcolor removeformat blockquote' 
        },
        tools: { 
            title: 'Ferramentas', 
            items: 'spellchecker charmap emoticons | formatarTelefone topicoTarefa topicoOS | gerarTextoGemini' 
        },
        table: { title: 'Tabela', items: 'inserttable | cell row column | deletetable' },
        help: { title: 'Ajuda', items: 'help' }
    },
    toolbar: 'undo redo | novodocumento copyhtml savehtml | blocks fontfamily fontsize forecolor backcolor bold italic underline strikethrough blockquote removeformat | align lineheight numlist bullist indent outdent hr | link imagemComLink inseriraudio codesample | formatarTelefone topicoTarefa topicoOS | gerarTextoGemini | code fullscreen preview',
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
    content_style: "body { line-height: 1.4; font-size: 10pt; }",
    quickbars_insert_toolbar: false,
    quickbars_selection_toolbar: 'bold italic underline | forecolor backcolor | quicklink blockquote',
    quickbars_image_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | imageoptions',
    forced_root_block: '', // Alterado para string vazia para um comportamento mais flexível
    setup: function (editor) {
        editor.on('contextmenu', function (event) {
            if (event.ctrlKey) {
                return;
            }
            event.preventDefault();
            editor.execCommand('mceContextMenu', false);
        });

        // Ícones personalizados
        editor.ui.registry.addIcon('sparkles', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.25L13.06 5.69L16.5 6.75L13.06 7.81L12 11.25L10.94 7.81L7.5 6.75L10.94 5.69L12 2.25ZM6 9L7.06 12.44L10.5 13.5L7.06 14.56L6 18L4.94 14.56L1.5 13.5L4.94 12.44L6 9ZM18 12L16.94 15.44L13.5 16.5L16.94 17.56L18 21L19.06 17.56L22.5 16.5L19.06 15.44L18 12Z" fill="currentColor"/></svg>');
        editor.ui.registry.addIcon('fone', '<i class="fa-solid fa-phone fa-lg"></i>');
        editor.ui.registry.addIcon('topicotarefa', '<i class="fa-solid fa-message fa-lg"></i>');
        editor.ui.registry.addIcon('topicoos', '<i class="fa-solid fa-headset fa-lg"></i>');

        // 1. Função para abrir o modal e lidar com a geração de texto usando Gemini AI.
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

        // 2. O botão da barra de ferramentas chama a MESMA função, garantindo consistência.
        editor.ui.registry.addButton('gerarTextoGemini', {
            icon: 'sparkles',
            tooltip: 'Gerar texto com IA',
            onAction: openGeminiModal
        });
        
        // 3. O item de menu também chama a MESMA função.
        editor.ui.registry.addMenuItem('gerarTextoGemini', {
            text: 'Gerar Texto com IA',
            icon: 'sparkles',
            onAction: openGeminiModal
        });

        editor.ui.registry.addButton('imagemComLink', {
            icon: 'image',
            tooltip: 'Inserir imagem com link',
            onAction: function () {
                function abrirPainelImagemComLink(imgUrl = '', descrImagem = '') {
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
                }
                abrirPainelImagemComLink();
            }
        });

        editor.ui.registry.addButton('novodocumento', {
            icon: 'new-document',
            tooltip: 'Novo documento (Alt+N)',
            onAction: function () {
                confirmacao("Limpar Editor?", "Todo o conteúdo não salvo será perdido.", () => editor.setContent(''));
            }
        });
        editor.ui.registry.addMenuItem('novodocumento', {
            text: 'Novo documento',
            icon: 'new-document',
            shortcut: 'Alt+N',
            onAction: () => editor.ui.registry.getAll().buttons.novodocumento.onAction()
        });
        
        editor.ui.registry.addButton('savehtml', {
            icon: 'save',
            tooltip: 'Salvar HTML (Ctrl+S)',
            onAction: () => salvarComoHTML(editor)
        });
        editor.ui.registry.addMenuItem('savehtml', {
            text: 'Salvar HTML',
            icon: 'save',
            shortcut: 'Ctrl+S',
            onAction: () => salvarComoHTML(editor)
        });
        
        editor.ui.registry.addButton('copyhtml', {
            icon: 'copy',
            tooltip: 'Copiar HTML (Ctrl+Shift+C)',
            onAction: () => copiarHTML(editor)
        });
        editor.ui.registry.addMenuItem('copyhtml', {
            text: 'Copiar HTML',
            icon: 'copy',
            shortcut: 'Ctrl+Shift+C',
            onAction: () => copiarHTML(editor)
        });

        editor.ui.registry.addButton('formatarTelefone', {
            icon: 'fone', // Ícone personalizado
            tooltip: 'Formatar Telefone',
            onAction: () => ExibirFormatarTelefone()
        });
        editor.ui.registry.addMenuItem('formatarTelefone', {
            text: 'Formatar Telefone',
            icon: 'fone', // Ícone personalizado
            onAction: () => ExibirFormatarTelefone()
        });

        editor.ui.registry.addButton('topicoTarefa', {
            icon: 'topicotarefa', // Ícone personalizado
            tooltip: 'Tópico Tarefa',
            onAction: () => ExibirTopicoTarefa()
        });
        editor.ui.registry.addMenuItem('topicoTarefa', {
            text: 'Tópico Tarefa',
            icon: 'topicotarefa', // Ícone personalizado
            onAction: () => ExibirTopicoTarefa()
        });

        editor.ui.registry.addButton('topicoOS', {
            icon: 'topicoos', // Ícone personalizado
            tooltip: 'Tópico OS',
            onAction: () => ExibirTopicoOS()
        });
        editor.ui.registry.addMenuItem('topicoOS', {
            text: 'Tópico OS',
            icon: 'topicoos', // Ícone personalizado
            onAction: () => ExibirTopicoOS()
        });
        
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

