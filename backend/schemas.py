from typing import Dict, List

from pydantic import BaseModel


class ModuleAResult(BaseModel):
    anomaly_score: float
    flagged: bool
    method: str = "zscore"
    reason: str


class ModuleBResult(BaseModel):
    predicted_168h: Dict[str, float]
    predicted_drift_rate: float
    safety_slope: float
    flagged: bool
    reason: str

    # Extra information useful for the dashboard.
    drift_by_parameter: Dict[str, Dict[str, float | bool]]
    flagged_parameters: List[str]


class ComponentResult(BaseModel):
    component_id: str
    lot_id: str

    timestamps_available: List[str]

    raw_values: Dict[
        str,
        Dict[str, float]
    ]

    module_a: ModuleAResult
    module_b: ModuleBResult

    final_verdict: str
    explanation: str