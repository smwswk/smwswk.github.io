# AMap Satellite Kanjing

Open-source satellite scouting workflow for finding visually unusual shooting candidates from map imagery, then exporting KML / CSV files for AMap or running a small Google satellite second pass.

The public version is cleaned for reuse:

- No API keys, user accounts, coordinates, or scouting results are included.
- Area defaults are generic; provide your own AOI and candidate JSON.
- Google tile fetching is blocked unless `--confirm-api-fetch` is passed.
- The workflow is for public-map visual scouting, not automated mass scraping or navigation advice.

## Included Scripts

- `scripts/build_amap_import_files.py`
  - Converts candidate JSON into KML and CSV.
  - Keeps original candidate coordinates for AMap import.
- `scripts/google_satellite_second_pass.py`
  - Converts GCJ-02 candidate coordinates to WGS84 for Google satellite review.
  - Builds a small contact sheet, report, JSON, and KML.
  - Requires `--confirm-api-fetch` because it calls Google Map Tiles and may consume quota.

## Candidate JSON Shape

Each candidate should include:

```json
[
  {
    "lon": 120.123456,
    "lat": 31.123456,
    "category": "water-industrial-edge",
    "index": 1,
    "reason": "Irregular water edge and factory roof texture visible in satellite imagery"
  }
]
```

Optional fields:

- `district`
- `township`
- `formatted_address`
- `tile`
- `overall`
- `amap_url`

## AMap Import

```bash
python3 scripts/build_amap_import_files.py candidates.json \
  --out-dir out/amap \
  --folder-name satellite_scouting_candidates
```

## Google Second Pass

Set a Google Maps API key with Map Tiles API enabled:

```bash
export GOOGLE_MAPS_API_KEY="..."
```

Or store it in macOS Keychain under the service name `satellite_kanjing.google_maps_api_key`.

Run a small test first:

```bash
python3 scripts/google_satellite_second_pass.py candidates.json \
  --out-dir out/google_test \
  --max-candidates 2 \
  --skip-reverse-geocode \
  --confirm-api-fetch
```

Then run the selected set:

```bash
python3 scripts/google_satellite_second_pass.py candidates.json \
  --out-dir out/google \
  --folder-name satellite_second_pass \
  --top-k 12 \
  --confirm-api-fetch
```

## Safety Notes

- Do not scan a large AOI through Google tiles. Use Google only to review a small set of candidates selected elsewhere.
- Respect map-provider terms, API quotas, local laws, and site access restrictions.
- A high satellite score means visual anomaly only. It does not mean the site is accessible or safe to photograph.
- For industrial areas, shoot only from public roads and avoid security-sensitive details.

## License

MIT
