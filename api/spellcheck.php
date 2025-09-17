<?php
    error_reporting(0);
    ini_set('display_errors', 0);

    header("Content-Type: application/json");
    header("Cache-Control: no-store, no-cache, must-revalidate");
    header("Pragma: no-cache");

    $misspelled = [];
    $debug_info = []; // Array para guardar informações de depuração

    $raw = file_get_contents("php://input");
    $json = json_decode($raw);

    // Adiciona os dados recebidos ao log de depuração
    $debug_info['received_json'] = $json;

    if ($json && isset($json->lang) && isset($json->words) && is_array($json->words)) {
        $lang = $json->lang;
        $words = $json->words;
        $dictionaryPath = dirname(__FILE__) . "/dictionaries/" . $lang . ".dic";
        
        // Adiciona informações do caminho e do idioma ao log
        $debug_info['dictionary_path'] = $dictionaryPath;
        $debug_info['language_requested'] = $lang;

        if (file_exists($dictionaryPath)) {
            $debug_info['dictionary_found'] = true;
            $dictionary = file($dictionaryPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            $dictionarySet = array_flip(array_map('strtolower', $dictionary));

            foreach ($words as $word) {
                if (!isset($dictionarySet[strtolower($word)])) {
                    array_push($misspelled, $word);
                }
            }
        } else {
            // Se não encontrar o dicionário, registra isso
            $debug_info['dictionary_found'] = false;
        }
    } else {
        $debug_info['error'] = "Invalid or empty JSON received.";
    }

    // Escreve as informações de depuração no log da Vercel
    error_log(json_encode($debug_info));

    // Envia a resposta normal
    echo json_encode((object)array('words' => $misspelled));
?>