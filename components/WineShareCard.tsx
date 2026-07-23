"use client";

import Image from "next/image";
import { forwardRef } from "react";

type WineShareCardProps = {
  wineName: string;
  rating: number;
  comment: string | null;
  recordImageUrl: string | null;
  officialWineImageUrl: string | null;
  userName: string;
  createdAt: string;
  category?: string | null;
};

const WineShareCard = forwardRef<
  HTMLDivElement,
  WineShareCardProps
>(function WineShareCard(
  {
    wineName,
    rating,
    comment,
    recordImageUrl,
    officialWineImageUrl,
    userName,
    createdAt,
    category,
  },
  ref
) {
  const hasRecordImage = Boolean(recordImageUrl);
  const hasOfficialImage = Boolean(officialWineImageUrl);

  const displayComment =
    comment?.trim() ||
    "今日の一杯を、ワインメモリーに残しました。";

  const theme = getTheme(category);

  return (
    <div
      ref={ref}
      className="relative h-[1350px] w-[1080px] overflow-hidden"
      style={{
        background: theme.background,
        color: theme.text,
        fontFamily:
          '"Yu Mincho", "Hiragino Mincho ProN", "Times New Roman", serif',
      }}
    >
      {hasRecordImage ? (
        <PhotoLayout
          wineName={wineName}
          rating={rating}
          comment={displayComment}
          recordImageUrl={recordImageUrl}
          officialWineImageUrl={officialWineImageUrl}
          userName={userName}
          createdAt={createdAt}
          accent={theme.accent}
        />
      ) : hasOfficialImage ? (
        <BottleLayout
          wineName={wineName}
          rating={rating}
          comment={displayComment}
          officialWineImageUrl={officialWineImageUrl}
          userName={userName}
          createdAt={createdAt}
          accent={theme.accent}
        />
      ) : (
        <TypographyLayout
          wineName={wineName}
          rating={rating}
          comment={displayComment}
          userName={userName}
          createdAt={createdAt}
          accent={theme.accent}
        />
      )}

      <div
        className="absolute inset-10 rounded-[54px] border-2"
        style={{
          borderColor: `${theme.accent}99`,
        }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 flex h-24 items-center justify-center"
        style={{
          backgroundColor: theme.footer,
        }}
      >
        <p className="text-3xl tracking-[0.18em] text-white">
          SADOYA WINE APP
        </p>
      </div>
    </div>
  );
});

export default WineShareCard;

type LayoutProps = {
  wineName: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  accent: string;
};

type PhotoLayoutProps = LayoutProps & {
  recordImageUrl: string | null;
  officialWineImageUrl: string | null;
};

function PhotoLayout({
  wineName,
  rating,
  comment,
  recordImageUrl,
  officialWineImageUrl,
  userName,
  createdAt,
  accent,
}: PhotoLayoutProps) {
  return (
    <div className="relative h-full w-full bg-[#16090b]">
      {recordImageUrl && (
        <Image
          src={recordImageUrl}
          alt="ワイン記録写真"
          fill
          unoptimized
          className="object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/90" />

      {officialWineImageUrl && (
        <div className="absolute right-16 top-16 h-[390px] w-[250px] overflow-hidden rounded-[36px] border border-white/40 bg-[#fffaf0] shadow-2xl">
          <Image
            src={officialWineImageUrl}
            alt={`${wineName}の公式画像`}
            fill
            unoptimized
            className="object-contain p-5"
          />
        </div>
      )}

      <div className="absolute bottom-28 left-0 right-0 px-20 pb-12 text-white">
        <p
          className="text-3xl italic tracking-[0.2em]"
          style={{ color: accent }}
        >
          MY WINE MEMORY
        </p>

        <h1 className="mt-7 max-w-[820px] text-7xl font-bold leading-tight">
          {wineName}
        </h1>

        <Rating rating={rating} accent={accent} />

        <p className="mt-10 max-w-[820px] whitespace-pre-wrap text-4xl leading-[1.7] text-white/90">
          “{comment}”
        </p>

        <CardFooter
          userName={userName}
          createdAt={createdAt}
          accent={accent}
          light
        />
      </div>
    </div>
  );
}

type BottleLayoutProps = LayoutProps & {
  officialWineImageUrl: string | null;
};

function BottleLayout({
  wineName,
  rating,
  comment,
  officialWineImageUrl,
  userName,
  createdAt,
  accent,
}: BottleLayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col px-20 pb-32 pt-20">
      <p
        className="text-center text-3xl italic tracking-[0.25em]"
        style={{ color: accent }}
      >
        MY WINE MEMORY
      </p>

      <div
        className="mx-auto mt-7 h-px w-52"
        style={{ backgroundColor: accent }}
      />

      <div className="mt-10 grid flex-1 grid-cols-[48%_52%] items-center gap-6">
        <div className="relative mx-auto h-[720px] w-[360px]">
          {officialWineImageUrl && (
            <Image
              src={officialWineImageUrl}
              alt={`${wineName}の公式画像`}
              fill
              unoptimized
              className="object-contain drop-shadow-2xl"
            />
          )}
        </div>

        <div className="pr-4">
          <p
            className="text-2xl font-bold tracking-[0.2em]"
            style={{ color: accent }}
          >
            TODAY&apos;S WINE
          </p>

          <h1 className="mt-7 text-7xl font-bold leading-tight">
            {wineName}
          </h1>

          <Rating rating={rating} accent={accent} />

          <p className="mt-12 whitespace-pre-wrap text-4xl leading-[1.8] opacity-90">
            “{comment}”
          </p>
        </div>
      </div>

      <CardFooter
        userName={userName}
        createdAt={createdAt}
        accent={accent}
      />
    </div>
  );
}

function TypographyLayout({
  wineName,
  rating,
  comment,
  userName,
  createdAt,
  accent,
}: LayoutProps) {
  return (
    <div className="relative flex h-full w-full flex-col px-24 pb-32 pt-24 text-center">
      <p
        className="text-3xl italic tracking-[0.28em]"
        style={{ color: accent }}
      >
        MY WINE MEMORY
      </p>

      <div
        className="mx-auto mt-8 h-px w-64"
        style={{ backgroundColor: accent }}
      />

      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className="flex h-48 w-48 items-center justify-center rounded-full border-2 text-8xl"
          style={{
            borderColor: accent,
            color: accent,
          }}
        >
          🍷
        </div>

        <p
          className="mt-14 text-2xl font-bold tracking-[0.22em]"
          style={{ color: accent }}
        >
          TODAY&apos;S WINE
        </p>

        <h1 className="mt-8 max-w-[880px] text-8xl font-bold leading-tight">
          {wineName}
        </h1>

        <Rating rating={rating} accent={accent} />

        <div
          className="mx-auto mt-14 h-px w-40"
          style={{ backgroundColor: `${accent}99` }}
        />

        <p className="mt-14 max-w-[850px] whitespace-pre-wrap text-5xl leading-[1.85] opacity-90">
          “{comment}”
        </p>
      </div>

      <CardFooter
        userName={userName}
        createdAt={createdAt}
        accent={accent}
      />
    </div>
  );
}

function Rating({
  rating,
  accent,
}: {
  rating: number;
  accent: string;
}) {
  return (
    <div className="mt-9 flex items-center gap-5">
      <p
        className="text-5xl tracking-wide"
        style={{ color: accent }}
      >
        {"★".repeat(rating)}
        {"☆".repeat(Math.max(0, 5 - rating))}
      </p>

      <p className="text-4xl font-bold">
        {rating}.0
      </p>
    </div>
  );
}

function CardFooter({
  userName,
  createdAt,
  accent,
  light = false,
}: {
  userName: string;
  createdAt: string;
  accent: string;
  light?: boolean;
}) {
  return (
    <div
      className="mt-16 flex items-end justify-between border-t pt-8 text-left"
      style={{
        borderColor: `${accent}80`,
      }}
    >
      <div>
        <p className="text-3xl font-bold">
          {userName}
        </p>

        <p
          className={`mt-2 text-2xl ${
            light ? "text-white/70" : "opacity-60"
          }`}
        >
          {createdAt}
        </p>
      </div>

      <p
        className="text-3xl tracking-[0.12em]"
        style={{ color: accent }}
      >
        SADOYA
      </p>
    </div>
  );
}

function getTheme(category?: string | null) {
  if (category === "white") {
    return {
      background:
        "linear-gradient(145deg, #fffdf4 0%, #eee3c8 100%)",
      text: "#3d3323",
      accent: "#b58a3d",
      footer: "#8b6a30",
    };
  }

  if (category === "rose") {
    return {
      background:
        "linear-gradient(145deg, #fff4f5 0%, #e8c6cb 100%)",
      text: "#532d35",
      accent: "#b86f7d",
      footer: "#8f5260",
    };
  }

  if (category === "sparkling") {
    return {
      background:
        "linear-gradient(145deg, #fffdf5 0%, #ead9a7 100%)",
      text: "#453a20",
      accent: "#c49a32",
      footer: "#8c6d1e",
    };
  }

  return {
    background:
      "linear-gradient(145deg, #f8f1e7 0%, #d7c2ad 100%)",
    text: "#4a1f22",
    accent: "#c5a05a",
    footer: "#741b2c",
  };
}