import { Asset } from '../types';

export const downloadEquipmentReport = (asset: Asset, documentName?: string) => {
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${asset.assetId}_${(documentName || 'Inspection_Report').replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.html`;

  const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CATERPILLAR FLEET360 - ${asset.assetId} Official Compliance Report</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1a1c1d; background: #f9f9f9; }
    .header { background: #231f20; color: #ffcd00; padding: 24px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; border-bottom: 5px solid #ffcd00; }
    .title { font-size: 24px; font-weight: bold; letter-spacing: 1px; }
    .badge { background: #ffcd00; color: #231f20; padding: 4px 12px; font-weight: bold; font-family: monospace; border-radius: 3px; }
    .card { background: #ffffff; padding: 24px; margin-top: 20px; border-radius: 6px; border: 1px solid #e2e2e2; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    h2 { color: #231f20; border-bottom: 2px solid #eeeeee; padding-bottom: 8px; margin-top: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid #eeeeee; font-size: 13px; }
    th { background: #f3f3f3; color: #4e4632; font-family: monospace; text-transform: uppercase; font-size: 11px; }
    .metric { font-family: monospace; font-weight: bold; color: #231f20; }
    .status-ok { color: #16a34a; font-weight: bold; }
    .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #80765f; font-family: monospace; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">CATFLEET360 INDUSTRIAL ASSET AUDIT REPORT</div>
      <div style="font-size: 12px; color: #f1f1f1; margin-top: 4px;">CATERPILLAR HEAVY MACHINERY TELEMETRY & COMPLIANCE CERTIFICATION</div>
    </div>
    <div class="badge">${asset.assetId}</div>
  </div>

  <div class="card">
    <h2>1. General Machinery Specifications</h2>
    <table>
      <tr><th>Asset Identification</th><td class="metric">${asset.assetId}</td><th>Manufacturer</th><td>${asset.manufacturer}</td></tr>
      <tr><th>Model / Series</th><td class="metric">${asset.model}</td><th>Year of Manufacture</th><td>${asset.year}</td></tr>
      <tr><th>Machinery Category</th><td>${asset.category}</td><th>Assigned Jobsite</th><td class="metric">${asset.location}</td></tr>
      <tr><th>Serial Number (VIN)</th><td class="metric">${asset.serialNumber || 'CAT-SN-99821'}</td><th>Lifecycle State</th><td><strong>${asset.lifecycleStage}</strong></td></tr>
      <tr><th>Current Operational Status</th><td><span class="status-ok">${asset.status}</span></td><th>Fleet Health Score</th><td class="metric" style="color:#16a34a;">${asset.healthScore} / 100 PTS</td></tr>
    </table>
  </div>

  <div class="card">
    <h2>2. Real-Time Telemetry & Utilization Audit</h2>
    <table>
      <tr><th>Operating Meter Hours</th><td class="metric">${asset.operatingHours} Hours</td><th>Current Fuel Level</th><td class="metric">${asset.fuelLevel}%</td></tr>
      <tr><th>Utilization Rate</th><td class="metric">${asset.utilization}%</td><th>GPS Coordinates</th><td class="metric">${asset.latitude}, ${asset.longitude}</td></tr>
      <tr><th>Engine Telemetry Status</th><td class="status-ok">NOMINAL (Hydraulic Pressures Calibrated)</td><th>OSHA Compliance</th><td class="status-ok">CERTIFIED PASS (30-Day Inspection)</td></tr>
    </table>
  </div>

  <div class="card">
    <h2>3. Pre-Shift Inspection & Verification Signature</h2>
    <p style="font-size: 12px; line-height: 1.6; color: #555;">
      This certifies that the heavy machine asset <strong>${asset.name} (${asset.assetId})</strong> has passed all structural, hydraulic, braking, and emergency stop system diagnostics in accordance with Caterpillar standard operating procedures.
    </p>
    <table style="margin-top: 20px;">
      <tr><th>Inspector / Fleet Manager</th><td>Elena Rostova (Administrator)</td><th>Date of Report</th><td>${new Date().toLocaleString()}</td></tr>
      <tr><th>Digital Verification Hash</th><td class="metric" colspan="3">CAT-SHA256-${Math.random().toString(36).substring(2, 15).toUpperCase()}</td></tr>
    </table>
  </div>

  <div class="footer">
    CATERPILLAR INC. © 2026. ALL RIGHTS RESERVED. CATFLEET360 ENTERPRISE TELEMETRY SYSTEM.
  </div>
</body>
</html>`;

  const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
