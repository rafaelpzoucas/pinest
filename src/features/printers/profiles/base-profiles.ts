// lib/printer/profiles/base-profiles.ts
import {
  PrinterProfile,
  PrinterProfileSchema,
} from "@/features/printers/profiles/schemas";

export const GENERIC_PROFILE = PrinterProfileSchema.parse({
  id: "generic-escpos",
  name: "Generic ESC/POS",
  manufacturer: "Generic",
  cols: 48,
  encoding: "cp850",
  version: 1,
  isBuiltIn: true,
  capabilities: {
    bold: true,
    underline: true,
    cut: true,
    partialCut: true,
    beep: true,
    qrCode: false,
    barcode: false,
    logo: false,
    cashdrawer: true,
    doubleWidth: true,
    doubleHeight: true,
    invert: false,
    align: true,
  },
  quirks: {
    needsExtraFeedBeforeCut: 3,
  },
});

export const BEMATECH_MP4200_PROFILE = PrinterProfileSchema.parse({
  id: "bematech-mp4200",
  name: "Bematech MP-4200 TH",
  manufacturer: "Bematech",
  model: "MP-4200 TH",
  cols: 48,
  encoding: "cp850",
  version: 1,
  isBuiltIn: true,
  capabilities: {
    bold: true,
    underline: true,
    cut: true,
    partialCut: true,
    beep: true,
    qrCode: true,
    barcode: true,
    logo: true,
    cashdrawer: true,
    doubleWidth: true,
    doubleHeight: true,
    invert: true,
    align: true,
  },
  quirks: {
    needsExtraFeedBeforeCut: 5,
    bematechDoubleFeed: true,
    needsInitBeforeEveryPrint: true,
  },
});

export const ELGIN_I9_PROFILE = PrinterProfileSchema.parse({
  id: "elgin-i9",
  name: "Elgin i9",
  manufacturer: "Elgin",
  model: "i9",
  cols: 48,
  encoding: "cp850",
  version: 1,
  isBuiltIn: true,
  capabilities: {
    bold: true,
    underline: true,
    cut: true,
    partialCut: true,
    beep: true,
    qrCode: true,
    barcode: true,
    logo: true,
    cashdrawer: true,
    doubleWidth: true,
    doubleHeight: true,
    invert: true,
    align: true,
  },
  quirks: {
    needsExtraFeedBeforeCut: 4,
    elginNeedsCRLF: true,
  },
});

export const EPSON_TM_T20_PROFILE = PrinterProfileSchema.parse({
  id: "epson-tm-t20",
  name: "Epson TM-T20",
  manufacturer: "Epson",
  model: "TM-T20",
  cols: 48,
  encoding: "cp850",
  version: 1,
  isBuiltIn: true,
  capabilities: {
    bold: true,
    underline: true,
    cut: true,
    partialCut: true,
    beep: true,
    qrCode: true,
    barcode: true,
    logo: true,
    cashdrawer: true,
    doubleWidth: true,
    doubleHeight: true,
    invert: true,
    align: true,
  },
  quirks: {
    needsExtraFeedBeforeCut: 3,
  },
});

export const BUILT_IN_PROFILES: PrinterProfile[] = [
  GENERIC_PROFILE,
  BEMATECH_MP4200_PROFILE,
  ELGIN_I9_PROFILE,
  EPSON_TM_T20_PROFILE,
];

export function getProfileById(id: string): PrinterProfile | undefined {
  return BUILT_IN_PROFILES.find((p) => p.id === id);
}

export function getDefaultProfile(): PrinterProfile {
  return GENERIC_PROFILE;
}
