import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ApprovalModalProps {
  isOpen: boolean;
  onOpenChange: (value: boolean) => void;
  guestToApprove: any;
  setGuestToApprove: (value: any) => void;
  socket: any;
  roomId: string;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onOpenChange,
  guestToApprove,
  setGuestToApprove,
  socket,
  roomId,
}) => {
  const handleApprove = () => {
    socket.current.emit("approveJoin", {
      roomId,
      guestSocketId: guestToApprove.guestSocketId,
      approved: true,
    });
    setGuestToApprove(null);
    onOpenChange(false);
  };

  const handleDeny = () => {
    socket.current.emit("approveJoin", {
      roomId,
      guestSocketId: guestToApprove.guestSocketId,
      approved: false,
    });
    setGuestToApprove(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2641] text-white border-[#2a3551]">
        <DialogHeader>
          <DialogTitle>Guest Approval</DialogTitle>
        </DialogHeader>
        <p>A guest (ID: {guestToApprove?.guestId}) wants to join. Approve?</p>
        <div className="flex gap-2">
          <Button
            onClick={handleApprove}
            className="bg-green-500 hover:bg-green-600"
          >
            Approve
          </Button>
          <Button onClick={handleDeny} className="bg-red-500 hover:bg-red-600">
            Deny
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
