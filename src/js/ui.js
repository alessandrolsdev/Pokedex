/**
 * Módulo de UI (User Interface)
 * Responsabilidade: Apenas manipular o HTML (o DOM).
 */

// --- 1. Seletores dos Elementos (agora vivem aqui) ---

const cardPokemon = document.getElementById('pokemon-card-display');
const pokemonNomeEl = document.getElementById('pokemon-nome');
const pokemonIdEl = document.getElementById('pokemon-id');
const pokemonImagemEl = document.getElementById('pokemon-imagem');
const pokemonTipoEl = document.getElementById('pokemon-tipo');
const hpValorEl = document.getElementById('hp-valor');
const ataqueValorEl = document.getElementById('ataque-valor');
const defesaValorEl = document.getElementById('defesa-valor');
const velocidadeValorEl = document.getElementById('velocidade-valor');
const habilidade1El = document.getElementById('habilidade-1');
const habilidade2El = document.getElementById('habilidade-2');
const loadingOverlayEl = document.getElementById('loading-overlay');
export const listaEvolucoesEl = document.getElementById('lista-evolucoes');
export const listaPokemonNavEl = document.getElementById('lista-pokemon-nav');
export const buscaFormEl = document.getElementById('busca-form');
export const buscaInputEl = document.getElementById('busca-input');
const FADE_DURATION_MS = 300;

// --- 2. Funções de Renderização (exportadas) ---

export async function renderPokemonCard(data) {
    
    // 1. Define todos os dados de TEXTO 
    pokemonNomeEl.textContent = data.name;
    pokemonIdEl.textContent = `#${data.id.toString().padStart(3, '0')}`;
    pokemonImagemEl.alt = data.name; // Definimos o alt

    const getStat = (statName) => {
        const stat = data.stats.find(s => s.stat.name === statName);
        return stat ? stat.base_stat : '0';
    };
    
    hpValorEl.textContent = getStat('hp');
    ataqueValorEl.textContent = getStat('attack');
    defesaValorEl.textContent = getStat('defense');
    velocidadeValorEl.textContent = getStat('speed');

    const habilidades = data.abilities.map(a => a.ability.name);
    habilidade1El.textContent = habilidades[0] || '---';
    habilidade2El.textContent = habilidades[1] || '---';

    const tipoPrincipal = data.types[0].type.name;
    pokemonTipoEl.textContent = tipoPrincipal;
    cardPokemon.className = `cartao-pokemon tipo-${tipoPrincipal} aberto`;

    // 2. A MÁGICA: Pré-carregamento Hierárquico da Imagem
    // Esta função retorna uma "Promessa"
    return new Promise((resolve) => {
        
        // Pega as duas URLs possíveis de forma segura
        const artwork = data.sprites?.other?.['official-artwork']?.front_default;
        const sprite = data.sprites?.front_default;

        // --- Lógica de Fallback (Plano B) ---
        const loadFallback = () => {
            // Se o sprite (plano B) existir
            if (sprite) {
                pokemonImagemEl.src = sprite;
                pokemonImagemEl.classList.add('mostrando-sprite'); // Adiciona classe p/ CSS
                pokemonImagemEl.onload = () => resolve(); // Sucesso (Plano B)
                pokemonImagemEl.onerror = () => { // Falha (Plano B)
                    pokemonImagemEl.src = ''; 
                    pokemonImagemEl.classList.remove('mostrando-sprite');
                    resolve(); 
                };
            } else {
                // Se não tiver nem artwork nem sprite
                pokemonImagemEl.src = ''; 
                pokemonImagemEl.classList.remove('mostrando-sprite');
                resolve();
            }
        };
        // ------------------------------------


        // --- Tentativa Principal (Plano A) ---
        // Se o link do artwork (Plano A) existir
        if (artwork) {
            pokemonImagemEl.src = artwork;
            pokemonImagemEl.classList.remove('mostrando-sprite'); // Remove classe
            pokemonImagemEl.onload = () => resolve(); // Sucesso (Plano A)
            pokemonImagemEl.onerror = loadFallback; // Falha (Plano A) -> Tenta o Plano B
        } else {
            // Se o link do artwork nem veio, pula direto pro Plano B
            loadFallback();
        }
    });
    // --- FIM DO BLOCO DE CÓDIGO CORRETO ---
    
    /* O BLOCO DE CÓDIGO ANTIGO QUE ESTAVA AQUI (if !imageUrl ...)
       FOI REMOVIDO.
    */
}

// Substitua sua função renderLoading por esta
export function renderLoading(isLoading) {
    
    if (isLoading) {
        // --- LÓGICA DE FADE-OUT ---
        loadingOverlayEl.classList.add('visivel');
        cardPokemon.classList.add('carregando'); // Inicia o fade-out

        // Retorna uma promessa que espera a animação terminar
        return new Promise(resolve => {
            setTimeout(resolve, FADE_DURATION_MS);
        });

    } else {
        // --- LÓGICA DE FADE-IN ---
        loadingOverlayEl.classList.remove('visivel');
        cardPokemon.classList.remove('carregando'); // Inicia o fade-in
        
        // O fade-in não precisa ser esperado, então não retornamos nada
    }
}
export function renderError(message) {
    // 1. Define a cor/classe do card e o torna visível
    cardPokemon.className = 'cartao-pokemon tipo-unknown aberto';

    // 2. Preenche o topo com a mensagem de erro
    pokemonNomeEl.textContent = 'Não Encontrado';
    pokemonIdEl.textContent = '#???';
    pokemonTipoEl.textContent = 'error';
    
    // 3. Limpa a imagem
    pokemonImagemEl.src = ''; 
    pokemonImagemEl.alt = 'Pokémon não encontrado';
    pokemonImagemEl.classList.remove('mostrando-sprite'); // Garante que a classe do sprite saia

    // 4. Limpa os stats
    hpValorEl.textContent = '-';
    ataqueValorEl.textContent = '-';
    defesaValorEl.textContent = '-';
    velocidadeValorEl.textContent = '-';

    // 5. Limpa as habilidades
    habilidade1El.textContent = '---';
    habilidade2El.textContent = '---';
}

export function atualizaSelecaoLista(itemClicado) {
    // Remove de quem estava ativo
    const pokemonAtivoNaLista = document.querySelector('.listagem .ativo');
    if (pokemonAtivoNaLista) {
        pokemonAtivoNaLista.classList.remove('ativo');
    }

    // Adiciona no item que foi clicado (se houver um)
    if(itemClicado) {
        itemClicado.classList.add('ativo');
    }
}
// Substitua esta função no seu src/js/ui.js

export function renderPokemonList(pokemonList) {
    // 1. Limpa a lista antiga
    listaPokemonNavEl.innerHTML = ''; 

    // 2. Cria os novos <li> para cada item da lista
    pokemonList.forEach(pokemonName => {
        const li = document.createElement('li');
        li.className = 'pokemon';
        li.id = pokemonName;

        // 3. (REMOVIDO) Não criamos mais o 'imgPath'
        
        // 4. Inserimos APENAS o <span> com o nome
        li.innerHTML = `
            <span>${pokemonName}</span>
        `;
        
        listaPokemonNavEl.appendChild(li);
    });
}
export function renderEvolutionChain(evolutionArray) {
    // Limpa a lista anterior
    listaEvolucoesEl.innerHTML = '';

    if (!evolutionArray || evolutionArray.length <= 1) {
        // Se não tiver evoluções (ou só tiver 1 estágio)
        const li = document.createElement('li');
        li.textContent = 'Não possui evoluções';
        li.style.fontWeight = 'normal'; // Estilo mais simples
        li.style.color = '#888';
        li.style.textAlign = 'left';
        li.style.marginBottom = '0';
        listaEvolucoesEl.appendChild(li);
        
        // Remove a "seta"
        li.classList.add('no-evolution'); 
        // (Precisamos de uma pequena regra CSS para isso)

    } else {
        // Desenha cada nome na lista
        evolutionArray.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            listaEvolucoesEl.appendChild(li);
        });
    }
}