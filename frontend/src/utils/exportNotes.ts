import JSZip from 'jszip';
import type { ApunteNota } from '../types/academic';

/**
 * Replaces illegal filename characters for safe filesystem saving
 */
export const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim() || 'apunte';
};

/**
 * Formats a note into clean Markdown with frontmatter metadata
 */
export const formatNoteAsMarkdown = (note: ApunteNota): string => {
  const tagsFormatted = (note.tags || []).map(t => `"${t}"`).join(', ');
  const dateFormatted = note.fechaModificacion
    ? new Date(note.fechaModificacion).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const frontmatter = [
    '---',
    `title: "${note.titulo.replace(/"/g, '\\"')}"`,
    note.materiaNombre ? `subject: "${note.materiaNombre.replace(/"/g, '\\"')}"` : null,
    note.carpeta ? `folder: "${note.carpeta.replace(/"/g, '\\"')}"` : null,
    note.evaluacionNombre ? `evaluation: "${note.evaluacionNombre.replace(/"/g, '\\"')}"` : null,
    note.tags && note.tags.length > 0 ? `tags: [${tagsFormatted}]` : null,
    `date: "${dateFormatted}"`,
    '---\n\n'
  ]
    .filter(Boolean)
    .join('\n');

  return `${frontmatter}${note.contenidoMarkdown || ''}`;
};

/**
 * Triggers a client-side download of a Blob file
 */
export const triggerFileDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports a single note as a .md file
 */
export const exportSingleNote = (note: ApunteNota) => {
  const markdownText = formatNoteAsMarkdown(note);
  const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8;' });
  const filename = `${sanitizeFilename(note.titulo)}.md`;
  triggerFileDownload(blob, filename);
};

/**
 * Packages all notes of a subject into a organized .zip file
 */
export const exportMateriaNotesZip = async (
  materiaNombre: string,
  notes: ApunteNota[]
): Promise<void> => {
  if (!notes || notes.length === 0) return;

  const zip = new JSZip();
  const usedFilenames = new Map<string, number>();

  notes.forEach(note => {
    const rawName = sanitizeFilename(note.titulo);
    const subfolder = note.carpeta ? sanitizeFilename(note.carpeta) : 'General';
    const folderZip = zip.folder(subfolder) || zip;

    // Handle duplicate filenames gracefully
    let finalFilename = `${rawName}.md`;
    const count = usedFilenames.get(`${subfolder}/${rawName}`) || 0;
    if (count > 0) {
      finalFilename = `${rawName}-${count + 1}.md`;
    }
    usedFilenames.set(`${subfolder}/${rawName}`, count + 1);

    const content = formatNoteAsMarkdown(note);
    folderZip.file(finalFilename, content);
  });

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const zipFilename = `apuntes-${sanitizeFilename(materiaNombre)}.zip`;
  triggerFileDownload(zipBlob, zipFilename);
};
