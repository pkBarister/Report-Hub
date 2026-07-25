import React, { useState } from "react";
import Navbar from "./components/Navbar";
import TemplateSelector from "./components/TemplateSelector";
import DualPaneEditor from "./components/DualPaneEditor";
import MediaPanel from "./components/MediaPanel";
import AudioModal from "./components/AudioModal";
import PowerPointModal from "./components/PowerPointModal";
import { REPORT_TEMPLATES } from "./data/templates";
import axios from "axios";

export default function App() {
  // Application State
  const [role, setRole] = useState("user"); // 'user' or 'writer'
  const [workspaces, setWorkspaces] = useState([
    { id: "ws-1", name: "Engineering Placement Workspace" },
    { id: "ws-2", name: "Research & Capstone Lab" },
  ]);
  const [activeWorkspace, setActiveWorkspace] = useState("ws-1");

  const [selectedTemplate, setSelectedTemplate] = useState(REPORT_TEMPLATES[0]);
  const [originalContent, setOriginalContent] = useState(
    REPORT_TEMPLATES[0].content,
  );
  const [currentContent, setCurrentContent] = useState(
    REPORT_TEMPLATES[0].content,
  );
  const [userNotes, setUserNotes] = useState(REPORT_TEMPLATES[0].defaultNotes);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [isPptModalOpen, setIsPptModalOpen] = useState(false);

  // Handle template selection
  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setOriginalContent(template.content);
    setCurrentContent(template.content);
    setUserNotes(template.defaultNotes);
  };

  // Trigger AI Style Transfer
  const handleRunStyleTransfer = async () => {
    setIsGenerating(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/reports/generate",
        {
          templateContent: originalContent,
          userNotes: userNotes,
        },
      );

      if (response.data && response.data.transformedContent) {
        setCurrentContent(response.data.transformedContent);
      }
    } catch (error) {
      console.warn(
        "Backend API offline or error, executing local fallback style transfer:",
        error,
      );
      // Local fallback style transfer: update text nodes in template
      const updated = JSON.parse(JSON.stringify(originalContent));
      if (Array.isArray(updated.content)) {
        updated.content.forEach((node) => {
          if (node.type === "paragraph" && node.content && node.content[0]) {
            node.content[0].text = `${node.content[0].text} [Transformed with student notes: ${userNotes}]`;
          }
        });
      }
      setCurrentContent(updated);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle audio conversion to report
  const handleAudioReportGenerated = (newDocContent) => {
    setOriginalContent(newDocContent);
    setCurrentContent(newDocContent);
  };

  // Insert Media figure into current report
  const handleInsertMedia = (mediaItem) => {
    const mediaNode = {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: `[Attached Figure: ${mediaItem.name}] ${mediaItem.dictation}`,
        },
      ],
    };

    const updated = JSON.parse(JSON.stringify(currentContent));
    if (Array.isArray(updated.content)) {
      updated.content.push(mediaNode);
    }
    setCurrentContent(updated);
  };

  // Export PDF
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col font-sans">
      {/* Header Navigation */}
      <Navbar
        role={role}
        setRole={setRole}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        setActiveWorkspace={setActiveWorkspace}
        onOpenAudioModal={() => setIsAudioModalOpen(true)}
        onOpenPptModal={() => setIsPptModalOpen(true)}
        onPrintPdf={handlePrintPdf}
        isGenerating={isGenerating}
      />

      {/* Main Content Layout */}
      <main className="flex-1 p-6 max-w-[1800px] w-full mx-auto flex flex-col space-y-6">
        {/* Template Category Selector */}
        <TemplateSelector
          selectedTemplateId={selectedTemplate.id}
          onSelectTemplate={handleSelectTemplate}
        />

        {/* Editor & Media Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[650px]">
          {/* Main Dual-Pane Code-Style Editor (3 cols) */}
          <div className="lg:col-span-3 h-full">
            <DualPaneEditor
              originalContent={originalContent}
              currentContent={currentContent}
              userNotes={userNotes}
              setUserNotes={setUserNotes}
              onRunStyleTransfer={handleRunStyleTransfer}
              isGenerating={isGenerating}
              onContentChange={(newJson) => setCurrentContent(newJson)}
            />
          </div>

          {/* Right Media & Dictation Panel (1 col) */}
          <div className="lg:col-span-1 h-full">
            <MediaPanel onInsertMedia={handleInsertMedia} />
          </div>
        </div>
      </main>

      {/* Audio to Report Modal */}
      <AudioModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        onAudioReportGenerated={handleAudioReportGenerated}
      />

      {/* PowerPoint Export Modal */}
      <PowerPointModal
        isOpen={isPptModalOpen}
        onClose={() => setIsPptModalOpen(false)}
        reportTitle={selectedTemplate.title}
        reportContent={currentContent}
      />
    </div>
  );
}
