const ParticipantSelectorModal: React.FC<{
  setShowParticipantSelector: any;
  remainingParticipants: any;
  showParticipantSelector: any;
  gridParticipants: any;
  handleParticipantDrop: any;
}> = ({
  showParticipantSelector,
  remainingParticipants,
  gridParticipants,
  handleParticipantDrop,
  setShowParticipantSelector,
}) => {
  if (!showParticipantSelector) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-zinc-800 rounded-lg p-6 w-96">
        <h3 className="text-white font-bold mb-4">Select Participant</h3>
        <div className="space-y-2">
          {remainingParticipants.map((participant: any) => (
            <div
              key={participant.userId}
              className="flex items-center justify-between bg-zinc-700 p-3 rounded-md cursor-pointer hover:bg-zinc-600"
              onClick={() => {
                const emptyIndex = gridParticipants.findIndex(
                  (p: any) => p === null
                );
                if (emptyIndex !== -1) {
                  handleParticipantDrop(participant, emptyIndex);
                  setShowParticipantSelector(false);
                }
              }}
            >
              <span className="text-white">{participant.username}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowParticipantSelector(false)}
          className="mt-4 w-full bg-red-500/20 text-red-400 py-2 rounded-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
