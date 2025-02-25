import { useState } from "react";
import styles from "./AddAsset.module.scss"

export default function AddAsset({ onAssetAdded }) {
    const [assetName, setAssetName] = useState("");
    const [assetAmount, setAssetAmount] = useState(0);
    const [assetPrice, setAssetPrice] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newAsset = {
            name: assetName,
            amount: assetAmount,
            unitPrice: assetPrice
        }

        try {
            const response = await fetch('/api/assets', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newAsset)
            });

            if (!response.ok) {
                throw new Error("Chyba pri nacitani dat");
            }

            const data = await response.json()
            console.log(data)
            onAssetAdded(data)

            setAssetName("");
            setAssetAmount(0);
            setAssetPrice(0);
        } catch (error) {
            console.log(error)
        }

    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2>Add New Asset</h2>

            <div className={styles.formContainer}>
                <input
                    type="text"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="Name"
                />
                <input type="number"
                    value={assetAmount === 0 ? "" : assetAmount}
                    onChange={(e) => setAssetAmount(Number(e.target.value))}
                    placeholder="Quantity"
                />
                <input type="number"
                    value={assetPrice === 0 ? "" : assetPrice}
                    onChange={(e) => setAssetPrice(Number(e.target.value))}
                    placeholder="Price"
                />


            </div>
            <button type="submit">Add</button>
        </form>
    )




}