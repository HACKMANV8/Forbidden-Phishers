import { useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { CreatePodcastRequest } from "@/types/podcasts";

interface PodcastFormProps {
  onSubmit: (data: CreatePodcastRequest) => void;
  isLoading: boolean;
}

export default function PodcastForm({ onSubmit, isLoading }: PodcastFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    length: "Short" as "Short" | "Medium" | "Long",
    knowledgeText: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<"text" | "file">("text");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreatePodcastRequest = {
      title: formData.title,
      description: formData.description || undefined,
      length: formData.length,
    };

    if (inputMode === "text") {
      data.knowledgeText = formData.knowledgeText;
    } else if (file) {
      data.knowledgeFile = file;
    }

    onSubmit(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Podcast Title *
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter podcast title"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description (Optional)
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Brief description of your podcast"
        />
      </div>

      {/* Length */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Podcast Length *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(["Short", "Medium", "Long"] as const).map((length) => (
            <button
              key={length}
              type="button"
              onClick={() => setFormData({ ...formData, length })}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                formData.length === length
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {length}
            </button>
          ))}
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Short: 3-5 min | Medium: 5-10 min | Long: 10-15 min
        </p>
      </div>

      {/* Input Mode Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Knowledge Base Input *
        </label>
        <div className="flex gap-3 mb-4">
          <button
            type="button"
            onClick={() => setInputMode("text")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              inputMode === "text"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Text Input
          </button>
          <button
            type="button"
            onClick={() => setInputMode("file")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              inputMode === "file"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Upload className="w-4 h-4" />
            File Upload
          </button>
        </div>

        {inputMode === "text" ? (
          <textarea
            required={inputMode === "text"}
            value={formData.knowledgeText}
            onChange={(e) => setFormData({ ...formData, knowledgeText: e.target.value })}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Paste your content here... (minimum 50 words)"
          />
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              accept=".txt,.md"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              required={inputMode === "file"}
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                {file ? file.name : "Click to upload .txt or .md file"}
              </span>
              <span className="text-xs text-gray-500 mt-1">Max size: 10MB</span>
            </label>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Podcast"
          )}
        </button>
      </div>
    </form>
  );
}
