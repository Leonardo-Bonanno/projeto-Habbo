const habboInput = document.getElementById("habboInput");
const btnSearchInfo = document.getElementById("btnSearchUser");
const backToTopBtn = document.getElementById("backToTop");

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
let allRoomsCache = [];
let allGroupsCache = [];

btnSearchInfo.addEventListener("click", async () => {
  const originalText = btnSearchInfo.innerHTML;

  btnSearchInfo.disabled = true;
  btnSearchInfo.innerHTML = `
    <l-square size="25" stroke="3" speed="1.2" color="white"></l-square>
  `;

  try {
    const username = habboInput.value.trim();

    if (!username) {
      throw new Error("Digite um nome válido");
    }

    const data = await fetchFullProfile(username);

    renderProfile(data.profile);

    allBadgesCache = data.badges;
    allFriendsCache = data.friends || [];
    allRoomsCache = data.rooms || [];
    allGroupsCache = data.groups || [];

    renderBadges();
    renderFriends();
    renderRooms();
    renderGroups();

    renderLevelInfo(
      data.profile.totalExperience,
      data.profile.currentLevelCompletePercent,
      data.ach,
      data.badges.counts.badges,
    );
  } catch (err) {
    console.error(err);
    alert(err.message || "Erro ao buscar informações do usuário");
  } finally {
    btnSearchInfo.disabled = false;
    btnSearchInfo.innerHTML = originalText;
  }
});

// PERFIL
////////////////////////////////
function renderProfile(data) {
  charImg.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${data.figureString}&size=l`;
  username.textContent = data.name;
  motto.textContent = data.motto;

  lastSeen.innerHTML = data.lastAccessTime
    ? `🕒 <strong>Último login:</strong> ${new Date(data.lastAccessTime).toLocaleDateString("pt-BR")}`
    : `🕒 <strong>Último login:</strong> Status desativado`;
  if (data.profileVisible) {
    createData.innerHTML = `📅 <strong>Criação:</strong> ${new Date(data.memberSince).toLocaleDateString("pt-BR")}`;
    level.innerHTML = `⭐ <strong>Nível:</strong> ${data.currentLevel}`;
    online.textContent = data.online ? "🟢 Online" : "🔴 Offline";

    loadSelectedBadges(data.selectedBadges);
  }
}

// Emblemas
////////////////////////////////
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

      createTooltip(
        slot,
        `
      <strong>${badge.name}</strong><br>
      Código: ${badge.code}<br>
      ${badge.description}
      `,
      );
    }

    equipedBadges.appendChild(slot);
  }

  initTooltips();
}

function renderBadges() {
  const list = achShow
    ? allBadgesCache.badges.badges
    : allBadgesCache.badges.normal;

  loadAllBadges(list, allBadgesCache.newBadges);
}

function loadAllBadges(badges = [], newBadges = []) {
  badgesList.innerHTML = "";

  badges.forEach((badge) => {
    const slot = document.createElement("div");
    slot.classList.add("badge-slot", "position-relative");

    const img = document.createElement("img");
    img.src = `https://images.habbo.com/c_images/album1584/${badge.code}.gif`;

    slot.appendChild(img);

    if (badge.isNew) {
      const indicator = document.createElement("span");
      indicator.className =
        "position-absolute top-0 start-100 translate-middle p-2 bg-danger border border-light rounded-circle";
      
      slot.appendChild(indicator);
    }

    createTooltip(
      slot,
      `
      <strong>${badge.name}</strong><br>
      Código: ${badge.code}<br>
      ${badge.description}
      `
    );

    badgesList.appendChild(slot);
  });

  document.getElementById("badgesTitle").textContent =
    `Emblemas (${badges.length}):`;

  initTooltips();
}

// AMIGOS
////////////////////////////////
function renderFriends() {
  const list = friendsOn
    ? allFriendsCache.online
    : allFriendsCache.all;

  loadAllFriends(list);
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

    createTooltip(
      card,
      `
      Deseja pesquisar <strong>${friend.name}</strong>?
    `,
    );

    friendsList.appendChild(card);
  });

  document.getElementById("friendsTitle").textContent =
    `Amigos (${friends.length}):`;

  initTooltips();
}

// QUARTOS
////////////////////////////////
function renderRooms() {
  loadAllRooms(allRoomsCache);
}

function loadAllRooms(rooms = []) {
  const roomsList = document.getElementById("rooms-list");
  roomsList.innerHTML = "";

  rooms.forEach((room) => {
    const card = document.createElement("div");
    card.className = "room-card";

    const img = document.createElement("img");
    img.src = room.thumbnailUrl || "assets/images/roomPlaceholder.png";
    img.onerror = () => {
      img.src = "assets/images/roomPlaceholder.png";
    };
    img.className = "room-thumb";

    const info = document.createElement("div");
    info.className = "room-info";

    const title = document.createElement("strong");
    title.textContent = room.name;

    const desc = document.createElement("span");
    desc.textContent = room.description || "";

    const rating = document.createElement("span");
    rating.className = "room-rating";
    rating.textContent = room.rating;

    const date = document.createElement("small");
    date.innerHTML = `<strong>Data de criação:</strong> ${new Date(room.creationTime).toLocaleDateString("pt-BR")}`;

    const tagsBox = document.createElement("div");
    tagsBox.className = "room-tags";

    const link = document.createElement("a");
    link.href = `https://www.habbo.com.br/room/${room.id}`;
    link.className = "btn btn-icon";
    link.innerHTML = `<img src="assets/images/goTo.png">`;
    ((link.target = "_blank"),
      room.tags.forEach((tag) => {
        const tagEl = document.createElement("span");
        tagEl.className = "room-tag";
        tagEl.textContent = tag;
        tagsBox.appendChild(tagEl);
      }));

    info.append(title, desc, date, rating, tagsBox, link);
    card.append(img, info);

    createTooltip(rating, "Pontuação do quarto");
    createTooltip(link, "Ir para página do quarto");
    initTooltips();

    roomsList.appendChild(card);
  });

  document.getElementById("roomsTitle").textContent =
    `Quartos (${rooms.length})`;
}

// GROUPS
////////////////////////////////
function renderGroups() {
  loadAllGroups(allGroupsCache);
}

function loadAllGroups(groups = []) {
  const groupsList = document.getElementById("groups-list");
  groupsList.innerHTML = "";

  groups.forEach((group) => {
    const card = document.createElement("div");
    card.className = "group-card";

    const badge = document.createElement("img");
    badge.className = "group-badge";
    badge.src = `https://www.habbo.com.br/habbo-imaging/badge/${group.badgeCode}.gif`;

    const info = document.createElement("div");
    info.className = "group-info";

    const title = document.createElement("strong");
    title.textContent = group.name;

    const desc = document.createElement("span");
    desc.textContent = group.description || "";

    const colors = document.createElement("div");
    colors.className = "group-colors";

    const primary = document.createElement("div");
    primary.className = "color-box";
    primary.style.background = `#${group.primaryColour}`;
    primary.title = `Primária #${group.primaryColour}`;

    const secondary = document.createElement("div");
    secondary.className = "color-box";
    secondary.style.background = `#${group.secondaryColour}`;
    secondary.title = `Secundária #${group.secondaryColour}`;

    const link = document.createElement("a");
    link.href = `https://www.habbo.com.br/hotel?room=${group.roomId}`;
    link.className = "btn btn-icon";
    link.innerHTML = `<img src="assets/images/goTo.png">`;
    ((link.target = "_blank"), colors.append(primary, secondary));

    info.append(title, desc, colors, link);
    card.append(badge, info);

    createTooltip(link, "Ir para quartel do grupo");
    initTooltips();

    groupsList.appendChild(card);
  });

  document.getElementById("groupsTitle").textContent =
    `Grupos (${groups.length})`;
}

// NÍVEL
////////////////////////////////
function renderLevelInfo(
  totalExperience = 0,
  currentLevelCompletePercent = 0,
  achievements = [],
  badges = [],
) {
  totalExperience = Number(totalExperience) || 0;
  currentLevelCompletePercent = Number(currentLevelCompletePercent) || 0;

  const achievementsPoints = achievements;
  const badgesCount = badges;

  let remaining = totalExperience - (achievementsPoints + badgesCount);
  if (remaining < 0) remaining = 0;

  const roomsPoints = Math.floor(remaining / 2);
  const mobiPoints = remaining - roomsPoints;

  loadLevelInfo({
    achievementsPoints,
    badgesCount,
    roomsPoints,
    mobiPoints,
    totalExperience,
    currentLevelCompletePercent,
  });
}
function loadLevelInfo({
  achievementsPoints,
  badgesCount,
  roomsPoints,
  mobiPoints,
  totalExperience,
  currentLevelCompletePercent,
}) {
  document.getElementById("lvl-achievements").textContent = achievementsPoints;
  document.getElementById("lvl-badges").textContent = badgesCount;
  document.getElementById("lvl-rooms").textContent = roomsPoints;
  document.getElementById("lvl-mobi").textContent = mobiPoints;
  document.getElementById("lvl-total").textContent = totalExperience;

  const bar = document.getElementById("lvl-progress");

  bar.style.width = `${currentLevelCompletePercent}%`;
  bar.textContent = `${currentLevelCompletePercent}%`;
}

// BOTÕES FILTRO
////////////////////////////////
toggleAchBtn.addEventListener("click", () => {
  achShow = !achShow;

  toggleAchBtn.title = achShow ? "Ocultar conquistas" : "Mostrar conquistas";

  renderBadges();
});

toggleFriendsBtn.addEventListener("click", () => {
  friendsOn = !friendsOn;

  toggleFriendsBtn.title = friendsOn ? "Somente online" : "Todos amigos";

  renderFriends();
});

// FETCHs (no futuro terão menos fetchs)
////////////////////////////////
async function fetchFullProfile(username) {
  const res = await fetch(`http://localhost:3000/profile/${username}`);

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Erro na API");
  }

  return res.json();
}

// Bootstrap funcs
////////////////////////////////
function createTooltip(element, content, options = {}) {
  element.setAttribute("data-bs-toggle", "tooltip");

  if (content.includes("<")) {
    element.setAttribute("data-bs-html", "true");
  }

  element.setAttribute("data-bs-title", content);

  element._tooltipOptions = options;
}

function initTooltips(scope = document) {
  scope.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
    new bootstrap.Tooltip(el, {
      placement: "top",
      html: el.hasAttribute("data-bs-html"),
      ...el._tooltipOptions,
    });
  });
}

const levelModal = new bootstrap.Modal(document.getElementById("levelModal"));

document.getElementById("btnLevel").addEventListener("click", () => {
  levelModal.show();
  initPopovers();
});

function initPopovers() {
  document.querySelectorAll('[data-bs-toggle="popover"]').forEach((el) => {
    new bootstrap.Popover(el, {
      trigger: "hover focus",
      html: true,
      placement: "top",
    });
  });
}

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopBtn.style.display = "flex";
  } else {
    backToTopBtn.style.display = "none";
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
