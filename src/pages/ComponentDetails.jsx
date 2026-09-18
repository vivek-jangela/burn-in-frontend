import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  getComponentData,
} from "../utils/csvData";

function ComponentDetails() {
  const { id } = useParams();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCSVData()
      .then((data) => {
        const componentRows = getComponentData(data, id);
        setRows(componentRows);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div>Loading component...</div>;
  }

  if (rows.length === 0) {
    return (
      <div>
        <h2>Component not found</h2>
        <Link to="/components">
          Back to Components
        </Link>
      </div>
    );
  }

  const component = rows[0];

  const defective = rows.some(
    (row) => row.defective === 1
  );

  const first = rows.find(
    (row) => row.timestamp_h === 0
  );

  const last = rows.find(
    (row) => row.timestamp_h === 168
  );

  const leakageIncrease =
    first && last
      ? last.leakage_uA - first.leakage_uA
      : 0;

  const risk = defective
    ? "High"
    : leakageIncrease > 15
    ? "Medium"
    : "Low";

  return (
    <div className="component-details-page">

      <Link
        to="/components"
        className="back-button"
      >
        ← Back to Components
      </Link>

      <div className="page-heading">
        <h2>{component.component_id}</h2>
        <p>
          Component details from the real CSV dataset.
        </p>
      </div>

      <div className="detail-card">

        <div className="detail-header">

          <div>
            <h3>
              {component.component_id}
            </h3>

            <p>
              Lot: {component.lot_id}
            </p>
          </div>

          <span
            className={
              defective
                ? "status-badge status-anomaly"
                : "status-badge status-normal"
            }
          >
            {defective ? "Defective" : "Normal"}
          </span>

        </div>

        <div className="measurement-grid">

          {rows.map((row) => (
            <div
              className="measurement-card"
              key={row.timestamp_h}
            >
              <span>
                {row.timestamp_h}h
              </span>

              <strong>
                {row.leakage_uA.toFixed(3)} µA
              </strong>

              <small>
                Leakage
              </small>
            </div>
          ))}

        </div>

      </div>

      <div className="detail-card detail-chart">

        <h3>
          Leakage Current Trend
        </h3>

        <ResponsiveContainer
          width="100%"
          height={350}
        >
          <LineChart data={rows}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              dataKey="timestamp_h"
              label={{
                value: "Time (hours)",
                position: "insideBottom",
                offset: -5,
              }}
            />

            <YAxis
              label={{
                value: "Leakage (µA)",
                angle: -90,
                position: "insideLeft",
              }}
            />

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

      <div className="analysis-grid">

        <div className="detail-card">

          <h3>
            Screening Result
          </h3>

          <div className="risk-display">

            <span>
              Risk Level
            </span>

            <strong>
              {risk}
            </strong>

          </div>

          <p>
            Defective flag from dataset:
            {" "}
            <strong>
              {defective ? "Yes" : "No"}
            </strong>
          </p>

        </div>

        <div className="detail-card">

          <h3>
            Explanation
          </h3>

          <div className="explanation-box">

            {defective
              ? "This component is marked defective in the provided dataset."
              : "This component is not marked defective in the provided dataset."}

          </div>

        </div>

      </div>

      <div className="recommendation-card">

        <h3>
          QA Recommendation
        </h3>

        <p>

          {defective
            ? "Send this component for QA inspection."
            : "Component can continue normal screening."}

        </p>

      </div>

    </div>
  );
}

export default ComponentDetails;