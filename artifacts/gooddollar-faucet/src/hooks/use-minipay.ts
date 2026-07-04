import { useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

function detectMiniPay() {
  if (typeof window === "undefined") return false;

  const ethereum = window.ethereum;
  const userAgent = window.navigator.userAgent.toLowerCase();

  return Boolean(
    ethereum?.isMiniPay ||
      userAgent.includes("minipay") ||
      userAgent.includes("opera")
  );
}

export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

const connectMiniPay = async () => {
    if (!window.ethereum) {
      setError("MiniPay wallet not found");
      return null;
    }

  try {
      setError(null);
      setIsConnecting(true);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

  const account = accounts?.[0] ?? null;
      setAddress(account);

      return account;
    } catch (err: any) {
      console.error("MiniPay connect failed", err);
      setError(err?.message || "MiniPay connect failed");
      return null;
    } finally {
      setIsConnecting(false);
    }
  };

useEffect(() => {
    if (typeof window === "undefined") return;

    const detected = detectMiniPay();
    setIsMiniPay(detected);

    if (!window.ethereum) return;

    const checkExistingConnection = async () => {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
        }
      } catch (err) {
        console.error("MiniPay account check failed", err);
      }
    };

          const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts.length > 0 ? accounts[0] : null);
    };

    if (detected) {
      checkExistingConnection();
    }

    if (window.ethereum?.on) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

return {
    isMiniPay,
    address,
    isConnecting,
    error,
    connectMiniPay,
  };
}
