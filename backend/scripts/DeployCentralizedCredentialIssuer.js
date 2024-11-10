const { ethers } = require("hardhat");

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Define existing library addresses if they are already deployed
  const existingAddresses = {
    ClaimBuilder: "0xB27AAcD85BA6ce6f3C577D01b29Fab7fEcC22B48",
    PoseidonUnit2L: "0x863200da5B9cbdF5358f82427780D9E70fdc11C0",
    PoseidonUnit3L: "0x7eA6d375e4bd9991Bb891f059b85DDe92D9226e5",
    PoseidonUnit4L: "0x95F51fE3470A94483eb9DEd66F3AD546A9BF6f2d",
    SmtLib: "0xF69Ea3512d1581276316Db851DFC9a15FdF23683",
    IdentityLib: "0x420Cc8B8bDF635C87537aC8c69E9D8975b5eae99",
  };

  // Use the existing libraries without redeploying
  const claimBuilderAddress = existingAddresses.ClaimBuilder;
  const poseidonUnit2LAddress = existingAddresses.PoseidonUnit2L;
  const poseidonUnit3LAddress = existingAddresses.PoseidonUnit3L;
  const poseidonUnit4LAddress = existingAddresses.PoseidonUnit4L;
  const smtLibAddress = existingAddresses.SmtLib;
  const identityLibAddress = existingAddresses.IdentityLib;

  // Log the use of existing libraries
  console.log("Using existing ClaimBuilder library at:", claimBuilderAddress);
  console.log(
    "Using existing PoseidonUnit2L library at:",
    poseidonUnit2LAddress
  );
  console.log(
    "Using existing PoseidonUnit3L library at:",
    poseidonUnit3LAddress
  );
  console.log(
    "Using existing PoseidonUnit4L library at:",
    poseidonUnit4LAddress
  );
  console.log("Using existing SmtLib library at:", smtLibAddress);
  console.log("Using existing IdentityLib library at:", identityLibAddress);

  // Step 1: Deploy CentralizedCredentialIssuer contract with linked ClaimBuilder and IdentityLib libraries
  const CentralizedCredentialIssuer = await ethers.getContractFactory(
    "CentralizedCredentialIssuer",
    {
      libraries: {
        ClaimBuilder: claimBuilderAddress,
        IdentityLib: identityLibAddress,
      },
    }
  );

  console.log("Deploying the CentralizedCredentialIssuer contract...");
  const stateAddress = "0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124"; // Replace with actual state contract address

  // Deploy the contract as a standard contract
  const centralizedCredentialIssuer =
    await CentralizedCredentialIssuer.deploy();

  // Wait for the contract to be deployed
  await centralizedCredentialIssuer.waitForDeployment();

  await centralizedCredentialIssuer.initialize(stateAddress);

  // Retrieve and log the contract address
  const contractAddress = centralizedCredentialIssuer.getAddress();
  console.log(
    "The CentralizedCredentialIssuer contract deployed to:",
    contractAddress
  );

  // Output deployed addresses for verification
  console.log({
    ClaimBuilder: claimBuilderAddress,
    PoseidonUnit2L: poseidonUnit2LAddress,
    PoseidonUnit3L: poseidonUnit3LAddress,
    PoseidonUnit4L: poseidonUnit4LAddress,
    SmtLib: smtLibAddress,
    IdentityLib: identityLibAddress,
    CentralizedCredentialIssuer: contractAddress,
    //0x26df89F1E200F016c58983939ABd86BdF9d87d45: "0x26df89F1E200F016c58983939ABd86BdF9d87d45",
  });
}

// Run the deployment script
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
