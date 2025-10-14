const axios = require("axios");
const configLoader = require("../config/config-loader");
const { colors } = require("../config/colors");

/**
 * 🛡️ Carrega e processa dados de contatos do VirusTotal
 * @class VirusTotalLoader
 */
class VirusTotalLoader {
  constructor() {
    const vtConfig = configLoader.getVirusTotalConfig();

    this.dataUrl = vtConfig.url;
    this.cacheDuration = vtConfig.cacheDuration;
    this.timeout = vtConfig.timeout;
    this.userAgent = "RavCat-VirusTotal/1.0.0";

    this.cache = null;
    this.lastFetch = null;
  }

  /**
   * 📥 Carrega dados com sistema de cache inteligente
   * @async
   * @method loadData
   * @returns {Promise<Object>}
   */
  async loadData() {
    if (this.isCacheValid()) {
      console.log(colors.success("✅ Usando dados do VirusTotal em cache\n"));
      return this.cache;
    }

    return await this.fetchData();
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
   * 🌐 Busca dados diretamente da fonte remota
   * @async
   * @method fetchData
   * @returns {Promise<Object>}
   */
  async fetchData() {
    try {
      console.log(colors.contact("📡 Carregando dados do VirusTotal..."));

      const response = await axios.get(this.dataUrl, {
        timeout: this.timeout,
        headers: {
          "User-Agent": this.userAgent,
          Accept: "application/json",
        },
      });

      const data = response.data;
      
      this.cache = this.processData(data);
      this.lastFetch = Date.now();

      console.log(colors.success("✅ Dados do VirusTotal carregados com sucesso!\n"));
      return this.cache;
    } catch (error) {
      console.log(colors.warning("⚠️  Falha ao carregar dados do VirusTotal"));
      console.log(colors.info("📦 Usando dados de fallback...\n"));
      return this.getFallbackData();
    }
  }

  /**
   * 🔄 Converte dados para estrutura padrão do sistema
   * @method processData
   * @param {Object} data
   * @returns {Object}
   */
  processData(data) {
    if (this.isValidNewStructure(data)) {
      return data;
    }
    
    return this.convertToNewStructure(data);
  }

  /**
   * ✅ Verifica se os dados estão na estrutura correta
   * @method isValidNewStructure
   * @param {Object} data
   * @returns {boolean}
   */
  isValidNewStructure(data) {
    if (!data.companies || typeof data.companies !== 'object') {
      return false;
    }

    const firstCompany = Object.values(data.companies)[0];
    if (!firstCompany || !firstCompany.contacts || !Array.isArray(firstCompany.contacts)) {
      return false;
    }

    const firstContact = firstCompany.contacts[0];
    return firstContact && 
           typeof firstContact === 'object' && 
           firstContact.type && 
           firstContact.contact &&
           typeof firstContact.type === 'string' &&
           typeof firstContact.contact === 'string';
  }

  /**
   * 🔄 Transforma estrutura antiga para nova estrutura
   * @method convertToNewStructure
   * @param {Object} data
   * @returns {Object}
   */
  convertToNewStructure(data) {
    const processedData = {
      source: data.source || "https://docs.virustotal.com/docs/false-positive-contacts",
      last_updated: data.last_updated || new Date().toISOString().split('T')[0],
      companies: {}
    };

    if (data.companies && typeof data.companies === 'object') {
      Object.keys(data.companies).forEach(companyName => {
        const company = data.companies[companyName];
        
        if (company && company.contacts && Array.isArray(company.contacts)) {
          const firstContact = company.contacts[0];
          if (firstContact && typeof firstContact === 'object' && firstContact.type && firstContact.contact) {
            processedData.companies[companyName] = company;
          } else {
            processedData.companies[companyName] = this.convertCompanyContacts(company);
          }
        } else if (Array.isArray(company)) {
          processedData.companies[companyName] = {
            type: this.determineContactType(company),
            contacts: company.map(contact => ({
              type: this.getContactType(contact),
              contact: contact
            })).filter(contactObj => contactObj.contact)
          };
        } else {
          console.log(colors.warning(`⚠️  Estrutura desconhecida para ${companyName}, pulando...`));
        }
      });
    }

    return processedData;
  }

  /**
   * 🔄 Converte lista de contatos de uma empresa
   * @method convertCompanyContacts
   * @param {Object} company
   * @returns {Object}
   */
  convertCompanyContacts(company) {
    const contacts = Array.isArray(company.contacts) ? company.contacts : [];
    
    const convertedContacts = contacts.map(contact => {
      if (typeof contact === 'string') {
        return {
          type: this.getContactType(contact),
          contact: contact
        };
      } else if (typeof contact === 'object' && contact) {
        return {
          type: contact.type || this.getContactType(contact.contact || ''),
          contact: contact.contact || ''
        };
      }
      return null;
    }).filter(contact => contact && contact.contact);

    return {
      type: company.type || this.determineContactType(convertedContacts.map(c => c.contact)),
      contacts: convertedContacts
    };
  }

  /**
   * 🏷️ Define o tipo principal de contato da empresa
   * @method determineContactType
   * @param {Array} contacts
   * @returns {string}
   */
  determineContactType(contacts) {
    if (!Array.isArray(contacts) || contacts.length === 0) return 'email';
    
    const types = contacts.map(contact => this.getContactType(contact));
    
    if (types.includes('form') && types.includes('email')) {
      return 'multiple';
    } else if (types.includes('form')) {
      return 'form';
    } else {
      return 'email';
    }
  }

  /**
   * 🔍 Identifica se é email ou formulário web
   * @method getContactType
   * @param {string} contact
   * @returns {string}
   */
  getContactType(contact) {
    if (!contact) return 'email';
    
    if (contact.startsWith('http://') || contact.startsWith('https://')) {
      return 'form';
    } else if (contact.includes('@')) {
      return 'email';
    }
    return 'email';
  }

  /**
   * 💾 Fornece dados mínimos quando a fonte falha
   * @method getFallbackData
   * @returns {Object}
   */
  getFallbackData() {
    return {
      source: "https://docs.virustotal.com/docs/false-positive-contacts",
      last_updated: new Date().toISOString().split('T')[0],
      companies: {}
    };
  }

  /**
   * 🗑️ Limpa dados armazenados em cache
   * @method clearCache
   * @returns {void}
   */
  clearCache() {
    this.cache = null;
    this.lastFetch = null;
  }
}

module.exports = VirusTotalLoader;