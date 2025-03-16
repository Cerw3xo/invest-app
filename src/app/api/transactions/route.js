import { NextResponse } from "next/server";
import fs from "fs/promises"

const transactionsFilePath = "src/app/api/transactions/transactions.json"
const assetFilePath = "src/app/api/assets/assets.json";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const assetId = searchParams.get("assetId");

    let transactions = [];
    try {
      const data = await fs.readFile(transactionsFilePath, "utf-8");

      if (data.trim()) {
        transactions = JSON.parse(data);
      }
    } catch (error) {

      if (error.code === 'ENOENT') {
        await fs.writeFile(transactionsFilePath, '[]', 'utf-8');
      } else {
        throw error;
      }
    }

    if (assetId) {
      const filteredTransactions = transactions.filter(
        transaction => transaction.assetId === parseInt(assetId)
      );
      return NextResponse.json(filteredTransactions);
    }
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Chyba pri načítaní transakcií:", error);
    return NextResponse.json({ error: "Error loading transactions" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const newTransaction = await req.json();
    newTransaction.id = Date.now();

    // Kontrola, či súbor existuje
    let transactions = [];
    try {
      const data = await fs.readFile(transactionsFilePath, "utf-8");
      // Ak je súbor prázdny, použijeme prázdne pole
      if (data.trim()) {
        transactions = JSON.parse(data);
      }
    } catch (error) {
      // Ak súbor neexistuje, vytvoríme ho s prázdnym poľom
      if (error.code === 'ENOENT') {
        await fs.writeFile(transactionsFilePath, '[]', 'utf-8');
      } else {
        throw error;
      }
    }

    const updatedTransactions = [newTransaction, ...transactions];
    await fs.writeFile(transactionsFilePath, JSON.stringify(updatedTransactions, null, 2));

    // Aktualizácia aktíva
    try {
      const assetsData = await fs.readFile(assetFilePath, "utf-8");
      const assets = JSON.parse(assetsData);

      const assetIndex = assets.findIndex(asset => asset.id === parseInt(newTransaction.assetId));
      if (assetIndex !== -1) {
        const asset = assets[assetIndex];

        if (newTransaction.type === "BUY") {
          asset.amount = (Number(asset.amount) + Number(newTransaction.amount)).toString();
        } else if (newTransaction.type === "SELL") {
          asset.amount = (Number(asset.amount) - Number(newTransaction.amount)).toString()
        }

        await fs.writeFile(assetFilePath, JSON.stringify(assets, null, 2));
      }
    } catch (error) {
      console.error("Chyba pri aktualizácii aktíva:", error);
      return NextResponse.json({ error: "Error updating asset" }, { status: 500 });
    }

    return NextResponse.json(newTransaction)
  } catch (error) {
    console.error("Chyba pri pridávaní transakcie:", error);
    return NextResponse.json({ error: "Error adding transaction" }, { status: 500 })
  }
}