
import { useState } from 'react';

const ThemeToggle = ({
  onToggle,
  isDarkMode,
}: {
  onToggle: () => void;
  isDarkMode: boolean;
}) => {
  return (
    <button
      onClick={onToggle}
      className="p-2 bg-gray-200 rounded dark:bg-gray-800"
    >
      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};

export default ThemeToggle;
