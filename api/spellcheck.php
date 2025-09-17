<?php
    header("Content-Type: application/json");
    header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
    header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
    header("Cache-Control: no-store, no-cache, must-revalidate");
    header("Cache-Control: post-check=0, pre-check=0", false);
    header("Pragma: no-cache");

    $json = json_decode(file_get_contents("php://input"));
    $lang = $json->lang;
    $words = $json->words;

    // *** A CORREÇÃO ESTÁ AQUI ***
    // Agora ele procura o dicionário dentro da pasta 'dictionaries'
    $dictionaryPath = dirname(__FILE__) . "/dictionaries/" . $lang . ".dic";

    $misspelled = [];
    if (file_exists($dictionaryPath)) {
        $dictionary = file($dictionaryPath, FILE_IGNORE_NEW_LINES);
        foreach ($words as $word) {
            if (!in_array(strtolower($word), $dictionary)) {
                array_push($misspelled, $word);
            }
        }
    }

    echo json_encode((object)array('words' => $misspelled));
?>