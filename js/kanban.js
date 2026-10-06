/**
 * SUPERMERCADO BOM PREÇO - KANBAN INTERATIVO (5 PASSOS DO PROBLEMA)
 * 1. Identificação -> 2. Análise de Desconto -> 3. Encaminhamento -> 4. Execução -> 5. Conclusão (Resolvido)
 */

class KanbanBoard {
  static currentSearch = '';
  static currentCategoryFilter = 'all';

  static init() {
    this.render();
    this.setupEventListeners();
  }

  static setupEventListeners() {
    // Busca em tempo real
    const searchInput = document.getElementById('kanbanSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentSearch = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Filtro de Categoria
    const categorySelect = document.getElementById('kanbanCategoryFilter');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        this.currentCategoryFilter = e.target.value;
        this.render();
      });
    }

    // Drag and drop listeners nas colunas
    document.querySelectorAll('.kanban-cards-container').forEach(container => {
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.classList.add('drag-over');
      });

      container.addEventListener('dragleave', () => {
        container.classList.remove('drag-over');
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        container.classList.remove('drag-over');
        const batchId = e.dataTransfer.getData('text/plain');
        const targetStep = parseInt(container.getAttribute('data-step'), 10);
        
        if (batchId && targetStep) {
          this.moveBatchToStep(batchId, targetStep);
        }
      });
    });
  }

  static moveBatchToStep(batchId, targetStep) {
    const batches = DataStore.getBatches();
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    // Se estiver avançando para Análise (Passo 2), recalcular recomendação de IA
    if (targetStep === 2 && batch.discountRecommended === 0) {
      const days = SupermarketAIEngine.getDaysToExpiry(batch.expiryDate);
      const aiResult = SupermarketAIEngine.calculateDiscountRecommendation({
        daysToExpiry: days,
        quantity: batch.quantity,
        costPrice: batch.costPrice,
        originalPrice: batch.originalPrice,
        category: batch.category
      });
      batch.discountRecommended = aiResult.discountPercent;
      batch.statusNote = aiResult.reasoning;
    }

    // Se estiver avançando para Execução (Passo 4), aplicar o desconto
    if (targetStep === 4 && batch.discountApplied === 0) {
      batch.discountApplied = batch.discountRecommended || 30;
    }

    const stepNames = {
      1: 'Identificação',
      2: 'Análise de Desconto (IA)',
      3: 'Encaminhamento',
      4: 'Execução',
      5: 'Conclusão (Resolvido)'
    };

    const user = AuthManager.getCurrentUser();
    const historyEntry = {
      step: targetStep,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' hoje',
      author: user ? user.name : 'Sistema',
      text: `Movido para a etapa: ${stepNames[targetStep]}`
    };

    batch.currentStep = targetStep;
    if (!batch.history) batch.history = [];
    batch.history.push(historyEntry);

    DataStore.updateBatch(batchId, batch);
    this.render();
    
    // Atualiza KPIs e Gráficos no Dashboard
    window.dispatchEvent(new CustomEvent('bompreco:batch_updated'));
    App.showToast(`Lote ${batch.id} movido para ${stepNames[targetStep]}!`, 'success');
  }

  static render() {
    const batches = DataStore.getBatches();
    const filtered = batches.filter(batch => {
      const matchSearch = !this.currentSearch || 
        batch.productName.toLowerCase().includes(this.currentSearch) ||
        batch.id.toLowerCase().includes(this.currentSearch) ||
        batch.category.toLowerCase().includes(this.currentSearch);

      const matchCategory = this.currentCategoryFilter === 'all' || batch.category === this.currentCategoryFilter;
      return matchSearch && matchCategory;
    });

    // Limpa colunas
    for (let step = 1; step <= 5; step++) {
      const colEl = document.getElementById(`kanban-step-${step}`);
      const countEl = document.getElementById(`count-step-${step}`);
      if (colEl) colEl.innerHTML = '';
      if (countEl) {
        const stepBatches = filtered.filter(b => b.currentStep === step);
        countEl.textContent = stepBatches.length;
      }
    }

    // Renderiza cards em cada coluna
    filtered.forEach(batch => {
      const container = document.getElementById(`kanban-step-${batch.currentStep}`);
      if (container) {
        const cardEl = this.createCardElement(batch);
        container.appendChild(cardEl);
      }
    });

    // Se alguma coluna estiver vazia, exibe placeholder discreto
    for (let step = 1; step <= 5; step++) {
      const colEl = document.getElementById(`kanban-step-${step}`);
      if (colEl && colEl.children.length === 0) {
        colEl.innerHTML = `
          <div style="text-align: center; padding: 2rem 1rem; color: var(--text-subtle); font-size: 0.8rem; border: 2px dashed #CBD5E1; border-radius: var(--radius-md);">
            <i data-lucide="inbox" style="width: 24px; height: 24px; margin-bottom: 0.5rem; opacity: 0.5;"></i>
            <p>Nenhum lote nesta etapa</p>
          </div>
        `;
      }
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  }

  static createCardElement(batch) {
    const daysToExpiry = SupermarketAIEngine.getDaysToExpiry(batch.expiryDate);
    
    // Status visual de urgência
    let expiryClass = 'safe';
    let cardBorderClass = 'safe-expiry';
    let urgencyBadge = `<i data-lucide="clock" style="width: 12px; height: 12px;"></i> ${daysToExpiry} dias úteis`;
    
    if (daysToExpiry <= 1) {
      expiryClass = 'critical';
      cardBorderClass = 'critical-expiry';
      urgencyBadge = `<i data-lucide="alert-triangle" style="width: 12px; height: 12px;"></i> Vence em 24h!`;
    } else if (daysToExpiry <= 3) {
      expiryClass = 'warning';
      cardBorderClass = 'warning-expiry';
      urgencyBadge = `<i data-lucide="alert-circle" style="width: 12px; height: 12px;"></i> Faltam ${daysToExpiry} dias`;
    }

    // Cálculo da simulação de IA
    const aiSim = SupermarketAIEngine.calculateDiscountRecommendation({
      daysToExpiry,
      quantity: batch.quantity,
      costPrice: batch.costPrice,
      originalPrice: batch.originalPrice,
      category: batch.category
    });

    const card = document.createElement('div');
    card.className = `batch-card ${cardBorderClass}`;
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', batch.id);

    // Eventos de Drag & Drop
    card.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', batch.id);
      card.style.opacity = '0.5';
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
    });

    // Próxima Ação CTA baseada no passo atual
    let nextStepBtn = '';
    if (batch.currentStep === 1) {
      nextStepBtn = `<button class="btn btn-outline card-step-btn" onclick="KanbanBoard.moveBatchToStep('${batch.id}', 2)">
        <i data-lucide="brain-circuit" style="width: 13px; height: 13px; color: var(--primary-600);"></i> Simular IA
      </button>`;
    } else if (batch.currentStep === 2) {
      nextStepBtn = `<button class="btn btn-outline card-step-btn" onclick="KanbanBoard.openAssignModal('${batch.id}')">
        <i data-lucide="send" style="width: 13px; height: 13px; color: var(--amber-600);"></i> Encaminhar
      </button>`;
    } else if (batch.currentStep === 3) {
      nextStepBtn = `<button class="btn btn-primary card-step-btn" onclick="KanbanBoard.moveBatchToStep('${batch.id}', 4)">
        <i data-lucide="tag" style="width: 13px; height: 13px;"></i> Ativar PDV
      </button>`;
    } else if (batch.currentStep === 4) {
      nextStepBtn = `<button class="btn btn-primary card-step-btn" onclick="KanbanBoard.openResolveModal('${batch.id}')">
        <i data-lucide="check-circle" style="width: 13px; height: 13px;"></i> Concluir
      </button>`;
    } else {
      nextStepBtn = `<span style="font-size: 0.72rem; color: var(--primary-700); font-weight: 600; display: flex; align-items: center; gap: 0.25rem;">
        <i data-lucide="badge-check" style="width: 14px; height: 14px;"></i> Resolvido
      </span>`;
    }

    card.innerHTML = `
      <div class="card-top-tags">
        <span class="sector-tag">${batch.category}</span>
        <span class="expiry-tag ${expiryClass}">${urgencyBadge}</span>
      </div>

      <h4 class="card-product-title">${batch.productName}</h4>
      <div class="card-batch-code">${batch.id} • Vencimento: ${batch.expiryDate}</div>

      <div class="card-quick-metrics">
        <div class="quick-metric-item">
          <span>Estoque:</span>
          <strong>${batch.quantity} ${batch.unit}</strong>
        </div>
        <div class="quick-metric-item" style="text-align: right;">
          <span>Preço:</span>
          <strong style="${batch.discountApplied > 0 ? 'color: var(--primary-700);' : ''}">
            R$ ${(batch.originalPrice * (1 - (batch.discountApplied || 0) / 100)).toFixed(2)}
            ${batch.discountApplied > 0 ? `<small style="text-decoration: line-through; color: var(--text-subtle); margin-left: 2px;"> R$ ${batch.originalPrice.toFixed(2)}</small>` : ''}
          </strong>
        </div>
      </div>

      <!-- Detalhes Expansíveis via Collapse -->
      <div class="card-details-collapse" id="collapse-${batch.id}">
        <div class="ai-recommendation-box">
          <div class="ai-box-title">
            <i data-lucide="sparkles" style="width: 13px; height: 13px;"></i>
            IA Recomenda: <span class="ai-discount-pill">${aiSim.discountPercent}% OFF</span>
          </div>
          <p class="ai-reasoning-text">${aiSim.reasoning}</p>
        </div>

        <div class="card-meta-list">
          <div class="card-meta-row">
            <span>Fornecedor:</span>
            <strong>${batch.supplier || 'Padrão'}</strong>
          </div>
          <div class="card-meta-row">
            <span>Setor Atribuído:</span>
            <strong>${batch.assignedSector || 'Pendente'}</strong>
          </div>
          <div class="card-meta-row">
            <span>Responsável / SLA:</span>
            <strong>${batch.actionDeadline || 'Não definido'}</strong>
          </div>
          <div class="card-meta-row">
            <span>Custo da Solução:</span>
            <strong>R$ ${(batch.solutionCost || 0).toFixed(2)}</strong>
          </div>
          <div class="card-meta-row">
            <span>Desperdício Evitado:</span>
            <strong style="color: var(--primary-700);">R$ ${aiSim.wasteLossAvoided.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div class="card-actions-row">
        <button class="toggle-details-btn" onclick="KanbanBoard.toggleCardDetails('${batch.id}')">
          <i data-lucide="chevron-down" id="icon-toggle-${batch.id}" style="width: 14px; height: 14px;"></i> Detalhes
        </button>
        ${nextStepBtn}
      </div>
    `;

    return card;
  }

  static toggleCardDetails(batchId) {
    const card = document.querySelector(`.batch-card[data-id="${batchId}"]`);
    if (card) {
      card.classList.toggle('expanded');
      const icon = document.getElementById(`icon-toggle-${batchId}`);
      if (icon) {
        if (card.classList.contains('expanded')) {
          icon.style.transform = 'rotate(180deg)';
        } else {
          icon.style.transform = 'rotate(0deg)';
        }
      }
    }
  }

  static openAssignModal(batchId) {
    const batch = DataStore.getBatches().find(b => b.id === batchId);
    if (!batch) return;
    App.openAssignModalWithData(batch);
  }

  static openResolveModal(batchId) {
    const batch = DataStore.getBatches().find(b => b.id === batchId);
    if (!batch) return;
    App.openResolveModalWithData(batch);
  }
}
