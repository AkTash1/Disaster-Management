# -*- coding: utf-8 -*-
"""
01_imd_rainfall.py
Downloads IMD gridded daily rainfall data (0.25 deg x 0.25 deg) using imdlib.
Covers 1901-2024. No API key needed for historical gridded data.

Usage:
    python 01_imd_rainfall.py --start 2015 --end 2023 --out ./data/imd/rain
"""
import sys
import io
import argparse
import os
import time

# Force UTF-8 output on Windows terminals
if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import imdlib as imd


def download_year_with_retry(var: str, year: int, out_dir: str, max_retries: int = 5, wait: int = 10) -> bool:
    """
    Download a single year with retry logic.
    Returns True on success, False if all retries exhausted.
    Skips if the file already exists (resume-friendly).
    """
    # imdlib saves files into a subfolder named after the variable:
    # e.g. out_dir/rain/2020.grd  (NOT out_dir/2020.grd)
    actual_dir = os.path.join(out_dir, var)
    out_file   = os.path.join(actual_dir, f"{year}.grd")
    if os.path.exists(out_file) and os.path.getsize(out_file) > 0:
        print(f"  [SKIP] {year}.grd already exists, skipping.")
        return True

    for attempt in range(1, max_retries + 1):
        try:
            print(f"  [{var}] Year {year} — attempt {attempt}/{max_retries} ...", flush=True)
            imd.get_data(
                var_type=var,
                start_yr=year,
                end_yr=year,
                fn_format="yearwise",
                file_dir=out_dir,
                sub_dir=False,
            )
            # Verify file was actually written
            if os.path.exists(out_file) and os.path.getsize(out_file) > 0:
                print(f"  [{var}] Year {year} — OK ({os.path.getsize(out_file) // 1024} KB)")
                return True
            else:
                print(f"  [{var}] Year {year} — file missing after download, retrying...")
        except Exception as e:
            print(f"  [{var}] Year {year} — error: {type(e).__name__}: {str(e)[:120]}")
            if attempt < max_retries:
                print(f"  Waiting {wait}s before retry ...")
                time.sleep(wait)

    print(f"  [{var}] Year {year} — FAILED after {max_retries} attempts. Skipping.")
    return False


def download_imd_variable(var: str, start_yr: int, end_yr: int, out_dir: str) -> list:
    """Download all years for a variable, one year at a time with retries."""
    os.makedirs(out_dir, exist_ok=True)
    years = list(range(start_yr, end_yr + 1))
    print(f"\n[IMD] Downloading '{var}' for {start_yr}-{end_yr} -> {out_dir}")
    print(f"[IMD] {len(years)} year(s) to download.\n")

    failed = []
    for yr in years:
        ok = download_year_with_retry(var, yr, out_dir)
        if not ok:
            failed.append(yr)

    print(f"\n[IMD] '{var}' download complete.")
    if failed:
        print(f"[IMD] WARNING: Failed years: {failed}")
        print(f"[IMD] Re-run the script to retry only missing years (auto-skip already downloaded).")
    else:
        print(f"[IMD] All years downloaded successfully.")
    return failed


def open_as_xarray(var: str, start_yr: int, end_yr: int, out_dir: str):
    """Load downloaded .grd files into an xarray Dataset."""
    print(f"\n[IMD] Loading {var} {start_yr}-{end_yr} into xarray ...")
    data = imd.open_data(var, start_yr, end_yr, "yearwise", out_dir)
    ds = data.get_xarray()
    print(ds)
    return ds


def export_to_netcdf(ds, out_path: str) -> None:
    """Save xarray Dataset as a single NetCDF file."""
    ds.to_netcdf(out_path)
    print(f"[IMD] Saved NetCDF -> {out_path}")


# ── CLI ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download IMD gridded rainfall/temperature data")
    parser.add_argument("--start",   type=int, default=2015, help="Start year (>=1901)")
    parser.add_argument("--end",     type=int, default=2022, help="End year (<=2024)")
    parser.add_argument("--out",     type=str, default="./data/imd/rain", help="Output directory")
    parser.add_argument("--var",     type=str, default="rain",
                        choices=["rain", "tmin", "tmax"], help="Variable to download")
    parser.add_argument("--temp",    action="store_true", help="Also download Tmin and Tmax")
    parser.add_argument("--nc",      action="store_true", help="Export merged NetCDF after download")
    parser.add_argument("--retries", type=int, default=5, help="Max retries per year (default: 5)")
    parser.add_argument("--wait",    type=int, default=10, help="Seconds to wait between retries (default: 10)")
    args = parser.parse_args()

    # Main variable download
    download_imd_variable(args.var, args.start, args.end, args.out)

    # Optional: also download temperature
    if args.temp:
        for tvar in ("tmin", "tmax"):
            tdir = os.path.join(os.path.dirname(args.out), tvar)
            download_imd_variable(tvar, args.start, args.end, tdir)

    # Optional: export merged NetCDF
    # imdlib stores files in out_dir/<var>/ so point open_data there
    if args.nc:
        actual_data_dir = os.path.join(args.out, args.var)
        ds = open_as_xarray(args.var, args.start, args.end, actual_data_dir)
        nc_path = os.path.join(args.out, f"imd_{args.var}_{args.start}_{args.end}.nc")
        export_to_netcdf(ds, nc_path)

