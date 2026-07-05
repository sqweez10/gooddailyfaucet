import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  formatUnits,
} from "viem";
import { celo } from "viem/chains";
import {
  FAUCET_ABI,
  FAUCET_CONTRACT_ADDRESS,
} from "@/lib/faucetContract";

export const celoPublicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

export async function switchToCelo() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Wallet not found");
  }

  const celoChainId = "0xa4ec"; // 42220

  const celoChain = {
    chainId: celoChainId,
    chainName: "Celo Mainnet",
    nativeCurrency: {
      name: "CELO",
      symbol: "CELO",
      decimals: 18,
    },
    rpcUrls: ["https://forno.celo.org"],
    blockExplorerUrls: ["https://celoscan.io"],
  };

  try {
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    if (currentChainId === celoChainId) {
      return;
    }
  } catch {
    // บาง wallet อาจไม่รองรับ eth_chainId ก็ไม่เป็นไร
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: celoChainId }],
    });
  } catch (switchError: any) {
    // MiniPay ไม่รองรับ wallet_switchEthereumChain
    // ถ้าเจอ -32601 ให้ข้าม เพราะ MiniPay อยู่บน Celo อยู่แล้ว
    if (
      switchError?.code === -32601 ||
      switchError?.message?.includes("wallet_switchEthereumChain")
    ) {
      return;
    }

    if (switchError?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [celoChain],
      });

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: celoChainId }],
      });

      return;
    }

    throw switchError;
  }
}

export async function getFaucetUserStatus(walletAddress: `0x${string}`) {
  return celoPublicClient.readContract({
    address: FAUCET_CONTRACT_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "getUserStatus",
    args: [walletAddress],
  });
}

export async function getFaucetPoolBalance() {
  const balance = await celoPublicClient.readContract({
    address: FAUCET_CONTRACT_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "poolBalance",
  });

  return formatUnits(balance, 18);
}

export async function checkInToFaucet(walletAddress: `0x${string}`) {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Wallet not found");
  }

  await switchToCelo();

  const walletClient = createWalletClient({
    chain: celo,
    transport: custom(window.ethereum),
  });

  const hash = await walletClient.writeContract({
    address: FAUCET_CONTRACT_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "checkIn",
    account: walletAddress,
  });

  const receipt = await celoPublicClient.waitForTransactionReceipt({
    hash,
  });

  if (receipt.status !== "success") {
    throw new Error("Transaction failed");
  }

  return hash;
}
