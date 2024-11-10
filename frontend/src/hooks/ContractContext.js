import React, { createContext, useContext, useState, useEffect } from "react";
import { createContractService } from "../services/contractService";
import { connectMetaMask } from "./../services/metamaskService";

const ContractContext = createContext(null);

export const useContract = () => useContext(ContractContext);

export const ContractProvider = ({ children }) => {
  const [contractService, setContractService] = useState(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        const provider = await connectMetaMask();
        const service = createContractService(provider);
        setContractService(service);
      } catch (error) {
        console.error("Failed to initialize contract:", error);
      }
    };

    initContract();
  }, []);

  return (
    <ContractContext.Provider value={contractService}>
      {children}
    </ContractContext.Provider>
  );
};
