import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mic2, AlertTriangle, RefreshCw } from "lucide-react";
import { podcastService } from "@/services/api";
import { Podcast, CreatePodcastRequest } from "@/types/podcasts";
import PodcastForm from "@/components/Podcast/PodcastForm";
import PodcastCard from "@/components/Podcast/PodcastCard";
import PodcastModal from "@/components/Podcast/PodcastModal";

function PodcastPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  const queryClient = useQueryClient();

  // Check server health
  useEffect(() => {
    const checkServer = async () => {
      const isOnline = await podcastService.checkHealth();
      setServerStatus(isOnline ? "online" : "offline");
    };

    checkServer();
    const interval = setInterval(checkServer, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch podcasts
  const {
    data: podcasts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["podcasts"],
    queryFn: () => podcastService.getAllPodcasts(),
    refetchInterval: 5000, // Refetch every 5 seconds to get status updates
    enabled: serverStatus === "online",
  });

  // Create podcast mutation
  const createMutation = useMutation({
    mutationFn: podcastService.createPodcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
      setShowForm(false);
    },
  });

  // Delete podcast mutation
  const deleteMutation = useMutation({
    mutationFn: podcastService.deletePodcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["podcasts"] });
    },
  });

  const handleCreatePodcast = (data: CreatePodcastRequest) => {
    createMutation.mutate(data);
  };

  const handleDeletePodcast = (id: string) => {
    if (confirm("Are you sure you want to delete this podcast?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewPodcast = (podcast: Podcast) => {
    setSelectedPodcast(podcast);
  };

  if (serverStatus === "offline") {
    return (
      <div className="min-h-screen bg-[#F9F6EE] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-auto text-center border-2 border-[#E4D7B4]">
          <AlertTriangle className="w-16 h-16 text-[#335441] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#335441] mb-2">
            Server Offline
          </h2>
          <p className="text-[#6B8F60] mb-4">
            The AI Podcast server is not running. Please start the server with:
          </p>
          <code className="bg-[#F9F6EE] px-3 py-2 rounded-lg block text-sm text-[#335441]">
            cd server && npm run dev
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6EE]">
      {/* Header */}
      <header className="bg-linear-to-br from-[#335441] to-[#46704A] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Mic2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Podcast Studio</h1>
              <p className="mt-1 text-[#E4D7B4]">
                Create AI-powered podcasts with multi-speaker avatars
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Form */}
        {showForm && (
          <div className="mb-8">
            <div className="bg-linear-to-br from-white to-[#F9F6EE] rounded-2xl shadow-xl p-6 border-2 border-[#E4D7B4]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[#335441]">
                  Create New Podcast
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-[#6B8F60] hover:text-[#335441] font-medium"
                >
                  Cancel
                </button>
              </div>
              <PodcastForm
                onSubmit={handleCreatePodcast}
                isLoading={createMutation.isPending}
              />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-linear-to-br from-red-50 to-white border-2 border-red-200 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-[#335441] mr-2" />
              <p className="text-[#335441] font-medium">
                Failed to load podcasts. Please try again.
              </p>
            </div>
          </div>
        )}

        {/* Podcasts Grid */}
        {!showForm && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#335441]">
                Your Podcasts ({podcasts.length})
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => refetch()}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-[#335441] bg-white border-2 border-[#A9B782] rounded-lg hover:bg-[#F9F6EE] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Reload
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-6 py-2 bg-[#335441] text-white rounded-lg hover:bg-[#46704A] transition-all shadow-lg hover:shadow-xl font-semibold"
                >
                  <Mic2 className="w-4 h-4" />
                  Create New Podcast
                </button>
              </div>
            </div>

            {isLoading && serverStatus === "checking" ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-[#335441] animate-spin" />
                <span className="ml-2 text-[#6B8F60] font-medium">Loading podcasts...</span>
              </div>
            ) : podcasts.length === 0 ? (
              <div className="text-center py-16 bg-linear-to-br from-white to-[#F9F6EE] rounded-2xl border-2 border-[#E4D7B4] shadow-xl">
                <div className="w-20 h-20 bg-linear-to-br from-[#335441] to-[#6B8F60] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Mic2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#335441] mb-2">
                  No podcasts yet
                </h3>
                <p className="text-[#6B8F60] mb-6 text-lg">
                  Create your first AI-powered podcast
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-[#335441] text-white px-8 py-4 rounded-lg font-bold text-lg shadow-xl hover:bg-[#46704A] transition-all"
                >
                  Create Your First Podcast
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {podcasts.map((podcast) => (
                  <PodcastCard
                    key={podcast.id}
                    podcast={podcast}
                    onDelete={handleDeletePodcast}
                    onView={handleViewPodcast}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Podcast Modal */}
      {selectedPodcast && (
        <PodcastModal
          podcast={selectedPodcast}
          isOpen={!!selectedPodcast}
          onClose={() => setSelectedPodcast(null)}
        />
      )}
    </div>
  );
}

export default PodcastPage;
