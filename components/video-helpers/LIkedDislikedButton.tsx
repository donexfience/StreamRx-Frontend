import React from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const LikeDislikeButtons = ({
  likeCount = 0,
  dislikeCount = 0,
  isLiked = false,
  isDisliked = false,
  onLike = () => {},
  onDislike = () => {},
  disabled = false,
}) => {
  return (
    <div className="flex bg-gray-800 rounded-full">
      <button
        onClick={onLike}
        disabled={disabled}
        className={`flex items-center gap-1 p-2 rounded-l transition-colors
          ${isLiked ? "text-blue-600" : "text-gray-600"}
          ${
            disabled ? "opacity-50 cursor-not-allowed" : "hover:text-blue-500"
          }`}
      >
        <ThumbsUp
          size={20}
          fill={isLiked ? "currentColor" : "none"}
          className="transition-transform hover:scale-110"
        />
        <span className="text-white">{likeCount}</span>
      </button>

      <button
        onClick={onDislike}
        disabled={disabled}
        className={`flex items-center gap-1 p-2 rounded-r transition-colors
          ${isDisliked ? "text-blue-600" : "text-gray-600"}
          ${
            disabled ? "opacity-50 cursor-not-allowed" : "hover:text-blue-500"
          }`}
      >
        <ThumbsDown
          size={20}
          fill={isDisliked ? "currentColor" : "none"}
          className="transition-transform hover:scale-110"
        />
        <span className="text-white">{dislikeCount}</span>
      </button>
    </div>
  );
};

export default LikeDislikeButtons;
