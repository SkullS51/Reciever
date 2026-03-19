from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import logging

app = FastAPI(title="Shepherd Protocol")

logging.basicConfig(level=logging.INFO, format="[SHEPHERD] %(levelname)s: %(message)s")

class ShepherdProtocol:
    def __init__(self, strict_mode=True):
        self.strict_mode = strict_mode
        self.flock = None
        self.anomalies = None

    def ingest(self, raw_data):
        logging.info("Ingesting raw data...")
        try:
            if isinstance(raw_data, str):
                raw_data = json.loads(raw_data)
            self.flock = pd.DataFrame(raw_data)
            logging.info(f"Ingested {len(self.flock)} records")
        except Exception as e:
            logging.error(f"Ingestion failed: {e}")
            raise

    def enforce_compliance(self, schema):
        if not schema:
            return
        missing = [col for col in schema if col not in self.flock.columns]
        if missing:
            raise ValueError(f"Missing columns: {missing}")

    def isolate_wolves(self):
        # Example anomaly rule - customize this!
        if 'velocity' in self.flock.columns:
            anomalies = self.flock[self.flock['velocity'] > 100]
            self.anomalies = anomalies
            self.flock = self.flock.drop(anomalies.index)
        logging.info(f"Isolated {len(self.anomalies) if self.anomalies is not None else 0} anomalies")

    def execute_shepherd_directive(self, raw_data, schema=None):
        self.ingest(raw_data)
        if schema:
            self.enforce_compliance(schema)
        self.isolate_wolves()
        return {
            "secured_flock": self.flock.to_dict(orient="records") if self.flock is not None else [],
            "quarantined_anomalies": self.anomalies.to_dict(orient="records") if self.anomalies is not None else [],
            "status": "SECURE"
        }

class DataPayload(BaseModel):
    raw_data: list[dict]
    target_schema: list[str] | None = None  # renamed

@app.post("/analyze")
async def analyze(payload: DataPayload):
    protocol = ShepherdProtocol(strict_mode=True)
    try:
        results = protocol.execute_shepherd_directive(payload.raw_data, payload.target_schema)
        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
