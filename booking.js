const API_URL = "https://hotelbooking.stepprojects.ge/api";

const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("roomId");

const roomImage = document.getElementById("roomImage");
const roomTitle = document.getElementById("roomTitle");
const roomPrice = document.getElementById("roomPrice");
const bookingForm = document.getElementById("bookingForm");

let currentRoom = null;

// ოთახის ჩატვირთვა
async function fetchRoom() {
  try {
    const res = await fetch(`${API_URL}/Rooms/GetRoom/${roomId}`);
    if (!res.ok) throw new Error("ოთახი ვერ მოიძებნა");

    const rooms = await res.json();
    if (Array.isArray(rooms) && rooms.length > 0) {
      currentRoom = rooms[0];
    } else {
      currentRoom = rooms;
    }

    if (currentRoom.images && currentRoom.images.length > 0) {
      roomImage.src = currentRoom.images[0].source;
    }
    roomTitle.textContent = currentRoom.name;
    roomPrice.textContent = `ფასი: ${currentRoom.pricePerNight} ₾ / ღამე`;
  } catch (err) {
    console.error(err);
    Swal.fire("შეცდომა", err.message, "error");
  }
}

// ოთახის ჩატვირთვა DOMContentLoaded-ით
document.addEventListener("DOMContentLoaded", () => {
  console.log("🏨 Booking page loaded, roomId:", roomId);
  if (roomId) {
    fetchRoom();
  }
});

// დღეების გამოთვლა
function calculateDays(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return (end - start) / (1000 * 60 * 60 * 24);
}

// დაჯავშნა
if (bookingForm) {
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;

    if (new Date(checkOut) <= new Date(checkIn)) {
      Swal.fire("შეცდომა", "Check-out უნდა იყოს Check-in-ზე გვიან", "error");
      return;
    }

    if (!name || !phone || !checkIn || !checkOut) {
      Swal.fire("შეცდომა", "გთხოვთ შეავსოთ ყველა ველი", "error");
      return;
    }

    const days = calculateDays(checkIn, checkOut);
    const totalPrice = days * currentRoom.pricePerNight;

    try {
      // დაჯავშნის მონაცემები
      const bookingData = {
        roomId: Number(roomId),
        customerName: name,
        customerPhone: phone,
        checkInDate: new Date(checkIn).toISOString().split("T")[0],
        checkOutDate: new Date(checkOut).toISOString().split("T")[0],
        totalPrice: Math.round(totalPrice),
        isConfirmed: true,
      };

      console.log("📤 დაჯავშნის მოთხოვნა:", bookingData);

      const res = await fetch(`${API_URL}/Booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      console.log("📥 პასუხის სტატუსი:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ API შეცდომა:", res.status, errorText);
        throw new Error("დაჯავშნა ვერ შესრულდა");
      }

      const data = await res.json();
      console.log("✓ დაჯავშნა წარმატებული:", data);

      // ვინახავთ ჩვენს booking ID-ს
      const savedBookings =
        JSON.parse(localStorage.getItem("myBookings")) || [];
      savedBookings.push(data.id);
      localStorage.setItem("myBookings", JSON.stringify(savedBookings));

      Swal.fire("წარმატება", "ოთახი წარმატებით დაიჯავშნა", "success").then(
        () => {
          window.location.href = "booked.html";
        },
      );
    } catch (err) {
      console.error(err);
      Swal.fire("შეცდომა", err.message, "error");
    }
  });
} else {
  console.warn("⚠️ bookingForm not found");
}

if (roomId) {
  fetchRoom();
}
