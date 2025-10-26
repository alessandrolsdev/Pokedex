/**
 * Módulo Principal (Orquestrador)
 */
import '../css/global.css';
import '../css/card.css';
import '../css/listagem.css';
import '../css/responsivo.css';



// 1. Importações do recents.js
import { getRecents, addRecent } from './recents.js';

// 2. Importações do api.js (corrigido, sem duplicatas)
import { fetchPokemon, fetchSpeciesAndEvolution } from './api.js';
// 3. Importações do ui.js (corrigido, adicionando renderEvolutionChain)
import { 
    renderPokemonCard, 
    renderLoading, 
    renderError,
    atualizaSelecaoLista,
    renderPokemonList,
    listaPokemonNavEl,
    buscaFormEl, 
    buscaInputEl,
    renderEvolutionChain,
    renderSpeciesData,
} from './ui.js';


// --- Função "Controladora" Principal ---
async function buscarEExibirPokemon(nomePokemon) {
    await renderLoading(true); 
    
    try {
        const data = await fetchPokemon(nomePokemon);
        const { speciesData, evolutionArray } = await fetchSpeciesAndEvolution(data.id);
        
        addRecent(data.name);
        renderPokemonList(getRecents()); // Redesenha a lista

        await renderPokemonCard(data); 
        renderEvolutionChain(evolutionArray);
        renderSpeciesData(speciesData);
        
        // --- CORREÇÃO AQUI ---
        // 1. Tenta encontrar o item na lista DEPOIS que ela foi redesenhada
        const itemAtivo = document.getElementById(data.name); 
        
        // 2. SÓ atualiza a seleção SE o item foi encontrado
        if (itemAtivo) { 
            atualizaSelecaoLista(itemAtivo);
        } else {
            // Se não encontrou (veio da busca), remove a seleção de qualquer item antigo
            atualizaSelecaoLista(null); 
        }
        // --- FIM DA CORREÇÃO ---
        
    } catch (error) {
        console.error("Erro:", error.message);
        renderError(error.message); 
        renderEvolutionChain([]); 
        renderSpeciesData(null); 
        atualizaSelecaoLista(null); // Garante que a seleção é limpa no erro
    } finally {
        renderLoading(false);
    }
}

// --- Configurando os Event Listeners (permanece igual) ---
listaPokemonNavEl.addEventListener('click', (evento) => {
    const itemPokemon = evento.target.closest('.pokemon');
    if (itemPokemon) {
        const nomePokemon = itemPokemon.id;
        buscarEExibirPokemon(nomePokemon);
    }
});

buscaFormEl.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const termoBusca = buscaInputEl.value.trim().toLowerCase();
    
    if (termoBusca) {
        buscarEExibirPokemon(termoBusca); 
        buscaInputEl.value = '';
    }
});

// --- Carga Inicial (permanece igual) ---
function carregarPagina() {
    const recents = getRecents();
    
    const listaInicial = recents.length > 0 ? recents : ['pikachu', 'bulbasaur', 'charmander', 'gyarados', 'gengar', 'dragonite'];

    renderPokemonList(listaInicial);
    buscarEExibirPokemon(listaInicial[0]);
}

carregarPagina(); // Roda a função de carga inicial