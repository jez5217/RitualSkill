/** ABIs for ResearchAgentRegistry and the Ritual system contracts this dApp reads/writes. */

export const storageRefComponents = [
  { name: "platform", type: "string" },
  { name: "path", type: "string" },
  { name: "keyRef", type: "string" },
] as const;

export const researchAgentRegistryAbi = [
  {
    type: "function",
    name: "submitResearch",
    stateMutability: "nonpayable",
    inputs: [
      { name: "topic", type: "string" },
      { name: "encodedAgentRequest", type: "bytes" },
    ],
    outputs: [{ name: "jobId", type: "bytes32" }],
  },
  {
    type: "function",
    name: "requests",
    stateMutability: "view",
    inputs: [{ name: "", type: "bytes32" }],
    outputs: [
      { name: "requester", type: "address" },
      { name: "topic", type: "string" },
      { name: "submittedAtBlock", type: "uint64" },
      { name: "delivered", type: "bool" },
      { name: "success", type: "bool" },
      { name: "report", type: "string" },
      { name: "errorMessage", type: "string" },
    ],
  },
  {
    type: "function",
    name: "getUserRequests",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "bytes32[]" }],
  },
  {
    type: "function",
    name: "getAllJobIds",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "bytes32[]" }],
  },
  {
    type: "function",
    name: "totalRequests",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "event",
    name: "ResearchSubmitted",
    inputs: [
      { name: "jobId", type: "bytes32", indexed: true },
      { name: "requester", type: "address", indexed: true },
      { name: "topic", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ResearchDelivered",
    inputs: [
      { name: "jobId", type: "bytes32", indexed: true },
      { name: "success", type: "bool", indexed: false },
      { name: "report", type: "string", indexed: false },
      { name: "errorMessage", type: "string", indexed: false },
    ],
  },
] as const;

export const asyncJobTrackerAbi = [
  {
    type: "event",
    name: "JobAdded",
    inputs: [
      { name: "executor", type: "address", indexed: true },
      { name: "jobId", type: "bytes32", indexed: true },
      { name: "precompileAddress", type: "address", indexed: true },
      { name: "commitBlock", type: "uint256", indexed: false },
      { name: "precompileInput", type: "bytes", indexed: false },
      { name: "senderAddress", type: "address", indexed: false },
      { name: "previousBlockHash", type: "bytes32", indexed: false },
      { name: "previousBlockNumber", type: "uint256", indexed: false },
      { name: "previousBlockTimestamp", type: "uint256", indexed: false },
      { name: "ttl", type: "uint256", indexed: false },
      { name: "createdAt", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Phase1Settled",
    inputs: [
      { name: "jobId", type: "bytes32", indexed: true },
      { name: "executor", type: "address", indexed: true },
      { name: "settledBlock", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "ResultDelivered",
    inputs: [
      { name: "jobId", type: "bytes32", indexed: true },
      { name: "target", type: "address", indexed: true },
      { name: "success", type: "bool", indexed: false },
    ],
  },
  {
    type: "event",
    name: "JobRemoved",
    inputs: [
      { name: "executor", type: "address", indexed: true },
      { name: "jobId", type: "bytes32", indexed: true },
      { name: "completed", type: "bool", indexed: true },
    ],
  },
  {
    type: "function",
    name: "hasPendingJobForSender",
    stateMutability: "view",
    inputs: [{ name: "sender", type: "address" }],
    outputs: [{ type: "bool" }],
  },
] as const;

export const teeServiceRegistryAbi = [
  {
    type: "function",
    name: "getServicesByCapability",
    stateMutability: "view",
    inputs: [
      { name: "capability", type: "uint8" },
      { name: "checkValidity", type: "bool" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          {
            name: "node",
            type: "tuple",
            components: [
              { name: "paymentAddress", type: "address" },
              { name: "teeAddress", type: "address" },
              { name: "teeType", type: "uint8" },
              { name: "publicKey", type: "bytes" },
              { name: "endpoint", type: "string" },
              { name: "certPubKeyHash", type: "bytes32" },
              { name: "capability", type: "uint8" },
            ],
          },
          { name: "isValid", type: "bool" },
          { name: "workloadId", type: "bytes32" },
        ],
      },
    ],
  },
] as const;

export const ritualWalletAbi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "lockUntil",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "deposit",
    stateMutability: "payable",
    inputs: [{ name: "lockDuration", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
] as const;
