import JSZip from "jszip";
import { jsPDF } from "jspdf";
import katex from "katex";
import type { ApunteNota } from "../types/academic";

/**
 * Replaces illegal filename characters for safe filesystem saving
 */
export const sanitizeFilename = (name: string): string => {
  return (
    name
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, " ")
      .trim() || "apunte"
  );
};

// Helper to escape HTML characters
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Inline formatting helper: **bold**, *italic*, `code`, and $katex$
const renderInlineHtml = (text: string): string => {
  const parts: string[] = [];
  const regex = /(\$[^$]+\$|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const segments = text.split(regex);

  segments.forEach((seg) => {
    if (!seg) return;
    if (seg.startsWith("$") && seg.endsWith("$") && seg.length > 2) {
      const formula = seg.slice(1, -1);
      try {
        parts.push(katex.renderToString(formula, { throwOnError: false }));
      } catch {
        parts.push(`<code>${escapeHtml(formula)}</code>`);
      }
    } else if (seg.startsWith("`") && seg.endsWith("`") && seg.length > 2) {
      parts.push(
        `<code class="inline-code">${escapeHtml(seg.slice(1, -1))}</code>`,
      );
    } else if (seg.startsWith("**") && seg.endsWith("**") && seg.length > 4) {
      parts.push(`<strong>${escapeHtml(seg.slice(2, -2))}</strong>`);
    } else if (seg.startsWith("*") && seg.endsWith("*") && seg.length > 2) {
      parts.push(`<em>${escapeHtml(seg.slice(1, -1))}</em>`);
    } else {
      parts.push(escapeHtml(seg));
    }
  });

  return parts.join("");
};

/**
 * Parses markdown text into styled HTML blocks
 */
export const renderMarkdownBodyHtml = (markdown: string): string => {
  const lines = markdown.split("\n");
  const htmlParts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block ```
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      htmlParts.push(
        `<div class="code-container"><div class="code-lang">${escapeHtml(
          lang || "código",
        )}</div><pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre></div>`,
      );
      continue;
    }

    // KaTeX block $$
    if (line.trim().startsWith("$$")) {
      const mathLines: string[] = [];
      if (line.trim().endsWith("$$") && line.trim().length > 4) {
        mathLines.push(line.trim().slice(2, -2).trim());
        i++;
      } else {
        i++;
        while (i < lines.length && !lines[i].trim().endsWith("$$")) {
          mathLines.push(lines[i]);
          i++;
        }
        i++; // skip closing $$
      }
      const formula = mathLines.join("\n");
      try {
        const mathHtml = katex.renderToString(formula, {
          displayMode: true,
          throwOnError: false,
        });
        htmlParts.push(`<div class="math-container">${mathHtml}</div>`);
      } catch {
        htmlParts.push(
          `<div class="math-container"><pre>${escapeHtml(formula)}</pre></div>`,
        );
      }
      continue;
    }

    // Blockquote / Callout >
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      htmlParts.push(
        `<blockquote class="callout"><div class="callout-title">NOTA CLAVE</div><p>${renderInlineHtml(
          quoteLines.join("\n"),
        )}</p></blockquote>`,
      );
      continue;
    }

    // Table lines | ... |
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i]);
        i++;
      }
      const headerRow = tableLines[0]
        ? tableLines[0]
            .split("|")
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
            .map((c) => c.trim())
        : [];
      const dataRows = tableLines.slice(2).map((r) =>
        r
          .split("|")
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
          .map((c) => c.trim()),
      );

      let tableHtml = "<table><thead><tr>";
      headerRow.forEach((h) => {
        tableHtml += `<th>${renderInlineHtml(h)}</th>`;
      });
      tableHtml += "</tr></thead><tbody>";
      dataRows.forEach((row) => {
        tableHtml += "<tr>";
        row.forEach((c) => {
          tableHtml += `<td>${renderInlineHtml(c)}</td>`;
        });
        tableHtml += "</tr>";
      });
      tableHtml += "</tbody></table>";
      htmlParts.push(tableHtml);
      continue;
    }

    // List item (- or *)
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const listItems: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
      ) {
        listItems.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      let listHtml = "<ul>";
      listItems.forEach((item) => {
        listHtml += `<li>${renderInlineHtml(item)}</li>`;
      });
      listHtml += "</ul>";
      htmlParts.push(listHtml);
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      htmlParts.push(`<h3>${renderInlineHtml(line.slice(4))}</h3>`);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      htmlParts.push(`<h2>${renderInlineHtml(line.slice(3))}</h2>`);
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      htmlParts.push(`<h1>${renderInlineHtml(line.slice(2))}</h1>`);
      i++;
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph
    htmlParts.push(`<p>${renderInlineHtml(line)}</p>`);
    i++;
  }

  return htmlParts.join("\n");
};

/**
 * Shared CSS rules for printable HTML and jsPDF direct PDF exports
 */
export const NOTE_PRINT_CSS = `
  @page {
    size: A4 portrait;
    margin: 18mm 16mm;
  }
  *, *::before, *::after {
    box-sizing: border-box;
  }
  body, .pdf-export-container {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #111827 !important;
    background: #ffffff !important;
    margin: 0;
    padding: 24px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    width: 700px;
    box-sizing: border-box;
  }
  .pdf-export-container * {
    color: inherit;
  }
  .print-header {
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 14px;
    margin-bottom: 20px;
  }
  .print-top-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8.5pt;
    font-weight: 700;
    color: #4f46e5 !important;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  .note-main-title {
    font-size: 20pt;
    font-weight: 800;
    color: #111827 !important;
    margin: 0 0 10px 0;
    line-height: 1.25;
  }
  .meta-tags-row {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    font-size: 9pt;
    color: #6b7280 !important;
  }
  .meta-item strong {
    color: #374151 !important;
  }
  h1 {
    font-size: 15pt;
    font-weight: 700;
    color: #111827 !important;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 4px;
    margin-top: 22px;
    margin-bottom: 8px;
    break-after: avoid;
    page-break-after: avoid;
  }
  h2 {
    font-size: 13pt;
    font-weight: 700;
    color: #1f2937 !important;
    margin-top: 18px;
    margin-bottom: 6px;
    break-after: avoid;
    page-break-after: avoid;
  }
  h3 {
    font-size: 11.5pt;
    font-weight: 600;
    color: #374151 !important;
    margin-top: 14px;
    margin-bottom: 4px;
    break-after: avoid;
    page-break-after: avoid;
  }
  p {
    margin: 0 0 10px 0;
    line-height: 1.6;
    color: #1f2937 !important;
  }
  .callout {
    border-left: 4px solid #f59e0b;
    background: #fffbeb !important;
    padding: 10px 14px;
    margin: 14px 0;
    border-radius: 0 6px 6px 0;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .callout-title {
    font-size: 8.5pt;
    font-weight: 700;
    color: #b45309 !important;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .code-container {
    background: #f8fafc !important;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
    margin: 12px 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 9pt;
    line-height: 1.45;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .code-lang {
    font-size: 7.5pt;
    text-transform: uppercase;
    font-weight: 700;
    color: #94a3b8 !important;
    margin-bottom: 6px;
  }
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    color: #1e293b !important;
  }
  .inline-code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    background: #f3f4f6 !important;
    padding: 2px 5px;
    border-radius: 4px;
    font-size: 9pt;
    color: #1f2937 !important;
  }
  .math-container {
    margin: 14px 0;
    padding: 8px;
    text-align: center;
    break-inside: avoid;
    page-break-inside: avoid;
    overflow-x: auto;
    color: #111827 !important;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 9.5pt;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #e5e7eb;
    padding: 8px 10px;
    text-align: left;
    color: #1f2937 !important;
  }
  th {
    background: #f9fafb !important;
    font-weight: 600;
    color: #111827 !important;
  }
  ul, ol {
    margin: 0 0 10px 0;
    padding-left: 20px;
    color: #1f2937 !important;
  }
  li {
    margin-bottom: 4px;
  }
  .print-footer {
    margin-top: 30px;
    padding-top: 10px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: #9ca3af !important;
    break-inside: avoid;
    page-break-inside: avoid;
  }
`;

/**
 * Builds a complete printable HTML document string with styles and KaTeX
 */
export const buildPrintableNoteHtml = (note: ApunteNota): string => {
  const dateFormatted = note.fechaModificacion
    ? new Date(note.fechaModificacion).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const bodyHtml = renderMarkdownBodyHtml(note.contenidoMarkdown || "");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(note.titulo)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
  <style>
${NOTE_PRINT_CSS}
  </style>
</head>
<body>
  <div class="print-header">
    <div class="print-top-row">
      <span>miEstudio · Cuaderno Académico</span>
      <span>${escapeHtml(note.materiaNombre || "Materia")}</span>
    </div>
    <h1 class="note-main-title">${escapeHtml(note.titulo)}</h1>
    <div class="meta-tags-row">
      <div class="meta-item">Materia: <strong>${escapeHtml(
        note.materiaNombre || "General",
      )}</strong></div>
      ${
        note.carpeta
          ? `<div class="meta-item">Carpeta/Unidad: <strong>${escapeHtml(
              note.carpeta,
            )}</strong></div>`
          : ""
      }
      ${
        note.evaluacionNombre
          ? `<div class="meta-item">Evaluación: <strong>${escapeHtml(
              note.evaluacionNombre,
            )}</strong></div>`
          : ""
      }
      <div class="meta-item">Fecha: <strong>${dateFormatted}</strong></div>
      <div class="meta-item">Lectura: <strong>~${note.tiempoLecturaMin || 1} min (${
        note.palabras || 0
      } palabras)</strong></div>
    </div>
  </div>

  <div class="content-body">
    ${bodyHtml}
  </div>

  <div class="print-footer">
    <span>Generado desde miEstudio</span>
  </div>
</body>
</html>`;
};

/**
 * Triggers a client-side download of a Blob file
 */
export const triggerFileDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Formats a note into clean Markdown with frontmatter metadata
 */
export const formatNoteAsMarkdown = (note: ApunteNota): string => {
  const tagsFormatted = (note.tags || []).map((t) => `"${t}"`).join(", ");
  const dateFormatted = note.fechaModificacion
    ? new Date(note.fechaModificacion).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  const frontmatter = [
    "---",
    `title: "${note.titulo.replace(/"/g, '\\"')}"`,
    note.materiaNombre
      ? `subject: "${note.materiaNombre.replace(/"/g, '\\"')}"`
      : null,
    note.carpeta ? `folder: "${note.carpeta.replace(/"/g, '\\"')}"` : null,
    note.evaluacionNombre
      ? `evaluation: "${note.evaluacionNombre.replace(/"/g, '\\"')}"`
      : null,
    note.tags && note.tags.length > 0 ? `tags: [${tagsFormatted}]` : null,
    `date: "${dateFormatted}"`,
    "---\n\n",
  ]
    .filter(Boolean)
    .join("\n");

  return `${frontmatter}${note.contenidoMarkdown || ""}`;
};

/**
 * Exports a single note as a .md file
 */
export const exportSingleNote = (note: ApunteNota) => {
  const markdownText = formatNoteAsMarkdown(note);
  const blob = new Blob([markdownText], {
    type: "text/markdown;charset=utf-8;",
  });
  const filename = `${sanitizeFilename(note.titulo)}.md`;
  triggerFileDownload(blob, filename);
};

/**
 * Prints or saves a single note as vector PDF via hidden iframe and browser print dialog
 */
export const exportSingleNoteAsPdf = (note: ApunteNota): Promise<void> => {
  return new Promise((resolve) => {
    const html = buildPrintableNoteHtml(note);

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.visibility = "hidden";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      resolve();
      return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } finally {
          setTimeout(() => {
            document.body.removeChild(iframe);
            resolve();
          }, 1500);
        }
      }, 400);
    };
  });
};

/**
 * Generates a PDF Blob using jsPDF for direct download and bundling into ZIP
 */
export const generateNotePdfBlob = async (note: ApunteNota): Promise<Blob> => {
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
    orientation: "portrait",
  });

  const dateFormatted = note.fechaModificacion
    ? new Date(note.fechaModificacion).toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("es-AR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const bodyHtml = renderMarkdownBodyHtml(note.contenidoMarkdown || "");

  const container = document.createElement("div");
  container.className = "pdf-export-container";
  container.style.width = "700px";
  container.style.padding = "8px 4px 24px 4px";
  container.style.background = "#ffffff";
  container.style.color = "#111827";
  container.style.boxSizing = "border-box";

  container.innerHTML = `
    <style>
      ${NOTE_PRINT_CSS}
    </style>
    <div class="print-header">
      <div class="print-top-row">
        <span>miEstudio · Cuaderno Académico</span>
        <span>${escapeHtml(note.materiaNombre || "Materia")}</span>
      </div>
      <h1 class="note-main-title">${escapeHtml(note.titulo)}</h1>
      <div class="meta-tags-row">
        <div class="meta-item">Materia: <strong>${escapeHtml(
          note.materiaNombre || "General",
        )}</strong></div>
        ${
          note.carpeta
            ? `<div class="meta-item">Carpeta/Unidad: <strong>${escapeHtml(
                note.carpeta,
              )}</strong></div>`
            : ""
        }
        ${
          note.evaluacionNombre
            ? `<div class="meta-item">Evaluación: <strong>${escapeHtml(
                note.evaluacionNombre,
              )}</strong></div>`
            : ""
        }
        <div class="meta-item">Fecha: <strong>${dateFormatted}</strong></div>
        <div class="meta-item">Lectura: <strong>~${note.tiempoLecturaMin || 1} min (${
          note.palabras || 0
        } palabras)</strong></div>
      </div>
    </div>
    <div class="content-body">
      ${bodyHtml}
    </div>
    <div class="print-footer">
      <span>Generado desde miEstudio</span>
    </div>
  `;

  return new Promise((resolve, reject) => {
    try {
      doc.html(container, {
        callback: (generatedDoc) => {
          try {
            resolve(generatedDoc.output("blob"));
          } catch (err) {
            reject(err);
          }
        },
        html2canvas: {
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 700,
        },
        margin: [25, 25, 25, 25],
        autoPaging: "text",
        width: 545,
        windowWidth: 700,
      });
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Directly downloads a single note as a .pdf file
 */
export const exportSingleNoteDirectPdf = async (
  note: ApunteNota,
): Promise<void> => {
  const blob = await generateNotePdfBlob(note);
  const filename = `${sanitizeFilename(note.titulo)}.pdf`;
  triggerFileDownload(blob, filename);
};

/**
 * Packages all notes of a subject into an organized .zip file containing both PDFs and .md files
 */
export const exportMateriaNotesZip = async (
  materiaNombre: string,
  notes: ApunteNota[],
  onProgress?: (current: number, total: number) => void,
): Promise<void> => {
  if (!notes || notes.length === 0) return;

  const zip = new JSZip();
  const usedFilenames = new Map<string, number>();

  for (let idx = 0; idx < notes.length; idx++) {
    const note = notes[idx];
    onProgress?.(idx + 1, notes.length);

    const rawName = sanitizeFilename(note.titulo);
    const subfolder = note.carpeta ? sanitizeFilename(note.carpeta) : "General";
    const folderZip = zip.folder(subfolder) || zip;

    // Handle duplicate filenames gracefully
    let baseFilename = rawName;
    const count = usedFilenames.get(`${subfolder}/${rawName}`) || 0;
    if (count > 0) {
      baseFilename = `${rawName}-${count + 1}`;
    }
    usedFilenames.set(`${subfolder}/${rawName}`, count + 1);

    // 1. Add Markdown version
    const mdContent = formatNoteAsMarkdown(note);
    folderZip.file(`${baseFilename}.md`, mdContent);

    // 2. Add rendered PDF version
    try {
      const pdfBlob = await generateNotePdfBlob(note);
      folderZip.file(`${baseFilename}.pdf`, pdfBlob);
    } catch {
      // Fallback: note still has .md in zip
    }
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const zipFilename = `apuntes-${sanitizeFilename(materiaNombre)}.zip`;
  triggerFileDownload(zipBlob, zipFilename);
};
