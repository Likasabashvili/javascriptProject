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
    // Fallback: try a public CORS proxy for local development
    try {
      const proxy =
        "https://api.allorigins.win/raw?url=" + encodeURIComponent(API_hotels);
      const resp2 = await fetch(proxy);
      const data2 = await resp2.json();
      console.log("Fetched via proxy", data2);
      renderHotels(data2);
      return;
    } catch (err2) {
      console.error("Proxy fetch failed:", err2);
    }
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

async function getRooms() {
  try {
    const response = await fetch(API_rooms);
    const data = await response.json();
    console.log("rooms:", data);

    // Render most expensive three into featured grid
    renderTopExpensiveRooms(data, 3);
    // Render first three into rooms list
    renderFirstRooms(data, 3);
    // If on rooms page, render all rooms
    if (document.getElementById("rooms-list")) {
      renderAllRooms(data);
    }
  } catch (error) {
    console.error("Error fetching rooms:", error);
    try {
      const proxy =
        "https://api.allorigins.win/raw?url=" + encodeURIComponent(API_rooms);
      const resp2 = await fetch(proxy);
      const data2 = await resp2.json();
      console.log("rooms via proxy:", data2);
      renderTopExpensiveRooms(data2, 3);
      renderFirstRooms(data2, 3);
      if (document.getElementById("rooms-list")) {
        renderAllRooms(data2);
      }
      return;
    } catch (err2) {
      console.error("Proxy fetch for rooms failed, using fallback:", err2);
      // Local fallback sample data so UI shows rooms during API/proxy downtime
      const sampleRooms = [
        {
          id: 101,
          name: "Standart Double",
          hotelName: "Sample Hotel A",
          featuredImage: "https://via.placeholder.com/600x400?text=Room+1",
          price: 120,
          guests: 2,
        },
        {
          id: 102,
          name: "Deluxe Suite",
          hotelName: "Sample Hotel B",
          featuredImage: "https://via.placeholder.com/600x400?text=Room+2",
          price: 240,
          guests: 4,
        },
        {
          id: 103,
          name: "Single Room",
          hotelName: "Sample Hotel C",
          featuredImage: "https://via.placeholder.com/600x400?text=Room+3",
          price: 80,
          guests: 1,
        },
        {
          id: 104,
          name: "Family Room",
          hotelName: "Sample Hotel D",
          featuredImage: "https://via.placeholder.com/600x400?text=Room+4",
          price: 180,
          guests: 4,
        },
      ];
      console.log("Using sample rooms fallback");
      renderTopExpensiveRooms(sampleRooms, 3);
      renderFirstRooms(sampleRooms, 3);
      if (document.getElementById("rooms-list")) {
        renderAllRooms(sampleRooms);
      }
    }
  }
}

function getRoomPrice(r) {
  if (!r) return 0;
  const candidates = [r.price, r.Price, r.pricePerNight, r.cost, r.amount];
  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== "") {
      const n = parseFloat(c);
      if (!isNaN(n)) return n;
    }
  }
  return 0;
}

function getRoomGuests(r) {
  if (!r) return 0;
  const candidates = [
    r.guests,
    r.GuestCount,
    r.maxGuests,
    r.capacity,
    r.persons,
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== "") {
      const n = parseInt(c, 10);
      if (!isNaN(n) && n > 0) return n;
    }
  }
  return 0;
}

function renderTopExpensiveRooms(rooms, count) {
  if (!Array.isArray(rooms)) return;
  const container = document.getElementById("featured-grid");
  if (!container) return;
  // sort by price desc
  const sorted = [...rooms].sort((a, b) => getRoomPrice(b) - getRoomPrice(a));
  const top = sorted.slice(0, count);
  container.innerHTML = "";
  top.forEach((room) => {
    const article = document.createElement("article");
    article.className = "hotel-card";

    const img = document.createElement("img");
    img.src =
      room.featuredImage ||
      room.image ||
      room.imageUrl ||
      (room.images && room.images[0]?.source) ||
      "" ||
      "";
    img.alt = room.name || room.title || "Room image";

    const body = document.createElement("div");
    body.className = "body";

    const h4 = document.createElement("h4");
    const titleText = room.name || room.title || "Unnamed Room";
    const price = getRoomPrice(room);
    h4.textContent = `${titleText}`;

    const meta = document.createElement("p");
    meta.className = "meta";
    const parts = [];
    const hotelLabel = room.hotelName || room.hotel || room.address || "";
    if (hotelLabel) parts.push(hotelLabel);
    const guests = getRoomGuests(room);
    if (guests) parts.push(`სტუმრები: ${guests}`);
    if (price) parts.push(`${price}₾`);
    meta.textContent = parts.join(" • ");

    const actions = document.createElement("div");
    actions.className = "hotel-actions";
    const more = document.createElement("a");
    more.className = "btn";
    more.href = `#`;
    more.textContent = "გაიგე მეტი";
    const book = document.createElement("a");
    book.className = "btn btn-primary";
    book.href = `booking.html?roomId=${room.id || ""}`;
    book.textContent = "დაჯავშნა";
    actions.appendChild(more);
    actions.appendChild(book);

    body.appendChild(h4);
    body.appendChild(meta);
    body.appendChild(actions);

    article.appendChild(img);
    article.appendChild(body);
    container.appendChild(article);
  });
}

function renderFirstRooms(rooms, count) {
  if (!Array.isArray(rooms)) return;
  const container = document.querySelector(".cards-grid");
  if (!container) return;
  const first = rooms.slice(0, count);
  container.innerHTML = "";
  first.forEach((room) => {
    const article = document.createElement("article");
    article.className = "card";

    const img = document.createElement("img");
    img.src =
      room.featuredImage ||
      room.image ||
      room.imageUrl ||
      (room.images && room.images[0]?.source) ||
      "";
    img.alt = room.name || room.title || "Room image";

    const body = document.createElement("div");
    body.className = "card-body";

    const h3 = document.createElement("h3");
    h3.textContent = room.name || room.title || "Unnamed Room";

    const meta = document.createElement("p");
    meta.className = "meta";
    const parts2 = [];
    const hotelLabel2 = room.hotelName || room.hotel || room.address || "";
    if (hotelLabel2) parts2.push(hotelLabel2);
    const guests2 = getRoomGuests(room);
    if (guests2) parts2.push(`სტუმრები: ${guests2}`);
    const price2 = getRoomPrice(room);
    if (price2) parts2.push(`${price2}₾`);
    meta.textContent = parts2.join(" • ");

    const actions = document.createElement("div");
    actions.className = "card-actions";
    const view = document.createElement("a");
    view.className = "btn";
    view.href = `#`;
    view.textContent = "View";
    const book = document.createElement("a");
    book.className = "btn btn-primary";
    book.href = `booking.html?roomId=${room.id || ""}`;
    book.textContent = "Book";
    actions.appendChild(view);
    actions.appendChild(book);

    body.appendChild(h3);
    body.appendChild(meta);
    body.appendChild(actions);

    article.appendChild(img);
    article.appendChild(body);
    container.appendChild(article);
  });
}

function renderAllRooms(rooms) {
  if (!Array.isArray(rooms)) return;
  const container = document.getElementById("rooms-list");
  if (!container) return;
  container.innerHTML = "";
  rooms.forEach((room) => {
    const article = document.createElement("article");
    article.className = "card";

    const img = document.createElement("img");
    img.src =
      room.featuredImage ||
      room.image ||
      room.imageUrl ||
      (room.images && room.images[0]?.source) ||
      "";
    img.alt = room.name || room.title || "Room image";

    const body = document.createElement("div");
    body.className = "card-body";

    const h3 = document.createElement("h3");
    h3.textContent = room.name || room.title || "Unnamed Room";

    const meta = document.createElement("p");
    meta.className = "meta";
    const parts = [];
    const hotelLabel = room.hotelName || room.hotel || room.address || "";
    if (hotelLabel) parts.push(hotelLabel);
    const guests = getRoomGuests(room);
    if (guests) parts.push(`სტუმრები: ${guests}`);
    const price = getRoomPrice(room);
    if (price) parts.push(`${price}₾`);
    meta.textContent = parts.join(" • ");

    const actions = document.createElement("div");
    actions.className = "card-actions";
    const view = document.createElement("a");
    view.className = "btn";
    view.href = `#`;
    view.textContent = "View";
    const book = document.createElement("a");
    book.className = "btn btn-primary";
    book.href = `booking.html?roomId=${room.id || ""}`;
    book.textContent = "Book";
    actions.appendChild(view);
    actions.appendChild(book);

    body.appendChild(h3);
    body.appendChild(meta);
    body.appendChild(actions);

    article.appendChild(img);
    article.appendChild(body);
    container.appendChild(article);
  });
}

// call getRooms on load
document.addEventListener("DOMContentLoaded", () => {
  getHotels();
  getRooms();
});
