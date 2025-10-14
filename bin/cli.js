#!/usr/bin/env node

/**
 * 🚀 Função principal do CLI que inicia a aplicação
 * @returns {Promise<void>}
 */
async function main() {
  try {
    await verifyAndRepairEnvironment();
    
    const Ravcat = require("../src/index.js");
    const ravcat = new Ravcat();
    const args = process.argv.slice(2);

    if (args.length > 0) {
      await handleDirectCommands(ravcat, args);
    } else {
      await ravcat.showMenu();
    }
  } catch (error) {
    if (error.message !== "User force closed the prompt") {
      console.error("❌ Erro:", error.message);
    }
    process.exit(1);
  }
}

/**
 * 🎯 Processa comandos diretos para ambas as categorias
 * @async
 * @method handleDirectCommands
 * @param {Object} ravcat - Instância do Ravcat
 * @param {Array} args - Argumentos da linha de comando
 * @returns {Promise<void>}
 */
async function handleDirectCommands(ravcat, args) {
  const firstArg = args[0].toLowerCase();
  
  // Comandos especiais
  if (firstArg === '--help' || firstArg === '-h') {
    const Commands = require("../src/commands/index");
    Commands.showHelp();
    return;
  }

  if (firstArg === '--version' || firstArg === '-v') {
    const Commands = require("../src/commands/index");
    Commands.showVersion();
    return;
  }

  if (firstArg === '--list' || firstArg === '-l') {
    await ravcat.showCompanyInfo('--list');
    return;
  }

  if (firstArg === '--list-vt' || firstArg === '-lv') {
    await ravcat.showCompanyInfo('--list-vt');
    return;
  }

  // Comando VirusTotal: --vt <vendor>
  if (firstArg === '--vt' || firstArg === '--virustotal') {
    if (args.length < 2) {
      console.log('\x1b[31m%s\x1b[0m', '❌ Por favor, especifique um vendor: ravcat --vt <vendor>');
      console.log('\x1b[33m%s\x1b[0m', '💡 Exemplo: ravcat --vt microsoft');
      return;
    }
    const vendorName = args.slice(1).join(' ').toLowerCase();
    await ravcat.showCompanyInfo(`--vt:${vendorName}`);
    return;
  }

  // Comando tradicional para serviços/empresas
  await ravcat.showCompanyInfo(firstArg);
}

/**
 * 🛠️ Verifica e repara o ambiente antes de executar a aplicação
 * @returns {Promise<void>}
 */
async function verifyAndRepairEnvironment() {
  const { execSync } = require('child_process');
  const { existsSync } = require('fs');
  const { join, dirname } = require('path');
  
  /**
   * 🔍 Verifica se as dependências estão instaladas
   * @returns {Object} Status das dependências
   */
  function checkNodeModules() {
    const projectRoot = findProjectRoot();
    const nodeModulesPath = join(projectRoot, 'node_modules');
    
    if (!existsSync(nodeModulesPath)) {
      return { exists: false, complete: false };
    }

    const criticalDeps = ['chalk', 'inquirer', 'axios', 'figlet', 'boxen'];
    const missingDeps = [];

    for (const dep of criticalDeps) {
      try {
        require.resolve(dep);
      } catch {
        missingDeps.push(dep);
      }
    }

    return {
      exists: true,
      complete: missingDeps.length === 0,
      missing: missingDeps
    };
  }

  /**
   * 📍 Encontra a raiz do projeto baseado no package.json
   * @returns {string} Caminho da raiz do projeto
   */
  function findProjectRoot() {
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
   * 📦 Instala as dependências faltando automaticamente
   * @returns {boolean} Sucesso da instalação
   */
  function installDependencies() {
    console.log('\x1b[33m%s\x1b[0m', '\n📦 Detectadas dependências faltando!');
    console.log('\x1b[36m%s\x1b[0m', '🔄 Instalando automaticamente...\n');
    
    try {
      const projectRoot = findProjectRoot();
      process.chdir(projectRoot);
      
      execSync('npm install', { 
        stdio: 'inherit',
        shell: true
      });
      
      console.log('\x1b[32m%s\x1b[0m', '\n✅ Dependências instaladas com sucesso!');
      return true;
    } catch (error) {
      console.log('\x1b[31m%s\x1b[0m', '\n❌ Erro na instalação automática:');
      console.log('\x1b[37m%s\x1b[0m', '💡 Execute manualmente: npm install');
      return false;
    }
  }

  /**
   * 🔄 Reinicia a aplicação após instalar dependências
   * @returns {void}
   */
  function restartApplication() {
    console.log('\x1b[36m%s\x1b[0m', '\n🔄 Reiniciando aplicação...\n');
    
    try {
      const process = require('child_process');
      
      if (process.platform === 'win32') {
        process.execSync(`"${process.argv[0]}" "${process.argv[1]}"`, {
          stdio: 'inherit',
          shell: true
        });
      } else {
        process.execSync(process.argv.join(' '), {
          stdio: 'inherit',
          shell: true
        });
      }
      
      process.exit(0);
    } catch (error) {
      console.log('\x1b[33m%s\x1b[0m', '\n⚠️  Reinício automático falhou, mas as dependências foram instaladas.');
      console.log('\x1b[37m%s\x1b[0m', '💡 Execute o comando novamente: ravcat\n');
      process.exit(0);
    }
  }

  const nodeModulesStatus = checkNodeModules();
  
  if (!nodeModulesStatus.exists || !nodeModulesStatus.complete) {
    if (nodeModulesStatus.missing && nodeModulesStatus.missing.length > 0) {
      console.log('\x1b[33m%s\x1b[0m', `📦 Dependências faltando: ${nodeModulesStatus.missing.join(', ')}`);
    }
    
    const success = installDependencies();
    if (!success) {
      throw new Error('Falha na instalação automática das dependências');
    }
    
    restartApplication();
  }
}

main().catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});