import Web3 from "web3";
import contractABI from "../abi/ResearchRegistryABI.json";

//const contractAddress = "0x77A2B100074ce2824ADAD1B8A88BC370346DB70A";
//const contractAddress = "0x50C7297023125AE92022DBdfbE3e07A362e5b430";
//const contractAddress = "0xdBf0b7de6193d6A11558D577bFf68B57848d051C";
//const contractAddress = "0x53df2Ca59077399028Ebe7ab50804f2159CfDE38";
const contractAddress = "0xf20Fc8AB51DBE7151B9c220dBfadcB82527D1aC7";
// Initialize and return a Web3 instance
let web3Instance;
let contractInstance;

// Initialize Web3 and Contract instances only once
const initializeWeb3 = () => {
  if (window.ethereum) {
    try {
      web3Instance = new Web3(window.ethereum);
      window.ethereum.request({ method: "eth_requestAccounts" }); // Request access to accounts
      contractInstance = new web3Instance.eth.Contract(
        contractABI.abi,
        contractAddress
      );
    } catch (error) {
      console.error("Error initializing Web3:", error);
      throw new Error(
        "Web3 initialization failed. Make sure MetaMask is connected."
      );
    }
  } else {
    throw new Error(
      "MetaMask is not installed. Please install MetaMask to interact with the app."
    );
  }
};

// Get Web3 instance (initialize if necessary)
export const getWeb3 = () => {
  if (!web3Instance) initializeWeb3();
  return web3Instance;
};

// Get Contract instance (initialize if necessary)
export const getContract = () => {
  if (!contractInstance) initializeWeb3();
  return contractInstance;
};

// Fetch all content IDs from the contract
export const getAllContentIds = async () => {
  try {
    const contentIds = await getContract().methods.getAllContentIds().call();
    return contentIds;
  } catch (error) {
    console.error("Error retrieving all content IDs:", error);
    throw error;
  }
};

// Fetch content details by content ID
export const getContentDetails = async (contentId) => {
  try {
    const content = await getContract().methods.contents(contentId).call();
    return {
      id: contentId,
      ...content,
    };
  } catch (error) {
    console.error(
      `Error retrieving content details for ID ${contentId}:`,
      error
    );
    throw error;
  }
};

// Fetch all registered contents on the blockchain
export const fetchAllContent = async () => {
  try {
    // Get all content IDs
    const contentIds = await getContract().methods.getAllContentIds().call();

    // Fetch details for each content
    const allContent = await Promise.all(
      contentIds.map(async (contentId) => {
        const content = await getContract().methods.contents(contentId).call();
        return {
          id: contentId,
          ...content,
        };
      })
    );

    return allContent;
  } catch (error) {
    console.error("Error fetching all content:", error);
    throw error;
  }
};

// Fetch content owned by a specific account
export const fetchUserContent = async (account) => {
  try {
    // Get all content IDs
    const contentIds = await getAllContentIds();

    // Fetch details for each content and filter by owner
    const userContent = await Promise.all(
      contentIds.map(async (contentId) => {
        const content = await getContentDetails(contentId);
        if (content.owner.toLowerCase() === account.toLowerCase()) {
          return content;
        }
        return null;
      })
    );

    // Filter out null values (non-owned content)
    return userContent.filter(Boolean);
  } catch (error) {
    console.error("Error fetching user content:", error);
    throw error;
  }
};

// Fetch collaborative content for a specific account
export const fetchCollaborativeContent = async (account) => {
  try {
    const contentIds = await getContract().methods.getAllContentIds().call();
    const collaborativeContent = await Promise.all(
      contentIds.map(async (id) => {
        const content = await getContract()
          .methods.getContentDetails(id)
          .call();
        const collaborators = await getContract()
          .methods.getCollaborators(id)
          .call();
        return {
          id,
          ...content,
          isCollaborator: collaborators.includes(account.toLowerCase()),
        };
      })
    );
    return collaborativeContent.filter((content) => content.isCollaborator);
  } catch (error) {
    console.error("Error fetching collaborative content:", error);
    throw error;
  }
};

// Register content on the blockchain
export const registerContent = async (
  title,
  ipfsHash,
  category,
  isPublic,
  account
) => {
  try {
    const receipt = await getContract()
      .methods.registerContent(title, ipfsHash, category, isPublic)
      .send({ from: account });
    return receipt.events.ContentRegistered.returnValues.contentId; // Returns content ID
  } catch (error) {
    console.error("Error registering content:", error);
    throw error;
  }
};

// Verify ownership of content
export const verifyOwnership = async (contentId) => {
  try {
    const owner = await getContract().methods.verifyOwnership(contentId).call();
    return owner; // Returns owner's address
  } catch (error) {
    console.error("Error verifying ownership:", error);
    throw error;
  }
};

// Transfer ownership of content
export const transferOwnership = async (contentId, newOwner, account) => {
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

// Check if content is novel
export const checkNovelty = async (title, ipfsHash) => {
  try {
    const isNovel = await getContract()
      .methods.checkNovelty(title, ipfsHash)
      .call();
    return isNovel; // Returns true if novel, false otherwise
  } catch (error) {
    console.error("Error checking novelty:", error);
    throw error;
  }
};

// Add a collaborator to content
export const addCollaborator = async (
  contentId,
  collaboratorAddress,
  account
) => {
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

// Remove a collaborator from content
export const removeCollaborator = async (
  contentId,
  collaboratorAddress,
  account
) => {
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

// Update content details
export const updateContentDetails = async (
  contentId,
  newTitle,
  newCategory,
  isPublic,
  account
) => {
  try {
    const receipt = await getContract()
      .methods.updateContentDetails(contentId, newTitle, newCategory, isPublic)
      .send({ from: account });
    return receipt;
  } catch (error) {
    console.error("Error updating content details:", error);
    throw error;
  }
};

// Track content access
export const trackAccess = async (contentId, account) => {
  try {
    const receipt = await getContract()
      .methods.trackAccess(contentId)
      .send({ from: account });
    return receipt;
  } catch (error) {
    console.error("Error tracking content access:", error);
    throw error;
  }
};

// Get all content IDs

// Get collaborators for a content ID
export const getCollaborators = async (contentId) => {
  try {
    const collaborators = await getContract()
      .methods.getCollaborators(contentId)
      .call();
    return collaborators;
  } catch (error) {
    console.error("Error retrieving collaborators:", error);
    throw error;
  }
};

// Get access history for a content ID
export const getAccessHistory = async (contentId) => {
  try {
    const accessHistory = await getContract()
      .methods.getAccessHistory(contentId)
      .call();
    return accessHistory;
  } catch (error) {
    console.error("Error retrieving access history:", error);
    throw error;
  }
};
