"use client";

import { useState, useEffect } from "react";
import styles from "./TransactionsList.module.scss"

export default function TransactionsList({ assetId, assetName, onClose, investments, onUpdatedInvestments }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "BUY",
    amount: "",
    price: "",
    date: new Date().toISOString().split("T")[0]
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (assetId) {
      fetchTransactions();
    }
  }, [assetId]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/transactions?assetId=${assetId}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Chyba pri načítaní transakcií");
      }
      const data = await response.json();
      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sortedData);
    } catch (error) {
      console.error("Chyba pri načítaní transakcií:", error);
      setError("Nepodarilo sa načítať transakcie");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = () => {
    setShowForm(true);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const newTransaction = {
      type: formData.type,
      price: formData.price,
      amount: formData.amount,
      date: formData.date,
      assetId: parseInt(assetId)
    };

    if (!newTransaction.price || !newTransaction.amount || Number(newTransaction.amount) <= 0 || Number(newTransaction.price) <= 0) {
      setError("Prosím, vyplňte všetky polia správnymi hodnotami");
      return;
    }

    if (formData.type === 'SELL') {
      const currentAsset = investments.find(inv => inv.id === assetId);
      if (currentAsset && Number(formData.amount) > Number(currentAsset.amount)) {
        setError("Nedostatok aktív na predaj");
        return;
      }
    }

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API chyba:", errorData);
        throw new Error("Problém pri pridávaní transakcie: " + (errorData.error || "Neznáma chyba"));
      }

      const data = await response.json();
      setTransactions(prev => [data, ...prev]);

      setFormData({
        type: "BUY",
        amount: "",
        price: "",
        date: new Date().toISOString().split("T")[0]
      });

      try {
        const assetsResponse = await fetch('/api/assets', { cache: "no-store" });
        if (!assetsResponse.ok) {
          throw new Error("Nepodarilo sa načítať aktualizované aktíva");
        }
        const updatedAssets = await assetsResponse.json();
        onUpdatedInvestments(updatedAssets);
      } catch (assetError) {
        console.error("Chyba pri aktualizácii aktív:", assetError);
        setError("Transakcia bola pridaná, ale nepodarilo sa aktualizovať zoznam aktív");
      }

      setShowForm(false);
    } catch (error) {
      console.error("Chyba pri pridávaní transakcie:", error);
      setError(error.message || "Nepodarilo sa pridať transakciu");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{showForm ? "Pridanie transakcie" : `Transakcie pre ${assetName}`}</h3>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {showForm ? (
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="type">Typ transakcie:</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="BUY">Nákup</option>
                <option value="SELL">Predaj</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="amount">Množstvo:</label>
              <input
                type="number"
                id="amount"
                name="amount"
                step="0.000001"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">Cena za jednotku (€):</label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="date">Dátum:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.saveButton}>Uložiť</button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowForm(false)}
              >
                Zrušiť
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className={styles.assetInfo}>
            <p><strong>ID aktíva:</strong> {assetId}</p>
            <p><strong>Meno:</strong> {assetName}</p>
          </div>

          <div className={styles.content}>
            {isLoading ? (
              <div className={styles.loading}>Načítavam transakcie...</div>
            ) : transactions.length === 0 ? (
              <div className={styles.empty}>
                <p>Žiadne transakcie pre toto aktívum</p>
              </div>
            ) : (
              <table className={styles.transactionTable}>
                <thead>
                  <tr>
                    <th>Dátum</th>
                    <th>Typ</th>
                    <th>Množstvo</th>
                    <th>Cena</th>
                    <th>Celková hodnota</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.date}</td>
                      <td className={transaction.type === 'BUY' ? styles.buyType : styles.sellType}>
                        {transaction.type === 'BUY' ? 'Nákup' : 'Predaj'}
                      </td>
                      <td>{Number(transaction.amount).toFixed(6)}</td>
                      <td>{Number(transaction.price).toFixed(2)} €</td>
                      <td>{(Number(transaction.amount) * Number(transaction.price)).toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className={styles.actions}>
              <button className={styles.addButton} onClick={handleAddTransaction}>
                Pridať transakciu
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
