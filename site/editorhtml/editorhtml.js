function manterFocoNoTextarea() {
    const editor = document.getElementById("editor");
    editor.focus();
}

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

function IncluirEPosicionarSemSelecao(texto, abreTag){
	const editor = document.getElementById("editor");
	const cursorPosition = editor.selectionStart;
	editor.value = editor.value.substring(0, cursorPosition) + texto + editor.value.substring(cursorPosition);

	editor.setSelectionRange(cursorPosition + abreTag.length, cursorPosition + abreTag.length);
	editor.focus();
}

function IniciaLinha(){
	const textarea = document.getElementById("editor"); // Substitua "editor" pelo ID do seu textarea
	const cursorPosition = textarea.selectionStart;

	if (cursorPosition === 0 || textarea.value[cursorPosition - 1] === "\n") {
		return true;
	}
}

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

function addBlockquote() {
	const editor = document.getElementById("editor");
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
	const abreTag = `<blockquote><font face="calibri" size="2">`;
	const fechaTag = `</font></blockquote>`;
	const texto = abreTag + selectedText + fechaTag;

	IncluirEPosicionar(texto, abreTag)
}

function addLista() {
	const editor = document.getElementById("editor");
	if (IniciaLinha() === true){
		var abreTag = "<b>• ";
	} else {
		var abreTag = "\n<b>• ";
	}	
	const fechaTag = "<\/b>";
	const texto = abreTag + fechaTag;

	IncluirEPosicionarSemSelecao(texto, abreTag)
}

function addListaNumerada() {
    const editor = document.getElementById("editor");
	const cursorPosition = editor.selectionStart;
	const text = editor.value.substring(0, cursorPosition);
	var abreTag;
	

    // Verifique se já existe uma lista numerada anterior
    const regex = /<b>(\d+)\. <\/b>/g;
    const matches = text.match(regex);

    if (matches && matches.length > 0) {
        // Encontre o número mais alto na lista
        const lastNumber = parseInt(matches[matches.length - 1].match(/\d+/)[0]);
        const currentNumber = lastNumber + 1;
		if (IniciaLinha() === true){
			abreTag = `<b>${currentNumber}. `;
		} else {
			abreTag = `\n<b>${currentNumber}. `;
		}
		
        const texto = abreTag + "</b>";
        IncluirEPosicionarSemSelecao(texto, abreTag)
    } else {
        // Se não há lista numerada anterior, comece com 1
		if (IniciaLinha() === true){
			abreTag = "<b>1. ";
		} else {
			abreTag = "\n<b>1. ";
		}
		
        const texto = abreTag + "</b>";
        IncluirEPosicionarSemSelecao(texto, abreTag)
    }
}

function addLinkOS(evt) {
	if(evt && evt.keyCode != 13)
	{
		return;
	}

	const editor = document.getElementById("editor");
	const numeroOS = document.getElementById("numeroOS").value;
	const texto = `<a href="https://www.sacdemaria.com.br/adm/os/consulta_os.php?id=${numeroOS}" target="_blank"><b><u>OS ${numeroOS}</u></b></a>`
	const inicio = editor.selectionStart;
	const fim = editor.selectionEnd;
	editor.value = editor.value.substring(0, inicio) + texto + editor.value.substring(fim);
	$('#linkOSModal').modal('hide');
	editor.focus();
}

function InserirOS() {
    $('#linkOSModal').modal('show');
	$('#numeroOS').focus();
}

function addLinkTarefa(evt) {
	if(evt && evt.keyCode != 13)
	{
		return;
	}

	const editor = document.getElementById("editor");
	const numeroTarefa = document.getElementById("numeroTarefa").value;
	const texto = `<a href="https://www.demaria.com.br/intranet/v3/tarefa/detalhe.php?tarefa_id=${numeroOS}" target="_blank"><b><u>Tarefa ${numeroOS}</u></b></a>`
	const inicio = editor.selectionStart;
	const fim = editor.selectionEnd;
	editor.value = editor.value.substring(0, inicio) + texto + editor.value.substring(fim);
	$('#linkTarefaModal').modal('hide');
	editor.focus();
}

function InserirTarefa() {
    $('#linkTarefaModal').modal('show');
	$('#numeroTarefa').focus();
}

function formatarDataGoogle(data) {
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


/* ESPECIAIS */

/* INSERIR IMAGEM*/ 
function AbrirImagem() {
	$('#ImagemModal').modal('show');

	document.getElementById("urlImagem").value = "";
	document.getElementById("descImagem").value = "";
	document.getElementById("urlImagem").focus();
}


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

	const texto = `\n<a href ="${urlImagem.value.trim()}" target="_blank"><img src="${urlImagem.value.trim()}" width="150" height="150" alt="${descImagem.value.trim()}"></img></a>`;
	
	IncluirEPosicionarSemSelecao(texto, texto);

	$('#ImagemModal').modal('hide');
	editor.focus();
}

/* INSERIR DATA */
function AbrirData() {
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);

	if (validarData(selectedText)){
		const dateConverted = DateConverter(selectedText);
		const data = FormatarData(dateConverted);
		addData(data);
	} else {
		$('#DataModal').modal('show');
		const data = new Date();
		const ano = data.getFullYear();
		const mes = String(data.getMonth() + 1).padStart(2, '0'); 
		const dia = String(data.getDate()).padStart(2, '0');
		const dataAtual = `${ano}-${mes}-${dia}`;
		document.getElementById("dataSelecionada").value = undefined;
		document.getElementById("exemploDataFormatada").textContent = FormatarData(dataAtual);
	}
}

function validarData(data) {
    // Expressão regular para verificar o formato "dd/mm/YYYY"
    const regexData = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (regexData.test(data)) {
        // A data está no formato correto
        return true;
    } else {
        // A data não está no formato correto
        return false;
    }
}

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



function UsarDataFormatada() {
    const exemploDataFormatada = document.getElementById("exemploDataFormatada");
    const dataSelecionada = document.getElementById("dataSelecionada").value;
    const dataFormatada = FormatarData(dataSelecionada);
    
	exemploDataFormatada.textContent = `${dataFormatada}`;
}

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

function addData(data) {
	const editor = document.getElementById("editor");
	const dataSelecionada = document.getElementById("dataSelecionada");
	const dataFormatada = FormatarData(dataSelecionada.value);
	
	if (dataSelecionada.value != ""){
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




function addDataGoogle(evt) {
	if(evt && evt.keyCode != 13)
	{
		return;
	}

	const editor = document.getElementById("editor");
	const dataGoogle = document.getElementById("dataGoogle").value;
	const dataFormatada = formatarDataGoogle(dataGoogle);
	const texto = dataFormatada;
	const inicio = editor.selectionStart;
	const fim = editor.selectionEnd;
	editor.value = editor.value.substring(0, inicio) + texto + editor.value.substring(fim);
	$('#DataGoogleModal').modal('hide');
	editor.focus();
}

function AbrirDataGoogle() {
    $('#DataGoogleModal').modal('show');
}


function CopiarTexto(){
	const textArea = document.getElementById("editor");
	textArea.select();
	document.execCommand("copy");
}


function LimparEditor() {
	document.getElementById("editor").value = "";
}

//Spoiler
function AbrirSpoiler() {
	$('#spoilerModal').modal('show');
}

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

function insertSpoiler() {
	const editor = document.getElementById("editor");
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
	if (selectedText.length === 0){
		alert
	}
	const checkbox = document.getElementById("usarModelo");
	const tituloSpoiler = checkbox.checked ? document.getElementById("modeloTitulo").value : document.getElementById("tituloSpoiler").value;	
	const inicio = editor.selectionStart;
	const fim = editor.selectionEnd;
	const texto = `<div style="margin: 5px 20px 20px;"><div class="smallfont" style="margin-bottom: 2px;"><b>${tituloSpoiler}</b>: <input value="Open" style="margin: 0px; padding: 0px; width: 55px; font-size: 11px;" onclick="if (this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display != '') { this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display = ''; this.innerText = ''; this.value = 'Close'; } else { this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display = 'none'; this.innerText = ''; this.value = 'Open'; }" type="button"></div><div class="alt2" style="border: 1px inset ; margin: 0px; padding: 6px;"><div style="display: none;">${selectedText}</div></div></div>`;

	

	editor.value = editor.value.substring(0, inicio) + texto + editor.value.substring(fim);
	$('#spoilerModal').modal('hide');
	editor.focus();
}
//Fim spoiler

/* FIM EDITOR HTML*/