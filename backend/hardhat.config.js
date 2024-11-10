require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    ganache: {
      url: "HTTP://127.0.0.1:7545",
      gas: 100000000000000000000000, // Increase gas limit

      accounts: [
        "0xbff34b660574ea90d2568d70dc944fa32db3a4657f90c777d3a6bfe2239d7a45",
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
