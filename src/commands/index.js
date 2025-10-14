const { colors } = require("../config/colors");
const configLoader = require("../config/config-loader");
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

/**
 * 📋 Obtém descrição oficial do projeto
 * @returns {string} 🚨 Descrição do package.json ou texto padrão como fallback
 */
function getDescription() {
  try {
    const packagePath = join(__dirname, '..', '..', 'package.json');
    return JSON.parse(readFileSync(packagePath, 'utf8')).description || '🚨 Ferramenta CLI para consulta de contatos oficiais';
  } catch (error) {
    return '🚨 Ferramenta CLI para consulta de contatos oficiais';
  }
}

/**
 * 🛠️ Gerencia os comandos disponíveis no terminal
 * @class Commands
 */
class Commands {
  /**
   * 🆘 Mostra todas as opções de uso do programa
   * @static
   * @method showHelp
   * @returns {void}
   */
  static showHelp() {
    const desc = getDescription();

    console.log(colors.primary(`\n${desc}\n`));

    console.log(colors.subtitle("📋 COMO USAR:"));
    console.log(colors.text("  ravcat                       - 🌀 Menu interativo"));
    console.log(colors.text("  ravcat <empresa>             - 🔍 Consulta direta de serviços/empresas"));
    console.log(colors.text("  ravcat --vt <vendor>         - 🛡️  Consulta direta VirusTotal"));
    console.log(colors.text("  ravcat --list                - 📊 Lista empresas"));
    console.log(colors.text("  ravcat --list-vt             - 📋 Lista vendors VirusTotal"));
    console.log(colors.text("  ravcat --help                - 🆘 Esta ajuda"));
    console.log(colors.text("  ravcat --version             - 🏷️ Versão\n"));

    console.log(colors.subtitle("🎯 EXEMPLOS:"));
    console.log(colors.text("  ravcat cloudflare            - 🌐 Cloudflare (Serviços)"));
    console.log(colors.text("  ravcat --vt microsoft        - 🛡️  Microsoft (VirusTotal)"));
    console.log(colors.text("  ravcat github                - 🐙 GitHub (Serviços)\n"));
  }

  /**
   * 🏷️ Mostra a versão atual e informações do autor
   * @static
   * @method showVersion
   * @returns {void}
   */
  static showVersion() {
    const version = getVersion();
    console.log(colors.highlight2(`🌱 ${version}`));
  }
}

module.exports = Commands;