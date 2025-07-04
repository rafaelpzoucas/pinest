import { readPrinters, readPrintingSettings } from './actions'
import { Extension } from './extension'
import { FontSizeSelector } from './font-size'
import { Printers } from './printers'

export default async function PrintingPage() {
  const [[printSettingsData], [printersData]] = await Promise.all([
    readPrintingSettings(),
    readPrinters(),
  ])

  const printSettings = printSettingsData?.printingSettings
  const printers = printersData?.printers

  return (
    <div className="pb-16 p-4 lg:px-0 space-y-6">
      <Extension />
      {/* <AutoPrint printSettings={printSettings} /> */}
      <Printers printers={printers} />
      <FontSizeSelector printSettings={printSettings} />
    </div>
  )
}
