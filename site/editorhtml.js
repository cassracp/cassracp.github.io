function addTag(tag) {
	const editor = document.getElementById("editor");
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
	const newText = `<${tag}>${selectedText}</${tag}>`;
	const start = editor.selectionStart;
	const end = editor.selectionEnd;
	editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
}

function addBlockquote() {
	const editor = document.getElementById("editor");
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
	const newText = `<blockquote><font face="calibri" size="2">${selectedText}</font></blockquote>`;
	const start = editor.selectionStart;
	const end = editor.selectionEnd;
	editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
}

function addLista() {
	const editor = document.getElementById("editor");
	const newText = "\n<b>• <\/b>";
	editor.value += newText;
}

function addListaNumerada() {
    const editor = document.getElementById("editor");
    const text = editor.value;

    // Verifique se já existe uma lista numerada anterior
    const regex = /<b>(\d+)\. <\/b>/g;
    const matches = text.match(regex);

    if (matches && matches.length > 0) {
        // Encontre o número mais alto na lista
        const lastNumber = parseInt(matches[matches.length - 1].match(/\d+/)[0]);
        const currentNumber = lastNumber + 1;
        const newText = `\n<b>${currentNumber}. </b>`;
        editor.value += newText;
    } else {
        // Se não há lista numerada anterior, comece com 1
        const newText = "\n<b>1. </b>";
        editor.value += newText;
    }
}

function addPre() {
	const editor = document.getElementById("editor");
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
	const newText = `<pre>${selectedText}</pre>`;
	const start = editor.selectionStart;
	const end = editor.selectionEnd;
	editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
}

function addCode() {
	const editor = document.getElementById("editor");
	const selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
	const newText = `<code>${selectedText}</code>`;
	const start = editor.selectionStart;
	const end = editor.selectionEnd;
	editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
}

function addLinkOS(evt) {
	if(evt && evt.keyCode != 13)
	{
		return;
	}

	const editor = document.getElementById("editor");
	const numeroOS = document.getElementById("numeroOS").value;
	const newText = `<a href="https://www.sacdemaria.com.br/adm/os/consulta_os.php?id=${numeroOS}" target="_blank"><b><u>OS ${numeroOS}</u></b></a>`
	const start = editor.selectionStart;
	const end = editor.selectionEnd;
	editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
	$('#linkOSModal').modal('hide');
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
	const newText = `<a href="https://www.demaria.com.br/intranet/v3/tarefa/detalhe.php?tarefa_id=${numeroOS}" target="_blank"><b><u>Tarefa ${numeroOS}</u></b></a>`
	const start = editor.selectionStart;
	const end = editor.selectionEnd;
	editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
	$('#linkTarefaModal').modal('hide');
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

function addURLImagem(evt) {
	if(evt && evt.keyCode != 13)
	{
		return;
	}

	const editor = document.getElementById("editor");
	const urlImagem = document.getElementById("urlImagem").value;
	if(urlImagem === "" || !urlImagem.includes('https://') || urlImagem.includes('http://'))
	{
		alert("URL da Imagem em branca ou inválida!\n\nFavor inserir o a url completa da imagem")
		return;
	}
	const descImagemInput = document.getElementById('descImagem');
	descImagemInput.value = descImagemInput.value === "" ? "Imagem sem descrição" : descImagemInput.value;
	const descImagem = descImagemInput.value;
	const newText = `<a href ="${urlImagem}" target="_blank"><img src="${urlImagem}" width="150" height="150" alt="${descImagem}"></a>`;

	editor.value += "\n" + newText;
	$('#ImagemModal').modal('hide');


}

function InserirImagem() {
	const urlImagem = document.getElementById('urlImagem');
	const descImagem = document.getElementById('descImagem');
	urlImagem.value = "";
	descImagem.value = "";
    $('#ImagemModal').modal('show');
	urlImagem.focus();	
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

function addData() {
	const editor = document.getElementById("editor");
    const dataSelecionada = document.getElementById("dataSelecionada").value;
    const dataFormatada = FormatarData(dataSelecionada);

	editor.value += " " + dataFormatada;
	$('#DataModal').modal('hide');	
}

function InserirData() {
    $('#DataModal').modal('show');
	
}


function addDataGoogle(evt) {
	if(evt && evt.keyCode != 13)
	{
		return;
	}

	const editor = document.getElementById("editor");
	const dataGoogle = document.getElementById("dataGoogle").value;
	const dataFormatada = formatarDataGoogle(dataGoogle);
	const newText = dataFormatada;
	const start = editor.selectionStart;
	const end = editor.selectionEnd;
	editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
	$('#DataGoogleModal').modal('hide');
}

function InserirDataGoogle() {
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
function openModal() {
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
	const checkbox = document.getElementById("usarModelo");
	const tituloSpoiler = checkbox.checked ? document.getElementById("modeloTitulo").value : document.getElementById("tituloSpoiler").value;	
	const start = editor.selectionStart;
	const end = editor.selectionEnd;
	const newText = `<div style="margin: 5px 20px 20px;"><div class="smallfont" style="margin-bottom: 2px;"><b>${tituloSpoiler}</b>: <input value="Open" style="margin: 0px; padding: 0px; width: 55px; font-size: 11px;" onclick="if (this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display != '') { this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display = ''; this.innerText = ''; this.value = 'Close'; } else { this.parentNode.parentNode.getElementsByTagName('div')[1].getElementsByTagName('div')[0].style.display = 'none'; this.innerText = ''; this.value = 'Open'; }" type="button"></div><div class="alt2" style="border: 1px inset ; margin: 0px; padding: 6px;"><div style="display: none;">${selectedText}</div></div></div>`;

	editor.value = editor.value.substring(0, start) + newText + editor.value.substring(end);
	$('#spoilerModal').modal('hide');
}
//Fim spoiler

/* FIM EDITOR HTML*/