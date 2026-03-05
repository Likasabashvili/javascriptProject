const API_URL = "https://hotelbooking.stepprojects.ge/api";

// HTML ელემენტები
const priceFilter = document.getElementById("priceFilter");
const checkInInput = document.getElementById("checkIn");
const checkOutInput = document.getElementById("checkOut");
const guestFilter = document.getElementById("guestFilter");
const searchBtn = document.querySelector(".search-btn");
const resetBtn = document.querySelector(".reset-btn");
const roomsContainer = document.getElementById("roomsContainer");

let allRooms = [];

// document load
document.addEventListener("DOMContentLoaded", () => {
  fetchAllRooms();
});

// ყველა ოთახის ჩამოტვირთვა - API-დან პირდაპირ
async function fetchAllRooms() {
  try {
    if (!roomsContainer) {
      console.error("roomsContainer ელემენტი ვერ მოიძებნა!");
      return;
    }

    roomsContainer.innerHTML = "<p>ოთახების ჩამოტვირთვა...</p>";
    console.log("ოთახების ჩამოტვირთვის დაწყება...");

    // პირველი, ვიღებთ ყველა სასტუმროს რათა შევიცნოთ მათი ID-ები
    const hotelsRes = await fetch(`${API_URL}/Hotels/GetAll`);
    if (!hotelsRes.ok)
      throw new Error("სერვერის შეცდომა სასტუმროების ჩამოტვირთვისას");

    const hotels = await hotelsRes.json();
    console.log("სასტუმროები ჩამოტვირთულია:", hotels.length);

    // თითოეული სასტუმროსთვის ვიღებთ ოთახებს /Rooms/GetRoom/{hotelId} endpoint-დან
    allRooms = [];

    for (const hotel of hotels) {
      try {
        console.log(
          `ვიღებთ ოთახებს სასტუმროსთვის: ${hotel.name} (ID: ${hotel.id})`,
        );
        const roomsRes = await fetch(`${API_URL}/Rooms/GetRoom/${hotel.id}`);
        console.log(`Request URL: ${API_URL}/Rooms/GetRoom/${hotel.id}`);
        console.log(`Response status: ${roomsRes.status}`);

        if (roomsRes.ok) {
          const rooms = await roomsRes.json();
          console.log(`${hotel.name}-ისთვის ნედლი პასუხი:`, rooms);
          console.log(`პასუხის ტიპი:`, typeof rooms);
          console.log(`არის array?`, Array.isArray(rooms));

          // თუ პასუხი არის ერთი ობიექტი (არა array), მაშინ შეში მისი array-ში
          let roomsArray = Array.isArray(rooms) ? rooms : [rooms];

          console.log(`დამუშავებული rooms array:`, roomsArray);
          console.log(`rooms რაოდენობა:`, roomsArray.length);

          // თითოეულ ოთახს დავამატებთ სასტუმროს ინფორმაციას
          if (roomsArray.length > 0) {
            console.log(`${hotel.name}-ში სულ ${roomsArray.length} ოთახი`);
            roomsArray.forEach((room, index) => {
              console.log(`დამუშავება ოთახი ${index + 1}:`, room.name, room.id);
              room.hotelName = hotel.name;
              room.hotelId = hotel.id;
              room.hotelCity = hotel.city;
              allRooms.push(room);
            });
          } else {
            console.log(`${hotel.name}-ში ოთახები არ არის`);
          }
        } else {
          console.warn(
            `სასტუმროსთვის ${hotel.name} (ID: ${hotel.id}) ოთახები ვერ მოიძებნა, სტატუსი: ${roomsRes.status}`,
          );
          const errorText = await roomsRes.text();
          console.warn(`შეცდომის დეტალები:`, errorText);
        }
      } catch (err) {
        console.error(`ოთახები ვერ მოტვირთა სასტუმროსთვის: ${hotel.name}`, err);
      }
    }

    console.log("სულ ოთახი ჩამოტვირთულია:", allRooms.length);

    if (allRooms.length === 0) {
      roomsContainer.innerHTML = "<p>ოთახები ვერ მოიძებნა.</p>";
      return;
    }

    // URL-დან ქალაქის ფილტრი აღნიშვავთ თუ არის
    const params = new URLSearchParams(window.location.search);
    const cityFilter = params.get("city");

    if (cityFilter) {
      const filtered = allRooms.filter((room) =>
        room.hotelCity?.toLowerCase().includes(cityFilter.toLowerCase()),
      );
      displayRooms(filtered);
    } else {
      displayRooms(allRooms);
    }
  } catch (err) {
    console.error("მთავარი შეცდომა:", err);
    roomsContainer.innerHTML = `<p>შეცდომა: ${err.message}</p>`;
  }
}

// ოთახების ფილტრი
function filterRooms() {
  let filtered = [...allRooms];

  // ფასის ფილტრი
  if (priceFilter.value) {
    const maxPrice = parseFloat(priceFilter.value);
    filtered = filtered.filter((room) => room.pricePerNight <= maxPrice);
  }

  // სტუმრების რაოდენობა
  if (guestFilter.value) {
    const guests = parseInt(guestFilter.value);
    if (guests === 4) {
      filtered = filtered.filter((room) => room.maximumGuests >= 4);
    } else {
      filtered = filtered.filter((room) => room.maximumGuests >= guests);
    }
  }

  // Check-in და Check-out თარიღები
  if (checkInInput.value && checkOutInput.value) {
    const checkInDate = new Date(checkInInput.value);
    const checkOutDate = new Date(checkOutInput.value);

    filtered = filtered.filter((room) => {
      if (!room.bookedDates || room.bookedDates.length === 0) {
        return true;
      }

      // შემოწმება თუ მოთხოვნილი თარიღი დაკმაყოფილებულია
      for (let bookedDate of room.bookedDates) {
        const booked = new Date(bookedDate.date);
        if (booked >= checkInDate && booked < checkOutDate) {
          return false;
        }
      }
      return true;
    });
  }

  return filtered;
}

// ოთახების ჩვენება
function displayRooms(rooms) {
  roomsContainer.innerHTML = "";

  if (rooms.length === 0) {
    roomsContainer.innerHTML = "<p>ოთახები ვერ მოიძებნა.</p>";
    return;
  }

  rooms.forEach((room) => {
    const roomCard = document.createElement("div");
    roomCard.classList.add("room-card");

    const imgSrc =
      room.images && room.images.length > 0
        ? room.images[0].source
        : "https://picsum.photos/300/200";

    roomCard.innerHTML = `
      <img src="${imgSrc}" alt="${room.name}" />
      <div class="room-card-body">
        <h3>${room.name}</h3>
        <p class="hotel-name">${room.hotelName || "სასტუმრო"}</p>
        <p class="price">ფასი: ${room.pricePerNight} ₾ / ღამე</p>
        <p class="guests">მაქს. სტუმრები: ${room.maximumGuests}</p>
        <a href="booking.html?roomId=${room.id}" class="btn btn-primary booking-btn">დაჯავშნა</a>
      </div>
    `;
    roomsContainer.appendChild(roomCard);
  });
}

// მოვლენების რეგისტრაცია
searchBtn.addEventListener("click", () => {
  const filtered = filterRooms();
  displayRooms(filtered);
});

resetBtn.addEventListener("click", () => {
  priceFilter.value = "";
  checkInInput.value = "";
  checkOutInput.value = "";
  guestFilter.value = "";
  displayRooms(allRooms);
});

// ოთახების ფილტრი
function filterRooms() {
  let filtered = [...allRooms];

  // ფასის ფილტრი
  if (priceFilter.value) {
    const maxPrice = parseFloat(priceFilter.value);
    filtered = filtered.filter((room) => room.pricePerNight <= maxPrice);
  }

  // სტუმრების რაოდენობა
  if (guestFilter.value) {
    const guests = parseInt(guestFilter.value);
    if (guests === 4) {
      filtered = filtered.filter((room) => room.maximumGuests >= 4);
    } else {
      filtered = filtered.filter((room) => room.maximumGuests >= guests);
    }
  }

  // Check-in და Check-out თარიღები
  if (checkInInput.value && checkOutInput.value) {
    const checkInDate = new Date(checkInInput.value);
    const checkOutDate = new Date(checkOutInput.value);

    filtered = filtered.filter((room) => {
      if (!room.bookedDates || room.bookedDates.length === 0) {
        return true;
      }

      // შემოწმება თუ მოთხოვნილი თარიღი დაკმაყოფილებულია
      for (let bookedDate of room.bookedDates) {
        const booked = new Date(bookedDate.date);
        if (booked >= checkInDate && booked < checkOutDate) {
          return false;
        }
      }
      return true;
    });
  }

  return filtered;
}

// ოთახების ჩვენება
function displayRooms(rooms) {
  roomsContainer.innerHTML = "";

  if (rooms.length === 0) {
    roomsContainer.innerHTML = "<p>ოთახები ვერ მოიძებნა.</p>";
    return;
  }

  rooms.forEach((room) => {
    const roomCard = document.createElement("div");
    roomCard.classList.add("room-card");

    const imgSrc =
      room.images && room.images.length > 0
        ? room.images[0].source
        : "https://picsum.photos/300/200";

    roomCard.innerHTML = `
      <img src="${imgSrc}" alt="${room.name}" />
      <div class="room-card-body">
        <h3>${room.name}</h3>
        <p class="hotel-name">${room.hotelName || "სასტუმრო"}</p>
        <p class="price">ფასი: ${room.pricePerNight} ₾ / ღამე</p>
        <p class="guests">მაქს. სტუმრები: ${room.maximumGuests}</p>
        <a href="booking.html?roomId=${room.id}" class="btn btn-primary booking-btn">დაჯავშნა</a>
      </div>
    `;
    roomsContainer.appendChild(roomCard);
  });
}

// მოვლენების რეგისტრაცია
if (searchBtn) {
  console.log("✓ Search button found");
  searchBtn.addEventListener("click", () => {
    console.log("🔍 Search button clicked");
    const filtered = filterRooms();
    displayRooms(filtered);
  });
} else {
  console.warn("⚠️ Search button not found");
}

if (resetBtn) {
  console.log("✓ Reset button found");
  resetBtn.addEventListener("click", () => {
    console.log("↻ Reset button clicked");
    priceFilter.value = "";
    checkInInput.value = "";
    checkOutInput.value = "";
    guestFilter.value = "";
    displayRooms(allRooms);
  });
} else {
  console.warn("⚠️ Reset button not found");
}
