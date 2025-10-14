const { writeFileSync } = require('fs');
const { join } = require('path');

/**
 * 📄 Gera arquivos TXT com lista de contatos do VirusTotal
 * @class VTTxtGenerator
 */
class VTTxtGenerator {
    constructor(vtData) {
        this.vtData = vtData;
        this.projectRoot = process.cwd();
    }

    /**
     * 📝 Cria arquivo TXT no diretório atual
     * @method generateTxtFile
     * @returns {Object}
     */
    generateTxtFile() {
        try {
            const fileName = `ravcat-vt-${new Date().toISOString().split('T')[0]}.txt`;
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
     * 🎨 Monta todo o conteúdo do arquivo TXT
     * @method generateContent
     * @returns {string}
     */
    generateContent() {
        const vendors = Object.keys(this.vtData.companies).sort();

        let content = '';

        content += this.generateHeader();
        content += this.generateVendorsList(vendors);

        return content;
    }

    /**
     * 🏁 Cria cabeçalho com informações importantes
     * @method generateHeader
     * @returns {string}
     */
    generateHeader() {
        return `🛡️ VIRUSTOTAL - LISTA DE CONTATOS PARA FALSOS POSITIVOS
Contatos oficiais de vendors para reportar falsos positivos

${'-'.repeat(70)}

📅 Data de geração: ${new Date().toLocaleString('pt-BR')}
🔗 Fonte oficial: ${this.vtData.source}
✨ Gerado automaticamente via RavCat
🚀 https://github.com/ravenastar-js/ravcat

💡 INSTRUÇÕES IMPORTANTES:
• VirusTotal é um agregador de dados de diversos vendors
• Entre em contato com o VENDOR ESPECÍFICO que está gerando o falso positivo
• Sempre inclua o link do relatório do VirusTotal na sua solicitação
• Seja claro e objetivo na descrição do problema

${'-'.repeat(70)}

`;
    }

    /**
     * 📋 Cria lista completa de vendors com contatos
     * @method generateVendorsList
     * @param {Array<string>} vendors
     * @returns {string}
     */
    generateVendorsList(vendors) {
        let content = `📋 LISTA COMPLETA DE VENDORS (${vendors.length})\n`;
        content += `${'='.repeat(50)}\n\n`;

        vendors.forEach((vendorName, index) => {
            const vendor = this.vtData.companies[vendorName];
            const number = (index + 1).toString().padStart(3, ' ');
            const type = this.getVendorTypeDescription(vendor.type);

            content += `  ${number}. ${vendorName} - ${type}\n`;

            vendor.contacts.forEach((contactObj, contactIndex) => {
                const icon = contactObj.type === 'email' ? '📧' : '🌐';
                content += `      ${contactIndex + 1}. [${icon}] ${contactObj.contact}\n`;
            });

            content += `\n`;
        });

        content += `${'='.repeat(50)}\n`;
        return content;
    }

    /**
     * 📝 Retorna descrição do tipo de vendor
     * @method getVendorTypeDescription
     * @param {string} type
     * @returns {string}
     */
    getVendorTypeDescription(type) {
        if (type === "email") return "E-mail";
        if (type === "form") return "Formulário Online";
        if (type === "multiple") return "Múltiplos Canais";
        return "Contato";
    }
}

module.exports = VTTxtGenerator;