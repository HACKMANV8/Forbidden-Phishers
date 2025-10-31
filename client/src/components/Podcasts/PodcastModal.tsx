import { X, FileText, Mic, Video, Download, Clock } from "lucide-react";
import { Podcast } from "@/types/podcasts";

interface PodcastModalProps {
  podcast: Podcast;
  isOpen: boolean;
  onClose: () => void;
}

export default function PodcastModal({
  podcast,
  isOpen,
  onClose,
}: PodcastModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#F9F6EE] to-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-[#E4D7B4]">
        <div className="sticky top-0 bg-gradient-to-r from-[#335441] to-[#46704A] px-6 py-5 flex justify-between items-center rounded-t-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-white">{podcast.title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-[#E4D7B4] transition-all duration-300 p-2 hover:bg-white/20 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Podcast Info */}
          <div className="mb-6">
            {podcast.description && (
              <p className="text-[#6B8F60] mb-4 text-lg">{podcast.description}</p>
            )}

            <div className="flex items-center space-x-4 text-sm text-[#6B8F60]">
              <span className="flex items-center font-medium">
                <Clock className="w-4 h-4 mr-1 text-[#335441]" />
                {podcast.length} Length
              </span>
              <span className="font-medium">
                Created: {new Date(podcast.createdAt).toLocaleDateString()}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  podcast.status === "completed"
                    ? "bg-[#A9B782] text-white"
                    : podcast.status === "processing"
                    ? "bg-[#6B8F60] text-white"
                    : podcast.status === "error"
                    ? "bg-red-100 text-[#335441]"
                    : "bg-[#E4D7B4] text-[#335441]"
                }`}
              >
                {podcast.status.charAt(0).toUpperCase() +
                  podcast.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {/* Script */}
            {podcast.script && (
              <div className="bg-white rounded-2xl p-6 border-2 border-[#E4D7B4] shadow-lg">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-[#335441] rounded-lg flex items-center justify-center mr-3">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#335441]">
                    Generated Script
                  </h3>
                </div>
                <div className="bg-[#F9F6EE] rounded-lg p-4 max-h-64 overflow-y-auto border border-[#E4D7B4]">
                  <pre className="whitespace-pre-wrap text-sm text-[#335441] font-mono leading-relaxed">
                    {podcast.script}
                  </pre>
                </div>
              </div>
            )}

            {/* Audio */}
            {podcast.audioPath && (
              <div className="bg-white rounded-2xl p-6 border-2 border-[#E4D7B4] shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#46704A] rounded-lg flex items-center justify-center mr-3">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#335441]">
                      Generated Audio
                    </h3>
                  </div>
                  <a
                    href={`http://localhost:3000${podcast.audioPath}`}
                    download
                    className="flex items-center gap-2 text-sm px-4 py-2 bg-[#335441] text-white rounded-lg font-semibold shadow-lg hover:bg-[#46704A] transition-all duration-300"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
                <div className="bg-[#F9F6EE] rounded-lg p-4 border border-[#E4D7B4]">
                  <audio controls className="w-full">
                    <source
                      src={`http://localhost:3000${podcast.audioPath}`}
                      type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            )}

            {/* Video */}
            {podcast.videoPath && (
              <div className="bg-white rounded-2xl p-6 border-2 border-[#E4D7B4] shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#6B8F60] rounded-lg flex items-center justify-center mr-3">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-[#335441]">
                      Generated Video
                    </h3>
                  </div>
                  <a
                    href={`http://localhost:3000${podcast.videoPath}`}
                    download
                    className="flex items-center gap-2 text-sm px-4 py-2 bg-[#335441] text-white rounded-lg font-semibold shadow-lg hover:bg-[#46704A] transition-all duration-300"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </div>
                <div className="bg-[#F9F6EE] rounded-lg p-4 border border-[#E4D7B4]">
                  <video controls className="w-full max-w-2xl mx-auto rounded-lg">
                    <source
                      src={`http://localhost:3000${podcast.videoPath}`}
                      type="video/mp4"
                    />
                    Your browser does not support the video element.
                  </video>
                </div>
              </div>
            )}

            {/* Knowledge Base */}
            <div className="bg-white rounded-2xl p-6 border-2 border-[#E4D7B4] shadow-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-[#A9B782] rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#335441]">
                  Source Knowledge Base
                </h3>
              </div>
              <div className="bg-[#F9F6EE] rounded-lg p-4 max-h-48 overflow-y-auto border border-[#E4D7B4]">
                <p className="text-sm text-[#335441] whitespace-pre-wrap leading-relaxed">
                  {podcast.knowledgeBase}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
