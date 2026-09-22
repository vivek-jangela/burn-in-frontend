from io import BytesIO

import numpy as np
import pandas as pd

from fastapi import (
    FastAPI,
    File,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware

from module_a import detect_outliers
from module_b import predict_drift


app = FastAPI(
    title="DriftGuard Backend",
    version="1.0.0",
    description=(
        "FastAPI backend for SIH PS 26170 "
        "component burn-in anomaly detection."
    ),
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
         "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://vivek-jangela.github.io",
        # "http://localhost:5173",
        # "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Health check
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "status": "running",
        "service": "DriftGuard Backend",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }


# --------------------------------------------------
# Helper: clean NumPy/Pandas values
# --------------------------------------------------

def clean_value(value):

    if pd.isna(value):
        return None

    if isinstance(
        value,
        (
            np.integer,
            np.floating,
        ),
    ):
        return value.item()

    if isinstance(value, np.bool_):
        return bool(value)

    return value


# --------------------------------------------------
# Helper: build raw_values
# --------------------------------------------------

def build_raw_values(component_df):

    raw_values = {
        "iddq": {},
        "leakage": {},
        "prop_delay": {},
    }

    parameter_columns = {
        "iddq": "iddq_uA",
        "leakage": "leakage_uA",
        "prop_delay": "prop_delay_ns",
    }

    for _, row in component_df.iterrows():

        timestamp = int(row["timestamp_h"])
        timestamp_key = f"{timestamp}h"

        for parameter, column in parameter_columns.items():

            raw_values[parameter][
                timestamp_key
            ] = clean_value(row[column])

    return raw_values


# --------------------------------------------------
# Helper: Module A component-level aggregation
# --------------------------------------------------

def build_module_a_result(component_df):

    # Module A runs per measurement row.
    # The component gets the highest anomaly score.
    highest_index = (
        component_df["anomaly_score"]
        .fillna(0)
        .idxmax()
    )

    highest_row = component_df.loc[
        highest_index
    ]

    return {
        "anomaly_score": float(
            highest_row["anomaly_score"]
        ),
        "flagged": bool(
            component_df["flagged"].any()
        ),
        "method": "zscore",
        "reason": str(
            highest_row["reason"]
        ),
    }


# --------------------------------------------------
# Helper: Module B component result
# --------------------------------------------------

def build_module_b_result(row):

    drift_info = {
        "iddq": {
            "predicted_168h": float(
                row["iddq_predicted_168h"]
            ),
            "predicted_drift_rate": float(
                row["iddq_predicted_drift_rate"]
            ),
            "safety_slope": float(
                row["iddq_safety_slope"]
            ),
            "drift_ratio": float(
                row["iddq_drift_ratio"]
            ),
            "flagged": bool(
                row["iddq_flagged"]
            ),
        },

        "leakage": {
            "predicted_168h": float(
                row["leakage_predicted_168h"]
            ),
            "predicted_drift_rate": float(
                row["leakage_predicted_drift_rate"]
            ),
            "safety_slope": float(
                row["leakage_safety_slope"]
            ),
            "drift_ratio": float(
                row["leakage_drift_ratio"]
            ),
            "flagged": bool(
                row["leakage_flagged"]
            ),
        },

        "prop_delay": {
            "predicted_168h": float(
                row["prop_delay_predicted_168h"]
            ),
            "predicted_drift_rate": float(
                row["prop_delay_predicted_drift_rate"]
            ),
            "safety_slope": float(
                row["prop_delay_safety_slope"]
            ),
            "drift_ratio": float(
                row["prop_delay_drift_ratio"]
            ),
            "flagged": bool(
                row["prop_delay_flagged"]
            ),
        },
    }

    # Use the parameter with the highest
    # normalized drift ratio as the headline.
    highest_parameter = max(
        drift_info,
        key=lambda parameter:
        drift_info[parameter]["drift_ratio"],
    )

    headline = drift_info[
        highest_parameter
    ]

    return {
        "predicted_168h": {
            "iddq": drift_info[
                "iddq"
            ]["predicted_168h"],

            "leakage": drift_info[
                "leakage"
            ]["predicted_168h"],

            "prop_delay": drift_info[
                "prop_delay"
            ]["predicted_168h"],
        },

        "predicted_drift_rate": headline[
            "predicted_drift_rate"
        ],

        "safety_slope": headline[
            "safety_slope"
        ],

        "flagged": bool(
            row["flagged"]
        ),

        "reason": str(
            row["reason"]
        ),

        "drift_by_parameter": drift_info,

        "flagged_parameters": list(
            row["flagged_parameters"]
        ),
    }


# --------------------------------------------------
# Main API endpoint
# --------------------------------------------------

@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...)
):
    """
    Receive CSV → Module A + Module B
    → final component-level JSON.
    """

    # --------------------------------------------------
    # 1. Validate file
    # --------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file provided.",
        )

    if not file.filename.lower().endswith(
        ".csv"
    ):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported.",
        )

    # --------------------------------------------------
    # 2. Read CSV
    # --------------------------------------------------

    try:

        contents = await file.read()

        df = pd.read_csv(
            BytesIO(contents)
        )

    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=f"Could not read CSV: {exc}",
        )

    # --------------------------------------------------
    # 3. Validate input schema
    # --------------------------------------------------

    required_columns = [
        "component_id",
        "lot_id",
        "timestamp_h",
        "iddq_uA",
        "leakage_uA",
        "prop_delay_ns",
    ]

    missing = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing:

        raise HTTPException(
            status_code=400,
            detail={
                "message": "CSV is missing required columns.",
                "missing_columns": missing,
            },
        )

    # --------------------------------------------------
    # 4. Validate timestamps
    # --------------------------------------------------

    available_timestamps = set(
        pd.to_numeric(
            df["timestamp_h"],
            errors="coerce",
        )
        .dropna()
        .astype(int)
        .tolist()
    )

    required_for_module_b = {
        0,
        24,
    }

    missing_timestamps = (
        required_for_module_b
        - available_timestamps
    )

    if missing_timestamps:

        raise HTTPException(
            status_code=400,
            detail={
                "message": (
                    "Module B requires 0h and 24h "
                    "measurements."
                ),
                "missing_timestamps": [
                    f"{x}h"
                    for x in sorted(
                        missing_timestamps
                    )
                ],
            },
        )

    # --------------------------------------------------
    # 5. Run Module A
    # --------------------------------------------------

    try:

        module_a_df = detect_outliers(df)

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Module A failed: {exc}",
        )

    # --------------------------------------------------
    # 6. Run Module B
    # --------------------------------------------------

    try:

        module_b_df = predict_drift(df)

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Module B failed: {exc}",
        )

    # --------------------------------------------------
    # 7. Build final component response
    # --------------------------------------------------

    results = []

    component_ids = (
        df["component_id"]
        .drop_duplicates()
        .tolist()
    )

    for component_id in component_ids:

        component_df = module_a_df[
            module_a_df["component_id"]
            == component_id
        ].copy()

        if component_df.empty:
            continue

        lot_id = str(
            component_df.iloc[0]["lot_id"]
        )

        module_b_rows = module_b_df[
            module_b_df["component_id"]
            == component_id
        ]

        if module_b_rows.empty:
            continue

        module_b_row = (
            module_b_rows.iloc[0]
        )

        module_a_result = (
            build_module_a_result(
                component_df
            )
        )

        module_b_result = (
            build_module_b_result(
                module_b_row
            )
        )

        final_flagged = (
            module_a_result["flagged"]
            or module_b_result["flagged"]
        )

        final_verdict = (
            "REJECT"
            if final_flagged
            else "PASS"
        )

        if (
            module_a_result["flagged"]
            and module_b_result["flagged"]
        ):

            explanation = (
                "Flagged by both modules: "
                "statistical outlier and "
                "predicted unsafe drift."
            )

        elif module_a_result["flagged"]:

            explanation = (
                "Flagged by Module A due to "
                "a statistical anomaly."
            )

        elif module_b_result["flagged"]:

            explanation = (
                "Flagged by Module B due to "
                "predicted drift exceeding "
                "the global safety slope."
            )

        else:

            explanation = (
                "No significant statistical "
                "anomaly or unsafe predicted "
                "drift detected."
            )

        results.append({
            "component_id": str(
                component_id
            ),

            "lot_id": lot_id,

            "timestamps_available": [
                f"{int(x)}h"
                for x in sorted(
                    component_df[
                        "timestamp_h"
                    ].unique()
                )
            ],

            "raw_values": build_raw_values(
                component_df
            ),

            "module_a": module_a_result,

            "module_b": module_b_result,

            "final_verdict": final_verdict,

            "explanation": explanation,
        })

    return results
