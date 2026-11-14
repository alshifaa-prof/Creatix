// PDF Text Extraction using pdfjs-dist
// Configured per PRD §0 #3, §5.6 FR-CON-3, FR-CON-4 & Hour 1 Decision 6

import * as pdfjsLib from 'pdfjs-dist';
// Vite URL import for worker
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface ExtractedPdfResult {
  text: string;
  pageCount: number;
  isLikelyScanned: boolean; // <200 chars triggers scanned prompt per §5.6 FR-CON-3
}

export async function extractTextFromPdf(file: File): Promise<ExtractedPdfResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  let fullText = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const content = await page.getTextContent();
    const pageStrings = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .filter(Boolean);
    fullText += pageStrings.join(' ') + '\n';
  }

  const cleanedText = fullText.trim();
  const isLikelyScanned = cleanedText.length < 200;

  return {
    text: cleanedText,
    pageCount: numPages,
    isLikelyScanned,
  };
}
