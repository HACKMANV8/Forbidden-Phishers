import {
  Clock,
  FileText,
  Mic,
  Video,
  AlertCircle,
  CheckCircle,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Podcast } from "@/types/podcasts";

interface PodcastCardProps {
  podcast: Podcast;
  onDelete: (id: string) => void;
  onView: (podcast: Podcast) => void;
}

export default function PodcastCard({
  podcast,
  onDelete,
  onView,
}: PodcastCardProps) {
  const getStatusIcon = () => {
    switch (podcast.status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-[#46704A]" />;
      case "processing":
        return <RotateCcw className="w-5 h-5 text-[#6B8F60] animate-spin" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-[#335441]" />;
      default:
        return <Clock className="w-5 h-5 text-[#A9B782]" />;
    }
  };

  const getStatusText = () => {
    switch (podcast.status) {
      case "completed":
        return "Completed";
      case "processing":
        return "Processing...";
      case "error":
        return "Error";
      default:
        return "Pending";
    }
  };

  const getLengthBadgeColor = () => {
    switch (podcast.length) {
      case "Short":
        return "bg-[#A9B782] text-white";
      case "Medium":
        return "bg-[#6B8F60] text-white";
      case "Long":
        return "bg-[#46704A] text-white";
      default:
        return "bg-[#E4D7B4] text-[#335441]";
    }
  };

  return (
    <div className="group relative bg-gradient-to-br from-[#F9F6EE] to-white rounded-2xl p-6 border-2 border-[#E4D7B4] hover:border-[#A9B782] transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-[#335441] mb-2">
            {podcast.title}
          </h3>
          {podcast.description && (
            <p className="text-[#6B8F60] text-sm mb-3 line-clamp-2 leading-relaxed">
              {podcast.description}
            </p>
          )}

          <div className="flex items-center space-x-3 mb-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getLengthBadgeColor()}`}
            >
              {podcast.length}
            </span>
            <div className="flex items-center text-sm text-[#335441] font-medium">
              {getStatusIcon()}
              <span className="ml-1">{getStatusText()}</span>
            </div>
          </div>

          <div className="text-xs text-[#6B8F60]">
            Created: {new Date(podcast.createdAt).toLocaleDateString()}
          </div>
        </div>

        <button
          onClick={() => onDelete(podcast.id)}
          className="text-[#6B8F60] hover:text-[#335441] transition-colors duration-200 p-1 hover:bg-[#F9F6EE] rounded-lg"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {podcast.status === "error" && podcast.errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
          <p className="text-sm text-[#335441] font-medium">{podcast.errorMessage}</p>
        </div>
      )}

      {podcast.status === "completed" && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center text-sm text-[#335441] font-medium">
            <FileText className="w-4 h-4 mr-1 text-[#335441]" />
            Script
          </div>
          <div className="flex items-center text-sm text-[#335441] font-medium">
            <Mic className="w-4 h-4 mr-1 text-[#46704A]" />
            Audio
          </div>
          <div className="flex items-center text-sm text-[#335441] font-medium">
            <Video className="w-4 h-4 mr-1 text-[#6B8F60]" />
            Video
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onView(podcast)}
          className="group flex-1 px-4 py-2 bg-[#335441] text-white rounded-lg font-semibold shadow-lg hover:bg-[#46704A] transition-all duration-300 flex items-center justify-center gap-2"
        >
          View Details
        </button>

        {podcast.status === "completed" && (
          <>
            {podcast.audioPath && (
              <a
                href={`http://localhost:3001${podcast.audioPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-white text-[#335441] rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#335441] hover:bg-[#F9F6EE]"
              >
                Audio
              </a>
            )}
            {podcast.videoPath && (
              <a
                href={`http://localhost:3001${podcast.videoPath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-white text-[#335441] rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-[#335441] hover:bg-[#F9F6EE]"
              >
                Video
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
