// Utility to dynamically generate high-resolution sci-fi cyber forensic case card textures
// for the 3D WebGL DitherHelixCarousel.

export function generateCaseCardTexture(c, rcaReport) {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  // High-density 2X Retina resolution for crystalline text clarity
  const scale = 2;
  const lw = 840;
  const lh = 460;
  canvas.width = lw * scale;
  canvas.height = lh * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(scale, scale);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const w = lw;
  const h = lh;

  const isCritical = c.risk?.toLowerCase() === 'critical';
  const isHigh = c.risk?.toLowerCase() === 'high';
  const accentColor = isCritical ? '#f87171' : isHigh ? '#fbbf24' : '#38bdf8';
  const accentGlow = isCritical ? 'rgba(239, 68, 68, 0.35)' : isHigh ? 'rgba(245, 158, 11, 0.35)' : 'rgba(56, 189, 248, 0.35)';

  // 1. Base gradient
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#0d0f18');
  bgGrad.addColorStop(0.5, '#07080d');
  bgGrad.addColorStop(1, '#050608');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Ambient specular orbs
  const radGrad1 = ctx.createRadialGradient(w * 0.85, 80, 10, w * 0.85, 80, 260);
  radGrad1.addColorStop(0, accentGlow);
  radGrad1.addColorStop(1, 'transparent');
  ctx.fillStyle = radGrad1;
  ctx.fillRect(0, 0, w, h);

  const radGrad2 = ctx.createRadialGradient(80, h - 80, 10, 80, h - 80, 220);
  radGrad2.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
  radGrad2.addColorStop(1, 'transparent');
  ctx.fillStyle = radGrad2;
  ctx.fillRect(0, 0, w, h);

  // 3. Cyber grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 1;
  const step = 32;
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 4. Outer border and glowing accent header line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, w - 32, h - 32);

  // Colored top highlight strip
  ctx.fillStyle = accentColor;
  ctx.fillRect(16, 16, w - 32, 4);

  // Corner brackets
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3;
  const cornerLen = 24;
  // top-left
  ctx.beginPath();
  ctx.moveTo(16, 16 + cornerLen);
  ctx.lineTo(16, 16);
  ctx.lineTo(16 + cornerLen, 16);
  ctx.stroke();
  // top-right
  ctx.beginPath();
  ctx.moveTo(w - 16 - cornerLen, 16);
  ctx.lineTo(w - 16, 16);
  ctx.lineTo(w - 16, 16 + cornerLen);
  ctx.stroke();
  // bottom-left
  ctx.beginPath();
  ctx.moveTo(16, h - 16 - cornerLen);
  ctx.lineTo(16, h - 16);
  ctx.lineTo(16 + cornerLen, h - 16);
  ctx.stroke();
  // bottom-right
  ctx.beginPath();
  ctx.moveTo(w - 16 - cornerLen, h - 16);
  ctx.lineTo(w - 16, h - 16);
  ctx.lineTo(w - 16, h - 16 - cornerLen);
  ctx.stroke();

  // 5. Header row
  // Case ID pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fillRect(44, 42, 140, 28);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.strokeRect(44, 42, 140, 28);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Space Grotesk", monospace, sans-serif';
  ctx.fillText(c.id, 58, 61);

  // Severity Pill
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.arc(206, 56, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = accentColor;
  ctx.font = 'bold 13px "Space Grotesk", sans-serif';
  ctx.fillText(`${c.risk?.toUpperCase()} SEVERITY`, 220, 61);

  // Status badge
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px "Space Grotesk", sans-serif';
  ctx.fillText(`// STATUS: ${c.status?.toUpperCase() || 'ACTIVE'}`, 370, 61);

  // Risk Score on top-right
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px "Space Grotesk", sans-serif';
  ctx.fillText(String(c.riskScore || 90), w - 44, 76);

  ctx.fillStyle = '#64748b';
  ctx.font = '700 11px "Space Grotesk", sans-serif';
  ctx.fillText('THREAT RISK INDEX', w - 44, 94);
  ctx.textAlign = 'left';

  // Divider line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(44, 114);
  ctx.lineTo(w - 44, 114);
  ctx.stroke();

  // 6. Case Title & Target Company
  if (c.type === 'DDoS') {
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('▲ 2.3 Gbps VOLUMETRIC FLOOD  ·  18,400 MIRAI BOTNET NODES  ·  99.4% SCRUBBED', 44, 134);
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 24px "Space Grotesk", sans-serif';
    ctx.fillText('DDoS Attack — ShopZest India (E-Commerce)', 44, 162);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 25px "Space Grotesk", sans-serif';
    let title = c.title || 'Security Incident Case';
    if (title.length > 46) title = title.slice(0, 44) + '…';
    ctx.fillText(title, 44, 155);
  }

  ctx.fillStyle = '#38bdf8';
  ctx.font = '600 14px "Space Grotesk", sans-serif';
  const metaText = `TARGET: ${c.company || 'Enterprise Asset'}   |   TYPE: ${c.type || 'Security Breach'}   |   OFFICER: ${c.assignedTo || 'Lead Analyst'}`;
  ctx.fillText(metaText, 44, 185);

  // 7. Root Cause / Summary Inset Box
  const boxY = 210;
  const boxH = 145;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.fillRect(44, boxY, w - 88, boxH);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(44, boxY, w - 88, boxH);

  // Label inside box
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 11px "Space Grotesk", monospace, sans-serif';
  ctx.fillText('● DETERMINED ROOT CAUSE & VECTOR INTELLIGENCE', 60, boxY + 28);

  const defect = rcaReport?.rootCause?.primaryDefect || rcaReport?.primaryRootCause || c.summary || 'Attack progression reconstructed via autonomous forensic correlation telemetry.';

  // Word wrap for summary
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '500 15px "Space Grotesk", sans-serif';
  const maxWidth = w - 120;
  const words = defect.split(' ');
  let line = '';
  let lineY = boxY + 60;
  let lineCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 60, lineY);
      line = words[n] + ' ';
      lineY += 24;
      lineCount++;
      if (lineCount >= 3) {
        line = line + '…';
        break;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 60, lineY);

  // 8. Bottom bar
  const footerY = 390;
  ctx.fillStyle = '#64748b';
  ctx.font = '12px monospace';
  ctx.fillText(`EVIDENCE: ${c.evidenceCount || 8} ARTIFACTS  ·  SHA-256 FORENSIC SEAL VERIFIED`, 44, footerY + 20);

  // Visual button pill on bottom-right
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  const btnW = 190;
  const btnH = 34;
  const btnX = w - 44 - btnW;
  const btnY = footerY;
  ctx.fillRect(btnX, btnY, btnW, btnH);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(btnX, btnY, btnW, btnH);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CLICK TO VIEW DOSSIER ➔', btnX + btnW / 2, btnY + 21);
  ctx.textAlign = 'left';

  return canvas.toDataURL('image/png');
}
