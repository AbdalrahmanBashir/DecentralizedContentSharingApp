import { ethers } from "ethers";

export const connectMetaMask = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  await window.ethereum.request({ method: "eth_requestAccounts" });
  return new ethers.providers.Web3Provider(window.ethereum);
};
