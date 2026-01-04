import { readPrintersCached, readPrintingSettingsCached } from "./actions";
import { Extension } from "./extension";
import { Printers } from "./printers";

export default async function PrintingPage() {
  const [[printSettingsData], [printersData]] = await Promise.all([
    readPrintingSettingsCached(),
    readPrintersCached(),
  ]);

  const printSettings = printSettingsData?.printingSettings;
  const printers = printersData?.printers;

  return (
    <div className="pb-16 p-4 lg:px-0 space-y-6">
      <Extension />
      {/* <AutoPrint printSettings={printSettings} /> */}
      <Printers printers={printers} />
      {/* <FontSizeSelector printSettings={printSettings} /> */}
    </div>
  );
}
