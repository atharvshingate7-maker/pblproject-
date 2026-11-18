import os
import hashlib
import json
import re
from typing import Dict, Any, List


def calculate_entropy(data: bytes) -> float:
    """Calculates Shannon entropy of raw file bytes."""
    import math
    if not data:
        return 0.0
    entropy = 0.0
    for x in range(256):
        p_x = float(data.count(bytes([x]))) / len(data)
        if p_x > 0:
            entropy += - p_x * math.log(p_x, 2)
    return round(entropy, 3)


def default_cyber_analyzer(file_path: str, filename: str, content_type: str) -> Dict[str, Any]:
    """
    Default forensic analysis engine analyzing file structure, entropy, IOC signatures,
    and metadata heuristics. Replaced or augmented by user-provided Python modules.
    """
    if not os.path.exists(file_path):
        return {
            "threat_score": 0,
            "verdict": "inconclusive",
            "summary": f"File not found on disk: {file_path}",
            "indicators": [],
            "mitre_tactics": [],
            "raw_output": {"error": "file_not_found"}
        }

    file_size = os.path.getsize(file_path)
    with open(file_path, "rb") as f:
        content = f.read(min(file_size, 1024 * 1024 * 10))  # read up to 10MB for inspection

    entropy = calculate_entropy(content)
    sha256 = hashlib.sha256(content).hexdigest()

    indicators: List[Dict[str, Any]] = []
    tactics: List[str] = []
    threat_score = 15

    # 1. Entropy analysis (High entropy > 7.2 usually indicates encrypted payload / ransomware / packer)
    if entropy > 7.2:
        threat_score += 35
        tactics.append("Defense Evasion (T1027)")
        indicators.append({
            "type": "high_entropy",
            "value": f"{entropy} bits/byte",
            "severity": "high",
            "description": "High Shannon entropy indicates packed, obfuscated, or encrypted payload binary."
        })

    # 2. String heuristics (Extract ASCII & UTF-8 strings)
    try:
        text = content.decode("utf-8", errors="ignore")
    except Exception:
        text = ""

    # Check for suspicious C2 patterns or PowerShell / bash injections
    suspicious_keywords = [
        (r"(powershell\.exe\s+-enc|cmd\.exe\s+/c)", "Execution (T1059)", "Encoded PowerShell / CMD execution sequence found", 40),
        (r"(https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})", "Command and Control (T1071)", "Direct raw IP connection string found", 25),
        (r"(mimikatz|sekurlsa|lsass\.dmp)", "Credential Access (T1003)", "Credential dumping signature string identified", 50),
        (r"(\.onion|api\.telegram\.org/bot)", "Exfiltration (T1048)", "Anonymous egress or Telegram C2 beacon pattern", 30),
    ]

    for pattern, tactic, desc, weight in suspicious_keywords:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            threat_score += weight
            if tactic not in tactics:
                tactics.append(tactic)
            indicators.append({
                "type": "string_signature",
                "value": match.group(0)[:60],
                "severity": "high" if weight >= 30 else "medium",
                "description": desc
            })

    threat_score = min(100, threat_score)

    # Determine verdict
    if threat_score >= 75:
        verdict = "malicious"
        summary = f"Critical threat indicators verified. High-confidence malicious artifact identified ({threat_score}/100)."
    elif threat_score >= 40:
        verdict = "suspicious"
        summary = f"Anomalous telemetry detected. Suspicious indicators require secondary sandbox detonation ({threat_score}/100)."
    else:
        verdict = "clean"
        summary = f"Baseline forensic telemetry clean. No high-risk signatures or heuristic anomalies detected ({threat_score}/100)."

    return {
        "threat_score": threat_score,
        "verdict": verdict,
        "summary": summary,
        "indicators": indicators,
        "mitre_tactics": tactics or ["Reconnaissance (T1595)"],
        "raw_output": {
            "entropy": entropy,
            "sha256": sha256,
            "analyzed_bytes": len(content),
            "file_size": file_size,
            "filename": filename,
            "content_type": content_type
        }
    }
