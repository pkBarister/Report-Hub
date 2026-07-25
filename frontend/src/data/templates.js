export const REPORT_TEMPLATES = [
  {
    id: "internship_report",
    title: "Internship / Fieldwork Report",
    category: "Practical Placement",
    description: "Formal document summarizing practical internship placement, tasks performed, tools utilized, and key project outcomes.",
    defaultNotes: "Completed a 12-week software engineering internship at Acme Corp. Built API endpoints using Node.js, integrated PostgreSQL JSONB columns, and designed a React dashboard for automated document generation.",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "1. Executive Summary & Internship Overview" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "This report outlines the practical tasks, technical methodologies, and key accomplishments during the internship placement at the host organization. The primary focus was placed on modern full-stack development and software architecture optimization." }]
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "2. Key Responsibilities & Tools Utilized" }]
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Designed and maintained RESTful API endpoints and database models." }] }]
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Implemented AI prompt processing pipelines using Gemini API." }] }]
            },
            {
              type: "listItem",
              content: [{ type: "paragraph", content: [{ type: "text", text: "Collaborated with cross-functional teams to deliver client presentation exports." }] }]
            }
          ]
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "3. Project Outcomes & Technical Learnings" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Through the practical execution of assigned engineering tasks, significant performance improvements were achieved. The experience enhanced proficiency in system architecture, automated reporting, and agile development cycles." }]
        }
      ]
    }
  },
  {
    id: "capstone_report",
    title: "Capstone Project Paper",
    category: "Final Year Project",
    description: "Synthesizes entire degree program, combining practical research, engineering, and formal technical documentation.",
    defaultNotes: "Capstone project focused on AI-driven document automation for academic reports. Developed a hybrid Node.js backend with PostgreSQL JSONB storage and a React Tiptap editor interface.",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Capstone Project: AI-Driven Document Synthesis" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Abstract: This capstone project addresses manual document formatting challenges faced by students. By leveraging LLM style transfer, students can adapt standardized institutional templates dynamically." }]
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "System Architecture & Implementation" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "The solution comprises a Node.js/Express backend server, PostgreSQL database, and a React rich-text front-end supporting side-by-side git diff comparisons." }]
        }
      ]
    }
  },
  {
    id: "research_paper",
    title: "Research Paper / Report",
    category: "Academic Research",
    description: "Comprehensive paper detailing a specific research topic, literature review, methodology, empirical findings, and conclusions.",
    defaultNotes: "Investigated modern web document editors and AI style transfer algorithms. Conducted benchmark analysis comparing JSON schema transformation against plain text generation.",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Comparative Study of LLM Structural Style Transfer" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "1. Introduction: Natural Language Processing (NLP) models have evolved to manipulate non-trivial JSON document ASTs while preserving precise layout schemas." }]
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "2. Methodology & Findings" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "The experimental evaluation verified that JSON schema constraints enforce standard section formatting without structural drift during text replacement." }]
        }
      ]
    }
  },
  {
    id: "term_paper",
    title: "Term Paper",
    category: "Coursework",
    description: "Coursework research paper submitted at the end of an academic semester focused on course topics.",
    defaultNotes: "Submitted for Software Architecture semester course. Analyzed monolithic vs microservice architectures for SaaS document generators.",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Term Paper: SaaS Architecture Design Patterns" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "This paper analyzes the trade-offs between monolithic web servers and serverless microservices for automated document transformation workloads." }]
        }
      ]
    }
  },
  {
    id: "senior_thesis",
    title: "Senior / Undergraduate Thesis",
    category: "Degree Thesis",
    description: "Extensive year-long research paper written under faculty supervision during the final year of degree study.",
    defaultNotes: "Undergraduate thesis on interactive rich text interfaces with real-time AI assistance and automated slide presentation conversion.",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Undergraduate Thesis: Intelligent Document Editing Environments" }]
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "Submitted in partial fulfillment of the requirements for the degree of Bachelor of Science in Computer Science." }]
        }
      ]
    }
  }
];
