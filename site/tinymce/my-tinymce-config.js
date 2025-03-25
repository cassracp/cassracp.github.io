tinymce.init({
    selector: 'textarea',
    language_url: 'my_tinymce_app/langs/pt_BR.js',
    language: 'pt_BR',
    plugins: [
        // Core editing features
        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'autolink', 'lists', 'advlist', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
        // Other features
        'code', 'codesample', 'insertdatetime','help', 'quickbars',
        // Non-standard features
        'visualchars', 'accordion', 'fullscreen', 'preview'
    ],
    codesample_languages: [
        {text: 'SQL', value: 'sqlcode'},
        {text: 'HTML/XML', value: 'markup'},
        {text: 'JavaScript', value: 'javascript'},
        {text: 'Python', value: 'python'},
        {text: 'Java', value: 'java'},
        {text: 'C#', value: 'csharp'}
    ],
    menu: {
        file: { title: 'Arquivo', items: 'novodocumento copyhtml savehtml | print' }, // Certifique-se de que todos os itens estão listados aqui
        insert: { title: 'Inserir', items: 'hr | image imagemComLink link linkOS linkTarefa media inseriraudio emoticons charmap | insertCalendarDate insertdatetime | codesample' },
        format: { 
            title: 'Formatar', 
            items: 'bold italic underline strikethrough upperCaselowerCase superscript subscript codeformat blockformats align lineheight forecolor backcolor removeformat blockquote ' 
        },
        tools: { 
            title: 'Ferramentas', 
            items: 'spellchecker charmap emoticons layer | formatarTelefone topicoTarefa topicoOS' 
        },
    },
    toolbar: 'undo redo | novodocumento copyhtml savehtml | blocks fontfamily fontsize forecolor backcolor bold italic underline strikethrough upperCaselowerCase blockquote removeformat align lineheight numlist bullist indent outdent hr accordion link linkOS linkTarefa imagemComLink inseriraudio codesample | formatarTelefone topicoTarefa topicoOS | code | mybutton',
    insertdatetime_timeformat: '%H:%M:%Sh',
    insertdatetime_formats: ['%d/%m/%Y', '%d-%m-%Y', '%d/%m/%Y às %H:%Mh', '%d-%m-%Y às %H:%Mh', '%H:%Mh (Brasília, GMT -03:00)'],
    browser_spellcheck: true, // Habilita o corretor do navegador
    contextmenu: "bold italic underline forecolor | lists configurepermanentpen | link openlink unlink | insertdatetime | imagemComLink editimage | table",
    link_default_target: '_blank',
    lineheight_formats: '1 1.2 1.4 1.5 1.6 1.8 2 2.5 3',
    content_style: "body { line-height: 1.4; font-size: 10pt }",
    quickbars_insert_toolbar: false,
    quickbars_selection_toolbar: 'bold italic underline forecolor backcolor upperCaselowerCase removeformat quicklink blockquote indent outdent',
    quickbars_image_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | imageoptions',
    forced_root_block: null,
    setup: function (editor) {
        editor.on('contextmenu', function (event) {
            if (event.ctrlKey) {
                // Se o usuário segurar CTRL, exibe o menu do navegador
                return;
            }
            // Caso contrário, permite o menu do TinyMCE
            event.preventDefault();
            editor.execCommand('mceContextMenu', false);
        });

        editor.on('init', function () {
            Prism.highlightAll(); // Reaplica o realce ao carregar o editor
        });

        editor.ui.registry.addButton('imagemComLink', {
            icon: 'linkImage',
            tooltip: 'Inserir imagem com link',
            onAction: function () {
                function abrirPainelImagemComLink(imgUrl = '', descrImagem = '') {
                    editor.windowManager.open({
                        title: 'Inserir Imagem com Link',
                        body: {
                            type: 'panel',
                            items: [
                                {
                                    type: 'input',
                                    name: 'imgUrl',
                                    label: 'URL da Imagem',
                                    placeholder: 'https://exemplo.com/imagem.jpg',
                                    value: imgUrl
                                },
                                {
                                    type: 'input',
                                    name: 'descr',
                                    label: 'Descrição da Imagem',
                                    placeholder: 'Imagem de exemplo',
                                    value: descrImagem
                                }
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
                            var html;
        
                            // Validação básica
                            if (!imgUrl) {
                                dialog.close();
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Erro',
                                    text: 'Preencha a URL da Imagem!',
                                }).then(() => {
                                    abrirPainelImagemComLink(imgUrl, descrImagem); // Reabre com os valores preenchidos
                                });
                                return;
                            }
        
                            // Criação do HTML
                            if (!descrImagem) {
                                html = `<a href="${imgUrl}" target="_blank" rel="noopener"><img src="${imgUrl}" style="max-width: 100%; height: auto;" /></a>`;
                            } else {
                                html = `<a href="${imgUrl}" target="_blank" rel="noopener"><img src="${imgUrl}" style="max-width: 100%; height: auto;" alt="${descrImagem}" title="${descrImagem}"></a><br><small><font color="gray">(${descrImagem})</font></small>`;
                            }
        
                            // Inserir no corpo do editor
                            editor.insertContent(html);
        
                            // Fechar o painel
                            dialog.close();
                        }
                    });
                }
        
                // Abrir painel inicialmente
                abrirPainelImagemComLink();
            }
        });
        

        editor.ui.registry.addNestedMenuItem('upperCaselowerCase', {
            text: 'Transformar Maisculas/Minusculas',
            icon: 'upperlowercase',
            getSubmenuItems: () => [{
                type: 'menuitem',
                text: 'Tudo Maiúsculo',
                icon: 'uppercase',
                onAction: () => FormatarUpperCase(editor)
            },
            {
                type: 'menuitem',
                text: 'Tudo Minúsculo',
                icon: 'lowercase',
                onAction: () => FormatarLowerCase(editor)
            }]
        });

        //#region Icones
        editor.ui.registry.addIcon('custom-audio', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="size-6"><path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" /><path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" /></svg>');
        
        editor.ui.registry.addIcon('linkImage', '<i class="fa-solid fa-paperclip"></i>');

        editor.ui.registry.addIcon('uppercase', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 9L9 4M9 9L6.5 7M9 9L11.5 7" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.5861 19.1946C10.5203 18.9868 10.3274 18.8455 10.1094 18.8455H7.55474C7.33675 18.8455 7.14388 18.9868 7.07807 19.1946L6.65978 20.5154C6.59397 20.7233 6.4011 20.8645 6.18311 20.8645H4.72359C4.37391 20.8645 4.13223 20.5148 4.2559 20.1877L7.60741 11.3232C7.68095 11.1287 7.86717 11 8.0751 11H9.58987C9.7974 11 9.98336 11.1282 10.0572 11.3222L13.4308 20.1867C13.5553 20.5139 13.3136 20.8645 12.9635 20.8645H11.4811C11.2631 20.8645 11.0702 20.7233 11.0044 20.5154L10.5861 19.1946ZM7.79577 16.9252C7.75489 17.0541 7.85115 17.1856 7.98642 17.1856H9.66955C9.80482 17.1856 9.90108 17.0541 9.8602 16.9252L9.01863 14.2707C8.95964 14.0846 8.69633 14.0846 8.63734 14.2707L7.79577 16.9252Z" fill="#000000"></path> <path d="M18.1268 20.8645C18.0402 20.8645 17.9763 20.8529 17.9413 20.7736C17.8621 20.5943 17.6066 20.4922 17.4472 20.6064C17.0811 20.8688 16.6326 21 16.1016 21C15.3584 21 14.7409 20.7967 14.2491 20.3902C13.7628 19.9837 13.5196 19.4575 13.5196 18.8117C13.5196 18.0438 13.8147 17.4499 14.4048 17.0298C15.0005 16.6098 15.8557 16.3952 16.9705 16.3862H17.1754C17.4516 16.3862 17.6754 16.1623 17.6754 15.8862V15.7967C17.6754 15.467 17.6071 15.2344 17.4705 15.0989C17.3339 14.9634 17.1344 14.8957 16.8721 14.8957C16.4947 14.8957 16.2402 15.0146 16.1087 15.2523C15.9751 15.494 15.7794 15.7358 15.5032 15.7358H14.1835C13.9074 15.7358 13.6755 15.5083 13.7433 15.2406C13.8596 14.7814 14.1457 14.3887 14.6016 14.0623C15.2191 13.6197 15.9978 13.3984 16.9377 13.3984C17.9104 13.3984 18.6618 13.6084 19.1918 14.0285C19.7274 14.444 19.9951 15.0402 19.9951 15.8171V19.2656C20.0061 19.8979 19.9951 20.3651 19.9951 20.7493C19.9951 20.8129 19.9436 20.8645 19.88 20.8645H18.1268ZM16.618 19.4959C16.8748 19.4959 17.0934 19.453 17.2738 19.3672C17.389 19.3124 17.4853 19.251 17.5626 19.1833C17.6435 19.1124 17.6754 19.0042 17.6754 18.8966V18.0379C17.6754 17.7618 17.4516 17.5379 17.1754 17.5379H17.118C16.7246 17.5379 16.4131 17.6418 16.1836 17.8496C15.9595 18.0574 15.8475 18.3351 15.8475 18.6829C15.8475 19.2249 16.1043 19.4959 16.618 19.4959Z" fill="#000000"></path> </g></svg>');
        editor.ui.registry.addIcon('lowercase', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M17 9L17 4M17 9L14.5 7M17 9L19.5 7" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.5861 19.1946C10.5203 18.9868 10.3274 18.8455 10.1094 18.8455H7.55474C7.33675 18.8455 7.14388 18.9868 7.07807 19.1946L6.65978 20.5154C6.59397 20.7233 6.4011 20.8645 6.18311 20.8645H4.72359C4.37391 20.8645 4.13223 20.5148 4.2559 20.1877L7.60741 11.3232C7.68095 11.1287 7.86717 11 8.0751 11H9.58987C9.7974 11 9.98336 11.1282 10.0572 11.3222L13.4308 20.1867C13.5553 20.5139 13.3136 20.8645 12.9635 20.8645H11.4811C11.2631 20.8645 11.0702 20.7233 11.0044 20.5154L10.5861 19.1946ZM7.79577 16.9252C7.75489 17.0541 7.85115 17.1856 7.98642 17.1856H9.66955C9.80482 17.1856 9.90108 17.0541 9.8602 16.9252L9.01863 14.2707C8.95964 14.0846 8.69633 14.0846 8.63734 14.2707L7.79577 16.9252Z" fill="#000000"></path> <path d="M18.1268 20.8645C18.0402 20.8645 17.9763 20.8529 17.9413 20.7736C17.8621 20.5943 17.6066 20.4922 17.4472 20.6064C17.0811 20.8688 16.6326 21 16.1016 21C15.3584 21 14.7409 20.7967 14.2491 20.3902C13.7628 19.9837 13.5196 19.4575 13.5196 18.8117C13.5196 18.0438 13.8147 17.4499 14.4048 17.0298C15.0005 16.6098 15.8557 16.3952 16.9705 16.3862H17.1754C17.4516 16.3862 17.6754 16.1623 17.6754 15.8862V15.7967C17.6754 15.467 17.6071 15.2344 17.4705 15.0989C17.3339 14.9634 17.1344 14.8957 16.8721 14.8957C16.4947 14.8957 16.2402 15.0146 16.1087 15.2523C15.9751 15.494 15.7794 15.7358 15.5032 15.7358H14.1835C13.9074 15.7358 13.6755 15.5083 13.7433 15.2406C13.8596 14.7814 14.1457 14.3887 14.6016 14.0623C15.2191 13.6197 15.9978 13.3984 16.9377 13.3984C17.9104 13.3984 18.6618 13.6084 19.1918 14.0285C19.7274 14.444 19.9951 15.0402 19.9951 15.8171V19.2656C20.0061 19.8979 19.9951 20.3651 19.9951 20.7493C19.9951 20.8129 19.9436 20.8645 19.88 20.8645H18.1268ZM16.618 19.4959C16.8748 19.4959 17.0934 19.453 17.2738 19.3672C17.389 19.3124 17.4853 19.251 17.5626 19.1833C17.6435 19.1124 17.6754 19.0042 17.6754 18.8966V18.0379C17.6754 17.7618 17.4516 17.5379 17.1754 17.5379H17.118C16.7246 17.5379 16.4131 17.6418 16.1836 17.8496C15.9595 18.0574 15.8475 18.3351 15.8475 18.6829C15.8475 19.2249 16.1043 19.4959 16.618 19.4959Z" fill="#000000"></path> </g></svg>');
        editor.ui.registry.addIcon('upperlowercase', '<svg width="25px" height="25px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.495 9.052l.891 2.35h1.091L6.237 3h-1.02L2 11.402h1.095l.838-2.35h3.562zM5.811 4.453l.044.135 1.318 3.574H4.255l1.307-3.574.044-.135.038-.156.032-.152.021-.126h.023l.024.126.029.152.038.156zm7.984 6.011v.936h.96V7.498c0-.719-.18-1.272-.539-1.661-.359-.389-.889-.583-1.588-.583-.199 0-.401.019-.606.056a4.875 4.875 0 0 0-1.078.326 2.081 2.081 0 0 0-.343.188v.984c.266-.23.566-.411.904-.54a2.927 2.927 0 0 1 1.052-.193c.188 0 .358.028.513.085a.98.98 0 0 1 .396.267c.109.121.193.279.252.472.059.193.088.427.088.7l-1.811.252c-.344.047-.64.126-.888.237a1.947 1.947 0 0 0-.615.419 1.6 1.6 0 0 0-.36.58 2.134 2.134 0 0 0-.117.721c0 .246.042.475.124.688.082.213.203.397.363.551.16.154.36.276.598.366.238.09.513.135.826.135.402 0 .76-.092 1.075-.278.315-.186.572-.454.771-.806h.023zm-2.128-1.743c.176-.064.401-.114.674-.149l1.465-.205v.609c0 .246-.041.475-.123.688a1.727 1.727 0 0 1-.343.557 1.573 1.573 0 0 1-.524.372 1.63 1.63 0 0 1-.668.135c-.187 0-.353-.025-.495-.076a1.03 1.03 0 0 1-.357-.211.896.896 0 0 1-.22-.316A1.005 1.005 0 0 1 11 9.732a1.6 1.6 0 0 1 .055-.44.739.739 0 0 1 .202-.334 1.16 1.16 0 0 1 .41-.237z"></path></g></svg>');

        editor.ui.registry.addIcon('calendar-days', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"  class="size-6"><path d="M12 11.993a.75.75 0 0 0-.75.75v.006c0 .414.336.75.75.75h.006a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75H12ZM12 16.494a.75.75 0 0 0-.75.75v.005c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H12ZM8.999 17.244a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.006ZM7.499 16.494a.75.75 0 0 0-.75.75v.005c0 .414.336.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H7.5ZM13.499 14.997a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.005a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.005ZM14.25 16.494a.75.75 0 0 0-.75.75v.006c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75h-.005ZM15.75 14.995a.75.75 0 0 1 .75-.75h.005a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75H16.5a.75.75 0 0 1-.75-.75v-.006ZM13.498 12.743a.75.75 0 0 1 .75-.75h2.25a.75.75 0 1 1 0 1.5h-2.25a.75.75 0 0 1-.75-.75ZM6.748 14.993a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" /><path fill-rule="evenodd" d="M18 2.993a.75.75 0 0 0-1.5 0v1.5h-9V2.994a.75.75 0 1 0-1.5 0v1.497h-.752a3 3 0 0 0-3 3v11.252a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3V7.492a3 3 0 0 0-3-3H18V2.993ZM3.748 18.743v-7.5a1.5 1.5 0 0 1 1.5-1.5h13.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-13.5a1.5 1.5 0 0 1-1.5-1.5Z" clip-rule="evenodd" /></svg>');

        editor.ui.registry.addIcon('quote', 
            '<i class="fa-solid fa-quote-right fa-lg"></i>'); // quote
        editor.ui.registry.addIcon('fone', 
            '<i class="fa-solid fa-phone fa-lg"></i>'); // fone
        editor.ui.registry.addIcon('topicotarefa', 
            '<i class="fa-solid fa-message fa-lg"></i>') // topicotarefa
        editor.ui.registry.addIcon('topicoos', 
            '<i class="fa-solid fa-headset fa-lg"></i></i>') // topicoos
        editor.ui.registry.addIcon('novodocumento', 
            '<i class="fa-regular fa-file fa-lg"></i>'); // novodocumento
        editor.ui.registry.addIcon('linkos', 
            '<i class="fa-solid fa-arrow-up-right-from-square"></i>'); // link OS
        editor.ui.registry.addIcon('linktarefa', 
            '<i class="fa-solid fa-square-arrow-up-right fa-lg"></i>'); // link Tarefa
       //#endregion

        //#region LinkOS
        editor.ui.registry.addButton('linkOS', {
            icon: 'linkos',
            tooltip: 'Inserir Link OS',
            onAction: function () {
                openLinkOSDialog(editor);
            }
        });
        
        editor.ui.registry.addMenuItem('linkOS', {
            text: 'Link de OS...',
            icon: 'linkos',
            onAction: function () {
                openLinkOSDialog(editor);
            }
        });

        editor.ui.registry.addButton('linkTarefa', {
            icon: 'linktarefa',
            tooltip: 'Inserir Link Tarefa',
            onAction: function () {
                openLinkTarefaDialog(editor);
            }
        });
        editor.ui.registry.addMenuItem('linkTarefa', {
            text: 'Link de Tarefa...',
            icon: 'linktarefa',
            onAction: function () {
                openLinkTarefaDialog(editor);
            }
        });
        //#endregion

        //#region InserirAudio
        editor.ui.registry.addButton('inseriraudio', {
            icon: 'custom-audio', // Usa o ícone SVG personalizado
            tooltip: 'Inserir Audio',
            onAction: function () {
                openInsertAudioDialog(editor);
            }
        });
        editor.ui.registry.addMenuItem('inseriraudio', {
            text: 'Audio...',
            icon: 'custom-audio',
            onAction: function () {
                editor.windowManager.open({
                    title: 'Inserir Audio',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'input',
                                name: 'audioUrl',
                                label: 'URL do Audio'
                            }
                        ]
                    },
                    buttons: [
                        {
                            text: 'Cancelar',
                            type: 'cancel'
                        },
                        {
                            text: 'Salvar',
                            type: 'submit',
                            primary: true,
                            focus: true
                        }
                    ],
                    onSubmit: function (dialog) {
                        var data = dialog.getData();
                        var url = data.audioUrl;
                        if (url) {
                            var audioHtml = FormatarAudio(url);
                            editor.insertContent(audioHtml);
                        }
                        dialog.close();
                    }
                });
            }
        });
        //#endregion

        editor.ui.registry.addButton('novodocumento', {
            icon: 'novodocumento',
            tooltip: 'Novo documento',
            onAction: function () {
                confirmacao("Limpar Editor?",
                    "Tem certeza de que deseja criar um novo documento?\nTodo o conteúdo não salvo será perdido.",
                    function () {
                        editor.setContent('');
                });
            }
        });
        editor.ui.registry.addMenuItem('novodocumento', {
            text: 'Novo documento',
            icon: 'novodocumento',
            shortcut: 'Alt+N',
            onAction: function () {
                confirmacao("Limpar Editor?",
                    "Tem certeza de que deseja criar um novo documento?\nTodo o conteúdo não salvo será perdido.",
                    function () {
                        editor.setContent('');
                });
            }
        });

        editor.ui.registry.addButton('savehtml', {
            icon: 'save',
            tooltip: 'Salvar HTML',
            onAction: function () {
                salvarComoHTML(editor);
            }
        });
        editor.ui.registry.addMenuItem('savehtml', {
            text: 'Salvar HTML',
            icon: 'save',
            shortcut: 'Ctrl+S',
            onAction: function () {
                salvarComoHTML(editor);
            }
        });


        editor.ui.registry.addButton('copyhtml', {
            icon: 'copy',
            tooltip: 'Copiar HTML',
            onAction: function () {
                copiarHTML(editor);
            }
        });
        editor.ui.registry.addMenuItem('copyhtml', {
            text: 'Copiar HTML',
            icon: 'copy',
            shortcut: 'Ctrl+Shift+C',
            onAction: function () {
                copiarHTML(editor);
            }
        });
        editor.ui.registry.addButton('blockquote', {
            icon: 'quote',
            tooltip: 'Citação',
            onAction: function () {
                editor.execCommand('mceBlockQuote');
            }
        });
        editor.ui.registry.addMenuItem('blockquote', {
            icon: 'quote',
            text: 'Citação',
            onAction: function () {
                editor.execCommand('mceBlockQuote');
            }
        });
        editor.ui.registry.addButton('uppercase', {
            icon: 'uppercase', // Usa o ícone SVG personalizado
            tooltip: 'Transformar texto em maiúsculas',
            onAction: function () {
                FormatarUpperCase(editor);
            }
        });
        editor.ui.registry.addButton('lowercase', {
            icon: 'lowercase', // Usa o ícone SVG personalizado
            tooltip: 'Transformar Maisculas/Minusculas',
            onAction: function () {
                FormatarLowerCase(editor);
            }
        });
        editor.ui.registry.addMenuItem('uppercase', {
            text: 'Maiúsculas',
            icon: 'uppercase', // Usa o ícone SVG personalizado
            onAction: function () {
                FormatarUpperCase(editor);
            }
        });
        editor.ui.registry.addMenuItem('lowercase', {
            text: 'Minúsculas',
            icon: 'lowercase', // Usa o ícone SVG personalizado
            onAction: function () {
                FormatarLowerCase(editor);
            }
        });

        editor.ui.registry.addButton('formatarTelefone', {
            //text: 'Formatar Telefone',
            icon: 'fone',
            onAction: function () {
                editor.windowManager.openUrl({
                    title: 'Formatar Telefone',
                    icon: 'fone',
                    url: '/site/numertel.html',
                    width: 800,
                    height: 450
                });
            }
        });
        editor.ui.registry.addMenuItem('formatarTelefone', {
            text: 'Formatar Telefone',
            icon: 'fone',
            onAction: function () {
                editor.windowManager.openUrl({
                    title: 'Formatar Telefone',
                    url: '/site/numertel.html',
                    width: 800,
                    height: 450
                });
            }
        });

        editor.ui.registry.addButton('topicoTarefa', {
            //text: 'Tópico Tarefa',
            icon: 'topicotarefa',
            onAction: function () {
                editor.windowManager.openUrl({
                    title: 'Tópico Tarefa',
                    icon: 'topicotarefa',
                    url: '/site/topicotarefa.html',
                    width: 600,
                    height: 600
                });
            }
        });
        editor.ui.registry.addMenuItem('topicoTarefa', {
            text: 'Tópico Tarefa',
            icon: 'topicotarefa',
            onAction: function () {
                editor.windowManager.openUrl({
                    title: 'Tópico Tarefa',
                    url: '/site/topicotarefa.html',
                    width: 600,
                    height: 600,
                    scrollable: true
                });
            }
        });

        editor.ui.registry.addButton('topicoOS', {
            //text: 'Tópico OS',
            icon: 'topicoos',
            onAction: function () {
                editor.windowManager.openUrl({
                    title: 'Tópico OS',
                    url: '/site/topicoos.html',
                    width: 1200,
                    height: 800,
                    scrollbars: true
                });
            }
        });
        editor.ui.registry.addMenuItem('topicoOS', {
            text: 'Tópico OS',
            icon: 'topicoos',
            onAction: function () {
                editor.windowManager.openUrl({
                    title: 'Tópico OS',
                    url: '/site/topicoos.html',
                    width: 1200,
                    height: 800,
                    scrollbars: true
                });
            }
        });

        /*editor.ui.registry.addButton('insertdatetime', {
            icon: 'insertdatetime',
            tooltip: 'Inserir Data/Hora',
            onAction: function () {
                editor.windowManager.open({
                    title: 'Inserir Data/Hora',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'selectbox',
                                name: 'datetimeFormat',
                                label: 'Formato',
                                items: [
                                    { text: 'dd/mm/yyyy', value: 'dd/mm/yyyy' },
                                    { text: 'mm/dd/yyyy', value: 'mm/dd/yyyy' },
                                    { text: 'yyyy-mm-dd', value: 'yyyy-mm-dd' },
                                    { text: 'dd de mês de yyyy', value: 'dd de mês de yyyy' }
                                ]
                            },
                            {
                                type: 'input',
                                name: 'customDatetime',
                                label: 'Data/Hora Personalizada',
                                placeholder: 'Ex: 25/12/2023 14:30'
                            }
                        ]
                    },
                    buttons: [
                        {
                            text: 'Cancelar',
                            type: 'cancel'
                        },
                        {
                            text: 'Salvar',
                            type: 'submit',
                            primary: true,
                            focus: true
                        }
                    ],
                    onSubmit: function (dialog) {
                        var data = dialog.getData();
                        var format = data.datetimeFormat;
                        var customDatetime = data.customDatetime;
                        var datetimeContent = '';

                        if (customDatetime) {
                            datetimeContent = customDatetime;
                        } else {
                            var now = new Date();
                            switch (format) {
                                case 'dd/mm/yyyy':
                                    datetimeContent = now.toLocaleDateString('pt-BR');
                                    break;
                                case 'mm/dd/yyyy':
                                    datetimeContent = now.toLocaleDateString('en-US');
                                    break;
                                case 'yyyy-mm-dd':
                                    datetimeContent = now.toISOString().split('T')[0];
                                    break;
                                case 'dd de mês de yyyy':
                                    datetimeContent = now.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
                                    break;
                            }
                        }

                        editor.insertContent('<p>' + datetimeContent + '</p>');
                        dialog.close();
                    }
                });
            }
        });*/

        /*editor.ui.registry.addMenuItem('insertdatetime', {
            text: 'Inserir Data/Hora',
            icon: 'insertdatetime',
            onAction: function () {
                editor.windowManager.open({
                    title: 'Inserir Data/Hora',
                    body: {
                        type: 'panel',
                        items: [
                            {
                                type: 'selectbox',
                                name: 'datetimeFormat',
                                label: 'Formato',
                                items: [
                                    { text: 'dd/mm/yyyy', value: 'dd/mm/yyyy' },
                                    { text: 'mm/dd/yyyy', value: 'mm/dd/yyyy' },
                                    { text: 'yyyy-mm-dd', value: 'yyyy-mm-dd' },
                                    { text: 'dd de mês de yyyy', value: 'dd de mês de yyyy' }
                                ]
                            },
                            {
                                type: 'input',
                                name: 'customDatetime',
                                label: 'Data/Hora Personalizada',
                                placeholder: 'Ex: 25/12/2023 14:30'
                            }
                        ]
                    },
                    buttons: [
                        {
                            text: 'Cancelar',
                            type: 'cancel'
                        },
                        {
                            text: 'Salvar',
                            type: 'submit',
                            primary: true,
                            focus: true
                        }
                    ],
                    onSubmit: function (dialog) {
                        var data = dialog.getData();
                        var format = data.datetimeFormat;
                        var customDatetime = data.customDatetime;
                        var datetimeContent = '';

                        if (customDatetime) {
                            datetimeContent = customDatetime;
                        } else {
                            var now = new Date();
                            switch (format) {
                                case 'dd/mm/yyyy':
                                    datetimeContent = now.toLocaleDateString('pt-BR');
                                    break;
                                case 'mm/dd/yyyy':
                                    datetimeContent = now.toLocaleDateString('en-US');
                                    break;
                                case 'yyyy-mm-dd':
                                    datetimeContent = now.toISOString().split('T')[0];
                                    break;
                                case 'dd de mês de yyyy':
                                    datetimeContent = now.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
                                    break;
                            }
                        }

                        editor.insertContent('<p>' + datetimeContent + '</p>');
                        dialog.close();
                    }
                });
            }
        });*/

        editor.ui.registry.addMenuItem('insertCalendarDate', {
            text: "Data Formatada",
            icon: "calendar-days",
            onAction: function () {
                const hoje = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD
                editor.windowManager.open({
                    title: "Escolha a Data",
                    body: {
                        type: "panel",
                        items: [
                            {
                                type: "htmlpanel",
                                html: `<label for="datepicker-field">Data:</label>
                                       <input type="date" id="datepicker-field" value="${hoje}" style="width: 100%; padding: 5px; font-size: 14px;" />`
                            }
                        ]
                    },
                    buttons: [
                        {
                            text: 'Cancelar',
                            type: 'cancel'
                        },
                        {
                            text: 'Salvar',
                            type: 'submit',
                            primary: true,
                            focus: true
                        }
                    ],
                    onSubmit: function (dialog) {
                        let dataSelecionada = document.getElementById("datepicker-field").value;
                        if (dataSelecionada) {
                            const data = new Date(dataSelecionada + 'T00:00:00'); // Adiciona a hora para evitar problemas de fuso horário
                            const opcoes = { year: 'numeric', month: 'long', day: 'numeric' };
                            const dataFormatada = data.toLocaleDateString('pt-BR', opcoes); // Formato "dd de mês de ano"
                            editor.insertContent(`<p>${dataFormatada}</p>`);
                        }
                        dialog.close();
                    }
                });
            }
        });

        editor.ui.registry.addButton("insertCalendarDate", {
            icon: "calendar-days",
            tooltip: "Abrir calendário para selecionar uma data",
            onAction: function () {
                const hoje = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD
                editor.windowManager.open({
                    title: "Escolha a Data",
                    body: {
                        type: "panel",
                        items: [
                            {
                                type: "htmlpanel",
                                html: `<label for="datepicker-field">Data:</label>
                                       <input type="date" id="datepicker-field" value="${hoje}" style="width: 100%; padding: 5px; font-size: 14px;" />`
                            }
                        ]
                    },
                    buttons: [
                        {
                            text: 'Cancelar',
                            type: 'cancel'
                        },
                        {
                            text: 'Salvar',
                            type: 'submit',
                            primary: true,
                            focus: true
                        }
                    ],
                    onSubmit: function (dialog) {
                        let dataSelecionada = document.getElementById("datepicker-field").value;
                        if (dataSelecionada) {
                            const data = new Date(dataSelecionada + 'T00:00:00'); // Adiciona a hora para evitar problemas de fuso horário
                            const opcoes = { year: 'numeric', month: 'long', day: 'numeric' };
                            const dataFormatada = data.toLocaleDateString('pt-BR', opcoes); // Formato "dd de mês de ano"
                            editor.insertContent(`<p>${dataFormatada}</p>`);
                        }
                        dialog.close();
                    }
                });
            }
        });
        
        editor.addShortcut('ctrl+s', 'Salvar HTML', function () {
            salvarComoHTML(editor);
        });
        editor.addShortcut('ctrl+shift+c', 'Copiar HTML', function () {
            copiarHTML(editor);
        });
        editor.addShortcut('alt+n', 'Novo documento', function () {
            if (confirm('Tem certeza de que deseja criar um novo documento? Todo o conteúdo não salvo será perdido.')) {
                editor.setContent('');
            }
        });

        // Função para salvar o texto do editor no armazenamento local
        function salvarTextoComoLocalStorage() {
            const texto = editor.getContent();
            localStorage.setItem('textoSalvo', texto);
        }

        // Função para carregar o texto do armazenamento local
        function carregarTextoDoLocalStorage() {
            const textoSalvo = localStorage.getItem('textoSalvo');
            if (textoSalvo) {
                editor.setContent(textoSalvo);
            }
        }

        // Função para iniciar o temporizador após digitar um caractere
        function iniciarTemporizador() {
            clearTimeout(timeoutId); // Limpa o temporizador existente, se houver
            timeoutId = setTimeout(salvarTextoComoLocalStorage, 3000); // Inicia um novo temporizador de 3 segundos
        }

        // Evento de inicialização do editor
        editor.on('init', function () {
            carregarTextoDoLocalStorage(); // Carregar texto ao carregar o editor
        });

        // Evento de teclado para monitorar a digitação
        editor.on('input', function () {
            iniciarTemporizador(); // Chama a função para iniciar o temporizador ao digitar
        });
    }
});

tinymce.PluginManager.add('uppercase', function(editor) {
    editor.on('init', function() {
        editor.formatter.register('uppercase', {
            inline: 'span',
            styles: { 'text-transform': 'uppercase' }
        });
    });
});

tinymce.PluginManager.add('lowercase', function(editor) {
    editor.on('init', function() {
        editor.formatter.register('lowercase', {
            inline: 'span',
            styles: { 'text-transform': 'lowercase' }
        });
    });
});

function salvarComoHTML(editor) {
    var content = editor.getContent();
    var blob = new Blob([content], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'conteudo.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copiarHTML(editor) {
    var content = editor.getContent();

    if (content === '' || content === null) {
        alerta("Erro", 'Nenhum conteúdo HTML para copiar!');
        return;
    }

    navigator.clipboard.writeText(content).then(function() {
    }, function(err) {
        alerta("Erro", 'Erro ao copiar HTML: ', err);
    });
}

function InserirLinkOS(nOS) {
    return `<a href="https://www.sacdemaria.com.br/adm/os/consulta_os.php?id=${nOS}" target="_blank" rel="noopener"><b><u>OS ${nOS}</u></b></a>`;
}

function InserirLinkTarefa(nTarefa) {
    return `<a href="https://www.demaria.com.br/intranet/v3/tarefa/detalhe.php?tarefa_id=${nTarefa}" target="_blank" rel="noopener"><b><u>Tarefa ${nTarefa}</u></b></a>`
}

function FormatarAudio(url) {
    const extensao = extrairExtensao(url).toLowerCase(); // normaliza para minúsculas

    const tipoMIME = {
        mp3: 'audio/mpeg',   // MP3 usa 'audio/mpeg' oficialmente
        ogg: 'audio/ogg',    // Para .ogg e .oga
        opus: 'audio/ogg',   // Opus geralmente é encapsulado em Ogg
        oga: 'audio/ogg',    // Ogg Audio
        wav: 'audio/wav',
        aac: 'audio/aac',
        m4a: 'audio/mp4'
    };

    if (tipoMIME[extensao]) {
        return `<audio controls><source src="${url}" type="${tipoMIME[extensao]}"></audio>`;
    }

    return ""; // ou algum fallback para formatos não suportados
}

// Função auxiliar para extrair extensão mesmo com URLs codificadas
function extrairExtensao(url) {
    try {
        const caminho = new URL(url).pathname; // remove query params e hash
        const nomeArquivo = caminho.split('/').pop(); // pega o último segmento
        const extensao = nomeArquivo.split('.').pop().split(/[?#]/)[0]; // remove parâmetros após a extensão
        return extensao.toLowerCase();
    } catch {
        return url.split('.').pop().split(/[?#]/)[0].toLowerCase();
    }
}

function FormatarUpperCase(editor) {
    const selectedText = editor.selection.getContent({ format: 'text' });
    if (selectedText.length > 0) {
        const textoMaiusculo = selectedText.toUpperCase();
        editor.selection.setContent(textoMaiusculo);
        editor.selection.select(editor.selection.getNode());
    }
}

function FormatarLowerCase(editor) {
    const selectedText = editor.selection.getContent({ format: 'text' });
    if (selectedText.length > 0) {
        const textoMinusculo = selectedText.toLowerCase();
        editor.selection.setContent(textoMinusculo);
        editor.selection.select(editor.selection.getNode());
    }
}

function SomenteNumeros(texto) {
    return /^\d+$/.test(texto);
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

function alerta(titulo, mensagem) {
    Swal.fire({
        title: titulo,
        text: mensagem,
        icon: "error",
        showCancelButton: false,
        confirmButtonText: "OK",
        customClass: {
            popup: 'custom-swall-popup'
        }
    });
}

// Adiciona um estilo personalizado para o SweetAlert
const style = document.createElement('style');
style.innerHTML = `
    .custom-swal-popup {
        z-index: 99999 !important;
    }
`;
document.head.appendChild(style);

function sweetAlert(options) {
    Swal.fire(options);
}

// Função para abrir o painel de "Inserir Link OS"
function openLinkOSDialog(editor) {
    editor.windowManager.open({
        title: 'Inserir Link OS',
        body: {
            type: 'panel',
            items: [
                {
                    type: 'input',
                    name: 'nOS',
                    label: 'Nº da OS:',
                    inputType: 'number',
                    placeholder: 'Digite apenas números',
                    ariaLabel: 'Número da OS'
                }
            ]
        },
        buttons: [
            {
                text: 'Cancelar',
                type: 'cancel'
            },
            {
                text: 'Salvar',
                type: 'submit',
                primary: true,
                focus: true
            }
        ],
        onSubmit: function (dialog) {
            var data = dialog.getData();
            var nOS = data.nOS;

            // Validação: se não for somente números ou estiver vazio, fecha o painel e exibe o alerta
            if (!nOS) {
                dialog.close(); // Fecha o painel
                Swal.fire({
                    title: 'Erro',
                    text: 'Número da OS não informado!',
                    icon: 'error',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Reabre o painel após o usuário confirmar o alerta
                    openLinkOSDialog(editor);
                });
            } else if (!SomenteNumeros(nOS)) {
                dialog.close();
                Swal.fire({
                    title: 'Erro',
                    text: "Digite apenas números!",
                    icon: 'error',
                    confirmButtonText: 'OK'
                }).then(() => {
                    openLinkOSDialog(editor);
                });
            } else {
                // Se a validação passar, insere o conteúdo e fecha o painel
                var linkOS = InserirLinkOS(nOS);
                editor.insertContent(linkOS);
                dialog.close();
            }
        }
    });
}

function openLinkTarefaDialog(editor) {
    editor.windowManager.open({
        title: 'Inserir Link Tarefa',
        body: {
            type: 'panel',
            items: [
                {
                    type: 'input',
                    name: 'nTarefa',
                    label: 'Nº da Tarefa:',
                    inputType: 'number',
                    placeholder: 'Digite apenas números',
                    ariaLabel: 'Número da Tarefa'
                }
            ],
        },
        buttons: [
            {
                text: 'Cancelar',
                type: 'cancel'
            },
            {
                text: 'Salvar',
                type: 'submit',
                primary: true,
                focus: true
            }
        ],
        onSubmit: function (dialog) {
            var data = dialog.getData();
            var nTarefa = data.nTarefa;

            // Validação: se não for somente números ou estiver vazio, fecha o painel e exibe o alerta
            if (!nTarefa) {
                dialog.close(); // Fecha o painel
                Swal.fire({
                    title: 'Erro',
                    text: 'Número da Tarefa não informado!',
                    icon: 'error',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Reabre o painel após o usuário confirmar o alerta
                    openLinkTarefaDialog(editor);
                });
            } else if (!SomenteNumeros(nTarefa)) {
                dialog.close();
                Swal.fire({
                    title: 'Erro',
                    text: "Digite apenas números!",
                    icon: 'error',
                    confirmButtonText: 'OK'
                }).then(() => {
                    openLinkTarefaDialog(editor);
                });
            } else {
                // Se a validação passar, insere o conteúdo e fecha o painel
                var linkOS = InserirLinkTarefa(nTarefa);
                editor.insertContent(linkOS);
                dialog.close();
            }
        }
    });
}

function openInsertAudioDialog(editor){
    editor.windowManager.open({
        title: 'Inserir Audio',
        body: {
            type: 'panel',
            items: [
                {
                    type: 'input',
                    name: 'audioUrl',
                    label: 'URL do Audio',
                    placeholder: 'Insira a URL do audio',
                    ariaLabel: 'URL do Audio'
                }
            ]
        },
        buttons: [
            {
                text: 'Cancelar',
                type: 'cancel'
            },
            {
                text: 'Salvar',
                type: 'submit',
                primary: true,
                focus: true
            }
        ],
        onSubmit: function (dialog) {
            var data = dialog.getData();
            var url = data.audioUrl;
            // Validação: se não for somente números ou estiver vazio, fecha o painel e exibe o alerta
            if (!url) {
                dialog.close(); // Fecha o painel
                Swal.fire({
                    title: 'Erro',
                    text: 'URL do Audio não informado!',
                    icon: 'error',
                    confirmButtonText: 'OK'
                }).then(() => {
                    // Reabre o painel após o usuário confirmar o alerta
                    openInsertAudioDialog(editor);
                });
            } else {
                // Se a validação passar, insere o conteúdo e fecha o painel
                var audioHtml = FormatarAudio(url);
                editor.insertContent(audioHtml);
                dialog.close();
            }
        }
    });
}