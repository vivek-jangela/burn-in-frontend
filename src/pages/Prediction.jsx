import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  loadCSVData,
  getComponentIds,
  getComponentData,
} from "../utils/csvData";

function Prediction() {
  const [data, setData] = useState([]);
  const [componentIds, setComponentIds] = useState([]);
  const [selectedComponent, setSelectedComponent] =
    useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCSVData()
      .then((csv) => {

        setData(csv);

        const ids = getComponentIds(csv);

        setComponentIds(ids);

        if (ids.length > 0) {
          setSelectedComponent(ids[0]);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading prediction data...</div>;
  }

  const rows = getComponentData(
    data,
    selectedComponent
  );

  if (rows.length === 0) {
    return <div>No component data found.</div>;
  }

  const component = rows[0];

  const defective = rows.some(
    (row) => row.defective === 1
  );

  const leakage0 = rows.find(
    (row) => row.timestamp_h === 0
  )?.leakage_uA ?? 0;

  const leakage24 = rows.find(
    (row) => row.timestamp_h === 24
  )?.leakage_uA ?? 0;

  const leakage168 = rows.find(
    (row) => row.timestamp_h === 168
  )?.leakage_uA ?? 0;

  const driftRate =
    (leakage24 - leakage0) / 24;

  return (
    <div className="prediction-page">

      <div className="page-heading">

        <h2>
          Prediction
        </h2>

        <p>
          Component time-series screening data from the CSV.
        </p>

      </div>

      <div className="prediction-controls">

        <label>
          Select Component
        </label>

        <select
          value={selectedComponent}
          onChange={(e) =>
            setSelectedComponent(e.target.value)
          }
        >

          {componentIds.map((id) => (
            <option
              key={id}
              value={id}
            >
              {id}
            </option>
          ))}

        </select>

      </div>

      <div className="prediction-component-info">

        <strong>
          Component:
        </strong>{" "}
        {component.component_id}

        {" | "}

        <strong>
          Lot:
        </strong>{" "}
        {component.lot_id}

      </div>

      <div className="prediction-summary-grid">

        <div className="prediction-stat-card">

          <span>
            Leakage 0h
          </span>

          <strong>
            {leakage0.toFixed(3)} µA
          </strong>

        </div>

        <div className="prediction-stat-card">

          <span>
            Leakage 24h
          </span>

          <strong>
            {leakage24.toFixed(3)} µA
          </strong>

        </div>

        <div className="prediction-stat-card">

          <span>
            Leakage 168h
          </span>

          <strong>
            {leakage168.toFixed(3)} µA
          </strong>

        </div>

        <div className="prediction-stat-card">

          <span>
            Early Drift Rate
          </span>

          <strong>
            {driftRate.toFixed(4)} µA/hr
          </strong>

        </div>

      </div>

      <div className="prediction-section">

        <h3>
          Leakage Time Series
        </h3>

        <ResponsiveContainer
          width="100%"
          height={350}
        >

          <LineChart data={rows}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="timestamp_h"
            />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="leakage_uA"
              stroke="#2563eb"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

      <div className="prediction-verdict-card">

        <h3>
          Dataset Result
        </h3>

        <h2>
          {defective
            ? "DEFECTIVE"
            : "NORMAL"}
        </h2>

        <p>
          This result comes from the{" "}
          <strong>defective</strong>{" "}
          column in your provided CSV dataset.
        </p>

        <p>
          Actual 168h leakage:
          {" "}
          <strong>
            {leakage168.toFixed(3)} µA
          </strong>
        </p>

      </div>

    </div>
  );
}

export default Prediction;