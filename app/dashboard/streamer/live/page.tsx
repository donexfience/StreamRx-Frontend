"use client";
import { useEffect, useState } from "react";
import { useGetChannelByEmailQuery } from "@/redux/services/channel/channelApi";
import { useGetChannelStreamsQuery } from "@/redux/services/streaming/streamingApi";
import CreateStreamModal from "@/components/Live/CreateStreamModal";
import { StreamPreviewModal } from "@/components/Live/StreamPreviewModal";
import { WelcomeModal } from "@/components/Live/welcomeModal";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { LiveStudio } from "@/components/Live/LiveStudioComponent";
import { useGetUserQuery } from "@/redux/services/user/userApi";

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

  const {
    data: userData,
    isLoading: isUserDataLoading,
    error: userError,
    refetch: refetchUser,
  } = useGetUserQuery(
    { email: users?.email },
    {
      skip: !users?.email,
      pollingInterval: 0,
      refetchOnMountOrArgChange: true,
    }
  );

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

  console.log(streams, "got streams");

  // Check if there's an active ("pending" or "started") stream
  const hasActiveStream = streams?.data?.some(
    (stream: any) => stream.status === "started" || stream.status === "pending"
  );

  // Determine if the last stream is "stopped"
  const lastStream = streams?.data?.[streams?.data?.length - 1];
  const isLastStreamStopped = lastStream?.status === "stopped";

  console.log(userData?.user, "user got in the live page");
  console.log(
    "hasActiveStream:",
    hasActiveStream,
    "isLastStreamStopped:",
    isLastStreamStopped
  );

  useEffect(() => {
    if (hasActiveStream) {
      setShowCreateStream(false);
      setShowPreviewModal(false);
      setShowWelcome(false);
    } else if (isLastStreamStopped) {
      setShowCreateStream(true);
      setShowWelcome(false);
    }
  }, [hasActiveStream, isLastStreamStopped]);

  return (
    <div className="min-h-screen bg-zinc-900 w-full">
      {showWelcome && (
        <WelcomeModal
          onClose={() => setShowWelcome(false)}
          onStartNow={handleStartStream}
          onScheduleLater={handleStartStream}
        />
      )}
      {showCreateStream && !hasActiveStream && (
        <CreateStreamModal
          onClose={() => setShowCreateStream(false)}
          setShowStreamPreview={setShowPreviewModal}
        />
      )}
      {showPreviewModal && hasActiveStream && (
        <StreamPreviewModal
          channelId={channelData?._id || ""}
          stream={lastStream}
          onClose={() => setShowPreviewModal(false)}
          onCloseCreateStream={() => setShowCreateStream(false)}
          refetchStreams={refetch}
          onGoLive={handleGoLive}
          isLoading={isLoading}
        />
      )}
      {hasActiveStream && (
        <LiveStudio
          streams={lastStream}
          channelData={channelData}
          user={userData?.user}
        />
      )}
    </div>
  );
}
