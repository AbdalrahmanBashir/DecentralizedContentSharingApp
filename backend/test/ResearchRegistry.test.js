const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ResearchRegistry Contract", function () {
  let ResearchRegistry;
  let researchRegistry;
  let owner, addr1, addr2, addr3;
  let contentId;
  const title = "Test Content";
  const ipfsHash = "QmTestHash";
  const category = "Test Category";

  // Deploy the contract before running the tests
  before(async () => {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    ResearchRegistry = await ethers.getContractFactory("ResearchRegistry");
    researchRegistry = await ResearchRegistry.deploy();
  });

  it("Should register new content successfully", async function () {
    const tx = await researchRegistry.registerContent(
      title,
      ipfsHash,
      category
    );
    const receipt = await tx.wait();

    // Extract the contentId from the event
    const event = receipt.events.find(
      (event) => event.event === "ContentRegistered"
    );
    contentId = event.args.contentId;

    expect(contentId).to.be.a("bytes32");
    expect(event.args.owner).to.equal(owner.address);

    const content = await researchRegistry.getLatestContent(contentId);
    expect(content.title).to.equal(title);
    expect(content.ipfsHash).to.equal(ipfsHash);
    expect(content.category).to.equal(category);
    expect(content.owner).to.equal(owner.address);
  });

  it("Should prevent duplicate IPFS hash registration", async function () {
    await expect(
      researchRegistry.registerContent(title, ipfsHash, category)
    ).to.be.revertedWith("IPFS hash already registered");
  });

  it("Should allow the owner to update content details", async function () {
    const newTitle = "Updated Title";
    const newCategory = "Updated Category";

    await researchRegistry.updateContentDetails(
      contentId,
      newTitle,
      newCategory
    );

    const updatedContent = await researchRegistry.getLatestContent(contentId);
    expect(updatedContent.title).to.equal(newTitle);
    expect(updatedContent.category).to.equal(newCategory);
  });

  it("Should prevent non-owner from updating content details", async function () {
    await expect(
      researchRegistry
        .connect(addr1)
        .updateContentDetails(contentId, "Title", "Category")
    ).to.be.revertedWith("Not the content owner");
  });

  it("Should add and remove collaborators", async function () {
    await researchRegistry.addCollaborator(contentId, addr1.address);

    const collaborators = await researchRegistry.getCollaborators(contentId);
    expect(collaborators).to.include(addr1.address);

    await researchRegistry.removeCollaborator(contentId, addr1.address);

    const updatedCollaborators = await researchRegistry.getCollaborators(
      contentId
    );
    expect(updatedCollaborators).to.not.include(addr1.address);
  });

  it("Should prevent collaborators from voting to flag the content", async function () {
    await researchRegistry.addCollaborator(contentId, addr1.address);

    await expect(
      researchRegistry.connect(addr1).voteToFlagContent(contentId)
    ).to.be.revertedWith("Collaborators cannot vote");
  });

  it("Should prevent the owner from voting to flag the content", async function () {
    await expect(
      researchRegistry.connect(owner).voteToFlagContent(contentId)
    ).to.be.revertedWith("Owner cannot vote");
  });

  it("Should allow independent voters to flag content", async function () {
    await researchRegistry.connect(addr2).voteToFlagContent(contentId);
    await researchRegistry.connect(addr3).voteToFlagContent(contentId);

    const flaggedContent = await researchRegistry.getLatestContent(contentId);
    expect(flaggedContent.flagged).to.be.true;
  });

  it("Should allow independent voters to restore flagged content", async function () {
    await researchRegistry.connect(addr2).voteToRestoreContent(contentId);
    await researchRegistry.connect(addr3).voteToRestoreContent(contentId);

    const restoredContent = await researchRegistry.getLatestContent(contentId);
    expect(restoredContent.flagged).to.be.false;
  });

  it("Should prevent unauthorized users from adding collaborators", async function () {
    await expect(
      researchRegistry.connect(addr1).addCollaborator(contentId, addr2.address)
    ).to.be.revertedWith("Only the owner can add collaborators");
  });

  it("Should transfer ownership successfully", async function () {
    await researchRegistry.transferOwnership(contentId, addr1.address);

    const newOwnerContent = await researchRegistry.getLatestContent(contentId);
    expect(newOwnerContent.owner).to.equal(addr1.address);
  });

  it("Should prevent non-owners from transferring ownership", async function () {
    await expect(
      researchRegistry
        .connect(addr2)
        .transferOwnership(contentId, addr3.address)
    ).to.be.revertedWith("Only the owner can transfer ownership");
  });
});
