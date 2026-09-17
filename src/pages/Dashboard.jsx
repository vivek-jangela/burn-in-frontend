import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {

  // Temporary data
  // Later this data will come from FastAPI
  const anomalyData = [
    { time: "0h", anomalies: 5 },
    { time: "24h", anomalies: 12 },
    { time: "48h", anomalies: 18 },
    { time: "96h", anomalies: 27 },
    { time: "168h", anomalies: 43 },
  ];

  return (
    <div className="dashboard">

      {/* Page Heading */}

      <div className="page-heading">
        <h2>Dashboard</h2>

        <p>
          Monitor component burn-in screening and anomaly detection.
        </p>
      </div>


      {/* Summary Cards */}

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-title">
            Total Components
          </div>

          <div className="stat-value">
            1,250
          </div>

          <div className="stat-description">
            Components tested
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-title">
            Normal Components
          </div>

          <div className="stat-value">
            1,145
          </div>

          <div className="stat-description">
            Passed screening
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-title">
            Anomalies
          </div>

          <div className="stat-value">
            105
          </div>

          <div className="stat-description">
            Detected anomalies
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-title">
            High Risk
          </div>

          <div className="stat-value">
            32
          </div>

          <div className="stat-description">
            Need inspection
          </div>
        </div>

      </div>


      {/* Charts Section */}

      <div className="dashboard-grid">

        {/* Anomaly Chart */}

        <div className="dashboard-card">

          <div className="card-header">
            <div>
              <h3>Anomaly Overview</h3>

              <p>
                Detected anomalies over burn-in time
              </p>
            </div>
          </div>


          <div className="chart-container">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={anomalyData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="time" />

                <YAxis />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="anomalies"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* Component Status */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <h3>Component Status</h3>

              <p>
                Current screening distribution
              </p>
            </div>

          </div>


          <div className="status-section">

            <div className="status-row">
              <span>Normal</span>
              <strong>91.6%</strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-normal"
                style={{ width: "91.6%" }}
              ></div>
            </div>


            <div className="status-row">
              <span>Anomaly</span>
              <strong>8.4%</strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-anomaly"
                style={{ width: "8.4%" }}
              ></div>
            </div>

          </div>

        </div>

      </div>


      {/* Recent Anomalies */}

      <div className="dashboard-card recent-card">

        <div className="card-header">

          <div>
            <h3>Recent Anomalies</h3>

            <p>
              Components requiring attention
            </p>
          </div>

        </div>


        <div className="table-container">

          <table>

            <thead>

              <tr>
                <th>Component ID</th>
                <th>Lot ID</th>
                <th>Anomaly Score</th>
                <th>Risk Level</th>
                <th>Status</th>
              </tr>

            </thead>


            <tbody>

              <tr>
                <td>C-001</td>
                <td>LOT-101</td>
                <td>0.94</td>
                <td>
                  <span className="risk-high">
                    High
                  </span>
                </td>
                <td>Flagged</td>
              </tr>


              <tr>
                <td>C-018</td>
                <td>LOT-104</td>
                <td>0.81</td>
                <td>
                  <span className="risk-medium">
                    Medium
                  </span>
                </td>
                <td>Review</td>
              </tr>


              <tr>
                <td>C-027</td>
                <td>LOT-107</td>
                <td>0.76</td>
                <td>
                  <span className="risk-medium">
                    Medium
                  </span>
                </td>
                <td>Review</td>
              </tr>


              <tr>
                <td>C-041</td>
                <td>LOT-109</td>
                <td>0.96</td>
                <td>
                  <span className="risk-high">
                    High
                  </span>
                </td>
                <td>Flagged</td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;