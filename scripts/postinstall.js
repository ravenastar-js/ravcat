#!/usr/bin/env node

const { execSync } = require('child_process');

/**
 * 🔧 Executa configurações após a instalação do pacote
 * @function runPostInstall
 * @returns {void}
 */
function runPostInstall() {
    console.log('\x1b[32m%s\x1b[0m', '\n🔧 RavCat - Configuração Pós-Instalação\n');
    
    try {
        console.log('\x1b[34m%s\x1b[0m', '📦 Verificando dependências...');
        
        const dependencies = ['chalk', 'inquirer', 'axios', 'figlet', 'boxen'];
        let allInstalled = true;
        
        dependencies.forEach(dep => {
            try {
                require.resolve(dep);
                console.log('\x1b[32m%s\x1b[0m', `  ✅ ${dep}`);
            } catch (error) {
                console.log('\x1b[33m%s\x1b[0m', `  ❌ ${dep} - Instalando...`);
                try {
                    execSync(`npm install ${dep}`, { stdio: 'inherit' });
                    console.log('\x1b[32m%s\x1b[0m', `  ✅ ${dep} instalado`);
                } catch (installError) {
                    console.log('\x1b[31m%s\x1b[0m', `  💥 Erro ao instalar ${dep}`);
                    allInstalled = false;
                }
            }
        });

        if (allInstalled) {
            console.log('\x1b[32m%s\x1b[0m', '\n✨ Todas as dependências estão instaladas!');
            console.log('\x1b[37m%s\x1b[0m', '🚀 Execute: ravcat para iniciar\n');
        } else {
            console.log('\x1b[33m%s\x1b[0m', '\n⚠️  Algumas dependências podem precisar de instalação manual');
            console.log('\x1b[37m%s\x1b[0m', '💡 Execute: npm install\n');
        }

    } catch (error) {
        console.log('\x1b[31m%s\x1b[0m', '❌ Erro durante a pós-instalação:', error.message);
    }
}

runPostInstall();