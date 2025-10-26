/**
 * Módulo de UI (User Interface)
 * Responsabilidade: Apenas manipular o HTML (o DOM).
 */

// --- 1. Seletores dos Elementos (usados globalmente) ---
// Certifique-se que estes IDs correspondem EXATAMENTE ao index.html
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
const pokemonSomBtn = document.getElementById('pokemon-som-btn');
export const listaEvolucoesEl = document.getElementById('lista-evolucoes');
export const listaPokemonNavEl = document.getElementById('lista-pokemon-nav');
export const buscaFormEl = document.getElementById('busca-form');
export const buscaInputEl = document.getElementById('busca-input');
// Seletores para Geração/Lendário/Descrição são buscados DENTRO de renderSpeciesData

// Duração da animação de fade (deve corresponder ao CSS)
const FADE_DURATION_MS = 300;

// Variável para guardar o objeto de áudio atual
let audioAtual = null;

// --- 2. Funções de Renderização (exportadas) ---

export async function renderPokemonCard(data) {
    // Verifica se os seletores principais existem antes de usá-los
    if (!cardPokemon || !pokemonNomeEl || !pokemonIdEl || !pokemonImagemEl || !pokemonTipoEl) {
        console.error("Erro Crítico: Elementos principais do card não encontrados!");
        return Promise.reject("Elementos do card faltando"); // Rejeita a promise
    }

    // Define todos os dados de TEXTO
    pokemonNomeEl.textContent = data.name;
    pokemonIdEl.textContent = `#${data.id.toString().padStart(3, '0')}`;
    pokemonImagemEl.alt = data.name;

    const getStat = (statName) => {
        const stat = data.stats.find(s => s.stat.name === statName);
        return stat ? stat.base_stat : '0';
    };
    
    // Verifica os elementos de stat antes de usar
    if(hpValorEl) hpValorEl.textContent = getStat('hp');
    if(ataqueValorEl) ataqueValorEl.textContent = getStat('attack');
    if(defesaValorEl) defesaValorEl.textContent = getStat('defense');
    if(velocidadeValorEl) velocidadeValorEl.textContent = getStat('speed');

    const habilidades = data.abilities.map(a => a.ability.name);
    if(habilidade1El) habilidade1El.textContent = habilidades[0] || '---';
    if(habilidade2El) habilidade2El.textContent = habilidades[1] || '---';

    // Define o tipo e a classe do card
    const tipoPrincipal = data.types[0].type.name;
    pokemonTipoEl.textContent = tipoPrincipal;
    cardPokemon.className = `cartao-pokemon tipo-${tipoPrincipal} aberto`;

    // Lógica do Som (com verificação)
    const somUrl = data.cries?.latest || data.cries?.legacy;
    if (somUrl && pokemonSomBtn) {
        audioAtual = new Audio(somUrl);
        pokemonSomBtn.classList.remove('escondido');
    } else {
        audioAtual = null;
        if(pokemonSomBtn) pokemonSomBtn.classList.add('escondido');
    }

    // Pré-carregamento Hierárquico da Imagem (Retorna Promise)
    return new Promise((resolve) => {
        const artwork = data.sprites?.other?.['official-artwork']?.front_default;
        const sprite = data.sprites?.front_default;

        const loadFallback = () => {
            if (sprite) {
                pokemonImagemEl.src = sprite;
                pokemonImagemEl.classList.add('mostrando-sprite');
                pokemonImagemEl.onload = () => resolve();
                pokemonImagemEl.onerror = () => {
                    pokemonImagemEl.src = '';
                    pokemonImagemEl.classList.remove('mostrando-sprite');
                    resolve(); 
                };
            } else {
                pokemonImagemEl.src = '';
                pokemonImagemEl.classList.remove('mostrando-sprite');
                resolve();
            }
        };

        if (artwork) {
            pokemonImagemEl.src = artwork;
            pokemonImagemEl.classList.remove('mostrando-sprite');
            pokemonImagemEl.onload = () => resolve();
            pokemonImagemEl.onerror = loadFallback;
        } else {
            loadFallback();
        }
    });
}

export function renderLoading(isLoading) {
    if (!loadingOverlayEl || !cardPokemon) return; // Verifica se elementos existem

    if (isLoading) {
        loadingOverlayEl.classList.add('visivel');
        cardPokemon.classList.add('carregando'); 
        if(pokemonNomeEl) pokemonNomeEl.textContent = ''; 
        if(pokemonIdEl) pokemonIdEl.textContent = '';
        return new Promise(resolve => setTimeout(resolve, FADE_DURATION_MS));
    } else {
        loadingOverlayEl.classList.remove('visivel');
        cardPokemon.classList.remove('carregando');
    }
}

export function renderError(message) {
     // Verifica os seletores principais ANTES de usá-los
    if (!cardPokemon || !pokemonNomeEl || !pokemonIdEl || !pokemonTipoEl || !pokemonImagemEl || !pokemonSomBtn ||
        !hpValorEl || !ataqueValorEl || !defesaValorEl || !velocidadeValorEl || !habilidade1El || !habilidade2El) {
        console.error("Erro em renderError: Elementos essenciais da UI não foram encontrados!");
        return; // Sai da função para evitar o erro 'null'
    }

    cardPokemon.className = 'cartao-pokemon tipo-unknown aberto';
    pokemonNomeEl.textContent = 'Não Encontrado';
    pokemonIdEl.textContent = '#???';
    pokemonTipoEl.textContent = 'error';
    pokemonImagemEl.src = ''; 
    pokemonImagemEl.alt = 'Pokémon não encontrado';
    pokemonImagemEl.classList.remove('mostrando-sprite');
    pokemonSomBtn.classList.add('escondido');
    audioAtual = null;

    hpValorEl.textContent = '-';
    ataqueValorEl.textContent = '-';
    defesaValorEl.textContent = '-';
    velocidadeValorEl.textContent = '-';

    habilidade1El.textContent = '---';
    habilidade2El.textContent = '---';

    renderSpeciesData(null); 
    renderEvolutionChain([]); 
}

export function atualizaSelecaoLista(itemClicado) {
    if (!document.querySelector) return; // Verifica se querySelector existe

    const pokemonAtivoNaLista = document.querySelector('.listagem .ativo');
    if (pokemonAtivoNaLista) {
        pokemonAtivoNaLista.classList.remove('ativo');
    }
    if(itemClicado && document.body.contains(itemClicado)) {
        itemClicado.classList.add('ativo');
    }
}

export function renderPokemonList(pokemonList) {
    if (!listaPokemonNavEl) return; // Verifica se o elemento da lista existe

    listaPokemonNavEl.innerHTML = ''; 
    pokemonList.forEach(pokemonName => {
        const li = document.createElement('li');
        li.className = 'pokemon';
        li.id = pokemonName;
        li.innerHTML = `<span>${pokemonName}</span>`;
        listaPokemonNavEl.appendChild(li);
    });
}

export function renderEvolutionChain(evolutionArray) {
    if (!listaEvolucoesEl) return; // Verifica se o elemento existe

    listaEvolucoesEl.innerHTML = '';
    let message = '';
    if (!evolutionArray || evolutionArray.length === 0) {
         message = 'Evolução indisponível';
    } else if (evolutionArray.length === 1) {
         message = 'Não possui evoluções';
    }

    if (message) {
        const li = document.createElement('li');
        li.textContent = message;
        li.style.fontWeight = 'normal'; li.style.color = '#888';
        li.style.textAlign = 'left'; li.style.marginBottom = '0';
        li.classList.add('no-evolution'); 
        listaEvolucoesEl.appendChild(li);
    } else {
        evolutionArray.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            listaEvolucoesEl.appendChild(li);
        });
    }
}

export function renderSpeciesData(speciesData) {
    const pokemonGeracaoEl = document.getElementById('pokemon-geracao');
    const pokemonLendarioStatusEl = document.getElementById('pokemon-lendario-status');
    const pokemonDescricaoEl = document.getElementById('pokemon-descricao');

    if (!pokemonGeracaoEl || !pokemonLendarioStatusEl || !pokemonDescricaoEl) {
        console.error("Erro em renderSpeciesData: Elementos da UI não encontrados!");
        return; 
    }

    if (!speciesData) {
        pokemonGeracaoEl.textContent = 'N/A';
        pokemonLendarioStatusEl.textContent = '';
        pokemonLendarioStatusEl.className = 'lendario-status';
        pokemonDescricaoEl.textContent = 'Descrição não disponível.';
        return;
    }

    const geracaoMap = {
        "generation-i": "Kanto", "generation-ii": "Johto", "generation-iii": "Hoenn",
        "generation-iv": "Sinnoh", "generation-v": "Unova", "generation-vi": "Kalos",
        "generation-vii": "Alola", "generation-viii": "Galar", "generation-ix": "Paldea",
    };
    pokemonGeracaoEl.textContent = geracaoMap[speciesData.generation.name] || speciesData.generation.name;

    pokemonLendarioStatusEl.textContent = '';
    pokemonLendarioStatusEl.className = 'lendario-status';
    if (speciesData.is_legendary) {
        pokemonLendarioStatusEl.textContent = 'Lendário';
        pokemonLendarioStatusEl.classList.add('lendario');
    } else if (speciesData.is_mythical) {
        pokemonLendarioStatusEl.textContent = 'Mítico';
        pokemonLendarioStatusEl.classList.add('mitico');
    }

    const descPt = speciesData.flavor_text_entries.find(e => e.language.name === 'pt');
    const descEn = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
    pokemonDescricaoEl.textContent = (descPt || descEn)?.flavor_text.replace(/[\n\f\r]/g, ' ') || 'Descrição não disponível.';
}

// --- 3. Event Listeners ---

// Listener para o botão de som (com verificação)
if (pokemonSomBtn) {
    pokemonSomBtn.addEventListener('click', () => {
        if (audioAtual) {
            audioAtual.currentTime = 0;
            audioAtual.play().catch(e => console.error("Erro ao tocar áudio:", e));
        }
    });
} else {
    console.warn("Botão de som (pokemon-som-btn) não encontrado no DOM.");
}