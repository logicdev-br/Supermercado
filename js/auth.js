/**
 * SUPERMERCADO BOM PREÇO - AUTENTICAÇÃO E CONTROLE DE PERFIS
 * Níveis de Acesso: Administrador / Gerente Geral & Comprador / Gestor de Estoque
 */

class AuthManager {
  static currentUser = null;

  static init() {
    const savedRole = localStorage.getItem(STORAGE_KEYS.AUTH_USER) || 'gerente';
    this.setUser(savedRole);
  }

  static setUser(roleKey) {
    const user = DEFAULT_USERS[roleKey] || DEFAULT_USERS.gerente;
    this.currentUser = user;
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, roleKey);
    this.updateUI();
    
    // Dispara evento customizado para outros componentes
    window.dispatchEvent(new CustomEvent('bompreco:auth_changed', { detail: user }));
    return user;
  }

  static getCurrentUser() {
    if (!this.currentUser) {
      this.init();
    }
    return this.currentUser;
  }

  static hasPermission(permissionName) {
    const user = this.getCurrentUser();
    return !!user[permissionName];
  }

  static updateUI() {
    const user = this.getCurrentUser();
    
    // Atualiza badges no Header
    const avatarEl = document.getElementById('headerUserAvatar');
    const nameEl = document.getElementById('headerUserName');
    const roleEl = document.getElementById('headerUserRole');
    const selectEl = document.getElementById('headerRoleSwitcher');

    if (avatarEl) avatarEl.textContent = user.avatar;
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.roleName;
    if (selectEl) selectEl.value = user.role;

    // Atualiza elementos protegidos por perfil
    document.querySelectorAll('[data-permission]').forEach(el => {
      const required = el.getAttribute('data-permission');
      if (user[required]) {
        el.style.display = '';
        el.classList.remove('permission-locked');
      } else {
        el.classList.add('permission-locked');
        if (el.tagName === 'BUTTON' || el.tagName === 'INPUT') {
          el.disabled = true;
        }
      }
    });
  }
}
