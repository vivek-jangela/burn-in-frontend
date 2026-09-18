import numpy as np
import pandas as pd


PARAMETERS = [
    "iddq_uA",
    "leakage_uA",
    "prop_delay_ns",
]


def detect_outliers(
    df: pd.DataFrame,
    threshold: float = 3.0
) -> pd.DataFrame:
    """
    Module A:
    Detect statistical outliers using lot-wise,
    timestamp-wise median and MAD.

    Returns the original dataframe with:
    - anomaly_score
    - flagged
    - reason
    """

    required_columns = [
        "lot_id",
        "timestamp_h",
        *PARAMETERS,
    ]

    missing = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing:
        raise ValueError(
            f"Module A missing required columns: {missing}"
        )

    result = df.copy()

    # --------------------------------------------------
    # 1. Median
    # --------------------------------------------------

    medians = (
        result
        .groupby(["lot_id", "timestamp_h"])[PARAMETERS]
        .median()
        .reset_index()
    )

    medians = medians.rename(
        columns={
            p: f"{p}_median"
            for p in PARAMETERS
        }
    )

    # --------------------------------------------------
    # 2. MAD
    # --------------------------------------------------

    mads = (
        result
        .groupby(["lot_id", "timestamp_h"])[PARAMETERS]
        .agg(
            lambda x:
            (x - x.median()).abs().median()
        )
        .reset_index()
    )

    mads = mads.rename(
        columns={
            p: f"{p}_mad"
            for p in PARAMETERS
        }
    )

    # --------------------------------------------------
    # 3. Merge statistics
    # --------------------------------------------------

    result = result.merge(
        medians,
        on=["lot_id", "timestamp_h"],
        how="left",
    )

    result = result.merge(
        mads,
        on=["lot_id", "timestamp_h"],
        how="left",
    )

    # --------------------------------------------------
    # 4. MAD z-score
    # --------------------------------------------------

    z_columns = []

    for parameter in PARAMETERS:

        z_column = f"{parameter}_z"

        result[z_column] = (
            (
                result[parameter]
                - result[f"{parameter}_median"]
            ).abs()
            /
            result[f"{parameter}_mad"]
            .replace(0, np.nan)
        )

        z_columns.append(z_column)

    # --------------------------------------------------
    # 5. Continuous anomaly score
    # --------------------------------------------------

    result["anomaly_score"] = (
        result[z_columns]
        .max(axis=1)
        .fillna(0)
    )

    # --------------------------------------------------
    # 6. Flag
    # --------------------------------------------------

    result["flagged"] = (
        result["anomaly_score"] > threshold
    )

    # --------------------------------------------------
    # 7. Explainable reason
    # --------------------------------------------------

    mapping = {
        "iddq_uA_z": (
            "IDDQ",
            "iddq_uA",
            "iddq_uA_median",
            "µA",
        ),
        "leakage_uA_z": (
            "Leakage",
            "leakage_uA",
            "leakage_uA_median",
            "µA",
        ),
        "prop_delay_ns_z": (
            "Prop Delay",
            "prop_delay_ns",
            "prop_delay_ns_median",
            "ns",
        ),
    }

    def make_reason(row):

        if not row["flagged"]:
            return "No significant anomaly detected"

        highest_z = max(
            z_columns,
            key=lambda column: (
                row[column]
                if pd.notna(row[column])
                else -np.inf
            )
        )

        name, value_col, median_col, unit = (
            mapping[highest_z]
        )

        return (
            f"{name} "
            f"{row[value_col]:.2f}{unit} "
            f"vs lot median "
            f"{row[median_col]:.2f}{unit} "
            f"({row[highest_z]:.2f} MAD)"
        )

    result["reason"] = result.apply(
        make_reason,
        axis=1,
    )

    return result