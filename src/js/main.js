/**
 * @file main.js
 * @description Ponto de entrada principal da aplicação Pokédex.
 * Responsável por orquestrar a interação entre os módulos de API, UI e Recentes.
 * Configura os listeners de eventos (cliques na lista, submissão da busca)
 * e gerencia o fluxo principal de buscar dados e renderizar a interface.
 */

// --- 1. Importações de Módulos ---

// Importa os estilos CSS globais e de componentes.
// O Webpack (com css-loader e MiniCssExtractPlugin) processará estas importações.
import '../css/global.css';
import '../css/card.css';
import '../css/listagem.css';
import '../css/responsivo.css';

// Importa as funções para gerenciar a lista de Pokémon recentes.
import { getRecents, addRecent } from './recents.js';

// Importa as funções para buscar dados da PokéAPI.
import { fetchPokemon, fetchSpeciesAndEvolution } from './api.js';

// Importa as funções e elementos de UI necessários para renderizar e interagir com o DOM.
import {
    renderPokemonCard,
    renderLoading,
    renderError,
    atualizaSelecaoLista,
    renderPokemonList,
    renderEvolutionChain,
    renderSpeciesData,
    listaPokemonNavEl, // A <ul> da lista de recentes
    buscaFormEl,       // O <form> de busca
    buscaInputEl      // O <input> de busca
} from './ui.js';

// --- 2. Função Principal de Controle ---

/**
 * Função assíncrona central que gerencia o fluxo completo de:
 * 1. Mostrar estado de loading (com fade-out).
 * 2. Buscar dados do Pokémon e de sua espécie/evolução.
 * 3. Adicionar o Pokémon aos recentes e redesenhar a lista.
 * 4. Renderizar o card principal (esperando a imagem carregar).
 * 5. Renderizar a cadeia de evolução e dados da espécie.
 * 6. Atualizar o item ativo na lista de recentes.
 * 7. Esconder o estado de loading (com fade-in).
 * Inclui tratamento de erro robusto.
 * @param {string | number} pokemonIdentifier - Nome (lowercase) ou ID do Pokémon a ser buscado.
 */
async function buscarEExibirPokemon(pokemonIdentifier) {
    // Garante que temos um identificador válido antes de prosseguir.
    if (!pokemonIdentifier) {
        console.warn("buscarEExibirPokemon chamado sem um identificador.");
        return;
    }

    // Etapa 1: Inicia o estado de loading visual (fade-out) e espera a animação terminar.
    // O 'await' aqui previne a "condição de corrida" da animação.
    await renderLoading(true);

    try {
        // Etapa 2: Busca os dados principais do Pokémon.
        const pokemonData = await fetchPokemon(pokemonIdentifier);

        // Etapa 3: Busca os dados da espécie e evolução (chamada em paralelo ou sequência).
        // Usamos o ID retornado pela primeira chamada para garantir consistência.
        const { speciesData, evolutionArray } = await fetchSpeciesAndEvolution(pokemonData.id);

        // Etapa 4: Gerencia a lista de recentes.
        addRecent(pokemonData.name);         // Adiciona o nome do Pokémon à "memória".
        const recentsList = getRecents();    // Pega a lista atualizada.
        renderPokemonList(recentsList);      // Redesenha a lista de navegação na UI.

        // Etapa 5: Renderiza o card principal e os dados da espécie/evolução.
        // Espera o renderPokemonCard terminar (incluindo o carregamento da imagem).
        await renderPokemonCard(pokemonData);
        // Renderiza as informações secundárias (não precisam de await, são rápidas).
        renderEvolutionChain(evolutionArray);
        renderSpeciesData(speciesData);

        // Etapa 6: Atualiza o item ativo na lista de navegação.
        // Tenta encontrar o <li> correspondente ao Pokémon atual na lista redesenhada.
        const itemAtivoNaLista = document.getElementById(pokemonData.name);
        // Chama a função da UI para marcar como ativo (ou desmarcar outros se não encontrado).
        atualizaSelecaoLista(itemAtivoNaLista); // Passa o elemento encontrado ou null

    } catch (error) {
        // Etapa 7: Tratamento de erro.
        // Se qualquer 'await' acima falhar (ex: Pokémon não encontrado, erro de rede),
        // este bloco é executado.
        console.error("Erro no fluxo principal buscarEExibirPokemon:", error.message);
        // Chama a função da UI para exibir o estado de erro no card.
        renderError(error.message); // renderError limpa todos os campos, incluindo espécie/evolução.
        // Garante que nenhum item fique selecionado na lista em caso de erro.
        atualizaSelecaoLista(null);
    } finally {
        // Etapa 8: Finalização (sempre executada).
        // Esconde o estado de loading visual (spinner e inicia o fade-in do card).
        renderLoading(false);
    }
}

// --- 3. Configuração dos Event Listeners ---
// Adiciona os "ouvintes" de eventos aos elementos interativos (lista e busca).

// Listener para cliques na LISTA de recentes (<ul>).
// Usa "event delegation": ouve cliques na <ul> pai e verifica se o clique
// ocorreu em um filho <li> com a classe 'pokemon'.
if (listaPokemonNavEl) {
    listaPokemonNavEl.addEventListener('click', (evento) => {
        // '.closest()' encontra o ancestral mais próximo que corresponde ao seletor.
        const itemPokemonClicado = evento.target.closest('.pokemon');
        // Se o clique foi realmente em um item da lista:
        if (itemPokemonClicado) {
            // Obtém o ID do Pokémon (que é o 'id' do elemento <li>).
            const nomePokemon = itemPokemonClicado.id;
            // Chama a função principal para buscar e exibir o Pokémon clicado.
            buscarEExibirPokemon(nomePokemon);
        }
    });
} else {
    console.error("Erro Crítico: Container da lista de navegação (lista-pokemon-nav) não encontrado. Cliques na lista não funcionarão.");
}

// Listener para a submissão do FORMULÁRIO de busca.
// Ouve o evento 'submit', que captura tanto o clique no botão quanto o Enter no input.
if (buscaFormEl && buscaInputEl) {
    buscaFormEl.addEventListener('submit', (evento) => {
        // Impede o comportamento padrão do formulário (que recarregaria a página).
        evento.preventDefault();
        // Obtém o valor do input, remove espaços extras e converte para minúsculas.
        const termoBusca = buscaInputEl.value.trim().toLowerCase();

        // Se o termo de busca não estiver vazio:
        if (termoBusca) {
            // Chama a função principal para buscar e exibir o Pokémon pesquisado.
            buscarEExibirPokemon(termoBusca);
            // Limpa o campo de input após a busca.
            buscaInputEl.value = '';
        }
    });
} else {
    console.error("Erro Crítico: Formulário de busca (busca-form) ou input (busca-input) não encontrado. A busca não funcionará.");
}


// --- 4. Carga Inicial da Aplicação ---

/**
 * Função executada quando a página carrega pela primeira vez.
 * Decide qual lista de Pokémon exibir inicialmente (recentes ou padrão)
 * e carrega o primeiro Pokémon dessa lista.
 */
function carregarPaginaInicial() {
    // Obtém a lista de recentes armazenada no localStorage.
    const recents = getRecents();

    // Define a lista inicial a ser exibida:
    // Se houver recentes salvos, usa essa lista.
    // Caso contrário (primeira visita ou localStorage limpo), usa uma lista padrão.
    const listaParaExibir = recents.length > 0 ? recents : ['pikachu', 'bulbasaur', 'charmander', 'gyarados', 'gengar', 'dragonite'];

    // Renderiza a lista de navegação inicial na UI.
    renderPokemonList(listaParaExibir);

    // Carrega e exibe os dados do PRIMEIRO Pokémon da lista inicial.
    // Isso garante que a Pokédex não comece vazia.
    if (listaParaExibir.length > 0) {
        buscarEExibirPokemon(listaParaExibir[0]);
    } else {
        // Caso extremo: Sem recentes e sem lista padrão, mostra um estado vazio/inicial.
        console.warn("Nenhum Pokémon inicial para carregar.");
        // Poderia chamar renderError() ou uma função renderEmptyState() aqui.
    }
}

// Executa a função de carga inicial assim que o script principal (main.js) é carregado.
// Como usamos Webpack, isso acontece depois que o DOM está pronto.
carregarPaginaInicial();