<?php
    // Habilita o cache do lado do cliente
    header("Content-Type: application/json");
    header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
    header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
    header("Cache-Control: no-store, no-cache, must-revalidate");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");

    // Pega os dados enviados pelo TinyMCE
    $raw = file_get_contents("php://input");
    $json = json_decode($raw);
    $lang = $json->lang;
    $words = $json->words;

    // Define o caminho para o arquivo de dicionário
    // Ele vai procurar o arquivo na mesma pasta que este script
    $dictionaryPath = dirname(__FILE__) . "/" . $lang . ".dic";

    // Carrega o dicionário
    $dictionary = file($dictionaryPath, FILE_IGNORE_NEW_LINES);
    $misspelled = [];

    // Compara as palavras
    foreach ($words as $word) {
        if (!in_array(strtolower($word), $dictionary)) {
            array_push($misspelled, $word);
        }
    }

    // Retorna as palavras incorretas para o TinyMCE no formato JSON esperado
    echo json_encode((object)array('words' => $misspelled));
?>