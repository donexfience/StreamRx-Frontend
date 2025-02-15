"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

export function DateRangePicker({
  onSelect,
}: {
  onSelect: (range: DateRange) => void;
}) {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    start: null,
    end: null,
  });

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!dateRange.start || dateRange.end) {
      setDateRange({ start: date, end: null });
    } else if (date < dateRange.start) {
      setDateRange({ start: date, end: dateRange.start });
    } else {
      setDateRange({ ...dateRange, end: date });
    }
  };

  React.useEffect(() => {
    if (dateRange.start && dateRange.end) {
      onSelect(dateRange);
    }
  }, [dateRange, onSelect]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !dateRange.start && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange.start ? (
            dateRange.end ? (
              <>
                {format(dateRange.start, "PPP")} -{" "}
                {format(dateRange.end, "PPP")}
              </>
            ) : (
              format(dateRange.start, "PPP")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={dateRange.start}
          onSelect={handleSelect}
          initialFocus
        />
        {dateRange.start && !dateRange.end && (
          <Calendar
            mode="single"
            selected={dateRange.end}
            onSelect={handleSelect}
            initialFocus
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
