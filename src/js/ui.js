/**
 * @file ui.js
 * @description Módulo de UI (User Interface). Responsável por interagir
 * diretamente com o DOM (Document Object Model) para exibir dados,
 * controlar estados visuais (loading, error) e responder a eventos
 * que não são diretamente ligados à busca principal (como o botão de som).
 */

// --- 1. Seletores de Elementos do DOM ---
// Buscamos os elementos HTML pelos seus IDs uma vez e os armazenamos
// em constantes para fácil acesso e melhor performance.

// Elementos do Card Principal
const cardPokemon = document.getElementById('pokemon-card-display');
const pokemonNomeEl = document.getElementById('pokemon-nome');
const pokemonIdEl = document.getElementById('pokemon-id');
const pokemonImagemEl = document.getElementById('pokemon-imagem');
const pokemonTipoEl = document.getElementById('pokemon-tipo');
const pokemonSomBtn = document.getElementById('pokemon-som-btn');

// Elementos da Seção de Status
const hpValorEl = document.getElementById('hp-valor');
const ataqueValorEl = document.getElementById('ataque-valor');
const defesaValorEl = document.getElementById('defesa-valor');
const velocidadeValorEl = document.getElementById('velocidade-valor');

// Elementos da Seção de Habilidades
const habilidade1El = document.getElementById('habilidade-1');
const habilidade2El = document.getElementById('habilidade-2');

// Elemento do Overlay de Carregamento
const loadingOverlayEl = document.getElementById('loading-overlay');

// Elemento da Lista de Evoluções (exportado pois é preenchido aqui)
export const listaEvolucoesEl = document.getElementById('lista-evolucoes');

// Elemento da Lista de Navegação/Recentes (exportado para main.js adicionar listener)
export const listaPokemonNavEl = document.getElementById('lista-pokemon-nav');

// Elementos do Formulário de Busca (exportados para main.js adicionar listener)
export const buscaFormEl = document.getElementById('busca-form');
export const buscaInputEl = document.getElementById('busca-input');

// --- 2. Constantes e Variáveis de Estado da UI ---

// Duração da animação de fade-in/out (em milissegundos).
// Deve corresponder ao valor definido na 'transition' do CSS (.cartao-pokemon).
const FADE_DURATION_MS = 300;

// Variável para armazenar a referência ao objeto Audio do som atual do Pokémon.
// Permite controlar a reprodução (play, pause, reset).
let audioAtual = null;

// --- 3. Funções de Renderização (Exportadas para main.js) ---

/**
 * Renderiza os dados principais do Pokémon no card.
 * Inclui lógica complexa para pré-carregar a imagem principal (artwork ou sprite)
 * e só resolve a Promise quando a imagem estiver pronta ou falhar.
 * @param {object} data - O objeto de dados do Pokémon vindo da API (`fetchPokemon`).
 * @returns {Promise<void>} Uma Promise que resolve quando a imagem principal foi carregada
 * ou quando se determinou que não há imagem para carregar.
 */
export async function renderPokemonCard(data) {
    // Verificação de segurança: Garante que os elementos essenciais do card existem no DOM.
    // Se algum estiver faltando, loga um erro crítico e rejeita a promise para parar o fluxo.
    if (!cardPokemon || !pokemonNomeEl || !pokemonIdEl || !pokemonImagemEl || !pokemonTipoEl) {
        console.error("Erro Crítico: Elementos principais do card não encontrados no DOM!");
        return Promise.reject(new Error("Elementos do card faltando no DOM"));
    }

    // --- Preenche os dados textuais e de classes ---
    pokemonNomeEl.textContent = data.name;
    pokemonIdEl.textContent = `#${data.id.toString().padStart(3, '0')}`;
    pokemonImagemEl.alt = data.name; // Define o 'alt' text semanticamente

    // Função auxiliar para buscar um stat específico no array 'data.stats'.
    const getStat = (statName) => {
        const stat = data.stats.find(s => s.stat.name === statName);
        // Retorna o valor base do stat ou '0' se não encontrado.
        return stat ? stat.base_stat : '0';
    };

    // Atualiza os elementos de Status (com verificação de existência)
    if (hpValorEl) hpValorEl.textContent = getStat('hp');
    if (ataqueValorEl) ataqueValorEl.textContent = getStat('attack');
    if (defesaValorEl) defesaValorEl.textContent = getStat('defense');
    if (velocidadeValorEl) velocidadeValorEl.textContent = getStat('speed');

    // Atualiza os elementos de Habilidades (com verificação)
    const habilidades = data.abilities.map(a => a.ability.name);
    if (habilidade1El) habilidade1El.textContent = habilidades[0] || '---';
    if (habilidade2El) habilidade2El.textContent = habilidades[1] || '---';

    // Define o tipo principal e a classe CSS correspondente para a cor do card.
    const tipoPrincipal = data.types[0].type.name;
    pokemonTipoEl.textContent = tipoPrincipal;
    cardPokemon.className = `cartao-pokemon tipo-${tipoPrincipal} aberto`; // Aplica a classe de tipo e 'aberto'

    // --- Lógica de Carregamento do Som ---
    // Tenta encontrar a URL do som (prioriza 'latest', depois 'legacy').
    const somUrl = data.cries?.latest || data.cries?.legacy;
    if (somUrl && pokemonSomBtn) {
        // Se encontrou URL e o botão existe, cria o objeto Audio e mostra o botão.
        audioAtual = new Audio(somUrl);
        pokemonSomBtn.classList.remove('escondido');
    } else {
        // Se não encontrou som ou o botão não existe, reseta o áudio e esconde o botão.
        audioAtual = null;
        if (pokemonSomBtn) pokemonSomBtn.classList.add('escondido');
    }

    // --- Lógica de Pré-carregamento Hierárquico da Imagem ---
    // Envolve a lógica de carregamento da imagem em uma Promise.
    // O 'await' no 'main.js' só será liberado quando esta Promise resolver.
    return new Promise((resolve) => {
        // Tenta obter as URLs da artwork e do sprite de forma segura usando Optional Chaining (?.).
        const artwork = data.sprites?.other?.['official-artwork']?.front_default;
        const sprite = data.sprites?.front_default;

        // Função interna para tentar carregar o sprite (Plano B).
        const loadFallback = () => {
            if (sprite) {
                // Se o sprite existir, define o 'src' e adiciona a classe CSS.
                pokemonImagemEl.src = sprite;
                pokemonImagemEl.classList.add('mostrando-sprite');
                // Quando o sprite carregar, resolve a Promise principal.
                pokemonImagemEl.onload = () => resolve();
                // Se até o sprite falhar, limpa o 'src', remove a classe e resolve.
                pokemonImagemEl.onerror = () => {
                    pokemonImagemEl.src = '';
                    pokemonImagemEl.classList.remove('mostrando-sprite');
                    resolve();
                };
            } else {
                // Se não houver nem artwork nem sprite, limpa tudo e resolve.
                pokemonImagemEl.src = '';
                pokemonImagemEl.classList.remove('mostrando-sprite');
                resolve();
            }
        };

        // --- Tentativa Principal (Plano A: Artwork) ---
        if (artwork) {
            // Se a URL da artwork existir, define o 'src' e remove a classe de sprite.
            pokemonImagemEl.src = artwork;
            pokemonImagemEl.classList.remove('mostrando-sprite');
            // Quando a artwork carregar, resolve a Promise principal.
            pokemonImagemEl.onload = () => resolve();
            // Se a artwork falhar (ex: 404), chama a função 'loadFallback' para tentar o sprite.
            pokemonImagemEl.onerror = loadFallback;
        } else {
            // Se a URL da artwork não existir, pula direto para tentar o sprite.
            loadFallback();
        }
    });
}

/**
 * Controla os estados visuais de carregamento (overlay e fade do card).
 * @param {boolean} isLoading - True para mostrar o loading, false para esconder.
 * @returns {Promise<void> | undefined} Retorna uma Promise que espera o fade-out
 * terminar APENAS quando isLoading é true. Retorna undefined quando isLoading é false.
 */
export function renderLoading(isLoading) {
    // Verificações de segurança para garantir que os elementos existem.
    if (!loadingOverlayEl || !cardPokemon) {
        console.warn("Elementos de Loading não encontrados no DOM.");
        return isLoading ? Promise.resolve() : undefined; // Retorna promise resolvida ou undefined
    }

    if (isLoading) {
        // --- MOSTRAR LOADING (Inicia Fade-Out) ---
        loadingOverlayEl.classList.add('visivel'); // Mostra o spinner overlay
        cardPokemon.classList.add('carregando'); // Adiciona classe que ativa 'opacity: 0' (fade-out)

        // Limpa campos que podem "piscar" durante a transição.
        if (pokemonNomeEl) pokemonNomeEl.textContent = '';
        if (pokemonIdEl) pokemonIdEl.textContent = '';

        // Retorna uma Promise que resolve após a duração da animação CSS.
        // Isso permite ao 'main.js' usar 'await renderLoading(true)' para pausar.
        return new Promise(resolve => {
            setTimeout(resolve, FADE_DURATION_MS);
        });
    } else {
        // --- ESCONDER LOADING (Inicia Fade-In) ---
        loadingOverlayEl.classList.remove('visivel'); // Esconde o spinner overlay
        cardPokemon.classList.remove('carregando'); // Remove a classe, ativando 'opacity: 1' (fade-in)
        // Não precisamos esperar o fade-in, então não retornamos Promise aqui.
    }
}

/**
 * Renderiza o card no estado de "Erro" (Pokémon não encontrado ou falha na API).
 * Limpa todos os campos e aplica um estilo visual de erro.
 * @param {string} message - A mensagem de erro (atualmente não usada, mas pode ser útil).
 */
export function renderError(message) {
    // Verificação de segurança crucial ANTES de tentar acessar qualquer '.textContent'.
    // Se algum elemento essencial estiver faltando, loga um erro e sai para evitar crash.
    if (!cardPokemon || !pokemonNomeEl || !pokemonIdEl || !pokemonTipoEl || !pokemonImagemEl || !pokemonSomBtn ||
        !hpValorEl || !ataqueValorEl || !defesaValorEl || !velocidadeValorEl || !habilidade1El || !habilidade2El) {
        console.error("Erro em renderError: Elementos essenciais da UI não foram encontrados no DOM! Não é possível renderizar o estado de erro.");
        return;
    }

    // Aplica a classe de erro e garante que o card esteja visível (sem transição imediata).
    cardPokemon.className = 'cartao-pokemon tipo-unknown aberto';

    // Define textos indicando o erro.
    pokemonNomeEl.textContent = 'Não Encontrado';
    pokemonIdEl.textContent = '#???';
    pokemonTipoEl.textContent = 'error';

    // Limpa a imagem e esconde/reseta o botão de som.
    pokemonImagemEl.src = '';
    pokemonImagemEl.alt = 'Pokémon não encontrado';
    pokemonImagemEl.classList.remove('mostrando-sprite');
    pokemonSomBtn.classList.add('escondido');
    audioAtual = null;

    // Limpa os campos de Stats.
    hpValorEl.textContent = '-';
    ataqueValorEl.textContent = '-';
    defesaValorEl.textContent = '-';
    velocidadeValorEl.textContent = '-';

    // Limpa os campos de Habilidades.
    habilidade1El.textContent = '---';
    habilidade2El.textContent = '---';

    // Limpa os campos de Dados da Espécie e Evolução chamando suas
    // respectivas funções de renderização com dados vazios/null.
    renderSpeciesData(null);
    renderEvolutionChain([]);
}

/**
 * Atualiza visualmente qual item na lista de navegação/recentes está selecionado.
 * @param {HTMLElement | null} itemClicado - O elemento `<li>` que deve ser marcado como ativo,
 * ou `null` para remover a seleção de todos.
 */
export function atualizaSelecaoLista(itemClicado) {
    // Verificação de segurança: garante que querySelector existe.
    if (!document.querySelector) {
        console.error("querySelector não suportado ou não disponível.");
        return;
    }

    // Encontra o item atualmente ativo na lista.
    const pokemonAtivoNaLista = document.querySelector('.listagem .ativo');
    // Se houver um item ativo, remove a classe 'ativo'.
    if (pokemonAtivoNaLista) {
        pokemonAtivoNaLista.classList.remove('ativo');
    }

    // Se um novo item foi fornecido E ele ainda existe no DOM:
    if (itemClicado && document.body.contains(itemClicado)) {
        // Adiciona a classe 'ativo' ao novo item.
        itemClicado.classList.add('ativo');
    }
}

/**
 * Renderiza a lista de Pokémon (recentes) na navegação lateral (sem imagens).
 * @param {Array<string>} pokemonList - Um array com os nomes dos Pokémon a serem exibidos.
 */
export function renderPokemonList(pokemonList) {
    // Verificação de segurança: garante que o container da lista existe.
    if (!listaPokemonNavEl) {
        console.error("Elemento da lista de navegação (lista-pokemon-nav) não encontrado!");
        return;
    }

    // Limpa o conteúdo HTML anterior da lista.
    listaPokemonNavEl.innerHTML = '';

    // Para cada nome na lista recebida:
    pokemonList.forEach(pokemonName => {
        // Cria um novo elemento <li>.
        const li = document.createElement('li');
        // Define a classe CSS e o ID (que é o próprio nome do Pokémon).
        li.className = 'pokemon';
        li.id = pokemonName;
        // Define o conteúdo HTML interno (apenas o nome dentro de um span).
        li.innerHTML = `<span>${pokemonName}</span>`;
        // Adiciona o <li> criado à <ul> no DOM.
        listaPokemonNavEl.appendChild(li);
    });
}

/**
 * Renderiza a lista da cadeia de evolução no card.
 * @param {Array<object>} evolutionArray - Array de objetos { name: string, id: number }
 * vindo de `fetchSpeciesAndEvolution`.
 */
export function renderEvolutionChain(evolutionArray) {
    // Verificação de segurança.
    if (!listaEvolucoesEl) {
        console.error("Elemento da lista de evoluções (lista-evolucoes) não encontrado!");
        return;
    }

    // Limpa a lista anterior.
    listaEvolucoesEl.innerHTML = '';
    let message = ''; // Variável para mensagens especiais.

    // Define a mensagem apropriada se a lista for vazia ou tiver só 1 estágio.
    if (!evolutionArray || evolutionArray.length === 0) {
         message = 'Evolução indisponível'; // Caso de erro ou API incompleta.
    } else if (evolutionArray.length === 1) {
         message = 'Não possui evoluções'; // Pokémon com estágio único.
    }

    // Se houver uma mensagem especial, exibe apenas ela.
    if (message) {
        const li = document.createElement('li');
        li.textContent = message;
        // Aplica estilos inline para simplicidade (poderiam ser classes CSS).
        li.style.fontWeight = 'normal'; li.style.color = '#888';
        li.style.textAlign = 'left'; li.style.marginBottom = '0';
        li.classList.add('no-evolution'); // Adiciona classe para esconder a seta (via CSS)
        listaEvolucoesEl.appendChild(li);
    } else {
        // Se houver múltiplos estágios, itera e cria um <li> para cada um.
        evolutionArray.forEach(pokemon => {
            const li = document.createElement('li');
            // Formata o ID com 3 dígitos (ex: #001).
            const formattedId = `#${pokemon.id.toString().padStart(3, '0')}`;
            // Cria o HTML interno com nome e ID formatado abaixo.
            li.innerHTML = `
                ${pokemon.name}
                <span class="evolution-id">${formattedId}</span>
            `;
            listaEvolucoesEl.appendChild(li);
        });
    }
}

/**
 * Renderiza os dados da "espécie" (Geração/Região, Status Lendário, Descrição).
 * Busca os elementos do DOM dentro da função para garantir que existam no momento da execução.
 * @param {object | null} speciesData - O objeto `speciesData` vindo de `fetchSpeciesAndEvolution`,
 * ou `null` se a busca falhou ou para limpar os campos.
 */
export function renderSpeciesData(speciesData) {
    // Busca os elementos do DOM pelos IDs AQUI DENTRO.
    const pokemonGeracaoEl = document.getElementById('pokemon-geracao');
    const pokemonLendarioStatusEl = document.getElementById('pokemon-lendario-status');
    const pokemonDescricaoEl = document.getElementById('pokemon-descricao');

    // Verificação CRÍTICA: Se algum dos elementos não for encontrado, loga erro e sai.
    if (!pokemonGeracaoEl || !pokemonLendarioStatusEl || !pokemonDescricaoEl) {
        console.error("Erro em renderSpeciesData: Elementos da UI (geracao, lendario, descricao) não encontrados no DOM!");
        // Limpa campos que possam existir para evitar dados inconsistentes
        if(pokemonGeracaoEl) pokemonGeracaoEl.textContent = 'Erro';
        if(pokemonLendarioStatusEl) pokemonLendarioStatusEl.textContent = '';
        if(pokemonDescricaoEl) pokemonDescricaoEl.textContent = 'Erro ao carregar descrição.';
        return;
    }

    // Se speciesData for null (ex: erro na API ou chamado por renderError), limpa os campos.
    if (!speciesData) {
        pokemonGeracaoEl.textContent = 'N/A';
        pokemonLendarioStatusEl.textContent = '';
        pokemonLendarioStatusEl.className = 'lendario-status'; // Reseta classes CSS
        pokemonDescricaoEl.textContent = 'Descrição não disponível.';
        return;
    }

    // --- Renderiza os dados ---

    // Mapeamento de nomes técnicos da API para nomes de Regiões conhecidos.
    const geracaoMap = {
        "generation-i": "Kanto", "generation-ii": "Johto", "generation-iii": "Hoenn",
        "generation-iv": "Sinnoh", "generation-v": "Unova", "generation-vi": "Kalos",
        "generation-vii": "Alola", "generation-viii": "Galar", "generation-ix": "Paldea",
    };
    // Usa o nome mapeado ou o nome técnico se não encontrado no map.
    pokemonGeracaoEl.textContent = geracaoMap[speciesData.generation.name] || speciesData.generation.name;

    // Reseta o status lendário/mítico.
    pokemonLendarioStatusEl.textContent = '';
    pokemonLendarioStatusEl.className = 'lendario-status'; // Remove classes 'lendario'/'mitico'
    // Aplica o texto e a classe CSS correspondente se for lendário ou mítico.
    if (speciesData.is_legendary) {
        pokemonLendarioStatusEl.textContent = 'Lendário';
        pokemonLendarioStatusEl.classList.add('lendario');
    } else if (speciesData.is_mythical) {
        pokemonLendarioStatusEl.textContent = 'Mítico';
        pokemonLendarioStatusEl.classList.add('mitico');
    }

    // Busca a primeira entrada de descrição em Português ('pt').
    const descPt = speciesData.flavor_text_entries.find(e => e.language.name === 'pt');
    // Como fallback, busca a primeira entrada em Inglês ('en').
    const descEn = speciesData.flavor_text_entries.find(e => e.language.name === 'en');
    // Usa a descrição em PT, senão EN, senão uma mensagem padrão.
    // Limpa caracteres de nova linha/form feed/carriage return que a API às vezes inclui.
    pokemonDescricaoEl.textContent = (descPt || descEn)?.flavor_text.replace(/[\n\f\r]/g, ' ') || 'Descrição não disponível.';
}


// --- 4. Event Listeners (Ligados aos seletores/elementos) ---

// Adiciona o listener para o botão de som (com verificação de existência).
if (pokemonSomBtn) {
    pokemonSomBtn.addEventListener('click', () => {
        // Se houver um áudio carregado:
        if (audioAtual) {
            audioAtual.currentTime = 0; // Volta para o início
            // Tenta tocar o áudio e captura possíveis erros (ex: interação do usuário necessária).
            audioAtual.play().catch(e => console.error("Erro ao tentar tocar o áudio:", e));
        }
    });
} else {
    // Adiciona um aviso se o botão de som não foi encontrado no HTML.
    console.warn("Elemento do botão de som (pokemon-som-btn) não encontrado no DOM. O som não funcionará.");
}

// Nota: Os listeners para a lista (listaPokemonNavEl) e busca (buscaFormEl)
// são adicionados no main.js, pois precisam chamar a função principal de busca.