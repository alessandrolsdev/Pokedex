/**
 * @file api.js
 * @description Módulo responsável por todas as interações com a PokéAPI v2.
 * Centraliza a lógica de busca de dados dos Pokémon, espécies e evoluções.
 */

// URL base da PokéAPI v2
const API_BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Busca os dados principais de um Pokémon específico pelo nome ou ID.
 * @param {string | number} pokemonIdentifier - O nome (lowercase) ou o ID numérico do Pokémon.
 * @returns {Promise<object>} Uma Promise que resolve com o objeto de dados do Pokémon.
 * @throws {Error} Lança um erro se o Pokémon não for encontrado ou houver falha na rede.
 */
export async function fetchPokemon(pokemonIdentifier) {
    // Constrói a URL completa para o endpoint do Pokémon.
    // Garante que o nome esteja em minúsculas para a API.
    const url = `${API_BASE_URL}/pokemon/${String(pokemonIdentifier).toLowerCase()}`;

    try {
        // Realiza a requisição HTTP GET para a API.
        const response = await fetch(url);

        // Verifica se a resposta da API foi bem-sucedida (status 2xx).
        if (!response.ok) {
            // Se não foi OK (ex: 404 Not Found), lança um erro específico.
            throw new Error('Pokémon não encontrado');
        }

        // Converte o corpo da resposta em um objeto JSON.
        const data = await response.json();
        // Retorna os dados do Pokémon obtidos.
        return data;

    } catch (error) {
        // Captura qualquer erro (seja o 'Pokémon não encontrado' ou erros de rede)
        // e o propaga para a função que chamou (ex: main.js).
        console.error(`Erro ao buscar dados do Pokémon "${pokemonIdentifier}":`, error);
        throw error;
    }
}

/**
 * Função auxiliar (interna) para analisar a estrutura aninhada da cadeia de evolução
 * e extrair uma lista simples de nomes e IDs.
 * @param {object} chain - O objeto 'chain' da resposta da API de evolução.
 * @returns {Array<object>} Um array de objetos, cada um com { name: string, id: number }.
 */
function parseEvolutionChain(chain) {
    const evolutions = []; // Array para armazenar os estágios da evolução.
    let currentStage = chain; // Começa pelo primeiro estágio ('chain').

    // Função interna para extrair o ID numérico da URL da espécie.
    // Ex: "https://pokeapi.co/api/v2/pokemon-species/1/" -> 1
    const getIdFromUrl = (url) => {
        // Divide a URL pela '/' e pega o penúltimo segmento, que é o ID.
        const parts = url.split('/');
        // Garante que retorne um número inteiro.
        return parseInt(parts[parts.length - 2], 10);
    };

    // Itera pela cadeia de evolução enquanto houver um próximo estágio ('evolves_to').
    do {
        // Extrai o nome e o ID da espécie do estágio atual.
        const speciesName = currentStage.species.name;
        const speciesId = getIdFromUrl(currentStage.species.url);

        // Adiciona um objeto com nome e ID ao array de evoluções.
        evolutions.push({
            name: speciesName,
            id: speciesId
        });

        // Avança para o próximo estágio. A API retorna 'evolves_to' como um array,
        // mas geralmente só nos importamos com a primeira (e mais comum) evolução direta.
        currentStage = currentStage.evolves_to[0];

    } while (currentStage && currentStage.hasOwnProperty('evolves_to')); // Continua se 'currentStage' existir e tiver a propriedade 'evolves_to'.

    // Retorna a lista achatada de objetos de evolução.
    return evolutions;
}

/**
 * Busca dados da "espécie" do Pokémon (descrição, status lendário, geração)
 * E também busca e processa sua cadeia de evolução completa.
 * @param {number} pokemonId - O ID numérico do Pokémon.
 * @returns {Promise<object>} Uma Promise que resolve com um objeto contendo
 * { speciesData: object | null, evolutionArray: Array<object> }.
 */
export async function fetchSpeciesAndEvolution(pokemonId) {
    let speciesData = null; // Inicializa os dados da espécie como null.

    try {
        // --- Etapa 1: Buscar dados da Espécie ---
        const speciesUrl = `${API_BASE_URL}/pokemon-species/${pokemonId}/`;
        const speciesResponse = await fetch(speciesUrl);

        // Se a busca pela espécie falhar, não podemos continuar para a evolução.
        if (!speciesResponse.ok) {
            console.warn(`Espécie do Pokémon ${pokemonId} não encontrada. Dados de espécie e evolução não serão carregados.`);
            // Retorna um objeto indicando a falha, mas com um array de evolução vazio.
            return { speciesData: null, evolutionArray: [] };
        }
        speciesData = await speciesResponse.json(); // Guarda os dados da espécie se bem-sucedido.

        // --- Etapa 2: Buscar dados da Cadeia de Evolução ---
        // Verifica se a espécie possui uma URL para a cadeia de evolução.
        if (!speciesData.evolution_chain?.url) {
            console.warn(`Pokémon ${pokemonId} (${speciesData.name}) não possui URL de cadeia de evolução.`);
            // Se não tiver URL, a "evolução" é apenas o próprio Pokémon.
            return {
                speciesData: speciesData,
                // Retorna um array contendo apenas o Pokémon atual.
                evolutionArray: [{ name: speciesData.name, id: pokemonId }]
            };
        }
        const evolutionChainUrl = speciesData.evolution_chain.url;

        // Realiza a busca pela URL da cadeia de evolução.
        const evolutionResponse = await fetch(evolutionChainUrl);
        if (!evolutionResponse.ok) {
            console.warn(`Cadeia de evolução para ${pokemonId} não encontrada na URL: ${evolutionChainUrl}`);
            // Se a busca pela cadeia falhar, retorna os dados da espécie e apenas o Pokémon atual na evolução.
            return {
                speciesData: speciesData,
                evolutionArray: [{ name: speciesData.name, id: pokemonId }]
            };
        }
        const evolutionData = await evolutionResponse.json();

        // --- Etapa 3: Processar a Cadeia de Evolução ---
        // Usa a função auxiliar para transformar a estrutura aninhada em uma lista simples.
        const evolutionArray = parseEvolutionChain(evolutionData.chain);

        // --- Etapa 4: Retornar todos os dados combinados ---
        return {
            speciesData: speciesData,
            evolutionArray: evolutionArray
        };

    } catch (error) {
        // Captura qualquer erro durante o processo.
        console.error(`Erro ao buscar dados da espécie/evolução para ID ${pokemonId}:`, error);
        // Retorna um objeto indicando falha, mesmo que tenhamos pego 'speciesData' antes.
        // Isso simplifica o tratamento de erro no 'main.js'.
        return {
            speciesData: null, // Indica que algo deu errado no processo geral.
            evolutionArray: []  // Retorna array vazio para evitar erros na UI.
        };
    }
}