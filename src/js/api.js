/**
 * Módulo da API
 * Responsabilidade: Buscar dados na PokéAPI.
 */

// Função principal para buscar dados básicos do Pokémon
export async function fetchPokemon(pokemonName) {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Pokémon não encontrado');
        }
        
        const data = await response.json();
        return data; // Retorna os dados do Pokémon
        
    } catch (error) {
        throw error; // Propaga o erro
    }
}


// Função auxiliar (interna) para analisar a cadeia de evolução aninhada
function parseEvolutionChain(chain) {
    const evolutions = [];
    let current = chain;

    // Função interna para extrair o ID da URL (ex: .../pokemon-species/1/)
    const getIdFromUrl = (url) => {
        const parts = url.split('/');
        return parseInt(parts[parts.length - 2]); // Pega o penúltimo segmento
    };

    // Loop que "anda" pela cadeia aninhada
    do {
        const speciesName = current.species.name;
        const speciesId = getIdFromUrl(current.species.url);

        // Adiciona um OBJETO com nome e ID à lista
        evolutions.push({ 
            name: speciesName, 
            id: speciesId 
        });

        // Pega a *primeira* evolução (a API pode ter ramificações)
        current = current.evolves_to[0]; 
    } while (!!current && current.hasOwnProperty('evolves_to'));

    // Retorna ex: [{name: 'bulbasaur', id: 1}, {name: 'ivysaur', id: 2}, ...]
    return evolutions; 
}


// Função para buscar dados da Espécie (descrição, etc.) E a Cadeia de Evolução
export async function fetchSpeciesAndEvolution(pokemonId) {
    try {
        // 1. Busca a ESPÉCIE
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`;
        const speciesResponse = await fetch(speciesUrl);
        if (!speciesResponse.ok) {
            // Se a espécie falhar, não adianta buscar evolução
            console.warn(`Espécie do Pokémon ${pokemonId} não encontrada. Evolução não será buscada.`);
            return { speciesData: null, evolutionArray: [] }; 
        }
        const speciesData = await speciesResponse.json(); // GUARDAMOS OS DADOS DA ESPÉCIE
        
        // Verifica se existe URL de evolução
        if (!speciesData.evolution_chain?.url) {
            console.warn(`Pokémon ${pokemonId} não possui URL de cadeia de evolução.`);
            return { speciesData: speciesData, evolutionArray: [speciesData.name] }; // Retorna só o nome atual
        }
        const evolutionChainUrl = speciesData.evolution_chain.url;

        // 2. Busca a CADEIA DE EVOLUÇÃO (só se a URL existir)
        const evolutionResponse = await fetch(evolutionChainUrl);
        if (!evolutionResponse.ok) {
            console.warn(`Cadeia de evolução para ${pokemonId} não encontrada na URL: ${evolutionChainUrl}`);
            return { speciesData: speciesData, evolutionArray: [speciesData.name] }; // Retorna só o nome atual
        }
        const evolutionData = await evolutionResponse.json();

        // 3. "Achata" os dados da evolução usando a função auxiliar
        const evolutionArray = parseEvolutionChain(evolutionData.chain);

        // 4. RETORNA AMBOS: DADOS DA ESPÉCIE + LISTA DE EVOLUÇÃO
        return {
            speciesData: speciesData,
            evolutionArray: evolutionArray
        };

    } catch (error) {
        // Loga o erro, mas tenta retornar algo útil
        console.error("Erro ao buscar dados da espécie/evolução:", error);
        return { 
            speciesData: null, // Indica que os dados da espécie falharam
            evolutionArray: [] // Retorna lista de evolução vazia
        }; 
    }
}