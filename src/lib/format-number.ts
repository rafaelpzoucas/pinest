export function formatCurrency(number: number, currency = 'pt-BR') {
  const formattedNumber = new Intl.NumberFormat(currency, {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(number)

  return formattedNumber
}
