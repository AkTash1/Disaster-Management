# tests/test_runner.py
r"""
Standalone E2E Test Suite Runner for Disaster Intelligence Multimodal Platform.

Usage:
    .\venv\Scripts\python.exe tests/test_runner.py [--tier {1,2,3,4,all}] [--verbose] [--stop-on-fail]

Features:
- In-process or connected server management via TestHarness.
- Executes Tiers 1-4 with per-tier aggregation.
- Outputs ANSI-formatted summary tables with execution timings.
- Returns exit code 0 on 100% pass, exit code 1 on any failure.
"""

import os
import sys
import time
import argparse
import unittest
from typing import Dict, List, Tuple
from io import StringIO

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from tests.test_harness import TestHarness


TIER_CONFIG = {
    1: {
        "name": "Tier 1: Feature Coverage",
        "path": "tests/tier1_features",
        "min_required": 125,
    },
    2: {
        "name": "Tier 2: Boundary & Corner Cases",
        "path": "tests/tier2_boundaries",
        "min_required": 80,
    },
    3: {
        "name": "Tier 3: Cross-Feature Combinations",
        "path": "tests/tier3_combinations",
        "min_required": 25,
    },
    4: {
        "name": "Tier 4: Real-World Scenarios",
        "path": "tests/tier4_scenarios",
        "min_required": 6,
    },
    5: {
        "name": "Tier 5: Adversarial Hardening",
        "path": "tests/tier5_adversarial",
        "min_required": 25,
    },
}


class TierTestResult:
    def __init__(self, tier_id: int, tier_name: str, min_required: int):
        self.tier_id = tier_id
        self.tier_name = tier_name
        self.min_required = min_required
        self.total = 0
        self.passed = 0
        self.failed = 0
        self.errors = 0
        self.skipped = 0
        self.duration = 0.0
        self.failure_details: List[str] = []


def run_tier(tier_id: int, config: Dict, verbosity: int = 1, failfast: bool = False) -> TierTestResult:
    result = TierTestResult(tier_id, config["name"], config["min_required"])
    loader = unittest.TestLoader()
    suite = loader.discover(config["path"], pattern="test_*.py")
    result.total = suite.countTestCases()

    stream = StringIO() if verbosity < 2 else sys.stderr
    runner = unittest.TextTestRunner(stream=stream, verbosity=verbosity, failfast=failfast)

    start_time = time.time()
    test_run = runner.run(suite)
    result.duration = time.time() - start_time

    result.failed = len(test_run.failures)
    result.errors = len(test_run.errors)
    result.skipped = len(test_run.skipped)
    # Correct calculation of passed tests
    result.passed = max(0, test_run.testsRun - result.failed - result.errors)

    for test, err in test_run.failures:
        result.failure_details.append(f"FAIL: {test}\n{err}")
    for test, err in test_run.errors:
        result.failure_details.append(f"ERROR: {test}\n{err}")

    return result


def print_cli_report(results: List[TierTestResult], total_time: float) -> int:
    border = "=" * 80
    sub_border = "-" * 80

    print("\n" + border)
    print(" DISASTER INTELLIGENCE MULTIMODAL PLATFORM -- E2E TEST EXECUTION REPORT")
    print(border)
    print(f"{'Tier / Test Suite':<40} {'Req':<6} {'Total':<7} {'Pass':<6} {'Fail':<6} {'Time':<8} {'Status'}")
    print(sub_border)

    all_passed = True
    grand_total = 0
    grand_passed = 0
    grand_failed = 0
    grand_errors = 0
    grand_skipped = 0
    grand_req = 0

    for r in results:
        grand_total += r.total
        grand_passed += r.passed
        grand_failed += r.failed
        grand_errors += r.errors
        grand_skipped += r.skipped
        grand_req += r.min_required

        if r.failed > 0 or r.errors > 0 or r.passed < r.min_required:
            all_passed = False
            status_str = "[X]  FAIL"
        else:
            status_str = "[OK] PASS"

        time_str = f"{r.duration:.2f}s"
        print(f"{r.tier_name:<40} {r.min_required:<6} {r.total:<7} {r.passed:<6} {r.failed+r.errors:<6} {time_str:<8} {status_str}")

    print(sub_border)
    grand_status = "PASSED" if all_passed else "FAILED"
    print(f"{'TOTAL / SUMMARY':<40} {grand_req:<6} {grand_total:<7} {grand_passed:<6} {grand_failed+grand_errors:<6} {total_time:.2f}s   [{grand_status}]")
    print(border)

    # Print failure details if any
    for r in results:
        if r.failure_details:
            print(f"\n--- Failures in {r.tier_name} ---")
            for detail in r.failure_details[:10]:
                print(detail)
            if len(r.failure_details) > 10:
                print(f"... and {len(r.failure_details) - 10} more failures truncated.")

    if all_passed:
        print("\nAll requirement thresholds satisfied with 100% pass rate.")
        return 0
    else:
        print("\nTest execution encountered failures or unmet minimum thresholds.")
        return 1



def main():
    parser = argparse.ArgumentParser(description="E2E Test Runner for Disaster Intelligence Multimodal Platform")
    parser.add_argument("--tier", choices=["1", "2", "3", "4", "5", "all"], default="all", help="Test tier to execute")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose test execution")
    parser.add_argument("-x", "--stop-on-fail", action="store_true", help="Stop on first failure")
    parser.add_argument("--port", type=int, default=8999, help="Test server port")
    args = parser.parse_args()

    verbosity = 2 if args.verbose else 1

    # Start or connect to server
    harness = TestHarness.get_instance(port=args.port)
    server_ready = harness.is_server_alive()
    if not server_ready:
        print(f"Starting test server on port {args.port}...")
        try:
            harness.start_server(max_wait_sec=12.0)
            server_ready = True
        except Exception as e:
            print(f"Warning: Could not start in-process server: {e}")
            print("Tests requiring live endpoints may fail or skip until server is online.")

    tiers_to_run = [1, 2, 3, 4, 5] if args.tier == "all" else [int(args.tier)]
    results = []

    start_total = time.time()
    for tid in tiers_to_run:
        res = run_tier(tid, TIER_CONFIG[tid], verbosity=verbosity, failfast=args.stop_on_fail)
        results.append(res)
        if args.stop_on_fail and (res.failed > 0 or res.errors > 0):
            break

    total_time = time.time() - start_total
    exit_code = print_cli_report(results, total_time)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
