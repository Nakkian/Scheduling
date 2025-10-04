# app/services/strategies.py
from __future__ import annotations
from dataclasses import dataclass
from typing import List, Protocol, Optional

# --- domain types (keep these lightweight) ---
@dataclass
class Slot:
    dept: str            # "ABOVE" | "BELOW"
    job_code: str
    start_time: str
    end_time: str
    count: int

@dataclass
class Emp:
    id: int
    name: str
    job_code: str
    dept: Optional[str]
    subsection: Optional[str]
    specific_job: Optional[str]

@dataclass
class Assignment:
    employee_id: int
    name: str
    job_code: str
    specific_job: Optional[str]
    start_time: str
    end_time: str

# --- strategy protocol ---
class Strategy(Protocol):
    def rank_pool(self, slot: Slot, pool: List[Emp]) -> List[Emp]:
        """Return pool ordered by preference for this slot."""
        ...

# --- concrete strategies ---
class AboveWingStrategy:
    """Example: prefer exact specific_job match, then alphabetical."""
    def rank_pool(self, slot: Slot, pool: List[Emp]) -> List[Emp]:
        jc = slot.job_code.upper()
        def score(e: Emp):
            # exact job code first, then those with specific_job set
            exact = int(jc in (e.job_code or "").upper())
            has_spec = int(bool(e.specific_job))
            return (-exact, -has_spec, e.name.lower())
        return sorted(pool, key=score)

class BelowWingStrategy:
    """Example: ramp/load bias; prefer workers without a current specific_job to spread variety."""
    def rank_pool(self, slot: Slot, pool: List[Emp]) -> List[Emp]:
        jc = slot.job_code.upper()
        def score(e: Emp):
            exact = int(jc in (e.job_code or "").upper())
            has_spec = int(bool(e.specific_job))
            # prefer exact; *then* those WITHOUT specific_job (invert has_spec)
            return (-exact, has_spec, e.name.lower())
        return sorted(pool, key=score)

# --- dispatcher ---
def choose_strategy(slot: Slot) -> Strategy:
    if slot.dept == "ABOVE":
        return AboveWingStrategy()
    if slot.dept == "BELOW":
        return BelowWingStrategy()
    # default fallback
    return AboveWingStrategy()
