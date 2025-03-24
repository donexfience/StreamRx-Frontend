import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

const FilterTag: React.FC<FilterTagProps> = ({ label, onRemove }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center bg-secondary text-secondary-foreground rounded-md px-3 py-1 text-sm"
    >
      <span>{label}</span>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-5 w-5 ml-1 p-0 hover:bg-secondary-foreground/10" 
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </motion.div>
  );
};

export default FilterTag;
