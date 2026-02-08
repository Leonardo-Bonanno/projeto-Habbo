const habboInput = document.getElementById("habboInput");
const btnSearchInfo = document.getElementById("btnSearchUser");

const charImg = document.getElementById("char-img");
const username = document.getElementById("nickname");
const motto = document.getElementById("motto-text");
const lastSeen = document.getElementById("last-seen");
const createData = document.getElementById("create-data");
const level = document.getElementById("level");
const online = document.getElementById("online");

const equipedBadges = document.getElementById("equiped-badges");
const badgesList = document.getElementById("badges-list");
const toggleAchBtn = document.getElementById("toggleAchBtn");

const friendsList = document.getElementById("friends-list");
const toggleFriendsBtn = document.getElementById("toggleFriendsBtn");

// CONTROLE
let achShow = true;
let allBadgesCache = [];
let friendsOn = false;
let allFriendsCache = [];

btnSearchInfo.addEventListener("click", async () => {
  document.getElementById("loading").style.display = "flex";

  const data = await fetchUserData(habboInput.value);

  renderProfile(data);

  if (data.profileVisible) {
    const badges = await fetchUserBadges(data.uniqueId);
    const friends = await fetchUserFriends(data.uniqueId);
  
    allBadgesCache = badges;
    allFriendsCache = friends
    renderBadges();
    renderFriends();
  }

  document.getElementById("loading").style.display = "none";
});

// PERFIL
function renderProfile(data) {
    charImg.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${data.figureString}&size=l`;
    username.textContent = data.name;
    motto.textContent = data.motto;

    lastSeen.textContent = data.lastAccessTime
      ? `🕒 Último login: ${new Date(data.lastAccessTime).toLocaleDateString("pt-BR")}`
      : "🕒 Último login: Status desativado";
    if (data.profileVisible) {
      createData.innerHTML = `📅 <b>Criação:</b> ${new Date(data.memberSince).toLocaleDateString("pt-BR")}`;
      level.innerHTML = `⭐ <b>Nível:</b> ${data.currentLevel}`;
      online.textContent = data.online ? "🟢 Online" : "🔴 Offline";

      loadSelectedBadges(data.selectedBadges);
    }
}

// Emblemas
function loadSelectedBadges(badges = []) {
  equipedBadges.innerHTML = "";

  const maxSlots = 5;

  for (let i = 0; i < maxSlots; i++) {
    const slot = document.createElement("div");
    slot.classList.add("badge-slot");

    if (badges[i]) {
      const badge = badges[i];

      const img = document.createElement("img");
      img.src = `https://images.habbo.com/c_images/album1584/${badge.code}.gif`;

      slot.appendChild(img);

      slot.setAttribute("data-bs-toggle", "tooltip");
      slot.setAttribute("data-bs-html", "true");
      slot.setAttribute(
        "data-bs-title",
        `<strong>${badge.name}</strong><br>Código: ${badge.code}<br>${badge.description}`
      );
    }

    equipedBadges.appendChild(slot);
  }

  initTooltips();
}

function renderBadges() {
  const filtered = allBadgesCache.filter(
    badge => achShow || !badge.code.startsWith("ACH_")
  );

  loadAllBadges(filtered);
}

function loadAllBadges(badges = []) {
  badgesList.innerHTML = "";

  badges.forEach((badge) => {
    const slot = document.createElement("div");
    slot.classList.add("badge-slot");

    const img = document.createElement("img");
    img.src = `https://images.habbo.com/c_images/album1584/${badge.code}.gif`;

    slot.appendChild(img);

    slot.setAttribute("data-bs-toggle", "tooltip");
    slot.setAttribute("data-bs-html", "true");
    slot.setAttribute(
      "data-bs-title",
      `<strong>${badge.name}</strong><br>Código: ${badge.code}<br>${badge.description}`
    );

    badgesList.appendChild(slot);
  });

  document.getElementById("badgesTitle").textContent = `Emblemas (${badges.length}):`;

  initTooltips();
}

// AMIGOS
function renderFriends() {
  const filtered = allFriendsCache.filter(
    friend => !friendsOn || friend.online
  );

  loadAllFriends(filtered);
}

function loadAllFriends(friends = []) {
  friendsList.innerHTML = "";

  friends.forEach((friend) => {
    const card = document.createElement("div");
    card.classList.add("friend-card");

    const img = document.createElement("img");
    img.classList.add("char");
    img.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?direction=2&head_direction=3&action=wav&gesture=sml&size=m&user=${friend.name}`;

    const info = document.createElement("div");

    info.innerHTML = `
      <strong>${friend.name}</strong><br>
      <small>${friend.online ? "🟢 Online" : "🔴 Offline"}</small>
    `;

    card.appendChild(img);
    card.appendChild(info);

    card.addEventListener("click", () => {
      habboInput.value = friend.name;
      btnSearchInfo.click();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    friendsList.appendChild(card);
  });

  document.getElementById("friendsTitle").textContent =
    `Amigos (${friends.length})`;

  initTooltips();
}


// BOTÕES FILTRO
toggleAchBtn.addEventListener("click", () => {
  achShow = !achShow;

  toggleAchBtn.title = achShow
    ? "Ocultar conquistas"
    : "Mostrar conquistas";

  renderBadges();
});

toggleFriendsBtn.addEventListener("click", () => {
  friendsOn = !friendsOn;

  toggleFriendsBtn.title = friendsOn
    ? "Somente online"
    : "Todos amigos";

  renderFriends();
});

// FETCHs
async function fetchUserData(username) {
  const res = await fetch(
    `https://www.habbo.com.br/api/public/users?name=${username}`
  );
  return res.json();
}

async function fetchUserBadges(id) {
  const res = await fetch(
    `https://www.habbo.com.br/api/public/users/${id}/badges`
  );
  return res.json();
}

async function fetchUserFriends(id) {
  const res = await fetch(
    `https://www.habbo.com.br/api/public/users/${id}/friends`
  );
  return res.json();
}

// Bootstrap funcs
function initTooltips() {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
    new bootstrap.Tooltip(el, {
      html: true,
      placement: "top"
    });
  });
}
