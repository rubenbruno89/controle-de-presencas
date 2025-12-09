import { jsPDF } from "jspdf";

export function generatePdf(rooms, totals) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 15;
  let y = margin;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Controle de Presenças", margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("Helvetica", "normal");
  const dateStr = new Date().toLocaleString();
  doc.text(`Gerado em: ${dateStr}`, margin, y);
  y += 10;

  doc.setFont("Helvetica", "bold");
  doc.text("Sala", margin, y);
  doc.text("Presentes", margin + 70, y);
  doc.text("Ausentes", margin + 105, y);
  doc.text("Total", margin + 140, y);
  y += 5;
  doc.setLineWidth(0.2);
  doc.line(margin, y, 195 - margin, y);
  y += 4;

  doc.setFont("Helvetica", "normal");

  rooms.forEach((room) => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
    const total = room.presentes + room.ausentes;
    doc.text(String(room.name), margin, y);
    doc.text(String(room.presentes), margin + 70, y, { align: "left" });
    doc.text(String(room.ausentes), margin + 105, y, { align: "left" });
    doc.text(String(total), margin + 140, y, { align: "left" });
    y += 6;
  });

  y += 6;
  doc.setLineWidth(0.3);
  doc.line(margin, y, 195 - margin, y);
  y += 6;
  doc.setFont("Helvetica", "bold");
  doc.text(`Total presentes: ${totals.presentes}`, margin, y);
  y += 5;
  doc.text(`Total ausentes: ${totals.ausentes}`, margin, y);
  y += 5;
  doc.text(`Total geral: ${totals.geral}`, margin, y);

  doc.save("controle-presencas.pdf");
}

