// const Api = "https://hotelbooking.stepprojects.ge/";

// const API = {
//   hotels: Api + "api/Hotels/GetAll",
//   hotelById: (id) => Api + `api/Hotels/GetHotel/${id}`,
//   cities: Api + "api/Hotels/GetCities",
//   rooms: Api + "api/Rooms/GetAll",
//   roomTypes: Api + "api/Rooms/GetRoomTypes",
//   roomFilter: Api + "api/Rooms/GetFiltered",
//   bookings: Api + "api/Booking",
//   deleteBooking: (id) => Api + `api/Booking/${id}`,
// };

// document.addEventListener("DOMContentLoaded", () => {
//   init();
// });

// async function init() {
//   const params = new URLSearchParams(window.location.search);
//   const hotelId = params.get("hotelId");

//   if (hotelId) {
//     await getHotelRooms(hotelId);
//   } else {
//     await getHotels();
//     await loadCities();
//   }
// }
// //სასტუმროების ჩამოტვირთვა
// async function getHotels() {
//   try {
//     const response = await fetch(API.hotels);
//     const hotels = await response.json();
//     renderHotels(hotels);
//   } catch (error) {
//     console.error("Error fetching hotels:", error);
//   }
// }

// function renderHotels(hotels) {
//   const container = document.getElementById("hotels-list");
//   if (!container) return;

//   container.innerHTML = "";

//   hotels.forEach((hotel) => {
//     container.innerHTML += `
//       <div class="hotels-card">
//         <img src="${hotel.featuredImage}" alt="${hotel.name}">
//         <div class="hotels-card-content">
//           <h3>${hotel.name}</h3>
//           <p class="meta">${hotel.city}</p>
//           <div class="hotel-actions">
//             <a class="btn btn-primary"
//                href="booking.html?hotelId=${hotel.id}">
//                ნომრების ნახვა
//             </a>
//           </div>
//         </div>
//       </div>
//     `;
//   });
// }
// //ქალაქების ფილტრი
// async function loadCities() {
//   try {
//     const response = await fetch(API.cities);
//     const hotels = await response.json();

//     const cities = [...new Set(hotels.map((h) => h.city))];

//     const select = document.getElementById("city-filter");
//     if (!select) return;

//     cities.forEach((city) => {
//       select.innerHTML += `<option value="${city}">${city}</option>`;
//     });

//     select.addEventListener("change", () => {
//       filterByCity(select.value);
//     });
//   } catch (error) {
//     console.error("Error loading cities:", error);
//   }
// }

// async function filterByCity(city) {
//   try {
//     const response = await fetch(`${Api}api/Hotels/GetHotels?city=${city}`);
//     const hotels = await response.json();
//     renderHotels(hotels);
//   } catch (error) {
//     console.error(error);
//   }
// }
// //ოთახები
// async function getHotelRooms(hotelId) {
//   try {
//     const response = await fetch(API.hotelById(hotelId));
//     const hotel = await response.json();

//     renderRooms(hotel.rooms, hotel.name);
//   } catch (error) {
//     console.error("Error fetching hotel rooms:", error);
//   }
// }

// function renderRooms(rooms, hotelName) {
//   const container = document.getElementById("rooms-list");
//   if (!container) return;

//   container.innerHTML = `<h2>${hotelName}</h2>`;

//   rooms.forEach((room) => {
//     container.innerHTML += `
//       <div class="room-card">
//         <img src="${room.images[0]?.source || ""}">
//         <h3>${room.name}</h3>
//         <p>ფასი: ${room.pricePerNight} ₾</p>
//         <p>სტუმრები: ${room.maximumGuests}</p>
//         <button onclick="goToBooking(${room.id}, ${room.pricePerNight})">
//           დაჯავშნა
//         </button>
//       </div>
//     `;
//   });
// }
// //დაჯავშნის გვერდზე გადაყვანა
// function goToBooking(roomId, price) {
//   window.location.href = `room-details.html?roomId=${roomId}&price=${price}`;
// }

// function handleAuthUI() {
//   const authDiv = document.getElementById("auth-buttons");
//   const welcomeDiv = document.getElementById("welcome-header");
//   const nameSpan = document.getElementById("welcome-name");
//   const logoutBtn = document.getElementById("logout-btn");

//   const currentUser = JSON.parse(localStorage.getItem("currentUser"));

//   if (currentUser) {
//     authDiv.style.display = "none";
//     welcomeDiv.style.display = "flex";
//     nameSpan.textContent = `გამარჯობა, ${currentUser.name}`;

//     logoutBtn.addEventListener("click", () => {
//       localStorage.removeItem("currentUser");
//       window.location.reload();
//     });
//   } else {
//     authDiv.style.display = "flex";
//     welcomeDiv.style.display = "none";
//   }
// }

// document.addEventListener("DOMContentLoaded", handleAuthUI);

const BASE_URL = "https://hotelbooking.stepprojects.ge/api";

let allHotels = [];

document.addEventListener("DOMContentLoaded", () => {
  init();
  handleAuthUI();
});

async function init() {
  await getHotels();
  await loadCities();
}

/* ===========================
   სასტუმროების ჩამოტვირთვა
=========================== */
async function getHotels() {
  try {
    const response = await fetch(`${BASE_URL}/Hotels/GetAll`);
    const hotels = await response.json();

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
    nameSpan.textContent = `გამარჯობა, ${currentUser.name}`;

    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
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

  // =========================
  // 🔎 HERO FORM SEARCH
  // =========================
  if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const city = cityInput.value.trim();
      const checkIn = formatDateToISO(checkInInput.value);
      const checkOut = formatDateToISO(checkOutInput.value);
      const guests = parseInt(guestsSelect.value);

      try {
        const res = await fetch(`${API_URL}/Rooms/GetAll`);
        let rooms = await res.json();

        // ფილტრი ქალაქით
        if (city) {
          rooms = rooms.filter(room =>
            room.hotel?.city?.toLowerCase().includes(city.toLowerCase())
          );
        }

        // ფილტრი სტუმრებით
        rooms = rooms.filter(room => room.maximumGuests >= guests);

        if (!rooms.length) {
          Swal.fire("შედეგი", "ოთახები ვერ მოიძებნა", "info");
          return;
        }

        // გადავდივართ rooms.html-ზე და ვაძლევთ city-ს
        window.location.href = `rooms.html?city=${city}`;

      } catch (err) {
        Swal.fire("შეცდომა", err.message, "error");
      }
    });
  }

  // =========================
  // 💎 ყველაზე ძვირიანი 3 ოთახი
  // =========================
  async function loadTopExpensiveRooms() {
    const res = await fetch(`${API_URL}/Rooms/GetAll`);
    let rooms = await res.json();

    rooms.sort((a, b) => b.pricePerNight - a.pricePerNight);
    const top3 = rooms.slice(0, 3);

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

  // =========================
  // 🏨 პირველი 3 ოთახი
  // =========================
  async function loadFirstThreeRooms() {
    const res = await fetch(`${API_URL}/Rooms/GetAll`);
    const rooms = await res.json();

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

  // =========================
  // 💬 კომენტარები
  // =========================
  if (newsletterForm) {
    const input = newsletterForm.querySelector("input");

    function loadComments() {
      const comments =
        JSON.parse(localStorage.getItem("comments")) || [];

      const section = document.querySelector(".test-grid");

      comments.forEach(text => {
        const block = document.createElement("blockquote");
        block.textContent = `"${text}"`;
        section.appendChild(block);
      });
    }

    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const text = input.value.trim();
      if (!text) return;

      const comments =
        JSON.parse(localStorage.getItem("comments")) || [];

      comments.push(text);
      localStorage.setItem("comments", JSON.stringify(comments));

      input.value = "";
      loadComments();
    });

    loadComments();
  }

  // =========================
  // INITIAL LOAD
  // =========================
  loadTopExpensiveRooms();
  loadFirstThreeRooms();
});