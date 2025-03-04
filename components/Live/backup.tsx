
{participants.map((participant, index) => (
    <motion.div
      key={index}
      className={`rounded-md overflow-hidden relative w-full bg-black ${getParticipantPosition(
        participant,
        participants.length
      )} h-full z-10`}
      layout
      transition={{ duration: 0.3 }}
    >
      {participant === user?.username && (
        <>
          <AnimatePresence>
            {isScreenSharing ? (
              <motion.div
                key="screen"
                className="w-full h-full relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ) : isCameraOn ? (
              <motion.div
                key="webcam"
                className="w-full h-full relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <video
                  ref={webcamVideoRef}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  className="w-full h-full object-cover"
                  style={{
                    transform: isMirrored
                      ? "scaleX(-1)"
                      : "scaleX(1)",
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="off"
                className="w-full h-full flex items-center justify-center bg-gray-800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-24 h-24 rounded-full bg-blue-700 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {userInitials}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isScreenSharing && isCameraOn && (
            <motion.div
              className="absolute top-2 right-2 w-32 h-24 rounded-md overflow-hidden bg-black z-20"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <video
                ref={webcamVideoRef}
                autoPlay
                playsInline
                muted={isMuted}
                className="w-full h-full object-cover"
                style={{
                  transform: isMirrored
                    ? "scaleX(-1)"
                    : "scaleX(1)",
                }}
              />
            </motion.div>
          )}
        </>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-[#0a152c40] z-10">
        <span className="text-white text-sm">
          {participant}
        </span>
        {isHost && participant === user?.username && (
          <Badge className="ml-2 bg-green-500 text-xs">
            Host
          </Badge>
        )}
      </div>
    </motion.div>
  ))}

  <div className="absolute bottom-4 left-4 z-10">
    {captions.map((caption) => (
      <motion.div
        key={caption.id}
        className="bg-black/70 text-white p-2 rounded-md mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {caption.text}
      </motion.div>
    ))}
  </div>

  <motion.div
    className="absolute top-2 right-2 flex flex-col gap-1 z-10"
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-1 text-white bg-black/40 rounded-full"
        onClick={toggleVolumeSlider}
      >
        <Volume2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-1 text-white bg-black/40 rounded-full"
        onClick={toggleFullScreen}
      >
        {fullScreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-1 text-white bg-black/40 rounded-full"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#0a152c] border-[#1a2641] text-white">
          <DropdownMenuItem
            onClick={() => setIsMirrored(!isMirrored)}
          >
            <Camera className="mr-2 h-4 w-4" />
            {isMirrored ? "Unmirror Camera" : "Mirror Camera"}
          </DropdownMenuItem>
          <DropdownMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                Quality
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0a152c] border-[#1a2641] text-white">
                {qualityOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.label}
                    onClick={() => changeQuality(option.label)}
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <AnimatePresence>
      {showVolumeSlider && (
        <motion.div
          className="bg-black/60 p-2 rounded-md w-32 z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Slider
            defaultValue={[volume]}
            max={100}
            step={1}
            onValueChange={handleVolumeChange}
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <VolumeX className="h-3 w-3 text-white" />
            <Volume2 className="h-3 w-3 text-white" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>

  <motion.div
    className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="bg-[#0a152c] rounded-md p-1 flex">
      {layouts.map((layout) => (
        <Button
          key={layout.id}
          variant="ghost"
          size="sm"
          className={`h-8 w-12 p-1 ${
            selectedLayout === layout.id && !isSingleParticipant
              ? "bg-[#1e3a8a] text-white"
              : "text-gray-400 hover:bg-[#1a2641]"
          }`}
          onClick={() =>
            !isSingleParticipant && setSelectedLayout(layout.id)
          }
          disabled={isSingleParticipant}
        >
          {layout.icon}
        </Button>
      ))}
    </div>
  </motion.div>

  <motion.div
    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10"
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="sm"
                className={`h-10 w-10 p-0 rounded-full ${
                  isMuted
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-[#0a152c] border-[#1a2641] text-white"
                }`}
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            {isMuted ? "Unmute" : "Mute"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="sm"
                className={`h-10 w-10 p-0 rounded-full ${
                  !isCameraOn
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-[#0a152c] border-[#1a2641] text-white"
                }`}
                onClick={toggleCamera}
              >
                <Camera className="h-5 w-5" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            {isCameraOn ? "Turn Off Camera" : "Turn On Camera"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="sm"
                className={`h-10 w-10 p-0 rounded-full ${
                  isScreenSharing
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-[#0a152c] border-[#1a2641] text-white"
                }`}
                onClick={toggleScreenShare}
              >
                <Monitor className="h-5 w-5" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            {isScreenSharing
              ? "Stop Screen Share"
              : "Start Screen Share"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isHost && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full bg-[#0a152c] border-[#1a2641] text-white"
                  onClick={generateInviteLink}
                >
                  <Users className="h-5 w-5" />
                </Button>
              )}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>Invite Guest</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {inviteLink && isHost && (
        <motion.div
          className="absolute top-16 right-4 bg-[#0a152c] p-2 rounded-md text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p>Invite Link: {inviteLink}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInviteLink(null)}
            className="text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0 rounded-full bg-[#0a152c] border-[#1a2641] text-white"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {role === "guest" && isScreenSharing && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 w-10 p-0 rounded-full bg-[#0a152c] border-[#1a2641] text-white"
                  onClick={() =>
                    socket.current?.emit(
                      "requestPointerAccess",
                      { guestId: user?._id }
                    )
                  }
                >
                  <PenTool className="h-5 w-5" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              Request Pointer Access
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  </motion.div>