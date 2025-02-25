import { useState } from "react";
import styles from "./InvestmentTable.module.scss";

export default function InvestmentTable({ investments, currency, onAssetDelete }) {
  const [isModalOpen, srtIsModalOpen] = useState(false);
  const [slectedAsset, setSelectedAsset] = useState(null);

  if (investments.length === 0) {
    return <p>Načítavam dáta...</p>;
  }

  const deleteAsset = async (id) => {
    try {
      const response = await fetch("/api/assets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      })
      if (!response.ok) {
        throw new Error("error request")
      }

      const data = await response.json()
      onAssetDelete(data)

    } catch (error) {
      console.log(error)
    }
  }



  return (
    <div className={styles.div}>
      <h2>My Assets</h2>
      {
        <table >
          <thead>
            <tr>
              <th >ASSET NAME</th>
              <th>QUANTITY</th>
              <th>VALUE IN EUR</th>
              <th>VALUE CZK</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.name}</td>
                <td>{inv.amount}</td>
                <td>{(inv.unitPrice * inv.amount).toFixed(2)} </td>
                <td>{((inv.unitPrice * inv.amount) * (currency || 1)).toLocaleString("cs-CZ")}</td>
                <td>
                  <button onClick={() => deleteAsset(inv.id)}>X</button>
                </td>
                <td><button onClick={() => openEditModal(asset)}>⚙</button></td>
              </tr>
            ))}
          </tbody>
        </table>


      }
    </div>
  );
}