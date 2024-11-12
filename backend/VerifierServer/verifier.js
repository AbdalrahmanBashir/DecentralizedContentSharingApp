const express = require("express");
const path = require("path");
const { auth, resolver } = require("@iden3/js-iden3-auth");
const getRawBody = require("raw-body");
const cors = require("cors");
const http = require("http");
const crypto = require("crypto");

const app = express();
const port = 8009;
const server = http.createServer(app);

app.use(cors({ origin: "*" }));

// In-memory map to store auth requests
const requestMap = new Map();

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// API route for authentication request
app.get("/api/sign-in", (req, res) => {
  console.log("Received Auth Request");
  GetAuthRequest(req, res);
});

// API route for verification callback
app.post("/api/callback", (req, res) => {
  console.log("Received Callback");
  callback(req, res);
});

// SSE endpoint for verification status updates
app.get("/api/verify-status", (req, res) => {
  const sessionId = req.query.sessionId;

  if (!sessionId) {
    console.error("Missing sessionId in SSE request");
    return res.status(400).json({ error: "Missing sessionId" });
  }

  console.log(`Starting SSE for session ID: ${sessionId}`);

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Function to send an SSE message
  const sendMessage = (message) => {
    res.write(`data: ${JSON.stringify(message)}\n\n`);
  };

  // Periodically check the session status and send updates
  const intervalId = setInterval(() => {
    const authRequest = requestMap.get(sessionId);

    if (authRequest?.status === "DONE") {
      sendMessage({ status: "DONE", data: authRequest });
      clearInterval(intervalId);
      res.end();
    } else if (authRequest?.status === "ERROR") {
      sendMessage({ status: "ERROR", error: authRequest.error });
      clearInterval(intervalId);
      res.end();
    }
  }, 1000);

  // Clean up when the client disconnects
  req.on("close", () => {
    console.log(`SSE connection closed for session ID: ${sessionId}`);
    clearInterval(intervalId);
  });
});

// Function to create and return an auth request
async function GetAuthRequest(req, res) {
  const hostUrl = `http://192.168.12.138:${port}`;
  const sessionId = crypto.randomUUID();
  const callbackURL = "/api/callback";
  const audience =
    "did:polygonid:polygon:amoy:2qQ68JkRcf3xrHPQPWZei3YeVzHPP58wYNxx2mEouR";
  const uri = `${hostUrl}${callbackURL}?sessionId=${sessionId}`;

  // Create the auth request
  const request = auth.createAuthorizationRequest("test flow", audience, uri);

  // Set unique request ID and thread ID
  request.id = sessionId;
  request.thid = sessionId;

  // Define proof request for age verification
  const proofRequest = {
    id: 1,
    circuitId: "credentialAtomicQuerySigV2",
    query: {
      allowedIssuers: ["*"],
      type: "KYCAgeCredential",
      context: "ipfs://QmbxZWEDsAxhyz7vWHcoqtfnmppJz34qroUpaFXUMeiBHQ",
      birthday: { $lt: 20050101 },
    },
  };
  request.body.scope = [...(request.body.scope ?? []), proofRequest];

  // Store the request in the map
  requestMap.set(sessionId, request);

  console.log(`Auth request created for session ID: ${sessionId}`);

  // Send the request to the frontend
  return res.status(200).json({ request, sessionId });
}

// Function to handle the verification callback
async function callback(req, res) {
  const sessionId = req.query.sessionId;

  if (!sessionId) {
    console.error("Missing sessionId in callback request");
    return res.status(400).json({ error: "Missing sessionId" });
  }

  // Retrieve the auth request from the map
  const authRequest = requestMap.get(sessionId);

  if (!authRequest) {
    console.error(`No auth request found for session ID: ${sessionId}`);
    return res.status(404).json({ error: "Auth request not found" });
  }

  // Get the raw JWT token from the POST request
  const raw = await getRawBody(req);
  const tokenStr = raw.toString().trim();
  console.log("Received Token:", tokenStr);

  // Define resolvers for state validation
  const resolvers = {
    "polygon:amoy": new resolver.EthStateResolver(
      "https://rpc-amoy.polygon.technology/",
      "0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124"
    ),
    "privado:main": new resolver.EthStateResolver(
      "https://rpc-mainnet.privado.id",
      "0x3C9acB2205Aa72A05F6D77d708b5Cf85FCa3a896"
    ),
  };

  const keyDIR = "./keys";

  try {
    // Initialize the verifier
    const verifier = await auth.Verifier.newVerifier({
      stateResolver: resolvers,
      circuitsDir: path.join(__dirname, keyDIR),
      ipfsGatewayURL: "https://ipfs.io",
    });

    const opts = { AcceptedStateTransitionDelay: 5 * 60 * 1000 };
    const authResponse = await verifier.fullVerify(tokenStr, authRequest, opts);
    console.log("Verification Successful for session ID:", sessionId);

    // Update the request status
    authRequest.status = "DONE";
    authRequest.data = authResponse;
    requestMap.set(sessionId, authRequest);

    return res.status(200).json(authResponse);
  } catch (error) {
    console.error("Verification Error:", error.message);

    // Update the request status with error
    authRequest.status = "ERROR";
    authRequest.error = error.message;
    requestMap.set(sessionId, authRequest);

    return res.status(500).json({ error: error.message });
  }
}
