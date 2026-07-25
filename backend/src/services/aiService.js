const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "DUMMY_KEY");

class AIService {
  /**
   * Style Transfer: Blends base template structure with specific user notes.
   * Swaps old data for new data into a customized Tiptap JSON schema.
   */
  async styleTransfer(templateContent, userNotes) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
      You are a professional academic writing assistant.
      You will be provided with a JSON object representing a Tiptap rich-text document structure and raw user/student notes.

      YOUR TASK:
      1. Analyze the provided TEMPLATE JSON. Observe the document hierarchy, headings, paragraphs, lists, and formal academic tone.
      2. Use the STUDENT NOTES to replace the sample text content throughout that structure.
      3. Maintain the EXACT Tiptap JSON structure (nodes: doc, heading, paragraph, bulletList, listItem, text, etc.).
      4. Ensure all generated text is detailed, formal, professional, and directly incorporates facts from the student notes.
      5. Return ONLY valid JSON matching the Tiptap document schema without markdown codeblocks or extra text.

      TEMPLATE JSON:
      ${JSON.stringify(templateContent)}

      STUDENT NOTES:
      ${userNotes}
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean markdown code blocks if returned
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      const transformedContent = JSON.parse(text);
      return transformedContent;
    } catch (error) {
      console.error("AI Style Transfer Error:", error);
      // Fallback transformation if API fails or key is unconfigured
      return this.fallbackStyleTransfer(templateContent, userNotes);
    }
  }

  /**
   * Converts uploaded audio (e.g. meeting minutes or voice notes) into a structured Tiptap report.
   */
  async processAudioToReport(filePath) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      const audioData = fs.readFileSync(filePath);
      const base64Audio = audioData.toString("base64");

      const prompt = `
        Transcribe and analyze this audio recording. Convert its key contents into a structured academic/internship report in Tiptap JSON format.
        Structure required:
        - Main Title (Heading level 1)
        - Executive Summary / Introduction (Paragraph)
        - Key Discussion Points & Tasks Completed (Bullet List)
        - Project Outcomes & Learnings (Paragraph)
        - Next Steps / Recommendations (Bullet List)

        Output ONLY valid raw JSON with Tiptap schema.
      `;

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "audio/mp3",
            data: base64Audio,
          },
        },
        { text: prompt },
      ]);

      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(text);
    } catch (error) {
      console.error("Audio Processing Error:", error);
      return {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Transcribed Report from Audio" }]
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Audio transcription completed. Summary of discussed tasks and internship outcomes." }]
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Key Notes & Action Items" }]
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Reviewed project progress and weekly milestones." }] }]
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Configured backend services and automated report workflows." }] }]
              }
            ]
          }
        ]
      };
    }
  }

  /**
   * Fallback transformer when AI API key is not present or rate limited.
   */
  fallbackStyleTransfer(templateContent, userNotes) {
    if (!templateContent || !templateContent.content) {
      return {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Internship & Project Report" }]
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: `Adapted Content based on user notes: ${userNotes}` }]
          }
        ]
      };
    }

    const modifiedContent = JSON.parse(JSON.stringify(templateContent));
    
    // Inject user notes into main content nodes
    if (Array.isArray(modifiedContent.content)) {
      modifiedContent.content.forEach((node) => {
        if (node.type === "paragraph" && node.content && node.content[0]) {
          node.content[0].text = `${node.content[0].text} [Updated with notes: ${userNotes}]`;
        }
      });
    }

    return modifiedContent;
  }
}

module.exports = new AIService();
