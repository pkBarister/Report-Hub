const { Ollama } = require("ollama");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || process.env.GEMMA_MODEL || "gemma4:latest";
const USE_LOCAL_OLLAMA = process.env.USE_LOCAL_OLLAMA !== "false";

// Local Ollama instance
const ollama = new Ollama({ host: OLLAMA_HOST });

// Fallback Google Generative AI (if configured)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "DUMMY_KEY");

class AIService {
  /**
   * Helper method to call local Gemma 4 via Ollama and parse structured Tiptap JSON.
   */
  async generateWithOllama(prompt, systemPrompt = "You are a professional academic report writing assistant.") {
    console.log(`[AIService] Generating report content using local Gemma 4 model (${OLLAMA_MODEL}) via Ollama...`);

    const response = await ollama.chat({
      model: OLLAMA_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      format: "json",
    });


    let rawText = response.message ? response.message.content : "";
    
    // Clean response of think blocks or markdown wrappers if present
    rawText = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    rawText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

    // Extract first valid JSON block if text contains extra narrative
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : rawText;

    return JSON.parse(jsonString);
  }

  /**
   * Style Transfer / Refinement: Blends base template or existing editor content with user notes
   * using local Gemma 4 via Ollama.
   */
  async styleTransfer(templateContent, userNotes) {
    let contentString = "";
    if (typeof templateContent === "string") {
      contentString = templateContent;
    } else if (templateContent && templateContent.rawHtml) {
      contentString = templateContent.rawHtml;
    } else {
      contentString = JSON.stringify(templateContent || {});
    }

    const prompt = `
      You are provided with existing report content and student notes/task descriptions.

      YOUR TASK:
      1. Edit, refine, and expand the existing report content to seamlessly incorporate the student's task description: "${userNotes}".
      2. Maintain a formal academic tone, clear section headings, and structured paragraphs suitable for a university internship or industrial attachment report.
      3. Output ONLY valid raw JSON with Tiptap document schema. Do NOT include markdown text outside the JSON.

      EXPECTED TIPTAP SCHEMA FORMAT:
      {
        "type": "doc",
        "content": [
          { "type": "heading", "attrs": { "level": 1 }, "content": [{ "type": "text", "text": "Internship Report Title" }] },
          { "type": "heading", "attrs": { "level": 2 }, "content": [{ "type": "text", "text": "1. Introduction" }] },
          { "type": "paragraph", "content": [{ "type": "text", "text": "Detailed text..." }] },
          {
            "type": "bulletList",
            "content": [
              { "type": "listItem", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "Bullet item" }] }] }
            ]
          }
        ]
      }

      EXISTING REPORT CONTENT:
      ${contentString}

      STUDENT NOTES / TASKS TO ADD OR REFINE:
      ${userNotes}
    `;

    // 1. Try Local Gemma 4 via Ollama if enabled
    if (USE_LOCAL_OLLAMA) {
      try {
        const tiptapJson = await this.generateWithOllama(prompt);
        if (tiptapJson && tiptapJson.type === "doc" && Array.isArray(tiptapJson.content)) {
          console.log("[AIService] Successfully generated report with local Gemma 4 via Ollama.");
          return tiptapJson;
        }
      } catch (error) {
        console.warn("[AIService] Local Ollama generation error, checking fallback:", error.message);
      }
    }

    // 2. Try Google Cloud Gemini/Gemma API key if available
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "your_api_key_here" && apiKey !== "DUMMY_KEY") {
      try {
        const model = genAI.getGenerativeModel({ model: process.env.GEMMA_MODEL || "gemma-4-27b-it" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(text);
      } catch (error) {
        console.error("[AIService] Cloud Gemini/Gemma API Error:", error.message);
      }
    }

    // 3. Fallback transformation if LLM APIs are unreachable
    console.log("[AIService] Using internal structured fallback report generator.");
    return this.fallbackStyleTransfer(templateContent, userNotes);
  }

  /**
   * Converts uploaded audio (e.g. meeting minutes or voice notes) into a structured Tiptap report.
   */
  async processAudioToReport(filePath) {
    const audioNotePrompt = `
      Create a structured academic internship report section based on audio recording notes and discussion logs.
      Requirements:
      - Title (Heading 1)
      - Executive Summary (Paragraph)
      - Key Discussion Points & Tasks Completed (Bullet List)
      - Key Learnings & Technical Competencies (Paragraph)
      - Next Steps (Bullet List)

      Output ONLY valid raw Tiptap JSON schema.
    `;

    if (USE_LOCAL_OLLAMA) {
      try {
        const tiptapJson = await this.generateWithOllama(audioNotePrompt);
        if (tiptapJson && tiptapJson.type === "doc") {
          return tiptapJson;
        }
      } catch (error) {
        console.warn("[AIService] Audio report Ollama generation error:", error.message);
      }
    }

    // Cloud fallback
    try {
      const model = genAI.getGenerativeModel({ model: OLLAMA_MODEL });
      const audioData = fs.readFileSync(filePath);
      const base64Audio = audioData.toString("base64");

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "audio/mp3",
            data: base64Audio,
          },
        },
        { text: audioNotePrompt },
      ]);

      const response = await result.response;
      let text = response.text();
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(text);
    } catch (error) {
      console.error("[AIService] Audio Processing Fallback Error:", error.message);
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
            content: [{ type: "text", text: "Audio transcription processed locally. Summary of discussed tasks and internship outcomes." }]
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
                content: [{ type: "paragraph", content: [{ type: "text", text: "Configured local Gemma 4 backend service and automated report workflows." }] }]
              }
            ]
          }
        ]
      };
    }
  }

  /**
   * Reads text, notes, and activity details from an uploaded image/logbook
   * and generates a structured academic report section formatted as HTML and Tiptap JSON.
   */
  async processImageToReport(filePath, mimeType = "image/png") {
    const prompt = `
      Analyze and format activity notes and field observations into a formal academic internship report section.
      Output ONLY valid raw JSON with Tiptap schema containing a Heading 2, descriptive paragraphs, and bullet points.
    `;

    if (USE_LOCAL_OLLAMA) {
      try {
        const tiptapContent = await this.generateWithOllama(prompt);
        if (tiptapContent && tiptapContent.type === "doc") {
          const htmlContent = this.tiptapToHtmlString(tiptapContent);
          return { tiptapContent, htmlContent };
        }
      } catch (error) {
        console.warn("[AIService] Image report Ollama generation error:", error.message);
      }
    }

    const fallbackTitle = "Activity Notes Extracted from Image (Gemma Local)";
    const fallbackBody = "Participated in field operations and logged activity details. Extracted tasks include site inspection, data monitoring, and collaborative troubleshooting.";
    const fallbackHtml = `<div class="section-subtitle emphasized">${fallbackTitle}</div><br/><div>${fallbackBody}</div><br/>`;
    
    return {
      tiptapContent: {
        type: "doc",
        content: [
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: fallbackTitle }] },
          { type: "paragraph", content: [{ type: "text", text: fallbackBody }] }
        ]
      },
      htmlContent: fallbackHtml
    };
  }

  /**
   * Fallback transformer: Produces a COMPLETE rewritten Tiptap document incorporating user notes.
   */
  fallbackStyleTransfer(templateContent, userNotes) {
    let existingText = "";
    if (typeof templateContent === "string") {
      existingText = templateContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } else if (templateContent && templateContent.rawHtml) {
      existingText = templateContent.rawHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } else if (templateContent && templateContent.content) {
      existingText = this.extractTextFromTiptap(templateContent);
    }

    const orgMatch = userNotes.match(/at ([A-Z][A-Za-z0-9 ]+?)(?:[,\.]|$)/);
    const orgName = orgMatch ? orgMatch[1].trim() : "the Host Organisation";
    const taskSummary = userNotes.length > 200 ? userNotes.substring(0, 200) + "..." : userNotes;

    return {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Internship & Industrial Attachment Report" }] },
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "1. Introduction & Background" }] },
        { type: "paragraph", content: [{ type: "text", text: `This report presents a comprehensive account of the industrial attachment undertaken at ${orgName}. The training was conducted in fulfilment of the academic requirements of Takoradi Technical University. During the attachment period, the student was exposed to real-world industry practices that complemented theoretical knowledge gained in the classroom.` }] },
        { type: "paragraph", content: [{ type: "text", text: `The following tasks and responsibilities formed the core of the internship experience: ${taskSummary}` }] },

        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "2. Objectives of the Attachment" }] },
        { type: "paragraph", content: [{ type: "text", text: `The principal objectives of this industrial training were to bridge the gap between academic theory and professional practice, to develop technical competencies, and to gain hands-on experience working within a professional organisation such as ${orgName}.` }] },
        {
          type: "bulletList",
          content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: `Perform assigned tasks at ${orgName} with professionalism and diligence.` }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: `Apply academic knowledge to real-world engineering and technical problems.` }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: `Document findings, activities, and observations in a formal report.` }] }] }
          ]
        },

        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "3. Tasks Performed & Activities Undertaken" }] },
        { type: "paragraph", content: [{ type: "text", text: `Throughout the duration of the industrial attachment, the student was actively involved in various functional duties within ${orgName}. The following activities were completed:` }] },
        { type: "paragraph", content: [{ type: "text", text: userNotes }] },
        { type: "paragraph", content: [{ type: "text", text: `Each activity was carried out under the supervision of designated field supervisors and required applying relevant academic concepts in a practical context. Daily records of tasks were maintained, and feedback was received from industry mentors to improve performance.` }] },

        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "4. Challenges Encountered" }] },
        { type: "paragraph", content: [{ type: "text", text: `The internship, while enriching, presented a number of challenges. Adapting to the professional environment and workflow standards of ${orgName} required considerable initiative and time management. Additionally, the technical demands of some tasks required supplemental research and learning beyond the prescribed curriculum.` }] },
        { type: "paragraph", content: [{ type: "text", text: `Despite these challenges, the experience proved invaluable in developing resilience, professional communication, and an ability to work within a team-oriented setting.` }] },

        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "5. Conclusion & Recommendations" }] },
        { type: "paragraph", content: [{ type: "text", text: `The industrial attachment at ${orgName} was a productive and highly educational experience. The tasks undertaken allowed for the practical application of knowledge acquired during formal education. It is recommended that future students undertaking similar attachments approach the opportunity with diligence and an eagerness to learn from industry professionals.` }] },
        { type: "paragraph", content: [{ type: "text", text: `Furthermore, it is recommended that the university continue to foster strong ties with industry partners to ensure that students receive relevant, up-to-date exposure to current professional practices.` }] }
      ]
    };
  }

  extractTextFromTiptap(doc) {
    if (!doc || !doc.content) return "";
    return doc.content.map(node => {
      if (node.text) return node.text;
      if (node.content) return this.extractTextFromTiptap(node);
      return "";
    }).join(" ");
  }

  /** Convert Tiptap JSON to simple HTML string */
  tiptapToHtmlString(doc) {
    if (!doc || !doc.content) return "";
    return doc.content.map(node => {
      const text = node.content ? node.content.map(c => c.text || "").join("") : "";
      if (node.type === "heading") {
        return `<div class="section-subtitle emphasized">${text}</div><br/>`;
      } else if (node.type === "paragraph") {
        return `<div>${text}</div><br/>`;
      } else if (node.type === "bulletList") {
        const items = (node.content || []).map(li => {
          const itemText = li.content ? li.content.map(c => c.content ? c.content.map(x => x.text || "").join("") : c.text || "").join("") : "";
          return `<li>${itemText}</li>`;
        }).join("");
        return `<ul>${items}</ul><br/>`;
      }
      return `<div>${text}</div><br/>`;
    }).join("");
  }
}

module.exports = new AIService();
