import { NextResponse } from "next/server";
import fs from 'fs/promises';

const transactionsPath = "src/app/api/wallet/transactions.json";
const balancePath = "src/app/api/wallet/balance.json";

export async function GET(req) {
    try {
        let transactions = [];
        try {
            const data = await fs.readFile(transactionsPath, "utf-8");
            if (data.trim()) {
                transactions = JSON.parse(data);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(transactionsPath, '[]', 'utf-8')
            } else {
                throw error;
            }
        }
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");
        const category = searchParams.get("category");

        let filteredTransactions = transactions;
        if (type) {
            filteredTransactions = filteredTransactions.filter(t => t.type === type);
        }
        if (category) {
            filteredTransactions = filteredTransactions.filter(t => t.category === category)
        }

        return NextResponse.json(filteredTransactions);
    }
    catch (error) {
        console.error("Chyba pri načítaní transakcii");
        return NextResponse.json(
            { error: "Nepodarilo sa načítať transakcie" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const transaction = await req.json()

        if (!transaction.type || !transaction.amount || !transaction.category) {
            return NextResponse.json(
                { error: "Chýbajúce povinné údaje" },
                { status: 400 }
            );
        }

        let transactions = [];
        try {
            const data = await fs.readFile(transactionsPath, "utf-8");
            if (data.trim()) {
                transactions = JSON.parse(data);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFile(transactionsPath, [], "utf-8");
            } else {
                throw error;
            }
        }

        const newTransaction = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...transaction
        }

        try {
            let balance = { amount: 0 };
            try {
                const balanceData = await fs.readFile(balancePath, "utf-8");
                if (balanceData.trim()) {
                    balance = JSON.parse(balanceData);
                }
            } catch (error) {
                if (error.code === 'ENOENT') {
                    await fs.writeFile(balancePath, JSON.stringify({ amount: 0 }), "utf-8");
                }
            }

            if (transaction.type === 'INCOME') {
                balance.amount += Number(transaction.amount);
            } else if (transaction.type === 'EXPENSE') {
                balance.amount -= NUmber(transaction.amount);
            }

            await fs.writeFile(balancePath, JSON.stringify(balance), "utf-8")
        } catch (error) {
            console.error("Chyba pri aktualizaci zostatku", error)
        }

        const updatedTransactions = [newTransaction, ...transactions];
        await fs.writeFile(transactionsPath, JSON.parse(updatedTransactions, null, 2));

        return NextResponse.json(newTransaction);
    } catch (error) {
        console.error("Chyba pri pridávaní trnasakcie", error);
        return NextResponse.json(
            { error: "Nepodarilo sa pridať transakciu" },
            { status: 500 }
        );
    }
}

export async function GET_BALANCE(req) {

}