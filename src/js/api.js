/**
 * Módulo da API
 * Responsabilidade: Apenas buscar dados na PokéAPI.
 */

// Exportamos a função para que outros arquivos (como o main.js) possam usá-la.
export async function fetchPokemon(pokemonName) {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            // Em vez de 'alert' ou 'textContent', apenas 'lançamos um erro'
            // Quem chamou a função (o main.js) que decide o que fazer.
            throw new Error('Pokémon não encontrado');
        }
        
        const data = await response.json();
        return data; // Retorna os dados do Pokémon em caso de sucesso
        
    } catch (error) {
        // Propaga o erro para quem chamou a função
        throw error;
    }
}
// Função auxiliar para "achatar" os dados da evolução
function parseEvolutionChain(chain) {
    const evolutions = [];
    let current = chain;

    // Loop que "anda" pela cadeia aninhada
    do {
        evolutions.push(current.species.name);
        current = current.evolves_to[0]; // Pega a *primeira* evolução
    } while (!!current && current.hasOwnProperty('evolves_to'));

    return evolutions; // Retorna ex: ['bulbasaur', 'ivysaur', 'venusaur']
}


export async function fetchEvolutionChain(pokemonId) {
    try {
        // 1. Busca a ESPÉCIE para encontrar a URL da cadeia
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`;
        const speciesResponse = await fetch(speciesUrl);
        if (!speciesResponse.ok) {
            throw new Error('Espécie do Pokémon não encontrada.');
        }
        const speciesData = await speciesResponse.json();
        
        const evolutionChainUrl = speciesData.evolution_chain.url;

        // 2. Busca a CADEIA DE EVOLUÇÃO
        const evolutionResponse = await fetch(evolutionChainUrl);
        if (!evolutionResponse.ok) {
            throw new Error('Cadeia de evolução não encontrada.');
        }
        const evolutionData = await evolutionResponse.json();

        // 3. "Achata" os dados e retorna a lista de nomes
        return parseEvolutionChain(evolutionData.chain);

    } catch (error) {
        console.error("Erro ao buscar cadeia de evolução:", error);
        return []; // Retorna uma lista vazia em caso de erro
    }
}