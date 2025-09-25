// src/utils/etiquetas.js
import jsPDF from "jspdf";
import JsBarcode from "jsbarcode";

/**
 * Etiqueta 10x15 cm (vertical) con:
 * - Título
 * - Número de envío (texto grande)
 * - Datos de remitente y destinatario
 * - Código de barras CODE128 AL FINAL (debajo de los datos)
 */
export function downloadEtiquetaPDF({ numeroEnvio, remitenteNombre, destinatario }) {
  // Medidas en milímetros
  const WIDTH = 100;   // 10 cm
  const HEIGHT = 150;  // 15 cm
  const M = 8;         // margen
  const W = WIDTH - M * 2;

  const doc = new jsPDF({
    unit: "mm",
    format: [WIDTH, HEIGHT],
    orientation: "portrait",
  });

  // Marco (opcional)
  doc.setDrawColor(0);
  doc.setLineWidth(0.6);
  doc.rect(2, 2, WIDTH - 4, HEIGHT - 4);

  // Encabezado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Etiqueta de Envío", WIDTH / 2, M + 6, { align: "center" });

  // Número de envío (texto grande)
  const codeStr = String(numeroEnvio || "").toUpperCase();
  doc.setFontSize(28);
  doc.text(codeStr, WIDTH / 2, M + 20, { align: "center" });

  // Separador
  doc.setLineWidth(0.4);
  doc.line(M, M + 24, WIDTH - M, M + 24);

  // ----- Datos -----
  let y = M + 32;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  doc.text(`Remitente: ${remitenteNombre || "-"}`, M, y);
  y += 8;

  const d = destinatario || {};
  const dirWrapped = doc.splitTextToSize(`Dir: ${d.direccion || "-"}`, W);
  const locLine = `Loc: ${d.localidad || "-"}  •   ${d.zona || "-"}`;
  const telLine = d.telefono ? `Tel: ${d.telefono}` : null;

  doc.text(`Dest: ${d.nombre || "-"}`, M, y); y += 7;
  doc.text(dirWrapped, M, y); y += 7 + (dirWrapped.length - 1) * 6;
  doc.text(locLine, M, y); y += 7;
  if (telLine) { doc.text(telLine, M, y); y += 7; }

  // Reservar espacio para pie
  const FOOTER_H = 10;     // alto del footer
  const GAP_ABOVE_BAR = 6; // espacio antes del barcode

  // ----- Código de barras AL FINAL -----
  try {
    // Altura máxima del código sin pisar el pie
    let barTop = y + GAP_ABOVE_BAR;
    let maxBarHeight = HEIGHT - M - FOOTER_H - barTop;
    // Asegurar altura mínima razonable
    const BAR_MIN = 16;  // mm
    const BAR_MAX = 28;  // mm (para no excederse)
    let barHeight = Math.max(BAR_MIN, Math.min(BAR_MAX, maxBarHeight));

    // Si no hay lugar suficiente, subimos el código
    if (barHeight < BAR_MIN) {
      barHeight = BAR_MIN;
      barTop = HEIGHT - M - FOOTER_H - barHeight;
      if (barTop < y + 2) barTop = y + 2; // última defensa
    }

    // Generar el barcode en canvas
    const canvas = document.createElement("canvas");
    // Para buena calidad, generamos en px ~ 3x mm
    const pxWidth = Math.round(W * 3);
    const pxHeight = Math.round(barHeight * 3);

    JsBarcode(canvas, codeStr, {
      format: "CODE128",
      displayValue: false,
      margin: 0,
      width: 2,                // grosor de barra (px)
      height: pxHeight,        // alto del código (px)
      background: "#ffffff",
      lineColor: "#000000",
    });

    const dataURL = canvas.toDataURL("image/png");
    doc.addImage(dataURL, "PNG", M, barTop, W, barHeight);

    // Pie
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(`Creado: ${new Date().toLocaleDateString()}`, M, HEIGHT - M);
  } catch (err) {
    console.error("Error generando código de barras:", err);

    // Fallback sin barcode
    doc.setFontSize(10);
    doc.setTextColor(90);
    doc.text(`Creado: ${new Date().toLocaleDateString()}`, M, HEIGHT - M);
  }

  doc.save(`ETIQUETA_${codeStr}.pdf`);
}
