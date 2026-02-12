"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type HoleTee = { teeId: string; par: number | null };
type HoleForScorecard = { id: string; holeIndex: number; holeTees: HoleTee[] };
type HoleScoreForPlay = { holeId: string; score: number; hole: { holeIndex: number } };

type PlayScorecardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  play: {
    playedAt: Date;
    tee: { id: string; name: string | null };
    holesPlayed: string;
    overallScore: number | null;
    note: string | null;
    holeScores: HoleScoreForPlay[];
  };
  holes: HoleForScorecard[];
};

export function PlayScorecardModal({
  open,
  onOpenChange,
  courseName,
  play,
  holes,
}: PlayScorecardModalProps) {
  const teeId = play.tee.id;
  const scoreByHoleId = new Map(play.holeScores.map((hs) => [hs.holeId, hs.score]));

  const isFront = play.holesPlayed === "front";
  const isBack = play.holesPlayed === "back";
  const holesToShow = isFront
    ? holes.filter((h) => h.holeIndex < 9)
    : isBack
      ? holes.filter((h) => h.holeIndex >= 9)
      : holes;

  const getPar = (hole: HoleForScorecard) =>
    hole.holeTees.find((ht) => ht.teeId === teeId)?.par ?? null;
  const getScore = (hole: HoleForScorecard) => scoreByHoleId.get(hole.id) ?? null;

  const outHoles = holesToShow.filter((h) => h.holeIndex < 9);
  const inHoles = holesToShow.filter((h) => h.holeIndex >= 9);

  const sumPar = (holeList: HoleForScorecard[]) =>
    holeList.reduce((s, h) => s + (getPar(h) ?? 0), 0);
  const sumScore = (holeList: HoleForScorecard[]) =>
    holeList.reduce((s, h) => s + (getScore(h) ?? 0), 0);

  const totalPar = sumPar(holesToShow);
  const totalScore = sumScore(holesToShow);

  const dateStr = new Date(play.playedAt).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Scorecard — {courseName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {dateStr} · {play.tee.name || "Tee"} ·{" "}
            {play.holesPlayed === "front"
              ? "Front 9"
              : play.holesPlayed === "back"
                ? "Back 9"
                : "Full 18"}
          </p>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hole</TableHead>
              <TableHead className="text-right">Par</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holesToShow.map((hole) => {
              const holeNum = hole.holeIndex + 1;
              const par = getPar(hole);
              const score = getScore(hole);
              return (
                <TableRow key={hole.id}>
                  <TableCell>{holeNum}</TableCell>
                  <TableCell className="text-right">{par ?? "—"}</TableCell>
                  <TableCell className="text-right font-medium">
                    {score ?? "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            {outHoles.length > 0 && inHoles.length > 0 && (
              <>
                <TableRow className="border-t-2 border-border bg-muted/30 font-medium">
                  <TableCell>Out</TableCell>
                  <TableCell className="text-right">
                    {sumPar(outHoles) || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {sumScore(outHoles) || "—"}
                  </TableCell>
                </TableRow>
                <TableRow className="font-medium">
                  <TableCell>In</TableCell>
                  <TableCell className="text-right">
                    {sumPar(inHoles) || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {sumScore(inHoles) || "—"}
                  </TableCell>
                </TableRow>
              </>
            )}
            <TableRow className="border-t-2 border-border font-medium">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">{totalPar || "—"}</TableCell>
              <TableCell className="text-right">{totalScore || "—"}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        {play.overallScore != null && (
          <p className="text-sm text-muted-foreground">
            Overall score: {play.overallScore}
          </p>
        )}
        {play.note && (
          <p className="text-sm text-muted-foreground">
            Note: {play.note}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
