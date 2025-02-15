import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DateRangePicker: React.FC<{ onDateRangeChange: any }> = ({
  onDateRangeChange,
}) => {
  const [dateRange, setDateRange] = useState({
    from: undefined,
    to: undefined,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = (update: any) => {
    setError("");

    if (update.to && update.from && update.to < update.from) {
      setError("End date must be after start date");
      return;
    }

    setDateRange(update);
    if (update.from && update.to) {
      onDateRangeChange(update);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`justify-start text-left font-normal w-[300px] ${
              !dateRange.from && "text-muted-foreground"
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Select date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={dateRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="rounded-md border"
          />
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateRangePicker;
