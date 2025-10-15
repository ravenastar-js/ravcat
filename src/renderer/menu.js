const { colors } = require("../config/colors");
const inquirer = require("inquirer");

/**
 * 🎯 Cria e gerencia todos os menus interativos do sistema
 * @class MenuRenderer
 */
class MenuRenderer {
  /**
   * 🎯 Cria as opções principais do menu inicial
   * @static
   * @method createMainMenu
   * @returns {Array<Object>}
   */
  static createMainMenu() {
    return [
      {
        name: `${colors.primary("📬")} Serviço/empresas: Denúncia de phishing para hospedagem, registradores e afins.`,
        value: "companies_menu",
        short: "Serviços/Empresas",
      },
      {
        name: `${colors.warning("🛡️")} VirusTotal: Contatos para Falsos Positivos`,
        value: "virustotal_fp",
        short: "VirusTotal FP",
      },
      {
        name: `${colors.danger("🚨")} Denúncia Rápida`,
        value: "quick_report",
        short: "Denúncia Rápida",
      },
      new inquirer.Separator(colors.muted('─'.repeat(30))),
      {
        name: `${colors.info("ℹ️")} Sobre o RavCat`,
        value: "about",
        short: "Sobre",
      },
      {
        name: `${colors.danger("❌")} Sair`,
        value: "exit",
        short: "Sair"
      }
    ];
  }

  /**
   * 🏠 Cria rodapé padrão para todos os menus
   * @static
   * @method createFooter
   * @returns {Array<Object>}
   */
  static createFooter() {
    return [
      new inquirer.Separator(colors.muted('─'.repeat(30))),
      {
        name: `${colors.text("🏠")} Menu Principal`,
        value: "menu",
        short: "Menu Principal"
      },
      {
        name: `${colors.danger("❌")} Sair`,
        value: "exit",
        short: "Sair"
      }
    ];
  }

  /**
   * 📊 Cria lista de empresas para seleção
   * @static
   * @method createCompaniesMenu
   * @param {Array<Object>} companies
   * @returns {Array<Object>}
   */
  static createCompaniesMenu(companies) {
    const companyChoices = companies.map((company, index) => {
      const number = (index + 1).toString().padStart(2, " ");
      return {
        name: `${number}. ${company.icon} ${colors.back(company.name)} - ${colors.muted(company.type)}`,
        value: company.key,
        short: company.name,
      };
    });

    return [
      ...companyChoices,
      ...MenuRenderer.createFooter()
    ];
  }

  /**
   * 🔄 Cria opções após visualizar detalhes de empresa
   * @static
   * @method createActionMenu
   * @returns {Array<Object>}
   */
  static createActionMenu() {
    return [
      {
        name: `${colors.action("🔍")} Consultar outra empresa`,
        value: "another",
        short: "Outra empresa",
      },
      {
        name: `${colors.primary("📋")} Voltar à lista`,
        value: "back",
        short: "Voltar à lista",
      },
      ...MenuRenderer.createFooter()
    ];
  }

  /**
   * 🛡️ Cria menu específico para opções do VirusTotal
   * @static
   * @method createVTMenu
   * @returns {Array<Object>}
   */
  static createVTMenu() {
    return [
      {
        name: `${colors.primary("📋")} Ver lista completa de vendors`,
        value: "list_all",
        short: "Lista completa"
      },
      {
        name: `${colors.action("🔍")} Buscar vendor específico`,
        value: "search_vendor",
        short: "Buscar vendor"
      },
      {
        name: `${colors.info("📄")} Gerar lista em TXT`,
        value: "generate_txt",
        short: "Gerar TXT"
      },
      ...MenuRenderer.createFooter()
    ];
  }

  /**
   * 🎯 Cria ações após visualizar vendor do VirusTotal
   * @static
   * @method createVTActionMenu
   * @returns {Array<Object>}
   */
  static createVTActionMenu() {
    return [
      {
        name: `${colors.action("🔍")} Consultar outro vendor`,
        value: "another",
        short: "Outro vendor"
      },
      {
        name: `${colors.primary("📋")} Voltar à lista`,
        value: "back",
        short: "Voltar à lista"
      },
      ...MenuRenderer.createFooter()
    ];
  }

  /**
   * 🔍 Cria campo de busca para empresas/vendors
   * @static
   * @method createSearchPrompt
   * @returns {Array<Object>}
   */
  static createSearchPrompt() {
    return [
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
    ];
  }
}

module.exports = MenuRenderer;