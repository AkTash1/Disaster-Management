"""
extract_readable_samples.py
Extracts actual usable, readable sample data from all 5 heterogeneous sources
into data/extracted_readable/ for PostgreSQL/PostGIS schema prototyping.
"""

import os
import glob
import json
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import xarray as xr
import h5py
import rasterio
from rasterio.transform import from_bounds
from PIL import Image

OUT_DIR = os.path.join(".", "data", "extracted_readable")
os.makedirs(OUT_DIR, exist_ok=True)

print("=" * 60)
print("1. EXTRACTING DIMENSION DATA (DISTRICTS & STATIONS)")
print("=" * 60)

# CWC CSV as basis for stations and districts
cwc_path = os.path.join(".", "data", "hydrology", "rainfall_tel_hr_uttarakhand_uk_2021_2025.csv")
cwc_df = pd.read_csv(cwc_path)

# 1.1 District Dimension
dist_records = []
for dist_code, group in cwc_df.groupby("District LGD Code"):
    dist_name = group["District"].iloc[0]
    st_count = group["Station"].nunique()
    min_lat, max_lat = group["Latitude"].min(), group["Latitude"].max()
    min_lon, max_lon = group["Longitude"].min(), group["Longitude"].max()
    centroid_lat = round(group["Latitude"].mean(), 6)
    centroid_lon = round(group["Longitude"].mean(), 6)
    dist_records.append({
        "district_lgd_code": int(dist_code),
        "district_name": dist_name,
        "state_lgd_code": 5,
        "state_name": "Uttarakhand",
        "station_count": st_count,
        "centroid_lat": centroid_lat,
        "centroid_lon": centroid_lon,
        "bbox_min_lat": round(min_lat, 6),
        "bbox_max_lat": round(max_lat, 6),
        "bbox_min_lon": round(min_lon, 6),
        "bbox_max_lon": round(max_lon, 6)
    })

dim_district_df = pd.DataFrame(dist_records).sort_values("district_name")
dim_district_csv = os.path.join(OUT_DIR, "dim_district.csv")
dim_district_df.to_csv(dim_district_csv, index=False)
print(f" Saved {len(dim_district_df)} districts -> {dim_district_csv}")

# 1.2 Station Dimension
station_records = []
for st_name, group in cwc_df.groupby("Station"):
    first = group.iloc[0]
    basin = first["Basin"] if first["Basin"] != "-" else None
    river = first["River"] if first["River"] != "-" else None
    tehsil = first["Tehsil"] if first["Tehsil"] != "-" else None
    station_records.append({
        "station_id": f"CWC_UK_{st_name.replace(' ', '_').replace('(', '').replace(')', '')}",
        "station_name": st_name,
        "agency": first["Agency"],
        "district_lgd_code": int(first["District LGD Code"]),
        "district_name": first["District"],
        "tehsil": tehsil,
        "river": river,
        "basin": basin,
        "latitude": round(first["Latitude"], 6),
        "longitude": round(first["Longitude"], 6),
        "record_count": len(group)
    })

dim_station_df = pd.DataFrame(station_records).sort_values("station_name")
dim_station_csv = os.path.join(OUT_DIR, "dim_station.csv")
dim_station_df.to_csv(dim_station_csv, index=False)
print(f" Saved {len(dim_station_df)} stations -> {dim_station_csv}")

# GeoJSON for stations
geojson_features = []
for _, r in dim_station_df.iterrows():
    feat = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [r["longitude"], r["latitude"]]
        },
        "properties": {
            "station_id": r["station_id"],
            "station_name": r["station_name"],
            "district_name": r["district_name"],
            "district_lgd_code": r["district_lgd_code"],
            "agency": r["agency"]
        }
    }
    geojson_features.append(feat)

station_geojson = {
    "type": "FeatureCollection",
    "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
    "features": geojson_features
}
dim_station_geojson = os.path.join(OUT_DIR, "dim_station.geojson")
with open(dim_station_geojson, "w") as f:
    json.dump(station_geojson, f, indent=2)
print(f" Saved station GeoJSON -> {dim_station_geojson}")

# 1.3 Dataset Metadata Dimension
dim_dataset_records = [
    {
        "dataset_id": "IMD_GRID_025",
        "dataset_name": "IMD Daily Gridded Rainfall",
        "agency": "India Meteorological Department (IMD)",
        "source_type": "GRIDDED_OBSERVATION",
        "temporal_resolution": "DAILY",
        "spatial_resolution_m": 28000,
        "unit": "mm/day",
        "crs": "EPSG:4326",
        "native_format": "NetCDF-4 / Binary GRD"
    },
    {
        "dataset_id": "MOSDAC_INSAT3DR_IMSRA",
        "dataset_name": "INSAT-3DR IMSRA Rainfall Rate L2B",
        "agency": "Space Applications Centre (ISRO / MOSDAC)",
        "source_type": "SATELLITE_GEOSYNCHRONOUS",
        "temporal_resolution": "30_MINUTES",
        "spatial_resolution_m": 4000,
        "unit": "mm/hr",
        "crs": "GEOS_74E_WGS84",
        "native_format": "HDF5 (CF-1.6)"
    },
    {
        "dataset_id": "CWC_TELEMETRY_HOURLY",
        "dataset_name": "CWC Telemetry Rain Gauge Network",
        "agency": "Central Water Commission / Uttarakhand State",
        "source_type": "GROUND_TELEMETRY_STATION",
        "temporal_resolution": "HOURLY",
        "spatial_resolution_m": 0,
        "unit": "mm/hr",
        "crs": "EPSG:4326",
        "native_format": "CSV"
    },
    {
        "dataset_id": "BHUVAN_TERRAIN_SLOPE",
        "dataset_name": "Bhuvan CartoDEM Slope Hazard Classification",
        "agency": "National Remote Sensing Centre (ISRO / Bhuvan)",
        "source_type": "DIGITAL_ELEVATION_THEMATIC",
        "temporal_resolution": "STATIC",
        "spatial_resolution_m": 30,
        "unit": "degrees",
        "crs": "EPSG:4326",
        "native_format": "WMS PNG / GeoTIFF"
    },
    {
        "dataset_id": "BHOONIDHI_EOS04_SAR_ARD",
        "dataset_name": "EOS-04 C-Band SAR Normalized Radar Backscatter",
        "agency": "ISRO / Bhoonidhi (NRSC)",
        "source_type": "SATELLITE_SAR_MICROWAVE",
        "temporal_resolution": "EVENT_PASS",
        "spatial_resolution_m": 36,
        "unit": "DN_linear_gamma0",
        "crs": "EPSG:32644 / EPSG:32643",
        "native_format": "GeoTIFF (CEOS-ARD L2B)"
    }
]
dim_dataset_df = pd.DataFrame(dim_dataset_records)
dim_dataset_csv = os.path.join(OUT_DIR, "dim_dataset.csv")
dim_dataset_df.to_csv(dim_dataset_csv, index=False)
print(f" Saved {len(dim_dataset_df)} dataset definitions -> {dim_dataset_csv}")

print("\n" + "=" * 60)
print("2. EXTRACTING & CLEANING CWC HOURLY TELEMETRY DATA")
print("=" * 60)

# Parse CWC timestamps and flag anomalies
cwc_clean = cwc_df.copy()
cwc_clean["observed_at"] = pd.to_datetime(cwc_clean["Data Acquisition Time"], format="%d-%m-%Y %H:%M", errors="coerce")
cwc_clean["station_id"] = cwc_clean["Station"].apply(lambda s: f"CWC_UK_{s.replace(' ', '_').replace('(', '').replace(')', '')}")
cwc_clean["rainfall_mm_hr"] = cwc_clean["Telemetry Hourly Rainfall (mm)"]

def assign_quality_flag(val):
    if pd.isna(val):
        return "MISSING"
    elif val < 0:
        return "CORRUPT_NEGATIVE"
    elif val > 150:
        return "SUSPECT_EXTREME"
    else:
        return "VALID"

cwc_clean["quality_flag"] = cwc_clean["rainfall_mm_hr"].apply(assign_quality_flag)

cwc_output = cwc_clean[[
    "station_id", "District LGD Code", "observed_at", "rainfall_mm_hr", "quality_flag", "Latitude", "Longitude"
]].rename(columns={"District LGD Code": "district_lgd_code", "Latitude": "latitude", "Longitude": "longitude"})

cwc_clean_csv = os.path.join(OUT_DIR, "fact_rainfall_cwc_cleaned_sample.csv")
sample_cwc = pd.concat([
    cwc_output[cwc_output["quality_flag"] == "VALID"].head(1500),
    cwc_output[cwc_output["quality_flag"] == "SUSPECT_EXTREME"].head(200),
    cwc_output[cwc_output["quality_flag"] == "CORRUPT_NEGATIVE"].head(100)
]).sort_values("observed_at")
sample_cwc.to_csv(cwc_clean_csv, index=False)
print(f" Saved cleaned CWC sample ({len(sample_cwc)} rows) -> {cwc_clean_csv}")

print("\n" + "=" * 60)
print("3. EXTRACTING IMD GRIDDED RAINFALL FOR UTTARAKHAND")
print("=" * 60)

imd_nc_path = os.path.join(".", "data", "imd", "rain", "imd_rain_2020_2022.nc")
if os.path.exists(imd_nc_path):
    ds = xr.open_dataset(imd_nc_path)
    # Uttarakhand Bounding Box: Lat 28.7 to 31.5, Lon 77.5 to 81.1
    ds_uk = ds.sel(lat=slice(28.7, 31.5), lon=slice(77.5, 81.1))
    
    df_uk_grid = ds_uk.to_dataframe().reset_index()
    df_uk_grid = df_uk_grid[df_uk_grid["rain"] != -999.0].dropna(subset=["rain"])
    df_uk_grid.rename(columns={"rain": "rainfall_mm_day"}, inplace=True)
    df_uk_grid["dataset_id"] = "IMD_GRID_025"
    
    daily_agg = df_uk_grid.groupby("time")["rainfall_mm_day"].agg(
        mean_rain="mean",
        max_rain="max",
        min_rain="min",
        active_grid_cells="count"
    ).reset_index()
    
    imd_grid_csv = os.path.join(OUT_DIR, "fact_rainfall_imd_grid_sample.csv")
    df_uk_grid.head(2000).to_csv(imd_grid_csv, index=False)
    print(f" Saved IMD grid cells ({len(df_uk_grid)} total cells in UK bbox, sampled 2000) -> {imd_grid_csv}")
    
    imd_daily_agg_csv = os.path.join(OUT_DIR, "fact_rainfall_imd_daily_aggregate.csv")
    daily_agg.to_csv(imd_daily_agg_csv, index=False)
    print(f" Saved IMD daily Uttarakhand state-wide aggregate ({len(daily_agg)} days) -> {imd_daily_agg_csv}")
    ds.close()
else:
    print(f" IMD NetCDF not found at {imd_nc_path}")

print("\n" + "=" * 60)
print("4. EXTRACTING MOSDAC INSAT-3DR HALF-HOURLY RAINFALL")
print("=" * 60)

mosdac_files = sorted(glob.glob(os.path.join(".", "data", "mosdac", "2025", "01AUG", "*.h5")))
mosdac_samples = []

for h5_file in mosdac_files:
    fname = os.path.basename(h5_file)
    with h5py.File(h5_file, "r") as f:
        t_minutes = float(f["time"][0])
        acq_time = datetime(2000, 1, 1) + timedelta(minutes=t_minutes)
        
        imc = f["IMC"][0]
        lat = f["Latitude"][()] * 0.01
        lon = f["Longitude"][()] * 0.01
        
        mask = (lat >= 28.7) & (lat <= 31.5) & (lon >= 77.5) & (lon <= 81.1)
        valid_mask = mask & (imc >= 0) & (imc <= 150)
        
        uk_lats = lat[valid_mask]
        uk_lons = lon[valid_mask]
        uk_rain = imc[valid_mask]
        
        step = max(1, len(uk_rain) // 100)
        for i in range(0, len(uk_rain), step):
            mosdac_samples.append({
                "dataset_id": "MOSDAC_INSAT3DR_IMSRA",
                "granule_file": fname,
                "observed_at": acq_time.isoformat(),
                "latitude": round(float(uk_lats[i]), 4),
                "longitude": round(float(uk_lons[i]), 4),
                "rainfall_rate_mm_hr": round(float(uk_rain[i]), 2)
            })

mosdac_sample_df = pd.DataFrame(mosdac_samples)
mosdac_csv = os.path.join(OUT_DIR, "fact_rainfall_mosdac_sample.csv")
mosdac_sample_df.to_csv(mosdac_csv, index=False)
print(f" Saved MOSDAC INSAT-3DR Uttarakhand sample ({len(mosdac_sample_df)} points across {len(mosdac_files)} granules) -> {mosdac_csv}")

print("\n" + "=" * 60)
print("5. EXTRACTING BHOONIDHI EOS-04 SAR BACKSCATTER SAMPLE")
print("=" * 60)

sar_scenes = [
    "E04_SAR_CRS_08JUL2023_189124938037_7704_STUC00ZTD_9359_7_DH_A_R_N30458_E078813",
    "E04_SAR_CRS_28JUL2023_209121625069_8006_STUC00ZTD_9757_13_DH_A_L_N30360_E077899"
]
sar_samples = []

for sc in sar_scenes:
    sc_base = os.path.join(".", "data", "hazard_maps", "Bhoonidhi", sc, sc)
    if not os.path.exists(sc_base):
        sc_base = os.path.join(".", "data", "hazard_maps", "Bhoonidhi", sc)
        
    hh_tif = os.path.join(sc_base, "scene_HH", "imagery_HH.tif")
    hv_tif = os.path.join(sc_base, "scene_HV", "imagery_HV.tif")
    
    if os.path.exists(hh_tif) and os.path.exists(hv_tif):
        with rasterio.open(hh_tif) as src_hh, rasterio.open(hv_tif) as src_hv:
            crs_code = str(src_hh.crs)
            width = src_hh.width
            height = src_hh.height
            
            rows = np.linspace(height * 0.2, height * 0.8, 20, dtype=int)
            cols = np.linspace(width * 0.2, width * 0.8, 20, dtype=int)
            
            date_str = "2023-07-08" if "08JUL2023" in sc else "2023-07-28"
            
            for r in rows:
                for c in cols:
                    window = rasterio.windows.Window(c, r, 1, 1)
                    dn_hh = int(src_hh.read(1, window=window)[0, 0])
                    dn_hv = int(src_hv.read(1, window=window)[0, 0])
                    
                    if dn_hh > 0 and dn_hv > 0:
                        x_utm, y_utm = rasterio.transform.xy(src_hh.transform, r, c)
                        gamma0_hh_db = round(20 * np.log10(dn_hh) - 66.55, 2)
                        gamma0_hv_db = round(20 * np.log10(dn_hv) - 66.55, 2)
                        cr_ratio_db = round(gamma0_hv_db - gamma0_hh_db, 2)
                        
                        sar_samples.append({
                            "scene_id": sc[:35] + "...",
                            "acq_date": date_str,
                            "utm_easting": round(x_utm, 2),
                            "utm_northing": round(y_utm, 2),
                            "crs": crs_code,
                            "dn_hh": dn_hh,
                            "gamma0_hh_db": gamma0_hh_db,
                            "dn_hv": dn_hv,
                            "gamma0_hv_db": gamma0_hv_db,
                            "cross_pol_ratio_db": cr_ratio_db
                        })

sar_sample_df = pd.DataFrame(sar_samples)
sar_csv = os.path.join(OUT_DIR, "fact_sar_backscatter_sample.csv")
sar_sample_df.to_csv(sar_csv, index=False)
print(f" Saved EOS-04 SAR calibrated backscatter sample ({len(sar_sample_df)} points) -> {sar_csv}")

print("\n" + "=" * 60)
print("6. GEOREFERENCING BHUVAN WMS RASTERS & BUILDING RASTER CATALOG")
print("=" * 60)

wms_dir = os.path.join(".", "data", "hazard_maps", "wms")
raster_records = []

uk_slope_png = os.path.join(wms_dir, "bhuvan_sdv_uk_slope_landslide.png")
uk_slope_tif = os.path.join(OUT_DIR, "bhuvan_uk_slope_georeferenced.tif")
uk_bbox = (77.5, 28.7, 81.1, 31.5)

if os.path.exists(uk_slope_png):
    img = Image.open(uk_slope_png)
    img_arr = np.array(img)
    transform = from_bounds(uk_bbox[0], uk_bbox[1], uk_bbox[2], uk_bbox[3], img.width, img.height)
    
    with rasterio.open(
        uk_slope_tif,
        "w",
        driver="GTiff",
        height=img.height,
        width=img.width,
        count=img_arr.shape[2] if len(img_arr.shape) > 2 else 1,
        dtype=img_arr.dtype,
        crs="EPSG:4326",
        transform=transform
    ) as dst:
        if len(img_arr.shape) == 3:
            for b in range(img_arr.shape[2]):
                dst.write(img_arr[:, :, b], b + 1)
        else:
            dst.write(img_arr, 1)
    print(f" Converted Bhuvan Slope PNG -> Georeferenced GeoTIFF ({img.width}x{img.height}) -> {uk_slope_tif}")

for png_file in sorted(glob.glob(os.path.join(wms_dir, "*.png"))):
    bname = os.path.basename(png_file)
    fsize_kb = round(os.path.getsize(png_file) / 1024, 1)
    is_hp = "HP_" in bname or "_hp_" in bname or "hp_slope" in bname
    bbox = (75.5, 30.4, 79.0, 33.2) if is_hp else (77.5, 28.7, 81.1, 31.5)
    
    layer_type = "SLOPE" if "slope" in bname else "LULC"
    raster_records.append({
        "raster_layer_id": bname.replace(".png", ""),
        "file_name": bname,
        "layer_type": layer_type,
        "state": "Himachal Pradesh" if is_hp else "Uttarakhand",
        "file_size_kb": fsize_kb,
        "crs": "EPSG:4326",
        "min_lon": bbox[0],
        "min_lat": bbox[1],
        "max_lon": bbox[2],
        "max_lat": bbox[3],
        "resolution_px": "2048x2048",
        "source": "Bhuvan (ISRO / NRSC)"
    })

dim_raster_df = pd.DataFrame(raster_records)
dim_raster_csv = os.path.join(OUT_DIR, "dim_raster_layer.csv")
dim_raster_df.to_csv(dim_raster_csv, index=False)
print(f" Saved raster catalog ({len(dim_raster_df)} layers) -> {dim_raster_csv}")

print("\n" + "=" * 60)
print("SUCCESS: ALL SAMPLE DATASETS EXTRACTED & READY!")
print("=" * 60)
