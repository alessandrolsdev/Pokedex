/**
 * @file webpack.config.js
 * @description Arquivo de configuração principal para o Webpack 5.
 * Define como os módulos da aplicação (JavaScript, CSS, assets) são processados,
 * empacotados e otimizados para desenvolvimento e produção.
 */

// Importa o módulo 'path' nativo do Node.js para lidar com caminhos de arquivo de forma segura.
const path = require('path');

// Importa os plugins do Webpack que utilizaremos.
const HtmlWebpackPlugin = require('html-webpack-plugin'); // Gera o index.html dinamicamente.
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // Extrai CSS para arquivos separados.
const CopyWebpackPlugin = require('copy-webpack-plugin'); // Copia arquivos/pastas estáticas para o build.

// Exporta uma função de configuração, o que permite acessar variáveis de ambiente e argumentos da CLI.
// 'argv.mode' nos diz se estamos rodando em 'development' ou 'production'.
module.exports = (env, argv) => {
  // Determina se o build atual é para produção com base no modo passado via CLI.
  const isProduction = argv.mode === 'production';

  // Retorna o objeto de configuração do Webpack.
  return {
    /**
     * Define o modo de operação do Webpack ('development' ou 'production').
     * Afeta as otimizações padrão e variáveis de ambiente no código.
     */
    mode: isProduction ? 'production' : 'development',

    /**
     * Configura a geração de Source Maps.
     * 'eval-source-map' é rápido para desenvolvimento e bom para debug.
     * 'false' (ou 'source-map' mais lento) é recomendado para produção para evitar expor código original.
     */
    devtool: isProduction ? false : 'eval-source-map',

    /**
     * Define o ponto de entrada da aplicação.
     * Webpack começará a construir o gráfico de dependências a partir deste arquivo.
     */
    entry: './src/js/main.js',

    /**
     * Configura como e onde o Webpack deve emitir os pacotes (bundles) e assets.
     */
    output: {
      // Define o diretório de saída para todos os assets. '__dirname' é o diretório atual.
      path: path.resolve(__dirname, 'dist'),
      /**
       * Define o nome do arquivo JavaScript principal.
       * Em produção, '[contenthash]' é adicionado para cache busting:
       * se o conteúdo do arquivo mudar, o hash muda, forçando o navegador a baixar a nova versão.
       */
      filename: isProduction ? 'bundle.[contenthash].js' : 'bundle.js',
      /**
       * Limpa o diretório de saída ('dist/') antes de cada build,
       * garantindo que apenas os arquivos da build atual permaneçam.
       */
      clean: true,
    },

    /**
     * Configura como diferentes tipos de módulos (arquivos) devem ser tratados.
     */
    module: {
      // Define regras para processar arquivos específicos.
      rules: [
        {
          /**
           * Regra para arquivos CSS.
           * 'test' usa uma RegEx para identificar arquivos que terminam com '.css'.
           */
          test: /\.css$/,
          /**
           * Define os loaders a serem usados para esses arquivos.
           * Loaders são executados na ordem inversa (da direita para a esquerda):
           * 1. 'css-loader': Interpreta '@import' e 'url()' dentro do CSS como módulos JS.
           * 2. 'MiniCssExtractPlugin.loader': Extrai o CSS processado para um arquivo separado
           * (em vez de injetá-lo no JS, que seria o 'style-loader').
           */
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
        // (Aqui poderiam ser adicionadas regras para Babel (JS moderno), imagens, fontes, etc.)
      ],
    },

    /**
     * Configura os plugins que estendem as funcionalidades do Webpack.
     */
    plugins: [
      /**
       * Plugin para extrair o CSS para arquivos separados.
       * Essencial para que o CSS seja carregado paralelamente ao JS no navegador.
       */
      new MiniCssExtractPlugin({
        /**
         * Define o nome do arquivo CSS de saída.
         * Usa '[contenthash]' em produção para cache busting.
         */
        filename: isProduction ? 'style.[contenthash].css' : 'style.css',
      }),
      /**
       * Plugin para gerar o arquivo HTML final (ex: dist/index.html).
       * Simplifica a criação de HTMLs que incluem os bundles gerados pelo Webpack.
       */
      new HtmlWebpackPlugin({
        /**
         * Caminho para o arquivo HTML que servirá de molde.
         * O plugin injetará as tags <link> (CSS) e <script> (JS) automaticamente.
         */
        template: './index.html',
        /**
         * Nome do arquivo HTML a ser gerado na pasta de saída ('dist/').
         */
        filename: 'index.html',
        /**
         * Caminho para o ícone (favicon) a ser adicionado ao HTML.
         * O plugin adicionará a tag <link rel="icon"> correspondente.
         */
        favicon: './favicon.png' 
      }),
      /**
       * Plugin para copiar arquivos e pastas individuais para o diretório de build.
       * Útil para assets estáticos que não são diretamente importados pelo JS/CSS.
       */
    ],

    /**
     * Configurações específicas para o 'webpack-dev-server'.
     */
    devServer: {
      /**
       * Define o diretório de onde servir o conteúdo estático.
       * Aponta para a pasta 'dist' onde o build (em memória) é gerado.
       */
      static: './dist',
      /**
       * Habilita o Hot Module Replacement (HMR).
       * Permite atualizar módulos no navegador sem recarregar a página inteira.
       */
      hot: true,
      /**
       * Abre automaticamente o navegador quando o servidor inicia.
       * (Nota: O '--open' na linha de comando do package.json também faz isso).
       */
      open: true,
      /**
       * (Opcional) Define a porta do servidor de desenvolvimento. Padrão é 8080.
       */
      // port: 9000,
    },

    /**
     * Configurações de otimização (principalmente para produção).
     */
    optimization: {
      /**
       * Habilita/desabilita a minificação do bundle JS.
       * Webpack 5 ativa isso automaticamente no modo 'production'.
       */
      minimize: isProduction,
      /**
       * (Opcional) Configurações mais avançadas de minificação podem ser adicionadas aqui
       * usando plugins como TerserWebpackPlugin (para JS) ou CssMinimizerWebpackPlugin (para CSS).
       * Webpack 5 já inclui o Terser por padrão para produção.
       */
    },
  };
};