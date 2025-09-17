<?php
    // Passo 1: Suprimir a exibição de erros para garantir uma saída JSON limpa.
    error_reporting(0);
    ini_set('display_errors', 0);

    // Define o cabeçalho de resposta como JSON
    header("Content-Type: application/json");
    header("Cache-Control: no-store, no-cache, must-revalidate");
    header("Pragma: no-cache");

    // Inicializa a variável de palavras com erro como um array vazio.
    $misspelled = [];
    
    // Pega o corpo da requisição
    $raw = file_get_contents("php://input");
    $json = json_decode($raw);

    // Passo 2: Verifica se os dados foram recebidos e decodificados corretamente
    if ($json && isset($json->lang) && isset($json->words) && is_array($json->words)) {
        
        $lang = $json->lang;
        $words = $json->words;
        $dictionaryPath = dirname(__FILE__) . "/dictionaries/" . $lang . ".dic";

        // Procede apenas se o arquivo de dicionário existir
        if (file_exists($dictionaryPath)) {
            $dictionary = file($dictionaryPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            
            // Converte todo o dicionário para minúsculas de uma só vez para performance
            $dictionary = array_map('strtolower', $dictionary);
            $dictionarySet = array_flip($dictionary); // Usa um hash set para buscas O(1)

            foreach ($words as $word) {
                // A verificação agora é muito mais rápida
                if (!isset($dictionarySet[strtolower($word)])) {
                    array_push($misspelled, $word);
                }
            }
        }
    }

    // Envia a resposta JSON, que será um array vazio se algo der errado
    echo json_encode((object)array('words' => $misspelled));
?>