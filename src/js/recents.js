/**
 * @file recents.js
 * @description Módulo para gerenciar a lista de Pokémon vistos recentemente.
 * Utiliza o localStorage do navegador para persistir a lista entre as visitas.
 */

// Chave usada para armazenar e recuperar a lista no localStorage.
// Usar uma constante evita erros de digitação.
const RECENTS_STORAGE_KEY = 'pokedexRecentsList';

// Define o número máximo de Pokémon a serem mantidos na lista de recentes.
const MAX_RECENTS_COUNT = 6;

/**
 * Recupera a lista de nomes de Pokémon recentes do localStorage.
 * @returns {Array<string>} Um array de strings com os nomes dos Pokémon recentes,
 * ou um array vazio se nada for encontrado ou houver erro.
 */
export function getRecents() {
  try {
    // Tenta obter o item armazenado sob a chave definida.
    const storedRecents = localStorage.getItem(RECENTS_STORAGE_KEY);

    // Se houver algo armazenado, converte a string JSON de volta para um array.
    // Se não houver nada (null), retorna um array vazio.
    return storedRecents ? JSON.parse(storedRecents) : [];

  } catch (error) {
    // Captura possíveis erros ao acessar localStorage ou ao fazer JSON.parse
    // (ex: dados corrompidos, localStorage desabilitado).
    console.error("Erro ao recuperar lista de recentes do localStorage:", error);
    // Retorna um array vazio como fallback seguro.
    return [];
  }
}

/**
 * Adiciona um nome de Pokémon à lista de recentes (no topo) e a salva no localStorage.
 * Garante que a lista não exceda o tamanho máximo definido por MAX_RECENTS_COUNT.
 * Se o Pokémon já estiver na lista, ele é movido para o topo.
 * @param {string} pokemonName - O nome do Pokémon a ser adicionado (deve ser lowercase).
 */
export function addRecent(pokemonName) {
  // Validação básica: não adiciona se o nome for inválido ou vazio.
  if (!pokemonName || typeof pokemonName !== 'string') {
    console.warn("Tentativa de adicionar nome de Pokémon inválido aos recentes:", pokemonName);
    return;
  }

  try {
    // Obtém a lista atual de recentes.
    let currentRecents = getRecents();

    // 1. Remove o Pokémon da lista se ele já existir.
    //    Isso garante que, ao ser adicionado novamente (no passo 2),
    //    ele vá para o topo, representando a visualização mais recente.
    currentRecents = currentRecents.filter(name => name !== pokemonName);

    // 2. Adiciona o novo Pokémon no INÍCIO (topo) da lista.
    currentRecents.unshift(pokemonName);

    // 3. Limita o tamanho da lista.
    //    Se a lista exceder o tamanho máximo, remove o último item (o mais antigo).
    if (currentRecents.length > MAX_RECENTS_COUNT) {
      currentRecents.pop();
    }

    // 4. Salva a lista atualizada de volta no localStorage.
    //    Converte o array JavaScript em uma string JSON para armazenamento.
    localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(currentRecents));

  } catch (error) {
    // Captura possíveis erros ao salvar no localStorage (ex: quota excedida).
    console.error(`Erro ao adicionar "${pokemonName}" aos recentes:`, error);
  }
}

/**
 * (Opcional) Limpa completamente a lista de recentes do localStorage.
 * Pode ser útil para testes ou se você adicionar um botão "Limpar Histórico".
 */
export function clearRecents() {
  try {
    localStorage.removeItem(RECENTS_STORAGE_KEY);
  } catch (error) {
    console.error("Erro ao limpar a lista de recentes:", error);
  }
}