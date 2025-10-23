// Aguarda o documento HTML ser totalmente carregado
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SELETORES DOS ELEMENTOS ---
    // Pegamos todos os elementos que vamos precisar manipular
    
    // A Lista da Direita
    const listaSelecaoPokemon = document.querySelectorAll('.listagem .pokemon');
    const buscaFormEl = document.getElementById('busca-form');
    const buscaInputEl = document.getElementById('busca-input');
    
    // O Card Principal da Esquerda (que vamos preencher)
    const cardPokemon = document.getElementById('pokemon-card-display');
    const pokemonNomeEl = document.getElementById('pokemon-nome');
    const pokemonIdEl = document.getElementById('pokemon-id');
    const pokemonImagemEl = document.getElementById('pokemon-imagem');
    const pokemonTipoEl = document.getElementById('pokemon-tipo');
    
    // Status
    const hpValorEl = document.getElementById('hp-valor');
    const ataqueValorEl = document.getElementById('ataque-valor');
    const defesaValorEl = document.getElementById('defesa-valor');
    const velocidadeValorEl = document.getElementById('velocidade-valor');
    
    // Habilidades
    const habilidade1El = document.getElementById('habilidade-1');
    const habilidade2El = document.getElementById('habilidade-2');

    // --- 2. CONFIGURANDO OS CLIQUES NA LISTA ---
    
    listaSelecaoPokemon.forEach(itemPokemon => {
        itemPokemon.addEventListener('click', () => {
            // Pega o ID do item clicado (ex: "pikachu", "charmander")
            // O 'id' do <li> é o nome do pokemon!
            const nomePokemon = itemPokemon.id;
            
            // Chama nossa função principal para buscar dados da API
            fetchPokemon(nomePokemon);
            
            // Atualiza a classe 'ativo' na lista da direita
            // Remove de quem estava ativo
            const pokemonAtivoNaLista = document.querySelector('.listagem .ativo');
            pokemonAtivoNaLista.classList.remove('ativo');
            
            // Adiciona no item que foi clicado
            itemPokemon.classList.add('ativo');
        });
    });
    // --- NOVO: 2.5. CONFIGURANDO A BARRA DE BUSCA ---
buscaFormEl.addEventListener('submit', (evento) => {
    
    // Impede que o formulário recarregue a página
    evento.preventDefault(); 
    
    // Pega o valor, remove espaços e converte para minúsculas
    const termoBusca = buscaInputEl.value.trim().toLowerCase();
    
    // Se o campo não estiver vazio, busca o Pokémon
    if (termoBusca) {
        
        // Reutiliza nossa função principal da API!
        fetchPokemon(termoBusca);
        
        // (Opcional, mas recomendado)
        // Remove a seleção 'ativo' da lista da direita,
        // pois o Pokémon atual veio da busca, não da lista.
        const pokemonAtivoNaLista = document.querySelector('.listagem .ativo');
        if (pokemonAtivoNaLista) {
            pokemonAtivoNaLista.classList.remove('ativo');
        }
    }
});

    // --- 3. FUNÇÃO PRINCIPAL DE BUSCA NA API ---
    
    async function fetchPokemon(pokemonName) {
        // Mostra um "carregando" enquanto busca
        pokemonNomeEl.textContent = 'Carregando...';

        const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;
        
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                pokemonNomeEl.textContent = 'Não encontrado';
                return;
            }
            
            const data = await response.json();
            
            // Envia os dados da API para a função que atualiza o HTML
            renderPokemonCard(data);
            
        } catch (error) {
            console.error("Erro ao buscar Pokémon:", error);
            pokemonNomeEl.textContent = 'Erro!';
        }
    }

    // --- 4. FUNÇÃO PARA ATUALIZAR O HTML (RENDERIZAR) ---
    
    function renderPokemonCard(data) {
        
        // --- Informações do Topo ---
        pokemonNomeEl.textContent = data.name;
        pokemonIdEl.textContent = `#${data.id.toString().padStart(3, '0')}`;
        pokemonImagemEl.src = data.sprites.other['official-artwork'].front_default;
        
        // Tipo e Cor do Card
        const tipoPrincipal = data.types[0].type.name;
        pokemonTipoEl.textContent = tipoPrincipal;
        
        // Atualiza a classe do card para mudar a cor de fundo
        // (Ex: 'tipo-fire', 'tipo-water', etc.)
        // Isso depende de você ter essas classes no seu CSS
        cardPokemon.className = `cartao-pokemon tipo-${tipoPrincipal} aberto`;
        
        
        // --- Status ---
        // Função auxiliar para pegar o valor do stat
        const getStat = (statName) => {
            const stat = data.stats.find(s => s.stat.name === statName);
            return stat ? stat.base_stat : '0';
        };
        
        hpValorEl.textContent = getStat('hp');
        ataqueValorEl.textContent = getStat('attack');
        defesaValorEl.textContent = getStat('defense');
        velocidadeValorEl.textContent = getStat('speed'); // Na API é 'speed'
        
        // --- Habilidades ---
        const habilidades = data.abilities.map(a => a.ability.name);
        
        habilidade1El.textContent = habilidades[0] || '---';
        habilidade2El.textContent = habilidades[1] || '---';
    }
    
    // --- 5. CARGA INICIAL ---
    // Para a página não começar vazia, vamos buscar o Pikachu
    fetchPokemon('pikachu');
});