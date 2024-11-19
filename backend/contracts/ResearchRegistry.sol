// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract ResearchRegistry {
    struct Content {
        string title;
        string ipfsHash;
        address owner;
        string category;
        uint256 timestamp;
        bool flagged;
        bool verified;
        bytes32 contentHash; // content hash for immutability
    }

    enum ActionType { MetadataUpdate, CollaboratorAdded, CollaboratorRemoved, OwnershipTransferred, Verified, Flagged, Restored, MetadataRegistered }

    struct Action {
        ActionType actionType;
        string description;
        address user;
        uint256 timestamp;
        bytes32 contentHash;
        uint256 version;
    }

    mapping(bytes32 => Content) public contents;
    mapping(bytes32 => Action[]) public actionHistory;
    mapping(bytes32 => mapping(uint256 => Content)) public versions;
    mapping(bytes32 => uint256) public versionCount;
    mapping(bytes32 => address[]) public collaborators;
    mapping(bytes32 => address[]) public voters;
    mapping(bytes32 => mapping(address => bool)) public flagVotes;
    mapping(bytes32 => mapping(address => bool)) public restoreVotes;
    mapping(bytes32 => mapping(address => bool)) public verifyVotes;
    mapping(string => bool) public registeredIpfsHashes;
    


    bytes32[] public allContentIds;
    uint256 public flaggingThreshold = 3;
    uint256 public restoringThreshold = 3;
    uint256 public verificationThreshold = 3;

    event ContentRegistered(address indexed owner, bytes32 indexed contentId, string title, string ipfsHash, uint256 timestamp, string category);
    event ContentUpdated(bytes32 indexed contentId, uint256 version, string title, string category, uint256 timestamp, bytes32 contentHash);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner, bytes32 indexed contentId);
    event ContentFlagged(bytes32 indexed contentId, address indexed reporter, bool flagged);
    event ContentRestored(bytes32 indexed contentId, bool flagged);
    event ContentVerified(bytes32 indexed contentId, address indexed verifier, bool verified);
    event CollaboratorAdded(bytes32 indexed contentId, address indexed collaborator);
    event CollaboratorRemoved(bytes32 indexed contentId, address indexed collaborator);
    event ContentHashUpdated(bytes32 indexed contentId, bytes32 contentHash);
    event VoterAdded(bytes32 indexed contentId, address indexed voter);


    modifier onlyContentOwner(bytes32 _contentId) {
        require(contents[_contentId].owner == msg.sender, "Not the content owner");
        _;
    }

    modifier onlyAuthorized(bytes32 _contentId) {
        require(contents[_contentId].owner == msg.sender || isCollaborator(_contentId, msg.sender), "Not authorized");
        _;
    }

    function registerContent(
        string memory _title,
        string memory _ipfsHash,
        string memory _category
    ) public returns (bytes32) {
        require(!registeredIpfsHashes[_ipfsHash], "IPFS hash already registered");
        bytes32 contentId = keccak256(abi.encodePacked(_title, _ipfsHash, msg.sender, block.timestamp));
        require(contents[contentId].owner == address(0), "Content already registered");

        bytes32 contentHash = keccak256(abi.encodePacked(_title, _ipfsHash, _category, block.timestamp));

        Content memory newContent = Content({
            title: _title,
            ipfsHash: _ipfsHash,
            owner: msg.sender,
            category: _category,
            timestamp: block.timestamp,
            flagged: false,
            verified: false,
            contentHash: contentHash // Store the hash for immutability
        });

        contents[contentId] = newContent;
        versions[contentId][1] = newContent;
        versionCount[contentId] = 1;
        allContentIds.push(contentId);

        registeredIpfsHashes[_ipfsHash] = true;

        _addAction(contentId, ActionType.MetadataRegistered, "Content registered", contentHash, 1);
        emit ContentRegistered(msg.sender, contentId, _title, _ipfsHash, block.timestamp, _category);
        emit ContentHashUpdated(contentId, contentHash);
        return contentId;
    }

    function updateContentDetails(
        bytes32 _contentId,
        string memory _newTitle,
        string memory _newCategory
    ) public onlyContentOwner(_contentId) {
        uint256 currentVersion = versionCount[_contentId] + 1;
        bytes32 contentHash = keccak256(abi.encodePacked(_newTitle, contents[_contentId].ipfsHash, _newCategory, block.timestamp));

        Content memory updatedContent = Content({
            title: _newTitle,
            ipfsHash: contents[_contentId].ipfsHash,
            owner: msg.sender,
            category: _newCategory,
            timestamp: block.timestamp,
            flagged: false,
            verified: false,
            contentHash: contentHash // Store the hash for immutability
        });

        versions[_contentId][currentVersion] = updatedContent;
        versionCount[_contentId] = currentVersion;
        _addAction(_contentId, ActionType.MetadataUpdate, "Metadata updated", contentHash, currentVersion);
        emit ContentUpdated(_contentId, currentVersion, _newTitle, _newCategory, block.timestamp, contentHash);
        emit ContentHashUpdated(_contentId, contentHash);

    }

    function voteToFlagContent(bytes32 _contentId) public {
        require(!isCollaborator(_contentId, msg.sender), "Collaborators cannot vote");
        require(contents[_contentId].owner != msg.sender, "Owner cannot vote");
        require(!flagVotes[_contentId][msg.sender], "Already voted");

        flagVotes[_contentId][msg.sender] = true;
        _addVoter(_contentId, msg.sender);

        if (_countVotes(_contentId, flagVotes[_contentId]) >= flaggingThreshold) {
            contents[_contentId].flagged = true;
            uint256 currentVersion = versionCount[_contentId] + 1;
            bytes32 actionHash = keccak256(abi.encodePacked("Flagged", _contentId, block.timestamp, msg.sender));
            versions[_contentId][currentVersion] = contents[_contentId];
            versionCount[_contentId] = currentVersion;
            _addAction(_contentId, ActionType.Flagged, "Content flagged by independent voters", actionHash, currentVersion);
            emit ContentFlagged(_contentId, msg.sender, contents[_contentId].flagged);
        }
    }


    function voteToVerifyContent(bytes32 _contentId) public {
        require(!isCollaborator(_contentId, msg.sender), "Collaborators cannot vote");
        require(contents[_contentId].owner != msg.sender, "Owner cannot vote");
        require(!verifyVotes[_contentId][msg.sender], "Already voted");

        verifyVotes[_contentId][msg.sender] = true;
        if (_countVotes(_contentId, verifyVotes[_contentId]) >= verificationThreshold) {
            contents[_contentId].verified = true;
            uint256 currentVersion = versionCount[_contentId] + 1;
            bytes32 actionHash = keccak256(abi.encodePacked("Verified", _contentId, block.timestamp, msg.sender));
            versions[_contentId][currentVersion] = contents[_contentId];
            versionCount[_contentId] = currentVersion;
            _addAction(_contentId, ActionType.Verified, "Content verified by independent voters", actionHash, currentVersion);
            emit ContentVerified(_contentId, msg.sender, contents[_contentId].verified);
        }
    }


    function voteToRestoreContent(bytes32 _contentId) public {
        require(contents[_contentId].flagged, "Content not flagged");
        require(contents[_contentId].owner != msg.sender, "Owner cannot vote");
        require(!isCollaborator(_contentId, msg.sender), "Collaborators cannot vote");
        require(!restoreVotes[_contentId][msg.sender], "Already voted");

        restoreVotes[_contentId][msg.sender] = true;

        if (_countVotes(_contentId, restoreVotes[_contentId]) >= restoringThreshold) {
            contents[_contentId].flagged = false;
            uint256 currentVersion = versionCount[_contentId] + 1;
            bytes32 actionHash = keccak256(abi.encodePacked("Restored", _contentId, block.timestamp, msg.sender));
            versions[_contentId][currentVersion] = contents[_contentId];
            versionCount[_contentId] = currentVersion;
            _addAction(_contentId, ActionType.Restored, "Content restored by independent voters", actionHash, currentVersion);
            emit ContentRestored(_contentId, contents[_contentId].flagged);
        }
    }


    function getCollaborators(bytes32 _contentId) public view returns (address[] memory) {
        return collaborators[_contentId];
    }

    function getActionHistory(bytes32 _contentId) public view returns (Action[] memory) {
        return actionHistory[_contentId];
    }

    function getContentVersion(bytes32 _contentId, uint256 _version) public view returns (Content memory) {
        require(_version <= versionCount[_contentId], "Version does not exist");
        return versions[_contentId][_version];
    }

    function getLatestContent(bytes32 _contentId) public view returns (Content memory) {
        return versions[_contentId][versionCount[_contentId]];
    }

    function getAllContentIds() public view returns (bytes32[] memory) {
        return allContentIds;
    }

    function getAllContentByOwner(address _owner) public view returns (bytes32[] memory) {
        uint256 count;
        for (uint256 i = 0; i < allContentIds.length; i++) {
            if (contents[allContentIds[i]].owner == _owner) count++;
        }

        bytes32[] memory ownerContentIds = new bytes32[](count);
        uint256 index;
        for (uint256 i = 0; i < allContentIds.length; i++) {
            if (contents[allContentIds[i]].owner == _owner) ownerContentIds[index++] = allContentIds[i];
        }

        return ownerContentIds;
    }

    function isCollaborator(bytes32 _contentId, address _collaborator) internal view returns (bool) {
        for (uint256 i = 0; i < collaborators[_contentId].length; i++) {
            if (collaborators[_contentId][i] == _collaborator) return true;
        }
        return false;
    }

    function _addAction(bytes32 _contentId, ActionType _type, string memory _desc, bytes32 _contentHash, uint256 _version) internal {
       versions[_contentId][_version].contentHash = _contentHash; // Store immutable hash for the version
       actionHistory[_contentId].push(Action(_type, _desc, msg.sender, block.timestamp, _contentHash, _version));  
    }


    function _countVotes(bytes32 _contentId, mapping(address => bool) storage votes) internal view returns (uint256 count) {
        count = 0;
        for (uint256 i = 0; i < voters[_contentId].length; i++) {
            address voter = voters[_contentId][i];
            if (!isCollaborator(_contentId, voter) && contents[_contentId].owner != voter && votes[voter]) {
                count++;
            }
        }
    }

    function _addVoter(bytes32 _contentId, address voter) internal {
        if (!isCollaborator(_contentId, voter) && contents[_contentId].owner != voter) {
            for (uint256 i = 0; i < voters[_contentId].length; i++) {
                if (voters[_contentId][i] == voter) {
                    return; // Voter already added
                }
            }
            voters[_contentId].push(voter);
            emit VoterAdded(_contentId, voter);
        }
    }


    function getContentHash(bytes32 _contentId, uint256 _version) public view returns (bytes32) {
        require(_version <= versionCount[_contentId], "Version does not exist");
        return versions[_contentId][_version].contentHash;
    }

    function addCollaborator(bytes32 _contentId, address _collaborator) public {
        require(contents[_contentId].owner == msg.sender, "Only the owner can add collaborators");
        collaborators[_contentId].push(_collaborator);
        uint256 currentVersion = versionCount[_contentId] + 1;
        bytes32 actionHash = keccak256(
        abi.encodePacked("CollaboratorAdded", _contentId, _collaborator, block.timestamp));
        versions[_contentId][currentVersion] = contents[_contentId];
        versionCount[_contentId] = currentVersion;
        _addAction(_contentId, ActionType.CollaboratorAdded, "Collaborator added", actionHash, currentVersion);
        emit CollaboratorAdded(_contentId, _collaborator);
    }

    function removeCollaborator(bytes32 _contentId, address _collaborator) public {
        require(contents[_contentId].owner == msg.sender, "Only the owner can remove collaborators");

        address[] storage contentCollaborators = collaborators[_contentId];
        for (uint256 i = 0; i < contentCollaborators.length; i++) {
            if (contentCollaborators[i] == _collaborator) {
                contentCollaborators[i] = contentCollaborators[contentCollaborators.length - 1];
                contentCollaborators.pop();
                uint256 currentVersion = versionCount[_contentId] + 1;
                bytes32 actionHash = keccak256(
                abi.encodePacked("CollaboratorRemoved", _contentId, _collaborator, block.timestamp));
                versions[_contentId][currentVersion] = contents[_contentId];
                versionCount[_contentId] = currentVersion;
                _addAction(_contentId, ActionType.CollaboratorRemoved, "Collaborator removed", actionHash, currentVersion);
                emit CollaboratorRemoved(_contentId, _collaborator);
                return;
            }
        }
        revert("Collaborator not found");
    }

    function transferOwnership(bytes32 _contentId, address _newOwner) public {
        require(contents[_contentId].owner == msg.sender, "Only the owner can transfer ownership");
        require(_newOwner != address(0), "New owner cannot be zero address");
        contents[_contentId].owner = _newOwner;
        uint256 currentVersion = versionCount[_contentId] + 1;
        bytes32 actionHash = keccak256(
            abi.encodePacked("OwnershipTransferred", _contentId, msg.sender, _newOwner, block.timestamp));
        versions[_contentId][currentVersion] = contents[_contentId];
        versionCount[_contentId] = currentVersion;
        _addAction(_contentId, ActionType.OwnershipTransferred, "Ownership transferred", actionHash, currentVersion);
        emit OwnershipTransferred(msg.sender, _newOwner, _contentId);
    }

}
