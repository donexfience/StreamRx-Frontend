"use client";
import React from "react";
import { useParams } from "next/navigation";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  SlidersHorizontal,
  Eye,
  Clock,
  Video,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRange {
  from?: Date;
  to?: Date;
}

const FilterButton: React.FC<{
  filters: any;
  dateRange: any;
  activeFilters: any;
}> = ({ filters, dateRange, activeFilters }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={cn("gap-2", activeFilters > 0 && "bg-primary/40")}
        >
          <SlidersHorizontal size={16} />
          Filters {activeFilters > 0 && `(${activeFilters})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-black text-white p-8">
        <DialogHeader>
          <DialogTitle className="text-white">Filters</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {/* Calendar Section - Full Width */}
          <div className="mb-6">
            <label className="text-sm font-medium text-white">
              Upload Date
            </label>
            <Calendar
              mode="range"
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) =>
                filters.setDateRange({
                  from: range?.from,
                  to: range?.to,
                })
              }
              className="rounded-md border bg-black text-white mt-2"
            />
          </div>

          <Separator className="bg-gray-700 mb-6" />

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-white" />
                  <label className="text-sm font-medium text-white">
                    Visibility
                  </label>
                </div>
                <Select
                  value={filters.values.visibility}
                  onValueChange={(value) =>
                    filters.setFilters((prev: any) => ({
                      ...prev,
                      visibility: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full bg-black text-white">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-white" />
                  <label className="text-sm font-medium text-white">
                    Status
                  </label>
                </div>
                <Select
                  value={filters.values.status}
                  onValueChange={(value) =>
                    filters.setFilters((prev: any) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full bg-black text-white">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Video size={16} className="text-white" />
                  <label className="text-sm font-medium text-white">Type</label>
                </div>
                <Select
                  value={filters.values.videoType}
                  onValueChange={(value) =>
                    filters.setFilters((prev: any) => ({
                      ...prev,
                      videoType: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full bg-black text-white">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="stream">Stream</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-white" />
                  <label className="text-sm font-medium text-white">
                    Category
                  </label>
                </div>
                <Select
                  value={filters.values.category}
                  onValueChange={(value) =>
                    filters.setFilters((prev: any) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-full bg-black text-white">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-black text-white">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SearchResults = () => {
  const params = useParams();
  const { q } = params;
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [filters, setFilters] = React.useState({
    visibility: "all",
    status: "all",
    videoType: "all",
    category: "all",
  });

  // Count active filters
  const activeFilters =
    Object.values(filters).filter((value) => value !== "all").length +
    (dateRange.from && dateRange.to ? 1 : 0);

  const queryParams = {
    searchQuery: q as string,
    visibility: filters.visibility !== "all" ? filters.visibility : undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    videoType: filters.videoType !== "all" ? filters.videoType : undefined,
    category: filters.category !== "all" ? filters.category : undefined,
    ...(dateRange.from && dateRange.to
      ? {
          dateRange: {
            start: dateRange.from,
            end: dateRange.to,
          },
        }
      : {}),
  };

  const {
    data: searchResults,
    isLoading,
    error,
  } = useSearchVideosQuery(queryParams);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h3 className="text-2xl font-semibold mb-2">Error Loading Results</h3>
        <p className="text-gray-500">Please try again later</p>
      </div>
    );
  }

  if (!Array.isArray(searchResults?.data) || !searchResults.data?.length) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h3 className="text-2xl font-semibold mb-2">No Videos Found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black text-white p-8">
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60 border-b border-gray-700">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">
                Search results for "{q}"
              </h1>
              <p className="text-sm text-gray-400">
                {searchResults.data.length} results
              </p>
            </div>
            <FilterButton
              filters={{
                values: filters,
                setFilters,
                setDateRange,
              }}
              dateRange={dateRange}
              activeFilters={activeFilters}
            />
          </div>
        </div>
      </div>

      {/* Video List */}
      <div className="container py-6">
        <div className="space-y-6">
          {searchResults.data.map((video: any, index: any) => (
            <Card
              key={video.id || index}
              className="flex overflow-hidden hover:bg-gray-800 transition-colors bg-gray-900"
            >
              {/* Thumbnail */}
              <div className="w-80 relative aspect-video">
                <img
                  src={video.thumbnailUrl || "/api/placeholder/400/225"}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 text-sm rounded">
                  {video.metadata?.duration || "2:41"}
                </div>
              </div>

              {/* Video Details */}
              <CardContent className="flex-1 p-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={video.channelAvatar || "/api/placeholder/40/40"}
                      alt={video.channelName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-white font-semibold text-lg line-clamp-2">
                      {video.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-400">
                      <span>{video.engagement?.viewCount || "412"} views</span>
                      <span className="mx-2">•</span>
                      <span>{video.uploadedAt || "1 hour ago"}</span>
                    </div>
                    <p className="text-sm text-gray-400 line-clamp-2 mt-2">
                      {video.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
