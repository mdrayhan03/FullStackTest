import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart, Line } from "react-chartjs-2";
import "./tablesql.css";

// Register all necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
);

export default function DataTable() {
  const [rows, setRows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editRow, setEditRow] = useState({});
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [newStock, setNewStock] = useState({
    trade_code: "",
    date: "",
    open: "",
    high: "",
    low: "",
    close: "",
    volume: "",
  });
  const [addError, setAddError] = useState("");
  const [chartTradeCode, setChartTradeCode] = useState("");
  const [chartTimeFrame, setChartTimeFrame] = useState("day");
  const [leftTradeCode1, setLeftTradeCode1] = useState("");
  const [leftTradeCode2, setLeftTradeCode2] = useState("");

  // Fetch data from backend
  useEffect(() => {
    async function getData() {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/trades`);
        if (!res.ok) throw new Error("Backend API Failed");
        const data = await res.json();
        setRows(data);
        setFiltered(data);
        if (data.length > 0) {
          setChartTradeCode(data[0].trade_code);
          setLeftTradeCode1(data[0].trade_code);
          setLeftTradeCode2(data.length > 1 ? data[1].trade_code : data[0].trade_code);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data. Please check backend.");
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  const tradeCodes = [...new Set(rows.map((r) => r.trade_code))];

  // Filter
  useEffect(() => {
    if (!search) setFiltered(rows);
    else setFiltered(rows.filter((r) => r.trade_code === search));
    setPage(1);
  }, [search, rows]);

  // Sorting
  function sortBy(column) {
    let direction = "asc";
    if (sortConfig.key === column && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key: column, direction });

    const sorted = [...filtered].sort((a, b) => {
      if (a[column] < b[column]) return direction === "asc" ? -1 : 1;
      if (a[column] > b[column]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setFiltered(sorted);
  }

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Inline Edit
  function startEdit(row) {
    setEditingId(row.id);
    setEditRow({ ...row });
  }
  function cancelEdit() {
    setEditingId(null);
    setEditRow({});
  }
  async function saveEdit() {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/trades/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editRow),
      });
      if (!res.ok) throw new Error("Failed to update");
      setRows(rows.map((r) => (r.id === editingId ? editRow : r)));
      setFiltered(filtered.map((r) => (r.id === editingId ? editRow : r)));
      cancelEdit();
    } catch (err) {
      alert(err.message);
    }
  }
  async function deleteRow(id) {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/trades/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setRows(rows.filter((r) => r.id !== id));
      setFiltered(filtered.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  // Add Stock
  function validateNewStock(stock) {
    stock.trade_code = stock.trade_code.toUpperCase();
    if (!stock.date || isNaN(new Date(stock.date).getTime())) return "Invalid date.";
    const floatFields = ["open", "high", "low", "close"];
    for (let field of floatFields) if (isNaN(parseFloat(stock[field]))) return `${field} must be a valid number.`;
    if (!Number.isInteger(Number(stock.volume))) return "Volume must be an integer.";
    return null;
  }
  async function addStock() {
    const error = validateNewStock(newStock);
    if (error) {
      setAddError(error);
      return;
    }
    const payload = {
      ...newStock,
      open: parseFloat(newStock.open),
      high: parseFloat(newStock.high),
      low: parseFloat(newStock.low),
      close: parseFloat(newStock.close),
      volume: parseInt(newStock.volume),
    };
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/trades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to add stock");
      const added = await res.json();
      setRows([added, ...rows]);
      setFiltered([added, ...filtered]);
      setShowModal(false);
      setAddError("");
      setNewStock({ trade_code: "", date: "", open: "", high: "", low: "", close: "", volume: "" });
    } catch (err) {
      setAddError(err.message);
    }
  }

  // Right chart data
  let chartDataRows = rows
    .filter((r) => r.trade_code === chartTradeCode)
    .map((r) => ({ ...r, date: new Date(r.date) }));

  if (chartTimeFrame === "month") {
    chartDataRows = Object.values(
      chartDataRows.reduce((acc, r) => {
        const key = `${r.date.getFullYear()}-${r.date.getMonth() + 1}`;
        if (!acc[key]) acc[key] = { date: key, close: 0, volume: 0, count: 0 };
        acc[key].close += r.close;
        acc[key].volume += r.volume;
        acc[key].count += 1;
        return acc;
      }, {})
    ).map((r) => ({ ...r, close: r.close / r.count }));
  } else if (chartTimeFrame === "year") {
    chartDataRows = Object.values(
      chartDataRows.reduce((acc, r) => {
        const key = r.date.getFullYear();
        if (!acc[key]) acc[key] = { date: key, close: 0, volume: 0, count: 0 };
        acc[key].close += r.close;
        acc[key].volume += r.volume;
        acc[key].count += 1;
        return acc;
      }, {})
    ).map((r) => ({ ...r, close: r.close / r.count }));
  } else chartDataRows.sort((a, b) => a.date - b.date);

  const rightChartData = {
    labels: chartDataRows.map((r) => (r.date instanceof Date ? r.date.toISOString().split("T")[0] : r.date)),
    datasets: [
      {
        type: "line",
        label: "Close Price",
        data: chartDataRows.map((r) => r.close),
        borderColor: "blue",
        yAxisID: "y",
        tension: 0.2,
      },
      {
        type: "bar",
        label: "Volume",
        data: chartDataRows.map((r) => r.volume),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        yAxisID: "y1",
      },
    ],
  };

  const rightChartOptions = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    stacked: false,
    plugins: { legend: { position: "top" } },
    scales: {
      y: { type: "linear", display: true, position: "left", title: { display: true, text: "Close Price" } },
      y1: { type: "linear", display: true, position: "right", title: { display: true, text: "Volume" }, grid: { drawOnChartArea: false } },
      x: { title: { display: true, text: "Date" } },
    },
  };

  // Left chart data
  const leftDataRows1 = rows.filter((r) => r.trade_code === leftTradeCode1);
  const leftDataRows2 = rows.filter((r) => r.trade_code === leftTradeCode2);
  const allDates = [...new Set([...leftDataRows1, ...leftDataRows2].map((r) => r.date))].sort();

  const leftChartData = {
    labels: allDates,
    datasets: [
      ...["Open", "Close", "High", "Low"].map((field, idx) => ({
        label: `${leftTradeCode1} ${field}`,
        data: allDates.map((d) => {
          const row = leftDataRows1.find((r) => r.date === d);
          return row ? row[field.toLowerCase()] : null;
        }),
        borderColor: ["blue", "green", "red", "orange"][idx],
        tension: 0.2,
      })),
      ...["Open", "Close", "High", "Low"].map((field, idx) => ({
        label: `${leftTradeCode2} ${field}`,
        data: allDates.map((d) => {
          const row = leftDataRows2.find((r) => r.date === d);
          return row ? row[field.toLowerCase()] : null;
        }),
        borderColor: ["blue", "green", "red", "orange"][idx],
        borderDash: [5, 5],
        tension: 0.2,
      })),
    ],
  };

  const leftChartOptions = { responsive: true, plugins: { legend: { position: "top" } }, scales: { x: { title: { display: true, text: "Date" } }, y: { title: { display: true, text: "Price" } } } };

  return (
    <div className="table-container">
      <div className="charts-container">
        <div className="left-chart">
          <h3>Comparison Chart</h3>
          <div className="chart-controls">
            <label>Trade Code 1:</label>
            <select value={leftTradeCode1} onChange={(e) => setLeftTradeCode1(e.target.value)}>
              {tradeCodes.map((tc) => <option key={tc} value={tc}>{tc}</option>)}
            </select>
            <label>Trade Code 2:</label>
            <select value={leftTradeCode2} onChange={(e) => setLeftTradeCode2(e.target.value)}>
              {tradeCodes.map((tc) => <option key={tc} value={tc}>{tc}</option>)}
            </select>
          </div>
          <Line data={leftChartData} options={leftChartOptions} />
        </div>
        <div className="right-chart">
          <h3>Stock Price & Volume</h3>
          <div className="chart-controls">
            <label>Trade Code:</label>
            <select value={chartTradeCode} onChange={(e) => setChartTradeCode(e.target.value)}>
              {tradeCodes.map((tc) => <option key={tc} value={tc}>{tc}</option>)}
            </select>
            <label>Time:</label>
            <select value={chartTimeFrame} onChange={(e) => setChartTimeFrame(e.target.value)}>
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          <Chart data={rightChartData} options={rightChartOptions} />
        </div>
      </div>

      {/* Table & Controls */}
      <div className="table-controller">
        <select className="search-box" value={search} onChange={(e) => setSearch(e.target.value)}>
          <option value="">All Trade Codes</option>
          {tradeCodes.map((tc) => <option key={tc} value={tc}>{tc}</option>)}
        </select>
        <button className="add-button" onClick={() => setShowModal(true)}>+ Add New Stock</button>
      </div>

      {error && <div className="error-box">{error}</div>}
      {loading && <div className="loader"></div>}

      {!loading && !error && (
        <>
          {/* Table */}
          <table className="styled-table">
            <thead>
              <tr>
                <th onClick={() => sortBy("id")}>ID</th>
                <th onClick={() => sortBy("trade_code")}>Trade Code</th>
                <th onClick={() => sortBy("date")}>Date</th>
                <th onClick={() => sortBy("open")}>Open</th>
                <th onClick={() => sortBy("high")}>High</th>
                <th onClick={() => sortBy("low")}>Low</th>
                <th onClick={() => sortBy("close")}>Close</th>
                <th onClick={() => sortBy("volume")}>Volume</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr key={row.id}>
                  <td>
                    {row.id}
                  </td>
                  <td>
                    {editingId === row.id ? (
                      <input
                        value={editRow.trade_code}
                        onChange={(e) => setEditRow({ ...editRow, trade_code: e.target.value })}
                      />
                    ) : (
                      row.trade_code
                    )}
                  </td>
                  <td>
                    {editingId === row.id ? (
                      <input
                        type="date"
                        value={editRow.date.split("T")[0]}
                        onChange={(e) => setEditRow({ ...editRow, date: e.target.value })}
                      />
                    ) : (
                      row.date.split("T")[0]
                    )}
                  </td>
                  <td>
                    {editingId === row.id ? (
                      <input
                        type="number"
                        value={editRow.open}
                        onChange={(e) => setEditRow({ ...editRow, open: e.target.value })}
                      />
                    ) : (
                      row.open
                    )}
                  </td>
                  <td>
                    {editingId === row.id ? (
                      <input
                        type="number"
                        value={editRow.high}
                        onChange={(e) => setEditRow({ ...editRow, high: e.target.value })}
                      />
                    ) : (
                      row.high
                    )}
                  </td>
                  <td>
                    {editingId === row.id ? (
                      <input
                        type="number"
                        value={editRow.low}
                        onChange={(e) => setEditRow({ ...editRow, low: e.target.value })}
                      />
                    ) : (
                      row.low
                    )}
                  </td>
                  <td>
                    {editingId === row.id ? (
                      <input
                        type="number"
                        value={editRow.close}
                        onChange={(e) => setEditRow({ ...editRow, close: e.target.value })}
                      />
                    ) : (
                      row.close
                    )}
                  </td>
                  <td>
                    {editingId === row.id ? (
                      <input
                        type="number"
                        value={editRow.volume}
                        onChange={(e) => setEditRow({ ...editRow, volume: e.target.value })}
                      />
                    ) : (
                      row.volume
                    )}
                  </td>
                  <td>
                    {editingId === row.id ? (
                      <>
                        <button onClick={saveEdit}>Save</button>{'\u00A0'}
                        <button onClick={cancelEdit}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(row)}>Edit</button>{'\u00A0'}
                        <button onClick={() => deleteRow(row.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>Previous</button>
            <span>{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>Next</button>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Stock</h3>
            <label>Trade Code</label>
            <input value={newStock.trade_code} onChange={(e) => setNewStock({ ...newStock, trade_code: e.target.value })}/>
            <label>Date</label>
            <input type="date" value={newStock.date} onChange={(e) => setNewStock({ ...newStock, date: e.target.value })}/>
            <label>Open</label>
            <input type="number" value={newStock.open} onChange={(e) => setNewStock({ ...newStock, open: e.target.value })}/>
            <label>High</label>
            <input type="number" value={newStock.high} onChange={(e) => setNewStock({ ...newStock, high: e.target.value })}/>
            <label>Low</label>
            <input type="number" value={newStock.low} onChange={(e) => setNewStock({ ...newStock, low: e.target.value })}/>
            <label>Close</label>
            <input type="number" value={newStock.close} onChange={(e) => setNewStock({ ...newStock, close: e.target.value })}/>
            <label>Volume</label>
            <input type="number" value={newStock.volume} onChange={(e) => setNewStock({ ...newStock, volume: e.target.value })}/>
            {addError && <div className="error-box">{addError}</div>}
            <div className="modal-buttons">
              <button onClick={addStock}>Add</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}