let usuarioLogado = null;
let todasContas = [];

// Protege a página e inicializa dados
document.addEventListener("DOMContentLoaded", () => {
    const logadoStr = localStorage.getItem("usuarioLogado");
    if (!logadoStr) {
        alert("Acesso negado. Faça login.");
        window.location.href = "index.html";
        return;
    }

    try {
        usuarioLogado = JSON.parse(logadoStr);
    } catch {
        localStorage.removeItem("usuarioLogado");
        window.location.href = "index.html";
        return;
    }

    document.getElementById("bemVindo").innerText =
        "Bem-vindo, " + (usuarioLogado.username || "");

    carregarContas();
});

async function carregarContas() {
    try {
        const local = localStorage.getItem("contas");
        if (local) {
            todasContas = JSON.parse(local) || [];
        } else {
            const response = await fetch("data/contas.json");
            todasContas = await response.json();
            localStorage.setItem("contas", JSON.stringify(todasContas));
        }

        renderizarMinhasContas();
    } catch (e) {
        alert("Erro ao carregar contas.");
        console.error(e);
    }
}

function renderizarMinhasContas() {
    const minhas = todasContas.filter(
        (c) => c.usuario === (usuarioLogado && usuarioLogado.username)
    );

    const div = document.getElementById("contas");
    div.innerHTML = "";

    if (minhas.length === 0) {
        div.innerHTML = "<p>Nenhuma conta registada. Tente registar uma nova conta!</p>";
        return;
    }

    minhas.forEach((c, i) => {
        div.innerHTML += `
          <div class="conta">
             <h3 onclick="toggle(${i})">${c.servico}</h3>
             <div class="detalhes" id="det${i}">
                 <p>Email: ${c.email}</p>
                 <p>Senha: <span class="senha">${c.senha}</span></p>
                 <p>Criado em: ${c.criado_em}</p>
                 <button onclick="apagarConta(${i})">Apagar</button>
             </div>
          </div>
      `;
    });
}

function toggle(i) {
    const d = document.getElementById("det" + i);
    if (!d) return;
    d.style.display = d.style.display === "block" ? "none" : "block";
}

function criarConta(event) {
    event.preventDefault();

    const servico = document.getElementById("novoServico").value.trim();
    const email = document.getElementById("novoEmail").value.trim();
    const senha = document.getElementById("novaSenhaConta").value.trim();

    if (!servico || !email || !senha) {
        alert("Preencha todos os campos da nova conta.");
        return;
    }

    const novaConta = {
        usuario: usuarioLogado.username,
        servico,
        email,
        senha,
        criado_em: new Date().toISOString().slice(0, 10),
    };

    todasContas.push(novaConta);
    localStorage.setItem("contas", JSON.stringify(todasContas));

    document.getElementById("novoServico").value = "";
    document.getElementById("novoEmail").value = "";
    document.getElementById("novaSenhaConta").value = "";

    renderizarMinhasContas();
}

function apagarConta(indiceVisivel) {
    // índice visual é baseado apenas nas contas do usuário logado
    const minhas = todasContas.filter(
        (c) => c.usuario === (usuarioLogado && usuarioLogado.username)
    );

    const conta = minhas[indiceVisivel];
    if (!conta) return;

    if (!confirm("Apagar esta conta?")) return;

    todasContas = todasContas.filter(
        (c) =>
            !(
                c.usuario === conta.usuario &&
                c.servico === conta.servico &&
                c.email === conta.email &&
                c.senha === conta.senha &&
                c.criado_em === conta.criado_em
            )
    );

    localStorage.setItem("contas", JSON.stringify(todasContas));
    renderizarMinhasContas();
}

function logout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
}