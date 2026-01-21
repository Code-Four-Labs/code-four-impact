#!/bin/bash
# Upload test impact report to GCS

# Test UUID (UUIDv7-like format)
TEST_UUID="01943d2e-0000-7000-8000-000000000001"
ORG_SLUG="unit-tests"
BUCKET="c4-impact"
GCS_PATH="organizations/${ORG_SLUG}/${TEST_UUID}/metadata.json"

# The password "test123" hashed with bcrypt
# To generate: node -e "console.log(require('bcryptjs').hashSync('test123', 10))"
PASSWORD_HASH='$2a$10$rYJV5y.3LcHAFG3kS8ZJxeXdqcL7G.vDWjqL5VsKVnxU3vxFSgKsG'

# Create temp file with test data
cat > /tmp/test-metadata.json << 'EOF'
{
  "uuid": "01943d2e-0000-7000-8000-000000000001",
  "org_slug": "unit-tests",
  "password_hash": "$2a$10$rYJV5y.3LcHAFG3kS8ZJxeXdqcL7G.vDWjqL5VsKVnxU3vxFSgKsG",
  "created_at": "2026-01-21T00:00:00Z",
  "expires_at": null,
  "report": {
    "orgName": "Unit Tests Police Department",
    "trialPeriod": "Jan 1 - Jan 31, 2026",
    "reportsGenerated": 247,
    "minutesProcessed": 18420,
    "activeUsers": 12,
    "avgWordLength": 1842,
    "avgIncidentLength": "12:34",
    "leaderboard": [
      { "name": "Officer Johnson", "reports": 45, "rank": 1 },
      { "name": "Officer Smith", "reports": 38, "rank": 2 },
      { "name": "Officer Davis", "reports": 34, "rank": 3 },
      { "name": "Officer Wilson", "reports": 28, "rank": 4 },
      { "name": "Officer Martinez", "reports": 25, "rank": 5 }
    ],
    "reportLocations": [
      { "lat": 40.2338, "lon": -111.6585, "count": 45 },
      { "lat": 40.7608, "lon": -111.8910, "count": 82 },
      { "lat": 40.6461, "lon": -111.4980, "count": 28 },
      { "lat": 41.2230, "lon": -111.9738, "count": 35 },
      { "lat": 40.3916, "lon": -111.8508, "count": 22 },
      { "lat": 40.5649, "lon": -111.9390, "count": 18 },
      { "lat": 39.5296, "lon": -111.5004, "count": 12 },
      { "lat": 37.1041, "lon": -113.5841, "count": 5 }
    ]
  }
}
EOF

echo "Uploading test data to gs://${BUCKET}/${GCS_PATH}"
gcloud storage cp /tmp/test-metadata.json "gs://${BUCKET}/${GCS_PATH}"

echo ""
echo "============================================"
echo "Test Impact Report Uploaded!"
echo "============================================"
echo ""
echo "GCS Path: gs://${BUCKET}/${GCS_PATH}"
echo ""
echo "Access URLs:"
echo "  Local:      http://localhost:3000/${ORG_SLUG}/${TEST_UUID}"
echo "  Production: https://impact.codefour.us/${ORG_SLUG}/${TEST_UUID}"
echo ""
echo "Password: test123"
echo ""
echo "============================================"
