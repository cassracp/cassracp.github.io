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
	alert("O código HTML foi copiado para a área de transferência.");
}

function LimparCamposImg2HTML() {
	document.getElementById("imageLink").value = "";
	document.getElementById("thumbnailLink").value = "";
	document.getElementById("htmlCode").value = "";
}
/* Fim do contexto da tela para Formatar links de imagens em HTML */

/* Contexto de funções para Formatar números de telefone */
function FormatNumerTel() {
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
		numeroFormatado = "50" + ddd + numeroTel;
	} else if (numeroTel.length === 8 && (numeroTel.startsWith("9") || numeroTel.startsWith("8") || numeroTel.startsWith("7"))) {
		// Verifica se é um celular sem o nono dígito
		numeroFormatado = "50" + ddd + "9" + numeroTel;
	} else if (numeroTel.length === 8) {
		// Se for um telefone fixo
		numeroFormatado = "00" + ddd + numeroTel;
	} 

	document.getElementById("numeroFormatado").value = numeroFormatado;
	
		// Copia o resultado para a área de transferência
	const textArea = document.getElementById("numeroFormatado");
	textArea.select();
	document.execCommand("copy");

	alert("Número de telefone formatado copiado para área de transferência.");
}
		
function LimparCamposNumerTel() {
	document.getElementById("numTel").value = "";
	document.getElementById("numeroFormatado").value = "";
}
/* Fim do contexto da tela para Formartar número de telefones*/