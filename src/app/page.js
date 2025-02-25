"use client"

import { useState, useEffect } from "react";
import InvestmentTable from "./components/InvestmentTable/InvestmentTable";
import InvestmentSummary from "./components/InvestmentSummary/InvestmentSummary";
import InvestmentChart from "./components/InvestmentChart/investmentChart";
import AddAsset from "./components/AddAsset/AddAsset";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";



export default function Home() {
  const [investments, setInvestments] = useState([]);
  const [currency, setCurrency] = useState(1);
  const [isClient, setIsClient] = useState(false)

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

  const handleAsset = (newAsset) => {
    setInvestments((prev) => [...prev, newAsset])
  }

  const deleteAsset = (newAsset) => {
    setInvestments(newAsset);
  }


  if (!isClient) {
    return <p>Načítavam</p>
  }
  return (

    <main className="dashboard">
      <aside className="sidebar">
        <h2>Invest App</h2>
        <nav>
          <ul>
            <li> <FontAwesomeIcon className="ico-fa" icon={faHouse} /> Dashboard</li>
          </ul>
        </nav>
      </aside>

      <section className="dashboard-container">
        <h1>Main Dashboard</h1>

        <div className="">
          <AddAsset onAssetAdded={handleAsset} />
        </div>

        <div className="dashboard-item">
          <div className="assets-table">
            <InvestmentTable investments={investments} currency={currency} onAssetDelete={deleteAsset} />
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
