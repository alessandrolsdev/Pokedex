/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/css/style.css":
/*!***************************!*\
  !*** ./src/css/style.css ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://pokedex/./src/css/style.css?\n}");

/***/ }),

/***/ "./src/js/api.js":
/*!***********************!*\
  !*** ./src/js/api.js ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   fetchPokemon: () => (/* binding */ fetchPokemon)\n/* harmony export */ });\n/**\r\n * Módulo da API\r\n * Responsabilidade: Apenas buscar dados na PokéAPI.\r\n */\r\n\r\n// Exportamos a função para que outros arquivos (como o main.js) possam usá-la.\r\nasync function fetchPokemon(pokemonName) {\r\n    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;\r\n\r\n    try {\r\n        const response = await fetch(url);\r\n        \r\n        if (!response.ok) {\r\n            // Em vez de 'alert' ou 'textContent', apenas 'lançamos um erro'\r\n            // Quem chamou a função (o main.js) que decide o que fazer.\r\n            throw new Error('Pokémon não encontrado');\r\n        }\r\n        \r\n        const data = await response.json();\r\n        return data; // Retorna os dados do Pokémon em caso de sucesso\r\n        \r\n    } catch (error) {\r\n        // Propaga o erro para quem chamou a função\r\n        throw error;\r\n    }\r\n}\n\n//# sourceURL=webpack://pokedex/./src/js/api.js?\n}");

/***/ }),

/***/ "./src/js/main.js":
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _css_style_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/style.css */ \"./src/css/style.css\");\n/* harmony import */ var _api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./api.js */ \"./src/js/api.js\");\n/* harmony import */ var _ui_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ui.js */ \"./src/js/ui.js\");\n/**\r\n * Módulo Principal (Orquestrador)\r\n * Responsabilidade: Conectar os eventos (cliques) com a API e a UI.\r\n */\r\n\r\n// 1. Importa as funções e seletores necessários dos outros módulos\r\n// Correto (se estiver numa subpasta 'css')\r\n\r\n\r\n\r\n\r\n// --- 2. Função \"Controladora\" Principal ---\r\n// Esta função centraliza a lógica de buscar e renderizar\r\nasync function buscarEExibirPokemon(nomePokemon, itemClicado = null) {\r\n    (0,_ui_js__WEBPACK_IMPORTED_MODULE_2__.renderLoading)(true); // Mostra o loading\r\n    \r\n    try {\r\n        // 2.1 Chama a API\r\n        const data = await (0,_api_js__WEBPACK_IMPORTED_MODULE_1__.fetchPokemon)(nomePokemon);\r\n        \r\n        // 2.2 Chama a UI para renderizar o card\r\n        (0,_ui_js__WEBPACK_IMPORTED_MODULE_2__.renderPokemonCard)(data);\r\n        \r\n        // 2.3 Chama a UI para atualizar a lista\r\n        (0,_ui_js__WEBPACK_IMPORTED_MODULE_2__.atualizaSelecaoLista)(itemClicado);\r\n        \r\n    } catch (error) {\r\n        // 2.4 Chama a UI para mostrar o erro\r\n        console.error(\"Erro:\", error.message);\r\n        (0,_ui_js__WEBPACK_IMPORTED_MODULE_2__.renderError)(error.message); // Ex: \"Pokémon não encontrado\"\r\n        \r\n        // Se deu erro, remove qualquer seleção da lista\r\n        if (error.message === 'Pokémon não encontrado') {\r\n            (0,_ui_js__WEBPACK_IMPORTED_MODULE_2__.atualizaSelecaoLista)(null);\r\n        }\r\n\r\n    } finally {\r\n        // 2.5 Sempre esconde o loading no final\r\n        (0,_ui_js__WEBPACK_IMPORTED_MODULE_2__.renderLoading)(false);\r\n    }\r\n}\r\n\r\n// --- 3. Configurando os Event Listeners ---\r\n\r\n// 3.1 Cliques na Lista\r\n_ui_js__WEBPACK_IMPORTED_MODULE_2__.listaSelecaoPokemon.forEach(itemPokemon => {\r\n    itemPokemon.addEventListener('click', () => {\r\n        const nomePokemon = itemPokemon.id;\r\n        buscarEExibirPokemon(nomePokemon, itemPokemon); // Passa o item clicado\r\n    });\r\n});\r\n\r\n// 3.2 Barra de Busca\r\n_ui_js__WEBPACK_IMPORTED_MODULE_2__.buscaFormEl.addEventListener('submit', (evento) => {\r\n    evento.preventDefault();\r\n    const termoBusca = _ui_js__WEBPACK_IMPORTED_MODULE_2__.buscaInputEl.value.trim().toLowerCase();\r\n    \r\n    if (termoBusca) {\r\n        // Busca o pokemon, mas não passa item clicado (passa null)\r\n        buscarEExibirPokemon(termoBusca); \r\n        _ui_js__WEBPACK_IMPORTED_MODULE_2__.buscaInputEl.value = ''; // Limpa o input\r\n    }\r\n});\r\n\r\n// --- 4. Carga Inicial ---\r\n// Para a página não começar vazia\r\nbuscarEExibirPokemon('pikachu', document.getElementById('pikachu'));\n\n//# sourceURL=webpack://pokedex/./src/js/main.js?\n}");

/***/ }),

/***/ "./src/js/ui.js":
/*!**********************!*\
  !*** ./src/js/ui.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("{__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   atualizaSelecaoLista: () => (/* binding */ atualizaSelecaoLista),\n/* harmony export */   buscaFormEl: () => (/* binding */ buscaFormEl),\n/* harmony export */   buscaInputEl: () => (/* binding */ buscaInputEl),\n/* harmony export */   listaSelecaoPokemon: () => (/* binding */ listaSelecaoPokemon),\n/* harmony export */   renderError: () => (/* binding */ renderError),\n/* harmony export */   renderLoading: () => (/* binding */ renderLoading),\n/* harmony export */   renderPokemonCard: () => (/* binding */ renderPokemonCard)\n/* harmony export */ });\n/**\r\n * Módulo de UI (User Interface)\r\n * Responsabilidade: Apenas manipular o HTML (o DOM).\r\n */\r\n\r\n// --- 1. Seletores dos Elementos (agora vivem aqui) ---\r\nconst cardPokemon = document.getElementById('pokemon-card-display');\r\nconst pokemonNomeEl = document.getElementById('pokemon-nome');\r\nconst pokemonIdEl = document.getElementById('pokemon-id');\r\nconst pokemonImagemEl = document.getElementById('pokemon-imagem');\r\nconst pokemonTipoEl = document.getElementById('pokemon-tipo');\r\nconst hpValorEl = document.getElementById('hp-valor');\r\nconst ataqueValorEl = document.getElementById('ataque-valor');\r\nconst defesaValorEl = document.getElementById('defesa-valor');\r\nconst velocidadeValorEl = document.getElementById('velocidade-valor');\r\nconst habilidade1El = document.getElementById('habilidade-1');\r\nconst habilidade2El = document.getElementById('habilidade-2');\r\nconst loadingOverlayEl = document.getElementById('loading-overlay');\r\nconst listaSelecaoPokemon = document.querySelectorAll('.listagem .pokemon');\r\nconst buscaFormEl = document.getElementById('busca-form');\r\nconst buscaInputEl = document.getElementById('busca-input');\r\n\r\n// --- 2. Funções de Renderização (exportadas) ---\r\n\r\nfunction renderPokemonCard(data) {\r\n    // Informações do Topo\r\n    pokemonNomeEl.textContent = data.name;\r\n    pokemonIdEl.textContent = `#${data.id.toString().padStart(3, '0')}`;\r\n    pokemonImagemEl.src = data.sprites.other['official-artwork'].front_default;\r\n    \r\n    // Tipo e Cor do Card\r\n    const tipoPrincipal = data.types[0].type.name;\r\n    pokemonTipoEl.textContent = tipoPrincipal;\r\n    cardPokemon.className = `cartao-pokemon tipo-${tipoPrincipal} aberto`;\r\n    \r\n    // Status\r\n    const getStat = (statName) => {\r\n        const stat = data.stats.find(s => s.stat.name === statName);\r\n        return stat ? stat.base_stat : '0';\r\n    };\r\n    \r\n    hpValorEl.textContent = getStat('hp');\r\n    ataqueValorEl.textContent = getStat('attack');\r\n    defesaValorEl.textContent = getStat('defense');\r\n    velocidadeValorEl.textContent = getStat('speed');\r\n    \r\n    // Habilidades\r\n    const habilidades = data.abilities.map(a => a.ability.name);\r\n    habilidade1El.textContent = habilidades[0] || '---';\r\n    habilidade2El.textContent = habilidades[1] || '---';\r\n}\r\n\r\nfunction renderLoading(isLoading) {\r\n    if (isLoading) {\r\n        loadingOverlayEl.classList.add('visivel');\r\n        pokemonNomeEl.textContent = ''; // Limpa o nome durante o loading\r\n        pokemonIdEl.textContent = ''; // Limpa o ID\r\n    } else {\r\n        loadingOverlayEl.classList.remove('visivel');\r\n    }\r\n}\r\n\r\nfunction renderError(message) {\r\n    pokemonNomeEl.textContent = message;\r\n    pokemonIdEl.textContent = '#???';\r\n    // Você pode limpar outros campos se quiser\r\n    pokemonImagemEl.src = ''; // Esconde a imagem anterior\r\n}\r\n\r\nfunction atualizaSelecaoLista(itemClicado) {\r\n    // Remove de quem estava ativo\r\n    const pokemonAtivoNaLista = document.querySelector('.listagem .ativo');\r\n    if (pokemonAtivoNaLista) {\r\n        pokemonAtivoNaLista.classList.remove('ativo');\r\n    }\r\n\r\n    // Adiciona no item que foi clicado (se houver um)\r\n    if(itemClicado) {\r\n        itemClicado.classList.add('ativo');\r\n    }\r\n}\n\n//# sourceURL=webpack://pokedex/./src/js/ui.js?\n}");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/js/main.js");
/******/ 	
/******/ })()
;