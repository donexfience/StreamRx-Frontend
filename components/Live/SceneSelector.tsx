import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, Monitor, ImageIcon } from 'lucide-react';

interface Scene {
  id: string;
  name: string;
  isActive: boolean;
  type: 'webcam' | 'screen' | 'media';
  mediaUrl?: string;
}

interface SceneSelectorProps {
  scenes: Scene[];
  selectScene: (id: string) => void;
  role: 'host' | 'guest';
}

export const SceneSelector: React.FC<SceneSelectorProps> = React.memo(({ scenes, selectScene, role }) => {
  const handleSelectScene = useCallback((id: string) => {
    if (role === 'host') {
      selectScene(id);
    }
  }, [role, selectScene]);

  return (
    <div className="space-y-2 h-full">
      {scenes.map((scene) => (
        <motion.div
          key={scene.id}
          className={`p-2 rounded cursor-pointer ${
            scene.isActive
              ? 'bg-[#1a2641] border-l-2 border-[#ff4d00]'
              : 'hover:bg-[#1a2641]'
          }`}
          onClick={() => handleSelectScene(scene.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-full h-12 bg-gradient-to-br from-[#e91e63] to-[#2196f3] rounded mb-1 flex justify-center items-center">
              {scene.type === 'webcam' && <User className="h-5 w-5 text-white" />}
              {scene.type === 'screen' && <Monitor className="h-5 w-5 text-white" />}
              {scene.type === 'media' && scene.mediaUrl && <ImageIcon className="h-5 w-5 text-white" />}
            </div>
            <span className="text-xs text-white">{scene.name}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
});