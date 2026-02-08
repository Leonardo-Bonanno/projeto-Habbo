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

btnSearchInfo.addEventListener("click", async () => {
  const user = habboInput.value;
  document.getElementById("loading").style.display = "flex";

  const res = await fetch(
    `https://www.habbo.com.br/api/public/users?name=${user}`,
  );
  const data = await res.json();

  document.getElementById("loading").style.display = "none";

  if (data.profileVisible) {
    charImg.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${data.figureString}&size=l`;
    username.innerHTML = data.name;
    motto.innerHTML = data.motto;
    lastSeen.textContent = data.lastAccessTime
      ? `🕒 Último login: ${new Date(data.lastAccessTime).toLocaleDateString("pt-BR")}`
      : "🕒 Último login: Status desativado";
    createData.innerHTML = `📅 <b>Criação:</b> ${new Date(data.memberSince).toLocaleDateString("pt-BR")}`;
    level.innerHTML = `⭐ <b>Nível:</b> ${data.currentLevel}`;
    online.innerHTML = `${data.online ? "🟢 Online" : "🔴 Offline"}`;
    loadSelectedBadges(data.selectedBadges);
  } else {
    charImg.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${data.figureString}&size=l`;
    username.innerHTML = data.name;
    motto.innerHTML = data.motto;
    createData.innerHTML = `📅 Criação: Perfil privado`;
  }
});

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
      slot.setAttribute("data-bs-placement", "left");
      slot.setAttribute(
        "data-bs-title",
        `
        <div style="text-align:left">
          <strong>${badge.name}</strong><br>
          <small>Código: ${badge.code}</small><br>
          <span style="font-size:12px">${badge.description}</span>
        </div>
        `
      );
    }
    equipedBadges.appendChild(slot);
  }

  initTooltips();
}


function initTooltips() {
  document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach(el => {
      new bootstrap.Tooltip(el, {
        html: true,
        placement: "right"
      });
    });
}