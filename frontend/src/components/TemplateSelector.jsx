import React from "react";
import { REPORT_TEMPLATES } from "../data/templates";
import { FileText, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

export default function TemplateSelector({ selectedTemplateId, onSelectTemplate }) {
  return (
    <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 mb-6 shadow-inner">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>Select Base Report Template</span>
          </h2>
          <p className="text-xs text-gray-400">
            Choose an institutional report structure to run AI Style Transfer onto your notes
          </p>
        </div>
        <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full font-medium">
          {REPORT_TEMPLATES.length} Academic Categories Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {REPORT_TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplateId === tmpl.id;
          return (
            <div
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? "bg-gradient-to-b from-sky-950/40 to-slate-900 border-sky-500 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/50"
                  : "bg-gray-800/40 border-gray-800 hover:border-gray-700 hover:bg-gray-800/70"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-gray-800 text-sky-400 border border-gray-700">
                    {tmpl.category}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  )}
                </div>
                <h3 className="text-sm font-medium text-white mb-1.5 line-clamp-1">
                  {tmpl.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-3">
                  {tmpl.description}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-800/60 flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1 text-sky-400 font-medium">
                  <Sparkles className="w-3 h-3" /> Ready
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
