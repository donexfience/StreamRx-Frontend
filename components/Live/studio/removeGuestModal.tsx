import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RemoveGuestModalProps {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  confirmRemoveGuest: () => void;
}

export const RemoveGuestModal: React.FC<RemoveGuestModalProps> = ({
  isOpen,
  onOpenChange,
  confirmRemoveGuest,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2641] text-white border-[#2a3551]">
        <DialogHeader>
          <DialogTitle>Remove Guest</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to remove this guest?</p>
        <div className="flex gap-2">
          <Button onClick={confirmRemoveGuest} className="bg-red-500 hover:bg-red-600">
            Yes
          </Button>
          <Button onClick={() => onOpenChange(false)} className="bg-gray-500 hover:bg-gray-600">
            No
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};