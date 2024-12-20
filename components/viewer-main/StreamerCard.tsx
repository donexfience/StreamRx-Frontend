interface StreamCardProps {
  title: string;
  streamer: string;
  thumbnail: string;
  isLive?: boolean;
  size?: "large" | "small";
}

export const StreamCard: React.FC<StreamCardProps> = ({
  title,
  streamer,
  thumbnail,
  isLive = true,
  size = "small",
}) => {
  return (
    <div className="relative rounded-xl overflow-hidden h-full">
      <img
        src={thumbnail}
        alt={title}
        className={`w-full object-cover ${
          size === "large" ? "h-[400px]" : "h-full"
        }`}
      />
      {isLive && (
        <span className="absolute top-3 right-3 px-2 py-1 bg-orange-600 text-white text-xs font-medium rounded">
          LIVE
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gray-700 flex-shrink-0" />
          <div>
            <h3 className="text-white font-medium text-sm truncate">
              {streamer}
            </h3>
            <p className="text-gray-300 text-xs truncate">{title}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
