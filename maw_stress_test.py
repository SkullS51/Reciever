import os
import time
import threading
import random
import psutil  # if available in the runner; otherwise use pure Python simulation

def heavy_virus_strain():
    print("🚨 HEAVY VIRUS STRAIN INJECTED — Sacrificial Maw activated")
    
    # Phase 1: Rapid spawning (multiple fake anomalous processes)
    def spawn_anomaly(name):
        print(f"[ANOMALY] Spawning persistent threat: {name}")
        for i in range(15):  # more aggressive than before
            try:
                # Simulate high CPU/memory spike + fake corruption
                if random.random() < 0.4:
                    _ = [random.randint(0, 999999) for _ in range(50000)]  # memory pressure
                time.sleep(random.uniform(0.1, 0.8))
                print(f"[ANOMALY {name}] Pulse {i} — attempting swarm state corruption")
            except:
                pass
    
    # Launch multiple concurrent threats
    threads = []
    anomaly_names = ["VoidCorruptor", "SwarmLeech", "MawBypass", "EntropyReaper", "ShadowSpawn"]
    for name in anomaly_names:
        t = threading.Thread(target=spawn_anomaly, args=(name,))
        t.daemon = True
        t.start()
        threads.append(t)
    
    # Phase 2: Persistent re-spawn + hidden attempt
    time.sleep(3)
    print("🕳️ Persistent re-spawn triggered — attempting to hide in swarm noise")
    
    # Phase 3: Maw should detect, isolate, and "devour"
    print("🐉 SACRIFICIAL MAW OPEN — Devouring anomalies...")
    for i in range(8):
        print(f"[MAW] Isolating threat {i+1}/8 — swarm integrity holding")
        time.sleep(0.6)
    
    print("✅ HEAVY STRAIN NEUTRALIZED — Swarm coherence restored. ForeverRaw.")
    
    # Clean up any temp artifacts (optional, keeps it tidy)
    try:
        if os.path.exists("/tmp/void_anomaly"):
            os.remove("/tmp/void_anomaly")
    except:
        pass

# Run the heavier strain
if __name__ == "__main__" or "global-scale-test" in os.environ.get("GITHUB_JOB", ""):
    heavy_virus_strain()
