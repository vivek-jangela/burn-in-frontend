import { useState } from "react";
import { Link } from "react-router-dom";

function Components() {

  // Temporary data
  // Later this data will come from FastAPI
  const components = [
    {
      id: "C-001",
      lot: "LOT-101",
      value0h: 10,
      value24h: 12,
      value96h: 18,
      value168h: 25,
      anomalyScore: 0.12,
      status: "Normal",
    },
    {
      id: "C-002",
      lot: "LOT-101",
      value0h: 10,
      value24h: 15,
      value96h: 25,
      value168h: 45,
      anomalyScore: 0.94,
      status: "Anomaly",
    },
    {
      id: "C-003",
      lot: "LOT-102",
      value0h: 9,
      value24h: 10,
      value96h: 11,
      value168h: 12,
      anomalyScore: 0.08,
      status: "Normal",
    },
    {
      id: "C-004",
      lot: "LOT-102",
      value0h: 11,
      value24h: 13,
      value96h: 20,
      value168h: 31,
      anomalyScore: 0.71,
      status: "Anomaly",
    },
    {
      id: "C-005",
      lot: "LOT-103",
      value0h: 10,
      value24h: 11,
      value96h: 13,
      value168h: 15,
      anomalyScore: 0.15,
      status: "Normal",
    },
  ];


  // Search text
  const [search, setSearch] = useState("");

  // Selected filter
  const [statusFilter, setStatusFilter] = useState("All");


  // Filter components
  const filteredComponents = components.filter((component) => {

    const matchesSearch =
      component.id
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      component.lot
        .toLowerCase()
        .includes(search.toLowerCase());


    const matchesStatus =
      statusFilter === "All" ||
      component.status === statusFilter;


    return matchesSearch && matchesStatus;
  });


  return (
    <div className="components-page">

      {/* Page Heading */}

      <div className="page-heading">

        <h2>Components</h2>

        <p>
          Monitor individual component burn-in screening results.
        </p>

      </div>


      {/* Search and Filter */}

      <div className="component-controls">

        <input
          type="text"
          placeholder="Search Component ID or Lot ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />


        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Normal">Normal</option>
          <option value="Anomaly">Anomaly</option>
        </select>

      </div>


      {/* Component Table */}

      <div className="components-card">

        <div className="component-table-container">

          <table>

            <thead>

              <tr>
                <th>Component ID</th>
                <th>Lot ID</th>
                <th>0h</th>
                <th>24h</th>
                <th>96h</th>
                <th>168h</th>
                <th>Anomaly Score</th>
                <th>Status</th>
              </tr>

            </thead>


            <tbody>

              {filteredComponents.map((component) => (

                <tr key={component.id}>

                  <td>
                      <Link
                            to={`/components/${component.id}`}
                              className="component-link"
                         >
                    <strong>{component.id}</strong>
                    </Link>
                  </td>

                  <td>
                    {component.lot}
                  </td>

                  <td>
                    {component.value0h} µA
                  </td>

                  <td>
                    {component.value24h} µA
                  </td>

                  <td>
                    {component.value96h} µA
                  </td>

                  <td>
                    {component.value168h} µA
                  </td>

                  <td>
                    {component.anomalyScore}
                  </td>

                  <td>

                    {component.status === "Anomaly" ? (

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


              {/* No result */}

              {filteredComponents.length === 0 && (

                <tr>

                  <td
                    colSpan="8"
                    className="no-results"
                  >
                    No components found.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Components;