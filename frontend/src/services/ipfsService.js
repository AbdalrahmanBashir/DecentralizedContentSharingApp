import { create } from "kubo-rpc-client";

// Connect to your IPFS API
const ipfs = create({ url: "http://127.0.0.1:5001" });

/**
 * Function to upload a file to IPFS using the Kubo RPC client
 *
 * @param {File} file The file to upload to IPFS
 *
 * @returns {string} The IPFS CID hash of the uploaded file
 */
export const uploadToIPFS = async (file) => {
  try {
    // Add the file to IPFS using the Kubo RPC client
    const result = await ipfs.add(file);
    // Return the IPFS CID hash
    return result.cid.toString();
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
};

/**
 * Function to retrieve a file from IPFS by CID
 * @param {string} cid The IPFS CID hash of the file to retrieve
 * @returns {Blob} The file content as a Blob object
 */
export const retrieveFromIPFS = async (cid) => {
  try {
    // Retrieve the file from IPFS by CID
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    // Convert the chunks to a single Blob object
    const fileContent = new Blob(chunks, { type: "application/pdf" }); // Specify the PDF MIME type
    return fileContent;
  } catch (error) {
    console.error("Error retrieving file from IPFS:", error);
    throw error;
  }
};
