#!/usr/bin/env node

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join, dirname } = require('path');

/**
 * 🛠️ Verificador de Ambiente RavCat
 * @class EnvironmentChecker
 */
class EnvironmentChecker {
  constructor() {
    this.isTermux = false;
    this.isWindows = false;
    this.isLinux = false;
    this.isMacOS = false;
    this.nodeVersion = '';
    this.npmVersion = '';
  }

  /**
   * 🔍 Detecta qual plataforma está sendo executada
   * @method detectPlatform
   * @returns {void}
   */
  detectPlatform() {
    this.isTermux = process.env.TERMUX_VERSION !== undefined;
    this.isWindows = process.platform === 'win32';
    this.isLinux = process.platform === 'linux';
    this.isMacOS = process.platform === 'darwin';
  }

  /**
   * ⚡ Verifica se Node.js e NPM estão instalados
   * @method checkNodeJS
   * @returns {boolean}
   */
  checkNodeJS() {
    try {
      this.nodeVersion = process.version;
      this.npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 📦 Verifica se todas as dependências estão disponíveis
   * @method checkDependencies
   * @returns {Array<string>}
   */
  checkDependencies() {
    const dependencies = ['chalk', 'inquirer', 'axios', 'figlet', 'boxen'];
    const missing = [];

    dependencies.forEach(dep => {
      try {
        require.resolve(dep);
      } catch (error) {
        missing.push(dep);
      }
    });

    return missing;
  }

  /**
   * 📁 Verifica se node_modules existe e está completo
   * @method checkNodeModules
   * @returns {Object}
   */
  checkNodeModules() {
    const projectRoot = this.findProjectRoot();
    const nodeModulesPath = join(projectRoot, 'node_modules');
    
    if (!existsSync(nodeModulesPath)) {
      return { exists: false, complete: false };
    }

    const missingDeps = this.checkDependencies();
    return {
      exists: true,
      complete: missingDeps.length === 0,
      missing: missingDeps
    };
  }

  /**
   * 📍 Encontra a pasta raiz do projeto
   * @method findProjectRoot
   * @returns {string}
   */
  findProjectRoot() {
    let currentDir = __dirname;
    while (currentDir !== dirname(currentDir)) {
      if (existsSync(join(currentDir, 'package.json'))) {
        return currentDir;
      }
      currentDir = dirname(currentDir);
    }
    return process.cwd();
  }

  /**
   * 💻 Obtém informações sobre o terminal
   * @method getTerminalInfo
   * @returns {Object}
   */
  getTerminalInfo() {
    return {
      columns: process.stdout.columns || 80,
      rows: process.stdout.rows || 24,
      isTTY: process.stdout.isTTY,
      colorDepth: process.stdout.getColorDepth ? process.stdout.getColorDepth() : 1
    };
  }

  /**
   * 📊 Mostra os resultados da verificação de ambiente
   * @method displayCheckResults
   * @returns {void}
   */
  displayCheckResults() {
    console.log('\x1b[32m%s\x1b[0m', '\n🔍 RavCat - Verificação de Ambiente\n');
    
    console.log('\x1b[37m%s\x1b[0m', '📱 Plataforma:');
    if (this.isTermux) console.log('\x1b[32m%s\x1b[0m', '  ✅ Termux (Android)');
    else if (this.isWindows) console.log('\x1b[34m%s\x1b[0m', '  💻 Windows');
    else if (this.isLinux) console.log('\x1b[34m%s\x1b[0m', '  🐧 Linux');
    else if (this.isMacOS) console.log('\x1b[34m%s\x1b[0m', '   macOS');
    else console.log('\x1b[33m%s\x1b[0m', '  ❓ Outra plataforma');

    console.log('\x1b[37m%s\x1b[0m', '\n⚡ Node.js:');
    if (this.nodeVersion) {
      console.log('\x1b[32m%s\x1b[0m', `  ✅ Versão: ${this.nodeVersion}`);
    } else {
      console.log('\x1b[31m%s\x1b[0m', '  ❌ Node.js não encontrado!');
      console.log('\x1b[37m%s\x1b[0m', '  💡 Instale Node.js em: https://nodejs.org');
      process.exit(1);
    }

    console.log('\x1b[37m%s\x1b[0m', '\n📦 NPM:');
    if (this.npmVersion) {
      console.log('\x1b[32m%s\x1b[0m', `  ✅ Versão: ${this.npmVersion}`);
    }

    const nodeModulesStatus = this.checkNodeModules();
    console.log('\x1b[37m%s\x1b[0m', '\n📁 node_modules:');
    if (nodeModulesStatus.exists && nodeModulesStatus.complete) {
      console.log('\x1b[32m%s\x1b[0m', '  ✅ Completo e funcional');
    } else if (nodeModulesStatus.exists && !nodeModulesStatus.complete) {
      console.log('\x1b[33m%s\x1b[0m', '  ⚠️  Incompleto');
      if (nodeModulesStatus.missing) {
        console.log('\x1b[33m%s\x1b[0m', `  📦 Faltando: ${nodeModulesStatus.missing.join(', ')}`);
      }
    } else {
      console.log('\x1b[31m%s\x1b[0m', '  ❌ Não encontrado');
    }

    const missingDeps = this.checkDependencies();
    console.log('\x1b[37m%s\x1b[0m', '\n🔧 Dependências:');
    if (missingDeps.length === 0) {
      console.log('\x1b[32m%s\x1b[0m', '  ✅ Todas as dependências disponíveis');
    } else {
      console.log('\x1b[33m%s\x1b[0m', `  ⚠️  Dependências faltando: ${missingDeps.join(', ')}`);
    }

    const terminal = this.getTerminalInfo();
    console.log('\x1b[37m%s\x1b[0m', '\n💻 Terminal:');
    console.log('\x1b[34m%s\x1b[0m', `  📏 Tamanho: ${terminal.columns}x${terminal.rows}`);
    console.log('\x1b[34m%s\x1b[0m', `  🎨 Cores: ${terminal.colorDepth > 1 ? 'Suportadas' : 'Limitadas'}`);
    console.log('\x1b[34m%s\x1b[0m', `  📟 TTY: ${terminal.isTTY ? 'Sim' : 'Não'}`);

    console.log('\x1b[32m%s\x1b[0m', '\n✨ Ambiente verificado com sucesso!');
    console.log('\x1b[37m%s\x1b[0m', '🚀 Execute: ravcat para iniciar\n');
  }

  /**
   * 🚀 Executa toda a verificação de ambiente
   * @method run
   * @returns {void}
   */
  run() {
    this.detectPlatform();
    
    if (!this.checkNodeJS()) {
      console.log('\x1b[31m%s\x1b[0m', '❌ Node.js não está instalado!');
      console.log('\x1b[37m%s\x1b[0m', '💡 Instale Node.js em: https://nodejs.org');
      process.exit(1);
    }

    this.displayCheckResults();
  }
}

if (require.main === module) {
  const checker = new EnvironmentChecker();
  checker.run();
}

module.exports = {
  EnvironmentChecker
};