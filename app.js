const Api = "https://hotelbooking.stepprojects.ge/";
const API_hotels = Api + "api/Hotels/GetAll";
const API_rooms = Api + "api/Rooms/GetAll";
const API_roomsFilter = Api + "api/Rooms/GetFiltered";
const API_bookings = Api + "api/Booking";
const API_deleteBooking = Api + "api/Booking/{bookingId}";

async function getHotels() {
  try {
    const response = await fetch(API_hotels);
    const data = await response.json();
    console.log(data);

    renderHotels(data);
  } catch (error) {
    console.error("Error fetching hotels:", error);
  }
}

function renderHotels(hotels) {
  const container = document.getElementById("hotels-list");
  if (!container) return;
  container.innerHTML = "";

  hotels.forEach((hotel) => {
    const card = document.createElement("div");
    card.className = "hotels-card";

    const img = document.createElement("img");
    img.src = hotel.featuredImage || hotel.imageUrl || hotel.image || "";
    img.alt = hotel.name || "Hotel image";

    const content = document.createElement("div");
    content.className = "hotels-card-content";

    const title = document.createElement("h3");
    title.textContent = hotel.name || "Unnamed Hotel";

    const meta = document.createElement("p");
    meta.className = "meta";
    meta.textContent = hotel.city || hotel.address || "";

    const actions = document.createElement("div");
    actions.className = "hotel-actions";

    const more = document.createElement("a");
    more.className = "btn";
    more.href = `#`;
    more.textContent = "გაიგე მეტი";

    const book = document.createElement("a");
    book.className = "btn btn-primary";
    book.href = `booking.html?hotelId=${hotel.id || ""}`;
    book.textContent = "დაჯავშნა";

    actions.appendChild(more);
    actions.appendChild(book);

    content.appendChild(title);
    content.appendChild(meta);
    content.appendChild(actions);

    card.appendChild(img);
    card.appendChild(content);

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getHotels();
});
