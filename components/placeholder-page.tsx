import { type LucideIcon } from "lucide-react";

type PlaceholderPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: PlaceholderPageProps) {
  return (
    <div className="mx-auto w-full max-w-none space-y-6">
      <section className="rounded-[28px] bg-[#fcf8e9] p-8 shadow-md shadow-[#4e342e]/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4e342e] text-[#fcf8e9] shadow-sm">
            <Icon size={28} />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-[#4e342e]">
              {title}
            </h1>
            <p className="text-sm leading-6 text-[#4e342e]/75">{description}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-[#fcf8e9] p-6 shadow-md shadow-[#4e342e]/10">
          <h2 className="text-lg font-semibold text-[#4e342e]">준비 중</h2>
          <p className="mt-2 text-sm leading-6 text-[#4e342e]/75">
            이 화면은 사이드바 메뉴 연결을 위해 먼저 추가되었습니다.
          </p>
        </div>
        <div className="rounded-2xl bg-[#fcf8e9] p-6 shadow-md shadow-[#4e342e]/10">
          <h2 className="text-lg font-semibold text-[#4e342e]">다음 단계</h2>
          <p className="mt-2 text-sm leading-6 text-[#4e342e]/75">
            실제 목록, 검색, 등록, 편집 기능은 이후 이 페이지에 이어서 붙일 수
            있습니다.
          </p>
        </div>
      </section>
    </div>
  );
}
