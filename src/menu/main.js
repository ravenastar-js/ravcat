const inquirer = require("inquirer");
const { colors } = require("../config/colors");
const HeaderRenderer = require("../renderer/header");
const MenuRenderer = require("../renderer/menu");
const BoxRenderer = require("../renderer/box");
const VirusTotalLoader = require("../data/virustotal-loader");
const figlet = require("figlet");

/**
 * 🎮 Controla todos os menus e navegação do sistema
 * @class Menu
 */
class Menu {
  constructor() {
    this.header = new HeaderRenderer();
    this.boxRenderer = new BoxRenderer();
    this.vtLoader = new VirusTotalLoader();
    this.companies = null;
  }

  /**
   * 🎯 Exibe o menu principal com todas as opções
   * @async
   * @method display
   * @param {Object} companies
   * @returns {Promise<void>}
   */
  async display(companies) {
    this.companies = companies;
    await this.showMainMenu();
  }

  /**
   * 🏠 Mostra o menu principal com cabeçalho
   * @async
   * @method showMainMenu
   * @returns {Promise<void>}
   */
  async showMainMenu() {
    while (true) {
      this.header.displayHeader();

      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          prefix: "",
          message: colors.highlight2("🎯 Menu Principal - O que deseja fazer?"),
          choices: MenuRenderer.createMainMenu(),
          pageSize: 10,
          loop: false,
        },
      ]);

      switch (action) {
        case "companies_menu":
          await this.showCompaniesMenu();
          break;
        case "virustotal_fp":
          await this.showVirusTotalFP();
          break;
        case "quick_report":
          await this.showQuickReport();
          break;
        case "about":
          await this.showAbout();
          break;
        case "exit":
          this.showGoodbye();
          return;
      }
    }
  }

  /**
   * 📬 Mostra menu específico de empresas e serviços
   * @async
   * @method showCompaniesMenu
   * @returns {Promise<void>}
   */
  async showCompaniesMenu() {
    this.header.displayHeader();

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        prefix: "",
        message: colors.highlight2("🎯 O que deseja fazer?"),
        choices: MenuRenderer.createVTMenu()
      }
    ]);

    switch (action) {
      case "list_all":
        await this.showCompaniesList();
        break;
      case "search_company":
        await this.searchCompany();
        break;
      case "generate_txt":
        await this.generateTxtList();
        break;
      case "menu":
        return;
      case "exit":
        this.showGoodbye();
        process.exit(0);
    }
  }

  /**
   * 🛡️ Mostra contatos para falsos positivos do VirusTotal
   * @async
   * @method showVirusTotalFP
   * @returns {Promise<void>}
   */
  async showVirusTotalFP() {
    this.header.displayHeader();

    try {
      const vtData = await this.vtLoader.loadData();
      const vendors = Object.keys(vtData.companies).sort();

      const bannerText = figlet.textSync("VIRUSTOTAL", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
      });

      let vtContent = [
        "",
        colors.action(bannerText),
        "",
        colors.primary("🛡️ CONTATOS PARA FALSOS POSITIVOS"),
        "",
        colors.text("🔗 Fonte: ") + colors.link(vtData.source),
        "",
        colors.success(`📋 TOTAL DE VENDORS: ${vendors.length}`),
        "",
        colors.text("🎯 Escolha uma opção abaixo:"),
        "",
      ].join("\n");

      const vtBox = this.boxRenderer.createBox(vtContent, {
        float: "left",
        padding: 1,
        margin: 1,
        borderColor: "#57f287",
        borderStyle: "classic",
        backgroundColor: "#1a1a1a",
        width: Math.min(this.terminalWidth - 8, 80),
        textAlignment: "center",
      });

      console.log(vtBox);
      console.log("");

      const { action } = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          prefix: "",
          message: colors.highlight2("🎯 O que deseja fazer?"),
          choices: MenuRenderer.createVTMenu()
        }
      ]);

      switch (action) {
        case "list_all":
          await this.showVTVendorsList(vtData.companies);
          break;
        case "search_vendor":
          await this.searchVTVendor(vtData.companies);
          break;
        case "generate_txt":
          await this.generateVTTxt(vtData);
          break;
        case "menu":
          return;
        case "exit":
          this.showGoodbye();
          process.exit(0);
      }
    } catch (error) {
      const fallbackContent = [
        "",
        colors.primary("🛡️ CONTATOS PARA FALSOS POSITIVOS"),
        "",
        colors.text("🔗 Fonte: ") + colors.link("https://docs.virustotal.com/docs/false-positive-contacts"),
        "",
        colors.warning("⚠️  IMPORTANTE:"),
        colors.text("• VirusTotal apenas agrega dados de diversos vendors"),
        colors.text("• Entre em contato com o vendor específico que está gerando o falso positivo"),
        colors.text("• Inclua o link do relatório do VirusTotal na sua solicitação"),
        "",
      ].join("\n");

      const fallbackBox = this.boxRenderer.createBox(fallbackContent, {
        float: "left",
        padding: 1,
        margin: 1,
        borderColor: "#57f287",
        borderStyle: "classic",
        backgroundColor: "#1a1a1a",
        width: Math.min(this.terminalWidth - 8, 80),
        textAlignment: "left",
      });

      console.log(fallbackBox);
      console.log("");

      await inquirer.prompt([
        {
          type: "input",
          name: "continue",
          message: colors.muted("Pressione Enter para continuar..."),
        },
      ]);
    }
  }
  /**
   * 🚨 Mostra opções de denúncia rápida para casos urgentes
   * @async
   * @method showQuickReport
   * @returns {Promise<void>}
   */
  async showQuickReport() {
    this.header.displayHeader();

    const quickReports = [
      {
        name: "🌐 SaferNet - Denúncias Anônimas",
        description: "Denúncias de crimes contra direitos humanos na internet",
        contacts: [
          {
            type: "website",
            contact: "https://new.safernet.org.br/denuncie#",
            description: "Formulário online anônimo"
          }
        ]
      },
      {
        name: "👶 Núcleo de Observação e Análise Digital (NOAD)",
        description: "Crimes virtuais contra crianças e adolescentes",
        contacts: [
          {
            type: "email",
            contact: "nucleo.noad@sp.gov.br",
            description: "E-mail de denúncia"
          }
        ]
      }
    ];

    const { selectedReport } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedReport",
        prefix: "",
        message: colors.highlight2("🚨 Selecione o tipo de denúncia rápida:"),
        choices: [
          ...quickReports.map((report, index) => ({
            name: `${report.name}\n     ${colors.muted(report.description)}`,
            value: index,
            short: report.name
          })),
          ...MenuRenderer.createFooter()
        ],
        pageSize: 10,
        loop: false,
      }
    ]);

    switch (selectedReport) {
      case "menu":
        return;
      case "exit":
        this.showGoodbye();
        process.exit(0);
      default:
        if (typeof selectedReport === 'number' && quickReports[selectedReport]) {
          await this.showQuickReportDetails(quickReports[selectedReport]);
        }
    }
  }

  /**
   * 📄 Mostra detalhes de uma denúncia rápida
   * @async
   * @method showQuickReportDetails
   * @param {Object} report
   * @returns {Promise<void>}
   */
  async showQuickReportDetails(report) {
    this.header.displayHeader();

    let contentLines = [];

    contentLines.push(colors.title(`🚨 ${report.name}`));
    contentLines.push(colors.muted('─'.repeat(50)));
    contentLines.push('');
    contentLines.push(colors.text(report.description));
    contentLines.push('');
    contentLines.push(colors.subtitle("📞 Contatos para Denúncia:"));
    contentLines.push('');

    report.contacts.forEach((contact, index) => {
      const icon = contact.type === 'email' ? '📧' :
        contact.type === 'phone' ? '📞' : '🌐';

      contentLines.push(colors.text(`  ${icon} ${index + 1}. ${contact.description}`));
      contentLines.push(colors.contact(`     ${contact.contact}`));
      contentLines.push('');
    });

    contentLines.push(colors.muted('─'.repeat(50)));
    contentLines.push(colors.highlight2('💡 Para emergências, ligue 190 (Polícia) ou 100 (Direitos Humanos)'));

    const content = contentLines.join('\n');

    const reportBox = this.boxRenderer.createBox(content, {
      float: "left",
      padding: 1,
      margin: 1,
      borderColor: "#57f287",
      borderStyle: "classic",
      backgroundColor: "#1a1a1a",
      width: Math.min(this.terminalWidth - 8, 70),
      textAlignment: "left",
    });

    console.log(reportBox);
    console.log('');

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        prefix: "",
        message: colors.highlight2("🎯 O que deseja fazer agora?"),
        choices: [
          {
            name: `${colors.danger("🚨")} Ver outra denúncia rápida`,
            value: "another",
            short: "Outra denúncia"
          },
          ...MenuRenderer.createFooter()
        ],
      }
    ]);

    switch (action) {
      case "another":
        await this.showQuickReport();
        break;
      case "menu":
        return;
      case "exit":
        this.showGoodbye();
        process.exit(0);
    }
  }


  /**
   * 📋 Mostra lista completa de vendors do VirusTotal
   * @async
   * @method showVTVendorsList
   * @param {Object} vendors
   * @returns {Promise<void>}
   */
  async showVTVendorsList(vendors) {
    const vendorList = Object.keys(vendors).sort();

    this.header.displayHeader();

    console.log(colors.text.bold("\n📋 LISTA COMPLETA DE VENDORS - VIRUSTOTAL"));
    console.log(`📊 Total: ${colors.highlight2(vendorList.length)} vendors disponíveis\n`);

    const { selectedVendor } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedVendor",
        prefix: "",
        message: colors.highlight2("🎯 Selecione um vendor:"),
        choices: [
          ...vendorList.map(vendorName => {
            const vendor = vendors[vendorName];
            const icon = this.getVTCompanyIcon(vendor.type);
            return {
              name: `${icon} ${vendorName} - ${colors.muted(this.getVTTypeDescription(vendor.type))}`,
              value: vendorName
            };
          }),
          ...MenuRenderer.createFooter()
        ],
        pageSize: Math.min(vendorList.length + 4, 15),
        loop: false,
      }
    ]);

    switch (selectedVendor) {
      case "menu":
        return;
      case "exit":
        this.showGoodbye();
        process.exit(0);
      default:
        await this.showVTVendorDetails(selectedVendor, vendors[selectedVendor]);
    }
  }

  /**
   * 🔍 Permite buscar vendor por nome
   * @async
   * @method searchVTVendor
   * @param {Object} vendors
   * @returns {Promise<void>}
   */
  async searchVTVendor(vendors) {
    this.header.displayHeader();

    const { vendorName } = await inquirer.prompt([
      {
        type: "input",
        name: "vendorName",
        message: colors.title("🔍 Digite o nome do vendor:"),
        validate: (input) => {
          if (input.trim().length === 0) {
            return colors.danger("⚠️  Por favor, digite um nome válido");
          }
          return true;
        },
      },
    ]);

    const searchTerm = vendorName.toLowerCase().trim();
    const foundVendor = this.findVTVendor(searchTerm, vendors);

    if (foundVendor) {
      await this.showVTVendorDetails(foundVendor.key, foundVendor.vendor);
    } else {
      console.log(colors.error(`\n❌ Vendor "${vendorName}" não encontrado.`));
      console.log(colors.highlight2("💡 Use a lista completa para ver todas as opções disponíveis\n"));

      const { tryAgain } = await inquirer.prompt([
        {
          type: "confirm",
          name: "tryAgain",
          message: colors.title("🔍 Deseja tentar outra busca?"),
          default: true,
        },
      ]);

      if (tryAgain) {
        await this.searchVTVendor(vendors);
      } else {
        await this.showVirusTotalFP();
      }
    }
  }

  /**
   * 🔎 Encontra vendor baseado no termo de busca
   * @method findVTVendor
   * @param {string} searchTerm
   * @param {Object} vendors
   * @returns {Object|null}
   */
  findVTVendor(searchTerm, vendors) {
    const vendorNames = Object.keys(vendors);

    if (vendors[searchTerm]) {
      return { key: searchTerm, vendor: vendors[searchTerm] };
    }

    for (const vendorName of vendorNames) {
      if (vendorName.toLowerCase().includes(searchTerm)) {
        return { key: vendorName, vendor: vendors[vendorName] };
      }
    }

    return null;
  }

  /**
   * 📄 Gera arquivo TXT com lista de vendors
   * @async
   * @method generateVTTxt
   * @param {Object} vtData
   * @returns {Promise<void>}
   */
  async generateVTTxt(vtData) {
    this.header.displayHeader();

    console.log(colors.text("📄 Preparando para gerar arquivo TXT do VirusTotal...\n"));

    try {
      const VTTxtGenerator = require("../utils/vt-txt-generator");
      const txtGenerator = new VTTxtGenerator(vtData);
      const result = txtGenerator.generateTxtFile();

      if (result.success) {
        console.log(colors.success("✅ Arquivo TXT do VirusTotal gerado com sucesso!\n"));

        console.log(colors.primary("📁 INFORMAÇÕES DO ARQUIVO"));
        console.log(colors.text("  📄 Nome: ") + colors.text(result.fileName));
        console.log(colors.text("  📂 Local: ") + colors.link(result.filePath));
        console.log(colors.text("  💾 Tamanho: ") + colors.text(this.getFileSize(result.filePath) + "\n"));

        console.log(colors.primary("📊 CONTEÚDO INCLUÍDO NO ARQUIVO"));
        console.log(colors.text("  🛡️ ") + colors.description("Cabeçalho completo") + colors.text(" - Informações do VirusTotal"));
        console.log(colors.text("  📋 ") + colors.description("Lista de vendors") + colors.text(" - Organizados alfabeticamente"));
        console.log(colors.text("  📧 ") + colors.description("Contatos por vendor") + colors.text(" - E-mails e formulários"));

        console.log(colors.highlight2("💡 O arquivo está pronto para uso..."));

      } else {
        console.log(colors.error("❌ " + "═".repeat(45)));
        console.log(colors.error("💥 ERRO AO GERAR ARQUIVO"));
        console.log(colors.error("❌ " + "═".repeat(45) + "\n"));

        console.log(colors.text("📝 Detalhes do erro:"));
        console.log(colors.error(`  ${result.error}\n`));
      }
    } catch (error) {
      console.log(colors.error(`❌ Erro inesperado: ${error.message}\n`));
    }

    await inquirer.prompt([
      {
        type: "input",
        name: "continue",
        message: colors.muted("Pressione Enter para continuar..."),
      },
    ]);

    await this.showVirusTotalFP();
  }

  /**
   * 📄 Mostra detalhes completos de um vendor
   * @async
   * @method showVTVendorDetails
   * @param {string} vendorName
   * @param {Object} vendor
   * @returns {Promise<void>}
   */
  async showVTVendorDetails(vendorName, vendor) {
    this.header.displayHeader();

    const icon = this.getVTCompanyIcon(vendor.type);

    let vendorContent = [
      colors.title(`🛡️ ${vendorName.toUpperCase()}`),
      colors.muted('─'.repeat(40)),
      "",
      colors.success(`${icon} Tipo: ${this.getVTTypeDescription(vendor.type)}`),
      "",
      colors.subtitle("📧 Contatos:"),
      ""
    ];

    if (vendor.contacts && Array.isArray(vendor.contacts)) {
      vendor.contacts.forEach((contactObj, index) => {
        if (contactObj && contactObj.type && contactObj.contact) {
          const contactIcon = contactObj.type === 'email' ? '📧' : '🌐';
          const contactType = contactObj.type === 'email' ? 'E-mail' : 'Formulário';

          const formattedContact = contactObj.type === 'email'
            ? colors.contact(contactObj.contact)
            : colors.link(contactObj.contact);

          vendorContent.push(colors.text(`  ${contactIcon} ${index + 1}. [${contactType}] `) + formattedContact);
        } else {
          console.log(colors.warning(`⚠️  Contato inválido para ${vendorName}, pulando...`));
        }
      });
    } else {
      vendorContent.push(colors.text("  ⚠️  Nenhum contato disponível"));
    }

    vendorContent.push("");
    vendorContent.push(colors.muted('─'.repeat(40)));
    vendorContent.push(colors.highlight2("💡 Inclua o link do relatório do VirusTotal na sua solicitação"));

    const vendorBox = this.boxRenderer.createBox(vendorContent.join("\n"), {
      float: "left",
      padding: 1,
      margin: 1,
      borderColor: "#57f287",
      borderStyle: "round",
      backgroundColor: "#1a1a1a",
      width: Math.min(this.terminalWidth - 8, 70),
      textAlignment: "left",
    });

    console.log(vendorBox);
    console.log("");

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        prefix: "",
        message: colors.highlight2("🎯 O que deseja fazer agora?"),
        choices: MenuRenderer.createVTActionMenu()
      }
    ]);

    switch (action) {
      case "another":
        const vtData = await this.vtLoader.loadData();
        await this.searchVTVendor(vtData.companies);
        break;
      case "back":
        const vtData2 = await this.vtLoader.loadData();
        await this.showVTVendorsList(vtData2.companies);
        break;
      case "menu":
        return;
      case "exit":
        this.showGoodbye();
        process.exit(0);
    }
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
   * 📄 Gera arquivo TXT com lista de empresas
   * @async
   * @method generateTxtList
   * @returns {Promise<void>}
   */
  async generateTxtList() {
    this.header.displayHeader();

    console.log(colors.text("📄 Preparando para gerar arquivo TXT...\n"));

    try {
      const TxtGenerator = require("../utils/txt-generator");
      const txtGenerator = new TxtGenerator(this.companies);
      const result = txtGenerator.generateTxtFile();

      if (result.success) {
        console.log(colors.success("✅ Arquivo TXT gerado com sucesso!\n"));

        console.log(colors.primary("📁 INFORMAÇÕES DO ARQUIVO"));
        console.log(colors.text("  📄 Nome: ") + colors.text(result.fileName));
        console.log(colors.text("  📂 Local: ") + colors.link(result.filePath));
        console.log(colors.text("  💾 Tamanho: ") + colors.text(this.getFileSize(result.filePath) + "\n"));

        console.log(colors.primary("📊 CONTEÚDO INCLUÍDO NO ARQUIVO"));
        console.log(colors.text("  🚀 ") + colors.description("Cabeçalho completo") + colors.text(" - Informações do RavCat"));
        console.log(colors.text("  🏢 ") + colors.description("Empresas categorizadas") + colors.text(" - Organizadas por tipo de contato"));
        console.log(colors.text("  📧 ") + colors.description("E-mail") + colors.text(" - Empresas com contato por e-mail"));
        console.log(colors.text("  🌐 ") + colors.description("Formulário") + colors.text(" - Empresas com formulário online"));
        console.log(colors.text("  📋 ") + colors.description("Múltiplos") + colors.text(" - Empresas com vários canais"));
        console.log(colors.text("  🔤 ") + colors.description("Lista alfabética") + colors.text(" - Todas empresas em ordem A-Z"));
        console.log(colors.text("  💡 ") + colors.description("Informações finais") + colors.text(" - Instruções e contatos\n"));

        console.log(colors.highlight2("💡 O arquivo está pronto para uso..."));

      } else {
        console.log(colors.error("❌ " + "═".repeat(45)));
        console.log(colors.error("💥 ERRO AO GERAR ARQUIVO"));
        console.log(colors.error("❌ " + "═".repeat(45) + "\n"));

        console.log(colors.text("📝 Detalhes do erro:"));
        console.log(colors.error(`  ${result.error}\n`));

        console.log(colors.info("🔧 Soluções possíveis:"));
        console.log(colors.text("  • Verifique as permissões de escrita no diretório"));
        console.log(colors.text("  • Confirme que há espaço em disco disponível"));
        console.log(colors.text("  • Tente executar como administrador (se necessário)"));
        console.log(colors.text("  • Execute manualmente: ") + colors.highlight("npm install") + colors.text(" para verificar dependências\n"));
      }
    } catch (error) {
      console.log(colors.error(`❌ Erro inesperado: ${error.message}\n`));
    }

    await inquirer.prompt([
      {
        type: "input",
        name: "continue",
        message: colors.muted("Pressione Enter para continuar..."),
      },
    ]);
  }

  /**
   * 📏 Calcula tamanho do arquivo de forma legível
   * @method getFileSize
   * @param {string} filePath
   * @returns {string}
   */
  getFileSize(filePath) {
    try {
      const fs = require('fs');
      const stats = fs.statSync(filePath);
      const bytes = stats.size;

      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    } catch (error) {
      return 'Não disponível';
    }
  }

  /**
   * 🔍 Permite buscar empresa por nome
   * @async
   * @method searchCompany
   * @returns {Promise<void>}
   */
  async searchCompany() {
    this.header.displayHeader();

    const { companyName } = await inquirer.prompt([
      {
        type: "input",
        name: "companyName",
        message: colors.title("🔍 Digite o nome do serviço/empresa:"),
        validate: (input) => {
          if (input.trim().length === 0) {
            return colors.danger("⚠️  Por favor, digite um nome válido");
          }
          return true;
        },
      },
    ]);

    const searchTerm = companyName.toLowerCase().trim();
    const foundCompany = this.findCompany(searchTerm);

    if (foundCompany) {
      await this.showCompanyDetails(foundCompany.key);
    } else {
      console.log(colors.error(`\n❌ Empresa "${companyName}" não encontrada.`));
      console.log(colors.highlight2("💡 Use a lista completa para ver todas as opções disponíveis\n"));

      const { tryAgain } = await inquirer.prompt([
        {
          type: "confirm",
          name: "tryAgain",
          message: colors.title("🔍 Deseja tentar outra busca?"),
          default: true,
        },
      ]);

      if (tryAgain) {
        await this.searchCompany();
      }
    }
  }

  /**
   * 🔎 Encontra empresa baseado no termo de busca
   * @method findCompany
   * @param {string} searchTerm
   * @returns {Object|null}
   */
  findCompany(searchTerm) {
    const companies = Object.keys(this.companies);

    if (this.companies[searchTerm]) {
      return { key: searchTerm, company: this.companies[searchTerm] };
    }

    for (const companyKey of companies) {
      if (companyKey.toLowerCase().includes(searchTerm)) {
        return { key: companyKey, company: this.companies[companyKey] };
      }
    }

    return null;
  }

  /**
   * 📋 Mostra lista completa de empresas
   * @async
   * @method showCompaniesList
   * @returns {Promise<void>}
   */
  async showCompaniesList() {
    const companiesList = this.prepareCompaniesList();

    this.header.displayHeader();

    console.log(colors.primary("\n📋 LISTA COMPLETA DE EMPRESAS"));
    console.log(colors.info(`📊 Total: ${companiesList.length} empresas disponíveis\n`));

    const { selectedCompany } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedCompany",
        prefix: "",
        message: colors.highlight2("🎯 Selecione uma empresa:"),
        choices: [
          ...companiesList.map((company, index) => {
            const number = (index + 1).toString().padStart(2, " ");
            return {
              name: `${number}. ${company.icon} ${colors.back(company.name)} - ${colors.muted(company.type)}`,
              value: company.key,
              short: company.name,
            };
          }),
          new inquirer.Separator(),
          {
            name: `${colors.back("🔙")} Voltar`,
            value: "back",
            short: "Voltar",
          }
        ],
        pageSize: Math.min(companiesList.length + 3, 15),
        loop: false,
      },
    ]);

    if (selectedCompany === "back") {
      await this.showCompaniesMenu();
      return;
    }

    await this.showCompanyDetails(selectedCompany);
  }

  /**
   * 📄 Mostra detalhes completos de uma empresa
   * @async
   * @method showCompanyDetails
   * @param {string} companyKey
   * @returns {Promise<void>}
   */
  async showCompanyDetails(companyKey) {
    const company = this.companies[companyKey];

    this.header.displayHeader();

    const companyCard = this.boxRenderer.createCompanyCard(companyKey, company);
    console.log(companyCard);
    console.log('');

    const { continueAction } = await inquirer.prompt([
      {
        type: "list",
        name: "continueAction",
        prefix: "",
        message: colors.highlight2("📝 O que deseja fazer agora?"),
        choices: MenuRenderer.createActionMenu()
      }
    ]);

    if (continueAction === "another") {
      await this.showCompaniesList();
    } else if (continueAction === "back") {
      await this.showCompaniesList();
    } else if (continueAction === "menu") {
      await this.showCompaniesMenu();
    }
  }

  /**
   * 🏭 Prepara lista de empresas para exibição
   * @method prepareCompaniesList
   * @returns {Array<Object>}
   */
  prepareCompaniesList() {
    return Object.keys(this.companies)
      .sort()
      .map((key) => {
        const company = this.companies[key];
        return {
          key: key,
          name: key,
          icon: this.getCompanyIcon(company),
          type: this.getCompanyDescription(company),
        };
      });
  }

  /**
   * 🏷️ Retorna ícone baseado no tipo de empresa
   * @method getCompanyIcon
   * @param {Object} company
   * @returns {string}
   */
  getCompanyIcon(company) {
    if (company.type === "email") return "📧";
    if (company.type === "form") return "🌐";
    if (company.type === "multiple") return "📋";
    return "🏢";
  }

  /**
   * 📝 Retorna descrição do tipo de empresa
   * @method getCompanyDescription
   * @param {Object} company
   * @returns {string}
   */
  getCompanyDescription(company) {
    if (company.type === "email") return "E-mail";
    if (company.type === "form") return "Formulário";
    if (company.type === "multiple") return "Múltiplos";
    return "Contato";
  }

  /**
   * ℹ️ Mostra informações sobre o sistema
   * @async
   * @method showAbout
   * @returns {Promise<void>}
   */
  async showAbout() {
    this.header.displayHeader();
    const bannerText = figlet.textSync("SOBRE", {
      font: "Standard",
      horizontalLayout: "default",
      verticalLayout: "default",
    });

    const aboutContent = [
      "",
      colors.action(bannerText),
      "",
      colors.text("🔍 Sistema de Consulta de Contatos"),
      "",
      colors.text("Feito com 💚 por ") + colors.primary("RavenaStar"),
      colors.text("📚 Docs: ") + colors.link("https://ravenastar.link"),
      "",
      colors.success("✨ Características principais:"),
      colors.text("📧 Contatos de e-mail para denúncias"),
      colors.text("🌐 Formulários online oficiais"),
      colors.text("📋 Múltiplos canais de contato"),
      colors.text("🛡️  Contatos VirusTotal (falsos positivos)"),
      colors.text("🔄 Dados atualizados automaticamente"),
    ].join("\n");

    const aboutBox = this.boxRenderer.createBox(aboutContent, {
      float: "left",
      padding: 1,
      margin: 1,
      borderColor: "#57f287",
      borderStyle: "classic",
      backgroundColor: "#1a1a1a",
      width: Math.min(this.terminalWidth - 8, 80),
      textAlignment: "center",
    });

    console.log(aboutBox);
    console.log("");

    await inquirer.prompt([
      {
        type: "input",
        name: "continue",
        message: colors.muted("Pressione Enter para continuar..."),
      },
    ]);
  }

  /**
   * 👋 Mostra mensagem de despedida
   * @method showGoodbye
   * @returns {void}
   */
  showGoodbye() {
    const goodbyeContent = [
      colors.primary("👋 Volte sempre!"),
      "",
      colors.text("Lembre-se: Denúncias responsáveis ajudam a"),
      colors.text("manter a internet mais segura para todos."),
    ].join("\n");

    const goodbyeBox = this.boxRenderer.createBox(goodbyeContent, {
      float: "left",
      padding: 1,
      margin: 1,
      borderColor: "#57f287",
      borderStyle: "classic",
      backgroundColor: "#1a1a1a",
      width: Math.min(this.terminalWidth - 8, 80),
      textAlignment: "center",
    });

    console.log(goodbyeBox);
    console.log("");
  }
}

module.exports = Menu;