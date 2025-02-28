"use client";
import { useEffect, useState } from "react";
import { useGetChannelByEmailQuery } from "@/redux/services/channel/channelApi";
import { useGetChannelStreamsQuery } from "@/redux/services/streaming/streamingApi";
import CreateStreamModal from "@/components/Live/CreateStreamModal";
import { StreamPreviewModal } from "@/components/Live/StreamPreviewModal";
import { WelcomeModal } from "@/components/Live/welcomeModal";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { LiveStudio } from "@/components/Live/LiveStudioComponent";

export default function Page() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showCreateStream, setShowCreateStream] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [users, setUsers] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);

  const handleStartStream = () => {
    setShowWelcome(false);
    setShowCreateStream(true);
  };

  const handleGoLive = () => {
    setShowPreviewModal(false);
    setIsLive(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      const decodeUser = await getUserFromCookies();
      setUsers(decodeUser.user);
    };
    fetchData();
  }, []);

  const { data: channelData, isLoading: channelLoading } =
    useGetChannelByEmailQuery(users?.email, { skip: !users?.email });

  const channelId: any = channelData?._id;

  const {
    data: streams,
    isLoading,
    isError,
    refetch,
  } = useGetChannelStreamsQuery(channelId, {
    skip: !channelId,
  });

  const hasActiveStream = streams?.data?.some(
    (stream: any) => stream.status === "started"
  );

  return (
    <div className="min-h-screen bg-zinc-900 w-full">
      {showWelcome && (
        <WelcomeModal
          onClose={() => setShowWelcome(false)}
          onStartNow={handleStartStream}
          onScheduleLater={handleStartStream}
        />
      )}
      {showCreateStream && (
        <CreateStreamModal
          onClose={() => setShowCreateStream(false)}
          setShowStreamPreview={setShowPreviewModal}
        />
      )}
      {showPreviewModal && (
        <StreamPreviewModal
          channelId={channelData?._id || ""}
          stream={streams?.data?.[streams.data.length - 1]}
          onClose={() => setShowPreviewModal(false)}
          refetchStreams={refetch}
          onGoLive={handleGoLive}
          isLoading={isLoading}
        />
      )}
      {hasActiveStream && (
        <LiveStudio
          streams={streams?.data?.[streams.data.length - 1]}
          channelData={channelData}
          user={users}
        />
      )}
    </div>
  );
}
