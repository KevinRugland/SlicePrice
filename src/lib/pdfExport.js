import { jsPDF } from 'jspdf'

export function exportToPDF({ jobName, inputs, results }) {
  const doc = new jsPDF()
  const now = new Date().toLocaleString('nb-NO')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('SlicePrice — Prisrapport', 14, 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text(`Generert: ${now}`, 14, 28)
  if (jobName) doc.text(`Jobb: ${jobName}`, 14, 34)

  doc.setTextColor(0)
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Inndata', 14, 46)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const inputLines = Object.entries(inputs).map(([k, v]) => `${k}: ${v}`)
  inputLines.forEach((line, i) => doc.text(line, 14, 54 + i * 7))

  const resultsY = 54 + inputLines.length * 7 + 10
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Resultat', 14, resultsY)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  const resultLines = Object.entries(results).map(([k, v]) => `${k}: ${v}`)
  resultLines.forEach((line, i) => doc.text(line, 14, resultsY + 8 + i * 7))

  doc.save(`sliceprice-${Date.now()}.pdf`)
}
