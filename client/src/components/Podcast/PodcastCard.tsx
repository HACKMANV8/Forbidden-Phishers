import { Podcast } from "@/types/podcasts";
import { Play, Trash2, Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react";

interface PodcastCardProps {
  podcast: Podcast;
  onDelete: (id: string) => void;
  onView: (podcast: Podcast) => void;
}

export default function PodcastCard({ podcast, onDelete, onView }: PodcastCardProps) {
  const getStatusIcon = () => {
    switch (podcast.status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "processing":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (podcast.status) {
      case "completed":
        return "Ready";
      case "processing":
        return "Processing...";
      case "error":
        return "Failed";
      default:
        return "Pending";
    }
  };

  const getStatusColor = () => {
    switch (podcast.status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "processing":
        return "text-blue-600 bg-blue-50";
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{podcast.title}</h3>
          {podcast.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{podcast.description}</p>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-4">
        {getStatusIcon()}
        <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Length:</span>
          <span className="font-medium text-gray-900">{podcast.length}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Created:</span>
          <span className="font-medium text-gray-900">
            {new Date(podcast.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {podcast.status === "error" && podcast.errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{podcast.errorMessage}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {podcast.status === "completed" && (
          <button
            onClick={() => onView(podcast)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Play className="w-4 h-4" />
            View
          </button>
        )}
        <button
          onClick={() => onDelete(podcast.id)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
