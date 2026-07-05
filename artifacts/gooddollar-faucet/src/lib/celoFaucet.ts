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
  transport: http(),
});

export async function switchToCelo() {
  if (!window.ethereum) {
    throw new Error("Wallet not found");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xa4ec" }], // 42220
    });
  } catch (switchError: any) {
    if (switchError?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0xa4ec",
            chainName: "Celo",
            nativeCurrency: {
              name: "CELO",
              symbol: "CELO",
              decimals: 18,
            },
            rpcUrls: ["https://forno.celo.org"],
            blockExplorerUrls: ["https://celoscan.io"],
          },
        ],
      });
    } else {
      throw switchError;
    }
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
  if (!window.ethereum) {
    throw new Error("Wallet not found");
  }

  await switchToCelo();

  const walletClient = createWalletClient({
    chain: celo,
    transport: custom(window.ethereum),
  });

  return walletClient.writeContract({
    address: FAUCET_CONTRACT_ADDRESS,
    abi: FAUCET_ABI,
    functionName: "checkIn",
    account: walletAddress,
  });
}
