import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MediaModalProps {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  handleAddMediaScene: (
    event: React.FormEvent<HTMLFormElement>
  ) => Promise<void>;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onOpenChange,
  handleAddMediaScene,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2641] text-white border-[#2a3551]">
        <DialogHeader>
          <DialogTitle>Add Media Scene</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddMediaScene} className="space-y-4">
          <Input
            type="file"
            accept="image/*,video/*"
            className="bg-[#2a3551] text-white border-none"
          />
          <Button type="submit" className="bg-[#ff4d00] hover:bg-[#e64500]">
            Add Scene
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
