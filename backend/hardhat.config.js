require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
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
  },
};
