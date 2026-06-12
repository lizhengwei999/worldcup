export function WorldCupHeader() {
  return (
    <header className="font-sanscn relative -mx-3 -mt-6 overflow-hidden px-7 pb-8 pt-9 text-paper">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#063FA8] via-[#0A6BEF] to-[#1683FF]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_92%_8%,rgba(189,253,56,0.14),transparent_38%),radial-gradient(circle_at_12%_88%,rgba(36,184,242,0.35),transparent_48%)]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent via-[#0B55D9]/40 to-[#0B55D9]"
        aria-hidden
      />

      <div className="relative">
        <h1 className="inline-block whitespace-nowrap text-[38px] font-black leading-none tracking-normal text-paper min-[390px]:text-[44px]">
          2026<span className="text-[#BDFD38]">美加墨</span>
          <span className="relative inline-block pb-4">
            世界杯
            <svg
              aria-hidden
              className="absolute bottom-0 left-0 h-3 w-full"
              preserveAspectRatio="none"
              viewBox="0 0 120 14"
            >
              <path
                d="M2 9 C34 12 82 12 118 5"
                fill="none"
                stroke="#BDFD38"
                strokeLinecap="round"
                strokeWidth="5"
              />
            </svg>
          </span>
        </h1>

        <p className="mt-7 text-[18px] font-medium leading-none tracking-[0.14em] text-paper">
          FIFA World Cup 2026
        </p>
        <p className="mt-5 text-[18px] font-black leading-none text-paper">
          北京时间：6月12日-7月20日
        </p>
      </div>
    </header>
  );
}
