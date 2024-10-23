import { useState, useEffect, useCallback } from "react";
import Web3 from "web3";

const useWallet = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to connect MetaMask
  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
      setLoading(true);

      try {
        // Request account access if needed
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]); // Set the first account
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError("Failed to connect wallet: " + err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please install MetaMask!");
    }
  }, []);

  // Disconnect the wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setWeb3(null);
  }, []);

  // Effect to auto-connect wallet if already authorized
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });
    }
  }, []);

  return {
    web3,
    account,
    isConnected,
    error,
    loading,
    connectWallet,
    disconnectWallet,
  };
};

export default useWallet;
