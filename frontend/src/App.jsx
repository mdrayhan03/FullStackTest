import React, { useState } from "react";
import DataTable from "./components/DataTable";        // JSON
import DataTableSQL from "./components/DataTableSQL";  // SQL
import Readme from "./components/Readme";              // README

function App() {
  const [activeTab, setActiveTab] = useState("sql"); // default page

  const renderContent = () => {
    switch (activeTab) {
      case "json":
        return <DataTable />;
      case "sql":
        return <DataTableSQL />;
      case "readme":
        return <Readme />;
      default:
        return <DataTableSQL />;
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav style={styles.nav}>
        <button
          style={activeTab === "json" ? styles.activeBtn : styles.btn}
          onClick={() => setActiveTab("json")}
        >
          JSON
        </button>

        <button
          style={activeTab === "sql" ? styles.activeBtn : styles.btn}
          onClick={() => setActiveTab("sql")}
        >
          SQL
        </button>

        <button
          style={activeTab === "readme" ? styles.activeBtn : styles.btn}
          onClick={() => setActiveTab("readme")}
        >
          Readme
        </button>
      </nav>

      <h1 style={{ textAlign: "center", marginTop: "30px" }}>
        Supabase Dashboard
      </h1>

      {renderContent()}
    </div>
  );
}

export default App;

const styles = {
  nav: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    padding: "20px",
    background: "#f5f5f5",
    borderBottom: "1px solid #ddd",
  },
  btn: {
    padding: "10px 20px",
    fontSize: "16px",
    background: "#fff",
    border: "1px solid #888",
    cursor: "pointer",
    borderRadius: "5px",
  },
  activeBtn: {
    padding: "10px 20px",
    fontSize: "16px",
    background: "#007bff",
    color: "#fff",
    border: "1px solid #0056b3",
    cursor: "pointer",
    borderRadius: "5px",
  },
};
