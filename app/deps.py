from fastapi import HTTPException

def missing_columns_error(missing: set[str]):
    raise HTTPException(status_code=422, detail={"missing_columns": sorted(missing)})