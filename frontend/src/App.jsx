import React from "react";
import DataTableSQL from "./components/DataTableSQL";

function App() {
  return (
    <div>
      <h1 style={{textAlign:"center", marginTop: "50px"}}>Supabase SQL Model - Stock Dashboard</h1>
      <DataTableSQL />
    </div>
  );
}

export default App;