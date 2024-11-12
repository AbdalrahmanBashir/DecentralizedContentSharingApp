// src/services/authService.js

const BASE_URL = "http://192.168.12.138:8009/api";

export const fetchAuthRequest = async () => {
  try {
    const response = await fetch(`${BASE_URL}/sign-in`);
    if (!response.ok) throw new Error("Failed to fetch auth request");
    return await response.json();
  } catch (error) {
    console.error("Error in fetchAuthRequest:", error);
    throw error;
  }
};

export const verifyUser = async (sessionId, tokenStr) => {
  try {
    const response = await fetch(
      `${BASE_URL}/callback?sessionId=${sessionId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: tokenStr,
      }
    );
    if (!response.ok) throw new Error("Verification failed");
    return await response.json();
  } catch (error) {
    console.error("Error in verifyUser:", error);
    throw error;
  }
};
