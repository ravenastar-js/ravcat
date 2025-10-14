const { writeFileSync } = require('fs');
const { join } = require('path');

/**
 * 📄 Gerador de lista em TXT do RavCat com formato correto
 * @class TxtGenerator
 */
class TxtGenerator {
    constructor(companies) {
        this.companies = companies;
        this.projectRoot = process.cwd();
    }

    /**
     * 📝 Gera arquivo TXT formatado
     * @method generateTxtFile
     * @returns {Object} Resultado da geração
     */
    generateTxtFile() {
        try {
            const fileName = `ravcat-r1-${new Date().toISOString().split('T')[0]}.txt`;
            const filePath = join(this.projectRoot, fileName);

            const content = this.generateContent();

            writeFileSync(filePath, content, 'utf8');

            return {
                success: true,
                filePath: filePath,
                fileName: fileName
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🎨 Gera conteúdo formatado do TXT
     * @method generateContent
     * @returns {string} Conteúdo formatado
     */
    generateContent() {
        const sortedCompanies = Object.keys(this.companies).sort();

        let content = '';

        content += this.generateHeader();
        content += this.generateCompaniesByCategory(sortedCompanies);
        content += this.generateAlphabeticalList(sortedCompanies);

        return content;
    }

    /**
     * 🏁 Gera cabeçalho do arquivo
     * @method generateHeader
     * @returns {string} Cabeçalho formatado
     */
    generateHeader() {
        return `🚀 RAVCAT - LISTA COMPLETA DE SERVIÇOS/EMPRESAS
Sistema de Consulta para Denúncias

${'-'.repeat(55)}

📅 Data de geração: ${new Date().toLocaleString('pt-BR')}
Feito com 💚 por RavenaStar
🔗 https://ravenastar.link

✨ Gerado automaticamente via RavCat
🚀 https://github.com/ravenastar-js/ravcat

${'-'.repeat(55)}

`;
    }

    /**
     * 🏢 Categoriza empresas por tipo de contato
     * @method generateCompaniesByCategory
     * @param {Array<string>} companies - Lista de empresas
     * @returns {string} Conteúdo categorizado
     */
    generateCompaniesByCategory(companies) {
        const categories = {
            '📧 E-mail': [],
            '🌐 Formulário': [],
            '📋 Múltiplos': []
        };

        companies.forEach(companyKey => {
            const company = this.companies[companyKey];
            if (company.type === 'email') {
                categories['📧 E-mail'].push(companyKey);
            } else if (company.type === 'form') {
                categories['🌐 Formulário'].push(companyKey);
            } else if (company.type === 'multiple') {
                categories['📋 Múltiplos'].push(companyKey);
            }
        });

        let content = ``;

        for (const [category, companiesList] of Object.entries(categories)) {
            if (companiesList.length > 0) {
                content += `${category} (${companiesList.length} empresas)\n`;
                content += `${'─'.repeat(40)}\n\n`;

                companiesList.forEach((companyKey, index) => {
                    const company = this.companies[companyKey];

                    content += `   ${(index + 1).toString().padStart(2, ' ')}. ${companyKey}\n`;

                    if (company.type === 'email') {
                        if (company.message_pt) {
                            content += `      💡 ${company.message_pt}\n`;
                        }
                        content += `      📧 ${company.contact}\n`;
                    }
                    else if (company.type === 'form') {
                        if (company.message_pt) {
                            content += `      💡 ${company.message_pt}\n`;
                        }
                        content += `      🌐 ${company.contact}\n`;
                    }
                    else if (company.type === 'multiple') {
                        if (company.message_pt) {
                            content += `      📬 ${company.message_pt}\n\n`;
                        }
                        company.contacts.forEach((contact, contactIndex) => {
                            const emoji = contact.type === 'email' ? '📧' : '🌐';
                            if (contact.description_pt) {
                                content += `      💡 ${contact.description_pt}\n`;
                            }
                            content += `      ${emoji} ${contact.contact}\n`;
                            if (contactIndex < company.contacts.length - 1) {
                                content += `      ${'·'.repeat(37)}\n`;
                            }
                        });
                    }

                    content += `\n`;
                });

                content += `\n`;
            }
        }

        return content;
    }

    /**
     * 🔤 Gera lista alfabética completa
     * @method generateAlphabeticalList
     * @param {Array<string>} companies - Lista de empresas
     * @returns {string} Lista alfabética
     */
    generateAlphabeticalList(companies) {
        let content = `🔤 LISTA ALFABÉTICA COMPLETA\n`;
        content += `${'-'.repeat(55)}\n\n`;

        companies.forEach((companyKey, index) => {
            const company = this.companies[companyKey];
            const number = (index + 1).toString().padStart(2, ' ');
            const icon = this.getCompanyIcon(company);
            const type = this.getCompanyType(company);

            content += `  ${number}. ${icon} ${companyKey} - ${type}\n`;
        });

        content += `\n${'-'.repeat(55)}\n\n`;
        return content;
    }

    /**
     * 🏷️ Obtém ícone da empresa baseado no tipo
     * @method getCompanyIcon
     * @param {Object} company - Dados da empresa
     * @returns {string} Ícone representativo
     */
    getCompanyIcon(company) {
        if (company.type === 'email') return '📧';
        if (company.type === 'form') return '🌐';
        if (company.type === 'multiple') return '📋';
        return '🏢';
    }

    /**
     * 📝 Obtém descrição do tipo de contato
     * @method getCompanyType
     * @param {Object} company - Dados da empresa
     * @returns {string} Descrição do tipo
     */
    getCompanyType(company) {
        if (company.type === 'email') return 'E-mail';
        if (company.type === 'form') return 'Formulário';
        if (company.type === 'multiple') return 'Múltiplos Canais';
        return 'Contato';
    }
}

module.exports = TxtGenerator;