import { useState } from "react";

function DataUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    setMessage("");
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setSelectedFile(null);
      setError("Please select a CSV file.");
      return;
    }

    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a CSV file first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // --------------------------------------------------
      // 1. Read and save the uploaded CSV
      // --------------------------------------------------

      const csvText = await selectedFile.text();

      localStorage.setItem(
        "burnInUploadedCSV",
        csvText
      );

      localStorage.setItem(
        "burnInUploadedFileName",
        selectedFile.name
      );

      // --------------------------------------------------
      // 2. Send CSV to FastAPI
      // --------------------------------------------------

      const formData = new FormData();

      formData.append("file", selectedFile);

      const response = await fetch(
        "http://localhost:8000/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      // --------------------------------------------------
      // 3. Handle backend errors
      // --------------------------------------------------

      if (!response.ok) {
        let errorMessage = `Server returned ${response.status}`;

        try {
          const errorData = await response.json();

          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Keep the default error message
        }

        throw new Error(errorMessage);
      }

      // --------------------------------------------------
      // 4. Read backend analysis result
      // --------------------------------------------------

      const result = await response.json();

      // --------------------------------------------------
      // 5. Save analysis result for other React pages
      // --------------------------------------------------

      localStorage.setItem(
        "burnInAnalysisResults",
        JSON.stringify(result)
      );

      // --------------------------------------------------
      // 6. Show success message
      // --------------------------------------------------

      setMessage(
        "CSV analyzed successfully. Results are ready."
      );

      console.log("Analysis result:", result);

    } catch (err) {
      console.error("Analysis error:", err);

      setError(
        err.message ||
          "Could not connect to the FastAPI server. Make sure the backend is running on localhost:8000."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-upload-page">

      {/* PAGE HEADER */}

      <div className="page-heading">

        <h2>Data Upload</h2>

        <p>
          Upload Burn-In screening data for anomaly
          detection and drift prediction.
        </p>

      </div>


      {/* UPLOAD CARD */}

      <div className="upload-card">

        <div className="upload-card-header">

          <h3>Upload Screening Dataset</h3>

          <p>
            Select a CSV file containing component
            Burn-In time-series data.
          </p>

        </div>


        {/* FILE SELECTOR */}

        <div className="file-upload-area">

          <label htmlFor="csv-file">
            Choose CSV File
          </label>

          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
          />

        </div>


        {/* SELECTED FILE */}

        {selectedFile && (

          <div className="selected-file">

            <div>

              <span className="file-icon">
                📄
              </span>

              <div>

                <strong>
                  {selectedFile.name}
                </strong>

                <p>
                  {(selectedFile.size / 1024).toFixed(1)}
                  {" "}KB
                </p>

              </div>

            </div>

          </div>

        )}


        {/* ANALYZE BUTTON */}

        <button
          className="analyze-button"
          onClick={handleAnalyze}
          disabled={!selectedFile || loading}
        >

          {loading
            ? "Analyzing..."
            : "Analyze Dataset"}

        </button>


        {/* SUCCESS MESSAGE */}

        {message && (

          <div className="upload-message success">
            ✓ {message}
          </div>

        )}


        {/* ERROR MESSAGE */}

        {error && (

          <div className="upload-message error">
            ✕ {error}
          </div>

        )}

      </div>


      {/* PIPELINE INFORMATION */}

      <div className="upload-card">

        <div className="upload-card-header">

          <h3>Analysis Pipeline</h3>

          <p>
            The uploaded dataset is processed by both
            screening modules.
          </p>

        </div>


        <div className="pipeline">

          <div className="pipeline-step">

            <span>1</span>

            <div>

              <strong>CSV Upload</strong>

              <p>
                Component Burn-In measurements
              </p>

            </div>

          </div>


          <div className="pipeline-arrow">
            →
          </div>


          <div className="pipeline-step">

            <span>2</span>

            <div>

              <strong>Module A</strong>

              <p>
                Median/MAD anomaly detection
              </p>

            </div>

          </div>


          <div className="pipeline-arrow">
            →
          </div>


          <div className="pipeline-step">

            <span>3</span>

            <div>

              <strong>Module B</strong>

              <p>
                168h drift prediction
              </p>

            </div>

          </div>


          <div className="pipeline-arrow">
            →
          </div>


          <div className="pipeline-step">

            <span>4</span>

            <div>

              <strong>Dashboard</strong>

              <p>
                Results and explanations
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DataUpload;
