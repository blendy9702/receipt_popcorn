/**
 * blog_nrbrank POPCORN UI — Tailwind 클래스 문자열 모음.
 * 다른 앱에서는 이 파일을 복사하거나 tsconfig paths로 `@components_file/classes` 등 연결해 사용하세요.
 */

/** 기본 본문 카드 */
export const popcornCardClassName =
  "rounded-2xl bg-[#fcf8e9] p-6 shadow-md shadow-[#4e342e]/10 flex flex-col";

/** 그리드에서 stretch 할 때 (mileage 등) */
export const popcornCardClassNameFullHeight =
  "rounded-2xl bg-[#fcf8e9] p-6 shadow-md shadow-[#4e342e]/10 flex flex-col h-full min-h-0";

export const popcornCardCompact =
  "rounded-2xl bg-[#fcf8e9] p-4 shadow-md shadow-[#4e342e]/10 flex flex-col h-full min-h-0";

/** review-permissions/bulk 스타일 카드 (테두리 강조) */
export const popcornCardClassNameBordered =
  "rounded-2xl border border-[#4e342e]/20 bg-[#fcf8e9] p-6 shadow-md shadow-[#4e342e]/10 flex flex-col";

/** 홈 대시보드 큰 카드 (home-client) */
export const popcornDashboardCardClassName =
  "rounded-2xl bg-[#fcf8e9] p-6 shadow-md shadow-[#4e342e]/10 min-h-[420px] flex flex-col";

export const popcornInput =
  "bg-white/80 border-[#4e342e]/25 text-[#4e342e] placeholder:text-[#4e342e]/50 focus-visible:ring-[#4e342e]/30";

export const popcornSelect =
  "bg-white/80 border-[#4e342e]/25 text-[#4e342e] [&>span]:text-[#4e342e]";

export const popcornSelectContent =
  "bg-[#fcf8e9] border-[#4e342e]/20";

export const popcornSelectItem =
  "text-[#4e342e] focus:bg-[#ffa000]/15 cursor-pointer";

export const popcornBtn =
  "text-[#4e342e] hover:bg-[#ffa000]/15 hover:text-[#4e342e] border-[#4e342e]/20";

export const popcornBtnActive = "bg-[#f8d89a] text-[#4e342e]";

/** 얇은 패널 카드 (client, review-permissions) */
export const popcornCard =
  "rounded-2xl border border-[#4e342e]/15 bg-[#ffa000]/5 overflow-hidden";

export const popcornPanel =
  "rounded-2xl border border-[#4e342e]/15 bg-[#ffa000]/5";

/** components/ui/button.tsx `variant.popcorn` 용 (cva variants에 추가) */
export const popcornButtonVariantClass =
  "bg-[#fff8e1] text-[#4e342e] border-[4px] border-[#ffa000] rounded-full hover:bg-[#ffa000]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300";
