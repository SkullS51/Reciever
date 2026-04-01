import time
from locust import HttpUser, task, between

class SentryStressTest(HttpUser):
    # Mimic the 7 Robotics heartrate (random wait between 0.1 and 0.5 seconds)
    wait_time = between(0.1, 0.5)

    @task
    def send_telemetry(self):
        # The payload represents the Merlin math packet we audited
        payload = {
            "node_id": "7R_UNIT_DELTA_6",
            "imu_drift": 0.0015,
            "torque_baseline": 42.7,
            "status": "SOVEREIGN"
        }
        
        # Point this to your Vercel/GCP endpoint
        with self.client.post("/api/ingest", json=payload, catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                # This catches our "Forbidden" or "Position 175" anomalies
                response.failure(f"Sentry Breach Detected: {response.status_code}")

    @task(3)  # This runs 3x more often to simulate a "Torque Spike"
    def simulate_spike(self):
        spike_payload = {"trigger": "DRAGON_DENIAL", "torque_spike": 900.5}
        self.client.post("/api/ingest", json=spike_payload)
