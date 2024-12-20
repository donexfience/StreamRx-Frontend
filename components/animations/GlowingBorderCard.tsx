export const GlowingBorderCard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="relative rounded-lg p-[2px] bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500">
      <div className="absolute -inset-[1px] bg-gradient-to-r from-pink-600 via-orange-500 to-yellow-500 rounded-2xl opacity-75 blur-sm" />
      <div className="relative rounded-2xl bg-black overflow-hidden px-6 py-2">
        {" "}

        {children}
      </div>
    </div>
  );
};
