import React, { useState } from "react";
import { Image, Video, Upload, Plus, Mic, CheckCircle, Trash2 } from "lucide-react";

export default function MediaPanel({ onInsertMedia }) {
  const [mediaList, setMediaList] = useState([
    {
      id: "m1",
      name: "System_Architecture_Diagram.png",
      type: "image",
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80",
      dictation: "Figure 1: High-level architectural diagram showing Node.js backend and React frontend interaction."
    },
    {
      id: "m2",
      name: "Database_Schema_JSONB.png",
      type: "image",
      url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&q=80",
      dictation: "Figure 2: PostgreSQL table schema with dynamic JSONB document columns."
    }
  ]);

  const [dictationInput, setDictationInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newItems = files.map((file, idx) => ({
      id: `m-${Date.now()}-${idx}`,
      name: file.name,
      type: file.type.startsWith("video") ? "video" : "image",
      url: URL.createObjectURL(file),
      dictation: dictationInput || `Figure: Uploaded media attachment - ${file.name}`
    }));

    setMediaList((prev) => [...newItems, ...prev]);
    setDictationInput("");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setDictationInput("Dictated note: Insert screenshot showing practical internship project achievements and workflow metrics.");
        setIsRecording(false);
      }, 2500);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col h-full shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-800">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Image className="w-4 h-4 text-sky-400" />
          <span>Media & Dictation Panel</span>
        </h3>
        <span className="text-[11px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full font-medium">
          {mediaList.length} Attachments
        </span>
      </div>

      {/* Dictation Input Bar */}
      <div className="mb-4 bg-gray-950 p-3 rounded-xl border border-gray-800">
        <label className="text-xs font-medium text-gray-400 mb-1.5 block flex items-center justify-between">
          <span>Dictate Image Notes:</span>
          {isRecording && (
            <span className="text-[10px] text-rose-400 font-semibold animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Dictating...
            </span>
          )}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={dictationInput}
            onChange={(e) => setDictationInput(e.target.value)}
            placeholder="Type or dictate figure caption..."
            className="flex-1 bg-gray-900 text-xs text-gray-200 px-3 py-2 rounded-lg border border-gray-800 focus:outline-none focus:border-sky-500"
          />
          <button
            onClick={toggleRecording}
            className={`p-2 rounded-lg transition-all ${
              isRecording
                ? "bg-rose-600 text-white shadow-lg shadow-rose-600/30"
                : "bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
            title="Dictate Caption"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      <label className="mb-4 border-2 border-dashed border-gray-800 hover:border-sky-500/50 bg-gray-950/50 hover:bg-gray-950 p-4 rounded-xl cursor-pointer flex flex-col items-center justify-center transition-all group">
        <Upload className="w-6 h-6 text-gray-500 group-hover:text-sky-400 transition-colors mb-1" />
        <span className="text-xs font-medium text-gray-300 group-hover:text-sky-300">
          Upload Image / Video
        </span>
        <span className="text-[10px] text-gray-500">PNG, JPG, MP4 supported</span>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      {/* Media Attachments List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {mediaList.map((item) => (
          <div
            key={item.id}
            className="bg-gray-950 p-2.5 rounded-xl border border-gray-800/80 hover:border-gray-700 transition-all flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-3">
              <div className="h-12 w-16 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 relative border border-gray-800">
                {item.type === "image" ? (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                    <Video className="w-5 h-5 text-amber-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-200 truncate">{item.name}</p>
                <p className="text-[11px] text-gray-400 line-clamp-1 italic mt-0.5">
                  "{item.dictation}"
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-1 border-t border-gray-900">
              <button
                onClick={() => setMediaList((prev) => prev.filter((m) => m.id !== item.id))}
                className="text-[11px] text-gray-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onInsertMedia(item)}
                className="flex items-center space-x-1 text-[11px] bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded-lg transition-all"
              >
                <Plus className="w-3 h-3" />
                <span>Insert to Report</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
