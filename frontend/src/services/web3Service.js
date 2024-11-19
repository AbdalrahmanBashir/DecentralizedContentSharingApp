import Web3 from "web3";
import contractABI from "../abi/ResearchRegistryABIv2.json";
import { getCurrentAccount } from "../hooks/useWallet";

// contract address on the polygon testnet amoy
const contractAddress = "0xcBc62d71bc3340b3a39010b164c0bC9A04A1bFED";
// contract address on the ganache local network
//const contractAddress = "0x09E2103C2A278E2081023E4CA3154a19C036738e";
//const contractAddress = "0xbE9E53Dd36de08220f571207c81988D24052d308";

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

/**
 * Fetch all content IDs
 * @returns {Promise<string[]>} A promise that resolves to an array of strings, each representing a content ID.
 * @throws Will throw an error if unable to fetch the content IDs.
 */
export const getAllContentIds = async () => {
  try {
    // Call the smart contract to get all content IDs
    return await getContract().methods.getAllContentIds().call();
  } catch (error) {
    console.error("Error retrieving all content IDs:", error);
    throw error;
  }
};

/**
 * Fetch content details by content ID
 * @param {string} contentId - The content ID.
 * @returns {Promise<Object>} A promise that resolves to an object containing the content details.
 * @throws Will throw an error if unable to fetch the content details.
 */
export const getLatestContent = async (contentId) => {
  try {
    // Call the smart contract to get the latest content details
    const content = await getContract()
      .methods.getLatestContent(contentId)
      .call();

    // Return the content details as an object
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
    // Log and throw any errors that occur
    console.error("Error retrieving latest content details:", error);
    throw error;
  }
};

/**
 * Register new content
 * @param {string} title - The title of the content.
 * @param {string} ipfsHash - The IPFS hash of the content.
 * @param {string} category - The category of the content.
 * @returns {Promise<string>} A promise that resolves to the content ID.
 * @throws Will throw an error if unable to register the content.
 */
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

/**
 * Update content details
 * @param {string} contentId - The ID of the content to update.
 * @param {string} newTitle - The new title of the content.
 * @param {string} newCategory - The new category of the content.
 * @returns {Promise<object>} A promise that resolves to the transaction receipt.
 * @throws Will throw an error if unable to update the content details.
 */
export const updateContentDetails = async (
  contentId,
  newTitle,
  newCategory
) => {
  const account = getAccount();
  try {
    // Call the contract to update the content details
    const receipt = await getContract()
      .methods.updateContentDetails(contentId, newTitle, newCategory)
      .send({ from: account });
    return receipt;
  } catch (error) {
    console.error("Error updating content details:", error);
    throw error;
  }
};

/**
 * Vote to flag content
 * @param {string} contentId - The ID of the content to flag.
 * @returns {Promise<object>} A promise that resolves to the transaction receipt.
 * @throws Will throw an error if unable to flag the content.
 */
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

    // Call the contract to vote to flag the content
    const receipt = await getContract()
      .methods.voteToFlagContent(contentId)
      .send({ from: account });
    return receipt;
  } catch (error) {
    console.error("Error flagging content:", error);
    throw error;
  }
};

/**
 * Vote to restore flagged content
 * @param {string} contentId - The ID of the content to restore.
 * @returns {Promise<object>} A promise that resolves to the transaction receipt.
 * @throws Will throw an error if unable to restore the content.
 */
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

    // Send the transaction to restore the content
    const receipt = await getContract()
      .methods.voteToRestoreContent(contentId)
      .send({ from: account });
    return receipt;
  } catch (error) {
    console.error("Error restoring content:", error);
    throw error;
  }
};

/**
 * Vote to verify content
 * @param {string} contentId - The ID of the content to vote on.
 * @returns {Promise<object>} A promise that resolves to the transaction receipt.
 * @throws Will throw an error if unable to verify the content.
 */
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

    // Call the voteToVerifyContent function on the smart contract
    const receipt = await getContract()
      .methods.voteToVerifyContent(contentId)
      .send({ from: account });

    return receipt;
  } catch (error) {
    console.error("Error verifying content:", error);
    throw error;
  }
};

/**
 * Fetch collaborators for a given content ID.
 * @param {string} contentId - The ID of the content to fetch collaborators for.
 * @returns {Promise<address[]>} A promise that resolves to an array of collaborator addresses.
 * @throws Will throw an error if unable to retrieve collaborators.
 */
export const getCollaborators = async (contentId) => {
  try {
    // Retrieve collaborator addresses from the smart contract
    return await getContract().methods.getCollaborators(contentId).call();
  } catch (error) {
    console.error("Error retrieving collaborators:", error);
    throw error;
  }
};

/**
 * Add a collaborator to a content ID
 * @param {string} contentId - Content ID
 * @param {string} collaboratorAddress - Address of the collaborator to be added
 * @returns {Promise<Object>} Transaction receipt
 */
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

/**
 * Remove a collaborator from a content ID
 * @param {string} contentId - Content ID
 * @param {string} collaboratorAddress - Address of the collaborator to be removed
 * @returns {Promise<Object>} Transaction receipt
 */
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

/**
 * Fetch action history for a content ID
 * @param {string} contentId The ID of the content to fetch history for
 * @returns {Promise<Object[]>} An array of action history objects with the following properties:
 *  - actionType: The type of the action (e.g. flag, verify, restore)
 *  - description: A brief description of the action
 *  - user: The Ethereum address of the user who performed the action
 *  - timestamp: The timestamp of the action
 *  - contentHash: The content hash of the content at the time of the action
 *  - version: The version of the content at the time of the action
 */
export const getActionHistory = async (contentId) => {
  try {
    // Fetch the raw action history from the contract
    const rawHistory = await getContract()
      .methods.getActionHistory(contentId)
      .call();

    // Map the raw action history using index access instead of field names
    const formattedHistory = await Promise.all(
      rawHistory.map(async (action) => {
        // Extract the action type and description from the raw action
        const actionType = parseInt(action[0]);
        const description = action[1];
        const user = action[2];
        const timestamp = Number(action[3]);

        // Extract the content hash from the contract
        const version = Number(action[5]);
        const contentHash = await getContentHash(contentId, version);

        // Return the formatted action history object
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

    // Return the formatted action history
    return formattedHistory;
  } catch (error) {
    console.error("Error retrieving action history:", error);
    throw error;
  }
};

/**
 * Transfer ownership of content
 * @param {string} contentId The ID of the content to transfer
 * @param {string} newOwner The address of the new owner
 * @returns {Promise<Object>} The transaction receipt
 */
export const transferOwnership = async (contentId, newOwner) => {
  const account = getAccount();
  try {
    // Transfer ownership of the content
    const receipt = await getContract()
      .methods.transferOwnership(contentId, newOwner)
      .send({ from: account });

    return receipt;
  } catch (error) {
    console.error("Error transferring ownership:", error);
    throw error;
  }
};

/**
 * Fetch all content owned by a specific account
 * @returns {Promise<Array<Object>>} An array of content objects owned by the account
 */
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

/**
 * Fetch collaborative content for a specific account
 * @returns {Promise<Array<Object>>} An array of content objects the account is a collaborator on
 */
export const fetchCollaborativeContent = async () => {
  const account = getAccount();
  try {
    const contentIds = await getAllContentIds();

    // Iterate over all content IDs and filter out the ones the account is a collaborator on
    const collaborativeContent = await Promise.all(
      contentIds.map(async (contentId) => {
        const content = await getLatestContent(contentId);
        const collaborators = await getCollaborators(contentId);
        return collaborators.includes(account.toLowerCase()) ? content : null;
      })
    );

    // Filter out null values from the array
    return collaborativeContent.filter(Boolean);
  } catch (error) {
    console.error("Error fetching collaborative content:", error);
    throw error;
  }
};

/**
 * Helper function to check if the user is the owner or a collaborator
 *
 * @param {string} contentId - The ID of the content to check
 * @param {string} account - The account to check
 * @returns {Promise<boolean>} Whether the user is the owner or a collaborator
 */
const isOwnerOrCollaborator = async (contentId, account) => {
  try {
    const content = await getLatestContent(contentId); // Fetch the content with the given ID
    const collaborators = await getCollaborators(contentId); // Fetch all collaborators

    // Check if the account is the owner or a collaborator
    return (
      content.owner.toLowerCase() === account.toLowerCase() ||
      collaborators.includes(account.toLowerCase())
    );
  } catch (error) {
    // Handle errors and throw a new error
    throw new Error("Failed to check permissions. Please try again.");
  }
};
