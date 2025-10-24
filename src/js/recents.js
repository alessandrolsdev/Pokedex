// O nome da "chave" que usaremos para salvar no localStorage
const RECENTS_KEY = 'pokedexRecents';
// O número máximo de Pokémon que queremos na lista
const MAX_RECENTS = 6;

/**
 * Pega a lista de recentes do localStorage.
 * Se não houver nada, retorna uma lista vazia.
 */
export function getRecents() {
  const recents = localStorage.getItem(RECENTS_KEY);
  return recents ? JSON.parse(recents) : [];
}

/**
 * Adiciona um novo Pokémon à lista de recentes.
 */
export function addRecent(pokemonName) {
  let recents = getRecents();

  // 1. Remove o Pokémon se ele já estiver na lista (para movê-lo para o topo)
  recents = recents.filter(p => p !== pokemonName);

  // 2. Adiciona o novo Pokémon no início da lista
  recents.unshift(pokemonName);

  // 3. Garante que a lista não passe do tamanho máximo
  if (recents.length > MAX_RECENTS) {
    recents.pop(); // Remove o último (o mais antigo)
  }

  // 4. Salva a lista atualizada de volta no localStorage
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
}