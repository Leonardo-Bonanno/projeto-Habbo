let achShow = true;
let badgesGlobal = [];

async function buscarAvatar() {
    const nome = document.getElementById('habboInput').value.trim();
    const dados = document.getElementById('caixa-dados');
    const emblemas = document.getElementById('todos-emblemas');
    const amigos = document.getElementById('todos-amigos');
    const tituloEmblemas = document.getElementById('titulo-emblemas');
    const tituloAmigos = document.getElementById('titulo-amigos');

    // Limpar dados antigos
    dados.innerHTML = '';
    emblemas.innerHTML = '';
    tituloEmblemas.textContent = 'Emblemas:';
    tituloAmigos.textContent = 'Amigos:';
    amigos.innerHTML = '';

    if (!nome) {
        dados.innerHTML = "<p>Por favor, insira um nome válido.</p>";
        return;
    }

    try {
        const res = await fetch(`https://www.habbo.com.br/api/public/users?name=${nome}`);
        if (!res.ok) throw new Error('Habbo não encontrado');
        const data = await res.json();

        const imgUrl = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${data.figureString}&size=l`;
        let levelPercentage = data.currentLevelCompletePercent;

        let activeBadges = '';
        if (data.profileVisible) {
            // Emblemas ativos (vistos no perfil)
            data.selectedBadges.forEach(badge => {
                const badgeUrl = `https://images.habbo.com/c_images/album1584/${badge.code}.gif`;
                activeBadges += `<img src="${badgeUrl}" class="emblema" title="${badge.name}\n\n ${badge.description}" alt="${badge.name}">`;
            });

            // Carregar todos os emblemas
            const badgeRes = await fetch(`https://www.habbo.com.br/api/public/users/${data.uniqueId}/badges`);
            const badges = await badgeRes.json();
            badgesGlobal = badges; // salvar para filtragem depois

            // Buscar lista de amigos
            const friendRes = await fetch(`https://www.habbo.com.br/api/public/users/${data.uniqueId}/friends`);
            const friends = await friendRes.json();

            const onlineFriends = friends.filter(friend => friend.online);
            const offlineFriends = friends.filter(friend => !friend.online);

            const renderFriendHTML = (friend) => {
                return `
                    <div class="perfil-container">
                        <div class="col-9">
                            <p class="info-amigo">${friend.name}</p>
                            <p class="info-amigo">${friend.online ? '🟢 Online' : '🔴 Offline'}</p>
                        </div>
                        <div class="col-3">
                            <img class="img img-fluid" src="https://www.habbo.com.br/habbo-imaging/avatarimage?direction=4&head_direction=3&action=wav&gesture=sml&size=m&user=${friend.name}" alt="Avatar de ${friend.name}">
                        </div>
                    </div>
                `;
            };

            let totalFriendsHTML = '';
            onlineFriends.forEach(friend => totalFriendsHTML += renderFriendHTML(friend));
            offlineFriends.forEach(friend => totalFriendsHTML += renderFriendHTML(friend));
            document.getElementById('todos-amigos').innerHTML = totalFriendsHTML;

            // Perfil do usuário
            dados.innerHTML = `
                <div class="d-flex flex-column align-items-center">
                    <div class="d-flex flex-row align-items-start mb-3">
                        <div class="me-3">
                            <img src="${imgUrl}" class="img img-fluid" alt="Avatar do Habbo" style="max-width: 120px;">
                        </div>
                        <div class="dados-info">
                            <p><b>${data.name}</b></p>
                            <p><b>Missão:</b> ${data.motto || ''}</p>
                            <p><b>Criado em:</b> ${new Date(data.memberSince).toLocaleDateString('pt-BR')}</p>
                            <p>${data.online ? '🟢 Online' : '🔴 Offline'}</p>
                            <p><b>⬆️ Nível:</b> ${data.currentLevel}</p>
                            <div id="progress">
                                <div id="bar" style="width: ${levelPercentage}%"></div>
                            </div>
                            <p><b>💠Estrelas:</b> ${data.starGemCount}</p>
                        </div>
                    </div>
                    <div id="caixa-emblemas">
                        ${activeBadges}
                    </div>
                </div>
            `;

            tituloEmblemas.textContent = `Emblemas: (${badges.length})`;
            tituloAmigos.textContent = `Amigos: (${friends.length})`;
            emblemas.innerHTML = carregarEmblemas(badgesGlobal);
        } else {
            dados.innerHTML = `
                <div class="d-flex flex-column align-items-center">
                    <img src="${imgUrl}" class="img img-fluid" alt="Avatar do Habbo" style="max-width: 120px;">
                    <p><b>${data.name}</b></p>
                    <p><b>Missão:</b> ${data.motto || ''}</p>
                    <p style="color: red;"><b>Perfil privado ou banido. Não é possível carregar os dados completos.</b></p>
                </div>
            `;
        }
    } catch (err) {
        dados.innerHTML = `<p style="color: red;">Erro: ${err.message}</p>`;
    }
}

function carregarEmblemas(listaDeEmblemas) {
    let html = '<div style="display: flex; flex-wrap: wrap; gap: 5px; text-align: center;">';

    listaDeEmblemas.forEach(emblema => {
        if (!achShow && emblema.code.startsWith("ACH_")) return;

        const badgeUrl = `https://images.habbo.com/c_images/album1584/${emblema.code}.gif`;
        html += `<img src="${badgeUrl}" class="emblema" title="${emblema.name}\n\n${emblema.description}" alt="${emblema.name}" width="40" height="40">`;
    });

    html += '</div>';
    return html;
}

function achChange() {
    achShow = !achShow;

    const emblemas = document.getElementById('todos-emblemas');
    const tituloEmblemas = document.getElementById('titulo-emblemas');

    const emblemasFiltrados = badgesGlobal.filter(emblema => achShow || !emblema.code.startsWith("ACH_"));

    emblemas.innerHTML = carregarEmblemas(emblemasFiltrados);
    tituloEmblemas.textContent = `Emblemas: (${emblemasFiltrados.length})`;
}