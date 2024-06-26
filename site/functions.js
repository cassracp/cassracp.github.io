/* Contexto de funções para Formartar links de imagens em HTML */ 
function Img2HTML() {
	const imageLink = document.getElementById("imageLink").value;
	const thumbnailLink = document.getElementById("thumbnailLink").value;

	const htmlCode = `<a href="${imageLink}" target='_blank'><img src='${thumbnailLink}'/></a>`;
	
	document.getElementById("htmlCode").value = htmlCode;
	
	// Copia o HTML gerado para a área de transferência
	const htmlCodeTextArea = document.getElementById("htmlCode");
	htmlCodeTextArea.select();
	document.execCommand("copy");
	
	// Alerta que o código HTML foi copiado
	//alert("O código HTML foi copiado para a área de transferência.");
}

function LimparCamposImg2HTML() {
	document.getElementById("imageLink").value = "";
	document.getElementById("thumbnailLink").value = "";
	document.getElementById("htmlCode").value = "";
}
/* Fim do contexto da tela para Formatar links de imagens em HTML */

/* Contexto de funções para Formatar números de telefone */
function FormatarNumeroDeTelefone(evt) {

	if(evt && evt.keyCode != 13)
	{
		return;
	}


	const codigoSelecionado = document.querySelector('input[name="codigoRadio"]:checked').value;
	const numTel = document.getElementById("numTel").value;
	let numeroTel = numTel.replace(/[^0-9]/g, ""); // Remove espaços e caracteres especiais

	let ddd = ""; // Variável para armazenar o DDD
	let numeroFormatado = ""; // Variável para armazenar o número de telefone

	if (numeroTel.startsWith("55")) {
		numeroTel = numeroTel.substring(2); // Remove o código do país
	} else if (numeroTel.startsWith("0")) {
		numeroTel = numeroTel.substring(1); // Remove o zero inicial
	} else if (numeroTel.length > 11) {
		alert("Numero de telefone em formato inválido ou não é do Brasil.");
	}
	if (numeroTel.length >= 2) {
		ddd = numeroTel.substring(0, 2); // Extrai o DDD
		numeroTel = numeroTel.substring(2); // Remove o DDD
	}
	

	if (numeroTel.length === 9 && numeroTel.startsWith("9")) {
		// Verifica se é um celular com o nono dígito
		numeroFormatado = codigoSelecionado + ddd + numeroTel;
	} else if (numeroTel.length === 8 && (numeroTel.startsWith("9") || numeroTel.startsWith("8") || numeroTel.startsWith("7"))) {
		// Verifica se é um celular sem o nono dígito
		numeroFormatado = codigoSelecionado + ddd + "9" + numeroTel;
	} else if (numeroTel.length === 8) {
		// Se for um telefone fixo
		numeroFormatado = "00" + ddd + numeroTel;
	} 

	document.getElementById("numeroFormatado").value = numeroFormatado;
	
	// Copia o resultado para a área de transferência
	const textArea = document.getElementById("numeroFormatado");
	textArea.select();
	document.execCommand("copy");

	//alert("Número de telefone formatado copiado para área de transferência.");
}
		
function LimparCamposNumerTel() {
	document.getElementById("numTel").value = "";
	document.getElementById("numeroFormatado").value = "";
}
/* Fim do contexto da tela para Formartar número de telefones*/


/* Função para oculta o numero da OS no topicotarefa.html*/
function TemNumeroOS() {
    const checkbox = document.getElementById("osAssociada");
    const divNumeroOS = document.getElementById("divNumeroOS");
	const numeroOS = document.getElementById("numeroOS");

    if (checkbox.checked) {
        divNumeroOS.classList.remove("d-none");
    } else {
        divNumeroOS.classList.add("d-none");
    }
}
/*Fim*/

/*Limpar campos da topicotarefa.html*/
function LimparCamposTopicoTarefa() {
	const checkbox = document.getElementById("osAssociada");
    const divNumeroOS = document.getElementById("divNumeroOS");

    // Limpa o campo Nº Tópico
    document.getElementById("numeroTarefa").value = "";

    // Limpa o campo Título Tópico
    document.getElementById("tituloTopicoSelect").value = "ANÁLISE";

    // Limpa o campo Nº OS
    document.getElementById("numeroOS").value = "";

    // Limpa o campo Código HTML
    document.getElementById("codigoHTML").value = "";

    // Desmarca o checkbox Tem OS Associada
    checkbox.checked = false;

    // Oculta o campo Nº OS, se estiver visível
    if (!divNumeroOS.classList.contains("d-none")) {
        divNumeroOS.classList.add("d-none");
    }
}
/*fim*/

/* Função para gerar o HTML do tópico na tarefa*/
function FormatarTopicoTarefa() {
	console.log("Entrou na função FormatarTopicoTarefa");
    const numeroTarefa = document.getElementById("numeroTarefa").value;
    const tituloTopico = document.getElementById("tituloTopicoSelect").value;
    const osAssociada = document.getElementById("osAssociada").checked;
    const numeroOS = document.getElementById("numeroOS").value.trim();
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, '0');
	const mm = String(today.getMonth() + 1).padStart(2, '0'); // Janeiro é 0!
	const yyyy = today.getFullYear();
	const formattedDate = dd + '/' + mm + '/' + yyyy;

	if ((osAssociada && numeroOS === "") || (numeroTarefa === ""))
	{
		return;
	}

    let codigoHTML = '';

	if (osAssociada) {
		const osLink = `<a href="https://www.sacdemaria.com.br/adm/os/consulta_os.php?id=${numeroOS}" target="_blank"><u>OS ${numeroOS}</u></a>`;
		const titlePart = tituloTopico === "DATA DA IMPLANTAÇÃO/ATIVAÇÃO" ? `: ${formattedDate}` : "";
	
		codigoHTML = `<BIG><b>${numeroTarefa}) ${tituloTopico}${titlePart}</b> - Ver ${osLink}</BIG>`;
	} else {
		if (tituloTopico === "DATA DA IMPLANTAÇÃO/ATIVAÇÃO") {
			codigoHTML = `<BIG><b>${numeroTarefa}) ${tituloTopico}:</b> ${formattedDate}</BIG>`;
		} else if (tituloTopico === "GARANTIA") {
			const dataGarantia = new Date(today);
			dataGarantia.setDate(dataGarantia.getDate() + 90);
			const ddGarantia = String(dataGarantia.getDate()).padStart(2, '0');
			const mmGarantia = String(dataGarantia.getMonth() + 1).padStart(2, '0');
			const yyyyGarantia = dataGarantia.getFullYear();
			const formattedGarantia = ddGarantia + '/' + mmGarantia + '/' + yyyyGarantia;
			codigoHTML = `<BIG><b>${numeroTarefa}) ${tituloTopico}</b> - Até ${formattedGarantia}</BIG>`;
		} else {
			codigoHTML = `<BIG><b>${numeroTarefa}) ${tituloTopico}</b></BIG>`;
		}
	}
	


	const textArea = document.getElementById("codigoHTML");

    textArea.value = codigoHTML;
	textArea.select();
	document.execCommand("copy");
}
/* FIM */

function loadTool(toolName) {
	fetch(toolName)
		.then(response => response.text())
		.then(data => {
			document.querySelector(".content").innerHTML = data;
		});
}