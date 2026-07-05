import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flame, Loader2, CheckCircle2, Lock } from "lucide-react";
import { getFaucetUserStatus } from "@/lib/celoFaucet";

const CYCLE_LENGTH = 30;

interface DailyCheckinProps {
  walletAddress: string | null;
}

type FaucetUserStatus = {
  streakDay: number;
  cycle: number;
  lastCheckIn: number;
  nextCheckInTime: number;
  canCheckInNow: boolean;
};

function formatTime(timestamp: number) {
  if (!timestamp) return "Not started yet";

  const date = new Date(timestamp * 1000);

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function DailyCheckin({ walletAddress }: DailyCheckinProps) {
  const [status, setStatus] = useState<FaucetUserStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadStatus = async () => {
    if (!walletAddress) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await getFaucetUserStatus(walletAddress as `0x${string}`);

      setStatus({
        streakDay: Number(result[0]),
        cycle: Number(result[1]),
        lastCheckIn: Number(result[2]),
        nextCheckInTime: Number(result[3]),
        canCheckInNow: Boolean(result[4]),
      });
    } catch (err: any) {
      console.error("Failed to load onchain check-in status", err);
      setErrorMessage(err?.shortMessage || err?.message || "Failed to load check-in status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();

    const interval = window.setInterval(() => {
      loadStatus();
    }, 30000);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  if (!walletAddress) {
    return (
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Daily Check-in
          </CardTitle>
          <CardDescription>Connect your wallet to view your onchain streak.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            Wallet required
          </div>
        </CardContent>
      </Card>
    );
  }

  const streakDay = status?.streakDay ?? 0;
  const cycle = status?.cycle ?? 1;
  const progressPct = Math.min((streakDay / CYCLE_LENGTH) * 100, 100);

  return (
    <Card className="border-primary/10">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Daily Check-in
            </CardTitle>
            <CardDescription>
              Onchain status from your Celo faucet contract
            </CardDescription>
          </div>

          {status && (
            <Badge variant={status.canCheckInNow ? "default" : "secondary"}>
              {status.canCheckInNow ? "Ready" : "Checked in"}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {isLoading && !status ? (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading onchain status...
          </div>
        ) : errorMessage ? (
          <div className="text-sm text-red-500">
            {errorMessage}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">Current Day</div>
                <div className="mt-1 text-2xl font-bold">
                  {streakDay || 0}
                </div>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="text-xs text-muted-foreground">Cycle</div>
                <div className="mt-1 text-2xl font-bold">
                  {cycle || 1}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  30-day cycle progress
                </span>
                <span className="font-medium">
                  {streakDay}/{CYCLE_LENGTH}
                </span>
              </div>
              <Progress value={progressPct} />
            </div>

            <div className="rounded-xl border p-4 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
                <div>
                  <div className="font-medium">
                    {status?.canCheckInNow
                      ? "You can check in now"
                      : "You already checked in"}
                  </div>
                  <div className="text-muted-foreground">
                    {status?.canCheckInNow
                      ? "Use the Claim button above to call checkIn()."
                      : `Next check-in: ${formatTime(status?.nextCheckInTime ?? 0)}`}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={loadStatus}
              className="text-sm text-primary hover:underline"
            >
              Refresh onchain status
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
