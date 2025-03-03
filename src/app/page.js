"use client"

import { useState, useEffect } from "react";
import InvestmentTable from "./components/InvestmentTable/InvestmentTable";
import InvestmentSummary from "./components/InvestmentSummary/InvestmentSummary";
import InvestmentChart from "./components/InvestmentChart/investmentChart";
import AddAsset from "./components/AddAsset/AddAsset";



export default function Home() {
  const [investments, setInvestments] = useState([]);
  const [currency, setCurrency] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null)

  useEffect(() => {
    setIsClient(true);

    Promise.all([
      fetch('/api/assets', { cache: "no-store" })
        .then(res => res.json()),
      fetch('https://api.freecurrencyapi.com/v1/latest?apikey=fca_live_FmPsLW5LIVBFPvqGkGICUwwi7m0RDtD857Y1evGm', { cache: "no-store" })
        .then(cur => cur.json())
    ])
      .then(([investmentsData, currencyData]) => {
        setInvestments(investmentsData);

        if (currencyData && currencyData.data && currencyData.data.CZK && currencyData.data.EUR) {
          const eurToCzk = currencyData.data.CZK / currencyData.data.EUR
          setCurrency(eurToCzk)
        } else {
          setCurrency(25)
        }
      })
  }, []);



  const handleAsset = (asset) => {
    if (isEditing) {
      setInvestments(prev => prev.map(item => item.id === asset.id ? asset : item))
    } else {
      setInvestments(prev => [...prev, asset])
    }

    setIsEditing(false);
    setSelectedAsset(null);
  }

  const handleDeleteAsset = (asset) => {
    setInvestments(asset);
  }

  const handleEditAsset = (asset) => {
    setSelectedAsset(asset);
    setIsEditing(true);
  }

  if (!isClient) {
    return <p>Načítavam</p>
  }
  return (

    <main className="dashboard">


      <section className="dashboard-container">
        <h1>Main Dashboard</h1>


        <div className="dashboard-item">
          <AddAsset onAssetAdded={handleAsset}
            isEditing={isEditing}
            selectedAsset={selectedAsset}
            onCancel={() => { setIsEditing(false); setSelectedAsset(null) }}
          />

          <div className="assets-table">
            <InvestmentTable investments={investments} currency={currency} onAssetDelete={handleDeleteAsset} onAssetEdit={handleEditAsset} />
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
