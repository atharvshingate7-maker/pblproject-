import os
import sys
import importlib
import logging
from typing import Dict, Any, Optional
from app.analysis.mock_engine import default_cyber_analyzer

logger = logging.getLogger("cyberintel.analysis.adapter")


class AnalysisAdapter:
    """
    Adapter layer that integrates external user-provided Python analysis modules
    without rewriting or altering their internal business logic.
    """

    def __init__(self, custom_module_name: Optional[str] = None):
        self.custom_module_name = custom_module_name or os.getenv("CUSTOM_ANALYSIS_MODULE", "user_analysis")
        self._custom_module = None
        self._load_custom_module()

    def _load_custom_module(self):
        """Attempts to discover and load user's existing Python modules."""
        try:
            # Check if user placed a module in app/analysis/ or root
            if importlib.util.find_spec(self.custom_module_name):
                self._custom_module = importlib.import_module(self.custom_module_name)
                logger.info(f"Successfully hooked custom analysis module: {self.custom_module_name}")
            else:
                logger.info(f"No custom module '{self.custom_module_name}' found. Using built-in engine.")
        except Exception as e:
            logger.warning(f"Could not load custom module '{self.custom_module_name}': {e}. Using default analyzer.")

    def run_analysis(self, file_path: str, filename: str, content_type: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes analysis on the target file.
        Dispatches to user module if available, otherwise runs the default forensic analyzer.
        """
        # If user module is present and defines a standard entry point (e.g. analyze, process, run)
        if self._custom_module:
            entry_points = ["analyze", "process", "run_analysis", "analyze_file"]
            for fn_name in entry_points:
                if hasattr(self._custom_module, fn_name):
                    try:
                        logger.info(f"Calling user function {self.custom_module_name}.{fn_name}()")
                        fn = getattr(self._custom_module, fn_name)
                        # Call user logic as-is
                        raw_result = fn(file_path)
                        return self._normalize_user_output(raw_result, filename, content_type)
                    except Exception as err:
                        logger.error(f"Error in user analysis module {fn_name}: {err}. Falling back to default.")
                        break

        # Fallback to built-in forensic analyzer
        return default_cyber_analyzer(file_path, filename, content_type)

    def _normalize_user_output(self, user_output: Any, filename: str, content_type: str) -> Dict[str, Any]:
        """
        Normalizes arbitrary user Python module output into standard Pydantic schema format.
        """
        if isinstance(user_output, dict):
            threat_score = user_output.get("threat_score") or user_output.get("score") or 50
            verdict = user_output.get("verdict") or ("malicious" if threat_score >= 70 else "clean")
            summary = user_output.get("summary") or user_output.get("description") or "Analysis completed by user module."
            indicators = user_output.get("indicators") or []
            mitre_tactics = user_output.get("mitre_tactics") or user_output.get("tactics") or []
            return {
                "threat_score": int(threat_score),
                "verdict": str(verdict).lower(),
                "summary": str(summary),
                "indicators": indicators if isinstance(indicators, list) else [],
                "mitre_tactics": mitre_tactics if isinstance(mitre_tactics, list) else [],
                "raw_output": user_output
            }
        else:
            return {
                "threat_score": 50,
                "verdict": "suspicious",
                "summary": str(user_output),
                "indicators": [],
                "mitre_tactics": [],
                "raw_output": {"result": str(user_output)}
            }


# Singleton adapter instance
analysis_adapter = AnalysisAdapter()
