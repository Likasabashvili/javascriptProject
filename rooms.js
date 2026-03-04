// const API_URL = "https://hotelbooking.stepprojects.ge/api";

// // HTML ელემენტები
// const priceFilter = document.getElementById("priceFilter");
// const checkInInput = document.getElementById("checkIn");
// const checkOutInput = document.getElementById("checkOut");
// const guestFilter = document.getElementById("guestFilter");
// const searchBtn = document.querySelector(".search-btn");
// const resetBtn = document.querySelector(".reset-btn");

// // კონტეინერი სადაც ოთახები დაიტანება
// const roomsContainer = document.createElement("div");
// roomsContainer.classList.add("rooms-container");
// document.body.insertBefore(roomsContainer, document.querySelector("footer"));

// // ფუნქცია ოთახების აღებისთვის
// async function fetchRooms(filters = null) {
//   roomsContainer.innerHTML = "<p>მოთხოვნის წამოწყება...</p>";

//   let url = `${API_URL}/Rooms/GetAll`;
//   let options = {};

//   if (filters) {
//     url = `${API_URL}/Rooms/GetFiltered`;
//     options = {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(filters),
//     };
//   }

//   try {
//     const res = await fetch(url, options);
//     if (!res.ok) throw new Error("სერვერის შეცდომა");
//     const rooms = await res.json();

//     if (!rooms.length) {
//       roomsContainer.innerHTML = "<p>ოთახები ვერ მოიძებნა.</p>";
//       return;
//     }

//     displayRooms(rooms);
//   } catch (err) {
//     roomsContainer.innerHTML = `<p>შეცდომა: ${err.message}</p>`;
//     console.error(err);
//   }
// }

// // ფუნქცია ოთახების HTML-ში ჩვენებისთვის
// function displayRooms(rooms) {
//   roomsContainer.innerHTML = ""; // გასუფთავება
//   rooms.forEach((room) => {
//     const roomCard = document.createElement("div");
//     roomCard.classList.add("room-card");
//     roomCard.innerHTML = `
//       <img src="${room.images[0]?.source || "placeholder.png"}" alt="${room.name}" />
//       <h3>${room.name}</h3>
//       <p>ფასი: ${room.pricePerNight} ₾ / ღამე</p>
//       <p>მაქს. სტუმრები: ${room.maximumGuests}</p>
//       <button class="book-btn" data-room-id="${room.id}">დაჯავშნა</button>
//     `;
//     roomsContainer.appendChild(roomCard);
//   });

//   // დაჯავშნის ბთონის დაჭერის დასაყენება
//   document.querySelectorAll(".book-btn").forEach((btn) => {
//     btn.addEventListener("click", async () => {
//       const roomId = btn.dataset.roomId;
//       const customerName = prompt("შეიყვანეთ თქვენი სახელი:");
//       const customerPhone = prompt("შეიყვანეთ ტელეფონი:");
//       const checkIn = checkInInput.value;
//       const checkOut = checkOutInput.value;

//       if (!customerName || !customerPhone || !checkIn || !checkOut) {
//         Swal.fire("შეცდომა", "გთხოვთ შეავსოთ ყველა ველი", "error");
//         return;
//       }

//       try {
//         const res = await fetch(`${API_URL}/Booking`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             roomID: parseInt(roomId),
//             checkInDate: checkIn,
//             checkOutDate: checkOut,
//             totalPrice: 0, // შესაძლებელია გამოითვალოს თვითონ
//             isConfirmed: true,
//             customerName,
//             customerId: "12345",
//             customerPhone,
//           }),
//         });
//         if (!res.ok) throw new Error("დაჯავშნა ვერ შესრულდა");
//         Swal.fire("სწორი", "ოთახი წარმატებით დაჯავშნა", "success");
//       } catch (err) {
//         Swal.fire("შეცდომა", err.message, "error");
//       }
//     });
//   });
// }

// // ძებნის ბთონი
// searchBtn.addEventListener("click", () => {
//   const filters = {
//     priceTo: priceFilter.value ? parseFloat(priceFilter.value) : 0,
//     maximumGuests: guestFilter.value ? parseInt(guestFilter.value) : 0,
//     checkIn: checkInInput.value || new Date().toISOString(),
//     checkOut: checkOutInput.value || new Date().toISOString(),
//     roomTypeId: 0,
//   };
//   fetchRooms(filters);
// });

// // გასუფთავების ბთონი
// resetBtn.addEventListener("click", () => {
//   priceFilter.value = "";
//   checkInInput.value = "";
//   checkOutInput.value = "";
//   guestFilter.value = "";
//   fetchRooms();
// });

// // პირველად ჩატვირთვისას ყველა ოთახი
// fetchRooms();

//2

document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://hotelbooking.stepprojects.ge/api";
  const params = new URLSearchParams(window.location.search);
  const hotelIdFromUrl = params.get("hotelId"); // 👈 სასტუმროს id URL-დან

  // HTML ელემენტები
  const priceFilter = document.getElementById("priceFilter");
  const checkInInput = document.getElementById("checkIn");
  const checkOutInput = document.getElementById("checkOut");
  const guestFilter = document.getElementById("guestFilter");
  const searchBtn = document.querySelector(".search-btn");
  const resetBtn = document.querySelector(".reset-btn");
  const roomsContainer = document.getElementById("roomsContainer");

  function formatDateToISO(dateStr) {
    if (!dateStr) return new Date().toISOString();
    const [year, month, day] = dateStr.split("-");
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return date.toISOString();
  }

  // 🔥 ოთახების წამოღება (hotelId მხარდაჭერით)
  async function fetchRooms(filters = null) {
    roomsContainer.innerHTML = "<p>მოთხოვნის წამოწყება...</p>";

    let url = `${API_URL}/Rooms/GetAll`;
    let options = {};

    if (filters) {
      url = `${API_URL}/Rooms/GetFiltered`;
      options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      };
    }

    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error("სერვერის შეცდომა: " + res.status);
      let rooms = await res.json();

      // ✅ თუ hotelId არსებობს → გავფილტროთ ოთახები
      if (hotelIdFromUrl) {
        rooms = rooms.filter((room) => room.hotelId == hotelIdFromUrl);
      }

      if (!rooms.length) {
        roomsContainer.innerHTML = "<p>ამ სასტუმროში ოთახები ვერ მოიძებნა.</p>";
        return;
      }

      displayRooms(rooms);
    } catch (err) {
      roomsContainer.innerHTML = `<p>შეცდომა: ${err.message}</p>`;
      console.error(err);
    }
  }

  function displayRooms(rooms) {
    roomsContainer.innerHTML = "";

    rooms.forEach((room) => {
      const roomCard = document.createElement("div");
      roomCard.classList.add("room-card");

      const imgSrc = room.images?.[0]?.source || "placeholder.png";

      roomCard.innerHTML = `
        <img src="${imgSrc}" alt="${room.name}" />
        <h3>${room.name}</h3>
        <p>ფასი: ${room.pricePerNight} ₾ / ღამე</p>
        <p>მაქს. სტუმრები: ${room.maximumGuests}</p>
        <button class="book-btn" data-room-id="${room.id}" data-price="${room.pricePerNight}">
          დაჯავშნა
        </button>
      `;

      roomsContainer.appendChild(roomCard);
    });

    document.querySelectorAll(".book-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const roomId = parseInt(btn.dataset.roomId);
        const roomPrice = parseFloat(btn.dataset.price);
        const customerName = prompt("შეიყვანეთ თქვენი სახელი:");
        const customerPhone = prompt("შეიყვანეთ ტელეფონი:");
        const checkIn = checkInInput.value;
        const checkOut = checkOutInput.value;

        if (!customerName || !customerPhone || !checkIn || !checkOut) {
          Swal.fire("შეცდომა", "გთხოვთ შეავსოთ ყველა ველი", "error");
          return;
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const timeDiff = checkOutDate - checkInDate;
        const nights = timeDiff / (1000 * 60 * 60 * 24);

        if (nights <= 0) {
          Swal.fire(
            "შეცდომა",
            "Check-out უნდა იყოს check-in-ზე უფრო გვიან",
            "error",
          );
          return;
        }

        const totalPrice = roomPrice * nights;

        try {
          const res = await fetch(`${API_URL}/Booking`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              roomID: roomId,
              checkInDate: formatDateToISO(checkIn),
              checkOutDate: formatDateToISO(checkOut),
              totalPrice,
              isConfirmed: true,
              customerName,
              customerId: "12345",
              customerPhone,
            }),
          });

          if (!res.ok) throw new Error("დაჯავშნა ვერ შესრულდა: " + res.status);

          Swal.fire(
            "სწორი",
            `ოთახი წარმატებით დაჯავშნა\nჯამური ფასი: ${totalPrice} ₾`,
            "success",
          );
        } catch (err) {
          Swal.fire("შეცდომა", err.message, "error");
        }
      });
    });
  }

  searchBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const filters = {
      roomTypeId: 0,
      priceFrom: 0,
      priceTo: priceFilter.value ? parseFloat(priceFilter.value) : 0,
      maximumGuests: guestFilter.value ? parseInt(guestFilter.value) : 0,
      checkIn: formatDateToISO(checkInInput.value || "2026-03-04"),
      checkOut: formatDateToISO(checkOutInput.value || "2026-03-05"),
    };

    fetchRooms(filters);
  });

  resetBtn.addEventListener("click", (e) => {
    e.preventDefault();
    priceFilter.value = "";
    checkInInput.value = "";
    checkOutInput.value = "";
    guestFilter.value = "";
    fetchRooms();
  });

  // 🔥 პირველად ჩატვირთვისას
  fetchRooms();
});
