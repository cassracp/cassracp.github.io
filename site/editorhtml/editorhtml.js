/* BOTÕES DE COPIAR, LIMPAR E PRÉVIA */

function CopiarTexto(){
	const textArea = document.getElementById("editor");
	textArea.select();
	document.execCommand("copy");
}


function LimparEditor() {
	document.getElementById("editor").value = "";
	document.getElementById("editor").focus();
}


function ExibirPrevia() {
    const editor = document.getElementById("editor");
    const formattedText = editor.value; // Obtenha o conteúdo formatado do editor

	if (editor.value === "" || editor.value === undefined){
		alert("Digite um texto antes.");
		return
	}

    // Crie o conteúdo do modal com o texto formatado
    const modalPreviaContent = document.getElementById("modalPreviaContent");
    modalPreviaContent.innerHTML = formattedText;

    // Abra o modal
    $('#previaModal').modal('show');
}

function SalvarHTML() {
	console.log("Clicou no Botão");
	const editorContent = document.getElementById("editor").value; // Obtém o conteúdo do editor

	// Cria um blob com o conteúdo do editor
	const blob = new Blob([editorContent], { type: 'text/html' });

	// Cria um URL temporário para o blob
	const url = URL.createObjectURL(blob);

	// Cria um elemento 'a' para o download
	const link = document.createElement('a');
	link.href = url;
	link.download = 'texto_editado.html'; // Nome do arquivo

	// Simula um clique no link para iniciar o download
	document.body.appendChild(link);
	link.click();

	// Limpa o link criado
	document.body.removeChild(link);

	// Limpa o URL temporário
	URL.revokeObjectURL(url);
}

function ExibirFormatarTelefone() {
    const modalFormatarTelefoneContent = document.getElementById("modalFormatarTelefoneContent");
    
    // Crie um elemento iframe para exibir o conteúdo do arquivo HTML
    const iframe = document.createElement("iframe");

    // Defina o atributo src do iframe para apontar para o seu arquivo HTML
    iframe.src = "numertel.html";

    // Defina a largura e altura desejadas para o iframe (ajuste conforme necessário)
    iframe.width = "770";
    iframe.height = "500";

    // Limpe qualquer conteúdo existente no modal
    modalFormatarTelefoneContent.innerHTML = "";

    // Adicione o iframe ao modal
    modalFormatarTelefoneContent.appendChild(iframe);
	$('#formatarTelefoneModal').modal('show');
}

function ExibirTopicoTarefa() {
    const modalTopicoTarefaContent = document.getElementById("modalTopicoTarefaContent");
    
    // Crie um elemento iframe para exibir o conteúdo do arquivo HTML
    const iframe = document.createElement("iframe");

    // Defina o atributo src do iframe para apontar para o seu arquivo HTML
    iframe.src = "topicotarefa.html";

    // Defina a largura e altura desejadas para o iframe (ajuste conforme necessário)
    iframe.width = "600";
    iframe.height = "600";

    // Limpe qualquer conteúdo existente no modal
    modalTopicoTarefaContent.innerHTML = "";

    // Adicione o iframe ao modal
    modalTopicoTarefaContent.appendChild(iframe);
	$('#topicoTarefaModal').modal('show');
}



/* FUNÇÕES AUXILIARES*/

// INCLUIR UMA TAG E POSICIONAR O CURSOR DE TEXTO
function IncluirEPosicionar(texto, abreTag){
	const editor = document.getElementById("editor");
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
	const cursorPosition = editor.selectionStart;

	if (selectedText) {
        // Se há texto selecionado, envolva-o com as tags
        const inicio = editor.selectionStart;
        const fim = editor.selectionEnd;
        editor.value = editor.value.substring(0, inicio) + texto + editor.value.substring(fim);

		editor.setSelectionRange(cursorPosition + texto.length, cursorPosition + texto.length);

		editor.focus();
    } else {
        // Se nenhum texto está selecionado, insira as tags na posição do cursor
        editor.value = editor.value.substring(0, cursorPosition) + texto + editor.value.substring(cursorPosition);
        
        // Atualize a posição do cursor para o final das tags
	    editor.setSelectionRange(cursorPosition + abreTag.length, cursorPosition + abreTag.length);

		editor.focus();
    }

	editor.focus();
}

// INCLUIR UMA TAG E POSICIONAR O CURSOR SEM A NECESSIDADE DE SELECIONAR O TEXTO (Obs.: Utilizado para as Listas)
function IncluirEPosicionarSemSelecao(texto, abreTag){
	const editor = document.getElementById("editor");
	const cursorPosition = editor.selectionStart;
	editor.value = editor.value.substring(0, cursorPosition) + texto + editor.value.substring(cursorPosition);

	editor.setSelectionRange(cursorPosition + abreTag.length, cursorPosition + abreTag.length);
	editor.focus();
}

// VERIFICAR SE O CURSOR DE TEXTO ESTÁ NO INICIO DE UMA LINHA DO EDITOR.
function IniciaLinha(){
	const textarea = document.getElementById("editor");
	const cursorPosition = textarea.selectionStart;

	if (cursorPosition === 0 || textarea.value[cursorPosition - 1] === "\n") {
		// Retorna verdadeiro se estiver no inicio de uma linha
		return true;
	}
}


/* SIMPLES */

// ADICIONA UMA TAG SIMPLES COMO <B>, <I>, <U>, ETC... (Obs.: Exceto para Blockquote e as Listas)
function addTag(tag) {
	const editor = document.getElementById("editor");
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
	var abreTag = `<${tag}>`;
	if (!IniciaLinha() && tag === "hr"){
		abreTag = "\n"+abreTag
	}
	var texto = tag === "hr" ? texto = abreTag : texto = `${abreTag}${selectedText}</${tag}>`;

	IncluirEPosicionar(texto, abreTag);
}

// ADICIONA A TAG DE BLOCKQUOTE NO EDITOR
function addBlockquote() {
	const editor = document.getElementById("editor");
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
	const abreTag = `<blockquote><font face="calibri" size="2">`;
	const fechaTag = `</font></blockquote>`;
	const texto = abreTag + selectedText + fechaTag;

	IncluirEPosicionar(texto, abreTag)
}


// ADICIONA A TAG DE LISTA NO EDITOR
function addLista() {
	const editor = document.getElementById("editor");
	if (IniciaLinha()){
		var abreTag = "<b>• ";
	} else {
		var abreTag = "\n<b>• ";
	}	
	const fechaTag = "<\/b>";
	const texto = abreTag + fechaTag;

	IncluirEPosicionarSemSelecao(texto, abreTag)
}

// ADICIONA A TAG DE LISTA NUMERADA NO EDITOR
function addListaNumerada() {
    const editor = document.getElementById("editor");
	const cursorPosition = editor.selectionStart;
	const text = editor.value.substring(0, cursorPosition);
	var abreTag;
	

    // Verifica se já existe uma lista numerada anterior
    const regex = /<b>(\d+)\. <\/b>/g;
    const matches = text.match(regex);

    if (matches && matches.length > 0) {
        // Encontre o número mais alto na lista
        const lastNumber = parseInt(matches[matches.length - 1].match(/\d+/)[0]);
        const currentNumber = lastNumber + 1;
		if (IniciaLinha()){
			abreTag = `<b>${currentNumber}. `;
		} else {
			abreTag = `\n<b>${currentNumber}. `;
		}
		
        const texto = abreTag + "</b>";
        IncluirEPosicionarSemSelecao(texto, abreTag)
    } else {
        // Se não há lista numerada anterior, comece com 1
		if (IniciaLinha()){
			abreTag = "<b>1. ";
		} else {
			abreTag = "\n<b>1. ";
		}
		
        const texto = abreTag + "</b>";
        IncluirEPosicionarSemSelecao(texto, abreTag)
    }
}






/* ESPECIAIS */

//ABRE O MODAL PARA INSERIR SPOILER
function AbrirSpoiler() {
	const editor = document.getElementById("editor");
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
	if (selectedText.length === 0){
		alert("Selecione um texto antes.");
		return
	}

	$('#spoilerModal').modal('show');
}

// CHECKBOX PARA USAR TITULO PADRÃO DO SPOILER
function UsarTituloModelo(){
	const checkbox = document.getElementById('usarModelo');
	const divSelecionarModelo = document.getElementById('divSelecionarModelo');
	const divInserirTitulo = document.getElementById('divInserirTitulo');

	if (checkbox.checked){
		divSelecionarModelo.classList.remove("d-none");
		divInserirTitulo.classList.add("d-none");
	} else {
		divSelecionarModelo.classList.add("d-none");
		divInserirTitulo.classList.remove("d-none");
	}
}


// INSERE O SPOILER NO EDITOR
function InserirSpoiler() {
	const editor = document.getElementById("editor");
	const cursorPosition = editor.selectionStart;
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
	const checkbox = document.getElementById("usarModelo");
	const tituloSpoiler = checkbox.checked ? document.getElementById("modeloTitulo").value : document.getElementById("tituloSpoiler").value;	
	const inicio = editor.selectionStart;
	const fim = editor.selectionEnd;
	const abreTag = `<div style="margin: 5px 20px 20px;"><div class="smallfont" style="margin-bottom: 2px;"><b>${tituloSpoiler}</b>: <input value="Open" style="margin: 0px; padding: 0px; width: 55px; font-size: 11px;" onclick="if (this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display != '') { this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display = ''; this.innerText = ''; this.value = 'Close'; } else { this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display = 'none'; this.innerText = ''; this.value = 'Open'; }" type="button"></div><div class="alt2" style="border: 1px inset ; margin: 0px; padding: 6px;"><div style="display: none;">`;
	const texto = `${abreTag}${selectedText}</div></div></div>`;

	

	editor.value = editor.value.substring(0, inicio) + texto + editor.value.substring(fim);
	$('#spoilerModal').modal('hide');

	editor.setSelectionRange(cursorPosition + abreTag.length, cursorPosition + abreTag.length + selectedText.length);
	editor.focus();
}

// ABRE O MODAL PARA LINK DE OS
function AbrirLinkOS() {
    $('#linkOSModal').modal('show');
}

// ADICIONA UM LIK DE OS NO EDITOR
function addLinkOS(evt) {
	if(evt && evt.keyCode != 13)
	{
		return;
	}

	const editor = document.getElementById("editor");
	const cursorPosition = editor.selectionStart;
	const numeroOS = document.getElementById("numeroOS").value;
	const texto = `<a href="https://www.sacdemaria.com.br/adm/os/consulta_os.php?id=${numeroOS}" target="_blank"><b><u>OS ${numeroOS}</u></b></a>`

	if (numeroOS === "" || numeroOS === undefined){
		alert("Insira um Número de OS.");
		return;
	}

	editor.value = editor.value.substring(0, cursorPosition) + texto + editor.value.substring(cursorPosition);
	$('#linkOSModal').modal('hide');
	editor.focus();
}

// ABRE O MODAL PARA LINK DE TAREFA
function AbrirLinkTarefa() {
    $('#linkTarefaModal').modal('show');
	$('#numeroTarefa').focus();
}

// ADICIONA UM LINK DE TAREFA NO EDITOR
function addLinkTarefa(evt) {
	if(evt && evt.keyCode != 13)
	{
		return;
	}

	const editor = document.getElementById("editor");
	const numeroTarefa = document.getElementById("numeroTarefa").value;
	const texto = `<a href="https://www.demaria.com.br/intranet/v3/tarefa/detalhe.php?tarefa_id=${numeroTarefa}" target="_blank"><b><u>Tarefa ${numeroTarefa}</u></b></a>`
	const cursorPosition = editor.selectionStart;

	if (numeroTarefa === "" || numeroTarefa === undefined){
		alert("Insira um Número de Tarefa.");
		return;
	}

	editor.value = editor.value.substring(0, cursorPosition) + texto + editor.value.substring(cursorPosition);
	$('#linkTarefaModal').modal('hide');
	editor.focus();
}

// ABRE O MODAL PARA INSERIR UMA IMAGEM
function AbrirImagem() {
	$('#ImagemModal').modal('show');

	document.getElementById("urlImagem").value = "";
	document.getElementById("descImagem").value = "";
	document.getElementById("urlImagem").focus();
}

// ADICIONA A TAG DA IMAGEM NO EDITOR
function addURLImagem(evt) {
	if(evt && evt.keyCode != 13)
	{
		return;
	}

	const editor = document.getElementById("editor");
	const urlImagem = document.getElementById("urlImagem");
	const descImagem = document.getElementById('descImagem');

	if(!urlImagem.value === "" && (urlImagem.value.includes('https://') || urlImagem.value.includes('http://')))
	{
		alert("URL da Imagem em branca ou inválida!\n\nFavor inserir a URL completa da imagem")
		return;
	}	
	descImagem.value = descImagem.value === "" ? "Imagem sem descrição" : descImagem.value;

	const texto = `\n<a href ="${urlImagem.value.trim()}" target="_blank"><img src="${urlImagem.value.trim()}" width="200" height="150" alt="${descImagem.value.trim()}" title="${descImagem.value.trim()}"></img></a><br><small><font color="gray">(${descImagem.value.trim()})</font></small>`;
	
	IncluirEPosicionarSemSelecao(texto, texto);

	$('#ImagemModal').modal('hide');
	editor.focus();
}

// ABRE O MODAL PARA INSERIR DATA NO EDITOR
function AbrirData() {
	const editor = document.getElementById("editor");
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
	const data = new Date();
	const ano = data.getFullYear();
	const mes = String(data.getMonth() + 1).padStart(2, '0'); 
	const dia = String(data.getDate()).padStart(2, '0');
	const dataAtual = `${ano}-${mes}-${dia}`;

	// Aqui é feita uma verificação caso o usuário tenha selecionado um texto no formato DD/MM/AAAA. Se tiver selecionado, o Modal não é aberto, mas a data selecionada é automaticamente formatada
	if (ValidarData(selectedText)){
		const dateConverted = DateConverter(selectedText);
		const data = FormatarData(dateConverted);
		IncluirEPosicionar(data, data);
		editor.focus();
	} else {
		$('#DataModal').modal('show');
		document.getElementById("dataSelecionada").value = dataAtual;
		document.getElementById("exemploDataFormatada").textContent = FormatarData(dataAtual);
	}
}

// FUNÇÃO PARA VALIDAR SE A DATA ESTÁ NO FORMATO DD/MM/AAAA
function ValidarData(data) {
    const regexData = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (regexData.test(data)) {
        // A data está no formato correto
        return true;
    } else {
        // A data não está no formato correto
        return false;
    }
}

// FUNÇÃO PARA CONVERTER DATA DO FORMATO DD/MM/AAAA PARA YYYY-MM-DD (Aceito pelo input-html do tipo DATE)
function DateConverter(data) {
    const partes = data.split("/");
    
    if (partes.length === 3) {
        const dia = partes[0];
        const mes = partes[1];
        const ano = partes[2];
        
        // Certifique-se de que dia e mês tenham dois dígitos
        const diaFormatado = dia.padStart(2, '0');
        const mesFormatado = mes.padStart(2, '0');
        
        // Formate a data no estilo "YYYY-mm-dd"
        const dataFormatada = `${ano}-${mesFormatado}-${diaFormatado}`;
        
        return dataFormatada;
    } else {
        // Retorne nulo ou uma mensagem de erro se a entrada estiver no formato errado
        return null;
    }
}


// FUNÇÃO DO CHECKBOX "DATA FORMATADA" (chkDataFormatada) PARA EXIBIÇÃO DO EXEMPLO NO MODAL
function UsarDataFormatada() {
    const exemploDataFormatada = document.getElementById("exemploDataFormatada");
    const dataSelecionada = document.getElementById("dataSelecionada").value;
    const dataFormatada = FormatarData(dataSelecionada);
    
	exemploDataFormatada.textContent = `${dataFormatada}`;
}

// FORMATA A DATA DO FORMATO YYYY-MM-DD (retorno do input date) PARA O EXTENSO: "DD do mmmmm de AAAA"
function FormatarData (data) {
	const chkDataFormatada = document.getElementById("chkDataFormatada");
	if (chkDataFormatada.checked){
		const meses = [
			"janeiro", "fevereiro", "março", "abril", "maio", "junho",
			"julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
		];
	
		const partesData = data.split("-");
		if (partesData.length === 3) {
			const dia = partesData[2];
			const mes = parseInt(partesData[1]);
			const ano = partesData[0];
			return `${dia} de ${meses[mes - 1]} de ${ano}`;
		} else {
			return "Formato de data inválido";
		}
	} else {
		const partesData = data.split("-");
        if (partesData.length === 3) {
            return partesData[2] + '/' + partesData[1] + '/' + partesData[0];
        } else {
            return "Formato de data inválido";
		}
	}
}

// ADICIONA A DATA FORMATADA NO EDITOR
function addData(data) {
	const editor = document.getElementById("editor");
	const dataSelecionada = document.getElementById("dataSelecionada");
	const dataFormatada = FormatarData(dataSelecionada.value);
	
	if (dataSelecionada.value != "" || dataSelecionada.value != undefined){
		IncluirEPosicionar(dataFormatada, dataFormatada);
		$('#DataModal').modal('hide');
		editor.focus();
	} else {
		if (data != ""){	
			IncluirEPosicionar(data, data)
			$('#DataModal').modal('hide');
			editor.focus();
		} else {
			alert("Data Inválida!");
			return;
		}
	}
}

// ABRE O MODAL PARA INSERIR A DATA DO GOOGLE
function AbrirDataGoogle() {
	const editor = document.getElementById("editor");
	const inicio = editor.selectionStart;
    const fim = editor.selectionEnd;
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);

	if (selectedText.length > 0)
	{
		var texto = FormatarDataGoogle(selectedText);
		editor.value = editor.value.substring(0, inicio) + texto + editor.value.substring(fim);
		editor.focus();		
	} else {
		$('#DataGoogleModal').modal('show');
	}   
}

// FUNÇÃO PARA FORMATAR A DATA COPIADA DA AGENDA DO GOOGLE
function FormatarDataGoogle(data) {
    // Substitua "até" por "das" e "⋅" por "às"
	if (data.includes('até')){
		data = data.replace(/⋅/g, ' das ');
	} else {    
    	data = data.replace(/⋅/g, ' às ');
	}

    // Adicione "h" para indicar as horas
    data = data.replace(/(\d+:\d+)/g, '$1h');

    return data;
}

// ADICIONA A DATA FORMATADA NO EDITOR
function addDataGoogle(evt) {
	if(evt && evt.keyCode != 13)
	{
		return;
	}

	const editor = document.getElementById("editor");
	const cursorPosition = editor.selectionStart;
	const dataGoogle = document.getElementById("dataGoogle").value;
	const dataFormatada = FormatarDataGoogle(dataGoogle);
	const texto = dataFormatada.trim();

	editor.value = editor.value.substring(0, cursorPosition) + texto + editor.value.substring(cursorPosition);
	$('#DataGoogleModal').modal('hide');
	editor.focus();
}