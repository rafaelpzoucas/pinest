// escpos-builder.ts
const ESC = "\x1B"; // Caractere de escape para comandos ESC/POS
const GS = "\x1D"; // Caractere de grupo separador para comandos ESC/POS

// Enum para códigos de alinhamento
enum Align {
  LEFT = 0, // Alinhamento à esquerda
  CENTER = 1, // Alinhamento centralizado
  RIGHT = 2, // Alinhamento à direita
}

enum TextSize {
  NORMAL = 0x00, // Tamanho normal (1x1)
  DOUBLE_WIDTH = 0x10, // Texto com largura dupla
  LARGE = 0x11, // Texto com altura e largura duplas (2x2)
  EXTRA_LARGE = 0x22, // Texto grande (pode variar por impressora)
}

const DEFAULT_WIDTH = 47;

/**
 * Remove acentos e caracteres especiais
 * @param text Texto a ser normalizado
 * @returns Texto sem acentos
 */
function removeAccents(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ªº°]/g, "");
}

/**
 * Evita quebra de palavras no meio mantendo-as sempre juntas
 * @param text Texto a ser processado
 * @param maxWidth Largura máxima da linha (padrão: 48 para impressoras térmicas)
 * @returns Texto formatado com quebras de linha inteligentes
 */
function wrapText(text: string, maxWidth = DEFAULT_WIDTH): string {
  const words = text.split(" ");
  let result = "";
  let currentLine = "";

  words.forEach((word) => {
    if (currentLine.length === 0) {
      // Primeira palavra da linha
      currentLine = word;
    } else if (currentLine.length + word.length + 1 <= maxWidth) {
      // Adiciona à linha atual se couber
      currentLine += " " + word;
    } else {
      // Quebra de linha necessária
      result += currentLine + "\n";
      currentLine = word;
    }
  });

  // Adiciona a última linha
  if (currentLine.length > 0) {
    result += currentLine;
  }

  return result;
}

/**
 * Ativa o modo negrito para os próximos textos
 * @returns Comando ESC/POS para iniciar negrito
 */
function strong(): string {
  return `${ESC}E\x01`;
}

/**
 * Desativa o modo negrito
 * @returns Comando ESC/POS para encerrar negrito
 */
function endStrong(): string {
  return `${ESC}E\x00`;
}

/**
 * Aplica formatação de sublinhado ao texto
 * @param text Texto a ser formatado
 * @returns Texto com comandos ESC/POS para sublinhado
 */
function underline(text: string): string {
  return `${ESC}-\x01${text}${ESC}-\x00`;
}

/**
 * Define o tamanho do texto conforme código ESC/POS
 * @param code Código de tamanho (ver enum TextSize)
 * @param text Texto a ser formatado
 * @returns Texto com comandos ESC/POS para tamanho especificado
 */
function size(code: number, text: string): string {
  return `${GS}!${String.fromCharCode(code)}${text}${GS}!${String.fromCharCode(0x00)}`;
}

/**
 * Define o alinhamento do texto conforme código ESC/POS
 * @param code Código de alinhamento (ver enum Align)
 * @returns Comando ESC/POS para alinhamento especificado
 */
function align(code: number): string {
  return `${ESC}a${String.fromCharCode(code)}`;
}

/**
 * Cria uma tabela formatada para impressão térmica
 * @param columns Configuração das colunas (título, largura, alinhamento)
 * @param rows Dados a serem exibidos
 * @returns String formatada como tabela
 */
function createTable(
  columns: Array<{
    title: string;
    width: number;
    align?: "left" | "right" | "center";
  }>,
  rows: Array<Array<string | number>>,
): string {
  const lines: string[] = [];

  // Função auxiliar para alinhar texto em uma célula
  const alignCell = (
    text: string,
    width: number,
    align: "left" | "right" | "center" = "left",
  ): string => {
    // Remove acentos ANTES de qualquer processamento
    const cleanText = removeAccents(String(text).trim());

    // Conta o comprimento real (sem acentos)
    const textLength = cleanText.length;

    // Se o texto for maior que a largura, trunca
    if (textLength >= width) {
      return cleanText.substring(0, width);
    }

    // Calcula padding necessário
    const padding = width - textLength;

    switch (align) {
      case "right":
        return " ".repeat(padding) + cleanText;
      case "center":
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return " ".repeat(leftPad) + cleanText + " ".repeat(rightPad);
      default: // left
        return cleanText + " ".repeat(padding);
    }
  };

  // Cabeçalho (remove acentos)
  const headerRow = columns
    .map((col) =>
      alignCell(removeAccents(col.title), col.width, col.align || "left"),
    )
    .join("");
  lines.push(headerRow);

  // Linha separadora (limitada ao DEFAULT_WIDTH)
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
  lines.push("-".repeat(Math.min(totalWidth, DEFAULT_WIDTH)));

  // Linhas de dados
  rows.forEach((row) => {
    const dataRow = columns
      .map((col, index) => {
        const cellValue = row[index] !== undefined ? row[index] : "";
        return alignCell(String(cellValue), col.width, col.align || "left");
      })
      .join("");
    lines.push(dataRow);
  });

  return lines.join("\n");
}

/**
 * Cria um builder para gerar comandos ESC/POS para impressão de recibos
 * @returns Objeto com API fluente para construção de recibos
 */
export function receipt() {
  const buffer: string[] = []; // Buffer para acumular os comandos ESC/POS

  const api = {
    /**
     * Define o alinhamento à esquerda para os próximos textos
     * @returns A própria instância para encadeamento
     */
    left() {
      buffer.push(align(Align.LEFT));
      return api;
    },

    /**
     * Define o alinhamento centralizado para os próximos textos
     * @returns A própria instância para encadeamento
     */
    center() {
      buffer.push(align(Align.CENTER));
      return api;
    },

    /**
     * Define o alinhamento à direita para os próximos textos
     * @returns A própria instância para encadeamento
     */
    right() {
      buffer.push(align(Align.RIGHT));
      return api;
    },

    /**
     * Adiciona um cabeçalho nível 1 (centralizado, texto grande)
     * @param text Texto do cabeçalho
     * @returns A própria instância para encadeamento
     */
    h1(text: string) {
      const wrappedText = wrapText(removeAccents(text));
      buffer.push(size(TextSize.EXTRA_LARGE, removeAccents(wrappedText)));
      buffer.push(size(TextSize.NORMAL, "")); // Reset size
      return api;
    },

    /**
     * Adiciona um cabeçalho nível 2
     * @param text Texto do cabeçalho
     * @returns A própria instância para encadeamento
     */
    h2(text: string) {
      const wrappedText = wrapText(removeAccents(text));
      buffer.push(size(TextSize.LARGE, removeAccents(wrappedText)));
      buffer.push(size(TextSize.NORMAL, "")); // Reset size
      return api;
    },

    /**
     * Adiciona um cabeçalho nível 3
     * @param text Texto do cabeçalho
     * @returns A própria instância para encadeamento
     */
    h3(text: string) {
      const wrappedText = wrapText(removeAccents(text));
      buffer.push(size(TextSize.DOUBLE_WIDTH, removeAccents(wrappedText)));
      buffer.push(size(TextSize.NORMAL, "")); // Reset size
      return api;
    },

    /**
     * Método para tamanho customizado
     * @param sizeCode Código de tamanho personalizado
     * @param text Texto a ser formatado
     * @returns A própria instância para encadeamento
     */
    customSize(sizeCode: number, text: string) {
      buffer.push(size(sizeCode, removeAccents(text)));
      return api;
    },

    /**
     * Adiciona texto simples (sem formatação especial)
     * @param text Texto a ser adicionado
     * @returns A própria instância para encadeamento
     */
    text(text: string) {
      const wrappedText = wrapText(removeAccents(text));
      buffer.push(removeAccents(wrappedText));
      return api;
    },

    /**
     * Adiciona um parágrafo (texto com tamanho normal)
     * @param text Texto do parágrafo (opcional)
     * @returns A própria instância para encadeamento
     */
    p(text: string) {
      const wrappedText = wrapText(removeAccents(text));
      buffer.push(size(TextSize.NORMAL, removeAccents(wrappedText)));
      return api;
    },

    /**
     * Ativa o modo negrito
     * @returns A própria instância para encadeamento
     */
    strong() {
      buffer.push(strong());
      return api;
    },

    /**
     * Desativa o modo negrito
     * @returns A própria instância para encadeamento
     */
    endStrong() {
      buffer.push(endStrong());
      return api;
    },

    /**
     * Adiciona texto sublinhado
     * @param text Texto a ser formatado
     * @returns A própria instância para encadeamento
     */
    underline(text: string) {
      const wrappedText = wrapText(removeAccents(text));
      buffer.push(underline(removeAccents(wrappedText)));
      return api;
    },

    /**
     * Adiciona quebras de linha
     * @param lines Número de quebras de linha (padrão: 1)
     * @returns A própria instância para encadeamento
     */
    br(lines = 1) {
      buffer.push("\n".repeat(lines));
      return api;
    },

    /**
     * Adiciona uma linha horizontal
     * @param width Largura da linha (padrão: 46)
     * @param type Tipo de linha ('dashed', 'solid' ou 'double')
     * @returns A própria instância para encadeamento
     */
    hr(width = 48, type: "dashed" | "solid" | "double" = "dashed") {
      const chars = {
        dashed: "-",
        solid: "_",
        double: "=",
      };

      const effectiveWidth = Math.min(width, 48);
      const line = chars[type].repeat(effectiveWidth);

      // Adiciona quebra antes, a linha e quebra depois
      buffer.push(`\n${line}\n`);

      return api;
    },

    /**
     * Adiciona uma tabela formatada
     * @param columns Configuração das colunas
     * @param rows Dados da tabela
     * @returns A própria instância para encadeamento
     */
    table(
      columns: Array<{
        title: string;
        width: number;
        align?: "left" | "right" | "center";
      }>,
      rows: Array<Array<string | number>>,
    ) {
      buffer.push(createTable(columns, rows));
      return api;
    },

    /**
     * Reseta toda a formatação
     * @returns A própria instância para encadeamento
     */
    resetFormatting() {
      buffer.push(`${ESC}@`);
      return api;
    },

    /**
     * Inicializa a impressora
     * @returns A própria instância para encadeamento
     */
    initialize() {
      buffer.push(`${ESC}@`); // Inicializa a impressora
      buffer.push(`${ESC}R\x00`); // Português Brasil
      return api;
    },

    /**
     * Executa corte do papel
     * @param full Corte completo (true) ou parcial (false)
     * @param feedLines Linhas a avançar antes do corte (padrão: 5)
     * @returns A própria instância para encadeamento
     */
    cut(full = true, feedLines = 5) {
      // Alimenta papel antes do corte
      buffer.push(`${ESC}d${String.fromCharCode(feedLines)}`);

      // Comando de corte mais compatível
      buffer.push(`${GS}V${String.fromCharCode(full ? 0 : 1)}`);

      return api;
    },

    /**
     * Avança o papel (similar a br, mas com semântica diferente)
     * @param lines Número de linhas a avançar
     * @returns A própria instância para encadeamento
     */
    feed(lines = 1) {
      buffer.push("\n".repeat(lines));
      return api;
    },

    /**
     * Emite um beep na impressora
     * @returns A própria instância para encadeamento
     */
    beep() {
      buffer.push(`${ESC}B\x03\x02`);
      return api;
    },

    /**
     * Constrói o comando ESC/POS final
     * @returns String com todos os comandos concatenados
     */
    build(): string {
      return buffer.join("");
    },

    /**
     * Finaliza a cadeia de métodos (método vazio para melhorar legibilidade)
     * @returns A própria instância para encadeamento
     */
    end() {
      return api;
    },
  };

  // Inicializa a impressora por padrão
  api.initialize();
  return api;
}
