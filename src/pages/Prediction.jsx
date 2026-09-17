import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const predictionData = {
  C1024: {
    component_id: "C1024",
    lot_id: "L07",

    timestamps_available: ["0h", "24h"],

    raw_values: {
      iddq: {
        "0h": 12.1,
        "24h": 14.8,
      },

      leakage: {
        "0h": 10.2,
        "24h": 13.9,
      },

      prop_delay: {
        "0h": 5.4,
        "24h": 5.6,
      },
    },

    module_a: {
      anomaly_score: 0.82,
      flagged: true,
      method: "zscore",
      reason: "Leakage 45µA vs lot median 10µA (6.2 MAD)",
    },

    module_b: {
      predicted_168h: {
        leakage: 52.1,
      },

      predicted_drift_rate: 2.3,

      safety_slope: 1.1,

      flagged: true,

      reason:
        "Predicted leakage drift rate (2.3µA/hr) exceeds global safety threshold (1.1µA/hr)",
    },

    final_verdict: "REJECT",

    explanation:
      "Flagged by both modules: statistical outlier in current lot AND predicted to exceed safe drift by 168h",
  },
};

function Prediction() {
  const [selectedComponent, setSelectedComponent] =
    useState("C1024");

  const data = predictionData[selectedComponent];

  const chartData = [
    {
      time: "0h",
      leakage: data.raw_values.leakage["0h"],
      type: "Actual",
    },

    {
      time: "24h",
      leakage: data.raw_values.leakage["24h"],
      type: "Actual",
    },

    {
      time: "168h",
      leakage: data.module_b.predicted_168h.leakage,
      type: "Predicted",
    },
  ];

  const driftRisk = data.module_b.flagged;

  return (
    <div className="prediction-page">

      {/* Page Heading */}
      <div className="page-heading">
        <h2>Prediction</h2>

        <p>
          Predict future component behavior and identify unsafe
          drift before the end of burn-in testing.
        </p>
      </div>

      {/* Component Selector */}
      <div className="prediction-controls">
        <label htmlFor="component-select">
          Select Component
        </label>

        <select
          id="component-select"
          value={selectedComponent}
          onChange={(e) =>
            setSelectedComponent(e.target.value)
          }
        >
          {Object.keys(predictionData).map((componentId) => (
            <option key={componentId} value={componentId}>
              {componentId}
            </option>
          ))}
        </select>
      </div>

      {/* Component Information */}
      <div className="prediction-component-info">

        <div>
          <span>Component ID</span>
          <strong>{data.component_id}</strong>
        </div>

        <div>
          <span>Lot ID</span>
          <strong>{data.lot_id}</strong>
        </div>

        <div>
          <span>Timestamps Available</span>
          <strong>
            {data.timestamps_available.join(", ")}
          </strong>
        </div>

      </div>

      {/* Module B */}
      <div className="prediction-section">

        <div className="prediction-section-header">
          <div>
            <h3>Module B — Drift Prediction</h3>

            <p>
              Time-series prediction of component leakage
              behavior.
            </p>
          </div>

          {driftRisk ? (
            <span className="prediction-risk-badge">
              Drift Risk
            </span>
          ) : (
            <span className="prediction-safe-badge">
              Within Safety Range
            </span>
          )}
        </div>

        {/* Prediction Cards */}
        <div className="prediction-summary-grid">

          <div className="prediction-stat-card">
            <span>Predicted 168h Leakage</span>

            <strong>
              {data.module_b.predicted_168h.leakage} µA
            </strong>
          </div>

          <div className="prediction-stat-card">
            <span>Predicted Drift Rate</span>

            <strong>
              {data.module_b.predicted_drift_rate} µA/hr
            </strong>
          </div>

          <div className="prediction-stat-card">
            <span>Safety Slope</span>

            <strong>
              {data.module_b.safety_slope} µA/hr
            </strong>
          </div>

          <div className="prediction-stat-card">
            <span>Module B Flagged</span>

            <strong>
              {data.module_b.flagged ? "Yes" : "No"}
            </strong>
          </div>

        </div>

      </div>

      {/* Prediction Chart */}
      <div className="prediction-chart-card">

        <div className="prediction-card-header">

          <div>
            <h3>Leakage Prediction</h3>

            <p>
              Actual measurements and predicted 168h
              leakage value.
            </p>
          </div>

        </div>

        <div className="prediction-chart">

          <ResponsiveContainer
            width="100%"
            height={380}
          >
            <LineChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="time" />

              <YAxis
                label={{
                  value: "Leakage (µA)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />

              <Tooltip
                formatter={(value) => [
                  `${value} µA`,
                  "Leakage",
                ]}
              />

              <ReferenceLine
                y={data.module_b.predicted_168h.leakage}
                label="Predicted 168h"
              />

              <Line
                type="monotone"
                dataKey="leakage"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5 }}
              />

            </LineChart>
          </ResponsiveContainer>

        </div>

      </div>

      {/* Safety Comparison */}
      <div className="safety-comparison-card">

        <h3>Drift Safety Analysis</h3>

        <div className="safety-comparison">

          <div className="safety-value">

            <span>Predicted Drift Rate</span>

            <strong>
              {data.module_b.predicted_drift_rate} µA/hr
            </strong>

          </div>

          <div className="safety-symbol">
            {data.module_b.predicted_drift_rate >
            data.module_b.safety_slope
              ? ">"
              : "≤"}
          </div>

          <div className="safety-value">

            <span>Safety Slope</span>

            <strong>
              {data.module_b.safety_slope} µA/hr
            </strong>

          </div>

        </div>

        <div
          className={
            driftRisk
              ? "safety-warning"
              : "safety-success"
          }
        >
          {data.module_b.reason}
        </div>

      </div>

      {/* Final Verdict */}
      <div className="prediction-verdict-card">

        <div>
          <h3>Final Verdict</h3>

          <p>{data.explanation}</p>
        </div>

        <div
          className={
            data.final_verdict === "REJECT"
              ? "verdict-reject"
              : "verdict-pass"
          }
        >
          {data.final_verdict}
        </div>

      </div>

    </div>
  );
}

export default Prediction;