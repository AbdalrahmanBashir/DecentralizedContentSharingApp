import { create } from "ipfs-http-client";

// Use your local IPFS node
const ipfs = create({
  host: "localhost", //local IPFS node
  port: 5001, // The port your Kubo RPC is running on
  protocol: "http", //
});

// Function to upload a file to your local IPFS node
export const uploadToIPFS = async (file) => {
  try {
    const added = await ipfs.add(file);
    return added.path; // Returns the IPFS hash (CID)
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
};

// Optional: Function to retrieve a file from IPFS using the local gateway
export const getFromIPFS = async (hash) => {
  try {
    const response = await fetch(`http://127.0.0.1:8080/ipfs/${hash}`);
    const data = await response.text(); // For text or JSON-based files
    return data;
  } catch (error) {
    console.error("Error retrieving file from IPFS:", error);
    throw error;
  }
};
