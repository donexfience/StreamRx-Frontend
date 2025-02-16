import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useSearchVideosQuery } from "@/redux/services/channel/videoApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRange {
  from?: Date;
  to?: Date;
}

const SearchResults = () => {
  const router = useRouter();
  const { q } = router.query;
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [filters, setFilters] = React.useState({
    visibility: "",
    status: "",
    videoType: "",
    category: "",
  });

  const {
    data: searchResults,
    isLoading,
    error,
  } = useSearchVideosQuery({
    searchQuery: q as string,
    visibility: filters.visibility,
    status: filters.status,
    videoType: filters.videoType,
    category: filters.category,
    dateRange: {
      start: dateRange.from as Date,
      end: dateRange.to as Date,
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <h3 className="text-2xl font-semibold mb-2">Error Loading Results</h3>
        <p className="text-gray-500">Please try again later</p>
      </div>
    );
  }

  if (!Array.isArray(searchResults) || !searchResults.length) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <h3 className="text-2xl font-semibold mb-2">No Videos Found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      {/* Filters Section */}
      <div className="mb-6 flex flex-wrap gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from
                ? dateRange.to
                  ? `${format(dateRange.from, "PPP")} - ${format(
                      dateRange.to,
                      "PPP"
                    )}`
                  : format(dateRange.from, "PPP")
                : "Date Range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              selected={{
                from: dateRange.from || undefined,
                to: dateRange.to || undefined,
              }}
              onSelect={(range) =>
                setDateRange({
                  from: range?.from,
                  to: range?.to,
                })
              }
            />
          </PopoverContent>
        </Popover>

        <Select
          value={filters.visibility}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, visibility: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="unlisted">Unlisted</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, status: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.videoType}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, videoType: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Video Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stream">Stream</SelectItem>
            <SelectItem value="video">Video</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.category}
          onValueChange={(value) =>
            setFilters((prev) => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gaming">Gaming</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="entertainment">Entertainment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map((video: any, index: any) => (
          <Card key={video.id || index} className="overflow-hidden">
            <div className="relative pt-[56.25%]">
              <img
                src={video.thumbnail || "/api/placeholder/400/225"}
                alt={video.title}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-1 text-sm rounded">
                {video.duration || "2:41"}
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={video.channelAvatar || "/api/placeholder/40/40"}
                    alt={video.channelName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {video.channelName}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span>{video.views || "412"} views</span>
                    <span className="mx-1">•</span>
                    <span>{video.uploadedAt || "1 hour ago"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
