import Web3 from "web3";
import contractABI from "../abi/ResearchRegistryABI.json";

const contractAddress = "0x420Cc8B8bDF635C87537aC8c69E9D8975b5eae99"; // Replace with your contract address

// Function to initialize and return a Web3 instance
export const getWeb3 = () => {
  if (window.ethereum) {
    try {
      const web3 = new Web3(window.ethereum);
      window.ethereum.request({ method: "eth_requestAccounts" }); // Request accounts access if needed
      return web3;
    } catch (error) {
      console.error("Error initializing Web3:", error);
      throw error;
    }
  } else {
    console.error("MetaMask not detected.");
    throw new Error("MetaMask is not installed");
  }
};

// Function to initialize and return a contract instance
export const getContract = (web3) => {
  return new web3.eth.Contract(contractABI.abi, contractAddress);
};

// Function to register content
export const registerContent = async (title, ipfsHash, account) => {
  const web3 = getWeb3();
  const contract = getContract(web3);
  try {
    const receipt = await contract.methods
      .registerContent(title, ipfsHash)
      .send({ from: account });
    return receipt.events.ContentRegistered.returnValues.contentId; // Returns the content ID
  } catch (error) {
    console.error("Error registering content:", error);
    throw error;
  }
};

// Function to verify ownership
export const verifyOwnership = async (contentId) => {
  const web3 = getWeb3();
  const contract = getContract(web3);
  try {
    const owner = await contract.methods.verifyOwnership(contentId).call();
    return owner; // Returns the owner's address
  } catch (error) {
    console.error("Error verifying ownership:", error);
    throw error;
  }
};

// Function to transfer ownership
export const transferOwnership = async (contentId, newOwner, account) => {
  const web3 = getWeb3();
  const contract = getContract(web3);
  try {
    const receipt = await contract.methods
      .transferOwnership(contentId, newOwner)
      .send({ from: account });
    return receipt; // Returns the transaction receipt
  } catch (error) {
    console.error("Error transferring ownership:", error);
    throw error;
  }
};

// Function to check content novelty
export const checkNovelty = async (title, ipfsHash) => {
  const web3 = getWeb3();
  const contract = getContract(web3);
  try {
    const isNovel = await contract.methods.checkNovelty(title, ipfsHash).call();
    return isNovel; // Returns true if novel, false otherwise
  } catch (error) {
    console.error("Error checking novelty:", error);
    throw error;
  }
};
