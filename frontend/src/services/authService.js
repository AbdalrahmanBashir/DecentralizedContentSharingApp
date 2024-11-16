const BASE_URL = `${window.location.protocol}//${window.location.hostname}:8009/api`;

export const fetchAuthRequest = async () => {
  try {
    // Send a GET request to the sign-in endpoint of the API
    const response = await fetch(`${BASE_URL}/sign-in`);

    // Check if the response status is not OK (i.e., outside the range of 200-299)
    if (!response.ok)
      // If not OK, throw an error indicating failure to fetch the auth request
      throw new Error("Failed to fetch auth request");

    // Parse the response body as JSON and return the resulting object
    return await response.json();
  } catch (error) {
    // Log any errors that occur during the request to the console
    console.error("Error in fetchAuthRequest:", error);

    // Re-throw the error to propagate it to the caller
    throw error;
  }
};

/**
 * Verifies a user session by sending a token string to the server's callback endpoint.
 *
 * @param {string} sessionId - The unique identifier for the user session.
 * @param {string} tokenStr - The token string to be used for verification.
 * @returns {Promise<object>} - A promise that resolves to the JSON response from the server.
 * @throws {Error} - Throws an error if the verification process fails.
 */
export const verifyUser = async (sessionId, tokenStr) => {
  try {
    // Send a POST request to the callback endpoint with the session ID and token string
    const response = await fetch(
      `${BASE_URL}/callback?sessionId=${sessionId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: tokenStr,
      }
    );

    // Check if the response status is not OK (i.e., outside the range of 200-299)
    if (!response.ok) throw new Error("Verification failed");

    // Parse the response body as JSON and return the resulting object
    return await response.json();
  } catch (error) {
    // Log any errors that occur during the request to the console
    console.error("Error in verifyUser:", error);

    // Re-throw the error to propagate it to the caller
    throw error;
  }
};
