import React from "react";
import { FileText, Mic, Presentation, Download, Briefcase, UserCheck, Sparkles } from "lucide-react";

export default function Navbar({
  role,
  setRole,
  workspaces,
  activeWorkspace,
  setActiveWorkspace,
  onOpenAudioModal,
  onOpenPptModal,
  onPrintPdf,
  isGenerating
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between shadow-xl">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg text-white tracking-tight">Report Hub</span>
            <span className="bg-sky-500/10 text-sky-400 text-xs px-2 py-0.5 rounded-full border border-sky-500/20 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> AI Powered
            </span>
          </div>
          <p className="text-xs text-gray-400">Academic & Internship Report Automation</p>
        </div>
      </div>

      {/* Center Controls: Role Switcher & Writer Workspaces */}
      <div className="flex items-center space-x-4">
        {/* Role Mode Toggle */}
        <div className="bg-gray-800/80 p-1 rounded-xl border border-gray-700/60 flex items-center text-xs">
          <button
            onClick={() => setRole("user")}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
              role === "user"
                ? "bg-sky-600 text-white font-medium shadow"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Student User</span>
          </button>
          <button
            onClick={() => setRole("writer")}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
              role === "writer"
                ? "bg-sky-600 text-white font-medium shadow"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Writer Workspace</span>
          </button>
        </div>

        {/* Writer Workspace Dropdown */}
        {role === "writer" && (
          <div className="flex items-center space-x-2 bg-gray-800/60 px-3 py-1.5 rounded-xl border border-gray-700/60">
            <span className="text-xs text-gray-400 font-medium">Workspace:</span>
            <select
              value={activeWorkspace}
              onChange={(e) => setActiveWorkspace(e.target.value)}
              className="bg-transparent text-xs text-sky-300 font-medium focus:outline-none cursor-pointer"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id} className="bg-gray-800 text-gray-200">
                  {ws.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenAudioModal}
          className="flex items-center space-x-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
          title="Upload or Record Audio Minutes"
        >
          <Mic className="w-4 h-4 text-emerald-400" />
          <span>Audio to Report</span>
        </button>

        <button
          onClick={onOpenPptModal}
          className="flex items-center space-x-1.5 text-xs bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 px-3.5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
          title="Convert Report to PowerPoint Slides"
        >
          <Presentation className="w-4 h-4 text-amber-400" />
          <span>PowerPoint Export</span>
        </button>

        <button
          onClick={onPrintPdf}
          className="flex items-center space-x-1.5 text-xs bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-xl font-medium transition-all shadow-lg shadow-sky-600/25 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>
    </header>
  );
}
