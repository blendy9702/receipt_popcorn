"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rounded-2xl p-3 text-gray-900", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-4",
        month_caption: "relative flex h-9 items-center justify-center px-10",
        caption_label: "pointer-events-none select-none text-sm font-medium",
        nav: "absolute left-12 right-12 top-4 z-10 flex items-center justify-between",
        button_previous:
          "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 aria-disabled:opacity-50",
        button_next:
          "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 aria-disabled:opacity-50",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "w-9 text-xs font-normal text-gray-500",
        week: "mt-2 flex w-full",
        day: "relative h-9 w-9 rounded-full p-0 text-center text-sm",
        day_button:
          "h-9 w-9 rounded-full p-0 font-normal hover:bg-gray-200 focus:bg-gray-200 data-[selected]:bg-black data-[selected]:text-white data-[selected]:hover:bg-gray-800 data-[selected]:ring-0",
        today: "ring-2 ring-gray-400 ring-inset aria-selected:ring-0",
        outside: "text-gray-400 opacity-50",
        disabled: "text-gray-400 opacity-50",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
