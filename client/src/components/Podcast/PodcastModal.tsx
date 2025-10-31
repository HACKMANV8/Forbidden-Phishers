import { Podcast } from "@/types/podcasts";
import { X, Download } from "lucide-react";

interface PodcastModalProps {
  podcast: Podcast;
  isOpen: boolean;
  onClose: () => void;
}

export default function PodcastModal({ podcast, isOpen, onClose }: PodcastModalProps) {
  if (!isOpen) return null;

  const API_BASE = "http://localhost:3000";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{podcast.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {podcast.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600">{podcast.description}</p>
            </div>
          )}

          {/* Video Player */}
          {podcast.videoPath && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Video</h3>
              <video
                controls
                className="w-full rounded-lg shadow-lg"
                src={`${API_BASE}${podcast.videoPath}`}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Script */}
          {podcast.script && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Script</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {podcast.script}
                </pre>
              </div>
            </div>
          )}

          {/* Download Buttons */}
          <div className="flex gap-3">
            {podcast.videoPath && (
              <a
                href={`${API_BASE}${podcast.videoPath}`}
                download
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Video
              </a>
            )}
            {podcast.audioPath && podcast.audioPath !== podcast.videoPath && (
              <a
                href={`${API_BASE}${podcast.audioPath}`}
                download
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Audio
              </a>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Length</p>
              <p className="font-medium text-gray-900">{podcast.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium text-gray-900 capitalize">{podcast.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium text-gray-900">
                {new Date(podcast.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Updated</p>
              <p className="font-medium text-gray-900">
                {new Date(podcast.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
