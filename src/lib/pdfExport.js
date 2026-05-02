import { jsPDF } from 'jspdf'

const INK = [15, 23, 42]
const FILAMENT = [249, 115, 22]
const SLATE = [100, 116, 139]
const LIGHT = [248, 250, 252]
const WHITE = [255, 255, 255]

function fmt(n) {
  return (
    new Intl.NumberFormat('nb-NO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n) + ' kr'
  )
}

function fmtTime(hours) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} t`
  return `${h} t ${m} min`
}

function row(doc, label, value, y) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...INK)
  doc.text(label, 16, y)
  doc.text(value, 194, y, { align: 'right' })
}

function boldRow(doc, label, value, y) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...INK)
  doc.text(label, 16, y)
  doc.text(value, 194, y, { align: 'right' })
}

function divider(doc, y) {
  doc.setDrawColor(226, 232, 240)
  doc.line(14, y, 196, y)
}

export function exportCalculationPDF(data) {
  const doc = new jsPDF()
  const now = new Date().toLocaleDateString('nb-NO')

  // Header bar
  doc.setFillColor(...INK)
  doc.rect(0, 0, 210, 24, 'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('SlicePrice — Prisrapport', 14, 15)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(180, 190, 200)
  doc.text(now, 196, 15, { align: 'right' })

  let y = 35

  // Product name
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(data.productName || 'Ukjent produkt', 14, y)
  y += 7

  if (data.customerName) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...SLATE)
    doc.text(`Kunde: ${data.customerName}`, 14, y)
    y += 6
  }

  y += 5

  // Job specs
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...SLATE)
  const specs = [
    `Filament: ${data.filamentName} — ${data.filamentGrams} g`,
    `Printtid: ${fmtTime(data.totalPrintHours)}`,
    `Arbeidstid: ${data.laborMinutes} min`,
    `Antall: ${data.quantity}`,
  ]
  for (const spec of specs) {
    doc.text(spec, 14, y)
    y += 5
  }

  y += 7

  // Section header
  doc.setFillColor(...LIGHT)
  doc.rect(12, y - 5, 186, 9, 'F')
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('Kostnadsbrekkdown', 14, y)
  y += 7

  divider(doc, y)
  y += 6

  const costRows = [
    ['Materialkostnad', fmt(data.costs.material)],
    ['Strømkostnad', fmt(data.costs.electricity)],
    ['Maskinslitasje', fmt(data.costs.depreciation)],
    ['Arbeidskostnad', fmt(data.costs.labor)],
    ['Svinnbuffer', fmt(data.costs.failureBuffer)],
  ]
  for (const [label, value] of costRows) {
    row(doc, label, value, y)
    y += 6
  }

  y += 2
  divider(doc, y)
  y += 6

  boldRow(doc, 'Subtotal', fmt(data.costs.subtotal), y)
  y += 8

  row(doc, 'Fortjeneste', fmt(data.costs.marginAmount), y)
  y += 10

  // Suggested price highlight
  doc.setFillColor(255, 247, 237)
  doc.rect(12, y - 5, 186, 13, 'F')
  doc.setTextColor(...FILAMENT)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text('Foreslått pris', 16, y + 2)
  doc.text(fmt(data.costs.suggestedPrice), 193, y + 2, { align: 'right' })
  y += 16

  if (data.quantity > 1 && data.costs.pricePerUnit) {
    doc.setTextColor(...INK)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(
      `Pris per stk (${data.quantity} stk): ${fmt(data.costs.pricePerUnit)}`,
      14,
      y,
    )
    y += 8
  }

  if (data.note) {
    y += 4
    doc.setTextColor(...SLATE)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    const lines = doc.splitTextToSize(`Notat: ${data.note}`, 180)
    doc.text(lines, 14, y)
  }

  doc.save(`sliceprice-kalkulator-${Date.now()}.pdf`)
}

export function exportQuotePDF(data) {
  const doc = new jsPDF()
  const now = new Date().toLocaleDateString('nb-NO')

  // Header bar
  doc.setFillColor(...INK)
  doc.rect(0, 0, 210, 24, 'F')
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(data.companyName || 'SlicePrice', 14, 15)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(180, 190, 200)
  doc.text(now, 196, 15, { align: 'right' })

  let y = 35

  // Label
  doc.setTextColor(...SLATE)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('TILBUD', 14, y)
  y += 8

  // Product name
  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(data.productName || 'Produkt', 14, y)
  y += 8

  if (data.customerName) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...SLATE)
    doc.text(`Til: ${data.customerName}`, 14, y)
    y += 6
  }

  y += 8

  // Price table
  doc.setFillColor(...LIGHT)
  doc.rect(12, y - 4, 186, 22, 'F')

  doc.setTextColor(...SLATE)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Antall', 18, y + 3)
  doc.text('Totalpris', 90, y + 3)
  if (data.quantity > 1) doc.text('Pris per stk', 148, y + 3)

  y += 9

  doc.setTextColor(...INK)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`${data.quantity} stk`, 18, y + 3)

  doc.setTextColor(...FILAMENT)
  doc.setFontSize(14)
  doc.text(fmt(data.suggestedPrice), 90, y + 3)

  if (data.quantity > 1 && data.pricePerUnit) {
    doc.setTextColor(...INK)
    doc.setFontSize(11)
    doc.text(fmt(data.pricePerUnit), 148, y + 3)
  }

  y += 20

  if (data.note) {
    doc.setTextColor(...SLATE)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    const lines = doc.splitTextToSize(data.note, 180)
    doc.text(lines, 14, y)
    y += lines.length * 5 + 8
  }

  // Footer
  doc.setFillColor(...LIGHT)
  doc.rect(0, 282, 210, 15, 'F')
  doc.setTextColor(...SLATE)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(
    `Tilbud generert ${now} av ${data.companyName || 'SlicePrice'}`,
    14,
    291,
  )

  doc.save(`sliceprice-tilbud-${Date.now()}.pdf`)
}
