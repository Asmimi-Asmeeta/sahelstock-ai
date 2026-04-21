import type { ChartPoint, DashboardAnalysis } from "@/lib/types";
import {
  createCsv,
  downloadTextFile,
  formatCurrency,
  formatCurrencyCompact,
  formatDateTime,
  formatNumber,
  formatQuantityWithUnit,
  humanizeRiskLevel,
} from "@/lib/utils";

type DashboardReportOptions = {
  analysis: DashboardAnalysis;
  summary: string;
  summaryMode: "openai" | "fallback";
  sourceLabel: string;
  importedAt: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function truncateLabel(label: string, maxLength = 12) {
  return label.length > maxLength ? `${label.slice(0, maxLength - 3)}...` : label;
}

function createEmptySvg(message: string, width = 720, height = 300) {
  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(message)}">
      <rect x="0" y="0" width="${width}" height="${height}" rx="22" fill="#f8fafc" stroke="#cbd5e1" />
      <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-size="18" fill="#64748b" font-family="Arial, Helvetica, sans-serif">
        ${escapeHtml(message)}
      </text>
    </svg>
  `;
}

function createVerticalBarChartSvg(
  items: ChartPoint[],
  color: string,
  valueFormatter: (value: number) => string,
) {
  if (items.length === 0) {
    return createEmptySvg("Aucune donnée exploitable");
  }

  const width = 720;
  const height = 320;
  const top = 28;
  const right = 24;
  const bottom = 78;
  const left = 52;
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;
  const maxValue = Math.max(...items.map((item) => item.value), 1);
  const slotWidth = innerWidth / items.length;
  const barWidth = Math.min(52, slotWidth * 0.58);
  const guides = 4;

  const guideLines = Array.from({ length: guides + 1 }, (_, index) => {
    const y = top + (innerHeight / guides) * index;
    return `<line x1="${left}" y1="${y}" x2="${width - right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="4 4" />`;
  }).join("");

  const bars = items
    .map((item, index) => {
      const barHeight = maxValue === 0 ? 0 : (item.value / maxValue) * innerHeight;
      const x = left + slotWidth * index + (slotWidth - barWidth) / 2;
      const y = top + innerHeight - barHeight;
      const label = escapeHtml(truncateLabel(item.label));
      const formattedValue = escapeHtml(valueFormatter(item.value));

      return `
        <g>
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="12" fill="${color}" />
          <text x="${x + barWidth / 2}" y="${y - 8}" text-anchor="middle" font-size="12" fill="#0f172a" font-family="Arial, Helvetica, sans-serif">
            ${formattedValue}
          </text>
          <text x="${x + barWidth / 2}" y="${height - 30}" text-anchor="middle" font-size="12" fill="#475569" font-family="Arial, Helvetica, sans-serif">
            ${label}
          </text>
        </g>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Histogramme">
      <rect x="0" y="0" width="${width}" height="${height}" rx="22" fill="#ffffff" stroke="#cbd5e1" />
      ${guideLines}
      ${bars}
    </svg>
  `;
}

function createHorizontalBarChartSvg(
  items: ChartPoint[],
  color: string,
  valueFormatter: (value: number) => string,
) {
  if (items.length === 0) {
    return createEmptySvg("Aucune donnée exploitable");
  }

  const width = 720;
  const rowHeight = 42;
  const height = Math.max(260, items.length * rowHeight + 90);
  const top = 24;
  const right = 34;
  const left = 188;
  const innerWidth = width - left - right;
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  const bars = items
    .map((item, index) => {
      const y = top + index * rowHeight;
      const barWidth = maxValue === 0 ? 0 : (item.value / maxValue) * innerWidth;

      return `
        <g>
          <text x="${left - 14}" y="${y + 22}" text-anchor="end" font-size="13" fill="#334155" font-family="Arial, Helvetica, sans-serif">
            ${escapeHtml(truncateLabel(item.label, 22))}
          </text>
          <rect x="${left}" y="${y + 6}" width="${innerWidth}" height="20" rx="10" fill="#e2e8f0" />
          <rect x="${left}" y="${y + 6}" width="${barWidth}" height="20" rx="10" fill="${color}" />
          <text x="${left + barWidth + 10}" y="${y + 22}" font-size="12" fill="#0f172a" font-family="Arial, Helvetica, sans-serif">
            ${escapeHtml(valueFormatter(item.value))}
          </text>
        </g>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Barres horizontales">
      <rect x="0" y="0" width="${width}" height="${height}" rx="22" fill="#ffffff" stroke="#cbd5e1" />
      ${bars}
    </svg>
  `;
}

function createGroupedBarChartSvg(items: ChartPoint[]) {
  if (items.length === 0) {
    return createEmptySvg("Aucune donnée exploitable");
  }

  const width = 720;
  const height = 330;
  const top = 28;
  const right = 24;
  const bottom = 86;
  const left = 52;
  const innerWidth = width - left - right;
  const innerHeight = height - top - bottom;
  const maxValue = Math.max(
    ...items.flatMap((item) => [item.value, item.secondaryValue ?? 0]),
    1,
  );
  const slotWidth = innerWidth / items.length;
  const barWidth = Math.min(22, slotWidth * 0.24);

  const bars = items
    .map((item, index) => {
      const groupCenter = left + slotWidth * index + slotWidth / 2;
      const stockHeight = (item.value / maxValue) * innerHeight;
      const minHeight = ((item.secondaryValue ?? 0) / maxValue) * innerHeight;
      const stockX = groupCenter - barWidth - 4;
      const minX = groupCenter + 4;
      const stockY = top + innerHeight - stockHeight;
      const minY = top + innerHeight - minHeight;

      return `
        <g>
          <rect x="${stockX}" y="${stockY}" width="${barWidth}" height="${stockHeight}" rx="10" fill="#2563eb" />
          <rect x="${minX}" y="${minY}" width="${barWidth}" height="${minHeight}" rx="10" fill="#f59e0b" />
          <text x="${groupCenter}" y="${height - 32}" text-anchor="middle" font-size="12" fill="#475569" font-family="Arial, Helvetica, sans-serif">
            ${escapeHtml(truncateLabel(item.label))}
          </text>
        </g>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Stock et seuil minimum">
      <rect x="0" y="0" width="${width}" height="${height}" rx="22" fill="#ffffff" stroke="#cbd5e1" />
      <g transform="translate(${width - 208}, 18)">
        <rect x="0" y="0" width="14" height="14" rx="7" fill="#2563eb" />
        <text x="22" y="11" font-size="12" fill="#334155" font-family="Arial, Helvetica, sans-serif">Stock actuel</text>
        <rect x="98" y="0" width="14" height="14" rx="7" fill="#f59e0b" />
        <text x="120" y="11" font-size="12" fill="#334155" font-family="Arial, Helvetica, sans-serif">Seuil minimum</text>
      </g>
      ${bars}
    </svg>
  `;
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

function createDonutChartSvg(items: ChartPoint[]) {
  if (items.length === 0) {
    return createEmptySvg("Aucune donnée exploitable", 720, 280);
  }

  const width = 720;
  const height = 280;
  const centerX = 180;
  const centerY = 140;
  const radius = 84;
  const colors = ["#10b981", "#f59e0b", "#b91c1c"];
  const total = Math.max(items.reduce((sum, item) => sum + item.value, 0), 1);

  let currentAngle = 0;

  const arcs = items
    .map((item, index) => {
      const sliceAngle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      return `
        <path
          d="${describeArc(centerX, centerY, radius, startAngle, endAngle)}"
          fill="none"
          stroke="${colors[index % colors.length]}"
          stroke-width="34"
          stroke-linecap="round"
        />
      `;
    })
    .join("");

  const legend = items
    .map((item, index) => {
      const y = 80 + index * 48;
      return `
        <g transform="translate(360, ${y})">
          <rect x="0" y="-12" width="16" height="16" rx="8" fill="${colors[index % colors.length]}" />
          <text x="26" y="1" font-size="14" fill="#334155" font-family="Arial, Helvetica, sans-serif">
            ${escapeHtml(item.label)} - ${escapeHtml(formatNumber(item.value))}
          </text>
        </g>
      `;
    })
    .join("");

  return `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Répartition du risque">
      <rect x="0" y="0" width="${width}" height="${height}" rx="22" fill="#ffffff" stroke="#cbd5e1" />
      ${arcs}
      <circle cx="${centerX}" cy="${centerY}" r="52" fill="#ffffff" />
      <text x="${centerX}" y="${centerY - 4}" text-anchor="middle" font-size="28" fill="#0f172a" font-family="Arial, Helvetica, sans-serif">
        ${escapeHtml(formatNumber(total))}
      </text>
      <text x="${centerX}" y="${centerY + 22}" text-anchor="middle" font-size="12" fill="#64748b" font-family="Arial, Helvetica, sans-serif">
        produits
      </text>
      ${legend}
    </svg>
  `;
}

function buildTable(headers: string[], rows: string[][]) {
  return `
    <table>
      <thead>
        <tr>
          ${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${
          rows.length > 0
            ? rows
                .map(
                  (row) => `
                    <tr>
                      ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}
                    </tr>
                  `,
                )
                .join("")
            : `
              <tr>
                <td colspan="${headers.length}">Aucune donnée disponible</td>
              </tr>
            `
        }
      </tbody>
    </table>
  `;
}

export function createRecommendationsCsv(analysis: DashboardAnalysis) {
  const rows = [
    [
      "sku",
      "produit",
      "risque",
      "stock_actuel",
      "stock_minimum",
      "prevision_mois_suivant",
      "quantite_recommandee",
      "fournisseur",
    ],
    ...analysis.reorderSuggestions.map((item) => [
      item.sku,
      item.name,
      humanizeRiskLevel(item.riskLevel),
      String(item.currentStock),
      String(item.minStock),
      String(item.forecastUnits),
      String(item.reorderQuantity),
      item.supplier,
    ]),
  ];

  return createCsv(rows);
}

export function downloadRecommendationsCsv(analysis: DashboardAnalysis) {
  downloadTextFile(
    "sahelstock-recommandations.csv",
    createRecommendationsCsv(analysis),
  );
}

export function buildDashboardReportHtml({
  analysis,
  summary,
  summaryMode,
  sourceLabel,
  importedAt,
}: DashboardReportOptions) {
  const reportGeneratedAt = formatDateTime(new Date().toISOString());
  const kpis = [
    {
      label: "Produits suivis",
      value: formatNumber(analysis.kpis.totalProducts),
    },
    {
      label: "Stock total",
      value: formatNumber(analysis.kpis.totalStock),
    },
    {
      label: "Chiffre d'affaires",
      value: formatCurrencyCompact(analysis.kpis.totalRevenue),
    },
    {
      label: "Marge estimée",
      value: formatCurrencyCompact(analysis.kpis.estimatedMargin),
    },
    {
      label: "Produits à surveiller",
      value: formatNumber(analysis.kpis.productsAtRisk),
    },
  ];

  return `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SahelStock AI - Rapport d'analyse</title>
        <style>
          :root {
            color-scheme: light;
            --bg: #f8fafc;
            --panel: #ffffff;
            --line: #dbe4ef;
            --text: #0f172a;
            --muted: #475569;
            --soft: #64748b;
            --blue: #2563eb;
            --teal: #0f766e;
            --amber: #f59e0b;
            --emerald: #10b981;
            --red: #dc2626;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: linear-gradient(180deg, #eff6ff 0%, var(--bg) 18%, var(--bg) 100%);
            color: var(--text);
            font-family: Arial, Helvetica, sans-serif;
          }

          main {
            max-width: 1240px;
            margin: 0 auto;
            padding: 36px 24px 56px;
          }

          .hero,
          .panel {
            background: var(--panel);
            border: 1px solid var(--line);
            border-radius: 24px;
            box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
          }

          .hero {
            padding: 28px 30px;
            background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
            color: #ffffff;
          }

          .hero h1 {
            margin: 14px 0 10px;
            font-size: 34px;
            line-height: 1.1;
          }

          .hero p {
            margin: 0;
            max-width: 800px;
            color: rgba(255, 255, 255, 0.86);
            line-height: 1.7;
          }

          .eyebrow {
            display: inline-block;
            padding: 8px 12px;
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 12px;
            font-size: 12px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .hero-meta {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 14px;
            margin-top: 24px;
          }

          .hero-meta div {
            padding: 14px 16px;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
          }

          .hero-meta strong,
          .hero-meta span {
            display: block;
          }

          .hero-meta strong {
            margin-bottom: 6px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.72);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          .hero-meta span {
            font-size: 14px;
          }

          .section-title {
            margin: 34px 0 14px;
            font-size: 22px;
          }

          .kpi-grid,
          .chart-grid,
          .table-grid {
            display: grid;
            gap: 18px;
          }

          .kpi-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
            margin-top: 22px;
          }

          .chart-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin-top: 18px;
          }

          .table-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin-top: 18px;
          }

          .panel {
            padding: 22px;
          }

          .panel h2,
          .panel h3 {
            margin: 0 0 10px;
          }

          .kpi-card strong {
            display: block;
            margin-bottom: 10px;
            font-size: 12px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: var(--soft);
          }

          .kpi-card span {
            display: block;
            font-size: 30px;
            font-weight: 700;
            line-height: 1.1;
          }

          .summary-copy {
            margin: 0;
            color: var(--muted);
            line-height: 1.8;
          }

          .panel p.caption {
            margin: 0 0 14px;
            color: var(--soft);
            line-height: 1.6;
          }

          .chart-frame {
            margin-top: 12px;
          }

          .table-wrap {
            overflow: hidden;
            border: 1px solid var(--line);
            border-radius: 18px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }

          thead {
            background: #f8fafc;
          }

          th,
          td {
            padding: 12px 14px;
            border-bottom: 1px solid var(--line);
            text-align: left;
            vertical-align: top;
          }

          tbody tr:last-child td {
            border-bottom: 0;
          }

          th {
            color: var(--muted);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }

          td {
            color: var(--text);
          }

          .method {
            margin-top: 28px;
            padding: 20px 22px;
            border-radius: 22px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            color: #1e3a8a;
            line-height: 1.7;
          }

          @media print {
            body {
              background: #ffffff;
            }

            main {
              padding: 20px;
            }
          }

          @media (max-width: 1100px) {
            .kpi-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .chart-grid,
            .table-grid,
            .hero-meta {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <main>
          <section class="hero">
            <span class="eyebrow">Rapport d'analyse</span>
            <h1>SahelStock AI</h1>
            <p>${escapeHtml(summary)}</p>
            <div class="hero-meta">
              <div>
                <strong>Source</strong>
                <span>${escapeHtml(sourceLabel)}</span>
              </div>
              <div>
                <strong>Mise à jour des données</strong>
                <span>${escapeHtml(formatDateTime(importedAt))}</span>
              </div>
              <div>
                <strong>Génération du rapport</strong>
                <span>${escapeHtml(reportGeneratedAt)} - ${summaryMode === "openai" ? "Résumé IA" : "Résumé local"}</span>
              </div>
            </div>
          </section>

          <section class="kpi-grid">
            ${kpis
              .map(
                (item) => `
                  <article class="panel kpi-card">
                    <strong>${escapeHtml(item.label)}</strong>
                    <span>${escapeHtml(item.value)}</span>
                  </article>
                `,
              )
              .join("")}
          </section>

          <h2 class="section-title">Lecture rapide</h2>
          <section class="panel">
            <p class="summary-copy">
              Ce rapport consolide les ventes, les produits à surveiller, les besoins de réassort et les opportunités de marge. Il peut être joint tel quel à une soutenance, ou réutilisé comme base de travail pour un livrable PPT ou Excel.
            </p>
          </section>

          <h2 class="section-title">Graphiques clés</h2>
          <section class="chart-grid">
            <article class="panel">
              <h3>Ventes par mois</h3>
              <p class="caption">Évolution du chiffre d'affaires observé sur la période.</p>
              <div class="chart-frame">
                ${createVerticalBarChartSvg(
                  analysis.monthlySales,
                  "#2563eb",
                  (value) => formatCurrencyCompact(value),
                )}
              </div>
            </article>

            <article class="panel">
              <h3>Top produits</h3>
              <p class="caption">Références les plus fortes en volume de vente.</p>
              <div class="chart-frame">
                ${createHorizontalBarChartSvg(
                  analysis.topProducts,
                  "#0f766e",
                  (value) => `${formatNumber(value)} ventes`,
                )}
              </div>
            </article>

            <article class="panel">
              <h3>Stock vs seuil minimum</h3>
              <p class="caption">Lecture rapide des tensions de stock sur les produits suivis.</p>
              <div class="chart-frame">
                ${createGroupedBarChartSvg(analysis.stockVsMinimum)}
              </div>
            </article>

            <article class="panel">
              <h3>Niveau d'attention du stock</h3>
              <p class="caption">Répartition actuelle des produits selon le niveau d'alerte.</p>
              <div class="chart-frame">
                ${createDonutChartSvg(analysis.riskDistribution)}
              </div>
            </article>
          </section>

          <h2 class="section-title">Tables de décision</h2>
          <section class="table-grid">
            <article class="panel">
              <h3>Produits à surveiller</h3>
              <div class="table-wrap">
                ${buildTable(
                  ["Produit", "SKU", "Risque", "Stock", "Minimum"],
                  analysis.riskProducts.slice(0, 8).map((item) => [
                    item.name,
                    item.sku,
                    humanizeRiskLevel(item.riskLevel),
                    formatQuantityWithUnit(item.currentStock, item.unit),
                    formatQuantityWithUnit(item.minStock, item.unit),
                  ]),
                )}
              </div>
            </article>

            <article class="panel">
              <h3>Réassort suggéré</h3>
              <div class="table-wrap">
                ${buildTable(
                  ["Produit", "SKU", "À commander", "Prévision", "Fournisseur"],
                  analysis.reorderSuggestions.slice(0, 8).map((item) => [
                    item.name,
                    item.sku,
                    formatQuantityWithUnit(item.reorderQuantity, item.unit),
                    formatQuantityWithUnit(item.forecastUnits, item.unit),
                    item.supplier,
                  ]),
                )}
              </div>
            </article>

            <article class="panel">
              <h3>Meilleures ventes</h3>
              <div class="table-wrap">
                ${buildTable(
                  ["Produit", "SKU", "Volume", "Chiffre d'affaires"],
                  analysis.topSellers.slice(0, 8).map((item) => [
                    item.name,
                    item.sku,
                    formatQuantityWithUnit(item.totalUnitsSold, item.unit),
                    formatCurrency(item.totalRevenue),
                  ]),
                )}
              </div>
            </article>

            <article class="panel">
              <h3>Opportunités de marge</h3>
              <div class="table-wrap">
                ${buildTable(
                  ["Produit", "SKU", "Marge estimée"],
                  analysis.marginOpportunities.slice(0, 8).map((item) => [
                    item.name,
                    item.sku,
                    formatCurrency(item.estimatedMargin),
                  ]),
                )}
              </div>
            </article>
          </section>

          <section class="method">
            <strong>Méthode de lecture</strong><br />
            Le niveau de risque est dérivé d'un ratio simple entre le stock actuel, le stock minimum et la prévision du mois suivant. Le CSV reste utile pour les échanges de données brutes, tandis que ce rapport HTML sert de livrable visuel propre avec les graphiques, les KPI et les recommandations.
          </section>
        </main>
      </body>
    </html>
  `;
}

export function downloadDashboardReport(options: DashboardReportOptions) {
  downloadTextFile(
    "sahelstock-rapport-analyse.html",
    buildDashboardReportHtml(options),
    "text/html;charset=utf-8;",
  );
}
