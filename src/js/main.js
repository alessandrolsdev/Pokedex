/**
 * Módulo Principal (Orquestrador)
 */
import '../css/style.css';

// 1. Importações do recents.js
import { getRecents, addRecent } from './recents.js';

// 2. Importações do api.js (corrigido, sem duplicatas)
import { fetchPokemon, fetchEvolutionChain } from './api.js';

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
    renderEvolutionChain // <-- ADICIONADO AQUI
} from './ui.js';


// --- Função "Controladora" Principal ---
async function buscarEExibirPokemon(nomePokemon) {
    
    // 1. CHAMA O FADE-OUT E ESPERA ELE TERMINAR (300ms)
    await renderLoading(true); 
    
    // 2. SÓ DEPOIS de 300ms, ele começa a buscar os dados
    try {
        const data = await fetchPokemon(nomePokemon);
        const evolutionArray = await fetchEvolutionChain(data.id);
        
        addRecent(data.name);
        renderPokemonList(getRecents());

        // 3. Espera o card (e a imagem) carregar
        await renderPokemonCard(data); 
        renderEvolutionChain(evolutionArray); // <-- Agora funciona
        
        const itemAtivo = document.getElementById(data.name);
        atualizaSelecaoLista(itemAtivo);
        
    } catch (error) {
        console.error("Erro:", error.message);
        renderError(error.message); 
        renderEvolutionChain([]); // <-- E aqui também
        atualizaSelecaoLista(null);
    } finally {
        // 4. CHAMA O FADE-IN (quando tudo estiver pronto)
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