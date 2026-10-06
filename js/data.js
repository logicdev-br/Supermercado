/**
 * SUPERMERCADO BOM PREÇO - DATABASE & LOCALSTORAGE STORE
 * Dados iniciais realistas para apresentação escolar de IA
 */

const STORAGE_KEYS = {
  BATCHES: 'bompreco_batches_v2',
  AUTH_USER: 'bompreco_auth_user_v2',
  METRICS: 'bompreco_metrics_v2',
  SETTINGS: 'bompreco_settings_v2'
};

// Usuários do Sistema
const DEFAULT_USERS = {
  gerente: {
    id: 'user_gerente_01',
    name: 'Robert Kennedy',
    role: 'gerente',
    roleName: 'Administrador / Gerente Geral',
    department: 'Gerência Executiva',
    avatar: 'RK',
    canApprove: true,
    canEditDiscounts: true,
    canViewExecutiveReports: true,
    canCreateBatch: true
  },
  comprador: {
    id: 'user_comprador_01',
    name: 'Mariana Silva',
    role: 'comprador',
    roleName: 'Comprador / Gestor de Estoque',
    department: 'Suprimentos & Compras',
    avatar: 'MS',
    canApprove: false,
    canEditDiscounts: true,
    canViewExecutiveReports: false,
    canCreateBatch: true
  }
};

// Dados de Lotes Iniciais com Vencimento & Fases do Fluxo (5 Passos)
const INITIAL_BATCHES = [
  {
    id: 'LOTE-2026-081',
    productName: 'Iogurte Grego Tradicional 500g',
    category: 'Laticínios',
    supplier: 'Laticínios Alvorada',
    expiryDate: '2026-09-21', // 3 dias restantes (crítico)
    quantity: 65,
    unit: 'un',
    costPrice: 6.20,
    originalPrice: 11.90,
    currentStep: 1, // 1: Identificação, 2: Análise, 3: Encaminhamento, 4: Execução, 5: Resolvido
    discountRecommended: 35,
    discountApplied: 0,
    assignedSector: 'Laticínios & Frios',
    responsiblePerson: 'Roberto Dias (Líder Laticínios)',
    actionDeadline: '2026-09-19 14:00',
    solutionCost: 120.00,
    solutionType: 'Etiquetagem Amarela com Desconto 35% no PDV',
    statusNote: 'Lote recebido com validade inferior a 15 dias na conferência do CD.',
    history: [
      { step: 1, timestamp: '2026-09-18 09:30', author: 'Mariana Silva', text: 'Identificado no recebimento com 3 dias de validade útil.' }
    ]
  },
  {
    id: 'LOTE-2026-082',
    productName: 'Queijo Mussarela Fatiado 400g',
    category: 'Frios & Embutidos',
    supplier: 'Queijaria Serra Dourada',
    expiryDate: '2026-09-22', // 4 dias
    quantity: 45,
    unit: 'un',
    costPrice: 14.50,
    originalPrice: 24.90,
    currentStep: 2, // Análise de Desconto
    discountRecommended: 30,
    discountApplied: 0,
    assignedSector: 'Frios & Laticínios',
    responsiblePerson: 'Mariana Silva',
    actionDeadline: '2026-09-19 18:00',
    solutionCost: 0,
    solutionType: 'Análise de Elasticidade de Preço por IA',
    statusNote: 'IA calculou 30% OFF para esgotar em 48h preservando 70% da margem bruta.',
    history: [
      { step: 1, timestamp: '2026-09-17 14:00', author: 'Mariana Silva', text: 'Lote registrado.' },
      { step: 2, timestamp: '2026-09-18 10:15', author: 'Sistema IA', text: 'Análise preditiva de desconto sugerida: 30% OFF.' }
    ]
  },
  {
    id: 'LOTE-2026-083',
    productName: 'Peito de Frango Resfriado 1kg',
    category: 'Açougue',
    supplier: 'Avícola Santa Rita',
    expiryDate: '2026-09-20', // 2 dias (crítico)
    quantity: 38,
    unit: 'kg',
    costPrice: 12.00,
    originalPrice: 19.99,
    currentStep: 3, // Encaminhamento
    discountRecommended: 40,
    discountApplied: 40,
    assignedSector: 'Açougue & Aves',
    responsiblePerson: 'Marcos Souza (Chefe Açougue)',
    actionDeadline: '2026-09-19 11:00',
    solutionCost: 95.00,
    solutionType: 'Combinação: Promoção Relâmpago no Balcão + Produção de Empanados Rotisseria',
    statusNote: 'Encaminhado ao setor de Açougue para ação imediata de balcão e rotisseria.',
    history: [
      { step: 1, timestamp: '2026-09-16 11:00', author: 'Mariana Silva', text: 'Lote cadastrado.' },
      { step: 2, timestamp: '2026-09-17 08:30', author: 'Sistema IA', text: 'Cálculo de 40% de desconto gerado.' },
      { step: 3, timestamp: '2026-09-18 08:00', author: 'Robert Kennedy', text: 'Encaminhado para Marcos Souza com SLA de 4h.' }
    ]
  },
  {
    id: 'LOTE-2026-084',
    productName: 'Pão de Forma Artesanal Grãos 500g',
    category: 'Padaria',
    supplier: 'Panificadora Bella Massa',
    expiryDate: '2026-09-21', // 3 dias
    quantity: 50,
    unit: 'un',
    costPrice: 4.80,
    originalPrice: 9.50,
    currentStep: 4, // Execução
    discountRecommended: 45,
    discountApplied: 45,
    assignedSector: 'Padaria & Confeitaria',
    responsiblePerson: 'Cláudia Ramos (Supervisora Frente de Loja)',
    actionDeadline: '2026-09-19 10:00',
    solutionCost: 40.00,
    solutionType: 'Etiqueta Amarela "Leve Mais por Menos" na Ilha de Entrada',
    statusNote: 'Preço promocional ativo no sistema PDV (R$ 5,22). 28 itens já vendidos hoje.',
    history: [
      { step: 1, timestamp: '2026-09-16 09:00', author: 'Mariana Silva', text: 'Lote identificado.' },
      { step: 2, timestamp: '2026-09-16 15:00', author: 'Sistema IA', text: 'Recomendação de 45% de desconto.' },
      { step: 3, timestamp: '2026-09-17 09:00', author: 'Mariana Silva', text: 'Encaminhado para Frente de Loja.' },
      { step: 4, timestamp: '2026-09-18 07:00', author: 'Cláudia Ramos', text: 'Promoção em execução no PDV.' }
    ]
  },
  {
    id: 'LOTE-2026-080',
    productName: 'Manga Tommy Importada Selecionada',
    category: 'Hortifrúti',
    supplier: 'Distribuidora Frutimax',
    expiryDate: '2026-09-19', // 1 dia (vence amanhã)
    quantity: 80,
    unit: 'kg',
    costPrice: 3.50,
    originalPrice: 7.99,
    currentStep: 5, // Resolvido
    discountRecommended: 50,
    discountApplied: 50,
    assignedSector: 'Hortifrúti',
    responsiblePerson: 'Juliano Prado (Líder Hortifrúti)',
    actionDeadline: '2026-09-18 18:00',
    solutionCost: 35.00,
    solutionType: 'Feirão de Ofertas Hortifrúti + Sucos Frescos na Lanchonete',
    statusNote: 'Lote 100% liquidado. Economia de R$ 560,00 e perda zero por descarte.',
    history: [
      { step: 1, timestamp: '2026-09-15 08:00', author: 'Mariana Silva', text: 'Lote cadastrado com 4 dias úteis.' },
      { step: 2, timestamp: '2026-09-15 10:00', author: 'Sistema IA', text: 'Desconto calculado: 50% OFF.' },
      { step: 3, timestamp: '2026-09-15 14:00', author: 'Robert Kennedy', text: 'Aprovado e encaminhado.' },
      { step: 4, timestamp: '2026-09-16 07:30', author: 'Juliano Prado', text: 'Em execução com banner promocional.' },
      { step: 5, timestamp: '2026-09-18 16:30', author: 'Robert Kennedy', text: 'Finalizado: 80kg vendidos com sucesso.' }
    ]
  },
  {
    id: 'LOTE-2026-085',
    productName: 'Leite UHT Integral 1L',
    category: 'Laticínios',
    supplier: 'Cooperativa Láctea Sul',
    expiryDate: '2026-09-24', // 6 dias
    quantity: 120,
    unit: 'un',
    costPrice: 3.80,
    originalPrice: 5.89,
    currentStep: 1, // Identificação
    discountRecommended: 20,
    discountApplied: 0,
    assignedSector: 'Mercearia & Líquidos',
    responsiblePerson: 'Não atribuído',
    actionDeadline: '2026-09-20 12:00',
    solutionCost: 0,
    solutionType: 'Pendente de Análise',
    statusNote: 'Grande volume. Recomendado acionar análise de elasticidade com urgência.',
    history: [
      { step: 1, timestamp: '2026-09-18 11:45', author: 'Mariana Silva', text: 'Lote registrado no sistema.' }
    ]
  },
  {
    id: 'LOTE-2026-086',
    productName: 'Carne Bovina Alcatra Bife 1kg',
    category: 'Açougue',
    supplier: 'Frigorífico Boi Nobre',
    expiryDate: '2026-09-20', // 2 dias
    quantity: 25,
    unit: 'kg',
    costPrice: 28.00,
    originalPrice: 44.90,
    currentStep: 2, // Análise
    discountRecommended: 35,
    discountApplied: 0,
    assignedSector: 'Açougue & Carnes',
    responsiblePerson: 'Mariana Silva',
    actionDeadline: '2026-09-19 12:00',
    solutionCost: 0,
    solutionType: 'Simulação de Margem por IA',
    statusNote: 'Item de alto valor agregado. Desconto de 35% evita descarte de R$ 700 em custo.',
    history: [
      { step: 1, timestamp: '2026-09-17 16:20', author: 'Mariana Silva', text: 'Identificado.' },
      { step: 2, timestamp: '2026-09-18 09:00', author: 'Sistema IA', text: 'Algoritmo recomenda 35% para giro em 24h.' }
    ]
  }
];

// Dados Históricos & Sazonais para o Módulo de Previsão de Demanda Mensal (IA)
const DEMAND_FORECAST_DATA = {
  categories: [
    { name: 'Laticínios & Frios', currentStock: 850, monthlyDemandAvg: 1200, predictedDemandNextMonth: 1450, trend: 'alta', reason: 'Sazonalidade de primavera/início de calor e promoções de café da manhã.', suggestedOrderAdjustment: '+20.8%' },
    { name: 'Açougue & Carnes', currentStock: 620, monthlyDemandAvg: 900, predictedDemandNextMonth: 980, trend: 'alta', reason: 'Previsão de alta no consumo em finais de semana de feriado.', suggestedOrderAdjustment: '+8.9%' },
    { name: 'Padaria & Confeitaria', currentStock: 410, monthlyDemandAvg: 600, predictedDemandNextMonth: 580, trend: 'estável', reason: 'Demanda estabilizada; manter nível de reposição diária sem excessos.', suggestedOrderAdjustment: '-3.3%' },
    { name: 'Hortifrúti', currentStock: 950, monthlyDemandAvg: 1500, predictedDemandNextMonth: 1720, trend: 'alta', reason: 'Safra favorável e maior procura por itens frescos no calor.', suggestedOrderAdjustment: '+14.6%' },
    { name: 'Mercearia Básica', currentStock: 2100, monthlyDemandAvg: 2000, predictedDemandNextMonth: 1850, trend: 'baixa', reason: 'Estoque de segurança elevado. Recomendado reduzir pedidos para evitar perdas.', suggestedOrderAdjustment: '-7.5%' }
  ],
  topSellingProducts: [
    { rank: 1, name: 'Leite Integral 1L', salesVolume: 3420, revenue: 20143.80, turnoverDays: 3.2, riskLevel: 'Baixo' },
    { rank: 2, name: 'Queijo Mussarela Fatiado 400g', salesVolume: 1890, revenue: 47061.00, turnoverDays: 4.8, riskLevel: 'Médio' },
    { rank: 3, name: 'Peito de Frango Resfriado 1kg', salesVolume: 1750, revenue: 34982.50, turnoverDays: 2.1, riskLevel: 'Alto (Validade Rápida)' },
    { rank: 4, name: 'Pão Francês / Artesanal', salesVolume: 2800, revenue: 16520.00, turnoverDays: 1.0, riskLevel: 'Baixo' },
    { rank: 5, name: 'Manga Tommy / Frutas da Estação', salesVolume: 1420, revenue: 11345.80, turnoverDays: 2.5, riskLevel: 'Médio' }
  ]
};

// Gerenciador do Banco Local
class DataStore {
  static getBatches() {
    const raw = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (!raw) {
      this.saveBatches(INITIAL_BATCHES);
      return INITIAL_BATCHES;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return INITIAL_BATCHES;
    }
  }

  static saveBatches(batches) {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
  }

  static addBatch(newBatch) {
    const batches = this.getBatches();
    batches.unshift(newBatch);
    this.saveBatches(batches);
    return batches;
  }

  static updateBatch(batchId, updatedFields) {
    const batches = this.getBatches();
    const index = batches.findIndex(b => b.id === batchId);
    if (index !== -1) {
      batches[index] = { ...batches[index], ...updatedFields };
      this.saveBatches(batches);
      return batches[index];
    }
    return null;
  }

  static deleteBatch(batchId) {
    let batches = this.getBatches();
    batches = batches.filter(b => b.id !== batchId);
    this.saveBatches(batches);
    return batches;
  }

  static resetToDefault() {
    this.saveBatches(INITIAL_BATCHES);
    return INITIAL_BATCHES;
  }
}
