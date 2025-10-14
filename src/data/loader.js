const axios = require("axios");
const configLoader = require("../config/config-loader");
const { colors } = require("../config/colors");

/**
 * 📡 Gerencia o carregamento de dados com cache e fallback
 * @class DataLoader
 */
class DataLoader {
  constructor() {
    const dataConfig = configLoader.getDataConfig();

    this.dataUrl = dataConfig.url;
    this.cacheDuration = dataConfig.cacheDuration;
    this.timeout = dataConfig.timeout;
    this.userAgent = dataConfig.userAgent;
    this.retryAttempts = dataConfig.retryAttempts;
    this.retryDelay = dataConfig.retryDelay;

    this.cache = null;
    this.lastFetch = null;
  }

  /**
   * 📥 Carrega dados usando cache ou faz nova requisição
   * @async
   * @method loadData
   * @returns {Promise<Object>}
   */
  async loadData() {
    if (this.isCacheValid()) {
      console.log(colors.success("✅ Usando dados em cache\n"));
      return this.cache;
    }

    return await this.fetchDataWithRetry();
  }

  /**
   * ✅ Verifica se o cache atual ainda é válido
   * @method isCacheValid
   * @returns {boolean}
   */
  isCacheValid() {
    return this.cache && this.lastFetch && Date.now() - this.lastFetch < this.cacheDuration;
  }

  /**
   * 🔄 Tenta buscar dados com múltiplas tentativas
   * @async
   * @method fetchDataWithRetry
   * @returns {Promise<Object>}
   */
  async fetchDataWithRetry() {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(colors.primary(`📡 Carregando dados... (tentativa ${attempt}/${this.retryAttempts})`));

        const response = await axios.get(this.dataUrl, {
          timeout: this.timeout,
          headers: {
            "User-Agent": this.userAgent,
            Accept: "application/json",
          },
        });

        this.cache = response.data;
        this.lastFetch = Date.now();

        console.log(colors.success("✅ Dados carregados com sucesso!\n"));
        return this.cache;
      } catch (error) {
        if (attempt === this.retryAttempts) {
          console.log(colors.warning("⚠️  Falha ao carregar dados remotos"));
          console.log(colors.info("📦 Usando dados de fallback...\n"));
          return this.getFallbackData();
        }

        await this.sleep(this.retryDelay);
      }
    }
  }

  /**
   * 💾 Obtém dados locais de backup quando a internet falha
   * @method getFallbackData
   * @returns {Object}
   */
  getFallbackData() {
    const fallbackData = configLoader.getFallbackData();

    if (Object.keys(fallbackData).length === 0) {
      throw new Error("Nenhum dado disponível (remoto ou fallback)");
    }

    return fallbackData;
  }

  /**
   * ⏱️ Pausa a execução por um tempo determinado
   * @async
   * @method sleep
   * @param {number} ms
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 🗑️ Remove os dados armazenados em cache
   * @method clearCache
   * @returns {void}
   */
  clearCache() {
    this.cache = null;
    this.lastFetch = null;
  }
}

module.exports = DataLoader;