/**
 * SUPERMERCADO BOM PREÇO - DASHBOARDS & GRÁFICOS INTERATIVOS
 * Integração Chart.js para indicadores de desconto, previsão de demanda e giro
 */

class DashboardCharts {
  static discountMarginChart = null;
  static demandForecastChart = null;
  static topProductsChart = null;
  static costSolutionChart = null;

  static init() {
    // Configurações globais elegantes para Chart.js
    if (window.Chart) {
      Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
      Chart.defaults.color = '#64748B';
      Chart.defaults.plugins.legend.labels.boxWidth = 12;
      Chart.defaults.plugins.legend.labels.font = {
        family: "'Plus Jakarta Sans', sans-serif",
        size: 11,
        weight: '500'
      };
    }

    this.renderKPIs();
    this.initDiscountMarginChart();
    this.initDemandForecastChart();
    this.initTopProductsChart();
    this.initCostSolutionChart();
    
    // Escuta atualizações de lotes para atualizar gráficos em tempo real
    window.addEventListener('bompreco:batch_updated', () => {
      this.refreshAll();
    });
  }

  static refreshAll() {
    this.renderKPIs();
    this.updateDiscountMarginChart();
    this.updateCostSolutionChart();
  }

  static renderKPIs() {
    const batches = DataStore.getBatches();
    
    // 1. Lotes em risco (passos 1 a 4)
    const activeRiskBatches = batches.filter(b => b.currentStep < 5);
    const criticalBatches = activeRiskBatches.filter(b => SupermarketAIEngine.getDaysToExpiry(b.expiryDate) <= 2);
    
    // 2. Economia Total Salva (produtos com desconto aplicado ou resolvidos)
    let totalEconomySaved = 0;
    let totalSolutionCost = 0;
    let totalDiscountAppliedSum = 0;
    let discountCount = 0;

    batches.forEach(b => {
      totalSolutionCost += (b.solutionCost || 0);
      if (b.discountApplied > 0 || b.currentStep === 5) {
        const disc = b.discountApplied || b.discountRecommended || 30;
        const finalPrice = b.originalPrice * (1 - disc / 100);
        totalEconomySaved += (finalPrice * b.quantity);
        totalDiscountAppliedSum += disc;
        discountCount++;
      }
    });

    const avgDiscount = discountCount > 0 ? (totalDiscountAppliedSum / discountCount).toFixed(1) : '32.5';
    
    // Atualiza elementos DOM de KPIs
    const elRiskCount = document.getElementById('kpiRiskCount');
    const elCriticalCount = document.getElementById('kpiCriticalCount');
    const elEconomySaved = document.getElementById('kpiEconomySaved');
    const elAvgDiscount = document.getElementById('kpiAvgDiscount');
    const elWasteRate = document.getElementById('kpiWasteRate');

    if (elRiskCount) elRiskCount.textContent = activeRiskBatches.length;
    if (elCriticalCount) elCriticalCount.textContent = `${criticalBatches.length} críticos (< 48h)`;
    if (elEconomySaved) elEconomySaved.textContent = `R$ ${totalEconomySaved.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (elAvgDiscount) elAvgDiscount.textContent = `${avgDiscount}%`;
    if (elWasteRate) elWasteRate.textContent = '96.8%';
  }

  static initDiscountMarginChart() {
    const ctx = document.getElementById('chartDiscountMargin');
    if (!ctx) return;

    this.discountMarginChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Laticínios', 'Açougue', 'Padaria', 'Hortifrúti', 'Frios', 'Mercearia'],
        datasets: [
          {
            label: 'Desconto Médio Aplicado (%)',
            data: [35, 40, 45, 50, 30, 20],
            backgroundColor: 'rgba(227, 6, 19, 0.85)',
            borderColor: '#C50510',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'Margem Salva / Recuperada (R$ x100)',
            data: [42, 58, 28, 65, 38, 49],
            backgroundColor: 'rgba(0, 70, 184, 0.85)',
            borderColor: '#003894',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { font: { family: 'Plus Jakarta Sans', weight: '600' } } },
          tooltip: {
            callbacks: {
              label: function(context) {
                if (context.datasetIndex === 0) return `${context.dataset.label}: ${context.raw}%`;
                return `${context.dataset.label}: R$ ${(context.raw * 100).toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Desconto (%)' }, min: 0, max: 70 },
          y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Margem (R$ x100)' } }
        }
      }
    });
  }

  static initDemandForecastChart() {
    const ctx = document.getElementById('chartDemandForecast');
    if (!ctx) return;

    this.demandForecastChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set (Atual)', 'Out (IA)', 'Nov (IA)', 'Dez (IA)'],
        datasets: [
          {
            label: 'Consumo Real Histórico (unidades)',
            data: [5200, 4900, 5600, 5400, 5800, 6100, 5950, 6300, 6450, null, null, null],
            borderColor: '#64748B',
            backgroundColor: 'rgba(100, 116, 139, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: false
          },
          {
            label: 'Previsão de Demanda com IA (Otimizada)',
            data: [null, null, null, null, null, null, null, null, 6450, 6800, 7250, 8400],
            borderColor: '#0046B8',
            backgroundColor: 'rgba(0, 70, 184, 0.12)',
            borderWidth: 3,
            borderDash: [5, 5],
            tension: 0.3,
            fill: true,
            pointBackgroundColor: '#003894',
            pointRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { family: 'Plus Jakarta Sans', weight: '600' } } }
        },
        scales: {
          y: { title: { display: true, text: 'Volume de Demanda (unidades)' } }
        }
      }
    });
  }

  static initTopProductsChart() {
    const ctx = document.getElementById('chartTopProducts');
    if (!ctx) return;

    this.topProductsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          'Leite Integral 1L',
          'Pão Francês',
          'Queijo Mussarela 400g',
          'Peito de Frango 1kg',
          'Manga Tommy'
        ],
        datasets: [{
          label: 'Giro de Vendas (Unidades/Mês)',
          data: [3420, 2800, 1890, 1750, 1420],
          backgroundColor: [
            '#0046B8',
            '#1D4ED8',
            '#2563EB',
            '#3B82F6',
            '#60A5FA'
          ],
          borderRadius: 4
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { 
            grid: { color: '#F1F5F9' },
            title: { display: true, text: 'Unidades Vendidas', font: { size: 11, weight: '500' } } 
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  }

  static initCostSolutionChart() {
    const ctx = document.getElementById('chartCostSolution');
    if (!ctx) return;

    this.costSolutionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Perda Evitada (Economia)', 'Custo Operacional', 'Margem Descontada'],
        datasets: [{
          data: [18450, 680, 2430],
          backgroundColor: [
            '#0046B8', // Azul Oficial Bompreço
            '#E30613', // Vermelho Oficial Bompreço
            '#F59E0B'  // Âmbar suave
          ],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { 
              font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '500' },
              padding: 14
            } 
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: R$ ${context.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        },
        cutout: '74%'
      }
    });
  }

  static updateDiscountMarginChart() {
    if (!this.discountMarginChart) return;
    // Pequena animação dinâmica
    this.discountMarginChart.update();
  }

  static updateCostSolutionChart() {
    if (!this.costSolutionChart) return;
    this.costSolutionChart.update();
  }
}
