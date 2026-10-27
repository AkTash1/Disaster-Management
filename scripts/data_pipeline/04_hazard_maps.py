"""
04_hazard_maps.py
Download hazard maps from Bhuvan/NRSC.

Modes:
  A) WMS  - PNG raster image (no login needed)
  B) WFS  - Vector GeoJSON + Shapefile (no login needed)
  C) API  - LULC thematic stats via Bhuvan REST API (needs BHUVAN_API_TOKEN)
  D) PDF  - Landslide Atlas of India

Target states: Uttarakhand, Himachal Pradesh
Target layers: landslide, flood

Bhuvan API Token (for --action api):
  1. Log in at https://bhuvan-app1.nrsc.gov.in/api/
  2. Token is shown on the homepage (valid 1 day)
  3. Add to .env: BHUVAN_API_TOKEN=<your_token>

Usage:
  python 04_hazard_maps.py --action list
  python 04_hazard_maps.py --layer landslide --action wfs --state uttarakhand
  python 04_hazard_maps.py --layer flood     --action wfs --state himachal
  python 04_hazard_maps.py --layer landslide --action wms --state uttarakhand
  python 04_hazard_maps.py --action pdf
  python 04_hazard_maps.py --action api --state uttarakhand
"""

import argparse, os, sys, logging, requests, geopandas as gpd
from io import BytesIO
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

try:
    from owslib.wms import WebMapService
    from owslib.wfs import WebFeatureService
    HAS_OWSLIB = True
except ImportError:
    HAS_OWSLIB = False

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
log = logging.getLogger("bhuvan")

BHUVAN_WMS_URL   = "https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms"   # vec1 confirmed up; vec2 currently unreachable
BHUVAN_WFS_URL   = "https://bhuvan-vec2.nrsc.gov.in/bhuvan/wfs"   # WFS disabled server-wide on all Bhuvan servers
BHUVAN_API_BASE  = "https://bhuvan-app1.nrsc.gov.in/api"
BHUVAN_API_TOKEN = os.getenv("BHUVAN_API_TOKEN", "")

# Layers confirmed available on bhuvan-vec1 (as of Aug 2026)
# vec2 (which had lulc:Landslide_Hazard_Zonation) is currently unreachable
LAYER_MAP = {
    # Slope maps — key input for landslide susceptibility assessment
    "landslide":  "sdv:uk_slope",      # Uttarakhand slope (use --state uttarakhand)
    "flood":      "sdv:pb_flood_1988_93",  # Flood extent layer

    # State LULC overrides via --state flag (see VEC1_LAYERS below)
    "lulc_uk":    "moef:UK_LULC50K_1112",
    "lulc_hp":    "moef:HP_LULC50K_1112_GB",
}

# All confirmed disaster/hazard-relevant layers on vec1
VEC1_LAYERS = {
    # Slope maps (proxy for landslide susceptibility)
    "uk_slope":   "sdv:uk_slope",          # Uttarakhand slope map
    "hp_slope":   "sdv:hp_slope",          # Himachal Pradesh slope map

    # LULC (Land Use / Land Cover)
    "uk_lulc":    "moef:UK_LULC50K_1112",
    "hp_lulc":    "moef:HP_LULC50K_1112_GB",

    # District LULC — Uttarakhand (all 13 districts)
    "uk_chamoli":    "sisdpv2:UK_Chamoli_lulc_v2",      # High landslide risk
    "uk_rudraprayag":"sisdpv2:UK_Rudraprayag_lulc_v2",  # High landslide risk
    "uk_uttarkashi": "sisdpv2:UK_Uttarkashi_lulc_v2",   # High landslide risk
    "uk_tehri":      "sisdpv2:UK_Tehri_lulc_v2",
    "uk_pithoragarh":"sisdpv2:UK_Pithoragarh_lulc_v2",
    "uk_dehradun":   "sisdpv2:UK_Dehradun_lulc_v2",
    "uk_pauri":      "sisdpv2:UK_Pauri_lulc_v2",
    "uk_almora":     "sisdpv2:UK_Almora_lulc_v2",
    "uk_nainital":   "sisdpv2:UK_Nainital_lulc_v2",

    # District LULC — Himachal Pradesh
    "hp_kullu":   "sisdpv2:HP_Kullu_lulc_v2",    # High landslide risk
    "hp_mandi":   "sisdpv2:HP_Mandi_lulc_v2",    # High landslide risk
    "hp_kangra":  "sisdpv2:HP_Kangra_lulc_v2",
    "hp_shimla":  "sisdpv2:HP_Shimla_lulc_v2",
    "hp_sirmaur": "sisdpv2:HP_Sirmaur_lulc_v2",

    # Groundwater
    "hp_gw_post": "gw:HIMACHAL_PRADESH_POST",
    "hp_gw_pre":  "gw:HIMACHAL_PRADESH_PRE",

    # Flood
    "pb_flood":   "sdv:pb_flood_1988_93",
}

# State-to-slope-layer mapping
STATE_SLOPE_LAYER = {
    "uttarakhand": "sdv:uk_slope",
    "himachal":    "sdv:hp_slope",
}

STATE_BBOX = {
    "uttarakhand": (77.5, 28.7, 81.1, 31.5),
    "himachal":    (75.5, 30.4, 79.0, 33.2),
    "all":         (68.0,  6.0, 97.5, 37.0),
}

# District codes — verify at https://bhuvan-app1.nrsc.gov.in/api/ -> District Codes
STATE_DISTRICT_CODES = {
    "uttarakhand": [501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513],
    "himachal":    [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212],
}


def download_wms_image(layer_name, out_dir, bbox, state, width=2048, height=2048):
    """A) Raster PNG map image via WMS."""
    if not HAS_OWSLIB:
        log.error("owslib not installed. Run: pip install owslib"); sys.exit(1)
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    log.info(f"WMS: {layer_name}  state={state}")
    wms = WebMapService(BHUVAN_WMS_URL, version="1.1.1", timeout=60)
    img = wms.getmap(layers=[layer_name], styles=[""], srs="EPSG:4326", bbox=bbox,
                     size=(width, height), format="image/png", transparent=True)
    out_file = os.path.join(out_dir, f"bhuvan_{layer_name.replace(':','_')}_{state}.png")
    with open(out_file, "wb") as f:
        f.write(img.read())
    log.info(f"Saved -> {out_file}")


def download_wfs_features(layer_name, out_dir, bbox, state, max_features=10000):
    """B) Vector GeoJSON + Shapefile via WFS."""
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    params = {
        "service": "WFS", "version": "2.0.0", "request": "GetFeature",
        "typeName": layer_name, "outputFormat": "application/json",
        "count": max_features,
        "bbox": ",".join(map(str, bbox)) + ",EPSG:4326",
    }
    log.info(f"WFS: {layer_name}  state={state}  bbox={bbox}")
    try:
        r = requests.get(BHUVAN_WFS_URL, params=params, timeout=120)
        r.raise_for_status()
    except requests.exceptions.ReadTimeout:
        log.error("WFS timed out — Bhuvan WFS server is unreachable right now.")
        log.error("Try again later, or use --action wms for a raster image instead.")
        return None
    except requests.RequestException as e:
        log.error(f"WFS failed: {e}"); return None

    # Detect XML error responses (e.g. "Service WFS is disabled")
    content_type = r.headers.get("Content-Type", "")
    first_bytes = r.content[:200].decode("utf-8", errors="replace")
    if "ExceptionReport" in first_bytes or "ServiceException" in first_bytes or first_bytes.strip().startswith("<?xml"):
        import re
        msg = re.search(r"<ows:ExceptionText>(.*?)</ows:ExceptionText>", first_bytes)
        reason = msg.group(1) if msg else first_bytes[:120]
        log.error(f"WFS server returned an error: {reason}")
        log.error("Bhuvan WFS is currently disabled on this server.")
        log.error("Use --action wms to download a raster PNG image instead:")
        log.error(f"  python 04_hazard_maps.py --layer {layer_name.split(':')[-1].lower().split('_')[0]} --action wms --state {state}")
        return None

    safe = layer_name.replace(":", "_")
    geojson_f = os.path.join(out_dir, f"bhuvan_{safe}_{state}.geojson")
    with open(geojson_f, "wb") as f:
        f.write(r.content)
    log.info(f"Saved GeoJSON -> {geojson_f}")

    try:
        gdf = gpd.read_file(BytesIO(r.content))
        if not gdf.empty:
            shp_f = os.path.join(out_dir, f"bhuvan_{safe}_{state}.shp")
            gdf.to_file(shp_f)
            log.info(f"Saved Shapefile ({len(gdf)} features) -> {shp_f}")
        else:
            log.warning("Empty WFS response — layer may not cover this area. Try --action list.")
    except Exception as e:
        log.warning(f"Shapefile conversion failed: {e}")

    return geojson_f


def download_lulc_stats(out_dir, state, lulc_type="50K", year="2011-12", season="Kharif"):
    """C) LULC thematic statistics via Bhuvan REST API. Requires BHUVAN_API_TOKEN."""
    if not BHUVAN_API_TOKEN:
        log.error("BHUVAN_API_TOKEN not set in .env")
        log.error("Log in at https://bhuvan-app1.nrsc.gov.in/api/ — token shown on homepage"); return

    district_codes = STATE_DISTRICT_CODES.get(state)
    if not district_codes:
        log.error(f"No district codes for state: {state}"); return

    Path(out_dir).mkdir(parents=True, exist_ok=True)
    results = []
    log.info(f"LULC-{lulc_type} stats  state={state}  year={year}  {len(district_codes)} districts")

    for code in district_codes:
        url = (f"{BHUVAN_API_BASE}/thematic/lulc/lulc_type.php"
               f"?token={BHUVAN_API_TOKEN}&district_code={code}"
               f"&lulc_type={lulc_type}&season={season}&year={year}")
        try:
            r = requests.get(url, timeout=30)
            if r.status_code == 200:
                data = r.json()
                if isinstance(data, list):
                    for row in data:
                        row["district_code"] = code
                        row["state"] = state
                    results.extend(data)
                    log.info(f"  District {code}: {len(data)} records")
                else:
                    log.warning(f"  District {code}: unexpected response — {str(data)[:80]}")
            elif r.status_code == 401:
                log.error("Token expired. Refresh at: https://bhuvan-app1.nrsc.gov.in/api/"); return
            else:
                log.warning(f"  District {code}: HTTP {r.status_code}")
        except requests.RequestException as e:
            log.warning(f"  District {code}: {e}")

    if results:
        import pandas as pd
        df = pd.DataFrame(results)
        out_csv = os.path.join(out_dir, f"bhuvan_lulc_{lulc_type}_{state}_{year.replace('-','_')}.csv")
        df.to_csv(out_csv, index=False)
        log.info(f"Saved {len(df)} rows -> {out_csv}")
    else:
        log.warning("No data. Verify token and district codes.")


def download_bhuvan_pdf(out_dir):
    """D) Landslide Atlas of India PDF."""
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    pdf_url  = "https://bhuvan-app3.nrsc.gov.in/disaster/atlas/Landslide_Atlas_of_India.pdf"
    out_file = os.path.join(out_dir, "Landslide_Atlas_of_India.pdf")
    if Path(out_file).exists():
        log.info(f"Already exists -> {out_file}"); return
    log.info("Downloading Landslide Atlas PDF ...")
    try:
        r = requests.get(pdf_url, stream=True, timeout=120)
    except requests.RequestException as e:
        log.error(f"Download failed: {e}"); return
    if r.status_code == 404:
        log.warning("PDF not found. Visit: https://bhuvan-app3.nrsc.gov.in/disaster/disaster.php?id=landslide")
        return
    r.raise_for_status()
    log.info(f"PDF size: {int(r.headers.get('Content-Length',0))/(1024**2):.1f} MB")
    with open(out_file, "wb") as f:
        for chunk in r.iter_content(chunk_size=1 << 20):
            f.write(chunk)
    log.info(f"Saved -> {out_file}")


def list_layers():
    """Show all WMS and WFS layer names available on Bhuvan."""
    if not HAS_OWSLIB:
        log.error("owslib not installed. Run: pip install owslib"); sys.exit(1)
    log.info("Connecting to WMS ...")
    wms = WebMapService(BHUVAN_WMS_URL, version="1.1.1", timeout=30)
    print(f"\n[WMS] {len(wms.contents)} layers:")
    for lyr in sorted(wms.contents):
        print(f"  {lyr:<55} {wms[lyr].title}")
    log.info("Connecting to WFS ...")
    wfs = WebFeatureService(BHUVAN_WFS_URL, version="2.0.0", timeout=30)
    print(f"\n[WFS] {len(list(wfs.contents))} feature types:")
    for ft in sorted(wfs.contents):
        print(f"  {ft}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Download hazard maps from Bhuvan/NRSC",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Actions:
  wms    Raster PNG via WMS (no login)
  wfs    Vector GeoJSON + Shapefile via WFS (no login)
  api    LULC stats via Bhuvan REST API (needs BHUVAN_API_TOKEN in .env)
  pdf         Landslide Atlas PDF (no login)
  list        Show all available WMS/WFS layer names
  list-vec1   Show confirmed working layers on vec1 with descriptions

Examples:
  python 04_hazard_maps.py --action list-vec1
  python 04_hazard_maps.py --action wms --state uttarakhand              # slope map
  python 04_hazard_maps.py --action wms --state himachal                 # slope map
  python 04_hazard_maps.py --action wms --layer-id uk_lulc              # Uttarakhand LULC
  python 04_hazard_maps.py --action wms --layer-id hp_lulc              # Himachal LULC
  python 04_hazard_maps.py --action wms --layer-id uk_chamoli           # Chamoli district LULC
  python 04_hazard_maps.py --action pdf
  python 04_hazard_maps.py --action api --state uttarakhand
        """
    )
    parser.add_argument("--layer",    choices=list(LAYER_MAP.keys()), default="landslide",
                        help="Predefined layer type (use --layer-id for full control)")
    parser.add_argument("--layer-id", default=None, choices=list(VEC1_LAYERS.keys()),
                        help="Specific layer from VEC1_LAYERS (overrides --layer)")
    parser.add_argument("--action",   choices=["wms", "wfs", "pdf", "list", "list-vec1", "api"],
                        default="wms")
    parser.add_argument("--state",    choices=list(STATE_BBOX.keys()), default="uttarakhand")
    parser.add_argument("--out",      default="./data/hazard_maps")
    parser.add_argument("--max-features", type=int, default=10000)
    args = parser.parse_args()

    bbox = STATE_BBOX[args.state]

    # Determine which WMS layer to use
    if args.layer_id:
        layer = VEC1_LAYERS[args.layer_id]
    elif args.action == "wms" and args.layer == "landslide":
        # Auto-pick the correct slope layer for the selected state
        layer = STATE_SLOPE_LAYER.get(args.state, "sdv:uk_slope")
        log.info(f"Auto-selected slope layer for {args.state}: {layer}")
    else:
        layer = LAYER_MAP.get(args.layer, "")

    if args.action == "list":
        list_layers()

    elif args.action == "list-vec1":
        print("\nConfirmed working layers on bhuvan-vec1.nrsc.gov.in:")
        print(f"{'Key':<20} {'WMS Layer Name':<45} Description")
        print("-" * 90)
        descs = {
            "uk_slope":     "Uttarakhand slope map (landslide proxy)",
            "hp_slope":     "Himachal Pradesh slope map (landslide proxy)",
            "uk_lulc":      "Uttarakhand LULC 50K 2011-12",
            "hp_lulc":      "Himachal Pradesh LULC 50K 2011-12",
            "uk_chamoli":   "Chamoli district LULC (high LS risk)",
            "uk_rudraprayag":"Rudraprayag district LULC (high LS risk)",
            "uk_uttarkashi":"Uttarkashi district LULC (high LS risk)",
            "uk_tehri":     "Tehri district LULC",
            "uk_pithoragarh":"Pithoragarh district LULC",
            "uk_dehradun":  "Dehradun district LULC",
            "uk_pauri":     "Pauri district LULC",
            "uk_almora":    "Almora district LULC",
            "uk_nainital":  "Nainital district LULC",
            "hp_kullu":     "Kullu district LULC (high LS risk)",
            "hp_mandi":     "Mandi district LULC (high LS risk)",
            "hp_kangra":    "Kangra district LULC",
            "hp_shimla":    "Shimla district LULC",
            "hp_sirmaur":   "Sirmaur district LULC",
            "hp_gw_post":   "Himachal Pradesh groundwater quality (post-monsoon)",
            "hp_gw_pre":    "Himachal Pradesh groundwater quality (pre-monsoon)",
            "pb_flood":     "Punjab flood extent 1988-93",
        }
        for key, wms_name in VEC1_LAYERS.items():
            print(f"  {key:<20} {wms_name:<45} {descs.get(key,'')}")
        print(f"\nUsage: python 04_hazard_maps.py --action wms --layer-id <Key>")

    elif args.action == "wms":
        out = os.path.join(args.out, "wms")
        download_wms_image(layer, out, bbox, args.layer_id or args.layer)

    elif args.action == "wfs":
        out = os.path.join(args.out, "wfs")
        download_wfs_features(layer, out, bbox, args.state, args.max_features)

    elif args.action == "pdf":
        download_bhuvan_pdf(args.out)

    elif args.action == "api":
        try:
            import pandas  # noqa
        except ImportError:
            log.error("pandas not installed. Run: pip install pandas"); sys.exit(1)
        download_lulc_stats(os.path.join(args.out, "lulc_stats"), args.state)

