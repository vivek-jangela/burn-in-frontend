import { useEffect, useState } from "react";
import {
  loadCSVData,
  getComponentIds,
  getLotIds,
} from "../utils/csvData";

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCSVData()
      .then((csvData) => {
        setData(csvData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load CSV data.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="page">
        <h2>Dashboard</h2>
        <p>Loading real component data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h2>Dashboard</h2>
        <p>{error}</p>
      </div>
    );
  }

  // --------------------------------
  // REAL DATA CALCULATIONS
  // --------------------------------

  const componentIds = getComponentIds(data);
  const lotIds = getLotIds(data);

  // Number of components having at least one defective record
  const defectiveComponents = componentIds.filter((componentId) =>
    data.some(
      (row) =>
        row.component_id === componentId &&
        row.defective === 1
    )
  ).length;

  // Total defective records
  const defectiveRecords = data.filter(
    (row) => row.defective === 1
  ).length;

  // Records at 168 hours
  const latestData = data.filter(
    (row) => row.timestamp_h === 168
  );

  // Average leakage at 168h
  const averageLeakage =
    latestData.length > 0
      ? latestData.reduce(
          (sum, row) => sum + row.leakage_uA,
          0
        ) / latestData.length
      : 0;

  // Average IDDQ at 168h
  const averageIddq =
    latestData.length > 0
      ? latestData.reduce(
          (sum, row) => sum + row.iddq_uA,
          0
        ) / latestData.length
      : 0;

  // Average propagation delay at 168h
  const averageDelay =
    latestData.length > 0
      ? latestData.reduce(
          (sum, row) => sum + row.prop_delay_ns,
          0
        ) / latestData.length
      : 0;

  return (
    <div className="page">

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Burn-In Screening Dashboard</h1>
          <p>
            AI-driven component screening and anomaly monitoring
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="stats-grid">

        <div className="stat-card">
          <h3>Total Components</h3>
          <div className="stat-value">
            {componentIds.length}
          </div>
          <p>Unique components in dataset</p>
        </div>

        <div className="stat-card">
          <h3>Total Lots</h3>
          <div className="stat-value">
            {lotIds.length}
          </div>
          <p>Production lots</p>
        </div>

        <div className="stat-card">
          <h3>Defective Components</h3>
          <div className="stat-value">
            {defectiveComponents}
          </div>
          <p>Components with defective records</p>
        </div>

        <div className="stat-card">
          <h3>Total Records</h3>
          <div className="stat-value">
            {data.length}
          </div>
          <p>Burn-In measurements</p>
        </div>

      </div>

      {/* DATA SUMMARY */}
      <div className="dashboard-grid">

        <div className="dashboard-card">
          <h2>Dataset Summary</h2>

          <div className="summary-row">
            <span>Components</span>
            <strong>{componentIds.length}</strong>
          </div>

          <div className="summary-row">
            <span>Lots</span>
            <strong>{lotIds.length}</strong>
          </div>

          <div className="summary-row">
            <span>Measurement Records</span>
            <strong>{data.length}</strong>
          </div>

          <div className="summary-row">
            <span>Defective Records</span>
            <strong>{defectiveRecords}</strong>
          </div>

          <div className="summary-row">
            <span>Time Points</span>
            <strong>0h, 24h, 96h, 168h</strong>
          </div>
        </div>

        {/* 168H METRICS */}
        <div className="dashboard-card">
          <h2>168h Screening Metrics</h2>

          <div className="summary-row">
            <span>Average Leakage</span>
            <strong>
              {averageLeakage.toFixed(2)} µA
            </strong>
          </div>

          <div className="summary-row">
            <span>Average IDDQ</span>
            <strong>
              {averageIddq.toFixed(2)} µA
            </strong>
          </div>

          <div className="summary-row">
            <span>Average Propagation Delay</span>
            <strong>
              {averageDelay.toFixed(2)} ns
            </strong>
          </div>
        </div>

      </div>

      {/* LOTS */}
      <div className="dashboard-card">
        <h2>Production Lots</h2>

        <div className="lot-list">
          {lotIds.map((lotId) => {

            const lotData = data.filter(
              (row) => row.lot_id === lotId
            );

            const lotComponents = [
              ...new Set(
                lotData.map((row) => row.component_id)
              ),
            ];

            const lotDefective = lotData.filter(
              (row) => row.defective === 1
            ).length;

            return (
              <div className="lot-item" key={lotId}>
                <div>
                  <strong>{lotId}</strong>

                  <p>
                    {lotComponents.length} components
                  </p>
                </div>

                <div>
                  <span>
                    {lotDefective} defective records
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;