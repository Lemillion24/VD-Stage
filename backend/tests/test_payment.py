from __future__ import annotations

import pytest

from src.services.check_out import _calculate_rate


class TestRateCalculation:
    @pytest.mark.parametrize(
        ("duration_minutes", "vehicle_type", "expected"),
        [
            (15, "sedan", 0.0),
            (60, "sedan", 550.0),
            (420, "sedan", 3000.0),
            (0, "sedan", 0.0),
            (10, "motorbike", 0.0),
            (60, "motorbike", 275.0),
            (60, "compact", 440.0),
            (60, "suv", 660.0),
            (60, "truck", 825.0),
        ],
    )
    def test_calculate(
        self,
        duration_minutes: int,
        vehicle_type: str,
        expected: float,
    ) -> None:
        result = _calculate_rate(duration_minutes, vehicle_type)
        assert result == expected, (
            f"Expected {expected} for {duration_minutes}min/{vehicle_type}, "
            f"got {result}"
        )
