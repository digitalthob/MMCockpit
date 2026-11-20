// js/pdf.js — PDF-Export der Buchungsliste mit jsPDF.
// jsPDF wird lazily vom CDN geladen (keine feste Abhängigkeit, nur beim Export).
// Läuft offline nur eingeschränkt – der Export braucht dann Internet für das CDN.
import { state, vehicleName, statusLabel, parseDT, fmtDate } from "./core.js";

const JSPDF_CDN = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

let jspdfPromise = null;
function loadJsPDF() {
  if (window.jspdf) return Promise.resolve(window.jspdf.jsPDF);
  if (jspdfPromise) return jspdfPromise;
  jspdfPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = JSPDF_CDN;
    s.onload = () => resolve(window.jspdf.jsPDF);
    s.onerror = () => reject(new Error("jsPDF konnte nicht geladen werden (CDN offline?)."));
    document.head.appendChild(s);
  });
  return jspdfPromise;
}

// Exportiert die aktuell im Listenfilter sichtbaren Buchungen als PDF-Tabelle.
export async function exportPDF() {
  let jsPDF;
  try {
    jsPDF = await loadJsPDF();
  } catch (e) {
    alert("PDF-Export fehlgeschlagen: " + e.message + "\nLade die Seite mit Internetverbindung und versuche es erneut.");
    return;
  }

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 32;
  let y = margin;

  // Kopf
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Makermobile – Buchungsübersicht", margin, y);
  y += 18;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Erstellt: ${new Date().toLocaleString("de-DE")}`, margin, y);
  y += 22;

  // Spalten
  const cols = [
    { title: "Fahrzeug", w: 110 },
    { title: "Von", w: 110 },
    { title: "Bis", w: 110 },
    { title: "Person", w: 130 },
    { title: "Organisation", w: 130 },
    { title: "Kontakt", w: 110 },
    { title: "Status", w: 80 },
    { title: "Notiz", w: 130 },
  ];
  const rowH = 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setFillColor(37, 99, 235);
  doc.setTextColor(255, 255, 255);
  doc.rect(margin, y, pageW - margin * 2, rowH, "F");
  let x = margin + 6;
  cols.forEach((c) => { doc.text(c.title, x, y + 11); x += c.w; });
  y += rowH;

  // Zeilen
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 41, 59);
  const bookings = [...state.bookings].sort((a, b) => parseDT(a.from) - parseDT(b.from));
  bookings.forEach((b, i) => {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    if (i % 2 === 0) {
      doc.setFillColor(246, 247, 249);
      doc.rect(margin, y, pageW - margin * 2, rowH, "F");
    }
    const vals = [
      vehicleName(b.vehicleId),
      fmtDate(parseDT(b.from)),
      fmtDate(parseDT(b.to)),
      b.person || "",
      b.organisation || "",
      b.contact || "",
      statusLabel(b.status),
      b.note || "",
    ];
    x = margin + 6;
    vals.forEach((v, j) => {
      doc.text(String(v).slice(0, Math.floor(cols[j].w / 4.5)), x, y + 11);
      x += cols[j].w;
    });
    y += rowH;
  });

  doc.save("makermobile-buchungen.pdf");
}
