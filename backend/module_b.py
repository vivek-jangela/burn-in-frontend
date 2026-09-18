from pathlib import Path

import joblib
import numpy as np
import pandas as pd


MODEL_PATH = (
    Path(__file__).resolve().parent
    / "models"
    / "driftguard_module_b.pkl"
)


# --------------------------------------------------
# Load trained Module B once
# --------------------------------------------------

MODULE_B = joblib.load(MODEL_PATH)


MODELS = MODULE_B["models"]
SAFETY_SLOPES = MODULE_B["safety_slopes"]
FEATURES = MODULE_B["features"]

PREDICTION_HORIZON = MODULE_B["prediction_horizon"]
REFERENCE_TIMESTAMP = MODULE_B["reference_timestamp"]


def _prepare_wide_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Convert the SIH long-format CSV into one row
    per component with 0h, 24h and 168h values.
    """

    required = [
        "component_id",
        "lot_id",
        "timestamp_h",
        "iddq_uA",
        "leakage_uA",
        "prop_delay_ns",
    ]

    missing = [
        column
        for column in required
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            f"Module B missing required columns: {missing}"
        )

    # Module B needs early measurements.
    available = df[
        df["timestamp_h"].isin([0, 24, 168])
    ].copy()

    wide = available.pivot_table(
        index=["component_id", "lot_id"],
        columns="timestamp_h",
        values=[
            "iddq_uA",
            "leakage_uA",
            "prop_delay_ns",
        ],
        aggfunc="first",
    )

    # Flatten MultiIndex columns.
    wide.columns = [
        f"{parameter}_{int(timestamp)}h"
        for parameter, timestamp
        in wide.columns
    ]

    wide = wide.reset_index()

    return wide


def _predict_parameter(
    wide_df: pd.DataFrame,
    parameter_key: str,
) -> pd.DataFrame:

    model = MODELS[parameter_key]
    safety_slope = SAFETY_SLOPES[parameter_key]

    feature_columns = FEATURES[parameter_key]

    # Ensure required early measurements exist.
    missing = [
        column
        for column in feature_columns
        if column not in wide_df.columns
    ]

    if missing:
        raise ValueError(
            f"Module B missing {parameter_key} features: "
            f"{missing}"
        )

    input_data = wide_df[feature_columns]

    if input_data.isnull().any().any():
        raise ValueError(
            f"Missing 0h/24h values for Module B "
            f"parameter: {parameter_key}"
        )

    predictions = model.predict(input_data)

    parameter_map = {
        "iddq": "iddq_uA",
        "leakage": "leakage_uA",
        "prop_delay": "prop_delay_ns",
    }

    base_parameter = parameter_map[parameter_key]

    value_24h_column = (
        f"{base_parameter}_24h"
    )

    actual_24h = wide_df[value_24h_column].to_numpy()

    # Exact notebook logic:
    # (predicted 168h - actual 24h) / 144
    drift_rate = (
        predictions - actual_24h
    ) / (
        PREDICTION_HORIZON
        - REFERENCE_TIMESTAMP
    )

    # Exact notebook decision:
    # predicted drift > safety slope
    flagged = drift_rate > safety_slope

    # Continuous risk ratio.
    if safety_slope == 0:
        drift_ratio = np.where(
            drift_rate > 0,
            np.inf,
            0,
        )
    else:
        drift_ratio = (
            drift_rate / safety_slope
        )

    return pd.DataFrame({
        "predicted_168h": predictions,
        "predicted_drift_rate": drift_rate,
        "safety_slope": safety_slope,
        "drift_ratio": drift_ratio,
        "flagged": flagged,
    })


def predict_drift(
    df: pd.DataFrame,
) -> pd.DataFrame:
    """
    Module B inference.

    Takes the raw SIH CSV dataframe and returns
    component-level drift prediction results.
    """

    wide = _prepare_wide_data(df)

    iddq = _predict_parameter(
        wide,
        "iddq",
    )

    leakage = _predict_parameter(
        wide,
        "leakage",
    )

    prop_delay = _predict_parameter(
        wide,
        "prop_delay",
    )

    results = wide[
        ["component_id", "lot_id"]
    ].copy()

    # --------------------------------------------------
    # IDDQ
    # --------------------------------------------------

    results["iddq_predicted_168h"] = (
        iddq["predicted_168h"]
    )

    results["iddq_predicted_drift_rate"] = (
        iddq["predicted_drift_rate"]
    )

    results["iddq_safety_slope"] = (
        iddq["safety_slope"]
    )

    results["iddq_drift_ratio"] = (
        iddq["drift_ratio"]
    )

    results["iddq_flagged"] = (
        iddq["flagged"]
    )

    # --------------------------------------------------
    # Leakage
    # --------------------------------------------------

    results["leakage_predicted_168h"] = (
        leakage["predicted_168h"]
    )

    results["leakage_predicted_drift_rate"] = (
        leakage["predicted_drift_rate"]
    )

    results["leakage_safety_slope"] = (
        leakage["safety_slope"]
    )

    results["leakage_drift_ratio"] = (
        leakage["drift_ratio"]
    )

    results["leakage_flagged"] = (
        leakage["flagged"]
    )

    # --------------------------------------------------
    # Propagation delay
    # --------------------------------------------------

    results["prop_delay_predicted_168h"] = (
        prop_delay["predicted_168h"]
    )

    results["prop_delay_predicted_drift_rate"] = (
        prop_delay["predicted_drift_rate"]
    )

    results["prop_delay_safety_slope"] = (
        prop_delay["safety_slope"]
    )

    results["prop_delay_drift_ratio"] = (
        prop_delay["drift_ratio"]
    )

    results["prop_delay_flagged"] = (
        prop_delay["flagged"]
    )

    # --------------------------------------------------
    # Final Module B decision
    # --------------------------------------------------

    flag_columns = [
        "iddq_flagged",
        "leakage_flagged",
        "prop_delay_flagged",
    ]

    results["flagged"] = (
        results[flag_columns]
        .max(axis=1)
        .astype(bool)
    )

    # --------------------------------------------------
    # Flagged parameters
    # --------------------------------------------------

    def get_flagged_parameters(row):

        parameters = []

        if row["iddq_flagged"]:
            parameters.append("IDDQ")

        if row["leakage_flagged"]:
            parameters.append("Leakage")

        if row["prop_delay_flagged"]:
            parameters.append("Propagation Delay")

        return parameters

    results["flagged_parameters"] = (
        results.apply(
            get_flagged_parameters,
            axis=1,
        )
    )

    # --------------------------------------------------
    # Explanation
    # --------------------------------------------------

    def make_reason(row):

        messages = []

        if row["iddq_flagged"]:
            messages.append(
                f"IDDQ drift ratio = "
                f"{row['iddq_drift_ratio']:.2f}x "
                f"safety slope"
            )

        if row["leakage_flagged"]:
            messages.append(
                f"Leakage drift ratio = "
                f"{row['leakage_drift_ratio']:.2f}x "
                f"safety slope"
            )

        if row["prop_delay_flagged"]:
            messages.append(
                f"Propagation Delay drift ratio = "
                f"{row['prop_delay_drift_ratio']:.2f}x "
                f"safety slope"
            )

        if not messages:
            return (
                "Predicted drift remains within "
                "the global safety slope for all parameters."
            )

        return (
            "Predicted drift exceeds the global "
            "safety slope: "
            + "; ".join(messages)
        )

    results["reason"] = results.apply(
        make_reason,
        axis=1,
    )

    return results