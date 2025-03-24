

import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowUpIcon, ArrowDownIcon, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatCardProps {
  title: string;
  value: number | string;
  changePercentage?: number;
  avatars?: string[];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, changePercentage, avatars }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border p-5 relative"
    >
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
      
      <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
      
      <div className="flex justify-between items-end">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mt-1"
        >
          <span className="text-4xl font-bold tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          
          {typeof changePercentage === 'number' && (
            <span 
              className={`
                ml-3 text-sm font-medium flex items-center 
                ${changePercentage >= 0 ? 'text-positive' : 'text-destructive'}
              `}
            >
              {changePercentage >= 0 ? 
                <ArrowUpIcon className="mr-1 h-3 w-3" /> : 
                <ArrowDownIcon className="mr-1 h-3 w-3" />
              }
              {Math.abs(changePercentage)}%
            </span>
          )}
        </motion.div>
        
        {avatars && avatars.length > 0 && (
          <div className="flex -space-x-2">
            {avatars.map((avatar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + (i * 0.05), duration: 0.2 }}
              >
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    U{i}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
