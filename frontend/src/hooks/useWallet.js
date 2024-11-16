// useWallet.js
import { useState, useEffect } from "react";

// Singleton state variables
let currentAccount = localStorage.getItem("walletAccount") || null;
let isConnectedState = localStorage.getItem("isWalletConnected") === "true";
let listenersInitialized = false;

/**
 * useWallet.js
 * This hook provides a way to connect to a wallet provider and receive events
 * when the user's account or network changes.
 * It also provides a way to disconnect the wallet and reconnect to the wallet
 * on page reload.
 * The hook uses the `window.ethereum` object to interact with the wallet provider.
 * When the user connects the wallet, the hook requests the necessary permissions
 * and then requests the accounts interactively. The hook then stores the
 * connected account in state and also stores it in local storage so that it
 * can be retrieved on page reload.
 * When the user disconnects the wallet, the hook removes the connected account
 * from state and local storage.
 * The hook also listens for changes in the connected accounts and network.
 * When the user changes the connected accounts, the hook updates the state
 * accordingly. When the user changes the network, the hook updates the state
 * with the new network ID.
 * The hook returns an object with the following properties:
 * - `account`: The connected account.
 * - `isConnected`: A boolean indicating whether the wallet is connected.
 * - `networkId`: The ID of the current network.
 * - `connectWallet`: A function to connect the wallet manually.
 * - `disconnectWallet`: A function to disconnect the wallet.
 * - `reconnectWallet`: A function to reconnect the wallet on page reload.
 */
const useWallet = () => {
  // State variables
  const [account, setAccount] = useState(currentAccount);
  const [isConnected, setIsConnected] = useState(isConnectedState);
  const [networkId, setNetworkId] = useState(null);

  useEffect(() => {
    // Initialize listeners only once
    if (window.ethereum && !listenersInitialized) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleNetworkChanged);
      listenersInitialized = true;
    }

    // If the user is connected but there is no account, reconnect the wallet
    if (isConnected && !account) {
      reconnectWallet();
    }

    // Clean up function to remove listeners when the component is unmounted
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

  /**
   * Connect the wallet manually
   * Requests the necessary permissions and then requests the accounts
   * interactively. If the user grants permission and selects an account,
   * the hook updates the state with the connected account.
   * If the user denies permission or doesn't select an account, the hook
   * disconnects the wallet.
   */
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

  /**
   * Disconnect the wallet
   * Removes the connected account from state and local storage.
   * Sets the `isConnected` state variable to false.
   * Sets the `networkId` state variable to null.
   */
  const disconnectWallet = () => {
    setAccount(null);
    currentAccount = null;
    setIsConnected(false);
    setNetworkId(null);
    localStorage.removeItem("walletAccount");
    localStorage.setItem("isWalletConnected", "false");
  };

  /**
   * Reconnect the wallet on page reload
   * If the user is connected, the hook requests the accounts interactively
   * and updates the state with the connected account.
   * If the user is not connected, the hook does nothing.
   */
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

  /**
   * Handle changes in the connected accounts
   * If the user changes the connected accounts, the hook updates the state
   * accordingly.
   * If the user disconnects the wallet, the hook removes the connected account
   * from state and local storage.
   */
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

  /**
   * Handle changes in the network
   * If the user changes the network, the hook updates the state with the new
   * network ID.
   */
  const handleNetworkChanged = async (chainId) => {
    const networkId = parseInt(chainId, 16);
    setNetworkId(networkId);
    console.log("Network changed to:", networkId);
  };

  /**
   * Update network ID state
   * Requests the current network ID and updates the state with it.
   * If the request fails, the hook logs an error message.
   */
  const updateNetworkId = async () => {
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setNetworkId(parseInt(chainId, 16));
    } catch (error) {
      console.error("Failed to get network ID:", error);
    }
  };

  /**
   * Request permissions for wallet connection
   * Requests the necessary permissions to connect to the wallet provider.
   * The hook doesn't do anything if the user denies permission.
   */
  const requestPermissions = async () => {
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }],
    });
  };

  /**
   * Request accounts interactively
   * Requests the accounts interactively. If the user grants permission and
   * selects an account, the hook returns an array with the selected account.
   * If the user denies permission or doesn't select an account, the hook
   * returns an empty array.
   */
  const requestAccounts = async () => {
    return await window.ethereum.request({ method: "eth_requestAccounts" });
  };

  /**
   * Update wallet state
   * Updates the state with the connected account and also stores it in
   * local storage.
   * Sets the `isConnected` state variable to true.
   * Sets the `networkId` state variable to null.
   */
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
