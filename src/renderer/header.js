const { readFileSync } = require('fs');
const { join } = require('path');

/**
 * 📦 Obtém versão do package.json
 * @returns {string} 🏷️ Versão da aplicação ou 'BETA' como fallback
 * @throws {Error} 🚨 Se não conseguir ler ou parsear o package.json
 */

function getVersion() {
  try {
    const packagePath = join(__dirname, '..', '..', 'package.json');
    return JSON.parse(readFileSync(packagePath, 'utf8')).version || 'BETA';
  } catch (error) {
    return 'BETA';
  }
}

var version = getVersion()

const figlet = require("figlet");
let boxen;
try {
  boxen = require("boxen");
  if (boxen && typeof boxen === "object" && boxen.default) {
    boxen = boxen.default;
  }
} catch (error) {
  console.log("[v0] Erro ao importar boxen:", error.message);
}

const { colors } = require("../config/colors");
const CONSTANTS = require("../config/constants");

/**
 * 🎨 Cria e exibe cabeçalhos estilizados no terminal
 * @class HeaderRenderer
 */
class HeaderRenderer {
  constructor() {
    this.terminalWidth = process.stdout.columns || 80;
  }

  /**
   * 🎨 Mostra o cabeçalho principal com banner ASCII
   * @method displayHeader
   * @returns {void}
   */
  displayHeader() {
    this.clearConsole();

    if (!boxen || typeof boxen !== "function") {
      this.displaySimpleHeader();
      return;
    }

    try {

      const bannerText = figlet.textSync("RAVCAT", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
      });

      const content = [
        "",
        colors.action(bannerText),
        colors.highlight2(`🌱 v${version}`),
        "",
        colors.subtitle("🔍 Sistema de Consulta de Contatos"),
        "",
        colors.text("Feito com ") + colors.danger("💚") + colors.text(" por ") + colors.primary.bold("RavenaStar"),
        colors.text("🔗 ") + colors.link("https://ravenastar.link"),
        "",
        colors.text("📱 Compatível com Termux"),
        colors.text("⚡ Rápido • Preciso • 🔧 Confiável"),
        "",
      ].join("\n");

      const box = boxen(content, {
        padding: 1,
        margin: 1,
        borderColor: "#57f287",
        borderStyle: "classic",
        backgroundColor: "#1a1a1a",
        width: Math.min(this.terminalWidth - 8, 80),
        textAlignment: "center",
      });

      console.log(box);
      console.log("");
    } catch (error) {
      this.displaySimpleHeader();
    }
  }

  /**
   * 📺 Mostra cabeçalho simplificado sem dependências
   * @method displaySimpleHeader
   * @returns {void}
   */
  displaySimpleHeader() {
    console.log(colors.title("╔══════════════════════════════════════════════════════════════╗"));
    console.log(colors.title("║ 🚨 RAVCAT CLI                                                ║"));
    console.log(colors.title("║ Sistema de Consulta de Contatos              ║"));
    console.log(colors.title("╚══════════════════════════════════════════════════════════════╝"));
    console.log(colors.highlight2(`🌱 v${version}`));
    console.log(colors.text("Feito com 💚 por RavenaStar"));
    console.log("");
  }

  /**
   * 🧹 Limpa a tela do terminal de forma segura
   * @method clearConsole
   * @returns {void}
   */
  clearConsole() {
    try {
      console.clear();
    } catch (error) {
      process.stdout.write("\x1Bc");
    }
  }
}

module.exports = HeaderRenderer;
