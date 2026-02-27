async function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const erro = document.getElementById("erro");

    erro.innerText = "";

    if (!username || !password) {
        erro.innerText = "Preencha usuário e senha.";
        return;
    }

    let users = [];
    const usersLocal = localStorage.getItem("usuarios");

    if (usersLocal) {
        try {
            users = JSON.parse(usersLocal);
        } catch {
            users = [];
        }
    }

    if (!users || users.length === 0) {
        const res = await fetch("data/users.json");
        users = await res.json();
        localStorage.setItem("usuarios", JSON.stringify(users));
    }

    const valido = users.find(
        (u) => u.username === username && u.password === password
    );

    if (!valido) {
        erro.innerText = "Usuário ou senha inválidos.";
        return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(valido));

    if (valido.role === "admin") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "usuario.html";
    }
}

