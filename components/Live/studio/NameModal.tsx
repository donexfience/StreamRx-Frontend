import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NameModalProps {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  inputName: string;
  setInputName: (value: string) => void;
  setGuestName: (value: string | null) => void;
  socket: any;
  roomId: string;
  user: any;
  setPendingApproval: (value: boolean) => void;
}

export const NameModal: React.FC<NameModalProps> = ({
  isOpen,
  onOpenChange,
  inputName,
  setInputName,
  setGuestName,
  socket,
  roomId,
  user,
  setPendingApproval,
}) => {
  const handleNameSubmit = () => {
    if (inputName.trim()) {
      setGuestName(inputName);
      socket.current.emit("requestJoin", { roomId, userId: user?._id || "guest_" + Date.now(), guestName: inputName });
      setPendingApproval(true);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2641] text-white border-[#2a3551]">
        <DialogHeader>
          <DialogTitle>Enter Your Name</DialogTitle>
        </DialogHeader>
        <Input
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="Your name"
          className="bg-[#2a3551] text-white border-none"
        />
        <Button onClick={handleNameSubmit} className="bg-[#ff4d00] hover:bg-[#e64500]">
          Submit
        </Button>
      </DialogContent>
    </Dialog>
  );
};