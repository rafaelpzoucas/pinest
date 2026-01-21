// escpos-builder.ts
const ESC = "\x1B";
const GS = "\x1D";

enum Align {
  LEFT = 0,
  CENTER = 1,
  RIGHT = 2,
}

enum TextSize {
  NORMAL = 0x00,
  DOUBLE_WIDTH = 0x10,
  LARGE = 0x11,
  EXTRA_LARGE = 0x22,
}

const DEFAULT_WIDTH = 47;

/**
 * Remove acentos e caracteres especiais
 */
function removeAccents(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ªº°]/g, "");
}

/**
 * Evita quebra de palavras no meio mantendo-as sempre juntas
 */
function wrapText(text: string, maxWidth = DEFAULT_WIDTH): string {
  const words = text.split(" ");
  let result = "";
  let currentLine = "";

  words.forEach((word) => {
    if (currentLine.length === 0) {
      currentLine = word;
    } else if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += " " + word;
    } else {
      result += currentLine + "\n";
      currentLine = word;
    }
  });

  if (currentLine.length > 0) {
    result += currentLine;
  }

  return result;
}

/**
 * Cria uma linha com duas colunas: label (esquerda) e value (direita)
 * Útil para dados de cliente
 */
function createRow(
  label: string,
  value: string,
  width = DEFAULT_WIDTH,
): string {
  const cleanLabel = removeAccents(String(label).trim());
  const cleanValue = removeAccents(String(value).trim());

  const combined = `${cleanLabel}: ${cleanValue}`;

  // Se couber na mesma linha
  if (combined.length <= width) {
    const padding = width - combined.length;
    return cleanLabel + ": " + cleanValue + " ".repeat(padding);
  }

  // Se não couber, quebra em duas linhas
  return `${cleanLabel}:\n${cleanValue}`;
}

/**
 * Cria múltiplas linhas de label: value
 */
function createRows(
  items: Array<{ label: string; value: string }>,
  width = DEFAULT_WIDTH,
): string {
  return items
    .map((item) => createRow(item.label, item.value, width))
    .join("\n");
}

/**
 * Cria uma linha de produto com quantidade, nome e valor
 * Formato: "QTD x PRODUTO........................R$ VALOR"
 */
function createProductLine(
  quantity: number | string,
  name: string,
  price?: number | string,
  width = DEFAULT_WIDTH,
): string {
  const cleanName = removeAccents(String(name).trim());
  const qtyText = `${quantity}x`;

  // Se não tem preço, só retorna qtd e nome
  if (price === undefined || price === null || price === "") {
    const text = `${qtyText} ${cleanName}`;
    return text + " ".repeat(Math.max(0, width - text.length));
  }

  const priceText =
    typeof price === "number"
      ? `R$ ${price.toFixed(2).replace(".", ",")}`
      : `R$ ${price}`;

  const leftPart = `${qtyText} ${cleanName}`;
  const rightPart = priceText;

  // Calcula quantos pontos/espaços precisa no meio
  const dotsNeeded = width - leftPart.length - rightPart.length;

  if (dotsNeeded <= 1) {
    // Se não couber na mesma linha, quebra
    return `${leftPart}\n${" ".repeat(width - rightPart.length)}${rightPart}`;
  }

  const dots = ".".repeat(dotsNeeded);
  return `${leftPart}${dots}${rightPart}`;
}

/**
 * Formata um valor monetário
 */
function formatMoney(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

function strong(): string {
  return `${ESC}E\x01`;
}

function endStrong(): string {
  return `${ESC}E\x00`;
}

function underline(text: string): string {
  return `${ESC}-\x01${text}${ESC}-\x00`;
}

function size(code: number, text: string): string {
  return `${GS}!${String.fromCharCode(code)}${text}${GS}!${String.fromCharCode(0x00)}`;
}

function align(code: number): string {
  return `${ESC}a${String.fromCharCode(code)}`;
}

function createTable(
  columns: Array<{
    title: string;
    width: number;
    align?: "left" | "right" | "center";
  }>,
  rows: Array<Array<string | number>>,
): string {
  const lines: string[] = [];

  const alignCell = (
    text: string,
    width: number,
    align: "left" | "right" | "center" = "left",
  ): string => {
    const cleanText = removeAccents(String(text).trim());
    const textLength = cleanText.length;

    if (textLength >= width) {
      return cleanText.substring(0, width);
    }

    const padding = width - textLength;

    switch (align) {
      case "right":
        return " ".repeat(padding) + cleanText;
      case "center":
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return " ".repeat(leftPad) + cleanText + " ".repeat(rightPad);
      default:
        return cleanText + " ".repeat(padding);
    }
  };

  const headerRow = columns
    .map((col) =>
      alignCell(removeAccents(col.title), col.width, col.align || "left"),
    )
    .join("");
  lines.push(headerRow);

  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
  lines.push("-".repeat(Math.min(totalWidth, DEFAULT_WIDTH)));

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

export function receipt() {
  const buffer: string[] = [];

  const api = {
    left() {
      buffer.push(align(Align.LEFT));
      return api;
    },

    center() {
      buffer.push(align(Align.CENTER));
      return api;
    },

    right() {
      buffer.push(align(Align.RIGHT));
      return api;
    },

    h1(text: string) {
      const wrappedText = wrapText(removeAccents(text));
      buffer.push(size(TextSize.EXTRA_LARGE, removeAccents(wrappedText)));
      buffer.push(size(TextSize.NORMAL, ""));
      return api;
    },

    h2(text: string) {
      const wrappedText = wrapText(removeAccents(text));
      buffer.push(size(TextSize.LARGE, removeAccents(wrappedText)));
      buffer.push(size(TextSize.NORMAL, ""));
      return api;
    },

    h3(text: string) {
      const wrappedText = wrapText(removeAccents(text));
      buffer.push(size(TextSize.DOUBLE_WIDTH, removeAccents(wrappedText)));
      buffer.push(size(TextSize.NORMAL, ""));
      return api;
    },

    customSize(sizeCode: number, text: string) {
      buffer.push(size(sizeCode, removeAccents(text)));
      return api;
    },

    text(text: string) {
      const wrappedText = wrapText(removeAccents(text));
      buffer.push(removeAccents(wrappedText));
      return api;
    },

    p(text: string) {
      const wrappedText = wrapText(removeAccents(text));
      buffer.push(size(TextSize.NORMAL, removeAccents(wrappedText)));
      return api;
    },

    strong() {
      buffer.push(strong());
      return api;
    },

    endStrong() {
      buffer.push(endStrong());
      return api;
    },

    underline(text: string) {
      const wrappedText = wrapText(removeAccents(text));
      buffer.push(underline(removeAccents(wrappedText)));
      return api;
    },

    br(lines = 1) {
      buffer.push("\n".repeat(lines));
      return api;
    },

    hr(width = DEFAULT_WIDTH, type: "dashed" | "solid" | "double" = "dashed") {
      const chars = {
        dashed: "-",
        solid: "_",
        double: "=",
      };

      const effectiveWidth = Math.min(width, DEFAULT_WIDTH);
      const line = chars[type].repeat(effectiveWidth);

      buffer.push(`\n${line}\n`);
      return api;
    },

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
     * Adiciona uma linha formatada label: value
     */
    row(label: string, value: string, width = DEFAULT_WIDTH) {
      buffer.push(createRow(label, value, width));
      return api;
    },

    /**
     * Adiciona múltiplas linhas formatadas
     */
    rows(
      items: Array<{ label: string; value: string }>,
      width = DEFAULT_WIDTH,
    ) {
      buffer.push(createRows(items, width));
      return api;
    },

    /**
     * Adiciona uma linha de produto
     */
    productLine(
      quantity: number | string,
      name: string,
      price?: number | string,
      width = DEFAULT_WIDTH,
    ) {
      buffer.push(createProductLine(quantity, name, price, width));
      return api;
    },

    /**
     * Adiciona um valor monetário formatado
     */
    money(label: string, value: number, width = DEFAULT_WIDTH) {
      buffer.push(createRow(label, formatMoney(value), width));
      return api;
    },

    resetFormatting() {
      buffer.push(`${ESC}@`);
      return api;
    },

    initialize() {
      buffer.push(`${ESC}@`);
      buffer.push(`${ESC}R\x00`);
      return api;
    },

    cut(full = true, feedLines = 5) {
      buffer.push(`${ESC}d${String.fromCharCode(feedLines)}`);
      buffer.push(`${GS}V${String.fromCharCode(full ? 0 : 1)}`);
      return api;
    },

    feed(lines = 1) {
      buffer.push("\n".repeat(lines));
      return api;
    },

    beep() {
      buffer.push(`${ESC}B\x03\x02`);
      return api;
    },

    build(): string {
      return buffer.join("");
    },

    end() {
      return api;
    },
  };

  api.initialize();
  return api;
}

// Helpers exportados para uso externo
export const helpers = {
  removeAccents,
  wrapText,
  createRow,
  createRows,
  createProductLine,
  formatMoney,
  DEFAULT_WIDTH,
};
