import { useEffect } from "react";
import {
  useGetClaimStatus,
  useCheckVerificationStatus,
  useClaimTokens,
  getGetClaimStatusQueryKey,
  getCheckVerificationStatusQueryKey,
  getGetFaucetStatsQueryKey,
  getGetRecentClaimsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Wallet, ShieldCheck, Droplet, ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useMiniPay } from "@/hooks/use-minipay";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface ClaimProcessProps {
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
  referralCode?: string | null;
}

export function ClaimProcess({ walletAddress, setWalletAddress, referralCode }: ClaimProcessProps) {
  const [isConnecting, setIsConnecting] = [false, (_: boolean) => {}];
  const { isMiniPay, address: miniPayAddress } = useMiniPay();
  const queryClient = useQueryClient();

  const {
    data: claimStatus,
    isLoading: isLoadingStatus,
  } = useGetClaimStatus(walletAddress || "", {
    query: {
      enabled: !!walletAddress,
      queryKey: getGetClaimStatusQueryKey(walletAddress || ""),
    },
  });

  const {
    data: verificationStatus,
    isLoading: isLoadingVerification,
    refetch: refetchVerification,
  } = useCheckVerificationStatus(walletAddress || "", {
    query: {
      enabled: !!walletAddress,
      queryKey: getCheckVerificationStatusQueryKey(walletAddress || ""),
    },
  });

  const claimTokens = useClaimTokens();

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err);
        }
      }
    };
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setWalletAddress(accounts.length > 0 ? accounts[0] : null);
      });
    }
  }, []);

  // MiniPay auto-connect: only fires when opened inside the MiniPay app.
  // Regular browser/MetaMask users are unaffected since miniPayAddress stays null for them.
  useEffect(() => {
    if (miniPayAddress) {
      setWalletAddress(miniPayAddress);
    }
  }, [miniPayAddress]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install a Web3 wallet like MetaMask to continue.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (err) {
      console.error("Failed to connect wallet", err);
    }
  };

  const verifyWithGoodDollar = () => {
    window.open("https://app.gooddollar.org/face-verification", "_blank");
  };

  const handleClaim = async () => {
  if (!walletAddress) return;

  try {
    setClaimError(null);
    setIsClaimingOnchain(true);

    const hash = await checkInToFaucet(walletAddress as `0x${string}`);

    setClaimTxHash(hash);
    console.log("Check-in tx:", hash);
  } catch (err: any) {
    console.error("Claim failed:", err);
    setClaimError(err?.shortMessage || err?.message || "Claim failed");
  } finally {
    setIsClaimingOnchain(false);
  }
};
  const formatAddress = (address: string) =>
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  const step = !walletAddress ? 1 : verificationStatus?.isVerified === false ? 2 : claimStatus?.hasClaimed === true ? 4 : 3;

  return (
    <Card className="w-full shadow-lg border-primary/10">
      <CardHeader className="text-center pb-8 border-b bg-muted/30">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Droplet className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">Claim Your G$</CardTitle>
        <CardDescription className="text-base mt-2">
          Verify you are human and receive GoodDollar tokens directly to your Celo wallet.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6 md:p-8 space-y-8">
        {/* Step 1: Wallet Connection */}
        <div className={`relative pl-8 md:pl-12 transition-opacity ${step > 1 ? "opacity-60" : "opacity-100"}`}>
          <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10
            ${step > 1 ? "bg-primary text-primary-foreground" : step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
          </div>
          <div className="absolute left-3 top-7 bottom-[-2rem] w-px bg-border" />
          <div className="mb-2">
            <h3 className="text-lg font-semibold flex items-center">
              Connect Wallet
              {walletAddress && (
                <span className="ml-2 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {formatAddress(walletAddress)}
                </span>
              )}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Connect your Celo-compatible wallet to begin.</p>
          </div>
          {step === 1 && (
            isMiniPay ? (
              <div className="mt-4 flex items-center text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting via MiniPay...
              </div>
            ) : (
              <Button size="lg" className="mt-4 w-full sm:w-auto" onClick={connectWallet}>
                <Wallet className="w-4 h-4 mr-2" /> Connect Wallet
              </Button>
            )
          )}
        </div>

        {/* Step 2: Verification */}
        <div className={`relative pl-8 md:pl-12 transition-opacity ${step < 2 ? "opacity-40 pointer-events-none" : step > 2 ? "opacity-60" : "opacity-100"}`}>
          <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10
            ${step > 2 ? "bg-primary text-primary-foreground" : step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : "2"}
          </div>
          <div className="absolute left-3 top-7 bottom-[-2rem] w-px bg-border" />
          <div className="mb-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Human Verification
              {step > 2 && <ShieldCheck className="w-4 h-4 text-green-500" />}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Complete GoodDollar's face verification to prove you're unique.</p>
          </div>
          {step === 2 && (
            <div className="mt-4 space-y-3">
              {isLoadingVerification ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking status...
                </div>
              ) : (
                <>
                  <Alert className="bg-primary/5 border-primary/20">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <AlertTitle>Action Required</AlertTitle>
                    <AlertDescription className="text-xs mt-1">
                      You'll be redirected to GoodDollar. Once complete, return here and refresh your status.
                    </AlertDescription>
                  </Alert>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={verifyWithGoodDollar} className="flex-1">
                      Verify with GoodDollar <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" onClick={() => refetchVerification()}>
                      Refresh Status
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Claim */}
        <div className={`relative pl-8 md:pl-12 transition-opacity ${step < 3 ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
          <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10
            ${step > 3 ? "bg-primary text-primary-foreground" : step === 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {step > 3 ? <CheckCircle2 className="w-4 h-4" /> : "3"}
          </div>
          <div className="mb-2">
            <h3 className="text-lg font-semibold">Claim Tokens</h3>
            <p className="text-sm text-muted-foreground mt-1">Receive your G$ tokens to your wallet.</p>
          </div>
          {step === 3 && (
            <div className="mt-4">
              {claimTokens.error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Claim Failed</AlertTitle>
                  <AlertDescription>{claimTokens.error.message || "An error occurred during claiming."}</AlertDescription>
                </Alert>
              )}
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleClaim}
                disabled={claimTokens.isPending || isLoadingStatus}
              >
                {claimTokens.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  <><Droplet className="w-4 h-4 mr-2" /> Claim Free G$</>
                )}
              </Button>
            </div>
          )}

          {step === 4 && claimStatus?.hasClaimed && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5 mr-3 shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-400">Successfully Claimed!</h4>
                  <p className="text-sm text-green-700 dark:text-green-500/80 mt-1">
                    You received {claimStatus.amount} G$ tokens.
                  </p>
                  {claimStatus.txHash && (
                    <a
                      href={`https://celoscan.io/tx/${claimStatus.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-green-700 dark:text-green-400 mt-2 inline-flex items-center hover:underline"
                    >
                      View on Explorer <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                  <p className="text-xs text-green-600 dark:text-green-500 mt-2 font-medium">
                    Now check in daily below to earn bonus G$ rewards!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
        }
