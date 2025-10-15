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

/**
 * 📦 Renderiza caixas e cards para exibição no terminal
 * @class BoxRenderer
 */
class BoxRenderer {
  constructor() {
    this.terminalWidth = process.stdout.columns || 80;
  }

  /**
   * 🎨 Cria card estilizado com informações da empresa
   * @method createCompanyCard
   * @param {string} companyName
   * @param {Object} company
   * @returns {string}
   */
  createCompanyCard(companyName, company) {
    const width = Math.min(this.terminalWidth - 8, 70);
    const contentWidth = width - 6;
    
    let contentLines = [];
    
    contentLines.push(colors.title.bold(`🏢 ${companyName.toUpperCase()}`));
    contentLines.push(colors.muted('─'.repeat(contentWidth - 2)));
    contentLines.push('');

    if (company.message_pt) {
      const message = this.wrapText(company.message_pt, contentWidth);
      contentLines.push(colors.text(message));
      contentLines.push('');
    }

    if (company.type === 'email') {
      contentLines.push(colors.success('📧 ') + colors.subtitle('E-mail de Denúncia:'));
      contentLines.push(colors.contact('  ' + company.contact));
    } 
    else if (company.type === 'form') {
      contentLines.push(colors.success('🌐 ') + colors.subtitle('Formulário Online:'));
      contentLines.push(colors.contact('  ' + company.contact));
    } 
    else if (company.type === 'multiple') {
      contentLines.push(colors.success('📋 ') + colors.subtitle('Canais de Denúncia:'));
      contentLines.push('');
      
      company.contacts.forEach((contact, index) => {
        const emoji = contact.type === 'email' ? '📧' : '🌐';
        const typeName = contact.type === 'email' ? 'E-mail' : 'Formulário';
        
        contentLines.push(colors.highlight(`${emoji} Opção ${index + 1} (${typeName}):`));
        
        if (contact.description_pt) {
          const desc = this.wrapText(contact.description_pt, contentWidth - 4);
          contentLines.push(colors.description('  ' + desc));
        }
        
        contentLines.push(colors.contact('  ' + contact.contact));
        
        if (index < company.contacts.length - 1) {
          contentLines.push(colors.muted('  ─' + '─'.repeat(contentWidth - 6)));
        }
        contentLines.push('');
      });
    }

    contentLines.push(colors.muted('─'.repeat(contentWidth - 2)));
    contentLines.push(colors.highlight2('💡 Denúncias responsáveis ajudam a manter a internet segura!'));

    const content = contentLines.join('\n');

    return boxen(content, {
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
      margin: 1,
      borderStyle: 'round',
      borderColor: '#57f287',
      backgroundColor: '#1a1a1a',
      width: width,
      textAlignment: 'left',
    });
  }

  /**
   * 🎨 Cria caixa decorativa para qualquer conteúdo
   * @method createBox
   * @param {string} content
   * @param {Object} options
   * @returns {string}
   */
  createBox(content, options = {}) {
    if (!boxen || typeof boxen !== 'function') {
      return content;
    }

    const defaultOptions = {
      padding: 1,
      margin: 1,
      borderColor: '#57f287',
      borderStyle: 'round',
      backgroundColor: '#1a1a1a',
      width: Math.min(this.terminalWidth - 8, 70),
      textAlignment: 'center',
      float: 'center',
    };

    return boxen(content, { ...defaultOptions, ...options });
  }

  /**
   * 📝 Quebra texto longo em múltiplas linhas
   * @method wrapText
   * @param {string} text
   * @param {number} maxWidth
   * @returns {string}
   */
  wrapText(text, maxWidth) {
    if (!text || typeof text !== 'string') return text;

    const lines = text.split('\n');
    const processedLines = [];

    for (const line of lines) {
      const cleanLine = line.replace(/\s+/g, ' ').trim();

      if (!cleanLine) {
        processedLines.push('');
        continue;
      }

      if (cleanLine.length <= maxWidth) {
        processedLines.push(this.formatUrls(cleanLine));
        continue;
      }

      const words = cleanLine.split(' ');
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testLinePlain = this.stripAnsiCodes(testLine);

        if (testLinePlain.length <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            processedLines.push(this.formatUrls(currentLine));
          }

          if (this.isUrl(word) || word.includes('ID:')) {
            processedLines.push(this.formatUrls(word));
            currentLine = '';
          } else if (this.stripAnsiCodes(word).length > maxWidth) {
            const chunks = this.breakLongWord(word, maxWidth);
            processedLines.push(...chunks.map((chunk) => this.formatUrls(chunk)));
            currentLine = '';
          } else {
            currentLine = word;
          }
        }
      }

      if (currentLine) {
        processedLines.push(this.formatUrls(currentLine));
      }
    }

    return processedLines.join('\n');
  }

  /**
   * 🔗 Verifica se o texto é uma URL válida
   * @method isUrl
   * @param {string} text
   * @returns {boolean}
   */
  isUrl(text) {
    return text.startsWith('http://') || text.startsWith('https://');
  }

  /**
   * 🧹 Remove códigos de cor ANSI do texto
   * @method stripAnsiCodes
   * @param {string} str
   * @returns {string}
   */
  stripAnsiCodes(str) {
    if (!str) return '';
    return String(str).replace(/\u001b\[[0-9;]*m/g, '');
  }

  /**
   * 🌐 Aplica formatação especial para URLs
   * @method formatUrls
   * @param {string} text
   * @returns {string}
   */
  formatUrls(text) {
    const urlRegex = /(https?:\/\/[^\s<]+[^\s<.)])/g;
    return text.replace(urlRegex, (url) => colors.link(url));
  }

  /**
   * ✂️ Divide palavras muito longas em partes menores
   * @method breakLongWord
   * @param {string} word
   * @param {number} maxWidth
   * @returns {Array<string>}
   */
  breakLongWord(word, maxWidth) {
    const plainWord = this.stripAnsiCodes(word);
    const chunks = [];

    for (let i = 0; i < plainWord.length; i += maxWidth) {
      chunks.push(word.substring(i, Math.min(i + maxWidth, word.length)));
    }

    return chunks;
  }
}

module.exports = BoxRenderer;