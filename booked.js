const API_URL = "https://hotelbooking.stepprojects.ge/api";
const bookedTableBody = document.querySelector("#bookedTable tbody");
const bookedTable = document.getElementById("bookedTable");
const phoneInput = document.getElementById("phoneInput");
const searchBtn = document.getElementById("searchBtn");

// roomID -> { hotelName, roomName, roomImage } მეპი
let _roomInfoCache = {};
let _roomCacheBuilt = false;

async function buildRoomInfoMap() {
  if (_roomCacheBuilt) return;

  try {
    const res = await fetch(`${API_URL}/Hotels/GetAll`);
    if (!res.ok) return;
    const hotels = await res.json();

    const promises = hotels.map(async (hotel) => {
      try {
        const hRes = await fetch(`${API_URL}/Hotels/GetHotel/${hotel.id}`);
        if (!hRes.ok) return;
        const hotelData = await hRes.json();
        if (!hotelData.rooms) return;

        hotelData.rooms.forEach((room) => {
          _roomInfoCache[room.id] = {
            hotelName: hotelData.name || hotel.name || "-",
            roomName: room.name || `ოთახი #${room.id}`,
            roomImage: room.image
              ? `https://hotelbooking.stepprojects.ge${room.image}`
              : "",
          };
        });
      } catch (e) {
        // skip
      }
    });

    await Promise.all(promises);
    _roomCacheBuilt = true;
  } catch (e) {
    // fallback
  }
}

function getRoomInfo(roomId) {
  return (
    _roomInfoCache[roomId] || {
      hotelName: "-",
      roomName: `ოთახი #${roomId}`,
      roomImage: "",
    }
  );
}

// ცხრილის რენდერი (roomInfo-ით ან უიმისოდ)
function renderBookingsTable(filteredBookings, phone) {
  bookedTableBody.innerHTML = "";

  filteredBookings.forEach((b) => {
    const info = getRoomInfo(b.roomID);
    const tr = document.createElement("tr");
    tr.setAttribute("data-room-id", b.roomID);

    tr.innerHTML = `
      <td class="cell-hotel">${info.hotelName}</td>
      <td class="cell-room">${info.roomName}</td>
      <td>${b.customerName || "-"}</td>
      <td>${b.customerPhone || "-"}</td>
      <td>${new Date(b.checkInDate).toLocaleDateString()}</td>
      <td>${new Date(b.checkOutDate).toLocaleDateString()}</td>
      <td>${b.totalPrice} ₾</td>
      <td>${b.isConfirmed ? "დადასტურებულია" : "მოლოდინში"}</td>
      <td>
        <button class="cancel-btn" data-id="${b.id}">
          გაუქმება
        </button>
      </td>
    `;

    bookedTableBody.appendChild(tr);
  });

  // გაუქმება
  document.querySelectorAll(".cancel-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = Number(btn.dataset.id);

      const confirm = await Swal.fire({
        title: "გაუქმება",
        text: "ნამდვილად გსურთ ჯავშნის გაუქმება?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "დიახ, გააუქმე",
        cancelButtonText: "არა",
      });

      if (!confirm.isConfirmed) return;

      try {
        await fetch(`${API_URL}/Booking/${id}`, {
          method: "DELETE",
        });

        Swal.fire("წარმატება", "ჯავშანი გაუქმდა", "success");
        fetchBookedByPhone(phone);
      } catch (e) {
        Swal.fire("შეცდომა", "გაუქმება ვერ შესრულდა", "error");
      }
    });
  });
}

async function fetchBookedByPhone(phone) {
  bookedTable.style.display = "table";
  bookedTableBody.innerHTML = "<tr><td colspan='10'>იტვირთება...</td></tr>";

  try {
    const res = await fetch(`${API_URL}/Booking`);
    if (!res.ok) throw new Error("სერვერის შეცდომა");

    const bookings = await res.json();

    // ფილტრი ტელეფონის ნომრით
    const normalizedPhone = phone.replace(/\s+/g, "").replace(/^\+/, "");
    const filteredBookings = bookings.filter((b) => {
      if (!b.customerPhone) return false;
      const bPhone = b.customerPhone.replace(/\s+/g, "").replace(/^\+/, "");
      return bPhone === normalizedPhone;
    });

    if (!filteredBookings.length) {
      bookedTableBody.innerHTML =
        "<tr><td colspan='10'>ამ ნომრით ჯავშანი ვერ მოიძებნა</td></tr>";
      return;
    }

    // 1) ცხრილი მაშინვე გამოჩნდეს (ოთახის სახელი/ფოტო მერე ჩაიტვირთება)
    renderBookingsTable(filteredBookings, phone);

    // 2) ფონზე ოთახის ინფო ჩატვირთვა და ცხრილის განახლება
    if (!_roomCacheBuilt) {
      buildRoomInfoMap().then(() => {
        // ცხრილის უჯრები განაახლე ახალი ინფოთი
        document
          .querySelectorAll("#bookedTable tbody tr[data-room-id]")
          .forEach((tr) => {
            const roomId = Number(tr.getAttribute("data-room-id"));
            const info = getRoomInfo(roomId);
            const hotelCell = tr.querySelector(".cell-hotel");
            const roomCell = tr.querySelector(".cell-room");
            const imgCell = tr.querySelector(".cell-img img");
            if (hotelCell) hotelCell.textContent = info.hotelName;
            if (roomCell) roomCell.textContent = info.roomName;
            if (imgCell) imgCell.src = info.roomImage;
          });
      });
    }
  } catch (err) {
    bookedTableBody.innerHTML = `<tr><td colspan="10">შეცდომა: ${err.message}</td></tr>`;
  }
}

// ძებნის ღილაკზე კლიკი
searchBtn.addEventListener("click", () => {
  const phone = phoneInput.value.trim();
  if (!phone) {
    Swal.fire("შეცდომა", "გთხოვთ შეიყვანეთ ტელეფონის ნომერი", "warning");
    return;
  }
  fetchBookedByPhone(phone);
});

// Enter-ზე დაჭერით ძებნა
phoneInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});
