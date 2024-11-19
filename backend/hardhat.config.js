require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  settings: {
    optimizer: {
      enabled: true,
      runs: 50, // Increasing runs can further reduce bytecode size
    },
  },
  debug: {
    revertStrings: "strip", // This will strip all revert strings
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    ganache: {
      url: "HTTP://127.0.0.1:7545",

      accounts: [
        "0xbff34b660574ea90d2568d70dc944fa32db3a4657f90c777d3a6bfe2239d7a45",
      ],
    },
    ganache2: {
      url: "HTTP://127.0.0.1:7545",

      accounts: [
        "0xfb355b45cddc492548a2cedb7c41d487616298b172efa3aa6b579fb84d53be1a",
      ],
    },
    amoy: {
      chainId: 80002,
      url: "https://lb.drpc.org/ogrpc?network=polygon-amoy&dkey=AsMmly7b8kA3nXqmEFbROPi98m6Im6wR76SLFhW5UfFk",
      accounts: [
        "bff34b660574ea90d2568d70dc944fa32db3a4657f90c777d3a6bfe2239d7a45",
      ],
    },
    amoy2: {
      chainId: 80002,
      url: "https://lb.drpc.org/ogrpc?network=polygon-amoy&dkey=AsMmly7b8kA3nXqmEFbROPi98m6Im6wR76SLFhW5UfFk",
      accounts: [
        "ae7954f1625a9f9004b8c4d4607caf3ca39b6bfc213be262c369e9b9b3b7052a",
      ],
    },
  },
};
