// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract ResearchRegistry {
    
    // Struct to hold content information
    struct Content {
        string title;        // Title of the research content
        string ipfsHash;     // IPFS hash for decentralized content storage
        address owner;       // Owner of the content
        string category;     // Category of the content (e.g., Science, Technology)
        uint256 timestamp;   // Timestamp of when the content was registered
        uint256 accessCount; // Number of times the content has been accessed
        bool isPublic;       // Whether the content is publicly accessible
    }

    // Mapping to store registered content based on a unique content ID
    mapping(bytes32 => Content) public contents;

    // Mapping to store collaborators for each content ID
    mapping(bytes32 => address[]) public collaborators;

    // Array to keep track of all content IDs
    bytes32[] public allContentIds;

    // Event to emit whenever a new content is registered
    event ContentRegistered(
        address indexed owner,
        bytes32 indexed contentId,
        string title,
        string ipfsHash,
        uint256 timestamp,
        string category
    );
    
    // Event to emit when ownership is transferred
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner,
        bytes32 indexed contentId
    );

    // Event to emit when content details are updated
    event ContentUpdated(
        bytes32 indexed contentId,
        string title,
        string category,
        bool isPublic
    );

    // Event to emit when content access is tracked
    event ContentAccessed(
        bytes32 indexed contentId,
        address indexed user
    );

    // Event to emit when a collaborator is added
    event CollaboratorAdded(bytes32 indexed contentId, address indexed collaborator);

    // Event to emit when a collaborator is removed
    event CollaboratorRemoved(bytes32 indexed contentId, address indexed collaborator);

    /**
     * @dev Registers new research content on the blockchain.
     * @param _title The title of the research content
     * @param _ipfsHash The IPFS hash of the content file
     * @param _category The category of the research content
     * @param _isPublic Whether the content is publicly accessible
     * @return contentId The unique ID for the registered content
     */
    function registerContent(string memory _title, string memory _ipfsHash, string memory _category, bool _isPublic) public returns (bytes32) {
        bytes32 contentId = keccak256(abi.encodePacked(_title, _ipfsHash, msg.sender, block.timestamp));
        
        require(contents[contentId].owner == address(0), "Content already registered");

        contents[contentId] = Content({
            title: _title,
            ipfsHash: _ipfsHash,
            owner: msg.sender,
            category: _category,
            timestamp: block.timestamp,
            accessCount: 0,
            isPublic: _isPublic
        });

        allContentIds.push(contentId); // Add the content ID to the list of all content IDs

        emit ContentRegistered(msg.sender, contentId, _title, _ipfsHash, block.timestamp, _category);

        return contentId;
    }

    function verifyOwnership(bytes32 _contentId) public view returns (address) {
        require(contents[_contentId].owner != address(0), "Content does not exist");
        return contents[_contentId].owner;
    }

    function transferOwnership(bytes32 _contentId, address _newOwner) public {
        require(contents[_contentId].owner == msg.sender, "Only the owner can transfer ownership");
        require(_newOwner != address(0), "New owner cannot be zero address");

        emit OwnershipTransferred(msg.sender, _newOwner, _contentId);

        contents[_contentId].owner = _newOwner;
    }

    function updateContentDetails(bytes32 _contentId, string memory _newTitle, string memory _newCategory, bool _isPublic) public {
        require(contents[_contentId].owner == msg.sender || isCollaborator(_contentId, msg.sender), "Not authorized to update content");

        Content storage content = contents[_contentId];
        content.title = _newTitle;
        content.category = _newCategory;
        content.isPublic = _isPublic;

        emit ContentUpdated(_contentId, _newTitle, _newCategory, _isPublic);
    }

    function trackAccess(bytes32 _contentId) public {
        require(contents[_contentId].isPublic || contents[_contentId].owner == msg.sender || isCollaborator(_contentId, msg.sender), "Access denied");
        
        contents[_contentId].accessCount += 1;
        emit ContentAccessed(_contentId, msg.sender);
    }

    function addCollaborator(bytes32 _contentId, address _collaborator) public {
        require(contents[_contentId].owner == msg.sender, "Only the owner can add collaborators");
        collaborators[_contentId].push(_collaborator);
        emit CollaboratorAdded(_contentId, _collaborator);
    }

    function removeCollaborator(bytes32 _contentId, address _collaborator) public {
        require(contents[_contentId].owner == msg.sender, "Only the owner can remove collaborators");

        address[] storage contentCollaborators = collaborators[_contentId];
        for (uint256 i = 0; i < contentCollaborators.length; i++) {
            if (contentCollaborators[i] == _collaborator) {
                contentCollaborators[i] = contentCollaborators[contentCollaborators.length - 1];
                contentCollaborators.pop();
                emit CollaboratorRemoved(_contentId, _collaborator);
                return;
            }
        }
        revert("Collaborator not found");
    }

    function isCollaborator(bytes32 _contentId, address _collaborator) public view returns (bool) {
        address[] memory contentCollaborators = collaborators[_contentId];
        for (uint256 i = 0; i < contentCollaborators.length; i++) {
            if (contentCollaborators[i] == _collaborator) {
                return true;
            }
        }
        return false;
    }

    function getCollaborators(bytes32 _contentId) public view returns (address[] memory) {
        return collaborators[_contentId];
    }

    /**
     * @dev Retrieves a list of all content IDs.
     * @return bytes32[] List of all registered content IDs
     */
    function getAllContentIds() public view returns (bytes32[] memory) {
        return allContentIds;
    }

    function checkNovelty(string memory _title, string memory _ipfsHash) public view returns (bool) {
        bytes32 contentId = keccak256(abi.encodePacked(_title, _ipfsHash, msg.sender));

        if (contents[contentId].owner == address(0)) {
            return true;
        } else {
            return false;
        }
    }
}
