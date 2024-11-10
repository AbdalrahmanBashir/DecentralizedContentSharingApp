const express = require("express");
const path = require("path");
const { auth, resolver, protocol } = require("@iden3/js-iden3-auth");
const getRawBody = require("raw-body");

const app = express();
const port = 8009;

app.use(express.static("./static"));

app.get("/api/sign-in", (req, res) => {
  console.log("get Auth Request");
  GetAuthRequest(req, res);
});

app.post("/api/callback", (req, res) => {
  console.log("callback");
  callback(req, res);
});

app.listen(port, () => {
  console.log(`Server running on http://192.168.12.138:${port}`);
});

// Create a map to store auth requests and their session IDs
const requestMap = new Map();

/**
 * Generate the authentication request for users
 */

async function GetAuthRequest(req, res) {
  // Audience is verifier ID
  const hostUrl = "http://192.168.12.138:8009";
  const sessionId = 1;
  const callbackURL = "/api/callback";
  const audience =
    "did:polygonid:polygon:amoy:2qQ68JkRcf3xrHPQPWZei3YeVzHPP58wYNxx2mEouR";
  const uri = `${hostUrl}${callbackURL}?sessionId=${sessionId}`;

  // Create the basic authentication request
  const request = auth.createAuthorizationRequest("test flow", audience, uri);

  // Ensure the `body` and `scope` are properly initialized
  if (!request.body) {
    request.body = {};
  }

  // Define the proof request for `authV2`
  const proofRequest = {
    id: 1,
    circuitId: "credentialAtomicQuerySigV2",
    query: {
      allowedIssuers: ["*"],
      type: "KYCAgeCredential",
      context: "ipfs://QmbxZWEDsAxhyz7vWHcoqtfnmppJz34qroUpaFXUMeiBHQ",
      //context:
      //"https://ipfs.io/ipfs/QmbxZWEDsAxhyz7vWHcoqtfnmppJz34qroUpaFXUMeiBHQ",
      //claim: {
      // Use `birthday` as a direct attribute for authentication flow
      birthday: {
        $lt: 20050101,
      },
      //},
    },
  };

  // Initialize and add the `scope` array if not already present
  request.body.scope = request.body.scope || [];
  request.body.scope.push(proofRequest);

  console.log("Auth Request with Scope:", JSON.stringify(request, null, 2));

  // Store the request in the map using the session ID
  requestMap.set(`${sessionId}`, request);

  // Send the request back to the client
  return res.status(200).set("Content-Type", "application/json").send(request);
}

/**
 * Handle the callback from the authentication request
 */

async function callback(req, res) {
  const sessionId = req.query.sessionId;

  try {
    // Get the raw JWT token from the request body
    const raw = await getRawBody(req);
    const tokenStr = raw.toString().trim();
    console.log("Received JWT Token:", tokenStr);

    const keyDIR = "./Keys";

    const resolvers = {
      ["polygon:amoy"]: new resolver.EthStateResolver(
        "https://rpc-amoy.polygon.technology/",
        "0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124"
      ),
      ["privado:main"]: new resolver.EthStateResolver(
        "https://rpc-mainnet.privado.id",
        "0x3C9acB2205Aa72A05F6D77d708b5Cf85FCa3a896"
      ),
    };

    // Fetch the original auth request using the session ID
    const authRequest = requestMap.get(`${sessionId}`);

    if (!authRequest) {
      console.error("No auth request found for session ID:", sessionId);
      return res
        .status(400)
        .send({ error: "No auth request found for session" });
    }

    console.log(
      "Auth Request Retrieved:",
      JSON.stringify(authRequest, null, 2)
    );

    // Initialize the verifier with state resolvers and configuration
    const verifier = await auth.Verifier.newVerifier({
      stateResolver: resolvers,
      //circuitsDir: path.join(__dirname, "./circuits-dir"),
      circuitsDir: path.join(__dirname, keyDIR),
      ipfsGatewayURL: "https://ipfs.io",
    });

    // Verification options
    const opts = {
      AcceptedStateTransitionDelay: 5 * 60 * 1000, // 5 minutes delay
    };

    // Perform the full verification process
    const authResponse = await verifier.fullVerify(tokenStr, authRequest, opts);

    console.log(
      "Verification Successful:",
      JSON.stringify(authResponse, null, 2)
    );
    return res
      .status(200)
      .set("Content-Type", "application/json")
      .send(authResponse);
  } catch (error) {
    console.error("Verification Error:", error.message);
    return res
      .status(500)
      .send({ error: "Verification failed", details: error.message });
  }
}
