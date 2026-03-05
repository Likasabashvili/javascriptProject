const BASE_URL = "https://hotelbooking.stepprojects.ge/api";
const CACHE_TTL = 10 * 60 * 1000; // 10 წუთი

let allHotels = [];

// 🔧 localStorage ქეშირების დამხმარე ფუნქციები
function getCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.warn("localStorage შენახვა ვერ მოხერხდა:", e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  handleAuthUI();
  initBurgerMenu();
});

async function init() {
  await getHotels();
  await loadCities();
}

/* ===========================
   ბურგერ მენიუ ინიციალიზაცია
=========================== */
function initBurgerMenu() {
  const burgerBtn = document.getElementById("burger-btn");
  const mainNav = document.getElementById("main-nav");

  if (burgerBtn && mainNav) {
    burgerBtn.addEventListener("click", () => {
      mainNav.classList.toggle("active");
      burgerBtn.classList.toggle("active");
    });

    // დახურვა ნავიგაციის ელემენტზე კლიკ
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("active");
        burgerBtn.classList.remove("active");
      });
    });

    // დახურვა გარეთ კლიკზე
    document.addEventListener("click", (e) => {
      if (!burgerBtn.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove("active");
        burgerBtn.classList.remove("active");
      }
    });
  }
}

/* ===========================
   სასტუმროების ჩამოტვირთვა (localStorage ქეშით)
=========================== */
async function getHotels() {
  try {
    const cached = getCache("hotels_all");
    if (cached) {
      allHotels = cached;
      renderHotels(cached);
      return;
    }

    const response = await fetch(`${BASE_URL}/Hotels/GetAll`);
    const hotels = await response.json();

    setCache("hotels_all", hotels);
    allHotels = hotels;
    renderHotels(hotels);
  } catch (error) {
    console.error("Error fetching hotels:", error);
  }
}

function renderHotels(hotels) {
  const container = document.getElementById("hotels-list");
  if (!container) return;

  if (!hotels.length) {
    container.innerHTML = "<p>სასტუმროები ვერ მოიძებნა</p>";
    return;
  }

  container.innerHTML = hotels
    .map(
      (hotel) => `
    <div class="hotels-card">
      <img src="${hotel.featuredImage}" alt="${hotel.name}">
      <div class="hotels-card-content">
        <h3>${hotel.name}</h3>
        <p class="meta">${hotel.city}</p>
        <div class="hotel-actions">
          <a class="btn btn-primary"
             href="rooms.html?hotelId=${hotel.id}">
             ნომრების ნახვა
          </a>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

/* ===========================
   ქალაქების ფილტრი
=========================== */
async function loadCities() {
  try {
    const response = await fetch(`${BASE_URL}/Hotels/GetCities`);
    const cities = await response.json();

    const select = document.getElementById("city-filter");
    if (!select) return;

    select.innerHTML = `<option value="">ყველა ქალაქი</option>`;

    cities.forEach((city) => {
      select.innerHTML += `<option value="${city}">${city}</option>`;
    });

    select.addEventListener("change", (e) => {
      filterByCity(e.target.value);
    });
  } catch (error) {
    console.error("Error loading cities:", error);
  }
}

function filterByCity(city) {
  if (!city) {
    renderHotels(allHotels);
    return;
  }

  const filtered = allHotels.filter((h) => h.city === city);
  renderHotels(filtered);
}

/* ===========================
   ავტორიზაციის UI
=========================== */
function handleAuthUI() {
  const authDiv = document.getElementById("auth-buttons");
  const welcomeDiv = document.getElementById("welcome-header");
  const nameSpan = document.getElementById("welcome-name");
  const logoutBtn = document.getElementById("logout-btn");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (currentUser) {
    authDiv.style.display = "none";
    welcomeDiv.style.display = "flex";

    // API-დან firstName + lastName, ძველიდან name
    const displayName =
      currentUser.firstName && currentUser.lastName
        ? `${currentUser.firstName} ${currentUser.lastName}`
        : currentUser.name || "მომხმარებელი";

    nameSpan.textContent = `გამარჯობა, ${displayName}`;

    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("authToken");
      window.location.reload();
    });
  } else {
    authDiv.style.display = "flex";
    welcomeDiv.style.display = "none";
  }
}

//ძებნისთვის პირველი ფორმიდან
document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://hotelbooking.stepprojects.ge/api";

  const searchForm = document.getElementById("search-form");
  const cityInput = document.getElementById("city");
  const checkInInput = document.getElementById("checkin");
  const checkOutInput = document.getElementById("checkout");
  const guestsSelect = document.getElementById("guests");

  const featuredGrid = document.getElementById("featured-grid");
  const cardsGrid = document.querySelector(".cards-grid");

  const newsletterForm = document.getElementById("newsletter");

  function formatDateToISO(dateStr) {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-");
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return date.toISOString();
  }

  // 🔧 რამდენიმე სასტუმროს ოთახების წამოღება (localStorage ქეშით)
  async function fetchRoomsFromHotels(hotelIds) {
    const cacheKey = "rooms_hotels_" + hotelIds.sort().join("_");
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const hotelDetails = await Promise.all(
      hotelIds.map((id) => {
        const hCache = getCache("hotel_" + id);
        if (hCache) return Promise.resolve(hCache);
        return fetch(`${API_URL}/Hotels/GetHotel/${id}`)
          .then((r) => r.json())
          .then((h) => {
            setCache("hotel_" + id, h);
            return h;
          });
      }),
    );

    let rooms = [];
    hotelDetails.forEach((hotel) => {
      if (hotel.rooms && hotel.rooms.length) {
        hotel.rooms.forEach((room) => {
          room._hotelCity = hotel.city;
          room._hotelName = hotel.name;
        });
        rooms = rooms.concat(hotel.rooms);
      }
    });

    setCache(cacheKey, rooms);
    return rooms;
  }

  // =========================
  // 🔎 HERO FORM SEARCH
  // =========================
  if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const city = cityInput.value.trim();
      const guests = parseInt(guestsSelect.value);

      // უბრალოდ გადავამისამართოთ rooms.html-ზე ფილტრებით
      const params = new URLSearchParams();
      if (city) params.set("city", city);
      if (guests) params.set("guests", guests);

      window.location.href = `rooms.html?${params.toString()}`;
    });
  }

  // =========================
  // INITIAL LOAD — მხოლოდ პირველი 3 სასტუმროდან ვიღებთ ოთახებს
  // =========================
  async function loadHomepageRooms() {
    try {
      // allHotels უკვე ჩატვირთულია getHotels()-დან, ველოდებით თუ ჯერ არ მზადაა
      const waitForHotels = () =>
        new Promise((resolve) => {
          if (allHotels.length) return resolve();
          const interval = setInterval(() => {
            if (allHotels.length) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      await waitForHotels();

      // მხოლოდ პირველი 3 სასტუმროს ID-ები — სწრაფი ჩატვირთვისთვის
      const hotelIds = allHotels.slice(0, 3).map((h) => h.id);
      const rooms = await fetchRoomsFromHotels(hotelIds);

      // 💎 ყველაზე ძვირიანი 3 ოთახი
      if (featuredGrid) {
        const sorted = [...rooms].sort(
          (a, b) => b.pricePerNight - a.pricePerNight,
        );
        const top3 = sorted.slice(0, 3);
        const cards = featuredGrid.querySelectorAll(".hotel-card");

        top3.forEach((room, index) => {
          const card = cards[index];
          if (!card) return;
          card.querySelector("img").src =
            room.images?.[0]?.source || "placeholder.png";
          card.querySelector("h4").textContent = room.name;
          card.querySelector(".meta").textContent =
            `${room.pricePerNight} ₾ • ${room.maximumGuests} სტუმარი`;
          card.querySelector(".btn-primary").href =
            `rooms.html?roomId=${room.id}`;
        });
      }

      // 🏨 პირველი 3 ოთახი
      if (cardsGrid) {
        const first3 = rooms.slice(0, 3);
        const cards = cardsGrid.querySelectorAll(".card");

        first3.forEach((room, index) => {
          const card = cards[index];
          if (!card) return;
          card.querySelector("img").src =
            room.images?.[0]?.source || "placeholder.png";
          card.querySelector("h3").textContent = room.name;
          card.querySelector(".meta").textContent =
            `${room.pricePerNight} ₾ • ${room.maximumGuests} სტუმარი`;
          card.querySelector(".btn-primary").href =
            `rooms.html?roomId=${room.id}`;
        });
      }
    } catch (err) {
      console.error("Error loading homepage rooms:", err);
    }
  }

  loadHomepageRooms();

  // =========================
  // 💬 კომენტარები
  // =========================
  if (newsletterForm) {
    const input = newsletterForm.querySelector("input");

    function loadComments() {
      const comments = JSON.parse(localStorage.getItem("comments")) || [];

      const section = document.querySelector(".test-grid");

      comments.forEach((text) => {
        const block = document.createElement("blockquote");
        block.textContent = `"${text}"`;
        section.appendChild(block);
      });
    }

    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const text = input.value.trim();
      if (!text) return;

      const comments = JSON.parse(localStorage.getItem("comments")) || [];

      comments.push(text);
      localStorage.setItem("comments", JSON.stringify(comments));

      input.value = "";
      loadComments();
    });

    loadComments();
  }
});
