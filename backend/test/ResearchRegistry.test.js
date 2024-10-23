const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ResearchRegistry", function () {
  let ResearchRegistry, researchRegistry;
  let owner, addr1, addr2;

  // Deploy contract before each test
  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    ResearchRegistry = await ethers.getContractFactory("ResearchRegistry");
    researchRegistry = await ResearchRegistry.deploy();
    await researchRegistry.deployed();
  });

  // Test content registration
  it("Should register new content successfully", async function () {
    const title = "Blockchain for Research";
    const ipfsHash = "QmXYZ1234567890abcdef";
    const tx = await researchRegistry.registerContent(title, ipfsHash);
    await tx.wait();

    const contentId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["string", "string", "address", "uint256"],
        [
          title,
          ipfsHash,
          owner.address,
          (await ethers.provider.getBlock()).timestamp,
        ]
      )
    );

    const content = await researchRegistry.contents(contentId);

    // Validate content registration
    expect(content.title).to.equal(title);
    expect(content.ipfsHash).to.equal(ipfsHash);
    expect(content.owner).to.equal(owner.address);
    expect(content.timestamp).to.be.gt(0);
  });

  // Test ownership verification
  it("Should verify the ownership of registered content", async function () {
    const title = "Blockchain for Research";
    const ipfsHash = "QmXYZ1234567890abcdef";

    // Register content
    const tx = await researchRegistry.registerContent(title, ipfsHash);
    await tx.wait();

    const contentId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["string", "string", "address", "uint256"],
        [
          title,
          ipfsHash,
          owner.address,
          (await ethers.provider.getBlock()).timestamp,
        ]
      )
    );

    const content = await researchRegistry.contents(contentId);

    // Verify the content owner
    expect(content.owner).to.equal(owner.address);
  });

  // Test ownership transfer
  it("Should transfer content ownership", async function () {
    const title = "Blockchain for Research";
    const ipfsHash = "QmXYZ1234567890abcdef";

    // Register content
    const tx = await researchRegistry.registerContent(title, ipfsHash);
    await tx.wait();

    const contentId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["string", "string", "address", "uint256"],
        [
          title,
          ipfsHash,
          owner.address,
          (await ethers.provider.getBlock()).timestamp,
        ]
      )
    );

    // Transfer ownership to addr1
    await researchRegistry.transferOwnership(contentId, addr1.address);

    const content = await researchRegistry.contents(contentId);

    // Verify ownership transfer
    expect(content.owner).to.equal(addr1.address);
  });

  // Test that only the owner can transfer ownership
  it("Should only allow the owner to transfer ownership", async function () {
    const title = "Blockchain for Research";
    const ipfsHash = "QmXYZ1234567890abcdef";

    // Register content
    const tx = await researchRegistry.registerContent(title, ipfsHash);
    await tx.wait();

    const contentId = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["string", "string", "address", "uint256"],
        [
          title,
          ipfsHash,
          owner.address,
          (await ethers.provider.getBlock()).timestamp,
        ]
      )
    );

    // Try to transfer ownership with a non-owner account
    await expect(
      researchRegistry
        .connect(addr1)
        .transferOwnership(contentId, addr2.address)
    ).to.be.revertedWith("Only the owner can transfer ownership");
  });

  // Test duplicate content prevention
  it("Should not allow duplicate content registration", async function () {
    const title = "Blockchain for Research";
    const ipfsHash = "QmXYZ1234567890abcdef";

    // Register content
    await researchRegistry.registerContent(title, ipfsHash);

    // Try registering the same content again
    await expect(
      researchRegistry.registerContent(title, ipfsHash)
    ).to.be.revertedWith("Content already registered");
  });
});
