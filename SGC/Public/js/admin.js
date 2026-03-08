// =========================================================
// ADMIN CRUD - USERS (Create / Read / Update / Delete)
// Troque esta implementação depois por API/BD quando quiser.
// =========================================================

// === STATE (LOCAL) ===
let users = [];
let adminLogado = null;
let editandoId = null; // id do usuário em edição

// === STORAGE KEYS (para localizar fácil) ===
const KEY_USUARIOS = "usuarios";
const KEY_LOGADO = "usuarioLogado";

// === BOOTSTRAP / PROTEÇÃO DA TELA ===
async function carregarUsuarios() {
    // [SEGURANÇA BÁSICA] Somente admin entra
    const logadoStr = localStorage.getItem(KEY_LOGADO);
    if (!logadoStr) {
        alert("Acesso negado. Faça login.");
        window.location.href = "index.html";
        return;
    }

    try {
        adminLogado = JSON.parse(logadoStr);
    } catch {
        localStorage.removeItem(KEY_LOGADO);
        window.location.href = "index.html";
        return;
    }

    if (adminLogado.role !== "admin") {
        alert("Apenas administrador pode aceder ao painel.");
        window.location.href = "usuario.html";
        return;
    }

    // [FONTE DOS DADOS] localStorage primeiro, JSON só para inicializar
    const local = localStorage.getItem(KEY_USUARIOS);
    if (local) {
        try {
            users = JSON.parse(local) || [];
        } catch {
            users = [];
        }
    } else {
        const res = await fetch("data/users.json");
        users = await res.json();
        localStorage.setItem(KEY_USUARIOS, JSON.stringify(users));
    }

    // Normaliza ids para não quebrar edição/remoção
    users = (users || []).map((u) => ({
        id: typeof u.id === "number" ? u.id : Date.now() + Math.floor(Math.random() * 10000),
        username: u.username,
        password: u.password,
        role: u.role || "user",
    }));
    salvarUsuarios();

    render();
}

function salvarUsuarios() {
    // [PERSISTÊNCIA] Trocar por API/BD no futuro
    localStorage.setItem(KEY_USUARIOS, JSON.stringify(users));
}

// === READ (LISTAR) ===
function render() {
    const tbody = document.getElementById("listaUsuarios");
    const filtro = (document.getElementById("filtroUsuario")?.value || "").trim().toLowerCase();

    tbody.innerHTML = "";

    let lista = users;
    if (filtro) {
        lista = users.filter((u) => (u.username || "").toLowerCase().includes(filtro));
    }

    if (!lista || lista.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="4"><em>Nenhum usuário encontrado.</em></td>
          </tr>
        `;
        return;
    }

    lista.forEach((u) => {
        const emEdicao = editandoId === u.id;

        // [CRUD - UPDATE] senha não é mostrada por padrão; edita definindo nova senha
        tbody.innerHTML += `
          <tr>
            <td><strong>${u.username}</strong></td>
            <td>
              ${emEdicao
                    ? `
                      <select id="role_${u.id}">
                        <option value="user" ${u.role === "user" ? "selected" : ""}>user</option>
                        <option value="admin" ${u.role === "admin" ? "selected" : ""}>admin</option>
                      </select>
                    `
                    : `<span class="badge">${u.role}</span>`}
            </td>
            <td>
              ${emEdicao
                    ? `<input id="senha_${u.id}" type="password" placeholder="Nova senha (opcional)" />`
                    : `<span class="muted">••••••</span>`}
            </td>
            <td class="actions">
              ${emEdicao
                    ? `
                      <button onclick="salvarEdicao(${u.id})">Salvar</button>
                      <button class="btn-secondary" onclick="cancelarEdicao()">Cancelar</button>
                    `
                    : `
                      <button onclick="editar(${u.id})">Editar</button>
                      <button class="btn-danger" onclick="apagar(${u.id})">Apagar</button>
                    `}
            </td>
          </tr>
        `;
    });
}

// === CREATE (CRIAR) ===
function criarUsuario() {
    // [LOCALIZAÇÃO] Campos do formulário de criação
    const username = document.getElementById("novoUser").value.trim();
    const password = document.getElementById("novaSenha").value.trim();
    const role = document.getElementById("novoRole").value;

    if (!username || !password) {
        alert("Preencha usuário e senha.");
        return;
    }

    if (users.some((u) => u.username === username)) {
        alert("Já existe um usuário com esse nome.");
        return;
    }

    users.push({ id: Date.now(), username, password, role });
    salvarUsuarios();

    document.getElementById("novoUser").value = "";
    document.getElementById("novaSenha").value = "";
    document.getElementById("novoRole").value = "user";

    render();
}

// === UPDATE (EDITAR) ===
function editar(id) {
    editandoId = id;
    render();
}

function cancelarEdicao() {
    editandoId = null;
    render();
}

function salvarEdicao(id) {
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return;

    const novoRole = document.getElementById(`role_${id}`).value;
    const novaSenha = document.getElementById(`senha_${id}`).value.trim();

    // [REGRA] não deixar “sumir” com o último admin
    if (users[idx].role === "admin" && novoRole !== "admin") {
        const totalAdmins = users.filter((u) => u.role === "admin").length;
        if (totalAdmins <= 1) {
            alert("Não é possível remover o último admin.");
            return;
        }
    }

    users[idx].role = novoRole;
    if (novaSenha) {
        users[idx].password = novaSenha;
    }

    salvarUsuarios();
    editandoId = null;
    render();
}

// === DELETE (APAGAR) ===
function apagar(id) {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    // [REGRA] não apagar o próprio admin logado
    if (adminLogado && user.username === adminLogado.username) {
        alert("Você não pode apagar o usuário que está logado.");
        return;
    }

    // [REGRA] não apagar o último admin
    if (user.role === "admin") {
        const totalAdmins = users.filter((u) => u.role === "admin").length;
        if (totalAdmins <= 1) {
            alert("Não é possível apagar o último admin.");
            return;
        }
    }

    if (!confirm(`Apagar usuário "${user.username}"?`)) return;

    users = users.filter((u) => u.id !== id);
    salvarUsuarios();
    render();
}

// === NAV / SAIR ===
function logoutAdmin() {
    // [LOCALIZAÇÃO] Logout do admin
    localStorage.removeItem(KEY_LOGADO);
}

function voltar() {
    window.location.href = "index.html";
}

carregarUsuarios();

