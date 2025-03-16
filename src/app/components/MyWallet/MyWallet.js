"use client"

import { useState, useEffect } from 'react';
import styles from './MyWallet.module.scss';

export default function MyWallet({ investments }) {
    const [transactions, setTransactions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        type: 'INCOME',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [accountBalance, setAccountBalance] = useState(0);
    const [savingBalance, setSavingBalance] = useState(0);
    const [totalAsstValue, setTotalAssetValue] = useState(0);
    const [filter, setFilter] = useState('ALL');
    const CATEGORIES = {
        INCOME: [
            'SALARY',
            'INVESTMENT',
            'OTHER'
        ],
        EXPENSE: [
            'INVESTMENT',
            'RENT',
            'FOOD',
            'UTILTIES',
            'OTHER'
        ]
    }

    useEffect(() => {

    }, []);

    const filteredTransactions = () => {
        if (filter == 'ALL') return transactions;
        return transactions.filter(t => t.type === filter);
    }

    const calculateTotalPortfolio = () => {
        const assetsValue = investments.reduce((sum, inv) => sum + (Number(inv.amount) * Number(inv.unitPrice)), 0)

        return accountBalance + savingBalance + assetsValue;
    }

    return (
        <div className={styles.container}>
            <div className={styles.summary}>
                <div className={styles.accountInfo}>
                    <h3>Bežný účet:</h3>
                    <p>{accountBalance.toFixed(2)} €</p>
                </div>
                <div className={styles.accountInfo}>
                    <h3>Celková hodnota portfólia:</h3>
                    <p>{calculateTotalPortfolio().toFixed(2)} €</p>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.filters}>
                    <button
                        className={filter === 'ALL' ? styles.active : ''}
                        onClick={() => setFilter('ALL')}
                    >
                        Všetky
                    </button>
                    <button
                        className={filter === 'INCOME' ? styles.active : ''}
                        onClick={() => setFilter('INCOME')}
                    >
                        Príjmy
                    </button>
                    <button
                        className={filter === 'EXPENSE' ? styles.active : ''}
                        onClick={() => setFilter('EXPENSE')}
                    >
                        Výdavky
                    </button>
                </div>
                <button onClick={() => setShowForm(true)}>
                    Pridať transakciu
                </button>
            </div>

            {/* Tu príde zoznam transakcií */}
            <div className={styles.transactionsList}>
                {filteredTransactions().map(transaction => (
                    <div key={transaction.id} className={styles.transaction}>
                        <div className={styles.transactionInfo}>
                            <span className={styles.date}>{transaction.date}</span>
                            <span className={styles.category}>{transaction.category}</span>
                            <span className={styles.description}>{transaction.description}</span>
                        </div>
                        <span className={`${styles.amount} ${styles[transaction.type.toLowerCase()]}`}>
                            {transaction.type === 'EXPENSE' ? '-' : '+'}{transaction.amount.toFixed(2)} €
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}