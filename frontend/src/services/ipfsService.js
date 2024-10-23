import { create } from "kubo-rpc-client";

// Connect to your IPFS API
const ipfs = create({ url: "http://127.0.0.1:5001" });

// Function to upload a file to IPFS using the Kubo RPC client
export const uploadToIPFS = async (file) => {
  try {
    const result = await ipfs.add(file);
    return result.cid.toString(); // Return the IPFS CID (hash)
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
};
