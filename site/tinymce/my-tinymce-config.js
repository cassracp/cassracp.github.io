tinymce.init({
    selector: 'textarea',
    language_url: 'my_tinymce_app/langs/pt_BR.js',
    language: 'pt_BR',
    plugins: [
        // Core editing features
        'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
        // Other features
        'code', 'insertdatetime'
    ],
    menu: {
        file: { title: 'Arquivo', items: 'novodocumento copyhtml savehtml | print' }, // Certifique-se de que todos os itens estão listados aqui
        insert: { title: 'Inserir', items: 'image link media insertaudio emoticons charmap | insertCalendarDate insertdatetime' },
        format: { 
            title: 'Formatar', 
            items: 'bold italic underline strikethrough superscript subscript codeformat blockformats align lineheight forecolor backcolor removeformat blockquote uppercase lowercase' 
        },
        tools: { 
            title: 'Ferramentas', 
            items: 'spellchecker charmap emoticons layer | formatarTelefone topicoTarefa topicoOS' 
        },
    },
    toolbar: 'undo redo | novodocumento copyhtml savehtml | blocks fontfamily fontsize forecolor backcolor bold italic underline strikethrough uppercase lowercase blockquote removeformat align lineheight numlist bullist indent outdent link image insertAudio | formatarTelefone topicoTarefa topicoOS | code',
    link_default_target: '_blank',
    lineheight_formats: '1 1.2 1.4 1.5 1.6 1.8 2 2.5 3',
    content_style: "body { line-height: 1.4; }",
    setup: function (editor) {
        editor.ui.registry.addIcon('custom-audio', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="size-6"><path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" /><path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" /></svg>');
        
        editor.ui.registry.addIcon('uppercase', '<svg width="20px" height="20px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.6255 2.75C3.83478 2.75 4.02192 2.88034 4.09448 3.07664L7.16985 11.3962C7.2656 11.6552 7.13324 11.9428 6.87423 12.0386C6.61522 12.1343 6.32763 12.002 6.23188 11.7429L5.22387 9.01603H2.02712L1.01911 11.7429C0.923362 12.002 0.635774 12.1343 0.376762 12.0386C0.117749 11.9428 -0.0146052 11.6552 0.0811401 11.3962L3.15651 3.07664C3.22908 2.88034 3.41621 2.75 3.6255 2.75ZM3.6255 4.69207L4.90966 8.16603H2.34133L3.6255 4.69207ZM11.3719 2.75C11.5811 2.75 11.7683 2.88034 11.8408 3.07664L14.9162 11.3962C15.012 11.6552 14.8796 11.9428 14.6206 12.0386C14.3616 12.1343 14.074 12.002 13.9782 11.7429L12.9702 9.01603H9.77348L8.76547 11.7429C8.66972 12.002 8.38213 12.1343 8.12312 12.0386C7.86411 11.9428 7.73175 11.6552 7.8275 11.3962L10.9029 3.07664C10.9754 2.88034 11.1626 2.75 11.3719 2.75ZM11.3719 4.69207L12.656 8.16603H10.0877L11.3719 4.69207Z" fill="#000000"/></svg>');
        editor.ui.registry.addIcon('lowercase', '<svg width="20px" height="20px" viewBox="0 0 463 463" fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/1999/xlink" xml:space="preserve"><g><path d="M463,158.002H190.417l-21.13-45.587c-2.456-5.301-7.767-8.692-13.608-8.692h-5.263c-5.868,0-11.196,3.421-13.639,8.756 l-20.841,45.523H0v5h113.646L34.662,335.534c-2.126,4.643-1.743,10.049,1.017,14.348c1.143,1.779,2.632,3.264,4.343,4.396H0v5h463 v-5h-40.016c0.84-0.558,1.63-1.198,2.352-1.924c2.815-2.832,4.386-6.67,4.362-10.663l-0.639-110.12 c-0.376-39.413-24.4-64.987-63.387-68.568H463V158.002z M150.559,163.002h5.265l42.272,91.349h-88.984L150.559,163.002z M66.533,347.995l27.354-60.066H213.53l27.66,60.119c1.191,2.588,3.065,4.719,5.348,6.229H61.163 C63.46,352.756,65.344,350.605,66.533,347.995z M396.117,341.905c0.044,5.172,2.702,9.708,6.711,12.372h-39.629 c12.265-2.679,23.328-7.479,32.901-14.256L396.117,341.905z M395.779,288.204c-10.517,24.176-27.967,34.996-56.235,34.996 c-16.729,0-34.604-7.394-34.604-28.142c0-19.983,26.339-22.97,42.039-22.97h48.789L395.779,288.204z M283.645,209.935l2.15,2.867 c2.409,3.213,6.006,5.325,9.985,5.865c3.979,0.535,8.009-0.54,11.188-2.995c17.49-13.516,32.621-19.543,49.062-19.543 c34.971,0,39.278,20.318,39.454,35.644v6.739h-48.505c-55.753,0-75.617,29.21-75.617,56.547c0,29.242,19.087,51.918,47.541,59.219 h-51.555c1.721-1.14,3.217-2.633,4.361-4.426c2.756-4.314,3.121-9.736,0.968-14.382l-79.942-172.468h153.828 c-20.627,1.946-39.965,10.371-60.142,26.105C279.977,194.134,278.741,203.395,283.645,209.935z"/></g></svg>');

        editor.ui.registry.addIcon('calendar-days', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"  class="size-6"><path d="M12 11.993a.75.75 0 0 0-.75.75v.006c0 .414.336.75.75.75h.006a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75H12ZM12 16.494a.75.75 0 0 0-.75.75v.005c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H12ZM8.999 17.244a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.006ZM7.499 16.494a.75.75 0 0 0-.75.75v.005c0 .414.336.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H7.5ZM13.499 14.997a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.005a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.005ZM14.25 16.494a.75.75 0 0 0-.75.75v.006c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75h-.005ZM15.75 14.995a.75.75 0 0 1 .75-.75h.005a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75H16.5a.75.75 0 0 1-.75-.75v-.006ZM13.498 12.743a.75.75 0 0 1 .75-.75h2.25a.75.75 0 1 1 0 1.5h-2.25a.75.75 0 0 1-.75-.75ZM6.748 14.993a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" /><path fill-rule="evenodd" d="M18 2.993a.75.75 0 0 0-1.5 0v1.5h-9V2.994a.75.75 0 1 0-1.5 0v1.497h-.752a3 3 0 0 0-3 3v11.252a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3V7.492a3 3 0 0 0-3-3H18V2.993ZM3.748 18.743v-7.5a1.5 1.5 0 0 1 1.5-1.5h13.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-13.5a1.5 1.5 0 0 1-1.5-1.5Z" clip-rule="evenodd" /></svg>');

        editor.ui.registry.addIcon('quote', '<i class="fa-solid fa-quote-right fa-lg"></i>'); // quote
        editor.ui.registry.addIcon('fone', '<i class="fa-solid fa-phone fa-lg"></i>'); // fone
        editor.ui.registry.addIcon('topicotarefa', '<i class="fa-solid fa-message fa-lg"></i>') // topicotarefa
        editor.ui.registry.addIcon('topicoos', '<i class="fa-solid fa-headset fa-lg"></i></i>') // topicoos
        editor.ui.registry.addIcon('novodocumento', '<i class="fa-regular fa-file fa-lg"></i>'); // novodocumento

        editor.ui.registry.addButton('insertAudio', {
            icon: 'custom-audio', // Usa o ícone SVG personalizado
            tooltip: 'Inserir Audio',
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
        editor.ui.registry.addMenuItem('insertaudio', {
            text: 'Audio...',
            icon: 'custom-audio', // Usa o ícone SVG personalizado
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

        editor.ui.registry.addButton('novodocumento', {
            icon: 'novodocumento',
            tooltip: 'Novo documento',
            onAction: function () {
                if (confirm('Tem certeza de que deseja criar um novo documento?\nTodo o conteúdo não salvo será perdido.')) {
                    editor.setContent('');
                }
            }
        });
        editor.ui.registry.addMenuItem('novodocumento', {
            text: 'Novo documento',
            icon: 'novodocumento',
            shortcut: 'Alt+N',
            onAction: function () {
                if (confirm('Tem certeza de que deseja criar um novo documento?\nTodo o conteúdo não salvo será perdido.')) {
                    editor.setContent('');
                }
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
            tooltip: 'Transformar texto em minúsculas',
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

        editor.ui.registry.addButton('insertdatetime', {
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
        });

        editor.ui.registry.addMenuItem('insertdatetime', {
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
        });

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
        alert('Nenhum conteúdo HTML para copiar!');
        return;
    }

    navigator.clipboard.writeText(content).then(function() {
    }, function(err) {
        alert('Erro ao copiar HTML: ', err);
    });
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