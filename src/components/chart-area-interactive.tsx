// src/components/chart-area-interactive.tsx
"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

// Helper function to generate sample chart data for a given number of days
// This creates a realistic-looking trend for demonstration purposes.
// In a real application, this data would be fetched from an API.
const generateChartData = (days: number) => {
  const data = [];
  const today = new Date(); // Get current date
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i); // Go back 'i' days from today
    const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Generate somewhat random but trending visitor numbers
    const baseDesktop = 500 + Math.sin(i * 0.2) * 200 + Math.random() * 50;
    const baseMobile = 300 + Math.cos(i * 0.15) * 150 + Math.random() * 30;

    data.push({
      date: formattedDate,
      desktop: Math.max(100, Math.floor(baseDesktop)), // Ensure minimum visitors
      mobile: Math.max(50, Math.floor(baseMobile)),
    });
  }
  return data;
};

// Generate initial chart data for the last 90 days
// This can be replaced with an actual API call in a useEffect hook.
const initialChartData = generateChartData(90);

// Configuration for the chart, defining labels and colors for each data key
const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
    color: "var(--color-desktop)", // Uses CSS variable for color
  },
  mobile: {
    label: "Mobile",
    color: "var(--color-mobile)", // Uses CSS variable for color
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const isMobile = useIsMobile(); // Custom hook to detect mobile view
  const [timeRange, setTimeRange] = React.useState("90d"); // State for selected time range
  const [chartData, setChartData] = React.useState(initialChartData); // State for chart data
  const [loading, setLoading] = React.useState(true); // State for loading status

  // Use a ref to store the reference date (today) to ensure it's stable across renders
  const referenceDate = React.useRef(new Date());

  // Effect to set default time range to "7d" if on mobile on initial load
  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Effect to simulate fetching data based on timeRange (replace with actual API call)
  React.useEffect(() => {
    setLoading(true);
    const fetchChartData = async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const days = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90;
      setChartData(generateChartData(days)); // Generate new data based on time range
      setLoading(false);
    };

    fetchChartData();
  }, [timeRange]); // Re-fetch when timeRange changes

  // Memoized function to filter chart data based on selected time range
  const filteredData = React.useMemo(() => {
    const days = timeRange === "30d" ? 30 : timeRange === "7d" ? 7 : 90;
    const endDate = referenceDate.current;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days);

    // Filter the current chartData state
    return chartData.filter((item) => new Date(item.date) >= startDate);
  }, [timeRange, chartData]); // Re-calculate when timeRange or chartData changes

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Visitors</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last{" "}
            {timeRange === "30d" ? "30 days" : timeRange === "7d" ? "7 days" : "3 months"}
          </span>
          <span className="@[540px]/card:hidden">
            Last{" "}
            {timeRange === "30d" ? "30 days" : timeRange === "7d" ? "7 days" : "3 months"}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            variant="outline"
            className="hidden @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 @[767px]/card:hidden"
              size="sm"
            >
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="h-[250px] w-full flex items-center justify-center bg-gray-100 rounded-lg animate-pulse">
            <p className="text-gray-500">Loading chart data...</p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={1.0} />
                  <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <ChartTooltip
                cursor={false}
                defaultIndex={filteredData.length > 0 ? filteredData.length - 1 : -1}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="mobile"
                type="natural"
                fill="url(#fillMobile)"
                stroke="var(--color-mobile)"
                stackId="a"
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="url(#fillDesktop)"
                stroke="var(--color-desktop)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
