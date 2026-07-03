import { useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const detected = !!window.ethereum.isMiniPay;
    setIsMiniPay(detected);
    if (!detected) return;

    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts: string[]) => {
        if (accounts && accounts.length > 0) setAddress(accounts[0]);
      })
      .catch((err: unknown) => console.error("MiniPay auto-connect failed", err));
  }, []);

  return { isMiniPay, address };
}
