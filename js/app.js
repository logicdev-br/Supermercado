/**
 * SUPERMERCADO BOM PREÇO - ORQUESTRADOR PRINCIPAL (APP.JS)
 * Navegação, Controle de Modais, Simulador em Tempo Real e Toasts
 */

class App {
  static init() {
    // 1. Inicializa Autenticação
    AuthManager.init();

    // 2. Inicializa Kanban
    KanbanBoard.init();

    // 3. Inicializa Gráficos e KPIs
    DashboardCharts.init();

    // 4. Configura Navegação e Modais
    this.setupNavigation();
    this.setupModals();
    this.setupSimulator();
    this.setupRoleSwitcher();
    this.renderDemandTable();

    // 5. Inicializa Ícones Lucide
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  static setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-target]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.getAttribute('data-target');
        this.switchTab(targetId);
      });
    });
  }

  static switchTab(tabId) {
    // Remove active da nav
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));
    const currentNav = document.querySelector(`.sidebar-nav .nav-item[data-target="${tabId}"]`);
    if (currentNav) currentNav.classList.add('active');

    // Troca view ativa
    document.querySelectorAll('.tab-view').forEach(view => view.classList.remove('active'));
    const targetView = document.getElementById(tabId);
    if (targetView) targetView.classList.add('active');

    // Atualiza título da página
    const titles = {
      'tab-dashboard': { title: 'Dashboard Executivo & Indicadores', sub: 'Visão geral de perdas evitadas, previsão de demanda e giro' },
      'tab-kanban': { title: 'Fluxo de Validade & Ações (5 Etapas)', sub: 'Acompanhamento do ciclo de vida dos lotes críticos' },
      'tab-ai-simulator': { title: 'Motor de IA & Previsão de Demanda', sub: 'Algoritmos preditivos de compras, sazonalidade e descontos' },
      'tab-reports': { title: 'Relatórios de Margem & Soluções', sub: 'Auditoria de custos, soluções adotadas e ranking de produtos' },
      'tab-presentation-guide': { title: 'Roteiro para Apresentação Escolar de IA', sub: 'Guia passo a passo dos conceitos e demonstrações do sistema' }
    };

    const headerTitle = document.getElementById('pageMainTitle');
    const headerSub = document.getElementById('pageMainSub');
    if (headerTitle && titles[tabId]) headerTitle.textContent = titles[tabId].title;
    if (headerSub && titles[tabId]) headerSub.textContent = titles[tabId].sub;

    if (window.lucide) lucide.createIcons();
  }

  static setupRoleSwitcher() {
    const switcher = document.getElementById('headerRoleSwitcher');
    if (switcher) {
      switcher.addEventListener('change', (e) => {
        const newRole = e.target.value;
        AuthManager.setUser(newRole);
        this.showToast(`Perfil alterado para: ${DEFAULT_USERS[newRole].roleName}`, 'info');
      });
    }
  }

  static setupModals() {
    // Botão de Novo Lote
    const btnNew = document.getElementById('btnOpenNewBatchModal');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        this.openModal('modalNewBatch');
      });
    }

    // Formulário de Cadastro de Novo Lote
    const formNewBatch = document.getElementById('formNewBatch');
    if (formNewBatch) {
      formNewBatch.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateBatch(formNewBatch);
      });
    }

    // Formulário de Encaminhamento
    const formAssign = document.getElementById('formAssignBatch');
    if (formAssign) {
      formAssign.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAssignBatch(formAssign);
      });
    }

    // Formulário de Conclusão / Resolução
    const formResolve = document.getElementById('formResolveBatch');
    if (formResolve) {
      formResolve.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleResolveBatch(formResolve);
      });
    }
  }

  static openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      if (window.lucide) lucide.createIcons();
    }
  }

  static closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  static handleCreateBatch(form) {
    const productName = form.productName.value.trim();
    const category = form.category.value;
    const supplier = form.supplier.value.trim() || 'Fornecedor Cadastrado';
    const expiryDate = form.expiryDate.value;
    const quantity = parseInt(form.quantity.value, 10);
    const unit = form.unit.value;
    const costPrice = parseFloat(form.costPrice.value);
    const originalPrice = parseFloat(form.originalPrice.value);
    const statusNote = form.statusNote.value.trim() || 'Cadastrado pelo sistema.';

    if (!productName || !expiryDate || !quantity || !costPrice || !originalPrice) {
      this.showToast('Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    const days = SupermarketAIEngine.getDaysToExpiry(expiryDate);
    const aiSim = SupermarketAIEngine.calculateDiscountRecommendation({
      daysToExpiry: days,
      quantity,
      costPrice,
      originalPrice,
      category
    });

    const user = AuthManager.getCurrentUser();
    const newId = `LOTE-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newBatch = {
      id: newId,
      productName,
      category,
      supplier,
      expiryDate,
      quantity,
      unit,
      costPrice,
      originalPrice,
      currentStep: 1, // Passo 1: Identificação
      discountRecommended: aiSim.discountPercent,
      discountApplied: 0,
      assignedSector: category,
      responsiblePerson: 'Pendente de Atribuição',
      actionDeadline: 'Aguardando Encaminhamento',
      solutionCost: 0,
      solutionType: 'Identificação Inicial',
      statusNote,
      history: [
        {
          step: 1,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' hoje',
          author: user ? user.name : 'Operador',
          text: `Lote identificado com ${days} dias para vencer. IA recomendou ${aiSim.discountPercent}% OFF.`
        }
      ]
    };

    DataStore.addBatch(newBatch);
    KanbanBoard.render();
    DashboardCharts.refreshAll();
    this.closeModal('modalNewBatch');
    form.reset();
    this.showToast(`Lote ${newId} (${productName}) criado com sucesso!`, 'success');
  }

  static openAssignModalWithData(batch) {
    const form = document.getElementById('formAssignBatch');
    if (!form) return;

    form.batchId.value = batch.id;
    document.getElementById('assignBatchName').textContent = `${batch.id} - ${batch.productName}`;
    form.assignedSector.value = batch.category;
    form.responsiblePerson.value = batch.responsiblePerson !== 'Não atribuído' ? batch.responsiblePerson : '';
    form.solutionCost.value = batch.solutionCost || 50;
    
    this.openModal('modalAssignBatch');
  }

  static handleAssignBatch(form) {
    const batchId = form.batchId.value;
    const assignedSector = form.assignedSector.value;
    const responsiblePerson = form.responsiblePerson.value;
    const actionDeadline = form.actionDeadline.value;
    const solutionCost = parseFloat(form.solutionCost.value) || 0;
    const solutionType = form.solutionType.value;

    const batches = DataStore.getBatches();
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    batch.assignedSector = assignedSector;
    batch.responsiblePerson = responsiblePerson;
    batch.actionDeadline = actionDeadline;
    batch.solutionCost = solutionCost;
    batch.solutionType = solutionType;
    batch.currentStep = 3; // Passo 3: Encaminhamento

    const user = AuthManager.getCurrentUser();
    batch.history.push({
      step: 3,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' hoje',
      author: user ? user.name : 'Gestor',
      text: `Encaminhado para ${assignedSector} (Resp: ${responsiblePerson}) com prazo ${actionDeadline}. Custo: R$ ${solutionCost.toFixed(2)}.`
    });

    DataStore.updateBatch(batchId, batch);
    KanbanBoard.render();
    DashboardCharts.refreshAll();
    this.closeModal('modalAssignBatch');
    this.showToast(`Lote ${batchId} encaminhado para ${assignedSector}!`, 'success');
  }

  static openResolveModalWithData(batch) {
    const form = document.getElementById('formResolveBatch');
    if (!form) return;

    form.batchId.value = batch.id;
    document.getElementById('resolveBatchName').textContent = `${batch.id} - ${batch.productName}`;
    form.unitsSold.value = batch.quantity;
    
    const disc = batch.discountApplied || batch.discountRecommended || 30;
    const finalPrice = batch.originalPrice * (1 - disc / 100);
    const economy = finalPrice * batch.quantity;
    document.getElementById('resolveEstimatedEconomy').textContent = `R$ ${economy.toFixed(2)}`;

    this.openModal('modalResolveBatch');
  }

  static handleResolveBatch(form) {
    const batchId = form.batchId.value;
    const unitsSold = parseInt(form.unitsSold.value, 10);
    const finalOutcomeNote = form.finalOutcomeNote.value;

    const batches = DataStore.getBatches();
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return;

    batch.currentStep = 5; // Passo 5: Resolvido
    batch.statusNote = `Concluído: ${unitsSold} unidades vendidas com promoção. ${finalOutcomeNote}`;

    const user = AuthManager.getCurrentUser();
    batch.history.push({
      step: 5,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' hoje',
      author: user ? user.name : 'Gerência',
      text: `Resolvido: Lote liquidado com sucesso. ${finalOutcomeNote}`
    });

    DataStore.updateBatch(batchId, batch);
    KanbanBoard.render();
    DashboardCharts.refreshAll();
    this.closeModal('modalResolveBatch');
    this.showToast(`🎉 Lote ${batchId} marcado como RESOLVIDO! Margem salva com sucesso.`, 'success');
  }

  static setupSimulator() {
    const btnRunSim = document.getElementById('btnRunAiSimulator');
    if (!btnRunSim) return;

    const runCalculation = () => {
      const days = parseInt(document.getElementById('simDaysToExpiry').value, 10);
      const qty = parseInt(document.getElementById('simQuantity').value, 10);
      const cost = parseFloat(document.getElementById('simCostPrice').value);
      const original = parseFloat(document.getElementById('simOriginalPrice').value);
      const category = document.getElementById('simCategory').value;

      const result = SupermarketAIEngine.calculateDiscountRecommendation({
        daysToExpiry: days,
        quantity: qty,
        costPrice: cost,
        originalPrice: original,
        category
      });

      document.getElementById('simOutputDiscount').textContent = `${result.discountPercent}%`;
      document.getElementById('simOutputNewPrice').textContent = `R$ ${result.newPrice.toFixed(2)}`;
      document.getElementById('simOutputRecoveredMargin').textContent = `R$ ${result.wasteLossAvoided.toFixed(2)}`;
      document.getElementById('simOutputRecoveredRate').textContent = `${result.recoveredCostRate}%`;
      document.getElementById('simOutputReasoning').textContent = result.reasoning;
    };

    btnRunSim.addEventListener('click', runCalculation);
    
    // Calcula na inicialização
    runCalculation();
  }

  static renderDemandTable() {
    const tableBody = document.getElementById('demandForecastTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = DEMAND_FORECAST_DATA.categories.map(cat => {
      const isHigh = cat.trend === 'alta';
      const badgeClass = isHigh ? 'background: #DCFCE7; color: #166534;' : (cat.trend === 'baixa' ? 'background: #FEE2E2; color: #991B1B;' : 'background: #FEF3C7; color: #92400E;');
      
      return `
        <tr>
          <td><strong>${cat.name}</strong></td>
          <td>${cat.currentStock} un</td>
          <td>${cat.monthlyDemandAvg} un</td>
          <td><strong style="color: #047857;">${cat.predictedDemandNextMonth} un</strong></td>
          <td>
            <span style="font-size: 0.75rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 9999px; ${badgeClass}">
              ${cat.trend.toUpperCase()}
            </span>
          </td>
          <td><strong style="color: ${isHigh ? '#059669' : '#D97706'}">${cat.suggestedOrderAdjustment}</strong></td>
          <td style="font-size: 0.78rem; color: #64748B;">${cat.reason}</td>
        </tr>
      `;
    }).join('');
  }

  static showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconName = 'check-circle';
    if (type === 'warning') iconName = 'alert-triangle';
    if (type === 'info') iconName = 'info';

    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width: 18px; height: 18px; flex-shrink: 0;"></i>
      <span style="font-size: 0.82rem; font-weight: 600;">${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
