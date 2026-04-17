export function BackgroundGlow() {
  return (
    <>
      <div className="absolute left-0 top-0 h-[500px] w-[500px] rounded-full bg-pink-600/20 blur-[180px]" />
      <div className="absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-purple-700/10 blur-[180px]" />
    </>
  );
}