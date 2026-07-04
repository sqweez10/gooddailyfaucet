export const FAUCET_CONTRACT_ADDRESS =
  "0x785f9B587f12a31F22FA5C5C324cd3F22c19e717" as const;

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
