import React from "react";
import stockData from "./data/stock_market_data.json";
import DataTable from "./components/DataTable";

function App() {
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>JSON Model - Stock Dashboard</h1>
      <DataTable data={stockData} />
    </div>
  );
}

export default App;