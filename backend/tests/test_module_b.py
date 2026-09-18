import pandas as pd

from module_b import predict_drift


CSV_PATH = "data/SIH_Dataset_v1.0.csv"


def main():

    df = pd.read_csv(CSV_PATH)

    result = predict_drift(df)

    print("\nModule B successfully executed.\n")

    print(
        result[
            [
                "component_id",
                "lot_id",
                "iddq_predicted_168h",
                "leakage_predicted_168h",
                "prop_delay_predicted_168h",
                "flagged",
                "flagged_parameters",
                "reason",
            ]
        ].head(10)
    )


if __name__ == "__main__":
    main()