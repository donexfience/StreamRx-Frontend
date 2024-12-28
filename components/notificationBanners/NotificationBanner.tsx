const NotificationBanner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-4 rounded-lg border border-blue-100/50">
      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs">
        i
      </div>
      <p className="text-sm text-blue-800">{message}</p>
    </div>
  );
};

export default NotificationBanner;