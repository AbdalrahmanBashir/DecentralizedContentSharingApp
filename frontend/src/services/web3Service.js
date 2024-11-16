import Web3 from "web3";
import contractABI from "../abi/ResearchRegistryABIv2.json";
import { getCurrentAccount } from "../hooks/useWallet";

// contract address on the polygon testnet amoy
// contract address on the ganache local network
const contractAddress = "0xbE9E53Dd36de08220f571207c81988D24052d308";

let web3Instance;
let contractInstance;

// Initialize Web3 and Contract instances
const initializeWeb3 = () => {
  if (!web3Instance) {
    if (window.ethereum) {
      try {
        web3Instance = new Web3(window.ethereum);
        window.ethereum.request({ method: "eth_requestAccounts" });
        contractInstance = new web3Instance.eth.Contract(
          contractABI.abi,
          contractAddress
        );
      } catch (error) {
        console.error("Error initializing Web3:", error);
        throw new Error(
          "Failed to initialize Web3. Ensure MetaMask is connected."
        );
      }
    } else {
      throw new Error(
        "MetaMask is not installed. Please install MetaMask to proceed."
      );
    }
  }
};

// Get Web3 instance
export const getWeb3 = () => {
  initializeWeb3();
  return web3Instance;
};

// Get Contract instance
export const getContract = () => {
  initializeWeb3();
  return contractInstance;
};

// Automatically use the current wallet account
const getAccount = () => {
  const account = getCurrentAccount();
  if (!account) throw new Error("Wallet not connected");
  return account;
};

// Fetch all content IDs
export const getAllContentIds = async () => {
  try {
    return await getContract().methods.getAllContentIds().call();
  } catch (error) {
    console.error("Error retrieving all content IDs:", error);
    throw error;
  }
};

// Fetch content details by content ID
export const getLatestContent = async (contentId) => {
  try {
    const content = await getContract()
      .methods.getLatestContent(contentId)
      .call();
    return {
      id: contentId,
      title: content.title,
      ipfsHash: content.ipfsHash,
      owner: content.owner,
      category: content.category,
      timestamp: Number(content.timestamp),
      flagged: content.flagged,
      verified: content.verified,
      contentHash: content.contentHash,
    };
  } catch (error) {
    console.error("Error retrieving latest content details:", error);
    throw error;
  }
};

// Register new content
export const registerContent = async (title, ipfsHash, category) => {
  const account = getAccount();
  try {
    const receipt = await getContract()
      .methods.registerContent(title, ipfsHash, category)
      .send({ from: account });
    return receipt.events.ContentRegistered.returnValues.contentId;
  } catch (error) {
    console.error("Error registering content:", error);
    throw error;
  }
};

// Update content details
export const updateContentDetails = async (
  contentId,
  newTitle,
  newCategory
) => {
  const account = getAccount();
  try {
    const receipt = await getContract()
      .methods.updateContentDetails(contentId, newTitle, newCategory)
      .send({ from: account });
    return receipt;
  } catch (error) {
    console.error("Error updating content details:", error);
    throw error;
  }
};

// Vote to flag content
export const voteToFlagContent = async (contentId) => {
  const account = getAccount();
  try {
    // Prevent owner or collaborators from flagging the content
    const isNotAllowed = await isOwnerOrCollaborator(contentId, account);
    if (isNotAllowed) {
      throw new Error(
        "Action not allowed: Owner or collaborator cannot flag the content."
      );
    }

    const receipt = await getContract()
      .methods.voteToFlagContent(contentId)
      .send({ from: account });
    return receipt;
  } catch (error) {
    console.error("Error flagging content:", error);
    throw error;
  }
};

// Vote to restore flagged content
export const voteToRestoreContent = async (contentId) => {
  const account = getAccount();
  try {
    // Prevent owner or collaborators from restoring the content
    const isNotAllowed = await isOwnerOrCollaborator(contentId, account);
    if (isNotAllowed) {
      throw new Error(
        "Action not allowed: Owner or collaborator cannot restore the content."
      );
    }

    const receipt = await getContract()
      .methods.voteToRestoreContent(contentId)
      .send({ from: account });
    return receipt;
  } catch (error) {
    console.error("Error restoring content:", error);
    throw error;
  }
};

// Vote to verify content
export const voteToVerifyContent = async (contentId) => {
  const account = getAccount();
  try {
    // Prevent owner or collaborators from verifying the content
    const isNotAllowed = await isOwnerOrCollaborator(contentId, account);
    if (isNotAllowed) {
      throw new Error(
        "Action not allowed: Owner or collaborator cannot verify the content."
      );
    }

    const receipt = await getContract()
      .methods.voteToVerifyContent(contentId)
      .send({ from: account });
    return receipt;
  } catch (error) {
    console.error("Error verifying content:", error);
    throw error;
  }
};

// Fetch collaborators for a content ID
export const getCollaborators = async (contentId) => {
  try {
    return await getContract().methods.getCollaborators(contentId).call();
  } catch (error) {
    console.error("Error retrieving collaborators:", error);
    throw error;
  }
};

// Add a collaborator
export const addCollaborator = async (contentId, collaboratorAddress) => {
  const account = getAccount();
  try {
    const receipt = await getContract()
      .methods.addCollaborator(contentId, collaboratorAddress)
      .send({ from: account });
    return receipt;
  } catch (error) {
    console.error("Error adding collaborator:", error);
    throw error;
  }
};

// Remove a collaborator
export const removeCollaborator = async (contentId, collaboratorAddress) => {
  const account = getAccount();
  try {
    const receipt = await getContract()
      .methods.removeCollaborator(contentId, collaboratorAddress)
      .send({ from: account });
    return receipt;
  } catch (error) {
    console.error("Error removing collaborator:", error);
    throw error;
  }
};

// Fetch the content hash for a specific version of a content ID
export const getContentHash = async (contentId, version) => {
  try {
    const contentHash = await getContract()
      .methods.getContentHash(contentId, version)
      .call();
    return contentHash;
  } catch (error) {
    console.error("Error retrieving content hash:", error);
    throw error;
  }
};

// Fetch action history for a content ID
export const getActionHistory = async (contentId) => {
  try {
    const rawHistory = await getContract()
      .methods.getActionHistory(contentId)
      .call();

    // Map the raw action history using index access instead of field names
    const formattedHistory = await Promise.all(
      rawHistory.map(async (action) => {
        const actionType = parseInt(action[0]);
        const description = action[1];
        const user = action[2];
        const timestamp = Number(action[3]);
        const version = Number(action[5]);
        const contentHash = await getContentHash(contentId, version); // Retrieve content hash for the version

        return {
          actionType,
          description,
          user,
          timestamp,
          contentHash,
          version,
        };
      })
    );

    return formattedHistory;
  } catch (error) {
    console.error("Error retrieving action history:", error);
    throw error;
  }
};

// Transfer ownership of content
export const transferOwnership = async (contentId, newOwner) => {
  const account = getAccount();
  try {
    const receipt = await getContract()
      .methods.transferOwnership(contentId, newOwner)
      .send({ from: account });
    return receipt;
  } catch (error) {
    console.error("Error transferring ownership:", error);
    throw error;
  }
};

// Fetch all content owned by a specific account
export const fetchUserContent = async () => {
  const account = getAccount();
  try {
    // Fetch all content IDs owned by the account
    const contentIds = await getContract()
      .methods.getAllContentByOwner(account)
      .call();

    // Retrieve the latest version of each content item
    const userContent = await Promise.all(
      contentIds.map(async (contentId) => {
        const content = await getLatestContent(contentId); // Use getLatestContent instead of getContentDetails
        return {
          id: contentId,
          title: content.title,
          ipfsHash: content.ipfsHash,
          owner: content.owner,
          category: content.category,
          timestamp: Number(content.timestamp), // Convert BigInt to Number
          flagged: content.flagged,
          verified: content.verified,
          contentHash: content.contentHash, // Include content hash for immutability
        };
      })
    );

    return userContent;
  } catch (error) {
    console.error("Error fetching user content:", error);
    throw error;
  }
};

// Fetch collaborative content for a specific account
export const fetchCollaborativeContent = async () => {
  const account = getAccount();
  try {
    const contentIds = await getAllContentIds();
    const collaborativeContent = await Promise.all(
      contentIds.map(async (contentId) => {
        const content = await getLatestContent(contentId);
        const collaborators = await getCollaborators(contentId);
        return collaborators.includes(account.toLowerCase()) ? content : null;
      })
    );
    return collaborativeContent.filter(Boolean);
  } catch (error) {
    console.error("Error fetching collaborative content:", error);
    throw error;
  }
};

// Helper function to check if the user is the owner or a collaborator
const isOwnerOrCollaborator = async (contentId, account) => {
  try {
    const content = await getLatestContent(contentId);
    const collaborators = await getCollaborators(contentId);

    return (
      content.owner.toLowerCase() === account.toLowerCase() ||
      collaborators.includes(account.toLowerCase())
    );
  } catch (error) {
    throw new Error("Failed to check permissions. Please try again.");
  }
};
