import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

const lotData = {
  "LOT-101": {
    baseline: 10,
    dynamicThreshold: 20,
    staticLimit: 50,

    components: [
      { id: "C-001", value: 10 },
      { id: "C-002", value: 45 },
      { id: "C-006", value: 11 },
      { id: "C-007", value: 9 },
      { id: "C-008", value: 13 },
    ],
  },

  "LOT-102": {
    baseline: 12,
    dynamicThreshold: 22,
    staticLimit: 50,

    components: [
      { id: "C-003", value: 12 },
      { id: "C-004", value: 31 },
      { id: "C-009", value: 13 },
      { id: "C-010", value: 11 },
      { id: "C-011", value: 14 },
    ],
  },

  "LOT-103": {
    baseline: 10,
    dynamicThreshold: 18,
    staticLimit: 50,

    components: [
      { id: "C-005", value: 10 },
      { id: "C-012", value: 11 },
      { id: "C-013", value: 15 },
      { id: "C-014", value: 9 },
      { id: "C-015", value: 32 },
    ],
  },
};

function LotAnalysis() {
  const [selectedLot, setSelectedLot] = useState("LOT-101");

  const lot = lotData[selectedLot];

  const analyzedComponents = useMemo(() => {
    return lot.components.map((component) => {
      const deviation =
        ((component.value - lot.baseline) / lot.baseline) * 100;

      const isAnomaly = component.value > lot.dynamicThreshold;

      const staticStatus =
        component.value <= lot.staticLimit ? "PASS" : "FAIL";

      return {
        ...component,
        deviation,
        isAnomaly,
        staticStatus,
      };
    });
  }, [lot]);

  const anomalyCount = analyzedComponents.filter(
    (component) => component.isAnomaly
  ).length;

  return (
    <div className="lot-analysis-page">

      {/* Page Heading */}
      <div className="page-heading">
        <h2>Lot Analysis</h2>
        <p>
          Analyze component behavior within a lot and identify potential
          statistical outliers.
        </p>
      </div>

      {/* Lot Selector */}
      <div className="lot-controls">
        <label htmlFor="lot-select">Select Lot</label>

        <select
          id="lot-select"
          value={selectedLot}
          onChange={(e) => setSelectedLot(e.target.value)}
        >
          {Object.keys(lotData).map((lotId) => (
            <option key={lotId} value={lotId}>
              {lotId}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="lot-summary-grid">

        <div className="lot-stat-card">
          <span>Total Components</span>
          <strong>{lot.components.length}</strong>
        </div>

        <div className="lot-stat-card">
          <span>Lot Baseline</span>
          <strong>{lot.baseline} µA</strong>
        </div>

        <div className="lot-stat-card">
          <span>Potential Anomalies</span>
          <strong>{anomalyCount}</strong>
        </div>

        <div className="lot-stat-card">
          <span>Dynamic Threshold</span>
          <strong>{lot.dynamicThreshold} µA</strong>
        </div>

      </div>

      {/* Chart */}
      <div className="lot-chart-card">

        <div className="lot-card-header">
          <div>
            <h3>Leakage Current Distribution</h3>
            <p>
              Component leakage compared with the lot baseline.
            </p>
          </div>
        </div>

        <div className="lot-chart">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={analyzedComponents}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="id" />

              <YAxis
                label={{
                  value: "Leakage (µA)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />

              <Tooltip
                formatter={(value) => [`${value} µA`, "Leakage"]}
              />

              <ReferenceLine
                y={lot.baseline}
                label="Lot Baseline"
              />

              <ReferenceLine
                y={lot.dynamicThreshold}
                label="Dynamic Threshold"
              />

              <ReferenceLine
                y={lot.staticLimit}
                label="Static Limit"
              />

              <Bar dataKey="value">
                {analyzedComponents.map((component) => (
                  <Cell
                    key={component.id}
                    fill={component.isAnomaly ? "#dc2626" : "#2563eb"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Explanation */}
      <div className="lot-info-card">
        <h3>Dynamic Outlier Detection</h3>

        <p>
          The lot baseline represents the normal behavior of components
          within the selected lot. A component above the dynamic threshold
          is treated as a potential outlier.
        </p>

        <div className="lot-info-values">
          <div>
            <span>Lot Baseline</span>
            <strong>{lot.baseline} µA</strong>
          </div>

          <div>
            <span>Dynamic Threshold</span>
            <strong>{lot.dynamicThreshold} µA</strong>
          </div>

          <div>
            <span>Static Datasheet Limit</span>
            <strong>{lot.staticLimit} µA</strong>
          </div>
        </div>
      </div>

      {/* Component Table */}
      <div className="lot-table-card">

        <div className="lot-card-header">
          <div>
            <h3>Component Analysis</h3>
            <p>
              Detailed comparison of components within {selectedLot}.
            </p>
          </div>
        </div>

        <div className="component-table-container">
          <table>

            <thead>
              <tr>
                <th>Component ID</th>
                <th>Leakage</th>
                <th>Deviation</th>
                <th>Static Limit</th>
                <th>Dynamic Result</th>
              </tr>
            </thead>

            <tbody>
              {analyzedComponents.map((component) => (
                <tr key={component.id}>

                  <td>
                    <strong>{component.id}</strong>
                  </td>

                  <td>{component.value} µA</td>

                  <td>
                    <span
                      className={
                        component.deviation > 0
                          ? "deviation-positive"
                          : "deviation-normal"
                      }
                    >
                      {component.deviation > 0 ? "+" : ""}
                      {component.deviation.toFixed(1)}%
                    </span>
                  </td>

                  <td>
                    <span className="static-pass">
                      {component.staticStatus}
                    </span>
                  </td>

                  <td>
                    {component.isAnomaly ? (
                      <span className="status-badge status-anomaly">
                        Anomaly
                      </span>
                    ) : (
                      <span className="status-badge status-normal">
                        Normal
                      </span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>

    </div>
  );
}

export default LotAnalysis;