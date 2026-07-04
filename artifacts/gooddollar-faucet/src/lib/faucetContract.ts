const faucetAddress = import.meta.env.VITE_FAUCET_CONTRACT_ADDRESS;

if (!faucetAddress) {
  throw new Error("Missing VITE_FAUCET_CONTRACT_ADDRESS");
}

export const FAUCET_CONTRACT_ADDRESS = faucetAddress as `0x${string}`;

export const FAUCET_ABI = [
  {
    inputs: [],
    name: "checkIn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserStatus",
    outputs: [
      {
        internalType: "uint32",
        name: "streakDay",
        type: "uint32",
      },
      {
        internalType: "uint32",
        name: "cycle",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "lastCheckIn",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "nextCheckInTime",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "canCheckInNow",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "poolBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
