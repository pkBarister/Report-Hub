const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

/**
 * Parses uploaded document files (.docx, .pdf, .txt, .md) and returns HTML/text formatted content.
 */
class DocumentParser {
  async parseDocument(filePath, originalFilename) {
    const ext = path.extname(originalFilename || filePath).toLowerCase();

    if (ext === '.docx' || ext === '.doc') {
      return await this.parseDocx(filePath);
    } else if (ext === '.pdf') {
      return await this.parsePdf(filePath);
    } else if (ext === '.txt' || ext === '.md') {
      return this.parseText(filePath);
    } else {
      throw new Error(`Unsupported document file format: ${ext}`);
    }
  }

  async parseDocx(filePath) {
    try {
      const result = await mammoth.convertToHtml({ path: filePath });
      let html = result.value;
      if (!html || !html.trim()) {
        const textResult = await mammoth.extractRawText({ path: filePath });
        html = this.textToHtml(textResult.value);
      }
      return { html, text: html.replace(/<[^>]*>/g, '') };
    } catch (err) {
      console.error('Docx parsing error:', err);
      throw new Error('Failed to parse Word document. Please ensure it is a valid .docx file.');
    }
  }

  async parsePdf(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      const rawText = data.text || '';
      const html = this.textToHtml(rawText);
      return { html, text: rawText };
    } catch (err) {
      console.error('PDF parsing error:', err);
      throw new Error('Failed to parse PDF document.');
    }
  }

  parseText(filePath) {
    const rawText = fs.readFileSync(filePath, 'utf8');
    const html = this.textToHtml(rawText);
    return { html, text: rawText };
  }

  /** Converts plain text line breaks to simple HTML paragraphs */
  textToHtml(text) {
    if (!text) return '';
    const paragraphs = text
      .split(/\r?\n\r?\n/)
      .map(p => p.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) {
      return `<div>${text}</div>`;
    }

    return paragraphs.map(p => `<div>${p.replace(/\r?\n/g, '<br/>')}</div><br/>`).join('');
  }
}

module.exports = new DocumentParser();
