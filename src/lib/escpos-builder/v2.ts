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

function removeAccents(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ªº°]/g, "");
}

function applyQuirks(text: string, profile: PrinterProfile): string {
  let result = text;

  // Aplica CRLF se necessário
  if (profile.quirks.elginNeedsCRLF) {
    result = result.replace(/\n/g, "\r\n");
  }

  return result;
}

function wrapText(text: string, maxWidth: number): string {
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

function createRow(label: string, value: string, width: number): string {
  const cleanLabel = removeAccents(String(label).trim());
  const cleanValue = removeAccents(String(value).trim());
  const combined = `${cleanLabel}: ${cleanValue}`;

  if (combined.length <= width) {
    const padding = width - combined.length;
    return cleanLabel + ": " + cleanValue + " ".repeat(padding);
  }

  return `${cleanLabel}:\n${cleanValue}`;
}

function createProductLine(
  quantity: number | string,
  name: string,
  price?: number | string,
  width?: number,
): string {
  const cleanName = removeAccents(String(name).trim());
  const qtyText = `${quantity}x`;

  if (price === undefined || price === null || price === "") {
    const text = `${qtyText} ${cleanName}`;
    return text + " ".repeat(Math.max(0, (width ?? 48) - text.length));
  }

  const priceText =
    typeof price === "number"
      ? `R$ ${price.toFixed(2).replace(".", ",")}`
      : `R$ ${price}`;

  const leftPart = `${qtyText} ${cleanName}`;
  const rightPart = priceText;
  const dotsNeeded = (width ?? 48) - leftPart.length - rightPart.length;

  if (dotsNeeded <= 1) {
    return `${leftPart}\n${" ".repeat((width ?? 48) - rightPart.length)}${rightPart}`;
  }

  const dots = ".".repeat(dotsNeeded);
  return `${leftPart}${dots}${rightPart}`;
}

export function receipt(profile: PrinterProfile = getDefaultProfile()) {
  const buffer: string[] = [];
  const cols = profile.quirks.maxLineLength ?? profile.cols;

  // Helpers seguros (Safe wrappers)
  const safeCommand = (
    capability: keyof PrinterProfile["capabilities"],
    command: string,
  ): string => {
    return profile.capabilities[capability] ? command : "";
  };

  const api = {
    left() {
      if (profile.capabilities.align) {
        buffer.push(`${ESC}a${String.fromCharCode(Align.LEFT)}`);
      }
      return api;
    },

    center() {
      if (profile.capabilities.align) {
        buffer.push(`${ESC}a${String.fromCharCode(Align.CENTER)}`);
      }
      return api;
    },

    right() {
      if (profile.capabilities.align) {
        buffer.push(`${ESC}a${String.fromCharCode(Align.RIGHT)}`);
      }
      return api;
    },

    h1(text: string) {
      const wrappedText = wrapText(removeAccents(text), cols);
      if (
        profile.capabilities.doubleWidth &&
        profile.capabilities.doubleHeight
      ) {
        const lines = wrappedText.split("\n");
        const formatted = lines
          .map(
            (line) =>
              `${GS}!${String.fromCharCode(TextSize.EXTRA_LARGE)}${line}${GS}!${String.fromCharCode(0x00)}`,
          )
          .join("\n");
        buffer.push(formatted);
      } else {
        buffer.push(wrappedText);
      }
      return api;
    },

    h2(text: string) {
      const wrappedText = wrapText(removeAccents(text), cols);
      if (
        profile.capabilities.doubleWidth &&
        profile.capabilities.doubleHeight
      ) {
        const lines = wrappedText.split("\n");
        const formatted = lines
          .map(
            (line) =>
              `${GS}!${String.fromCharCode(TextSize.LARGE)}${line}${GS}!${String.fromCharCode(0x00)}`,
          )
          .join("\n");
        buffer.push(formatted);
      } else {
        buffer.push(wrappedText);
      }
      return api;
    },

    h3(text: string) {
      const wrappedText = wrapText(removeAccents(text), cols);
      if (profile.capabilities.doubleWidth) {
        const lines = wrappedText.split("\n");
        const formatted = lines
          .map(
            (line) =>
              `${GS}!${String.fromCharCode(TextSize.DOUBLE_WIDTH)}${line}${GS}!${String.fromCharCode(0x00)}`,
          )
          .join("\n");
        buffer.push(formatted);
      } else {
        buffer.push(wrappedText);
      }
      return api;
    },

    text(text: string) {
      const wrappedText = wrapText(removeAccents(text), cols);
      buffer.push(wrappedText);
      return api;
    },

    p(text: string) {
      const wrappedText = wrapText(removeAccents(text), cols);
      buffer.push(wrappedText);
      return api;
    },

    strong() {
      if (profile.capabilities.bold && !profile.quirks.brokenBoldCommand) {
        buffer.push(`${ESC}E\x01`);
      }
      return api;
    },

    endStrong() {
      if (profile.capabilities.bold && !profile.quirks.brokenBoldCommand) {
        buffer.push(`${ESC}E\x00`);
      }
      return api;
    },

    underline(text: string) {
      const wrappedText = wrapText(removeAccents(text), cols);
      if (profile.capabilities.underline) {
        buffer.push(`${ESC}-\x01${wrappedText}${ESC}-\x00`);
      } else {
        buffer.push(wrappedText);
      }
      return api;
    },

    br(lines = 1) {
      buffer.push("\n".repeat(lines));
      return api;
    },

    hr(width?: number, type: "dashed" | "solid" | "double" = "dashed") {
      const chars = {
        dashed: "-",
        solid: "_",
        double: "=",
      };

      const effectiveWidth = Math.min(width ?? cols, cols);
      const line = chars[type].repeat(effectiveWidth);
      buffer.push(`\n${line}\n`);
      return api;
    },

    table(
      columns: Array<{
        title: string;
        width?: number;
        flex?: number;
        align?: "left" | "right" | "center";
      }>,
      rows: Array<Array<string | number>>,
    ) {
      const maxWidth = cols;

      /**
       * 1. Calcula largura fixa e flexível
       */
      const fixedWidth = columns.reduce(
        (sum, col) => sum + (col.width ?? 0),
        0,
      );

      const flexColumns = columns.filter((c) => !c.width);
      const totalFlex = flexColumns.reduce((sum, c) => sum + (c.flex ?? 1), 0);

      const remainingWidth = Math.max(maxWidth - fixedWidth, 0);

      const computedColumns = columns.map((col) => {
        if (col.width) {
          return { ...col, computedWidth: col.width };
        }

        const flex = col.flex ?? 1;
        const proportionalWidth = Math.floor(
          (remainingWidth * flex) / totalFlex,
        );

        return {
          ...col,
          computedWidth: Math.max(proportionalWidth, 4), // largura mínima
        };
      });

      /**
       * 2. Normaliza overflow (caso soma ultrapasse maxWidth)
       */
      const totalComputed = computedColumns.reduce(
        (sum, c) => sum + c.computedWidth,
        0,
      );

      if (totalComputed > maxWidth) {
        const scale = maxWidth / totalComputed;

        computedColumns.forEach((col) => {
          col.computedWidth = Math.max(
            4,
            Math.floor(col.computedWidth * scale),
          );
        });
      }

      /**
       * Helpers
       */
      const alignCell = (
        text: string,
        width: number,
        align: "left" | "right" | "center" = "left",
      ): string => {
        const cleanText = removeAccents(String(text));
        const truncated = cleanText.slice(0, width);

        const padding = width - truncated.length;

        switch (align) {
          case "right":
            return " ".repeat(padding) + truncated;
          case "center": {
            const left = Math.floor(padding / 2);
            const right = padding - left;
            return " ".repeat(left) + truncated + " ".repeat(right);
          }
          default:
            return truncated + " ".repeat(padding);
        }
      };

      const wrapCell = (text: string, width: number) => {
        return wrapText(removeAccents(String(text)), width).split("\n");
      };

      const lines: string[] = [];

      /**
       * 3. Header
       */
      const header = computedColumns
        .map((col) => alignCell(col.title, col.computedWidth, col.align))
        .join("");

      lines.push(header);
      lines.push("-".repeat(Math.min(maxWidth, header.length)));

      /**
       * 4. Rows com multiline wrapping
       */
      rows.forEach((row) => {
        const wrappedCells = computedColumns.map((col, index) => {
          const value = row[index] ?? "";
          return wrapCell(String(value), col.computedWidth);
        });

        const maxLines = Math.max(...wrappedCells.map((c) => c.length));

        for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
          const line = computedColumns
            .map((col, colIndex) => {
              const cellLine = wrappedCells[colIndex][lineIndex] ?? "";
              return alignCell(cellLine, col.computedWidth, col.align);
            })
            .join("");

          lines.push(line);
        }
      });

      buffer.push(lines.join("\n"));
      return api;
    },

    row(label: string, value: string, width?: number) {
      buffer.push(createRow(label, value, width ?? cols));
      return api;
    },

    rows(items: Array<{ label: string; value: string }>, width?: number) {
      buffer.push(
        items
          .map((item) => createRow(item.label, item.value, width ?? cols))
          .join("\n"),
      );
      return api;
    },

    productLine(
      quantity: number | string,
      name: string,
      price?: number | string,
      width?: number,
    ) {
      buffer.push(createProductLine(quantity, name, price, width ?? cols));
      return api;
    },

    money(label: string, value: number, width?: number) {
      const formatted = `R$ ${value.toFixed(2).replace(".", ",")}`;
      buffer.push(createRow(label, formatted, width ?? cols));
      return api;
    },

    initialize() {
      buffer.push(`${ESC}@`);
      buffer.push(`${ESC}R\x00`);
      return api;
    },

    cut(full = true, feedLines?: number) {
      const extraFeed = profile.quirks.needsExtraFeedBeforeCut ?? 3;
      const totalFeed = feedLines ?? extraFeed;

      buffer.push(`${ESC}d${String.fromCharCode(totalFeed)}`);

      if (profile.capabilities.cut) {
        if (profile.quirks.alternativeCutCommand) {
          buffer.push(profile.quirks.alternativeCutCommand);
        } else {
          const cutType = full ? 0 : 1;
          if (!full && !profile.capabilities.partialCut) {
            buffer.push(`${GS}V${String.fromCharCode(0)}`);
          } else {
            buffer.push(`${GS}V${String.fromCharCode(cutType)}`);
          }
        }
      }
      return api;
    },

    feed(lines = 1) {
      buffer.push("\n".repeat(lines));
      return api;
    },

    beep() {
      if (profile.capabilities.beep) {
        buffer.push(`${ESC}B\x03\x02`);
      }
      return api;
    },

    qrCode(data: string, size = 6) {
      if (profile.capabilities.qrCode) {
        // Implementar comando QR Code ESC/POS
        // Isso varia por fabricante, então pode precisar de quirks
      }
      return api;
    },

    build(): string {
      let result = buffer.join("");
      result = applyQuirks(result, profile);
      return result;
    },
  };

  if (profile.quirks.needsInitBeforeEveryPrint) {
    api.initialize();
  }

  return api;
}

export const helpers = {
  removeAccents,
  wrapText,
  createRow,
  createProductLine,
};

import { PrinterProfile } from "@/features/printers/profiles/schemas";
// Re-exportar para manter compatibilidade
import { getDefaultProfile } from "@/features/printers/profiles/base-profiles";
