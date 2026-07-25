import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import { 
  Sparkles, Split, Eye, Bold, Italic, List, Heading1, Heading2, Quote, Undo, Redo, RefreshCw, Wand2 
} from "lucide-react";
import { diffWords } from "diff";

export default function DualPaneEditor({
  originalContent,
  currentContent,
  userNotes,
  setUserNotes,
  onRunStyleTransfer,
  isGenerating,
  onContentChange
}) {
  const [viewMode, setViewMode] = useState("diff"); // 'single' or 'diff'
  const [lineCount, setLineCount] = useState(25);

  // Left Editor (Original Unedited Template)
  const leftEditor = useEditor({
    extensions: [StarterKit, Highlight],
    content: originalContent,
    editable: false,
  });

  // Right Editor (AI Transformed Current Report)
  const rightEditor = useEditor({
    extensions: [StarterKit, Highlight],
    content: currentContent,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getJSON());
    },
  });

  // Keep editor content in sync when props update
  useEffect(() => {
    if (leftEditor && originalContent) {
      leftEditor.commands.setContent(originalContent);
    }
  }, [originalContent, leftEditor]);

  useEffect(() => {
    if (rightEditor && currentContent) {
      rightEditor.commands.setContent(currentContent);
    }
  }, [currentContent, rightEditor]);

  // Compute text diff for Git-style yellow highlight representation
  const renderDiffHTML = () => {
    const origText = extractRawText(originalContent);
    const currText = extractRawText(currentContent);

    const diffs = diffWords(origText, currText);

    return diffs.map((part, index) => {
      if (part.added) {
        // Yellow highlight for additions/edits as requested in PDF spec
        return (
          <span key={index} className="diff-added">
            {part.value}
          </span>
        );
      }
      if (part.removed) {
        return (
          <span key={index} className="diff-removed">
            {part.value}
          </span>
        );
      }
      return <span key={index}>{part.value}</span>;
    });
  };

  const extractRawText = (node) => {
    if (!node) return "";
    if (typeof node === "string") return node;
    if (node.text) return node.text;
    if (Array.isArray(node.content)) {
      return node.content.map(extractRawText).join(" ");
    }
    return "";
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* 1. Top AI Style Transfer Prompt Bar */}
      <div className="p-4 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 border-b border-gray-800 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-400">
            <Wand2 className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            placeholder="Type internship notes or quick raw details (e.g. tasks performed, tools used, duration...)"
            className="w-full pl-10 pr-4 py-2.5 bg-gray-950/80 text-sm text-gray-100 placeholder-gray-500 rounded-xl border border-gray-800 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRunStyleTransfer}
            disabled={isGenerating || !userNotes.trim()}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Running AI Style Transfer...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Run Style Transfer</span>
              </>
            )}
          </button>

          {/* View Mode Toggle: Single vs Git-Diff Split */}
          <div className="bg-gray-950 p-1 rounded-xl border border-gray-800 flex items-center text-xs">
            <button
              onClick={() => setViewMode("diff")}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                viewMode === "diff"
                  ? "bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30 shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              title="Git-style Diff Comparison (Changes in Yellow)"
            >
              <Split className="w-3.5 h-3.5 text-amber-400" />
              <span>Git Diff View</span>
            </button>

            <button
              onClick={() => setViewMode("single")}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                viewMode === "single"
                  ? "bg-sky-600 text-white font-medium shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              title="Single Full Rich Text Editor"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Full Editor</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Formatting Toolbar for Right Editor */}
      {rightEditor && (
        <div className="px-4 py-2 bg-gray-950/60 border-b border-gray-800 flex items-center space-x-1 text-gray-400 text-xs">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mr-2">
            Rich Editor Tools:
          </span>
          <button
            onClick={() => rightEditor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-gray-800 ${
              rightEditor.isActive("bold") ? "text-sky-400 bg-gray-800" : ""
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => rightEditor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-gray-800 ${
              rightEditor.isActive("italic") ? "text-sky-400 bg-gray-800" : ""
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => rightEditor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded hover:bg-gray-800 ${
              rightEditor.isActive("heading", { level: 1 }) ? "text-sky-400 bg-gray-800" : ""
            }`}
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => rightEditor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded hover:bg-gray-800 ${
              rightEditor.isActive("heading", { level: 2 }) ? "text-sky-400 bg-gray-800" : ""
            }`}
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => rightEditor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-gray-800 ${
              rightEditor.isActive("bulletList") ? "text-sky-400 bg-gray-800" : ""
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => rightEditor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded hover:bg-gray-800 ${
              rightEditor.isActive("blockquote") ? "text-sky-400 bg-gray-800" : ""
            }`}
          >
            <Quote className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-gray-800 mx-2" />
          <button
            onClick={() => rightEditor.chain().focus().undo().run()}
            className="p-1.5 rounded hover:bg-gray-800"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => rightEditor.chain().focus().redo().run()}
            className="p-1.5 rounded hover:bg-gray-800"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Main Editor Panes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Line Numbers Sidebar (Code-editor aesthetic) */}
        <div className="w-12 bg-gray-950/90 py-4 flex flex-col items-end pr-3 select-none border-r border-gray-800/80 font-mono text-xs text-gray-600">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="h-7 leading-7">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Dynamic Split / Single View Layout */}
        <div className="flex-1 flex overflow-auto">
          {viewMode === "diff" ? (
            /* Split View: Left (Original Base Template) vs Right (AI Transformed with Yellow Highlights) */
            <div className="grid grid-cols-2 flex-1 divide-x divide-gray-800">
              {/* Left Pane: Original Base Report Template */}
              <div className="p-6 bg-gray-950/40 overflow-y-auto">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800/60">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Initial Base Template (Unedited)
                  </span>
                  <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono">
                    ORIGINAL
                  </span>
                </div>
                <EditorContent editor={leftEditor} className="prose prose-invert max-w-none" />
              </div>

              {/* Right Pane: AI Transformed Report with Git Diff Highlights */}
              <div className="p-6 bg-gray-900/40 overflow-y-auto relative">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-800/60">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Style Transformed (Yellow Changes)
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/30">
                    LIVE DIFF
                  </span>
                </div>

                {/* Yellow Highlighted Git Diff Text */}
                <div className="prose prose-invert max-w-none text-sm leading-relaxed mb-6 p-4 rounded-xl bg-gray-950/80 border border-gray-800 shadow-inner">
                  {renderDiffHTML()}
                </div>

                <div className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                  Interactive Tiptap Document Editor:
                </div>
                <EditorContent editor={rightEditor} className="prose prose-invert max-w-none" />
              </div>
            </div>
          ) : (
            /* Single Full Editor View */
            <div className="flex-1 p-8 bg-gray-900/60 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <EditorContent editor={rightEditor} className="prose prose-invert max-w-none" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
