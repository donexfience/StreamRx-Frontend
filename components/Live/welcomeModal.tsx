import { X } from "lucide-react";

export const WelcomeModal: React.FC<{
  onClose: any;
  onStartNow: any;
  onScheduleLater: any;
}> = ({ onClose, onStartNow, onScheduleLater }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-zinc-900 rounded-lg w-full max-w-2xl overflow-hidden">
        <div className="relative">
            <div className="flex  justify-center items-center p-4 gap-3">
            <div className="w-8 h-8 bg-white rounded-full" />
          <div className="w-8 h-8 bg-purple-500 rounded-full" />
          <div className="w-8 h-8 bg-green-400 rounded-full" />
            </div>
   
          <div className="bg-blue-600 h-32 w-full relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-4">
                <img src="/assets/live/modalimage.png" />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-white text-2xl font-semibold text-center mb-2">
            Welcome to the new StreamRx Live Control Room
          </h2>
          <p className="text-gray-400 text-center mb-8">
            When do you want to go live?
          </p>

          {/* Options */}
          <div className="space-y-4">
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">Right now</h3>
                <button
                  onClick={onStartNow}
                  className="bg-white text-black px-4 py-1 rounded-full text-sm"
                >
                  Start
                </button>
              </div>
              <p className="text-gray-400 text-sm">
                Get set up to live stream now. Don't worry, you'll have a chance
                to review settings before you're live.
              </p>
              <a
                href="#"
                className="text-blue-400 text-sm hover:underline mt-1 inline-block"
              >
                Learn more
              </a>
            </div>

            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">Later date</h3>
                <button
                  onClick={onScheduleLater}
                  className="bg-white text-black px-4 py-1 rounded-full text-sm"
                >
                  Start
                </button>
              </div>
              <p className="text-gray-400 text-sm">
                Schedule a stream for a later time. You can even set it up ahead
                of time.
              </p>
              <a
                href="#"
                className="text-blue-400 text-sm hover:underline mt-1 inline-block"
              >
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
