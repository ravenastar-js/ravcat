const DataLoader = require('./data/loader');
const Menu = require('./menu/main');
const Commands = require('./commands/index');
const { colors } = require('./config/colors');
const BoxRenderer = require('./renderer/box');
const VirusTotalLoader = require('./data/virustotal-loader');

/**
 * 🚀 Classe principal que controla toda a aplicação
 * @class Ravcat
 */
class Ravcat {
  constructor() {
    this.dataLoader = new DataLoader();
    this.menu = new Menu();
    this.companies = null;
    this.boxRenderer = new BoxRenderer();
    this.vtLoader = new VirusTotalLoader();
    this.vtData = null;
  }

  /**
   * 🚀 Prepara a aplicação carregando todos os dados
   * @async
   * @method init
   * @returns {Promise<void>}
   */
  async init() {
    try {
      this.companies = await this.dataLoader.loadData();
      console.log(colors.success(`✅ Dados carregados: ${Object.keys(this.companies).length} empresas\n`));
    } catch (error) {
      console.error(colors.error('❌ Erro ao inicializar:'), error.message);
      process.exit(1);
    }
  }

  /**
   * 🛡️ Carrega dados do VirusTotal se necessário
   * @async
   * @method initVirusTotal
   * @returns {Promise<void>}
   */
  async initVirusTotal() {
    try {
      if (!this.vtData) {
        this.vtData = await this.vtLoader.loadData();
        console.log(colors.success(`✅ VirusTotal: ${Object.keys(this.vtData.companies).length} vendors\n`));
      }
    } catch (error) {
      console.error(colors.error('❌ Erro ao carregar VirusTotal:'), error.message);
    }
  }

  /**
   * 🎮 Inicia o menu interativo principal
   * @async
   * @method showMenu
   * @returns {Promise<void>}
   */
  async showMenu() {
    if (!this.companies) {
      await this.init();
    }
    await this.menu.display(this.companies);
  }

  /**
   * 🔍 Processa comandos diretos para ambas as categorias
   * @async
   * @method showCompanyInfo
   * @param {string} command
   * @returns {Promise<void>}
   */
  async showCompanyInfo(command) {

    if (command === '--list') {
      await this.listAllCompanies();
      return;
    }

    if (command === '--list-vt') {
      await this.listVirusTotalVendors();
      return;
    }

    if (command.startsWith('--vt:')) {
      const vendorName = command.replace('--vt:', '').trim();
      await this.showVirusTotalVendor(vendorName);
      return;
    }

    if (command === '--help' || command === '-h') {
      Commands.showHelp();
      return;
    }

    if (command === '--version' || command === '-v') {
      Commands.showVersion();
      return;
    }

    if (!this.companies) {
      await this.init();
    }

    const company = this.companies[command];
    if (!company) {
      console.log(colors.error(`\n❌ Empresa "${command}" não encontrada.`));
      console.log(colors.highlight2('💡 Use "ravcat --list" para ver todas as empresas'));
      console.log(colors.highlight2('💡 Use "ravcat --list-vt" para ver vendors VirusTotal\n'));
      return;
    }

    this.displayCompanyInfo(command, company);
  }

  /**
   * 📋 Mostra lista de todas as empresas disponíveis
   * @async
   * @method listAllCompanies
   * @returns {Promise<void>}
   */
  async listAllCompanies() {
    if (!this.companies) {
      await this.init();
    }

    if (!this.companies) {
      console.log(colors.error('❌ Não foi possível carregar os dados.'));
      return;
    }

    const companiesList = Object.keys(this.companies).sort();

    console.log(colors.primary('\n📬 SERVIÇOS/EMPRESAS DISPONÍVEIS'));
    console.log(`📊 Total: ${colors.highlight2(companiesList.length)} serviços/empresas\n`);

    companiesList.forEach((companyKey, index) => {
      const company = this.companies[companyKey];
      const number = (index + 1).toString().padStart(3, ' ');
      const icon = this.getCompanyIcon(company);
      const type = this.getCompanyDescription(company);

      console.log(colors.text(`  ${number}. ${icon} ${colors.description(companyKey)} - ${colors.muted(type)}`));
    });

    console.log(colors.highlight2('\n💡 Use "ravcat <nome>" para consulta direta'));
    console.log(colors.highlight2('💡 Use "ravcat --vt <vendor>" para consultar VirusTotal\n'));
  }

  /**
   * 🛡️ Mostra lista de todos os vendors do VirusTotal
   * @async
   * @method listVirusTotalVendors
   * @returns {Promise<void>}
   */
  async listVirusTotalVendors() {
    await this.initVirusTotal();

    if (!this.vtData || !this.vtData.companies) {
      console.log(colors.error('❌ Não foi possível carregar dados do VirusTotal.'));
      return;
    }

    const vendorsList = Object.keys(this.vtData.companies).sort();

    console.log(colors.primary('\n🛡️ VENDORS VIRUSTOTAL DISPONÍVEIS'));
    console.log(`📊 Total: ${colors.highlight2(vendorsList.length)} vendors\n`);

    vendorsList.forEach((vendorName, index) => {
      const vendor = this.vtData.companies[vendorName];
      const number = (index + 1).toString().padStart(3, ' ');
      const icon = this.getVTCompanyIcon(vendor.type);
      const type = this.getVTTypeDescription(vendor.type);

      console.log(colors.text(`  ${number}. ${icon} ${colors.description(vendorName)} - ${colors.muted(type)}`));
    });

    console.log(colors.highlight2('\n💡 Use "ravcat --vt <vendor>" para consulta direta'));
    console.log(colors.highlight2('💡 Use "ravcat <empresa>" para consultar serviços/empresas\n'));
  }

  /**
   * 🔍 Mostra informações de um vendor específico do VirusTotal
   * @async
   * @method showVirusTotalVendor
   * @param {string} vendorName
   * @returns {Promise<void>}
   */
  async showVirusTotalVendor(vendorName) {
    await this.initVirusTotal();

    if (!this.vtData || !this.vtData.companies) {
      console.log(colors.error('❌ Não foi possível carregar dados do VirusTotal.'));
      return;
    }

    let vendor = this.vtData.companies[vendorName];
    let foundKey = vendorName;

    if (!vendor) {
      const found = this.findVTVendor(vendorName.toLowerCase(), this.vtData.companies);
      if (found) {
        vendor = found.vendor;
        foundKey = found.key;
      }
    }

    if (!vendor) {
      console.log(colors.error(`\n❌ Vendor "${vendorName}" não encontrado no VirusTotal.`));
      console.log(colors.highlight2('💡 Use "ravcat --list-vt" para ver todos os vendors disponíveis\n'));
      return;
    }

    this.displayVirusTotalVendor(foundKey, vendor);
  }

  /**
   * 🔎 Encontra vendor do VirusTotal baseado no termo de busca
   * @method findVTVendor
   * @param {string} searchTerm
   * @param {Object} vendors
   * @returns {Object|null}
   */
  findVTVendor(searchTerm, vendors) {
    const vendorNames = Object.keys(vendors);

    for (const vendorName of vendorNames) {
      if (vendorName.toLowerCase().includes(searchTerm)) {
        return { key: vendorName, vendor: vendors[vendorName] };
      }
    }

    return null;
  }

  /**
   * 🖨️ Exibe card estilizado com informações do vendor VirusTotal
   * @method displayVirusTotalVendor
   * @param {string} vendorName
   * @param {Object} vendor
   * @returns {void}
   */
  displayVirusTotalVendor(vendorName, vendor) {
    const width = Math.min(this.boxRenderer.terminalWidth - 8, 70);
    const contentWidth = width - 6;

    let contentLines = [];

    contentLines.push(colors.title(`🛡️ ${vendorName.toUpperCase()} - VIRUSTOTAL`));
    contentLines.push(colors.muted('─'.repeat(contentWidth - 2)));
    contentLines.push('');

    contentLines.push(colors.success(`📋 Tipo: ${this.getVTTypeDescription(vendor.type)}`));
    contentLines.push('');

    contentLines.push(colors.subtitle("📧 Contatos para Falsos Positivos:"));
    contentLines.push('');

    if (vendor.contacts && Array.isArray(vendor.contacts)) {
      vendor.contacts.forEach((contactObj, index) => {
        if (contactObj && contactObj.type && contactObj.contact) {
          const contactIcon = contactObj.type === 'email' ? '📧' : '🌐';
          const contactType = contactObj.type === 'email' ? 'E-mail' : 'Formulário';

          contentLines.push(colors.text(`  ${contactIcon} ${index + 1}. [${contactType}]`));
          contentLines.push(colors.contact(`     ${contactObj.contact}`));
          contentLines.push('');
        }
      });
    } else {
      contentLines.push(colors.text("  ⚠️  Nenhum contato disponível"));
    }

    contentLines.push(colors.muted('─'.repeat(contentWidth - 2)));
    contentLines.push(colors.highlight2('💡 Inclua o link do relatório do VirusTotal na sua solicitação'));

    const content = contentLines.join('\n');

    const vendorBox = this.boxRenderer.createBox(content, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: '#57f287',
      backgroundColor: '#1a1a1a',
      width: width,
      textAlignment: 'left',
    });

    console.log(vendorBox);
    console.log(colors.highlight2('💡 Use "ravcat --list-vt" para ver todos os vendors\n'));
  }

  /**
   * 🏷️ Retorna emoji baseado no tipo de empresa
   * @method getCompanyIcon
   * @param {Object} company
   * @returns {string}
   */
  getCompanyIcon(company) {
    if (company.type === 'email') return '📧';
    if (company.type === 'form') return '🌐';
    if (company.type === 'multiple') return '📋';
    return '🏢';
  }

  /**
   * 📝 Retorna descrição do tipo de contato
   * @method getCompanyDescription
   * @param {Object} company
   * @returns {string}
   */
  getCompanyDescription(company) {
    if (company.type === 'email') return 'E-mail';
    if (company.type === 'form') return 'Formulário';
    if (company.type === 'multiple') return 'Múltiplos';
    return 'Contato';
  }

  /**
   * 🏷️ Retorna ícone baseado no tipo de vendor
   * @method getVTCompanyIcon
   * @param {string} type
   * @returns {string}
   */
  getVTCompanyIcon(type) {
    if (type === "email") return "📧";
    if (type === "form") return "🌐";
    if (type === "multiple") return "📋";
    return "🏢";
  }

  /**
   * 📝 Retorna descrição do tipo de vendor
   * @method getVTTypeDescription
   * @param {string} type
   * @returns {string}
   */
  getVTTypeDescription(type) {
    if (type === "email") return "E-mail";
    if (type === "form") return "Formulário Online";
    if (type === "multiple") return "Múltiplos Canais";
    return "Contato";
  }

  /**
   * 🖨️ Exibe card estilizado com informações da empresa
   * @method displayCompanyInfo
   * @param {string} key
   * @param {Object} company
   * @returns {void}
   */
  displayCompanyInfo(key, company) {
    const companyCard = this.boxRenderer.createCompanyCard(key, company);
    console.log(companyCard);
    console.log(colors.highlight2('💡 Use "ravcat" para menu interativo\n'));
  }
}

module.exports = Ravcat;