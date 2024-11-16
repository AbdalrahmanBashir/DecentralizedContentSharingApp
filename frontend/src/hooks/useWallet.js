// useWallet.js
import { useState, useEffect } from "react";

// Singleton state variables
let currentAccount = localStorage.getItem("walletAccount") || null;
let isConnectedState = localStorage.getItem("isWalletConnected") === "true";
let listenersInitialized = false;

const useWallet = () => {
  const [account, setAccount] = useState(currentAccount);
  const [isConnected, setIsConnected] = useState(isConnectedState);
  const [networkId, setNetworkId] = useState(null);

  useEffect(() => {
    if (window.ethereum && !listenersInitialized) {
      // Initialize listeners only once
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleNetworkChanged);
      listenersInitialized = true;
    }

    if (isConnected && !account) {
      reconnectWallet();
    }

    return () => {
      if (window.ethereum && listenersInitialized) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleNetworkChanged);
        listenersInitialized = false;
      }
    };
  }, [account, isConnected]);

  // Connect the wallet manually
  const connectWallet = async () => {
    try {
      await requestPermissions();
      const accounts = await requestAccounts();
      if (accounts.length > 0) {
        const connectedAccount = accounts[0];
        updateWalletState(connectedAccount);
        await updateNetworkId();
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      disconnectWallet();
    }
  };

  // Disconnect the wallet
  const disconnectWallet = () => {
    setAccount(null);
    currentAccount = null;
    setIsConnected(false);
    setNetworkId(null);
    localStorage.removeItem("walletAccount");
    localStorage.setItem("isWalletConnected", "false");
  };

  // Reconnect wallet on page reload or when the user clicks reconnect
  const reconnectWallet = async () => {
    try {
      const accounts = await requestAccounts();
      if (accounts.length > 0) {
        updateWalletState(accounts[0]);
        await updateNetworkId();
      } else {
        disconnectWallet();
      }
    } catch (error) {
      console.error("Failed to reconnect wallet:", error);
      disconnectWallet();
    }
  };

  // Handle changes in the connected accounts
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      const newAccount = accounts[0];
      if (newAccount !== currentAccount) {
        updateWalletState(newAccount);
      }
    }
  };

  // Handle changes in the network
  const handleNetworkChanged = async (chainId) => {
    const networkId = parseInt(chainId, 16);
    setNetworkId(networkId);
    console.log("Network changed to:", networkId);
  };

  // Update network ID state
  const updateNetworkId = async () => {
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setNetworkId(parseInt(chainId, 16));
    } catch (error) {
      console.error("Failed to get network ID:", error);
    }
  };

  // Request permissions for wallet connection
  const requestPermissions = async () => {
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
  };

  // Request accounts interactively
  const requestAccounts = async () => {
    return await window.ethereum.request({ method: "eth_requestAccounts" });
  };

  // Update wallet state
  const updateWalletState = (connectedAccount) => {
    setAccount(connectedAccount);
    currentAccount = connectedAccount;
    setIsConnected(true);
    localStorage.setItem("walletAccount", connectedAccount);
    localStorage.setItem("isWalletConnected", "true");
  };

  return {
    account,
    isConnected,
    networkId,
    connectWallet,
    disconnectWallet,
    reconnectWallet,
  };
};

// Function to get the current wallet account globally
export const getCurrentAccount = () => currentAccount;

export default useWallet;
