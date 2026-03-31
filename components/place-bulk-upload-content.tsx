"use client";

import { useMemo, useRef, useState, type DragEvent } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type PlaceBulkUploadContentProps = {
  className?: string;
};

const cardClassName =
  "rounded-[30px] border border-white/70 bg-[#fcf8e9]/96 shadow-[0_24px_70px_rgba(78,52,46,0.16)] backdrop-blur-xl";

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function PlaceBulkUploadContent({
  className = "",
}: PlaceBulkUploadContentProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileSummary = useMemo(() => {
    if (!file) return "선택된 파일 없음";
    return `${file.name} · ${formatFileSize(file.size)}`;
  }, [file]);

  const acceptFile = (nextFile: File | null) => {
    if (!nextFile) return;

    const lower = nextFile.name.toLowerCase();
    if (!lower.endsWith(".xls") && !lower.endsWith(".xlsx")) {
      toast.error("엑셀 파일(xls, xlsx)만 업로드할 수 있습니다.");
      return;
    }

    setFile(nextFile);
    toast.success("엑셀 파일이 선택되었습니다.");
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    acceptFile(event.dataTransfer.files[0] ?? null);
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("업로드할 엑셀 파일을 먼저 선택해 주세요.");
      return;
    }

    toast.success(`${file.name} 업로드를 준비했습니다.`);
  };

  return (
    <section
      className={`${cardClassName} relative w-full max-w-[1020px] overflow-hidden p-5 sm:p-6 lg:p-8 ${className}`.trim()}
    >
      <div className="pr-12">
        <h1 className="text-[28px] font-bold tracking-tight text-[#4e342e] sm:text-[32px]">
          플레이스 대량등록
        </h1>
      </div>

      <div className="mt-6 rounded-[28px] border border-dashed border-[#4e342e]/18 bg-white/40 p-4 sm:mt-8 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 border-b border-[#4e342e]/12 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-[20px] font-semibold tracking-tight text-[#4e342e] sm:text-[22px]">
            엑셀 파일 업로드
          </div>

          <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
            <input
              ref={inputRef}
              type="file"
              accept=".xls,.xlsx"
              className="hidden"
              onChange={(event) => acceptFile(event.target.files?.[0] ?? null)}
            />
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-[#d9dde5] bg-white px-5 text-[14px] font-medium text-[#4e342e] hover:bg-gray-50"
              onClick={() => inputRef.current?.click()}
            >
              파일 선택
            </Button>
            <div className="flex min-w-0 items-center rounded-xl border border-[#d9dde5] bg-white px-4 py-3 text-[14px] text-[#4e342e]/60 shadow-sm xl:min-w-[260px]">
              <span className="truncate">{fileSummary}</span>
            </div>
            <Button
              type="button"
              variant="glass"
              className="h-11 rounded-full border border-[#ffa000]/70 bg-[#fff3d6] px-5 text-[14px] font-semibold text-[#4e342e] hover:bg-[#ffe9b0]"
              onClick={handleUpload}
            >
              업로드
            </Button>
          </div>
        </div>

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`mt-5 flex min-h-[280px] cursor-pointer items-start justify-center rounded-[24px] border bg-white/55 px-5 py-8 text-center transition-colors sm:min-h-[330px] sm:px-6 sm:py-10 ${
            isDragging
              ? "border-[#ffa000]/55 bg-[#fff6e2]"
              : "border-[#e5e7eb]"
          }`}
        >
          <div className="flex max-w-[480px] flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff3d6] text-[#ffa000] shadow-sm">
              {file ? <FileSpreadsheet size={28} /> : <Upload size={28} />}
            </div>
            <p className="mt-5 whitespace-pre-line break-keep text-[15px] leading-7 text-[#4e342e]/58">
              {file
                ? `${file.name}\n업로드 버튼을 누르면 일괄 등록을 진행할 수 있습니다.`
                : "엑셀 파일을 이 영역에 드래그&드롭하면 바로 업로드됩니다.\n(xls, xlsx 파일만 업로드 가능합니다.)"}
            </p>
          </div>
        </label>
      </div>
    </section>
  );
}
