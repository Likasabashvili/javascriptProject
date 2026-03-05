document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://hotelbooking.stepprojects.ge/api";
  const CACHE_TTL = 10 * 60 * 1000; // 10 წუთი
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

  // 🔧 localStorage ქეშირების დამხმარეები
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
    } catch (e) {
      return null;
    }
  }

  function setCache(key, data) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({ data, timestamp: Date.now() }),
      );
    } catch (e) {
      console.warn("localStorage შენახვა ვერ მოხერხდა:", e);
    }
  }

  // 🔥 ყველა ოთახის წამოღება (localStorage ქეშით)
  async function fetchAllRooms() {
    const cached = getCache("all_rooms");
    if (cached) return cached;

    try {
      // სასტუმროების სია — ჯერ ქეშიდან
      let hotels = getCache("hotels_all");
      if (!hotels) {
        const hotelsRes = await fetch(`${API_URL}/Hotels/GetAll`);
        if (!hotelsRes.ok)
          throw new Error("სასტუმროების წამოღება ვერ მოხერხდა");
        hotels = await hotelsRes.json();
        setCache("hotels_all", hotels);
      }

      const hotelDetails = await Promise.all(
        hotels.map((h) => {
          const hCache = getCache("hotel_" + h.id);
          if (hCache) return Promise.resolve(hCache);
          return fetch(`${API_URL}/Hotels/GetHotel/${h.id}`)
            .then((r) => r.json())
            .then((hotel) => {
              setCache("hotel_" + hotel.id, hotel);
              return hotel;
            });
        }),
      );

      let allRooms = [];
      hotelDetails.forEach((hotel) => {
        if (hotel.rooms && hotel.rooms.length) {
          allRooms = allRooms.concat(hotel.rooms);
        }
      });

      setCache("all_rooms", allRooms);
      return allRooms;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  // 🔥 ოთახების წამოღება (hotelId მხარდაჭერით, localStorage ქეშით)
  async function fetchRooms(filters = null) {
    roomsContainer.innerHTML = "<p>იტვირთება...</p>";

    try {
      let rooms;

      if (hotelIdFromUrl) {
        // კონკრეტული სასტუმროს ოთახები — ქეშით
        const cacheKey = "hotel_" + hotelIdFromUrl;
        let hotel = getCache(cacheKey);
        if (!hotel) {
          const res = await fetch(
            `${API_URL}/Hotels/GetHotel/${hotelIdFromUrl}`,
          );
          if (!res.ok) throw new Error("სერვერის შეცდომა: " + res.status);
          hotel = await res.json();
          setCache(cacheKey, hotel);
        }
        rooms = hotel.rooms || [];
      } else {
        // ყველა სასტუმროს ოთახები
        rooms = await fetchAllRooms();
      }

      // ✅ ფილტრაცია კლიენტის მხარეს (თუ ფილტრებია მითითებული)
      if (filters) {
        if (filters.priceTo > 0) {
          rooms = rooms.filter((r) => r.pricePerNight <= filters.priceTo);
        }
        if (filters.maximumGuests > 0) {
          rooms = rooms.filter((r) => r.maximumGuests >= filters.maximumGuests);
        }
      }

      if (!rooms.length) {
        roomsContainer.innerHTML = "<p>ოთახები ვერ მოიძებნა.</p>";
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

      const imgSrc = room.images?.[0]?.source || "";

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

        // SweetAlert2 ფორმით ყველა საჭირო ველის შეკრება
        const { value: formValues } = await Swal.fire({
          title: "დაჯავშნა",
          html:
            '<input id="swal-name" class="swal2-input" placeholder="თქვენი სახელი">' +
            '<input id="swal-phone" class="swal2-input" placeholder="ტელეფონი">' +
            '<label style="display:block;margin-top:10px;font-size:14px;">Check-in</label>' +
            '<input id="swal-checkin" type="date" class="swal2-input">' +
            '<label style="display:block;margin-top:10px;font-size:14px;">Check-out</label>' +
            '<input id="swal-checkout" type="date" class="swal2-input">',
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: "დაჯავშნა",
          cancelButtonText: "გაუქმება",
          preConfirm: () => {
            const name = document.getElementById("swal-name").value.trim();
            const phone = document.getElementById("swal-phone").value.trim();
            const checkIn = document.getElementById("swal-checkin").value;
            const checkOut = document.getElementById("swal-checkout").value;

            if (!name || !phone || !checkIn || !checkOut) {
              Swal.showValidationMessage("გთხოვთ შეავსოთ ყველა ველი");
              return false;
            }

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const nights = (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24);

            if (nights <= 0) {
              Swal.showValidationMessage(
                "Check-out უნდა იყოს Check-in-ზე გვიან",
              );
              return false;
            }

            return { name, phone, checkIn, checkOut, nights };
          },
        });

        if (!formValues) return; // მომხმარებელმა გააუქმა

        const {
          name: customerName,
          phone: customerPhone,
          checkIn,
          checkOut,
          nights,
        } = formValues;
        const totalPrice = roomPrice * nights;

        try {
          // ⏳ ლოდინის ანიმაცია
          Swal.fire({
            title: "გთხოვთ მოიცადოთ...",
            text: "მიმდინარეობს დაჯავშნა",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

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

          const text = await res.text();

          // სერვერი აბრუნებს: "Booking retrieved successfully. Booking Id 15548"
          const idMatch = text.match(/(\d+)/);
          if (idMatch) {
            const savedBookings =
              JSON.parse(localStorage.getItem("myBookings")) || [];
            savedBookings.push(parseInt(idMatch[1]));
            localStorage.setItem("myBookings", JSON.stringify(savedBookings));
          }

          Swal.fire(
            "წარმატება",
            `ოთახი წარმატებით დაიჯავშნა!\nჯამური ფასი: ${totalPrice} ₾`,
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
      priceTo: priceFilter.value ? parseFloat(priceFilter.value) : 0,
      maximumGuests: guestFilter.value ? parseInt(guestFilter.value) : 0,
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
