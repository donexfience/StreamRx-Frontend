import React from "react";

const StreamerChat = () => {
  return (
    <div className="bottom-24 video overlay w-72">
      <div className="flex flex-col rounded-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="text-white font-semibold">Chat</h3>
          <span className="text-red-600 font-bold text-sm">Live</span>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto max-h-64 p-3 space-y-2">
          {[
            { username: "viewer1", message: "This stream is awesome!" },
            { username: "donex", message: "Hey everyone!" },
            { username: "viewer2", message: "When are you starting?" },
          ].map((chat, index) => (
            <div key={index} className=" rounded-lg p-2 text-white">
              <span className="font-bold text-blue-300 mr-2">
                {chat.username}
              </span>
              <span>{chat.message}</span>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="px-3 py-2">
          <div
            className="flex items-center px-3 py-2  border-gray-300 text-white rounded-2xl w-full
          backdrop-blur-lg bg-white/10 hover:bg-blue-500 hover:text-white transition"
          >
            <input
              type="text"
              placeholder="Send a message"
              className="bg-transparent w-full outline-none text-white placeholder-gray-300"
            />
            <button className="ml-2 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamerChat;
