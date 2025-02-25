import styles from "./InvestmentSummary.module.scss";

export default function InvestmentSummary({ currency, investments }) {

    if (investments.legth === 0) {
        return <p>Načítavam dáta...</p>;
    }

    const totalPrice = investments.reduce((sum, inv) => sum + Number(inv.unitPrice) * Number(inv.amount), 0);


    return (
        <div className={styles.total}>
            <h1>Total</h1>
            <p>{totalPrice.toFixed(2)} €</p>
            <p>{(totalPrice * (currency || 1)).toLocaleString("cs-CZ")} CZK</p>
        </div>
    )
}