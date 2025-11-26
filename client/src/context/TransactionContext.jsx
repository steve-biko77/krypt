import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

// Fonction magique 2025 pour détecter le vrai wallet (Metamask, Rainbow, etc.)
const getEthereumObject = () => {
  const { ethereum } = window;

  if (!ethereum) return null;

  // Nouveau comportement 2025 : plusieurs providers possibles
  if (ethereum.providers) {
    // Priorité : Metamask → puis Coinbase → puis les autres
    return (
      ethereum.providers.find(p => p.isMetaMask) ||
      ethereum.providers.find(p => p.isCoinbaseWallet) ||
      ethereum.providers[0]
    );
  }

  return ethereum; // Ancien comportement (rare en 2025)
};

export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount") || "0");
  const [transactions, setTransactions] = useState([]);

  const ethereum = getEthereumObject(); // ← On utilise cette fonction partout

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return;
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

      const availableTransactions = await transactionsContract.getAllTransactions();

      const structuredTransactions = availableTransactions.map((tx) => ({
        addressTo: tx.receiver,
        addressFrom: tx.sender,
        timestamp: new Date(Number(tx.timestamp) * 1000).toLocaleString(),
        message: tx.message,
        keyword: tx.keyword,
        amount: parseInt(tx.amount) / (10 ** 18)
      }));

      setTransactions(structuredTransactions.reverse());
    } catch (error) {
      console.error("Erreur getAllTransactions :", error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert("Installe un wallet (Metamask, Rainbow, etc.)");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        getAllTransactions();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Installe un wallet !");

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      getAllTransactions();
    } catch (error) {
      console.error(error);
      alert("Connexion refusée ou erreur");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Wallet non détecté");

      const { addressTo, amount, keyword, message } = formData;
      if (!addressTo || !amount || !keyword || !message) {
        return alert("Remplis tous les champs");
      }

      const parsedAmount = ethers.parseEther(amount);

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

      setIsLoading(true);

      // VERSION CORRIGÉE : 4 arguments + value dans les options
      const tx = await transactionsContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword,
        { 
          value: parsedAmount,
          gasLimit: 300000  // on met un gas limit généreux pour éviter les erreurs d’estimation
        }
      );

      console.log("Transaction envoyée, hash :", tx.hash);
      await tx.wait();
      console.log("Transaction confirmée !");

      setIsLoading(false);
      alert("Transaction réussie !");
      setformData({ addressTo: "", amount: "", keyword: "", message: "" });
      getAllTransactions();

    } catch (error) {
      console.error("Erreur complète :", error);
      setIsLoading(false);
      alert("Transaction échouée. Vérifie le montant et le gas.");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (currentAccount) {
      getAllTransactions();
    }
  }, [currentAccount]);

  return (
    <TransactionContext.Provider value={{
      connectWallet,
      currentAccount,
      formData,
      handleChange,
      sendTransaction,
      transactions,
      isLoading,
      transactionCount,
    }}>
      {children}
    </TransactionContext.Provider>
  );
};