const chalk = require("chalk");
const configLoader = require("./config-loader");

const colorConfig = configLoader.getColors();

/**
 * 🎨 Gerencia todas as cores usadas no terminal
 * @namespace colors
 */
const colors = {
  primary: chalk.hex(colorConfig.primary || "#06D6A0"),
  option: chalk.hex(colorConfig.secondary || "#FFD166"),
  action: chalk.hex(colorConfig.action || "#57f287"),
  danger: chalk.hex(colorConfig.danger || "#EF476F"),
  info: chalk.hex(colorConfig.info || "#118AB2"),
  title: chalk.hex(colorConfig.title || "#57f287"),
  subtitle: chalk.hex(colorConfig.subtitle || "#FFFFFF"),
  highlight: chalk.hex(colorConfig.highlight || "#F18F01"),
  highlight2: chalk.hex(colorConfig.highlight2 || "#f8e789"),
  text: chalk.hex(colorConfig.text || "#E9ECEF"),
  muted: chalk.hex(colorConfig.muted || "#7F8C8D"),
  link: chalk.hex(colorConfig.link || "#8ad4ff").underline,
  success: chalk.hex(colorConfig.success || "#57f287"),
  contact: chalk.hex(colorConfig.contact || "#FFE66D").underline,
  description: chalk.hex(colorConfig.description || "#95E1D3"),
  error: chalk.hex(colorConfig.error || "#EF476F").bold,
  warning: chalk.hex(colorConfig.warning || "#FFD166"),
  exit: chalk.hex(colorConfig.exit || "#ffb3ba"),
  back: chalk.hex(colorConfig.back || "#bae1ff"),
};

module.exports = { colors };