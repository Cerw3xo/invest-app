import styles from "./InvestmentTable.module.scss";
import { useState } from "react";
import TransactionsList from "../TransactionsList/TransactionsList";

export default function InvestmentTable({ investments, currency, onAssetDelete, onUpdatedInvestments }) {
  const [showTransactions, setShowTransactions] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [error, setError] = useState(null);

  const handleShowTransactions = (asset) => {
    setSelectedAsset(asset);
    setShowTransactions(true);
    setError(null);
  };

  if (investments.length === 0) {
    return <p>Načítavam dáta...</p>;
  }

  const deleteAsset = async (id) => {
    setError(null);
    try {
      const response = await fetch("/api/assets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error("Chyba pri vymazávaní aktíva");
      }

      const data = await response.json();
      onAssetDelete(data);
    } catch (error) {
      console.error("Chyba pri vymazávaní aktíva:", error);
      setError("Nepodarilo sa vymazať aktívum");
    }
  };

  return (
    <div className={styles.div}>
      <h2>My Assets</h2>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th>ASSET NAME</th>
            <th>QUANTITY</th>
            <th>VALUE IN EUR</th>
            <th>VALUE CZK</th>
            <th>PRICE</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {investments.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.name}</td>
              <td>{inv.amount}</td>
              <td>{(inv.unitPrice * inv.amount).toFixed(2)} €</td>
              <td>{((inv.unitPrice * inv.amount) * (currency || 1)).toLocaleString("cs-CZ")} Kč</td>
              <td>{inv.unitPrice} €</td>
              <td>
                <button
                  onClick={() => deleteAsset(inv.id)}
                  className={styles.deleteButton}
                  title="Vymazať aktívum"
                >
                  X
                </button>
                <button
                  onClick={() => handleShowTransactions(inv)}
                  className={styles.transactionButton}
                  title="Zobraziť transakcie"
                >
                  T
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showTransactions && selectedAsset && (
        <div className={styles.modalOverlay} onClick={() => setShowTransactions(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <TransactionsList
              investments={investments}
              assetId={selectedAsset.id}
              assetName={selectedAsset.name}
              onClose={() => setShowTransactions(false)}
              onUpdatedInvestments={onUpdatedInvestments}
            />
          </div>
        </div>
      )}
    </div>
  );
}