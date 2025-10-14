const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * 📁 Carrega e gerencia as configurações do aplicativo
 * @class ConfigLoader
 */
class ConfigLoader {
  constructor() {
    this.configPath = join(__dirname, '../../config.json');
    this.config = this.loadConfig();
  }

  /**
   * 📥 Lê o arquivo de configuração do disco
   * @method loadConfig
   * @returns {Object}
   */
  loadConfig() {
    try {
      const configFile = readFileSync(this.configPath, 'utf8');
      return JSON.parse(configFile);
    } catch (error) {
      console.error('❌ Erro ao carregar config.json:', error.message);
      return this.getDefaultConfig();
    }
  }

  /**
   * ⚙️ Fornece configurações padrão caso o arquivo não exista
   * @method getDefaultConfig
   * @returns {Object}
   */
  getDefaultConfig() {
    return {
      app: {
        name: "RavCat",
        author: "RavenaStar",
        website: "https://ravenastar.link"
      },
      data: {
        url: "https://github.com/ravenastar-js/gd/raw/refs/heads/main/report.json",
        cacheDuration: 3600000,
        timeout: 10000,
        userAgent: "RavCat-CLI/1.0.0",
        retryAttempts: 3,
        retryDelay: 2000
      },
      virustotal: {
        url: "https://github.com/ravenastar-js/gd/raw/refs/heads/main/db/vtfp.json",
        cacheDuration: 86400000,
        timeout: 15000
      },
      colors: {
        primary: "#06D6A0",
        secondary: "#FFD166",
        action: "#57f287",
        danger: "#EF476F",
        info: "#118AB2",
        title: "#57f287",
        subtitle: "#FFFFFF",
        highlight: "#F18F01",
        highlight2: "#f8e789",
        text: "#E9ECEF",
        muted: "#7F8C8D",
        link: "#8ad4ff",
        success: "#57f287",
        contact: "#8ad4ff",
        description: "#95E1D3",
        error: "#EF476F",
        warning: "#FFD166",
        exit: "#ffb3ba",
        back: "#bae1ff"
      },
      fallbackData: {}
    };
  }

  /**
   * 📱 Obtém informações básicas sobre o aplicativo
   * @method getAppInfo
   * @returns {Object}
   */
  getAppInfo() {
    return this.config.app || this.getDefaultConfig().app;
  }

  /**
   * 📊 Obtém configurações para carregamento de dados
   * @method getDataConfig
   * @returns {Object}
   */
  getDataConfig() {
    return this.config.data || this.getDefaultConfig().data;
  }

  /**
   * 🛡️ Obtém configurações específicas do VirusTotal
   * @method getVirusTotalConfig
   * @returns {Object}
   */
  getVirusTotalConfig() {
    return this.config.virustotal || this.getDefaultConfig().virustotal;
  }

  /**
   * 🎨 Obtém o esquema de cores para o terminal
   * @method getColors
   * @returns {Object}
   */
  getColors() {
    return this.config.colors || this.getDefaultConfig().colors;
  }

  /**
   * 💾 Obtém dados de fallback para uso offline
   * @method getFallbackData
   * @returns {Object}
   */
  getFallbackData() {
    return this.config.fallbackData || this.getDefaultConfig().fallbackData;
  }
}

module.exports = new ConfigLoader();