import pandas as pd

from module_a import detect_outliers


CSV_PATH = "data/SIH_Dataset_v1.0.csv"


def main():

    df = pd.read_csv(CSV_PATH)

    result = detect_outliers(df)

    print("\nModule A successfully executed.\n")

    print(
        result[
            [
                "component_id",
                "lot_id",
                "timestamp_h",
                "anomaly_score",
                "flagged",
                "reason",
            ]
        ].head(20)
    )


if __name__ == "__main__":
    main()