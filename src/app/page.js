"use client"

import { useState, useEffect } from "react";
import InvestmentTable from "./components/InvestmentTable/InvestmentTable";
import InvestmentSummary from "./components/InvestmentSummary/InvestmentSummary";
import InvestmentChart from "./components/InvestmentChart/investmentChart";
import AddAsset from "./components/AddAsset/AddAsset";
import MyWallet from "./components/MyWallet/MyWallet";



export default function Home() {
  const [investments, setInvestments] = useState([]);
  const [currency, setCurrency] = useState(1);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const [investmentsResponse, currencyResponse] = await Promise.all([
        fetch('/api/assets', { cache: "no-store" }),
        fetch('https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_FmPsLW5LIVBFPvqGkGICUwwi7m0RDtD857Y1evGm', { cache: "no-store" })
      ]);

      if (!investmentsResponse.ok) {
        throw new Error("Chyba pri načítaní investícií");
      }

      const investmentsData = await investmentsResponse.json();
      setInvestments(investmentsData);

      if (currencyResponse.ok) {
        const currencyData = await currencyResponse.json();
        if (currencyData && currencyData.data && currencyData.data.CZK && currencyData.data.EUR) {
          console.log(currencyData);
          const eurToCzk = currencyData.data.CZK / currencyData.data.EUR;
          setCurrency(eurToCzk);
        } else {
          setCurrency(25);
        }
      }
    } catch (error) {
      console.error("Chyba pri načítaní dát:", error);
    }
  };

  const handleAsset = (asset) => {
    setInvestments(prev => [...prev, asset]);
  }

  const handleDeleteAsset = (updatedAssets) => {
    setInvestments(updatedAssets);
  }

  const onUpdatedInvestment = (updatedInvestments) => {
    setInvestments(updatedInvestments);
  }

  if (!isClient) {
    return <p>Načítavam</p>
  }

  return (
    <main className="dashboard">
      <section className="dashboard-container">
        <h1>Main Dashboard</h1>
        <MyWallet investments={investments} />

        <div className="dashboard-item">
          <AddAsset onAssetAdded={handleAsset} />

          <div className="assets-table">
            <InvestmentTable
              investments={investments}
              currency={currency}
              onAssetDelete={handleDeleteAsset}
              onUpdatedInvestments={onUpdatedInvestment}
            />
          </div>

          <div className="graph">
            <InvestmentSummary investments={investments} currency={currency} />
            <InvestmentChart investment={investments} />
          </div>
        </div>
      </section>
    </main>
  );
}
