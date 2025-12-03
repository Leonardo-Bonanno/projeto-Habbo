let achShow = true;
let onlineShow = false;
let badgesGlobal = [];
let friendsGlobal = [];

async function buscarAvatar(nomeParametro) {
  document.getElementById("content").style.display = "none";
  document.getElementById("loading").style.display = "flex"; // Mostrar loader

  const nome = nomeParametro || document.getElementById("habboInput").value.trim();
  const dados = document.getElementById("caixa-dados");
  const emblemas = document.getElementById("todos-emblemas");
  const amigos = document.getElementById("todos-amigos");
  const tituloEmblemas = document.getElementById("titulo-emblemas");
  const tituloAmigos = document.getElementById("titulo-amigos");
  achShow;

  dados.innerHTML = "";
  emblemas.innerHTML = "";
  amigos.innerHTML = "";
  tituloEmblemas.textContent = "Emblemas:";
  tituloAmigos.textContent = "Amigos:";

  if (!nome) {
    dados.innerHTML = "<p>Por favor, insira um nome válido.</p>";
    document.getElementById("loading").style.display = "none";
    return;
  }

  try {
    const res = await fetch(
      `https://www.habbo.com.br/api/public/users?name=${nome}`
    );
    if (!res.ok) throw new Error("Habbo não encontrado");
    const data = await res.json();

    const imgUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${data.figureString}&size=l`;
    let levelPercentage = data.currentLevelCompletePercent;

    if (data.profileVisible) {
      // Carregar dados de emblemas e amigos...
      const badgeRes = await fetch(
        `https://www.habbo.com.br/api/public/users/${data.uniqueId}/badges`
      );
      const badges = await badgeRes.json();
      badgesGlobal = badges;

      const friendRes = await fetch(
        `https://www.habbo.com.br/api/public/users/${data.uniqueId}/friends`
      );
      const friends = await friendRes.json();
      friendsGlobal = friends;

      const onlineFriends = friends.filter((friend) => friend.online);
      const offlineFriends = friends.filter((friend) => !friend.online);

      const renderFriendHTML = (friend) => `
                <div class="perfil-container">
                    <div class="col-9">
                        <p class="info-amigo">${friend.name}</p>
                        <p class="info-amigo">${
                          friend.online ? "🟢 Online" : "🔴 Offline"
                        }</p>
                        <a href="#" onclick="buscarAvatar('${
                          friend.name
                        }')" class="link-perfil">Ver perfil</a>
                    </div>
                    <div class="col-3">
                        <img class="img img-fluid" src="https://www.habbo.com.br/habbo-imaging/avatarimage?direction=4&head_direction=3&action=wav&gesture=sml&size=m&user=${
                          friend.name
                        }" alt="Avatar de ${friend.name}">
                    </div>
                </div>
            `;

      let totalFriendsHTML = "";
      onlineFriends.forEach(
        (friend) => (totalFriendsHTML += renderFriendHTML(friend))
      );
      offlineFriends.forEach(
        (friend) => (totalFriendsHTML += renderFriendHTML(friend))
      );
      amigos.innerHTML = totalFriendsHTML;

      dados.innerHTML = `
                <div class="perfil-esquerda d-flex flex-column align-items-left col-9">
                    <div class="d-flex flex-row align-items-start mb-3">
                        <div class="me-3 col-3">
                            <img src="${imgUrl}" class="img img-fluid" alt="Avatar do Habbo" style="max-width: 120px;">
                        </div>
                        <div id="caixa-emblemas">
                            ${data.selectedBadges
                              .map(
                                (b) =>
                                  `<img src="https://images.habbo.com/c_images/album1584/${b.code}.gif" class="emblema" title="${b.name}\n\n ${b.description}" alt="${b.name}">`
                              )
                              .join("")}
                        </div>
                    </div>
                        <div class="dados-info col-6">
                            <p><b>${data.name}</b></p>
                            <p><b>Missão:</b> ${data.motto || ""}</p>
                            <p><b>Criado em:</b> ${new Date(
                              data.memberSince
                            ).toLocaleDateString("pt-BR")}</p>
                            <p>${data.online ? "🟢 Online" : "🔴 Offline"}</p>
                            <p><b>⬆️ Nível:</b> ${data.currentLevel}</p>
                            <div id="progress"><div id="bar" style="width: ${levelPercentage}%"></div></div>
                            <p><b>💠Estrelas:</b> ${data.starGemCount}</p>
                    </div>
                </div>
                <div class="perfil-direita col-3" hidden>
                    <button class="btn btn-primary mt-3 btn-perfil">placeholder</button>
                    <button class="btn btn-primary mt-3 btn-perfil">placeholder</button>
                    <button class="btn btn-primary mt-3 btn-perfil">placeholder</button>
                </div>
            `;

      tituloEmblemas.textContent = `Emblemas: (${badges.length})`;
      tituloAmigos.textContent = `Amigos: (${friends.length})`;
      emblemas.innerHTML = carregarEmblemas(badgesGlobal);
    } else {
      dados.innerHTML = `
                <div class="d-flex flex-column align-items-center">
                    <div class="d-flex flex-row align-items-start mb-3">
                        <div class="me-3">
                            <img src="${imgUrl}" class="img img-fluid" alt="Avatar do Habbo" style="max-width: 120px;">
                        </div>
                        <div class="dados-info">
                            <p><b>${data.name}</b></p>
                            <p><b>Missão:</b> ${data.motto || ""}</p>
                            <p style="color: red;">Este perfil é fechado ou está banido</p>
                        </div>
                    </div>
                </div>
            `;
    }
  } catch (err) {
    dados.innerHTML = `<p style="color: red;">Erro: ${err.message}</p>`;
  }

  document.getElementById("content").style.display = "flex"; // mostrar o content completo
  document.getElementById("loading").style.display = "none"; // Esconder loader ao final
}

function carregarEmblemas(listaDeEmblemas) {
  let html =
    '<div style="display: flex; flex-wrap: wrap; gap: 5px; text-align: center;">';

  listaDeEmblemas.forEach((emblema) => {
    if (!achShow && emblema.code.startsWith("ACH_")) return;
    const badgeUrl = `https://images.habbo.com/c_images/album1584/${emblema.code}.gif`;
    html += `<img src="${badgeUrl}" class="emblema" title="${emblema.name}\n\n${emblema.description}" alt="${emblema.name}" width="40" height="40">`;
  });

  html += "</div>";
  return html;
}

/*function carregarAmigos(listaDeAmigos) {
    let html = 
}*/

function achChange() {
  achShow = !achShow;
  const emblemas = document.getElementById("todos-emblemas");
  const tituloEmblemas = document.getElementById("titulo-emblemas");

  const emblemasFiltrados = badgesGlobal.filter(
    (emblema) => achShow || !emblema.code.startsWith("ACH_")
  );

  emblemas.innerHTML = carregarEmblemas(emblemasFiltrados);
  tituloEmblemas.textContent = `Emblemas: (${emblemasFiltrados.length})`;
}

function friendsChange() {
  onlineShow = !onlineShow;
  const amigos = document.getElementById("todos-amigos");
  const tituloEmblemas = document.getElementById("titulo-emblemas");

  const amigosOnline = friendsGlobal.filter(
    (friend) => friendShow || !friend.online == true
  );

  amigos.innerHTML = totalFriendsHTML;
}
