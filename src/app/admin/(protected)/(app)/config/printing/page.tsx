import { readStore } from '../(options)/layout/actions'
import { readPrinters, readPrintingSettings } from './actions'
import { AutoPrint } from './auto-print'
import { Extension } from './extension'
import { FontSizeSelector } from './font-size'
import PingButton from './ping'
import { Printers } from './printers'

export default async function PrintingPage() {
  const [[storeData], [printSettingsData], [printersData]] = await Promise.all([
    readStore(),
    readPrintingSettings(),
    readPrinters(),
  ])

  const printSettings = printSettingsData?.printingSettings
  const printers = printersData?.printers
  const store = storeData?.store

  return (
    <div className="py-8 space-y-6">
      <PingButton />
      <Extension storeId={store?.id} />
      <AutoPrint printSettings={printSettings} />
      <Printers printers={printers} />
      <FontSizeSelector printSettings={printSettings} />
    </div>
  )
}
