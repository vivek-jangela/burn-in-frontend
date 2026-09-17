import { useParams, Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ComponentDetails() {

  const { id } = useParams();

  // Temporary data
  // Later this will come from FastAPI
  const component = {
    id: id || "C-002",
    lot: "LOT-101",

    value0h: 10,
    value24h: 15,
    value96h: 25,
    value168h: 45,

    anomalyScore: 0.94,

    status: "Anomaly",

    risk: "High",

    explanation:
      "The component shows significant leakage-current drift compared with its lot baseline.",

    recommendation:
      "Send the component for QA inspection.",
  };


  // Data for graph
  const chartData = [
    {
      time: "0h",
      value: component.value0h,
    },
    {
      time: "24h",
      value: component.value24h,
    },
    {
      time: "96h",
      value: component.value96h,
    },
    {
      time: "168h",
      value: component.value168h,
    },
  ];


  return (
    <div className="component-details-page">

      {/* Back Button */}

      <Link
        to="/components"
        className="back-button"
      >
        ← Back to Components
      </Link>


      {/* Page Heading */}

      <div className="page-heading">

        <h2>Component Details</h2>

        <p>
          Detailed burn-in screening analysis.
        </p>

      </div>


      {/* Component Information */}

      <div className="detail-card">

        <div className="detail-header">

          <div>

            <h3>{component.id}</h3>

            <p>
              Lot ID: {component.lot}
            </p>

          </div>


          <span className="status-badge status-anomaly">
            {component.status}
          </span>

        </div>

      </div>


      {/* Measurement Cards */}

      <div className="measurement-grid">

        <div className="measurement-card">

          <span>0h</span>

          <strong>
            {component.value0h} µA
          </strong>

          <small>
            Initial value
          </small>

        </div>


        <div className="measurement-card">

          <span>24h</span>

          <strong>
            {component.value24h} µA
          </strong>

          <small>
            Early screening
          </small>

        </div>


        <div className="measurement-card">

          <span>96h</span>

          <strong>
            {component.value96h} µA
          </strong>

          <small>
            Mid screening
          </small>

        </div>


        <div className="measurement-card">

          <span>168h</span>

          <strong>
            {component.value168h} µA
          </strong>

          <small>
            Final measurement
          </small>

        </div>

      </div>


      {/* Time Series Chart */}

      <div className="detail-card">

        <div className="card-header">

          <h3>
            Burn-In Time-Series
          </h3>

          <p>
            Leakage current change during burn-in testing.
          </p>

        </div>


        <div className="detail-chart">

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <LineChart data={chartData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="time" />

              <YAxis />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 5 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* Analysis Section */}

      <div className="analysis-grid">

        {/* Anomaly Score */}

        <div className="detail-card">

          <div className="card-header">

            <h3>
              Anomaly Score
            </h3>

            <p>
              ML model confidence for abnormal behavior.
            </p>

          </div>


          <div className="score-container">

            <div className="score-value">
              {component.anomalyScore}
            </div>

            <div className="score-bar">

              <div
                className="score-fill"
                style={{
                  width: `${component.anomalyScore * 100}%`,
                }}
              />

            </div>

          </div>

        </div>


        {/* Risk Level */}

        <div className="detail-card">

          <div className="card-header">

            <h3>
              Risk Level
            </h3>

          </div>


          <div className="risk-display">

            <span className="risk-high">
              HIGH RISK
            </span>

            <p>
              Component requires further inspection.
            </p>

          </div>

        </div>

      </div>


      {/* Explainability */}

      <div className="detail-card">

        <div className="card-header">

          <h3>
            🤖 ML Explanation
          </h3>

          <p>
            Why the system flagged this component.
          </p>

        </div>


        <div className="explanation-box">

          {component.explanation}

        </div>

      </div>


      {/* Recommendation */}

      <div className="detail-card recommendation-card">

        <div className="card-header">

          <h3>
            ⚠️ Recommended Action
          </h3>

        </div>


        <p>
          {component.recommendation}
        </p>

      </div>

    </div>
  );
}

export default ComponentDetails;