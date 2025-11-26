import React, { useContext } from "react";
import { TransactionContext } from "../context/TransactionContext";
import { shortenAddress } from "../utils/shortenAddress";

const TransactionsCard = ({ addressTo, addressFrom, timestamp, message, keyword, amount }) => {
  // On utilise le keyword pour chercher un GIF (comme dans la vidéo, mais en vrai)
  const gifUrl = `https://media.giphy.com/media/${keyword ? keyword : "3o7abldj0b3rxr2xde"}/giphy.gif`;

  return (
    <div className="bg-[#181918] m-4 flex flex-1
      2xl:min-w-[450px] 2xl:max-w-[500px]
      sm:min-w-[270px] sm:max-w-[300px] min-w-full
      flex-col p-3 rounded-md hover:shadow-2xl transition-all">
      
      <div className="flex flex-col items-center w-full mt-3">
        <div className="w-full mb-6 p-2 text-left">
          <a href={`https://sepolia.etherscan.io/address/${addressFrom}`} target="_blank" rel="noreferrer">
            <p className="text-white text-base">From: {shortenAddress(addressFrom)}</p>
          </a>
          <a href={`https://sepolia.etherscan.io/address/${addressTo}`} target="_blank" rel="noreferrer">
            <p className="text-white text-base">To: {shortenAddress(addressTo)}</p>
          </a>
          <p className="text-white text-base font-bold">{amount} ETH</p>
          {message && (
            <>
              <br />
              <p className="text-white text-base italic">"{message}"</p>
            </>
          )}
        </div>

        <img
          src={gifUrl}
          alt="gif"
          className="w-full h-64 2xl:h-96 rounded-md shadow-lg object-cover"
          onError={(e) => {
            e.target.src = "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif"; // GIF par défaut
          }}
        />

        <div className="bg-black p-3 px-5 w-max rounded-3xl -mt-5 shadow-2xl">
          <p className="text-[#37c7da] font-bold">{timestamp}</p>
        </div>
      </div>
    </div>
  );
};

const Transactions = () => {
  const { transactions, currentAccount } = useContext(TransactionContext);

  return (
    <div className="flex w-full justify-center items-center 2xl:px-20 gradient-bg-transactions py-20">
      <div className="flex flex-col md:p-12 py-12 px-4">
        {currentAccount ? (
          <h3 className="text-white text-3xl text-center my-2">
            Dernières transactions ({transactions.length})
          </h3>
        ) : (
          <h3 className="text-white text-3xl text-center my-2">
            Connecte ton wallet pour voir les vraies transactions
          </h3>
        )}

        <div className="flex flex-wrap justify-center items-center mt-10 gap-6">
          {transactions.length > 0 ? (
            transactions.map((transaction, i) => (
              <TransactionsCard key={i} {...transaction} />
            ))
          ) : currentAccount ? (
            <p className="text-white text-xl text-center">Aucune transaction pour l'instant... Envoie la première !</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Transactions;