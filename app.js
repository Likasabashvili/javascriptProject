const Api = "https://hotelbooking.stepprojects.ge/";

const API = {
  hotels: Api + "api/Hotels/GetAll",
  hotelById: (id) => Api + `api/Hotels/GetHotel/${id}`,
  cities: Api + "api/Hotels/GetCities",
  rooms: Api + "api/Rooms/GetAll",
  roomTypes: Api + "api/Rooms/GetRoomTypes",
  roomFilter: Api + "api/Rooms/GetFiltered",
  bookings: Api + "api/Booking",
  deleteBooking: (id) => Api + `api/Booking/${id}`,
};

document.addEventListener("DOMContentLoaded", () => {
  init();
});

async function init() {
  const params = new URLSearchParams(window.location.search);
  const hotelId = params.get("hotelId");

  if (hotelId) {
    await getHotelRooms(hotelId);
  } else {
    await getHotels();
    await loadCities();
  }
}
//სასტუმროების ჩამოტვირთვა
async function getHotels() {
  try {
    const response = await fetch(API.hotels);
    const hotels = await response.json();
    renderHotels(hotels);
  } catch (error) {
    console.error("Error fetching hotels:", error);
  }
}

function renderHotels(hotels) {
  const container = document.getElementById("hotels-list");
  if (!container) return;

  container.innerHTML = "";

  hotels.forEach((hotel) => {
    container.innerHTML += `
      <div class="hotels-card">
        <img src="${hotel.featuredImage}" alt="${hotel.name}">
        <div class="hotels-card-content">
          <h3>${hotel.name}</h3>
          <p class="meta">${hotel.city}</p>
          <div class="hotel-actions">
            <a class="btn btn-primary" 
               href="booking.html?hotelId=${hotel.id}">
               ნომრების ნახვა
            </a>
          </div>
        </div>
      </div>
    `;
  });
}
//ქალაქების ფილტრი
async function loadCities() {
  try {
    const response = await fetch(API.cities);
    const hotels = await response.json();

    const cities = [...new Set(hotels.map((h) => h.city))];

    const select = document.getElementById("city-filter");
    if (!select) return;

    cities.forEach((city) => {
      select.innerHTML += `<option value="${city}">${city}</option>`;
    });

    select.addEventListener("change", () => {
      filterByCity(select.value);
    });
  } catch (error) {
    console.error("Error loading cities:", error);
  }
}

async function filterByCity(city) {
  try {
    const response = await fetch(`${Api}api/Hotels/GetHotels?city=${city}`);
    const hotels = await response.json();
    renderHotels(hotels);
  } catch (error) {
    console.error(error);
  }
}
//ოთახები
async function getHotelRooms(hotelId) {
  try {
    const response = await fetch(API.hotelById(hotelId));
    const hotel = await response.json();

    renderRooms(hotel.rooms, hotel.name);
  } catch (error) {
    console.error("Error fetching hotel rooms:", error);
  }
}

function renderRooms(rooms, hotelName) {
  const container = document.getElementById("rooms-list");
  if (!container) return;

  container.innerHTML = `<h2>${hotelName}</h2>`;

  rooms.forEach((room) => {
    container.innerHTML += `
      <div class="room-card">
        <img src="${room.images[0]?.source || ""}">
        <h3>${room.name}</h3>
        <p>ფასი: ${room.pricePerNight} ₾</p>
        <p>სტუმრები: ${room.maximumGuests}</p>
        <button onclick="goToBooking(${room.id}, ${room.pricePerNight})">
          დაჯავშნა
        </button>
      </div>
    `;
  });
}
//დაჯავშნის გვერდზე გადაყვანა
function goToBooking(roomId, price) {
  window.location.href = `room-details.html?roomId=${roomId}&price=${price}`;
}

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

document.addEventListener("DOMContentLoaded", handleAuthUI);
