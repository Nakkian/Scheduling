# app/services/scheduling.py
from typing import List, Tuple
from .employees import _EMP_DB  # swap with DB later
from .strategies import Slot, Emp, Assignment, choose_strategy
from ..schemas.schedule import AutoSlot, AutoScheduleRequest, AutoScheduleResult, AutoAssignment

def generate_auto(req: AutoScheduleRequest) -> AutoScheduleResult:
    # build employee objects
    emps: List[Emp] = [Emp(
        id=e.id, name=e.name, job_code=e.job_code,
        dept=e.dept, subsection=e.subsection, specific_job=e.specific_job
    ) for e in _EMP_DB.values()]

    # pool index by (dept, job_code) uppercased
    pools: dict[tuple[str, str], List[Emp]] = {}
    for e in emps:
        key = (str(e.dept or ""), (e.job_code or "").upper())
        pools.setdefault(key, []).append(e)

    assignments: List[AutoAssignment] = []
    unfilled: List[AutoSlot] = []

    for s in req.slots:
        slot = Slot(dept=s.dept, job_code=s.job_code, start_time=s.start_time, end_time=s.end_time, count=s.count)
        key = (slot.dept, slot.job_code.upper())
        pool = pools.get(key, []).copy()

        # rank with dept-specific strategy
        ranked = choose_strategy(slot).rank_pool(slot, pool)

        take = min(len(ranked), slot.count)
        for e in ranked[:take]:
            assignments.append(AutoAssignment(
                employee_id=e.id, name=e.name, job_code=e.job_code,
                specific_job=e.specific_job, start_time=slot.start_time, end_time=slot.end_time
            ))
            # remove from original pool so they aren't reused in same run
            pools[key].remove(next(x for x in pools[key] if x.id == e.id))

        if take < slot.count:
            unfilled.append(s)

    return AutoScheduleResult(assignments=assignments, unfilled_slots=unfilled)
