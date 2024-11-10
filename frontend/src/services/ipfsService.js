import { create } from "kubo-rpc-client";

// Connect to your IPFS API
const ipfs = create({ url: "http://127.0.0.1:5001" });

// Function to upload a file to IPFS using the Kubo RPC client
export const uploadToIPFS = async (file) => {
  try {
    const result = await ipfs.add(file);
    return result.cid.toString(); // Return the IPFS CID hash
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
};

// Function to retrieve a file from IPFS by CID
export const retrieveFromIPFS = async (cid) => {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    const fileContent = new Blob(chunks, { type: "application/pdf" }); // Specify the PDF MIME type
    return fileContent;
  } catch (error) {
    console.error("Error retrieving file from IPFS:", error);
    throw error;
  }
};
