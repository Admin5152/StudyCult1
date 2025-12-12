import * as pdfjsLib from 'pdfjs-dist';

// Fix for "Cannot set properties of undefined (setting 'workerSrc')"
// When importing via ESM CDN, the export structure might be nested in 'default'
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Set worker to the CDN location matching the library version
// We verify GlobalWorkerOptions exists to prevent runtime errors
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type;

  if (fileType === "application/pdf") {
    return extractPdfText(file);
  } else {
    throw new Error("Unsupported file type. Please upload a PDF.");
  }
};

const extractPdfText = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Use the resolved pdfjs object (with fallback)
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = "";

    // Limit to first 20 pages to avoid hitting token limits
    const maxPages = Math.min(pdf.numPages, 20);

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      // textContent.items has 'str' property
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Failed to read PDF file.");
  }
};