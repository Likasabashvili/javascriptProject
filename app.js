const API_BASE = "https://hotelbooking.stepprojects.ge/api";

let allHotels = [];

console.log("✓ app.js loaded");

// =================================
// 🔐 AUTHENTICATION UI HANDLER
// =================================
function handleAuthUI() {
  console.log("🔐 handleAuthUI: Checking authentication status...");

  const authDiv = document.getElementById("auth-buttons");
  const welcomeDiv = document.getElementById("welcome-header");
  const nameSpan = document.getElementById("welcome-name");
  const logoutBtn = document.getElementById("logout-btn");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  console.log("📦 currentUser from localStorage:", currentUser);

  if (currentUser && currentUser.name) {
    console.log(`✓ User logged in: ${currentUser.name}`);
    if (authDiv) authDiv.style.display = "none";
    if (welcomeDiv) welcomeDiv.style.display = "flex";
    if (nameSpan) nameSpan.textContent = `გამარჯობა, ${currentUser.name}`;

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        console.log("🚪 Logging out user");
        localStorage.removeItem("currentUser");
        window.location.reload();
      });
    }
  } else {
    console.log("✗ No user logged in");
    if (authDiv) authDiv.style.display = "flex";
    if (welcomeDiv) welcomeDiv.style.display = "none";
  }
}

// =================================
// 🏨 HOTELS MANAGEMENT
// =================================
async function getHotels() {
  try {
    console.log("🏨 Fetching hotels...");
    const response = await fetch(`${API_BASE}/Hotels/GetAll`);
    if (!response.ok) throw new Error("Hotels fetch failed");

    const hotels = await response.json();
    console.log(`✓ Got ${hotels.length} hotels`);

    allHotels = hotels;
    renderHotels(hotels);
  } catch (error) {
    console.error("❌ Error fetching hotels:", error);
  }
}

function renderHotels(hotels) {
  const container = document.getElementById("hotels-list");
  if (!container) {
    console.warn("⚠️ hotels-list container not found");
    return;
  }

  console.log(`🎨 Rendering ${hotels.length} hotels`);
  container.innerHTML = "";

  if (!hotels || hotels.length === 0) {
    container.innerHTML = "<p>სასტუმროები ვერ მოიძებნა</p>";
    return;
  }

  hotels.forEach((hotel) => {
    container.innerHTML += `
      <div class="hotels-card">
        <img src="${hotel.featuredImage}" alt="${hotel.name}" />
        <div class="hotels-card-content">
          <h3>${hotel.name}</h3>
          <p class="meta">${hotel.city}</p>
          <div class="hotel-actions">
            <a class="btn btn-primary" href="rooms.html?hotelId=${hotel.id}">
              ნომრების ნახვა
            </a>
          </div>
        </div>
      </div>
    `;
  });
}

// =================================
// 🏙️ CITIES FILTER
// =================================
async function loadCities() {
  try {
    console.log("🏙️ Loading cities...");
    const response = await fetch(`${API_BASE}/Hotels/GetCities`);
    if (!response.ok) throw new Error("Cities fetch failed");

    const cities = await response.json();
    console.log(`✓ Got ${cities.length} cities`);

    const select = document.getElementById("city-filter");
    if (!select) {
      console.warn("⚠️ city-filter select not found");
      return;
    }

    select.innerHTML = '<option value="">ყველა ქალაქი</option>';
    cities.forEach((city) => {
      select.innerHTML += `<option value="${city}">${city}</option>`;
    });

    select.addEventListener("change", (e) => {
      filterByCity(e.target.value);
    });
  } catch (error) {
    console.error("❌ Error loading cities:", error);
  }
}

function filterByCity(city) {
  console.log(`📍 Filter by city: ${city || "all"}`);
  if (!city) {
    renderHotels(allHotels);
    return;
  }

  const filtered = allHotels.filter((h) => h.city === city);
  console.log(`✓ Found ${filtered.length} hotels in ${city}`);
  renderHotels(filtered);
}

// =================================
// 🔎 GET ALL ROOMS FOR HOME PAGE
// =================================
async function getAllRooms() {
  try {
    console.log("🔎 getAllRooms: Fetching all rooms from all hotels...");
    const hotelsRes = await fetch(`${API_BASE}/Hotels/GetAll`);
    const hotels = await hotelsRes.json();
    console.log(`✓ Hotels: ${hotels.length}`);

    let allRooms = [];

    for (const hotel of hotels) {
      const roomsRes = await fetch(`${API_BASE}/Rooms/GetRoom/${hotel.id}`);
      if (roomsRes.ok) {
        const rooms = await roomsRes.json();
        const roomsArray = Array.isArray(rooms) ? rooms : [rooms];

        roomsArray.forEach((room) => {
          room.hotelName = hotel.name;
          room.hotelId = hotel.id;
          room.hotelCity = hotel.city;
          allRooms.push(room);
        });
        console.log(`  └─ ${hotel.name}: ${roomsArray.length} rooms`);
      }
    }

    console.log(`✓ Total rooms: ${allRooms.length}`);
    return allRooms;
  } catch (err) {
    console.error("❌ getAllRooms error:", err);
    return [];
  }
}

// =================================
// 💎 TOP 3 EXPENSIVE ROOMS
// =================================
async function loadTopExpensiveRooms() {
  try {
    console.log("💎 Loading top 3 expensive rooms...");
    const allRooms = await getAllRooms();

    if (allRooms.length === 0) {
      console.warn("⚠️ No rooms found");
      return;
    }

    const sorted = [...allRooms].sort(
      (a, b) => b.pricePerNight - a.pricePerNight,
    );
    const top3 = sorted.slice(0, 3);
    console.log(
      `✓ Top 3: ${top3.map((r) => `${r.name}(${r.pricePerNight}₾)`).join(", ")}`,
    );

    const featuredGrid = document.getElementById("featured-grid");
    if (!featuredGrid) {
      console.warn("⚠️ featured-grid not found");
      return;
    }

    const cards = featuredGrid.querySelectorAll(".hotel-card");
    if (cards.length === 0) {
      console.warn("⚠️ No .hotel-card elements found in featured-grid");
      return;
    }

    top3.forEach((room, index) => {
      const card = cards[index];
      if (!card) {
        console.warn(`⚠️ Card ${index} not found`);
        return;
      }

      const img = card.querySelector("img");
      const h4 = card.querySelector("h4");
      const meta = card.querySelector(".meta");
      const btn = card.querySelector(".btn-primary");

      if (img)
        img.src = room.images?.[0]?.source || "https://picsum.photos/400/300";
      if (h4) h4.textContent = room.name;
      if (meta)
        meta.textContent = `${room.pricePerNight} ₾ • ${room.maximumGuests} სტუმარი`;
      if (btn) btn.href = `booking.html?roomId=${room.id}`;

      console.log(`  ✓ Card ${index + 1}: ${room.name}`);
    });
  } catch (err) {
    console.error("❌ loadTopExpensiveRooms error:", err);
  }
}

// =================================
// 🏨 FIRST 3 ROOMS
// =================================
async function loadFirstThreeRooms() {
  try {
    console.log("🏨 Loading first 3 rooms...");
    const allRooms = await getAllRooms();

    if (allRooms.length === 0) {
      console.warn("⚠️ No rooms found");
      return;
    }

    const first3 = allRooms.slice(0, 3);
    console.log(`✓ First 3: ${first3.map((r) => r.name).join(", ")}`);

    const cardsGrid = document.querySelector(".cards-grid");
    if (!cardsGrid) {
      console.warn("⚠️ .cards-grid not found");
      return;
    }

    const cards = cardsGrid.querySelectorAll(".card");
    if (cards.length === 0) {
      console.warn("⚠️ No .card elements found in cards-grid");
      return;
    }

    first3.forEach((room, index) => {
      const card = cards[index];
      if (!card) {
        console.warn(`⚠️ Card ${index} not found`);
        return;
      }

      const img = card.querySelector("img");
      const h3 = card.querySelector("h3");
      const meta = card.querySelector(".meta");
      const btn = card.querySelector(".btn-primary");

      if (img)
        img.src = room.images?.[0]?.source || "https://picsum.photos/400/300";
      if (h3) h3.textContent = room.name;
      if (meta)
        meta.textContent = `${room.pricePerNight} ₾ • ${room.maximumGuests} სტუმარი`;
      if (btn) btn.href = `booking.html?roomId=${room.id}`;

      console.log(`  ✓ Card ${index + 1}: ${room.name}`);
    });
  } catch (err) {
    console.error("❌ loadFirstThreeRooms error:", err);
  }
}

// =================================
// 🔎 HERO SEARCH FORM
// =================================
function setupSearchForm() {
  const searchForm = document.getElementById("search-form");
  if (!searchForm) {
    console.warn("⚠️ search-form not found");
    return;
  }

  console.log("🔎 Setting up search form...");

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("🔎 Search form submitted");

    const cityInput = document.getElementById("city");
    const checkInInput = document.getElementById("checkin");
    const checkOutInput = document.getElementById("checkout");
    const guestsSelect = document.getElementById("guests");

    const city = cityInput?.value.trim() || "";
    const guests = parseInt(guestsSelect?.value || 1);

    console.log(`  City: ${city || "any"}, Guests: ${guests}`);

    try {
      const allRooms = await getAllRooms();
      let filtered = allRooms;

      if (city) {
        filtered = filtered.filter((r) =>
          r.hotelCity?.toLowerCase().includes(city.toLowerCase()),
        );
      }

      filtered = filtered.filter((r) => r.maximumGuests >= guests);

      console.log(`  Results: ${filtered.length} rooms`);

      if (filtered.length === 0) {
        alert("ოთახები ვერ მოიძებნა");
        return;
      }

      window.location.href = `rooms.html?city=${encodeURIComponent(city)}`;
    } catch (err) {
      console.error("❌ Search error:", err);
      alert("ძებნის შეცდომა");
    }
  });
}

// =================================
// 💬 NEWSLETTER
// =================================
function setupNewsletter() {
  const form = document.getElementById("newsletter");
  if (!form) {
    console.warn("⚠️ newsletter form not found");
    return;
  }

  console.log("💬 Setting up newsletter...");

  const input = form.querySelector("input");
  if (!input) return;

  function loadComments() {
    const comments = JSON.parse(localStorage.getItem("comments")) || [];
    const section = document.querySelector(".test-grid");
    if (!section) return;

    section.innerHTML = "";
    comments.forEach((text) => {
      const block = document.createElement("blockquote");
      block.textContent = `"${text}"`;
      section.appendChild(block);
    });
  }

  form.addEventListener("submit", (e) => {
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

// =================================
// 📍 MAIN INITIALIZATION
// =================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("📍 DOMContentLoaded: Starting app initialization");

  // Always handle auth UI FIRST
  handleAuthUI();

  // Check if we're on a hotel page
  const urlParams = new URLSearchParams(window.location.search);
  const hotelId = urlParams.get("hotelId");

  if (!hotelId) {
    // Home page setup
    console.log("📍 Home page detected, loading home features");
    getHotels();
    loadCities();
    loadTopExpensiveRooms();
    loadFirstThreeRooms();
    setupSearchForm();
    setupNewsletter();
  }

  console.log("✓ App initialization complete");
});
