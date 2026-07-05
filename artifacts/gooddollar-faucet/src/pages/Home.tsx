import { useState, useEffect } from "react";
import { FaucetStats, RecentClaims } from "@/components/FaucetStats";
import { ClaimProcess } from "@/components/ClaimProcess";
import { DailyCheckin } from "@/components/DailyCheckin";
import { Leaderboard } from "@/components/Leaderboard";
import { ReferralPanel } from "@/components/ReferralPanel";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref);
    }
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none z-0"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute top-40 -left-40 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Header */}
      <header className="relative z-10 w-full border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="GoodDailyFaucet logo"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-bold text-lg tracking-tight">GoodDailyFaucet</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Celo Network
          </div>
        </div>
      </header>

      {/* Referral Banner */}
      {referralCode && (
        <div className="relative z-10 bg-primary/10 border-b border-primary/20 py-2">
          <p className="text-center text-sm text-primary font-medium">
            🎉 You were invited! Claim your G$ tokens below — your inviter earns a bonus too.
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 relative z-10 container mx-auto px-4 py-10 lg:py-16">

        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-4">
            Free GoodDollar <br /><span className="text-primary">for Real Humans</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Verify your identity once, claim G$ tokens, then check in daily to build your streak and earn bonus rewards.
          </p>
        </div>

        {/* Top Stats */}
        <div className="mb-12">
          <FaucetStats />
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Left: Claim + Daily Check-in */}
          <div className="lg:col-span-7 space-y-6">
            <ClaimProcess
              walletAddress={walletAddress}
              setWalletAddress={setWalletAddress}
              referralCode={referralCode}
            />
            <DailyCheckin walletAddress={walletAddress} />
          </div>

          {/* Right: Referral + Recent Claims + Leaderboard */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-24 space-y-6">
              <ReferralPanel walletAddress={walletAddress} />
              <RecentClaims />
              <Leaderboard />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Powered by GoodDollar Face Verification &bull; Built for GoodBuilders on Celo</p>
        </div>
      </footer>
    </div>
  );
}
