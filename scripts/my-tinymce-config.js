document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.innerHTML = `
        #main-header.hidden {
            display: none;
        }
    `;
    document.head.appendChild(style);

    // ===================================================================================
    // == GERENCIAMENTO DE TEMA (SKIN) ===================================================
    // ===================================================================================
    
    // NOVO: Defina os temas disponíveis aqui. 'value' deve ser o nome da pasta em /skins/ui/
    const AVAILABLE_THEMES = [
        { name: 'Clássico (Claro)', value: 'tinymce-5' },
        { name: 'Clássico (Escuro)', value: 'tinymce-5-dark' },
        { name: 'Oxide (Claro)', value: 'oxide' },
        { name: 'Oxide (Escuro)', value: 'oxide-dark' },
        // Adicione outros temas que você tenha aqui, ex:
        // { name: 'Material Design', value: 'tinymce-material' },
    ];

    function getActiveTheme() {
        return localStorage.getItem('tinymceActiveTheme') || AVAILABLE_THEMES[0].value;
    }

    function saveActiveTheme(themeName) {
        localStorage.setItem('tinymceActiveTheme', themeName);
    }

    function applyPageTheme(themeName) {
        // Define o atributo no body para que o CSS funcione
        document.body.dataset.theme = themeName;

        // Remove o CSS do tema antigo, se existir
        const oldThemeLink = document.getElementById('dynamic-theme-style');
        if (oldThemeLink) {
            oldThemeLink.remove();
        }
        
        // Adiciona o novo CSS do tema
        const newThemeLink = document.createElement('link');
        newThemeLink.id = 'dynamic-theme-style';
        newThemeLink.rel = 'stylesheet';
        newThemeLink.href = `stylesheets/themes/${themeName}.css`;
        document.head.appendChild(newThemeLink);
    }

    function applyInitialFocusMode() {
        // Lê o valor salvo e converte para booleano
        const focusModeActive = localStorage.getItem('focusModeActive') === 'true';
        
        if (focusModeActive) {
            const header = document.getElementById('main-header');
            if (header) {
                header.classList.add('hidden');
            }
        }
    }

    // ===================================================================================
    // == GERENCIAMENTO DE ESTADO DAS ABAS E EDITORES =====================================
    // ===================================================================================
    let editors = {}; // Armazena as instâncias do TinyMCE
    let activeTabId = null; // ID da aba atualmente ativa
    let cachedProtocolsData = null;
    let cachedClickUpData = null;

    const tabContainer = document.getElementById('tab-container');
    const editorAreaContainer = document.getElementById('editor-area-container');

    // ===================================================================================
    // == FUNÇÃO PARA TROCAR O TEMA ======================================================
    // ===================================================================================

    // NOVO: Função central para trocar o tema
    async function switchTheme(themeName) {
        if (getActiveTheme() === themeName) return;

        Swal.fire({
            title: 'Alterando tema...',
            text: 'Aguarde um momento.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });
        
        saveActiveTheme(themeName);
        applyPageTheme(themeName);
        
        // Salva o conteúdo de todas as abas antes de destruí-las
        const allTabsContent = Object.keys(editors).map(id => ({
            id: id,
            content: tinymce.get(id) ? tinymce.get(id).getContent() : ''
        }));
        
        const previouslyActiveTabId = activeTabId;

        // Destrói todas as instâncias do editor
        for (const id in editors) {
            const editorInstance = tinymce.get(id);
            if (editorInstance) {
                editorInstance.destroy();
            }
        }
        
        // Limpa a estrutura
        editors = {};
        tabContainer.innerHTML = '';
        editorAreaContainer.innerHTML = '';

        // Recria todas as abas com o novo tema
        if (allTabsContent.length > 0) {
            for (const tabData of allTabsContent) {
                await createTab(tabData.id, tabData.content);
            }
            switchTab(previouslyActiveTabId);
        } else {
            await createTab();
        }

        // Aguarda um pequeno delay para garantir a renderização
        setTimeout(() => {
            Swal.close();
            if (previouslyActiveTabId && tinymce.get(previouslyActiveTabId)) {
                tinymce.get(previouslyActiveTabId).focus();
            }
        }, 500);
    }

    // ===================================================================================
    // == FUNÇÕES PRINCIPAIS DAS ABAS =====================================================
    // ===================================================================================

    /**
     * Encontra o próximo número de aba disponível de forma sequencial.
     */
    function findNextTabNumber() {
        const existingTabNumbers = Object.keys(editors)
            .map(id => parseInt(id.split('-')[1], 10))
            .filter(num => !isNaN(num))
            .sort((a, b) => a - b);

        let nextNumber = 1;
        for (const num of existingTabNumbers) {
            if (num === nextNumber) {
                nextNumber++;
            } else {
                break;
            }
        }
        return nextNumber;
    }

    /**
     * Gerencia a visibilidade da barra de abas. Se tiver apenas uma aba, esconde a barra.
     * Não está sendo mais chamada automaticamente, pois a barra deve sempre estar visível.
     */
    /**function updateTabContainerVisibility() {
        const tabCount = Object.keys(editors).length;
        if (tabCount > 1) {
            tabContainer.style.display = 'flex';
        } else {
            tabContainer.style.display = 'none';
        }
    }*/

    /**
     * Alterna para uma aba específica, mostrando seu editor e destacando a aba.
     */
    function switchTab(tabId) {
        if (!tabId || !editors[tabId]) return;

        activeTabId = tabId;

        localStorage.setItem('tinymceActiveTabId', tabId);

        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tabId === tabId);
        });

        document.querySelectorAll('.editor-wrapper').forEach(wrapper => {
            wrapper.classList.toggle('active', wrapper.id === `wrapper-${tabId}`);
        });

        tinymce.get(tabId).focus();
        console.log(`Switched to tab: ${tabId}`);
    }

    /**
     * Fecha uma aba, destrói o editor e remove os elementos do DOM.
     * ALTERADO: Ação de fechar agora é async para aguardar a criação da nova aba.
     */
    function closeTab(e, tabId) {
        e.stopPropagation();

        const editorInstance = tinymce.get(tabId);
        if (!editorInstance) return;

        // A função interna agora é async
        const closeTabAction = async () => {
            const tabElement = document.querySelector(`.tab-item[data-tab-id="${tabId}"]`);
            const editorWrapper = document.getElementById(`wrapper-${tabId}`);
            
            editorInstance.destroy();
            
            if (tabElement) tabElement.remove();
            if (editorWrapper) editorWrapper.remove();
            
            delete editors[tabId];

            if (activeTabId === tabId) {
                const remainingTabs = Object.keys(editors);
                if (remainingTabs.length > 0) {
                    switchTab(remainingTabs[0]);
                } else {
                    // CORREÇÃO: Aguarda a criação e depois ativa a nova aba
                    await createTab();
                    const newTabId = Object.keys(editors)[0];
                    if (newTabId) {
                        switchTab(newTabId);
                    }
                }
            }
            saveAllTabs();
            //updateTabContainerVisibility();
        };

        if (editorInstance.isDirty()) {
             Swal.fire({
                title: 'Conteúdo não salvo',
                text: "Você tem certeza que quer fechar esta aba? Todas as alterações não salvas serão perdidas.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim, fechar!',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    closeTabAction();
                }
            });
        } else {
            closeTabAction();
        }
    }
    
    /**
     * Cria uma nova aba e um novo editor TinyMCE.
     */
     async function createTab(tabIdToCreate = null, initialContent = '') {
        return new Promise(async (resolve) => {
            let newTabNumber;
            let tabId;
            

            if (tabIdToCreate) {
                tabId = tabIdToCreate;
                newTabNumber = parseInt(tabIdToCreate.split('-')[1], 10);
            } else {
                newTabNumber = findNextTabNumber();
                tabId = `editor-${newTabNumber}`;
            }
            
            const tabTitle = `Documento ${newTabNumber}`;

            const tabElement = document.createElement('div');
            tabElement.className = 'tab-item';
            tabElement.dataset.tabId = tabId;
            tabElement.innerHTML = `
                <span class="tab-title">${tabTitle}</span>
                <button class="tab-close-btn">&times;</button>
            `;
            tabContainer.appendChild(tabElement);

            const editorWrapper = document.createElement('div');
            editorWrapper.id = `wrapper-${tabId}`;
            editorWrapper.className = 'editor-wrapper';
            const textarea = document.createElement('textarea');
            textarea.id = tabId;
            editorWrapper.appendChild(textarea);
            editorAreaContainer.appendChild(editorWrapper);

            tabElement.addEventListener('click', () => switchTab(tabId));
            tabElement.querySelector('.tab-close-btn').addEventListener('click', (e) => closeTab(e, tabId));
            
           const config = await getTinyMceConfig(`#${tabId}`, initialContent);
            tinymce.init(config).then(initedEditors => {
                const newEditor = initedEditors[0];
                editors[tabId] = newEditor;
                
                newEditor.on('input change', saveAllTabs);
                
                // A linha que chamava updateTabContainerVisibility() foi removida daqui
                
                // A Promise agora retorna o ID da aba criada
                resolve(tabId);
            });
        });
    }

    // ===================================================================================
    // == PERSISTÊNCIA EM LOCALSTORAGE ====================================================
    // ===================================================================================

    function saveAllTabs() {
        const tabsData = {};
        for (const id in editors) {
            if (tinymce.get(id)) {
                tabsData[id] = tinymce.get(id).getContent();
            }
        }
        localStorage.setItem('tinymceTabsContent', JSON.stringify(tabsData));
        console.log('All tabs saved to localStorage.');
    }

    async function loadTabs() {
        const savedTabs = localStorage.getItem('tinymceTabsContent');
        if (savedTabs) {
            const tabsData = JSON.parse(savedTabs);
            const tabIds = Object.keys(tabsData);

            if (tabIds.length > 0) {
                // Usa um loop for...of para funcionar com await
                for (const id of tabIds) {
                    const content = tabsData[id];
                    await createTab(id, content);
                }

                // Restaura a aba que estava ativa anteriormente
                const savedActiveTab = localStorage.getItem('tinymceActiveTabId');
                if (savedActiveTab && tabsData[savedActiveTab]) {
                    switchTab(savedActiveTab);
                } else {
                    switchTab(tabIds[0]); // Se não encontrar, ativa a primeira
                }

            } else {
                // Se não há abas salvas, cria uma e a ativa
                await createTab().then(() => switchTab(Object.keys(editors)[0]));
            }
        } else {
            // Se nunca houve abas, cria uma e a ativa
            await createTab().then(() => switchTab(Object.keys(editors)[0]));
        }
        //updateTabContainerVisibility();
    }

    // ===================================================================================
    // == CONFIGURAÇÃO DO TINYMCE =========================================================
    // ===================================================================================

    /**
     * Retorna o objeto de configuração completo para uma instância do TinyMCE.
     */
    async function getTinyMceConfig(selector, content) {
        // Carrega os formatos do nosso novo arquivo JSON
        const response = await fetch('data/editor_formats.json');
        const formatsData = await response.json();

        // Converte os dados do JSON para o formato que o TinyMCE espera
        const fontFamilyFormats = formatsData.font_families
            .map(font => `${font.title}=${font.value}`)
            .join(';');

        const fontSizeFormats = formatsData.font_sizes.join(' ');
        const activeTheme = getActiveTheme();
        let skinUrl;
        let contentCss;
    

        return {
            selector: selector,
            init_instance_callback: (editor) => {
                editor.setContent(content);
                editor.focus();
            },
            license_key: 'gpl',
            newline_behavior: 'invert',
            placeholder: 'Digite aqui...',
            height: '100%',
            resize: false,
            skin_url: `scripts/my_tinymce_app/skins/ui/${activeTheme}`,
            content_css: activeTheme.includes('dark') ? 'dark' : 'default',
            promotion: false,
            language_url: 'scripts/my_tinymce_app/langs/pt_BR.js',
            language: 'pt_BR',
            plugins: [
                'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'advlist', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
                'code', 'insertdatetime', 'help', 'quickbars',
                'visualchars', 'preview'
            ],
            codesample_languages: formatsData.code_languages,
            menu: {
                file: { 
                    title: 'Arquivo', 
                    items: 'novodocumento closetab | save saveasMenu | copyhtml | limpartexto | print' 
                },                
                view: {
                    title: 'Exibir',
                    items: ' code preview | modofoco fullscreen | showblocks visualchars visualblocks | spellchecker | wordcount | skins'
                },
                insert: { 
                    title: 'Inserir', 
                    items: 'hr | image imagemComLink link media linkOS linkTarefa inseriraudio emoticons charmap | insertdatetime insertCalendarDate | codesample' 
                },
                format: { 
                    title: 'Formatar', 
                    items: 'bold italic underline strikethrough superscript subscript codeformat | upperCaselowerCaseMenu | melhorarTextoIAMenu | blockformats align lineheight forecolor backcolor removeformat blockquote' 
                },
                tools: { 
                    title: 'Ferramentas', 
                    items: 'spellchecker charmap emoticons | gerarTextoGemini datecalculator | responderMensagem'                 
                },
                demaria: { 
                    title: 'DeMaria', 
                    items: 'clickupMenu | formatarTelefone topicoTarefa topicoOS protocolosDeMariaMenu | geradorscripts'
                },
                table: { 
                    title: 'Tabela', 
                    items: 'inserttable | cell row column | deletetable' 
                },
                help: { 
                    title: 'Ajuda', 
                    items: 'help' 
                }
            },
            menubar: 'file edit view insert format tools demaria table help',
            toolbar: 'undo redo novodocumento copyhtml limpartexto | blocks fontfamily fontsize | forecolor backcolor bold italic underline strikethrough togglecodeformat blockquote removeformat | align lineheight numlist bullist indent outdent hr | responderMensagem linkOS linkTarefa imagemComLink inseriraudio insertCalendarDate | formatarTelefone topicoTarefa topicoOS protocolosDeMaria | gerarTextoGemini geradorscripts customcodeview modofoco preview',
            font_family_formats: fontFamilyFormats,
            font_size_formats: fontSizeFormats,
            insertdatetime_timeformat: '%H:%M:%S',
            insertdatetime_formats: ['%d/%m/%Y', '%d-%m-%Y', '%d/%m/%Y às %H:%M', '%d-%m-%Y às %H:%M', '%H:%M (Brasília, GMT -03:00)'],
            browser_spellcheck: true,
            contextmenu: "bold italic underline forecolor | lists | link openlink unlink | insertdatetime | imagemComLink image | table",
            link_default_target: '_blank',
            lineheight_formats: '1 1.2 1.4 1.5 1.6 1.8 2 2.5 3',
            content_style: "body { line-height: 1.3; font-size: 10pt; } blockquote { font-family: 'Courier New', Courier, monospace; font-size: 8pt; }",
            formats: {
                // Sobrescreve o formato padrão do botão "Citação"
                blockquote: { 
                    block: 'blockquote', 
                    // Define os estilos que serão aplicados diretamente na tag
                    styles: { 
                        'font-family': 'Courier New, Courier, monospace',
                        'font-size': '8pt',
                        'border-left': '4px solid #ccc',
                        'padding-left': '15px',
                        'margin': '1em 0'
                    },
                    wrapper: true
                }
            },
            quickbars_insert_toolbar: false,
            quickbars_selection_toolbar: 'bold italic underline togglecodeformat | upperCaselowerCase melhorarTextoIA | removeformat | fontfamily fontsize fontsizeselect forecolor backcolor  quicklink blockquote indent outdent responderMensagem',
            quickbars_image_toolbar: 'alignleft aligncenter alignright | rotateleft rotateright | imageoptions',
            setup: function (editor) {

                // ===================================================================================
                // == FUNÇÃO DA API GEMINI ===========================================================
                // ===================================================================================

                const gerarTextoComGemini = async (prompt) => {
                    const apiKey = 'AIzaSyA2OQvGwLMD2DJiES4k4uNyx1F4QP_JEsE'; 
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
                    const headers = { 'Content-Type': 'application/json' };
                    const body = JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }]
                    });

                    const response = await fetch(url, {
                        method: 'POST',
                        headers: headers,
                        body: body
                    });

                    if (!response.ok) {
                        const errorBody = await response.text();
                        throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorBody}`);
                    }

                    const data = await response.json();
                    return data.candidates[0].content.parts[0].text;
                };


                // ===================================================================================
                // == FUNÇÕES DE BOTÕES E AUXILIARES =================================================
                // ===================================================================================

                const openCustomCodeView = (editor) => {
                    let rawContent = editor.getContent();
                    
                    // Lógica de limpeza (Editor -> Modal)
                    let processedContent = rawContent.replace(/<p\b[^>]*>/g, '');
                    processedContent = processedContent.replace(/<\/p>/g, '\n');
                    // Adicionei uma limpeza extra de <br> caso elas existam
                    processedContent = processedContent.replace(/<br\s*\/?>/g, '\n'); 
                    processedContent = processedContent.trim();

                    editor.windowManager.open({
                        title: 'Código Fonte (HTML)',
                        size: 'large',
                        body: {
                            type: 'panel',
                            items: [
                                {
                                    type: 'textarea',
                                    name: 'codeview',
                                    // 1. A área de texto agora é editável (readonly foi removido)
                                    maximized: true
                                }
                            ]
                        },
                        // 2. Novos botões de Salvar e Cancelar
                        buttons: [
                            {
                                type: 'cancel',
                                text: 'Cancelar'
                            },
                            {
                                type: 'submit',
                                text: 'Salvar',
                                primary: true
                            }
                        ],
                        initialData: {
                            codeview: processedContent
                        },
                        // 3. Nova função onSubmit para processar e salvar as alterações
                        onSubmit: (dialog) => {
                            const data = dialog.getData();
                            const modifiedText = data.codeview;

                            // Lógica de "tradução reversa" (Modal -> Editor)
                            // Converte cada linha de texto de volta para uma tag <p>
                            const newHtmlContent = modifiedText
                                .trim()
                                .split('\n') // Divide o texto em um array de linhas
                                .map(line => `<p>${line || '&nbsp;'}</p>`) // Envolve cada linha em <p>
                                .join(''); // Junta tudo em uma string HTML

                            editor.setContent(newHtmlContent);
                            dialog.close();
                        }
                    });
                };

                const openSaveAsDialog = (editor) => {
                    editor.windowManager.open({
                        title: 'Salvar Como...',
                        size: 'medium',
                        body: {
                            type: 'panel',
                            items: [
                                {
                                    type: 'input',
                                    name: 'filename',
                                    label: 'Nome do Arquivo (sem extensão)',
                                    placeholder: 'documento_novo'
                                },
                                {
                                    type: 'selectbox',
                                    name: 'filetype',
                                    label: 'Formato do Arquivo',
                                    items: [
                                        { text: 'Arquivo HTML (.html)', value: 'html' },
                                        { text: 'Documento PDF (.pdf)', value: 'pdf' }
                                    ]
                                }
                            ]
                        },
                        buttons: [
                            { type: 'cancel', text: 'Cancelar' },
                            { type: 'submit', text: 'Salvar', primary: true }
                        ],
                        initialData: {
                            filetype: 'html' // Começa com HTML pré-selecionado
                        },
                        onSubmit: (dialogApi) => {
                            const data = dialogApi.getData();
                            const filename = data.filename || 'documento'; // Nome padrão se vazio

                            if (data.filetype === 'html') {
                                salvarComoHTML(editor, filename);
                            } else if (data.filetype === 'pdf') {
                                salvarComoPDF(editor, filename);
                            }
                            
                            dialogApi.close();
                        }
                    });
                };

                const novodocumentoAction = async () => {
                        // Aguarda a criação da aba e recebe seu ID
                        const newTabId = await createTab();
                        // Ativa a nova aba
                        switchTab(newTabId);
                };

                const limpardocumentoAction = function () {
                    confirmacao("Limpar Editor?", "Todo o conteúdo não salvo será perdido.", () => editor.setContent(''));
                };

                 const closeCurrentTabAction = () => {
                    if(activeTabId) {
                        closeTab({ stopPropagation: () => {} }, activeTabId);
                    }
                 };

                const copiarHTML = (editor) => {
                    let htmlContent = editor.getContent();

                    if (!htmlContent) {
                        Swal.fire('Atenção', 'Não há conteúdo para copiar.', 'warning');
                        return;
                    }

                    // 1. Remove a tag de abertura <p> (e qualquer atributo)
                    let processedHtml = htmlContent.replace(/<p\b[^>]*>/g, '');

                    // 2. Substitui a tag de fechamento </p>
                    processedHtml = processedHtml.replace(/<\/p>/g, '');
                    processedHtml = processedHtml.replace(/<br\s*\/?>/g, '\n');

                    // 3. Remove múltiplos espaços e quebras de linha do final
                    processedHtml = processedHtml.trim();


                    navigator.clipboard.writeText(processedHtml).then(() => {
                          Swal.fire({
                            toast: true,
                            position: 'top', // Posição no canto superior direito
                            icon: 'success',
                            title: 'HTML copiado com sucesso!',
                            showConfirmButton: false,
                            timer: 2000, // Fecha automaticamente após 2 segundos
                            timerProgressBar: true
                        });
                    }).catch(err => {
                        console.error('Erro ao copiar o HTML: ', err);
                        Swal.fire('Erro', 'Não foi possível copiar o conteúdo.', 'error');
                    });
                }

                const salvarComoHTML = (editor, filename) => {
                    const editorContent = editor.getContent(); // Pega o conteúdo HTML original
                    if (!editorContent) {
                        Swal.fire('Atenção', 'Não há conteúdo para salvar.', 'warning');
                        return;
                    }

                    const blob = new Blob([editorContent], { type: 'text/html;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    // Usa o nome de arquivo recebido (ou um padrão se não for fornecido)
                    link.download = filename ? `${filename}.html` : 'documento.html';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                };

                const salvarComoPDF = (editor, filename) => {
                    const content = editor.getContent();
                    if (!content) { 
                        Swal.fire('Atenção', 'Não há conteúdo para salvar como PDF.', 'warning');
                        return; 
                    }

                    const opt = {
                        margin:       1,
                        filename:     filename ? `${filename}.pdf` : 'documento.pdf', // Usa o nome de arquivo
                        image:        { type: 'jpeg', quality: 0.98 },
                        html2canvas:  { scale: 2 },
                        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
                    };

                    // Para que a biblioteca processe o CSS do editor corretamente,
                    // precisamos criar um elemento temporário com o conteúdo.
                    const element = document.createElement('div');
                    element.style.width = '210mm'; // Simula uma página A4
                    element.innerHTML = content;
                    
                    // Adiciona as folhas de estilo do editor ao elemento para uma renderização fiel
                    const contentCssLinks = editor.getParam('content_css', [], 'string[]');
                    contentCssLinks.forEach(link => {
                        const linkEl = document.createElement('link');
                        linkEl.rel = 'stylesheet';
                        linkEl.href = link;
                        document.head.appendChild(linkEl);
                    });

                    // Chama a biblioteca para gerar o PDF a partir do nosso elemento
                    html2pdf().set(opt).from(element).save();
                };

                const toggleModoFoco = () => {
                    const header = document.getElementById('main-header');
                    if (header) {
                        const isHidden = header.classList.toggle('hidden');
                        window.dispatchEvent(new Event('resize'));
                        editor.dispatch('focusModeToggled', { state: isHidden });
                        
                        localStorage.setItem('focusModeActive', isHidden);
                    }
                };
                
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
                        buttons: [ { text: 'Cancelar', type: 'cancel' }, { text: 'Inserir', type: 'submit', primary: true } ],
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
                        buttons: [ { text: 'Cancelar', type: 'cancel' }, { text: 'Inserir', type: 'submit', primary: true } ],
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
                        buttons: [ { text: 'Cancelar', type: 'cancel' }, { text: 'Inserir', type: 'submit', primary: true } ],
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
                        buttons: [ { text: 'Cancelar', type: 'cancel' }, { text: 'Inserir', type: 'submit', primary: true } ],
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

                const openDateCalculator = (editor) => {
                    const idealWidth = Math.min(600, window.innerWidth * 0.8);
                    const idealHeight = Math.min(680, window.innerHeight * 0.9);

                    editor.windowManager.openUrl({
                        title: 'Calculadora de Datas',
                        url: 'site/calculadora-datas.html',
                        width: idealWidth,
                        height: idealHeight
                    });
                };

              const responderMensagem = function () {
                    const selectedContent = editor.selection.getContent({ format: 'html' });
                    
                    const insertFormattedReply = (content) => {
                        // 1. Insere o conteúdo original e a linha de Resposta
                        editor.execCommand('mceInsertContent', false, `<p id="__reply_target__">${content.trim()}</p><br><strong>Resposta:</strong><br>`);
                        
                        // 2. Encontra o parágrafo que acabamos de inserir
                        const targetNode = editor.dom.get('__reply_target__');
                        
                        if (targetNode) {
                            // 3. Seleciona o nó e aplica nosso formato customizado de blockquote
                            editor.selection.select(targetNode);
                            editor.formatter.apply('blockquote');
                            
                            // Remove o ID temporário
                            editor.dom.setAttrib(targetNode, 'id', null);
                        }
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

                const inserirScriptValidacaoAnexo = (editor) => {
                    const template = `
                        <p>Gerada amostra de migração de <strong>[TIPO DA MIGRAÇÃO]</strong> e <strong>validado internamente.</strong></p>
                        <p>Segue arquivo em anexo para <strong>validação externa.</strong></p>
                        <hr>
                        <p><strong>OBSERVAÇÕES AO VALIDADOR</strong></p>
                        <p>Nada consta.</p>
                    `;
                    editor.insertContent(template.replace(/    /g, '').trim());
                };

                const inserirScriptValidacaoRede = (editor) => {
                    const template = `
                        <p>Gerada amostra de migração de <strong>[TIPO DA MIGRAÇÃO]</strong> e <strong>validado internamente.</strong></p>
                        <p>Arquivos estão no caminho de rede:</p>
                        <pre>\\\\192.168.1.179\\cpt-009\\CONVERTE\\CONCORRE\\[PASTA_DO_CLIENTE]</pre>
                        <hr>
                        <p><strong>OBSERVAÇÕES AO VALIDADOR</strong></p>
                        <p>Nada consta.</p>
                    `;
                    editor.insertContent(template.replace(/    /g, '').trim());
                };

                 const openRelatorioAnaliseDialog = (editor) => {
                    window.handleRelatorioData = (text) => {
                        if (!text || text.trim() === '') {
                            return;
                        }
                        
                        try {
                            const dbMatch = text.match(/Banco de dados analisado:\s*([^\n\r]+)/i);
                            const dateMatch = text.match(/Data de coleta do Backup:\s*([^\n\r]+)/i);
                            const prazoBlockMatch = text.match(/Prazo para desenvolvimento:[\s\S]*/i);
                            let prazo = '[NÃO ENCONTRADO]';
                            if (prazoBlockMatch) {
                                prazo = prazoBlockMatch[0].replace(/Prazo para desenvolvimento:/i, '').replace(/[\r\n]+/g, ' ').trim();
                            }
                            const dbName = dbMatch ? dbMatch[1].trim() : '[NÃO ENCONTRADO]';
                            const backupDate = dateMatch ? dateMatch[1].trim() : '[NÃO ENCONTRADO]';
                            const records = [];
                            const recordRegex = /^\s*(?:•\s*)?([\w\s\/çãéóíúâêôûà`ü]+):\s*([\d\.]+|Não localizado)[\s\w]*$/gmi;
                            let match;
                            const textWithoutPrazo = prazoBlockMatch ? text.substring(0, prazoBlockMatch.index) : text;
                            while ((match = recordRegex.exec(textWithoutPrazo)) !== null) {
                                if (!/banco|data|prazo/i.test(match[1])) {
                                    records.push({ key: match[1].trim(), value: match[2].trim() });
                                }
                            }
                            let summaryHtml = `<p>Banco de dados analisado: <strong>${dbName}</strong><br>Data de coleta do Backup: <strong>${backupDate}</strong>`;
                            if (records.length > 0) {
                                summaryHtml += `<br>`;
                                records.forEach(record => {
                                    const valueText = /não localizado/i.test(record.value) ? record.value : `${record.value} registros`;
                                    summaryHtml += `&nbsp; &nbsp; &bull; ${record.key}: <strong>${valueText}</strong><br>`;
                                });
                                summaryHtml = summaryHtml.slice(0, -4);
                            }
                            summaryHtml += `</p>`;
                            const prazoHtml = `<p>Prazo para desenvolvimento: <strong>${prazo}</strong></p>`;
                            const finalHtml = [
                                '<p>Realizada análise de migração.</p>',
                                '<p>Segue relatório completo em anexo.</p>',
                                '<p><strong>RESUMO</strong></p>',
                                summaryHtml,
                                prazoHtml,
                                '<p>&nbsp;</p>',
                                '<hr>',
                                '<p><strong>INFORMAÇÕES INTERNAS</strong></p>',
                                `<p>Projeto de migração ${dbName} <strong>desenvolvido</strong>.</p>`
                            ].join('\n');

                            editor.insertContent(finalHtml);

                        } catch (error) {
                            console.error("Erro ao processar o texto do relatório:", error);
                            Swal.fire('Erro', 'Não foi possível formatar o texto. Verifique se o conteúdo colado está no formato esperado.', 'error');
                        } finally {
                            delete window.handleRelatorioData;
                        }
                    };

                    const idealWidth = Math.min(900, window.innerWidth * 0.9);
                    const idealHeight = Math.min(700, window.innerHeight * 0.9);

                    editor.windowManager.openUrl({
                        title: 'Inserir Dados do Relatório',
                        url: 'site/relatorioanalise.html',
                        width: idealWidth,
                        height: idealHeight,
                        onClose: () => {
                            if (window.handleRelatorioData) {
                                delete window.handleRelatorioData;
                            }
                        }
                    });
                };

                const ExibirFormatarTelefone = function() {
                    const idealWidth = Math.min(800, window.innerWidth * 0.9);
                    const idealHeight = Math.min(500, window.innerHeight * 0.9);

                    tinymce.activeEditor.windowManager.openUrl({
                        title: 'Formatar Telefone para Discagem',
                        url: 'site/numertel.html',
                        width: idealWidth,
                        height: idealHeight
                    });
                };

                const ExibirTopicoTarefa = function() {
                    const idealWidth = Math.min(1000, window.innerWidth * 0.9);
                    const idealHeight = Math.min(650, window.innerHeight * 0.9);

                    tinymce.activeEditor.windowManager.openUrl({
                        title: 'Tópico Tarefa',
                        url: 'site/topicotarefa.html',
                        width: idealWidth,
                        height: idealHeight
                    });
                };

                const ExibirTopicoOS = function() {
                    const idealWidth = Math.min(1200, window.innerWidth * 0.9);
                    const idealHeight = Math.min(850, window.innerHeight * 0.9);

                    tinymce.activeEditor.windowManager.openUrl({
                        title: 'Tópico OS',
                        url: 'site/topicoos.html',
                        width: idealWidth,
                        height: idealHeight
                    });
                };

                const ExibirGeradorScripts = () => {
                    const idealWidth = Math.min(600, window.innerWidth * 0.8);
                    const idealHeight = Math.min(700, window.innerHeight * 0.9);

                    tinymce.activeEditor.windowManager.openUrl({
                        title: 'Gerador de Script Unificado',
                        url: 'site/gerador-scripts.html',
                        width: idealWidth,
                        height: idealHeight
                    });
                };

                const actionFunctions = {
                    openRelatorioAnaliseDialog: openRelatorioAnaliseDialog,
                    inserirScriptValidacaoAnexo: inserirScriptValidacaoAnexo,
                    inserirScriptValidacaoRede: inserirScriptValidacaoRede
                };

                const loadProtocolsIfNeeded = () => {
                    if (cachedProtocolsData !== null) return;
                    cachedProtocolsData = 'loading';

                    fetch('data/protocolos.json')
                        .then(response => {
                            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                            return response.json();
                        })
                        .then(data => {
                            cachedProtocolsData = data;
                        })
                        .catch(error => {
                            console.error('Falha ao carregar protocolos.json:', error);
                            cachedProtocolsData= 'error';
                        });
                };

                const loadClickUpMenuIfNeeded = () => {
                 if (cachedClickUpData !== null) return;
                 cachedClickUpData = 'loading';

                 fetch('data/clickup_menu.json')
                     .then(response => {
                         if (!response.ok) throw new Error('HTTP error!');
                         return response.json();
                     })
                     .then(data => {
                         cachedClickUpData = data; // Salva os dados brutos no cache
                     })
                     .catch(error => {
                         console.error('Falha ao carregar clickup_menu.json:', error);
                         cachedClickUpData = 'error';
                     });
             };

                loadProtocolsIfNeeded();
                loadClickUpMenuIfNeeded();

                // ===================================================================================
                // == ÍCONES PERSONALIZADOS ==========================================================
                // ===================================================================================

                editor.ui.registry.addIcon('sparkles', '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.25L13.06 5.69L16.5 6.75L13.06 7.81L12 11.25L10.94 7.81L7.5 6.75L10.94 5.69L12 2.25ZM6 9L7.06 12.44L10.5 13.5L7.06 14.56L6 18L4.94 14.56L1.5 13.5L4.94 12.44L6 9ZM18 12L16.94 15.44L13.5 16.5L16.94 17.56L18 21L19.06 17.56L22.5 16.5L19.06 15.44L18 12Z" fill="currentColor"/></svg>');
                editor.ui.registry.addIcon('edit-sparkles', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" transform="matrix(-1, 0, 0, 1, 0, 0)" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path opacity="0.5" d="M3.84453 3.84453C2.71849 4.97056 2.71849 6.79623 3.84453 7.92226L5.43227 9.51C5.44419 9.49622 5.98691 10.013 6 9.99989L10 5.99989C10.0131 5.98683 9.49625 5.44415 9.50999 5.43226L7.92226 3.84453C6.79623 2.71849 4.97056 2.71849 3.84453 3.84453Z" fill="currentColor"></path> <path opacity="0.5" d="M5.1332 15.3072C5.29414 14.8976 5.87167 14.8976 6.03261 15.3072L6.18953 15.7065C6.23867 15.8316 6.33729 15.9306 6.46188 15.9799L6.85975 16.1374C7.26783 16.2989 7.26783 16.8786 6.85975 17.0401L6.46188 17.1976C6.33729 17.2469 6.23867 17.3459 6.18953 17.471L6.03261 17.8703C5.87167 18.2799 5.29414 18.2799 5.1332 17.8703L4.97628 17.471C4.92714 17.3459 4.82852 17.2469 4.70393 17.1976L4.30606 17.0401C3.89798 16.8786 3.89798 16.2989 4.30606 16.1374L4.70393 15.9799C4.82852 15.9306 4.92714 15.8316 4.97628 15.7065L5.1332 15.3072Z" fill="currentColor"></path> <path opacity="0.2" d="M19.9672 9.12945C20.1281 8.71987 20.7057 8.71987 20.8666 9.12945L21.0235 9.5288C21.0727 9.65385 21.1713 9.75284 21.2959 9.80215L21.6937 9.95965C22.1018 10.1212 22.1018 10.7009 21.6937 10.8624L21.2959 11.0199C21.1713 11.0692 21.0727 11.1682 21.0235 11.2932L20.8666 11.6926C20.7057 12.1022 20.1281 12.1022 19.9672 11.6926L19.8103 11.2932C19.7611 11.1682 19.6625 11.0692 19.5379 11.0199L19.14 10.8624C18.732 10.7009 18.732 10.1212 19.14 9.95965L19.5379 9.80215C19.6625 9.75284 19.7611 9.65385 19.8103 9.5288L19.9672 9.12945Z" fill="currentColor"></path> <path opacity="0.7" d="M16.1 2.30719C16.261 1.8976 16.8385 1.8976 16.9994 2.30719L17.4298 3.40247C17.479 3.52752 17.5776 3.62651 17.7022 3.67583L18.7934 4.1078C19.2015 4.26934 19.2015 4.849 18.7934 5.01054L17.7022 5.44252C17.5776 5.49184 17.479 5.59082 17.4298 5.71587L16.9995 6.81115C16.8385 7.22074 16.261 7.22074 16.1 6.81116L15.6697 5.71587C15.6205 5.59082 15.5219 5.49184 15.3973 5.44252L14.3061 5.01054C13.898 4.849 13.898 4.26934 14.3061 4.1078L15.3973 3.67583C15.5219 3.62651 15.6205 3.52752 15.6697 3.40247L16.1 2.30719Z" fill="currentColor"></path> <path d="M10.5681 6.48999C10.5562 6.50373 10.0133 5.9867 10.0002 5.99975L6.00024 9.99975C5.98715 10.0128 6.50414 10.5558 6.49036 10.5677L16.078 20.1553C17.204 21.2814 19.0297 21.2814 20.1557 20.1553C21.2818 19.0293 21.2818 17.2036 20.1557 16.0776L10.5681 6.48999Z" fill="currentColor"></path> </g></svg>');
                editor.ui.registry.addIcon('fone', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.5562 12.9062L16.1007 13.359C16.1007 13.359 15.0181 14.4355 12.0631 11.4972C9.10812 8.55901 10.1907 7.48257 10.1907 7.48257L10.4775 7.19738C11.1841 6.49484 11.2507 5.36691 10.6342 4.54348L9.37326 2.85908C8.61028 1.83992 7.13596 1.70529 6.26145 2.57483L4.69185 4.13552C4.25823 4.56668 3.96765 5.12559 4.00289 5.74561C4.09304 7.33182 4.81071 10.7447 8.81536 14.7266C13.0621 18.9492 17.0468 19.117 18.6763 18.9651C19.1917 18.9171 19.6399 18.6546 20.0011 18.2954L21.4217 16.883C22.3806 15.9295 22.1102 14.2949 20.8833 13.628L18.9728 12.5894C18.1672 12.1515 17.1858 12.2801 16.5562 12.9062Z" fill="currentColor"></path> </g></svg>');
                editor.ui.registry.addIcon('topicotarefa', '<svg width="20px" height="20px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="currentColor" transform="matrix(-1, 0, 0, 1, 0, 0)" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>topic-filled</title> <g id="Page-1" stroke="none" stroke-width="1" fill="currentColor" fill-rule="evenodd"> <g id="icon" fill="currentColor" transform="translate(21.333333, 85.333333)"> <path d="M448,1.42108547e-14 L448,341.333333 L106.666667,341.333333 L3.55271368e-15,170.666667 L106.666667,1.42108547e-14 L448,1.42108547e-14 Z M254.919831,64 L222.348588,64 L213.208698,124.371677 L181.135995,124.371677 L181.135995,151.32063 L209.054203,151.32063 L203.07173,190.91602 L170.666667,190.91602 L170.666667,217.864973 L198.917235,217.864973 L189.943525,277.333333 L222.514768,277.333333 L231.488478,217.864973 L265.389159,217.864973 L256.41545,277.333333 L288.986693,277.333333 L297.960402,217.864973 L330.864005,217.864973 L330.864005,190.91602 L302.114898,190.91602 L308.097371,151.32063 L341.333333,151.32063 L341.333333,124.371677 L312.251866,124.371677 L321.391756,64 L288.820513,64 L279.680623,124.371677 L245.779942,124.371677 L254.919831,64 Z M277.333333,149.333333 L270.933333,192 L234.666667,192 L241.066667,149.333333 L277.333333,149.333333 Z" id="Combined-Shape"> </path> </g> </g> </g></svg>');
                editor.ui.registry.addIcon('topicoos', '<svg width="20px" height="20px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>topic</title> <g id="Page-1" stroke="none" stroke-width="1" fill="currentColor" fill-rule="evenodd"> <g id="icon" fill="currentColor" transform="translate(21.333333, 85.333333)"> <path d="M448,1.42108547e-14 L448,341.333333 L106.666667,341.333333 L3.55271368e-15,170.666667 L106.666667,1.42108547e-14 L448,1.42108547e-14 Z M405.333333,42.6666667 L130.282667,42.6666667 L50.2826667,170.666667 L130.282667,298.666667 L405.333333,298.666667 L405.333333,42.6666667 Z M254.919831,64 L245.779942,124.371677 L279.680623,124.371677 L288.820513,64 L321.391756,64 L312.251866,124.371677 L341.333333,124.371677 L341.333333,151.32063 L308.097371,151.32063 L302.114898,190.91602 L330.864005,190.91602 L330.864005,217.864973 L297.960402,217.864973 L288.986693,277.333333 L256.41545,277.333333 L265.389159,217.864973 L231.488478,217.864973 L222.514768,277.333333 L189.943525,277.333333 L198.917235,217.864973 L170.666667,217.864973 L170.666667,190.91602 L203.07173,190.91602 L209.054203,151.32063 L181.135995,151.32063 L181.135995,124.371677 L213.208698,124.371677 L222.348588,64 L254.919831,64 Z M277.333333,149.333333 L241.066667,149.333333 L234.666667,192 L270.933333,192 L277.333333,149.333333 Z" id="Combined-Shape"> </path> </g> </g> </g></svg>');
                editor.ui.registry.addIcon('reply', '<svg fill="currentColor" width="20px" height="20px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>reply</title> <path d="M3.488 15.136q0 0.96 0.8 1.472l10.72 7.136q0.416 0.288 0.896 0.32t0.928-0.224 0.704-0.672 0.256-0.896v-3.584q3.456 0 6.208 1.984t3.872 5.152q0.64-1.792 0.64-3.552 0-2.912-1.44-5.376t-3.904-3.904-5.376-1.44v-3.584q0-0.48-0.256-0.896t-0.704-0.672-0.928-0.224-0.896 0.32l-10.72 7.136q-0.8 0.512-0.8 1.504z"></path> </g></svg>');
                editor.ui.registry.addIcon('inseriraudio', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" /><path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" /></svg>');
                editor.ui.registry.addIcon('uppercase', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_iconCarrier"> <path d="M9 9L9 4M9 9L6.5 7M9 9L11.5 7" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.5861 19.1946C10.5203 18.9868 10.3274 18.8455 10.1094 18.8455H7.55474C7.33675 18.8455 7.14388 18.9868 7.07807 19.1946L6.65978 20.5154C6.59397 20.7233 6.4011 20.8645 6.18311 20.8645H4.72359C4.37391 20.8645 4.13223 20.5148 4.2559 20.1877L7.60741 11.3232C7.68095 11.1287 7.86717 11 8.0751 11H9.58987C9.7974 11 9.98336 11.1282 10.0572 11.3222L13.4308 20.1867C13.5553 20.5139 13.3136 20.8645 12.9635 20.8645H11.4811C11.2631 20.8645 11.0702 20.7233 11.0044 20.5154L10.5861 19.1946ZM7.79577 16.9252C7.75489 17.0541 7.85115 17.1856 7.98642 17.1856H9.66955C9.80482 17.1856 9.90108 17.0541 9.8602 16.9252L9.01863 14.2707C8.95964 14.0846 8.69633 14.0846 8.63734 14.2707L7.79577 16.9252Z" fill="currentColor"></path> <path d="M18.1268 20.8645C18.0402 20.8645 17.9763 20.8529 17.9413 20.7736C17.8621 20.5943 17.6066 20.4922 17.4472 20.6064C17.0811 20.8688 16.6326 21 16.1016 21C15.3584 21 14.7409 20.7967 14.2491 20.3902C13.7628 19.9837 13.5196 19.4575 13.5196 18.8117C13.5196 18.0438 13.8147 17.4499 14.4048 17.0298C15.0005 16.6098 15.8557 16.3952 16.9705 16.3862H17.1754C17.4516 16.3862 17.6754 16.1623 17.6754 15.8862V15.7967C17.6754 15.467 17.6071 15.2344 17.4705 15.0989C17.3339 14.9634 17.1344 14.8957 16.8721 14.8957C16.4947 14.8957 16.2402 15.0146 16.1087 15.2523C15.9751 15.494 15.7794 15.7358 15.5032 15.7358H14.1835C13.9074 15.7358 13.6755 15.5083 13.7433 15.2406C13.8596 14.7814 14.1457 14.3887 14.6016 14.0623C15.2191 13.6197 15.9978 13.3984 16.9377 13.3984C17.9104 13.3984 18.6618 13.6084 19.1918 14.0285C19.7274 14.444 19.9951 15.0402 19.9951 15.8171V19.2656C20.0061 19.8979 19.9951 20.3651 19.9951 20.7493C19.9951 20.8129 19.9436 20.8645 19.88 20.8645H18.1268ZM16.618 19.4959C16.8748 19.4959 17.0934 19.453 17.2738 19.3672C17.389 19.3124 17.4853 19.251 17.5626 19.1833C17.6435 19.1124 17.6754 19.0042 17.6754 18.8966V18.0379C17.6754 17.7618 17.4516 17.5379 17.1754 17.5379H17.118C16.7246 17.5379 16.4131 17.6418 16.1836 17.8496C15.9595 18.0574 15.8475 18.3351 15.8475 18.6829C15.8475 19.2249 16.1043 19.4959 16.618 19.4959Z" fill="currentColor"></path> </g></svg>');
                editor.ui.registry.addIcon('lowercase', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_iconCarrier"> <path d="M17 9L17 4M17 9L14.5 7M17 9L19.5 7" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M10.5861 19.1946C10.5203 18.9868 10.3274 18.8455 10.1094 18.8455H7.55474C7.33675 18.8455 7.14388 18.9868 7.07807 19.1946L6.65978 20.5154C6.59397 20.7233 6.4011 20.8645 6.18311 20.8645H4.72359C4.37391 20.8645 4.13223 20.5148 4.2559 20.1877L7.60741 11.3232C7.68095 11.1287 7.86717 11 8.0751 11H9.58987C9.7974 11 9.98336 11.1282 10.0572 11.3222L13.4308 20.1867C13.5553 20.5139 13.3136 20.8645 12.9635 20.8645H11.4811C11.2631 20.8645 11.0702 20.7233 11.0044 20.5154L10.5861 19.1946ZM7.79577 16.9252C7.75489 17.0541 7.85115 17.1856 7.98642 17.1856H9.66955C9.80482 17.1856 9.90108 17.0541 9.8602 16.9252L9.01863 14.2707C8.95964 14.0846 8.69633 14.0846 8.63734 14.2707L7.79577 16.9252Z" fill="currentColor"></path> <path d="M18.1268 20.8645C18.0402 20.8645 17.9763 20.8529 17.9413 20.7736C17.8621 20.5943 17.6066 20.4922 17.4472 20.6064C17.0811 20.8688 16.6326 21 16.1016 21C15.3584 21 14.7409 20.7967 14.2491 20.3902C13.7628 19.9837 13.5196 19.4575 13.5196 18.8117C13.5196 18.0438 13.8147 17.4499 14.4048 17.0298C15.0005 16.6098 15.8557 16.3952 16.9705 16.3862H17.1754C17.4516 16.3862 17.6754 16.1623 17.6754 15.8862V15.7967C17.6754 15.467 17.6071 15.2344 17.4705 15.0989C17.3339 14.9634 17.1344 14.8957 16.8721 14.8957C16.4947 14.8957 16.2402 15.0146 16.1087 15.2523C15.9751 15.494 15.7794 15.7358 15.5032 15.7358H14.1835C13.9074 15.7358 13.6755 15.5083 13.7433 15.2406C13.8596 14.7814 14.1457 14.3887 14.6016 14.0623C15.2191 13.6197 15.9978 13.3984 16.9377 13.3984C17.9104 13.3984 18.6618 13.6084 19.1918 14.0285C19.7274 14.444 19.9951 15.0402 19.9951 15.8171V19.2656C20.0061 19.8979 19.9951 20.3651 19.9951 20.7493C19.9951 20.8129 19.9436 20.8645 19.88 20.8645H18.1268ZM16.618 19.4959C16.8748 19.4959 17.0934 19.453 17.2738 19.3672C17.389 19.3124 17.4853 19.251 17.5626 19.1833C17.6435 19.1124 17.6754 19.0042 17.6754 18.8966V18.0379C17.6754 17.7618 17.4516 17.5379 17.1754 17.5379H17.118C16.7246 17.5379 16.4131 17.6418 16.1836 17.8496C15.9595 18.0574 15.8475 18.3351 15.8475 18.6829C15.8475 19.2249 16.1043 19.4959 16.618 19.4959Z" fill="currentColor"></path> </g></svg>');
                editor.ui.registry.addIcon('upperlowercase', '<svg width="25px" height="25px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g id="SVGRepo_iconCarrier"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.495 9.052l.891 2.35h1.091L6.237 3h-1.02L2 11.402h1.095l.838-2.35h3.562zM5.811 4.453l.044.135 1.318 3.574H4.255l1.307-3.574.044-.135.038-.156.032-.152.021-.126h.023l.024.126.029.152.038.156zm7.984 6.011v.936h.96V7.498c0-.719-.18-1.272-.539-1.661-.359-.389-.889-.583-1.588-.583-.199 0-.401.019-.606.056a4.875 4.875 0 0 0-1.078.326 2.081 2.081 0 0 0-.343.188v.984c.266-.23.566-.411.904-.54a2.927 2.927 0 0 1 1.052-.193c.188 0 .358.028.513.085a.98.98 0 0 1 .396.267c.109.121.193.279.252.472.059.193.088.427.088.7l-1.811.252c-.344.047-.64.126-.888.237a1.947 1.947 0 0 0-.615.419 1.6 1.6 0 0 0-.36.58 2.134 2.134 0 0 0-.117.721c0 .246.042.475.124.688.082.213.203.397.363.551.16.154.36.276.598.366.238.09.513.135.826.135.402 0 .76-.092 1.075-.278.315-.186.572-.454.771-.806h.023zm-2.128-1.743c.176-.064.401-.114.674-.149l1.465-.205v.609c0 .246-.041.475-.123.688a1.727 1.727 0 0 1-.343.557 1.573 1.573 0 0 1-.524.372 1.63 1.63 0 0 1-.668.135c-.187 0-.353-.025-.495-.076a1.03 1.03 0 0 1-.357-.211.896.896 0 0 1-.22-.316A1.005 1.005 0 0 1 11 9.732a1.6 1.6 0 0 1 .055-.44.739.739 0 0 1 .202-.334 1.16 1.16 0 0 1 .41-.237z"></path></g></svg>');
                editor.ui.registry.addIcon('calendar-days', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 11.993a.75.75 0 0 0-.75.75v.006c0 .414.336.75.75.75h.006a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75H12ZM12 16.494a.75.75 0 0 0-.75.75v.005c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H12ZM8.999 17.244a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.006ZM7.499 16.494a.75.75 0 0 0-.75.75v.005c0 .414.336.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H7.5ZM13.499 14.997a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.005a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.005ZM14.25 16.494a.75.75 0 0 0-.75.75v.006c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75h-.005ZM15.75 14.995a.75.75 0 0 1 .75-.75h.005a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75H16.5a.75.75 0 0 1-.75-.75v-.006ZM13.498 12.743a.75.75 0 0 1 .75-.75h2.25a.75.75 0 1 1 0 1.5h-2.25a.75.75 0 0 1-.75-.75ZM6.748 14.993a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" /><path fill-rule="evenodd" d="M18 2.993a.75.75 0 0 0-1.5 0v1.5h-9V2.994a.75.75 0 1 0-1.5 0v1.497h-.752a3 3 0 0 0-3 3v11.252a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3V7.492a3 3 0 0 0-3-3H18V2.993ZM3.748 18.743v-7.5a1.5 1.5 0 0 1 1.5-1.5h13.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-13.5a1.5 1.5 0 0 1-1.5-1.5Z" clip-rule="evenodd" /></svg>');
                editor.ui.registry.addIcon('linkos', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M20 4L12 12M20 4V8.5M20 4H15.5M19 12.5V16.8C19 17.9201 19 18.4802 18.782 18.908C18.5903 19.2843 18.2843 19.5903 17.908 19.782C17.4802 20 16.9201 20 15.8 20H7.2C6.0799 20 5.51984 20 5.09202 19.782C4.71569 19.5903 4.40973 19.2843 4.21799 18.908C4 18.4802 4 17.9201 4 16.8V8.2C4 7.0799 4 6.51984 4.21799 6.09202C4.40973 5.71569 4.71569 5.40973 5.09202 5.21799C5.51984 5 6.07989 5 7.2 5H11.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'); 
                editor.ui.registry.addIcon('linktarefa', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M7.25007 2.38782C8.54878 2.0992 10.1243 2 12 2C13.8757 2 15.4512 2.0992 16.7499 2.38782C18.06 2.67897 19.1488 3.176 19.9864 4.01358C20.824 4.85116 21.321 5.94002 21.6122 7.25007C21.9008 8.54878 22 10.1243 22 12C22 13.8757 21.9008 15.4512 21.6122 16.7499C21.321 18.06 20.824 19.1488 19.9864 19.9864C19.1488 20.824 18.06 21.321 16.7499 21.6122C15.4512 21.9008 13.8757 22 12 22C10.1243 22 8.54878 21.9008 7.25007 21.6122C5.94002 21.321 4.85116 20.824 4.01358 19.9864C3.176 19.1488 2.67897 18.06 2.38782 16.7499C2.0992 15.4512 2 13.8757 2 12C2 10.1243 2.0992 8.54878 2.38782 7.25007C2.67897 5.94002 3.176 4.85116 4.01358 4.01358C4.85116 3.176 5.94002 2.67897 7.25007 2.38782ZM16 14C16 14.5523 15.5523 15 15 15C14.4477 15 14 14.5523 14 14V11.4142L9.70711 15.7071C9.31658 16.0976 8.68342 16.0976 8.29289 15.7071C7.90237 15.3166 7.90237 14.6834 8.29289 14.2929L12.5858 10H10C9.44772 10 9 9.55228 9 9C9 8.44772 9.44772 8 10 8H14.6717C15.4054 8 16 8.59489 16 9.32837V14Z" fill="currentColor"></path> </g></svg>');                editor.ui.registry.addIcon('protocolo', '<svg version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve" width="20px" height="20px" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} </style> <g> <polygon points="20,2.6 20,8 25.4,8 "></polygon> </g> <path d="M23.5,10H19c-0.6,0-1-0.4-1-1V2H7C6.4,2,6,2.4,6,3v12h7.6l-2.3-2.3c-0.4-0.4-0.4-1,0-1.4s1-0.4,1.4,0l4,4 c0.1,0.1,0.2,0.2,0.2,0.3c0.1,0.2,0.1,0.5,0,0.8c-0.1,0.1-0.1,0.2-0.2,0.3l-4,4C12.5,20.9,12.3,21,12,21s-0.5-0.1-0.7-0.3 c-0.4-0.4-0.4-1,0-1.4l2.3-2.3H6v12c0,0.6,0.4,1,1,1h18c0.6,0,1-0.4,1-1V12.5C26,11.1,24.9,10,23.5,10z"></path> </g></svg>');  
                editor.ui.registry.addIcon('attachment', '<svg version="1.1" id="svg2" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" sodipodi:docname="paper-clip.svg" inkscape:version="0.48.4 r9939" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 1200 1200" enable-background="new 0 0 1200 1200" xml:space="preserve" fill="currentColor" transform="matrix(-1, 0, 0, 1, 0, 0)rotate(270)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="path15389" inkscape:connector-curvature="0" d="M471.701,1111.207C677.774,906.278,838.97,742.464,1018.27,566.612 c59.195-61.825,96.687-122.337,112.472-181.532c27.626-111.707-14.849-208.44-88.793-284.137 C970.914,29.909,894.947-3.635,814.047,0.312s-160.812,44.726-239.74,122.337L71.146,627.78l82.874,80.899L657.18,205.521 c51.63-49.087,113.07-95.365,183.505-88.793c107.317,15.066,202.091,146.416,177.587,238.754 c-31.071,81.924-73.905,119.289-133.189,178.571c-180.341,179.88-320.956,318.983-496.253,494.279 c-65.88,60.199-108.486,76.498-169.692,19.732c-31.571-31.571-45.383-62.484-41.437-92.739 c4.379-35.301,24.363-59.717,47.355-82.873l459.748-459.75c21.003-21.04,68.836-61.425,88.793-43.409 c15.311,35.521-24.12,69.425-43.408,88.793l-422.26,422.259l80.899,82.874L813.06,540.961 c73.069-75.365,125.566-167.46,43.409-252.566c-90.862-77.988-186.583-25.923-254.539,41.437L142.182,789.58 c-47.355,47.355-74.323,98.658-80.899,153.908c-5.188,77.454,29.733,139.628,76.953,187.451 c44.385,44.143,92.336,68.594,151.936,69.061C361.828,1197.131,432.284,1149.934,471.701,1111.207L471.701,1111.207z"></path> </g></svg>');
                editor.ui.registry.addIcon('folder', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M19 8.36864V9.8C19 12.2513 19 13.477 18.1799 14.2385C17.3598 15 16.0399 15 13.4 15H12.75V18C12.75 18.0479 12.7455 18.0947 12.7369 18.1401C13.2444 18.3414 13.6499 18.7443 13.8546 19.25H14H21.25C21.6642 19.25 22 19.5858 22 20C22 20.4142 21.6642 20.75 21.25 20.75H14H13.8546C13.5579 21.483 12.8394 22 12 22C11.1607 22 10.4421 21.483 10.1454 20.75H10H2.75C2.33579 20.75 2 20.4142 2 20C2 19.5858 2.33579 19.25 2.75 19.25H10H10.1454C10.3501 18.7443 10.7556 18.3414 11.2631 18.1401C11.2545 18.0947 11.25 18.0479 11.25 18V15H10.6C7.96015 15 6.64022 15 5.82012 14.2385C5.00002 13.477 5.00002 12.2513 5.00002 9.8V5.21734C5.00002 4.64369 5.00002 4.35687 5.04856 4.11795C5.26227 3.0662 6.14824 2.24352 7.28089 2.04508C7.53818 2 7.84707 2 8.46484 2C8.73552 2 8.87085 2 9.00092 2.01129C9.56167 2.05999 10.0936 2.26457 10.5272 2.59833C10.6277 2.67575 10.7234 2.76461 10.9148 2.94234L11.3 3.3C11.8711 3.83026 12.1566 4.09538 12.4985 4.27203C12.6863 4.36906 12.8856 4.44569 13.0923 4.5004C13.4685 4.6 13.8723 4.6 14.6799 4.6H14.9415C16.7841 4.6 17.7055 4.6 18.3043 5.10015C18.3594 5.14616 18.4118 5.19484 18.4614 5.24599C19 5.80208 19 6.6576 19 8.36864ZM12.75 7.5C12.75 7.08579 13.0858 6.75 13.5 6.75H16.5C16.9142 6.75 17.25 7.08579 17.25 7.5C17.25 7.91421 16.9142 8.25 16.5 8.25H13.5C13.0858 8.25 12.75 7.91421 12.75 7.5Z" fill="currentColor"></path> </g></svg>');
                editor.ui.registry.addIcon('menu-protocolos-de-maria', '<svg width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-three-dots-vertical"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"></path> </g></svg>');
                editor.ui.registry.addIcon('migration', '<svg width="20px" height="20px" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="currentColor" transform="matrix(-1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>db-copy</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="24px-Glyph" stroke="none" stroke-width="1" fill="currentColor" fill-rule="evenodd"> <g id="db-copy" fill="currentColor"> <path d="M42.8809,12.6572 C40.9209,7.3982 36.6489,4.0002 31.9999,4.0002 C25.3829,4.0002 19.9999,10.7282 19.9999,19.0002 L19.9999,20.5862 L16.7069,17.2932 C16.3169,16.9022 15.6839,16.9022 15.2929,17.2932 C14.9019,17.6832 14.9019,18.3162 15.2929,18.7072 L20.2919,23.7052 C20.3839,23.7982 20.4949,23.8722 20.6179,23.9232 C20.7399,23.9732 20.8699,24.0002 20.9999,24.0002 C21.1299,24.0002 21.2599,23.9732 21.3819,23.9232 C21.5049,23.8722 21.6159,23.7982 21.7079,23.7052 L26.7069,18.7072 C27.0979,18.3162 27.0979,17.6832 26.7069,17.2932 C26.3169,16.9022 25.6839,16.9022 25.2929,17.2932 L21.9999,20.5862 L21.9999,19.0002 C21.9999,11.8322 26.4859,6.0002 31.9999,6.0002 C35.8059,6.0002 39.3419,8.8872 41.0079,13.3562 C41.1999,13.8742 41.7769,14.1362 42.2939,13.9432 C42.8119,13.7512 43.0739,13.1752 42.8809,12.6572" id="Fill-433"> </path> <path d="M20,36 C12.28,36 8.125,34.888 6,33.418 L6,38 C6,41.888 18.567,42 20,42 C21.433,42 34,41.888 34,38 L34,33.418 C31.875,34.888 27.72,36 20,36" id="Fill-434"> </path> <path d="M20,50 C21.433,50 34,49.888 34,46 L34,41.418 C31.875,42.888 27.72,44 20,44 C12.28,44 8.125,42.888 6,41.418 L6,46 C6,49.888 18.567,50 20,50" id="Fill-435"> </path> <path d="M20,52 C12.28,52 8.125,50.888 6,49.418 L6,54 C6,57.888 18.567,58 20,58 C21.433,58 34,57.888 34,54 L34,49.418 C31.875,50.888 27.72,52 20,52" id="Fill-436"> </path> <path d="M20,34 C21.433,34 34,33.888 34,30 C34,26.112 21.433,26 20,26 C18.567,26 6,26.112 6,30 C6,33.888 18.567,34 20,34" id="Fill-437"> </path> <path d="M44,24 C45.433,24 58,23.888 58,20 C58,16.112 45.433,16 44,16 C42.567,16 30,16.112 30,20 C30,23.888 42.567,24 44,24" id="Fill-438"> </path> <path d="M44,42 C40.731,42 38.107,41.799 36,41.457 L36,47.382 C39.452,47.968 43.25,48 44,48 C45.433,48 58,47.888 58,44 L58,39.418 C55.875,40.888 51.72,42 44,42" id="Fill-439"> </path> <path d="M44,34 C40.731,34 38.107,33.799 36,33.457 L36,39.382 C39.452,39.968 43.25,40 44,40 C45.433,40 58,39.888 58,36 L58,31.418 C55.875,32.888 51.72,34 44,34" id="Fill-440"> </path> <path d="M44,26 C36.28,26 32.125,24.888 30,23.418 L30,24.943 C34.758,26.112 36,28.172 36,30 L36,31.382 C39.452,31.968 43.25,32 44,32 C45.433,32 58,31.888 58,28 L58,23.418 C55.875,24.888 51.72,26 44,26" id="Fill-441"> </path> </g> </g> </g></svg>');
                editor.ui.registry.addIcon('analysis-report', '<svg fill="currentColor" height="20px" width="20px" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path class="cls-1" d="M5.919,12.10268A11.86918,11.86918,0,0,1,4.32506,11.843c-.12043-.02846-.23356-.05838-.343-.08978-.10508-.02993-.20653-.05983-.30141-.09268-.835-.27954-1.31961-.63425-1.31961-.97219V9.75194c.01095.011.02848.01973.0416.0314a2.22566,2.22566,0,0,0,.30874.22189l.02773.0175a3.64957,3.64957,0,0,0,.42771.20656l.00876.00437c.03065.0124.06277.02555.09342.03868.04891.01825.10291.03358.15254.0511.08613.03138.173.06276.26276.09123.03137.01022.05983.02263.0934.0321.01608.00513.03578.0095.054.0146.17078.05038.35106.09416.53862.13576.04088.00877.07883.0168.12116.027.19926.0416.40727.0781.61965.111.04088.00658.08321.01168.12408.01751.19634.02847.39559.05255.60068.07372l.03714.00446-.61277.61314Zm-2.23765-7.74c.09633.03283.19634.06349.30289.09341.10876.03065.22261.06058.34232.08905a13.68092,13.68092,0,0,0,3.14206.33427,13.69663,13.69663,0,0,0,3.14424-.33427c.1197-.02847.23356-.0584.343-.08977.10582-.0292.20581-.05986.30288-.09269.835-.27881,1.32106-.635,1.32106-.97219,0-.7043-2.09909-1.48819-5.11122-1.48819-3.01,0-5.10687.78389-5.10687,1.48819C2.36173,3.72768,2.84782,4.08384,3.68133,4.36265Zm5.04692,6.49512.0074.00741.00856-.00857ZM3.68061,6.788c.09488.03283.19633.06275.30141.09268.10948.0314.22261.06132.343.08978a13.675,13.675,0,0,0,3.14279.335,13.69728,13.69728,0,0,0,3.14571-.335c.11971-.02846.23356-.05838.343-.08978.10438-.02993.20583-.05985.30144-.092.835-.28026,1.32105-.6357,1.32105-.97291V4.87938c-.01314.0117-.03065.02045-.04307.0314a2.29028,2.29028,0,0,1-.30726.22041.3532.3532,0,0,1-.02993.019,3.78834,3.78834,0,0,1-.42552.20655l-.011.00438c-.03065.01387-.06275.02628-.09488.03868-.04743.01752-.10145.03357-.14961.0511-.0876.03138-.17225.06275-.26348.09123-.03213.01022-.05985.02262-.092.03137-.01825.00585-.03942.01023-.0584.0168q-.25726.07224-.53645.13356c-.04087.00875-.08028.01825-.1226.027q-.29889.06349-.61748.11241c-.0416.00582-.08393.011-.1248.01677-.19779.02848-.3985.05328-.6036.07373l-.09488.01095c-.22554.02115-.454.03723-.68243.0489-.05108.00218-.10144.00438-.15254.0073-.235.00948-.46857.016-.7014.016-.23209,0-.4671-.00657-.70066-.016-.0511-.00292-.10218-.00512-.154-.0073-.227-.01167-.45543-.02775-.68023-.0489l-.09708-.01095C5.63079,5.93258,5.43154,5.9085,5.2352,5.88c-.04087-.00582-.0832-.011-.12408-.01677-.21238-.03285-.42039-.07008-.61965-.11241-.04233-.00875-.08028-.01825-.12116-.027-.18756-.04088-.36784-.0854-.53862-.1343-.01825-.00583-.03795-.01021-.054-.01533-.03357-.00948-.062-.02188-.0934-.0321-.08978-.02848-.17663-.05985-.26276-.09123-.04963-.01753-.10363-.03358-.15254-.05183-.03065-.0124-.06277-.02482-.09342-.03795l-.00876-.00438a3.76777,3.76777,0,0,1-.42771-.20655l-.02773-.01753a2.16733,2.16733,0,0,1-.30874-.22259c-.01312-.011-.03065-.01972-.0416-.03067V5.8158C2.361,6.153,2.84565,6.50845,3.68061,6.788Zm0,2.43628c.09488.03283.19633.06275.30141.09268.10948.0314.22261.06132.343.08978a13.14682,13.14682,0,0,0,2.64429.32709l.31747-.31766.32363.32367a14.37732,14.37732,0,0,0,2.47286-.22228l1.7528-1.75273c-.0213.00927-.0411.019-.0628.02819l-.011.00437c-.03065.01388-.06275.02628-.09488.03868-.04743.01752-.10145.0343-.14961.0511-.0876.03138-.17225.06275-.26348.09123-.03213.01022-.05985.0219-.092.03138-.01825.00584-.03942.01022-.0584.01679-.17151.04816-.35034.09341-.53645.13356-.04087.0095-.08028.01825-.1226.027q-.29889.06349-.61748.11168c-.0416.00658-.08393.01168-.1248.01751-.19779.02847-.3985.05329-.6036.07372l-.09488.011c-.22554.02043-.454.03723-.68243.0489l-.15254.00658c-.235.0102-.46857.01678-.7014.01678-.23209,0-.4671-.00658-.70066-.01678-.0511-.00293-.10218-.0044-.154-.00658-.227-.01167-.45543-.02847-.68023-.0489L5.83588,8.39c-.20509-.02117-.40434-.04525-.60068-.07372-.04087-.00583-.0832-.01093-.12408-.01751-.21238-.03212-.42039-.06935-.61965-.11168-.04233-.00875-.08028-.0175-.12116-.027-.18756-.04015-.36784-.0854-.53862-.135-.01825-.0051-.03795-.00948-.054-.0146-.03357-.0102-.062-.02188-.0934-.0321-.08978-.02848-.17663-.05985-.26276-.09123-.04963-.0168-.10363-.03358-.15254-.05183-.03065-.0124-.06277-.02482-.09342-.03795L3.16678,7.793a3.76946,3.76946,0,0,1-.42771-.20656l-.02773-.01751a2.169,2.169,0,0,1-.30874-.22261c-.01312-.011-.03065-.01972-.0416-.03067v.93642C2.361,8.58929,2.84565,8.94473,3.68061,9.22427ZM12.95,7.62435,8.73574,11.8386,7.287,10.38981,6.23351,11.44375,8.692,13.90227l5.2677-5.26819Z"></path> </g></svg>');
                editor.ui.registry.addIcon('building', '<svg fill="currentColor" width="20px" height="20px" viewBox="0 -8 72 72" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title>construction</title><path d="M27.69,34.62l-4.85-7.84.37-.36,1.6,1.37a1.5,1.5,0,0,0,.53,1.93,1.54,1.54,0,0,0,.81.23,1.49,1.49,0,0,0,.87-.27L37,38.2a.62.62,0,0,0,.44.18.64.64,0,0,0,.47-.21.65.65,0,0,0,0-.91L27.8,28.66l5-7.88a1.49,1.49,0,0,0,0-1.62,2.26,2.26,0,0,0-.25-.29L26.74,12a1.5,1.5,0,0,0-1.24-.66h0l-7.67.07a1.22,1.22,0,0,0-1.07.69l-2.37,5.09-.63-.54a.63.63,0,0,0-.9,0,.64.64,0,0,0,0,.91l.93.8-.24.53a1.52,1.52,0,0,0,.59,2,1.42,1.42,0,0,0,.74.2,1.51,1.51,0,0,0,1.27-.7l.78.67L13.4,24.87a2.37,2.37,0,0,0-.76,1.66l-.26,8.58L10.05,45.19A2.35,2.35,0,0,0,11.81,48a2.48,2.48,0,0,0,.54.06,2.35,2.35,0,0,0,2.29-1.83l2.44-10.53.23-7.63,1.4,1,4,6.49-4.38,9.15a2.35,2.35,0,1,0,4.25,2L27.76,36A1.37,1.37,0,0,0,27.69,34.62Z"></path><circle cx="33.46" cy="12.22" r="4.3"></circle><path d="M61.39,45.33c-1.44-2.1-8.34-15.16-10.12-17s-3.36-2.08-4.44-1.64a6.94,6.94,0,0,0-3,2.24c-1.27,1.73-3,6.91-4.44,9.23a11.08,11.08,0,0,0-.8,1l-.08.06c-1.06.64-4,1.19-5.19,2.4a15.63,15.63,0,0,0-1.92,2.6l-.18.25a8.22,8.22,0,0,1-3.93,3.27l0,.32H60.43C60.66,48.08,63.15,47.9,61.39,45.33Z"></path></g></svg>');
                editor.ui.registry.addIcon('limpar', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.0302 22H13.9902C13.5702 22 13.2402 21.66 13.2402 21.25C13.2402 20.84 13.5802 20.5 13.9902 20.5H21.0302C21.4502 20.5 21.7802 20.84 21.7802 21.25C21.7802 21.66 21.4502 22 21.0302 22Z" fill="currentColor"></path> <path d="M13.64 16.6894C14.03 17.0794 14.03 17.7094 13.64 18.1094L10.66 21.0894C9.55 22.1994 7.77 22.2594 6.59 21.2694C6.52 21.2094 6.46 21.1494 6.4 21.0894L5.53 20.2194L3.74 18.4294L2.88 17.5694C2.81 17.4994 2.75 17.4294 2.69 17.3594C1.71 16.1794 1.78 14.4194 2.88 13.3194L5.86 10.3394C6.25 9.94938 6.88 9.94938 7.27 10.3394L13.64 16.6894Z" fill="currentColor"></path> <path d="M21.1194 10.6414L16.1194 15.6414C15.7294 16.0314 15.0994 16.0314 14.7094 15.6414L8.33937 9.29141C7.94938 8.90141 7.94938 8.27141 8.33937 7.87141L13.3394 2.88141C14.5094 1.71141 16.4294 1.71141 17.5994 2.88141L21.1194 6.39141C22.2894 7.56141 22.2894 9.47141 21.1194 10.6414Z" fill="currentColor"></path> </g></svg>');
                editor.ui.registry.addIcon('closetab', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM8.96963 8.96965C9.26252 8.67676 9.73739 8.67676 10.0303 8.96965L12 10.9393L13.9696 8.96967C14.2625 8.67678 14.7374 8.67678 15.0303 8.96967C15.3232 9.26256 15.3232 9.73744 15.0303 10.0303L13.0606 12L15.0303 13.9696C15.3232 14.2625 15.3232 14.7374 15.0303 15.0303C14.7374 15.3232 14.2625 15.3232 13.9696 15.0303L12 13.0607L10.0303 15.0303C9.73742 15.3232 9.26254 15.3232 8.96965 15.0303C8.67676 14.7374 8.67676 14.2625 8.96965 13.9697L10.9393 12L8.96963 10.0303C8.67673 9.73742 8.67673 9.26254 8.96963 8.96965Z" fill="currentColor"></path> </g></svg>');

                editor.ui.registry.addIcon('modo-foco-max', '<svg width="25px" height="25px" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M7 2H2v5l1.8-1.8L6.5 8 8 6.5 5.2 3.8 7 2zm6 0l1.8 1.8L12 6.5 13.5 8l2.7-2.7L18 7V2h-5zm.5 10L12 13.5l2.7 2.7L13 18h5v-5l-1.8 1.8-2.7-2.8zm-7 0l-2.7 2.7L2 13v5h5l-1.8-1.8L8 13.5 6.5 12z"></path> </g> </g></svg>');
                editor.ui.registry.addIcon('modo-foco-min', '<svg width="25px" height="25px" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M3.4 2L2 3.4l2.8 2.8L3 8h5V3L6.2 4.8 3.4 2zm11.8 4.2L18 3.4 16.6 2l-2.8 2.8L12 3v5h5l-1.8-1.8zM4.8 13.8L2 16.6 3.4 18l2.8-2.8L8 17v-5H3l1.8 1.8zM17 12h-5v5l1.8-1.8 2.8 2.8 1.4-1.4-2.8-2.8L17 12z"></path> </g> </g></svg>');
                editor.ui.registry.addIcon('temas', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><title>2</title><g id="Layer_90" data-name="Layer 90"><path d="M61.41,31.24,32.76,2.59a2,2,0,0,0-2.83,0L13.27,19.25A6.25,6.25,0,0,0,9.06,29.91l5.78,5.78a2.25,2.25,0,0,1,0,3.19L4.13,49.59A7.27,7.27,0,1,0,14.41,59.87L25.12,49.16a2.31,2.31,0,0,1,3.19,0l5.78,5.78a6.25,6.25,0,0,0,8.84,0h0a6.23,6.23,0,0,0,1.82-4.21L61.41,34.06A2,2,0,0,0,61.41,31.24ZM40.11,52.11a2.26,2.26,0,0,1-3.19,0l-5.78-5.78a6.25,6.25,0,0,0-8.85,0L11.58,57A3.35,3.35,0,0,1,7,57a3.27,3.27,0,0,1,0-4.62L17.67,41.71a6.25,6.25,0,0,0,0-8.85l-5.78-5.78a2.25,2.25,0,0,1,3.16-3.21L40.13,48.95A2.26,2.26,0,0,1,40.11,52.11Zm3.22-5.62L43,46.14l0-.05-25-25-.05,0-.35-.35L31.35,6.83l2.83,2.83-6,8.64,8.64-6,4.86,4.86-3.1,5.57,5.57-3.1,7.55,7.55-6,8.64,8.64-6,2.89,2.89Z"></path></g></svg>');
                editor.ui.registry.addIcon('script-sql', '<svg width="32px" height="32px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"><title>icon 24 file sql</title><desc>Created with Sketch.</desc><defs></defs><g id="Page-1" stroke="none" stroke-width="1" fill="currentColor" fill-rule="evenodd" sketch:type="MSPage"><g id="icon-24-file-sql" sketch:type="MSArtboardGroup" fill="currentColor"><path d="M17.6756443,19.8827511 C17.463169,19.9587282 17.2340236,20 16.9951185,20 L16.0048815,20 C14.8938998,20 14,19.1019194 14,17.9940809 L14,15.0059191 C14,13.8865548 14.897616,13 16.0048815,13 L16.9951185,13 C18.1061002,13 19,13.8980806 19,15.0059191 L19,17.9940809 C19,18.4993595 18.8171018,18.9572008 18.5145823,19.3074755 L19.267767,20.0606602 L18.5606602,20.767767 L17.6756443,19.8827511 L17.6756443,19.8827511 L17.6756443,19.8827511 Z M16.7928932,19 L15.9989566,19 C15.4426603,19 15,18.5523709 15,18.0001925 L15,14.9998075 C15,14.4437166 15.4472481,14 15.9989566,14 L17.0010434,14 C17.5573397,14 18,14.4476291 18,14.9998075 L18,18.0001925 C18,18.2246463 17.9271364,18.4307925 17.8039499,18.5968431 L16.4393398,17.232233 L15.732233,17.9393398 L16.7928932,19 L16.7928932,19 L16.7928932,19 Z M8.00684834,10 C6.34621185,10 5,11.3422643 5,12.9987856 L5,20.0012144 C5,21.6573979 6.33599155,23 8.00684834,23 L24.9931517,23 C26.6537881,23 28,21.6577357 28,20.0012144 L28,12.9987856 C28,11.3426021 26.6640085,10 24.9931517,10 L8.00684834,10 L8.00684834,10 Z M7.99456145,11 C6.89299558,11 6,11.9001762 6,12.992017 L6,20.007983 C6,21.1081436 6.90234375,22 7.99456145,22 L25.0054385,22 C26.1070044,22 27,21.0998238 27,20.007983 L27,12.992017 C27,11.8918564 26.0976562,11 25.0054385,11 L7.99456145,11 L7.99456145,11 Z M10.0048815,13 C8.89761602,13 8,13.8877296 8,15 C8,16.1045695 8.88772964,17 10,17 L10.9906311,17 C11.5480902,17 12,17.4438648 12,18 C12,18.5522847 11.5573397,19 11.0010434,19 L9.99895656,19 C9.44724809,19 9,18.543716 9,18.0044713 L9,17.9931641 L8,17.9931641 L8,17.998921 C8,19.1040864 8.8938998,20 10.0048815,20 L10.9951185,20 C12.102384,20 13,19.1122704 13,18 C13,16.8954305 12.1122704,16 11,16 L10.0093689,16 C9.45190985,16 9,15.5561352 9,15 C9,14.4477153 9.44266033,14 9.99895656,14 L11.0010434,14 C11.5527519,14 12,14.453186 12,15 L13,15 C13,13.8954305 12.1061002,13 10.9951185,13 L10.0048815,13 L10.0048815,13 Z M25,19 L25,20 L20,20 L20,13 L21,13 L21,19 L25,19 L25,19 Z" id="file-sql" sketch:type="MSShapeGroup"></path></g></g></svg>')
                editor.ui.registry.addIcon('unificador', '<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 512 512"><path d="M416,56V32H312a24.028,24.028,0,0,0-24,24V208h8a8,8,0,0,1,5.657,2.343l64,64A8,8,0,0,1,368,280v8h88a24.028,24.028,0,0,0,24-24V96H456A40.045,40.045,0,0,1,416,56ZM328,80h48a8,8,0,0,1,0,16H328a8,8,0,0,1,0-16Zm0,48h16a8,8,0,0,1,0,16H328a8,8,0,0,1,0-16Zm0,64a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Zm112,48H376a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Zm0-48H424a8,8,0,0,1,0-16h16a8,8,0,0,1,0,16Zm0-48H376a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Zm-8-88V43.313L468.687,80H456A24.028,24.028,0,0,1,432,56ZM224,208V96H200a40.045,40.045,0,0,1-40-40V32H56A24.028,24.028,0,0,0,32,56V264a24.028,24.028,0,0,0,24,24h88V248a40.045,40.045,0,0,1,40-40ZM72,80h48a8,8,0,0,1,0,16H72a8,8,0,0,1,0-16Zm0,48H88a8,8,0,0,1,0,16H72a8,8,0,0,1,0-16Zm32,112H72a8,8,0,0,1,0-16h32a8,8,0,0,1,0,16Zm32-48H72a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Zm-16-48a8,8,0,0,1,0-16h64a8,8,0,0,1,0,16Zm40,40a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H168A8,8,0,0,1,160,184ZM176,56V43.313L212.687,80H200A24.028,24.028,0,0,1,176,56ZM288,248V224H184a24.028,24.028,0,0,0-24,24V456a24.028,24.028,0,0,0,24,24H328a24.028,24.028,0,0,0,24-24V288H328A40.045,40.045,0,0,1,288,248ZM224,360a8,8,0,1,1,8-8A8,8,0,0,1,224,360Zm32,0a8,8,0,1,1,8-8A8,8,0,0,1,256,360Zm32,0a8,8,0,1,1,8-8A8,8,0,0,1,288,360Zm40-88a24.028,24.028,0,0,1-24-24V235.313L340.687,272ZM64,344v40h40a8,8,0,0,1,0,16H56a8,8,0,0,1-8-8V344a8,8,0,0,1,16,0Zm344,56a8,8,0,0,1,0-16h40V344a8,8,0,0,1,16,0v48a8,8,0,0,1-8,8Z"/></svg>');
                editor.ui.registry.addIcon('em-construcao', '<svg fill="currentColor" width="20px" height="20px" viewBox="0 -8 72 72" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><title>construction</title><path d="M27.69,34.62l-4.85-7.84.37-.36,1.6,1.37a1.5,1.5,0,0,0,.53,1.93,1.54,1.54,0,0,0,.81.23,1.49,1.49,0,0,0,.87-.27L37,38.2a.62.62,0,0,0,.44.18.64.64,0,0,0,.47-.21.65.65,0,0,0,0-.91L27.8,28.66l5-7.88a1.49,1.49,0,0,0,0-1.62,2.26,2.26,0,0,0-.25-.29L26.74,12a1.5,1.5,0,0,0-1.24-.66h0l-7.67.07a1.22,1.22,0,0,0-1.07.69l-2.37,5.09-.63-.54a.63.63,0,0,0-.9,0,.64.64,0,0,0,0,.91l.93.8-.24.53a1.52,1.52,0,0,0,.59,2,1.42,1.42,0,0,0,.74.2,1.51,1.51,0,0,0,1.27-.7l.78.67L13.4,24.87a2.37,2.37,0,0,0-.76,1.66l-.26,8.58L10.05,45.19A2.35,2.35,0,0,0,11.81,48a2.48,2.48,0,0,0,.54.06,2.35,2.35,0,0,0,2.29-1.83l2.44-10.53.23-7.63,1.4,1,4,6.49-4.38,9.15a2.35,2.35,0,1,0,4.25,2L27.76,36A1.37,1.37,0,0,0,27.69,34.62Z"></path><circle cx="33.46" cy="12.22" r="4.3"></circle><path d="M61.39,45.33c-1.44-2.1-8.34-15.16-10.12-17s-3.36-2.08-4.44-1.64a6.94,6.94,0,0,0-3,2.24c-1.27,1.73-3,6.91-4.44,9.23a11.08,11.08,0,0,0-.8,1l-.08.06c-1.06.64-4,1.19-5.19,2.4a15.63,15.63,0,0,0-1.92,2.6l-.18.25a8.22,8.22,0,0,1-3.93,3.27l0,.32H60.43C60.66,48.08,63.15,47.9,61.39,45.33Z"></path></g></svg>');
                editor.ui.registry.addIcon('clickup', '<svg fill="currentColor" width="20px" height="20px" viewBox="0 0 24 24" role="img" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="m2 18.439 3.69-2.828c1.961 2.56 4.044 3.739 6.363 3.739 2.307 0 4.33-1.166 6.203-3.704L22 18.405C19.298 22.065 15.941 24 12.053 24 8.178 24 4.788 22.078 2 18.439zM12.04 6.15l-6.568 5.66-3.036-3.52L12.055 0l9.543 8.296-3.05 3.509z"></path></g></svg>');                
                editor.ui.registry.addIcon('formulario', '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H18C19.6569 23 21 21.6569 21 20V4C21 2.34315 19.6569 1 18 1H10ZM11 3H18C18.5523 3 19 3.44772 19 4V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3ZM9 7H6.41421L9 4.41421V7ZM16.7682 12.6402C17.1218 12.2159 17.0645 11.5853 16.6402 11.2318C16.2159 10.8782 15.5853 10.9355 15.2318 11.3598L10.9328 16.5186L8.70711 14.2929C8.31658 13.9024 7.68342 13.9024 7.29289 14.2929C6.90237 14.6834 6.90237 15.3166 7.29289 15.7071L10.2929 18.7071C10.4916 18.9058 10.7646 19.0117 11.0453 18.999C11.326 18.9862 11.5884 18.856 11.7682 18.6402L16.7682 12.6402Z" fill="currentView"></path> </g></svg>');
                editor.ui.registry.addIcon('calculadora-data', '<svg width="20px" height="20px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M19 4h-1V3a1 1 0 0 0-2 0v1H8V3a1 1 0 0 0-2 0v1H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm1 15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1v1a1 1 0 0 0 2 0V6h8v1a1 1 0 0 0 2 0V6h1a1 1 0 0 1 1 1Zm-8-4a4 4 0 1 1-4-4,4 4 0 0 1 4 4Zm-1-2.5V14a1 1 0 0 0 2 0v-1.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5Z"/></svg>');

                editor.ui.registry.addIcon('save-as', '<svg width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="m 4.5 0 c -0.277344 0 -0.5 0.222656 -0.5 0.5 v 1 c 0 0.277344 0.222656 0.5 0.5 0.5 h 1 c 0.277344 0 0.5 -0.222656 0.5 -0.5 v -1 c 0 -0.277344 -0.222656 -0.5 -0.5 -0.5 z m 3 0 c -0.277344 0 -0.5 0.222656 -0.5 0.5 v 1 c 0 0.277344 0.222656 0.5 0.5 0.5 h 1 c 0.277344 0 0.5 -0.222656 0.5 -0.5 v -1 c 0 -0.277344 -0.222656 -0.5 -0.5 -0.5 z m 3 0 c -0.277344 0 -0.5 0.222656 -0.5 0.5 v 1 c 0 0.277344 0.222656 0.5 0.5 0.5 h 1 c 0.277344 0 0.5 -0.222656 0.5 -0.5 v -1 c 0 -0.277344 -0.222656 -0.5 -0.5 -0.5 z m -3.5 3 v 6.585938 l -1.292969 -1.292969 c -0.1875 -0.1875 -0.441406 -0.292969 -0.707031 -0.292969 s -0.519531 0.105469 -0.707031 0.292969 c -0.390625 0.390625 -0.390625 1.023437 0 1.414062 l 3 3 c 0.390625 0.390625 1.023437 0.390625 1.414062 0 l 3 -3 c 0.390625 -0.390625 0.390625 -1.023437 0 -1.414062 s -1.023437 -0.390625 -1.414062 0 l -1.292969 1.292969 v -6.585938 z m -6 11 v 2 h 14 v -2 z m 0 0" fill="currentColor"></path> </g></svg>')
                editor.ui.registry.addIcon('save-alt', '<svg width="20px" height="20px" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColer"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="m 8 0 c -0.550781 0 -1 0.449219 -1 1 v 8.585938 l -1.292969 -1.292969 c -0.1875 -0.1875 -0.441406 -0.292969 -0.707031 -0.292969 s -0.519531 0.105469 -0.707031 0.292969 c -0.390625 0.390625 -0.390625 1.023437 0 1.414062 l 3 3 c 0.390625 0.390625 1.023437 0.390625 1.414062 0 l 3 -3 c 0.390625 -0.390625 0.390625 -1.023437 0 -1.414062 s -1.023437 -0.390625 -1.414062 0 l -1.292969 1.292969 v -8.585938 c 0 -0.550781 -0.449219 -1 -1 -1 z m -7 14 v 2 h 14 v -2 z m 0 0" fill="currentColor"></path> </g></svg>');
                editor.ui.registry.addIcon('pdf', '<svg width="20px" height="20px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="0" fill="none" width="20" height="20"></rect> <g> <style>.st0{fill-rule:evenodd;clip-rule:evenodd;}</style> <path d="M5.8 14H5v1h.8c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zM11 2H3v16h13V7l-5-5zM7.2 14.6c0 .8-.6 1.4-1.4 1.4H5v1H4v-4h1.8c.8 0 1.4.6 1.4 1.4v.2zm4.1.5c0 1-.8 1.9-1.9 1.9H8v-4h1.4c1 0 1.9.8 1.9 1.9v.2zM15 14h-2v1h1.5v1H13v1h-1v-4h3v1zm0-2H4V3h7v4h4v5zm-5.6 2H9v2h.4c.6 0 1-.4 1-1s-.5-1-1-1z"></path> </g> </g></svg>');
                editor.ui.registry.addIcon('html', '<svg width="20px" height="20px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="0" fill="none" width="20" height="20"></rect> <g> <path d="M4 16v-2H2v2H1v-5h1v2h2v-2h1v5H4zM7 16v-4H5.6v-1h3.7v1H8v4H7zM10 16v-5h1l1.4 3.4h.1L14 11h1v5h-1v-3.1h-.1l-1.1 2.5h-.6l-1.1-2.5H11V16h-1zM19 16h-3v-5h1v4h2v1zM9.4 4.2L7.1 6.5l2.3 2.3-.6 1.2-3.5-3.5L8.8 3l.6 1.2zm1.2 4.6l2.3-2.3-2.3-2.3.6-1.2 3.5 3.5-3.5 3.5-.6-1.2z"></path> </g> </g></svg>');

                // ===================================================================================
                // == REGISTRO DE BOTÕES E ITENS DE MENU =============================================
                // ===================================================================================

                editor.ui.registry.addMenuItem('save', {
                    text: 'Salvar',
                    icon: 'save-alt',
                    shortcut: 'Ctrl+S',
                    onAction: () => {
                        // Chama a função de salvar no localStorage que já existe
                        salvarTextoComoLocalStorage(); 
                        editor.notificationManager.open({
                            text: 'Conteúdo salvo no navegador!',
                            type: 'success',
                            timeout: 2000
                        });
                    }
                });

                editor.ui.registry.addMenuItem('saveas', {
                    text: 'Salvar como...',
                    icon: 'save-as',
                    onAction: () => openSaveAsDialog(editor)
                });

                editor.ui.registry.addButton('datecalculator', {
                    icon: 'calculadora-data',
                    tooltip: 'Calculadora de Datas',
                    onAction: () => openDateCalculator(editor)
                });

                editor.ui.registry.addMenuItem('datecalculator', {
                    text: 'Calculadora de Datas',
                    icon: 'calculadora-data',
                    onAction: () => openDateCalculator(editor)
                });

                editor.ui.registry.addButton('customcodeview', {
                    icon: 'sourcecode', // Podemos reutilizar o ícone do botão 'code'
                    tooltip: 'Código Fonte (HTML)',
                    onAction: () => openCustomCodeView(editor)
                });

                editor.ui.registry.addMenuItem('customcodeview', {
                    text: 'Código Fonte (HTML)',
                    icon: 'sourcecode',
                    onAction: () => openCustomCodeView(editor)
                });

                editor.ui.registry.addNestedMenuItem('skins', {
                    text: 'Temas',
                    icon: 'temas',
                    getSubmenuItems: () => {
                        return AVAILABLE_THEMES.map(theme => ({
                            type: 'togglemenuitem',
                            text: theme.name,
                            active: getActiveTheme() === theme.value,
                            onAction: () => {
                                switchTheme(theme.value);
                            }
                        }));
                    }
                });                

                editor.ui.registry.addMenuItem('modofoco', {
                    text: 'Modo Foco',
                    icon: 'modo-foco-max',
                    shortcut: 'Alt+A',
                    onAction: toggleModoFoco,
                    onSetup: function(api) {
                        const unbind = editor.on('focusModeToggled', (e) => {
                            api.setIcon(e.state ? 'modo-foco-min' : 'modo-foco-max');
                            api.setText(e.state ? 'Sair do Modo Foco' : 'Modo Foco');
                        });
                        return unbind;
                    }
                });
                
                editor.ui.registry.addToggleButton('modoFoco', {
                    icon: 'modo-foco-max',
                    // O tooltip agora é estático, descrevendo a ação de alternar
                    tooltip: 'Alternar Modo Foco', 
                    onAction: (api) => {
                        // A ação de toggle agora é gerenciada aqui dentro
                        toggleModoFoco();
                    },
                    onSetup: function (api) {
                        // Sincroniza o estado do botão com o estado real da aplicação
                        const unbind = editor.on('focusModeToggled', (e) => {
                            api.setActive(e.state);
                            api.setIcon(e.state ? 'modo-foco-min' : 'modo-foco-max');
                        });
                        return unbind;
                    }
                });
                
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
                editor.ui.registry.addButton('novodocumento', { icon: 'new-document', tooltip: 'Novo documento (Alt+N)', onAction: novodocumentoAction });
                editor.ui.registry.addMenuItem('novodocumento', { text: 'Novo documento', icon: 'new-document', shortcut: 'Alt+N', onAction: novodocumentoAction });
                editor.ui.registry.addButton('closetab', { icon: 'closetab', tooltip: 'Fechar Aba Atual (Alt+X)', onAction: closeCurrentTabAction });
                editor.ui.registry.addMenuItem('closetab', { text: 'Fechar Aba Atual', icon: 'closetab', shortcut: 'Alt+X', onAction: closeCurrentTabAction });
                editor.ui.registry.addButton('savehtml', { icon: 'save', tooltip: 'Salvar HTML (Ctrl+S)', onAction: () => salvarComoHTML(editor) });
                editor.ui.registry.addMenuItem('savehtml', { text: 'Salvar HTML', icon: 'save', shortcut: 'Ctrl+S', onAction: () => salvarComoHTML(editor) });
                editor.ui.registry.addButton('limpartexto', { icon: 'limpar', tooltip: 'Limpar Texto (Alt+B)', onAction: limpardocumentoAction });
                editor.ui.registry.addMenuItem('limpartexto', { text: 'Limpar Texto', icon: 'limpar', shortcut: 'Alt+B', onAction: limpardocumentoAction });
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
                
                // REGISTRO PARA O MENU "FERRAMENTAS"
                editor.ui.registry.addNestedMenuItem('protocolosDeMariaMenu', {
                    text: 'Protocolos DeMaria',
                    icon: 'protocolo',
                    getSubmenuItems: () => {
                        // Constrói o menu no momento do clique, usando a aba ativa
                        if (Array.isArray(cachedProtocolsData)) {
                            // Envolve o resultado em um item "Tipos de Protocolo" como era no JSON original
                            return [{
                                type: 'nestedmenuitem',
                                text: 'Tipos de Protocolo',
                                icon: 'menu-protocolos-de-maria',
                                getSubmenuItems: () => buildMenuFromJson(cachedProtocolsData, tinymce.activeEditor, actionFunctions)
                            }];
                        }
                        // Se ainda não carregou ou deu erro, mostra um estado
                        return [{ text: cachedProtocolsData === 'loading' ? 'Carregando...' : 'Erro ao carregar', enabled: false }];
                    }
                });

               // REGISTRO PARA O BOTÃO DA BARRA DE FERRAMENTAS
                editor.ui.registry.addMenuButton('protocolosDeMaria', {
                    icon: 'protocolo',
                    tooltip: 'Protocolos DeMaria',
                    fetch: (callback) => {
                        // Verifica se os dados brutos do JSON já foram carregados
                        if (Array.isArray(cachedProtocolsData)) {
                            // Constrói a mesma estrutura de menu que o "Ferramentas"
                            const finalMenu = [{
                                type: 'nestedmenuitem',
                                text: 'Tipos de Protocolo',
                                icon: 'menu-protocolos-de-maria',
                                getSubmenuItems: () => buildMenuFromJson(cachedProtocolsData, tinymce.activeEditor, actionFunctions)
                            }];
                            callback(finalMenu);
                        } else {
                            // Se não carregou, mostra o estado de carregando/erro
                            callback([{ text: cachedProtocolsData === 'loading' ? 'Carregando...' : 'Erro ao carregar', enabled: false }]);
                        }
                    }
                });

                editor.ui.registry.addButton('geradorscripts', {
                    icon: 'unificador', // Reutilizando um ícone existente
                    tooltip: 'Unificador de Scripts SQL',
                    onAction: () => ExibirGeradorScripts()
                });

                editor.ui.registry.addMenuItem('geradorscripts', {
                    text: 'Unificador de Scripts SQL',
                    icon: 'unificador',
                    onAction: () => ExibirGeradorScripts()
                });

                editor.on('contextmenu', function (event) {
                    if (event.ctrlKey) {
                        return;
                    }
                    event.preventDefault();
                });

                // REGISTRO PARA O NOVO MENU CLICKUP
             editor.ui.registry.addNestedMenuItem('clickupMenu', {
                 text: 'ClickUp',
                 icon: 'clickup',
                 getSubmenuItems: () => {
                     // Constrói o menu a partir do cache no momento do clique
                     if (Array.isArray(cachedClickUpData)) {
                         return buildMenuFromJson(cachedClickUpData, tinymce.activeEditor, actionFunctions);
                     }
                     // Se ainda não carregou ou deu erro, mostra um estado
                     return [{ text: cachedClickUpData === 'loading' ? 'Carregando...' : 'Erro ao carregar', enabled: false }];
                 }
             });

              editor.ui.registry.addNestedMenuItem('saveasMenu', {
                    text: 'Salvar como...',
                    icon: 'save-as',
                    getSubmenuItems: () => [
                        {
                            type: 'menuitem',
                            text: 'Arquivo HTML (.html)',
                            icon: 'html',
                            onAction: () => {
                                // Chama a função de salvar diretamente com um nome padrão
                                salvarComoHTML(editor, 'documento');
                            }
                        },
                        {
                            type: 'menuitem',
                            text: 'Documento PDF (.pdf)',
                            icon: 'pdf',
                            onAction: () => {
                                // Chama a função de salvar diretamente com um nome padrão
                                salvarComoPDF(editor, 'documento');
                            }
                        }
                    ]
                });

                // ===================================================================================
                // == ATALHOS E EVENTOS ==============================================================
                // ===================================================================================

                editor.addShortcut('ctrl+s', 'Salvar', () => salvarTextoComoLocalStorage());
                editor.addShortcut('ctrl+shift+s', 'Salvar Como com diálogo', () => openSaveAsDialog(editor));
                editor.addShortcut('ctrl+shift+c', 'Copiar HTML', () => copiarHTML(editor));
                editor.addShortcut('alt+n', 'Novo documento', () => editor.ui.registry.getAll().buttons.novodocumento.onAction());
                editor.addShortcut('alt+b', 'Limpar documento', () => editor.ui.registry.getAll().buttons.limpartexto.onAction());                
                editor.addShortcut('alt+x', 'Fechar aba atual', () => editor.ui.registry.getAll().buttons.closetab.onAction());
                editor.addShortcut('alt+a', 'Modo Foco', toggleModoFoco);
                

                let timeoutId;
                const salvarTextoComoLocalStorage = () => {
                    localStorage.setItem('textoSalvo', editor.getContent());
                    console.log('Conteúdo salvo no localStorage.');
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

                editor.on('init', () => {
                    carregarTextoDoLocalStorage();

                    editor.getDoc().body.addEventListener('mousedown', () => {
                        const event = new MouseEvent('mousedown', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        document.body.dispatchEvent(event);
                    });
                });
                editor.on('input', iniciarTemporizador);
            }
        };
    }

    // ===================================================================================
    // == FUNÇÃO PARA CONSTRUIR MENUS DINAMICAMENTE A PARTIR DE UM JSON ===================
    // ===================================================================================

    /**
     * Constrói recursivamente itens de menu para o TinyMCE a partir de um array de objetos JSON.
     * @param {Array} items - O array de itens do nosso arquivo JSON.
     * @param {Editor} editor - A instância do editor TinyMCE.
     * @returns {Array} - Um array de itens de menu formatados para o TinyMCE.
     */
    function buildMenuFromJson(items, editor, actionFunctions) {
        return items.map(item => {
            if (item.type === 'nestedmenuitem') {
                return {
                    type: 'nestedmenuitem',
                    text: item.text,
                    icon: item.icon,
                    getSubmenuItems: () => buildMenuFromJson(item.getSubmenuItems || [], editor, actionFunctions)
                };
            }
            
            if (item.type === 'menuitem') {
                return {
                    type: 'menuitem',
                    text: item.text,
                    icon: item.icon,
                    onAction: () => {
                        if (item.actionType === 'insertContent') {
                            const content = Array.isArray(item.actionValue) 
                                        ? item.actionValue.join('\n') 
                                        : item.actionValue;
                            editor.insertContent(content);
                        } 
                        else if (item.actionType === 'function') {
                            const func = actionFunctions[item.actionValue];
                            if (typeof func === 'function') {
                                func(editor);
                            } else {
                                console.error(`Função ${item.actionValue} não encontrada.`);
                            }
                        }
                        else if (item.actionType === 'openUrl') {
                            window.open(item.actionValue, '_blank', 'noopener,noreferrer');
                        }
                    }
                };
            }
            return null;
        }).filter(Boolean);
    }

    

    // ===================================================================================
    // == INICIALIZAÇÃO DA APLICAÇÃO =====================================================
    // ===================================================================================
    applyPageTheme(getActiveTheme());
    applyInitialFocusMode();
    loadTabs();


});

