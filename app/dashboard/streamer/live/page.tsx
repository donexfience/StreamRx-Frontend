"use client";
import { useEffect, useState } from "react";
import { useGetChannelByEmailQuery } from "@/redux/services/channel/channelApi";
import {
  useEditStreamMutation,
  useGetChannelStreamsQuery,
} from "@/redux/services/streaming/streamingApi";
import CreateStreamModal from "@/components/Live/CreateStreamModal";
import { StreamPreviewModal } from "@/components/Live/StreamPreviewModal";
import { WelcomeModal } from "@/components/Live/welcomeModal";
import { getUserFromCookies } from "@/app/lib/action/auth";
import { LiveStudio } from "@/components/Live/LiveStudioComponent";
import { useGetUserQuery } from "@/redux/services/user/userApi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Page() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showCreateStream, setShowCreateStream] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [users, setUsers] = useState<any>(null);
  const [isLive, setIsLive] = useState(false);
  const router = useRouter();

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

  const { data: userData, isLoading: isUserDataLoading } = useGetUserQuery(
    { email: users?.email },
    { skip: !users?.email, refetchOnMountOrArgChange: true }
  );

  const { data: channelData, isLoading: channelLoading } =
    useGetChannelByEmailQuery(users?.email, {
      skip: !users?.email,
    });

  const channelId: any = channelData?._id;
  const {
    data: streams,
    isLoading,
    refetch,
  } = useGetChannelStreamsQuery(channelId, { skip: !channelId });

  const [updateStreamStatus] = useEditStreamMutation();

  const startedStream = streams?.data?.find(
    (stream: any) => stream.status === "started"
  );
  const pendingStream = streams?.data?.find(
    (stream: any) => stream.status === "pending" && !stream.schedule?.dateTime
  );
  const scheduledStreams = streams?.data
    ?.filter((stream: any) => stream.schedule?.dateTime)
    ?.sort(
      (a: any, b: any) =>
        new Date(a.schedule.dateTime).getTime() -
        new Date(b.schedule.dateTime).getTime()
    );

  useEffect(() => {
    // Update to check for scheduled streams as well
    if (
      startedStream ||
      pendingStream ||
      (scheduledStreams && scheduledStreams.length > 0)
    ) {
      setShowCreateStream(false);
      setShowWelcome(false);
      if (pendingStream) setShowPreviewModal(true);
    } else {
      setShowWelcome(true);
      setShowPreviewModal(false);
    }
  }, [startedStream, pendingStream, scheduledStreams]);

  const handleStartScheduledStream = async (streamId: string) => {
    if (startedStream || pendingStream) {
      alert("An active stream is already running.");
      return;
    }
    try {
      await updateStreamStatus({
        id: streamId,
        updateData: { status: "started" },
      }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to start scheduled stream:", error);
    }
  };

  const isWithinWindow = (scheduleTime: string) => {
    const now = new Date();
    const scheduled = new Date(scheduleTime);
    const timeDiff = (scheduled.getTime() - now.getTime()) / (1000 * 60);
    return timeDiff <= 5 && timeDiff >= -5;
  };

  const earliestAccessibleStream = scheduledStreams?.find((stream: any) =>
    isWithinWindow(stream.schedule.dateTime)
  );

  return (
    <div className="min-h-screen bg-zinc-900 w-full">
      {showWelcome &&
        !startedStream &&
        !pendingStream &&
        !scheduledStreams?.length && (
          <WelcomeModal
            onClose={() => {
              setShowWelcome(false);
              router.replace("/dashboard/streamer/main");
            }}
            onStartNow={handleStartStream}
            onScheduleLater={handleStartStream}
          />
        )}
      {!startedStream &&
        !pendingStream &&
        !showWelcome &&
        !earliestAccessibleStream && (
          <Button onClick={() => setShowCreateStream(true)}>
            Create Stream
          </Button>
        )}
      {showCreateStream && !startedStream && !pendingStream && (
        <CreateStreamModal
          onClose={() => setShowCreateStream(false)}
          setShowStreamPreview={setShowPreviewModal}
          existingStreams={streams?.data || []}
          refetchStreams={refetch} // Ensure refetch is passed
        />
      )}
      {showPreviewModal && pendingStream && (
        <StreamPreviewModal
          channelId={channelData?._id || ""}
          stream={pendingStream}
          onClose={() => setShowPreviewModal(false)}
          onCloseCreateStream={() => setShowCreateStream(false)}
          refetchStreams={refetch}
          onGoLive={handleGoLive}
          isLoading={isLoading}
        />
      )}
      {startedStream && (
        <LiveStudio
          streams={[startedStream]}
          channelData={channelData}
          user={userData?.user}
          role={"host"}
        />
      )}
      {!startedStream && scheduledStreams?.length > 0 && (
        <div className="p-4">
          <h2 className="text-white text-2xl mb-4">Scheduled Streams</h2>
          <ul>
            {scheduledStreams.map((stream: any, index: number) => {
              const now = new Date();
              const scheduleTime = new Date(stream.schedule.dateTime);
              const timeDiff =
                (scheduleTime.getTime() - now.getTime()) / (1000 * 60);
              const canStart =
                stream === earliestAccessibleStream &&
                isWithinWindow(stream.schedule.dateTime);

              return (
                <li
                  key={stream._id}
                  className="mb-4 flex items-center justify-between bg-zinc-800 p-2 rounded"
                >
                  <div className="text-white">
                    {stream.title} - Scheduled for{" "}
                    {scheduleTime.toLocaleString()}
                    <div className="text-gray-400 text-sm">
                      {timeDiff > 0
                        ? `Starts in ${Math.ceil(timeDiff)} minutes`
                        : "Scheduled time has passed"}
                    </div>
                    {canStart && (
                      <div className="text-green-400 text-sm">
                        You can start this stream now
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleStartScheduledStream(stream._id)}
                    disabled={!canStart}
                    className={canStart ? "bg-blue-600" : "bg-gray-600"}
                  >
                    Start Stream
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
