"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayScorecardModal } from "@/components/play-scorecard-modal";

type HoleTee = { teeId: string; par: number | null };
type HoleForScorecard = { id: string; holeIndex: number; holeTees: HoleTee[] };
type PlayWithScores = {
  id: string;
  playedAt: Date;
  tee: { id: string; name: string | null; gender: string | null };
  holesPlayed: string;
  overallScore: number | null;
  note: string | null;
  holeScores: { holeId: string; score: number; hole: { holeIndex: number } }[];
};

type PlayHistoryListProps = {
  plays: PlayWithScores[];
  holes: HoleForScorecard[];
  courseName: string;
};

export function PlayHistoryList({
  plays,
  holes,
  courseName,
}: PlayHistoryListProps) {
  const [scorecardPlayId, setScorecardPlayId] = useState<string | null>(null);
  const scorecardPlay = plays.find((p) => p.id === scorecardPlayId);

  return (
    <>
      <ul className="space-y-2">
        {plays.map((play) => (
          <li
            key={play.id}
            className="flex flex-wrap items-center gap-2 text-sm"
          >
            <span className="text-muted-foreground">
              {new Date(play.playedAt).toLocaleDateString()}
            </span>
            <span>
              {play.tee.name || play.tee.gender || "Tee"} —
              {play.holesPlayed === "front"
                ? " Front 9"
                : play.holesPlayed === "back"
                  ? " Back 9"
                  : " Full 18"}
            </span>
            {play.overallScore != null && (
              <span className="font-medium">{play.overallScore}</span>
            )}
            {play.note && (
              <span className="text-muted-foreground">· {play.note}</span>
            )}
            {play.holeScores.length > 0 && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-primary"
                onClick={() => setScorecardPlayId(play.id)}
              >
                View scorecard
              </Button>
            )}
          </li>
        ))}
      </ul>
      {scorecardPlay && (
        <PlayScorecardModal
          open={scorecardPlayId === scorecardPlay.id}
          onOpenChange={(open) => !open && setScorecardPlayId(null)}
          courseName={courseName}
          play={{
            playedAt: scorecardPlay.playedAt,
            tee: scorecardPlay.tee,
            holesPlayed: scorecardPlay.holesPlayed,
            overallScore: scorecardPlay.overallScore,
            note: scorecardPlay.note,
            holeScores: scorecardPlay.holeScores,
          }}
          holes={holes}
        />
      )}
    </>
  );
}
