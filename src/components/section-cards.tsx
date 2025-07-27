// src/components/section-cards.tsx
"use client";

import * as React from "react";
import { IconCar, IconUser, IconClipboardList, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mendefinisikan tipe untuk data kartu
type CardData = {
  description: string;
  title: string | number;
  actionText: string;
  actionIcon: React.ElementType; // Menggunakan React.ElementType untuk komponen ikon
  footerMain: string;
  footerSub: string;
  loading: boolean; // Menambahkan properti loading
};

export function SectionCards() {
  // State untuk data kartu. Awalnya bisa kosong atau dengan placeholder loading.
  // Di aplikasi nyata, ini akan di-fetch dari API.
  const [cardMetrics, setCardMetrics] = React.useState<CardData[]>([
    {
      description: "Total Kendaraan",
      title: "...",
      actionText: "...",
      actionIcon: IconCar,
      footerMain: "...",
      footerSub: "...",
      loading: true,
    },
    {
      description: "Total Pesanan",
      title: "...",
      actionText: "...",
      actionIcon: IconClipboardList,
      footerMain: "...",
      footerSub: "...",
      loading: true,
    },
    {
      description: "Total Pengguna",
      title: "...",
      actionText: "...",
      actionIcon: IconUser,
      footerMain: "...",
      footerSub: "...",
      loading: true,
    },
    {
      description: "Statistik Pertumbuhan",
      title: "...",
      actionText: "...",
      actionIcon: IconTrendingUp,
      footerMain: "...",
      footerSub: "...",
      loading: true,
    },
  ]);

  // Efek untuk memuat data (simulasi API call)
  React.useEffect(() => {
    const fetchMetrics = async () => {
      // Simulasi penundaan API
      await new Promise(resolve => setTimeout(resolve, 1500));

      const fetchedData: CardData[] = [
        {
          description: "Total Kendaraan",
          title: 128,
          actionText: "+5 Unit",
          actionIcon: IconCar,
          footerMain: "Tambahan minggu ini",
          footerSub: "Total kendaraan tersedia",
          loading: false,
        },
        {
          description: "Total Pesanan",
          title: 542,
          actionText: "+12",
          actionIcon: IconClipboardList,
          footerMain: "Pesanan masuk hari ini",
          footerSub: "Termasuk aktif & selesai",
          loading: false,
        },
        {
          description: "Total Pengguna",
          title: 312,
          actionText: "+8 User",
          actionIcon: IconUser,
          footerMain: "Pengguna baru minggu ini",
          footerSub: "Termasuk admin & customer",
          loading: false,
        },
        {
          description: "Statistik Pertumbuhan",
          title: "+8.3%",
          actionText: "Minggu ini",
          actionIcon: IconTrendingUp,
          footerMain: "Kinerja meningkat",
          footerSub: "Dibandingkan minggu lalu",
          loading: false,
        },
      ];
      setCardMetrics(fetchedData);
    };

    fetchMetrics();
  }, []); // Hanya berjalan sekali saat komponen mount

  return (
    <div
      className="
        grid grid-cols-1 gap-4 px-4 lg:px-6
        @[xl]/main:grid-cols-2 @[5xl]/main:grid-cols-4
        [&>div]:bg-gradient-to-t [&>div]:from-primary/5 [&>div]:to-card
        dark:[&>div]:bg-card [&>div]:shadow-xs
      "
    >
      {cardMetrics.map((card, index) => {
        const IconComponent = card.actionIcon; // Mengambil komponen ikon
        return (
          <Card key={index} className="@container/card">
            <CardHeader>
              <CardDescription>{card.description}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {card.loading ? (
                  <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  card.title
                )}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  {card.loading ? (
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <>
                      <IconComponent className="mr-1 h-4 w-4" />
                      {card.actionText}
                    </>
                  )}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="flex gap-2 font-medium">
                {card.loading ? (
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  card.footerMain
                )}
              </div>
              <div className="text-muted-foreground">
                {card.loading ? (
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  card.footerSub
                )}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
