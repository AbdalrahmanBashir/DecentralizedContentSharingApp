// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ResearchRegistry {
    
    // Struct to hold content information
    struct Content {
        string title;        // Title of the research content
        string ipfsHash;     // IPFS hash for decentralized content storage
        address owner;       // Owner of the content
        uint256 timestamp;   // Timestamp of when the content was registered
    }

    // Mapping to store registered content based on a unique content ID which is a hash of title, IPFS hash, and owner
    mapping(bytes32 => Content) public contents;

    // Event to emit whenever a new content is registered
    event ContentRegistered(
        address indexed owner,
        bytes32 indexed contentId,
        string title,
        string ipfsHash,
        uint256 timestamp
    );
    
    // Event to emit when ownership is transferred
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner,
        bytes32 indexed contentId
    );

    /**
     * @dev Registers new research content on the blockchain.
     * @param _title The title of the research content
     * @param _ipfsHash The IPFS hash of the content file
     * @return contentId The unique ID for the registered content
     */
    function registerContent(string memory _title, string memory _ipfsHash) public returns (bytes32) {
        // Generate a unique content ID by hashing the title, IPFS hash, owner, and timestamp
        bytes32 contentId = keccak256(abi.encodePacked(_title, _ipfsHash, msg.sender, block.timestamp));
        
        // Ensure that content with the same ID hasn't already been registered
        require(contents[contentId].owner == address(0), "Content already registered");

        // Create a new content entry
        contents[contentId] = Content({
            title: _title,
            ipfsHash: _ipfsHash,
            owner: msg.sender,
            timestamp: block.timestamp
        });

        // Emit an event for the newly registered content
        emit ContentRegistered(msg.sender, contentId, _title, _ipfsHash, block.timestamp);

        return contentId;
    }

    /**
     * @dev Verifies the owner of a registered content.
     * @param _contentId The unique ID of the content
     * @return owner The address of the content owner
     */
    function verifyOwnership(bytes32 _contentId) public view returns (address) {
        require(contents[_contentId].owner != address(0), "Content does not exist");
        return contents[_contentId].owner;
    }

    /**
     * @dev Transfers ownership of the research content to a new owner.
     * @param _contentId The unique ID of the content
     * @param _newOwner The address of the new owner
     */
    function transferOwnership(bytes32 _contentId, address _newOwner) public {
        // Only the current owner can transfer ownership
        require(contents[_contentId].owner == msg.sender, "Only the owner can transfer ownership");
        require(_newOwner != address(0), "New owner cannot be zero address");

        // Emit the event before changing the ownership
        emit OwnershipTransferred(msg.sender, _newOwner, _contentId);

        // Update the owner in the mapping
        contents[_contentId].owner = _newOwner;
    }

    /**
     * @dev Checks for content novelty by ensuring the content isn't already registered.
     * @param _title The title of the research content
     * @param _ipfsHash The IPFS hash of the content
     * @return bool True if the content is novel, false if it already exists
     */
    function checkNovelty(string memory _title, string memory _ipfsHash) public view returns (bool) {
        // Generate a content ID
        bytes32 contentId = keccak256(abi.encodePacked(_title, _ipfsHash, msg.sender));

        // Check if the content is already registered
        if (contents[contentId].owner == address(0)) {
            return true; // Content is novel (not registered yet)
        } else {
            return false; // Content already exists
        }
    }
}
