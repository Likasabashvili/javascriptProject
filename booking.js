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
    const res = await fetch(`${API_URL}/Room/${roomId}`);
    if (!res.ok) throw new Error("ოთახი ვერ მოიძებნა");

    const room = await res.json();
    currentRoom = room;

    roomImage.src = room.imageUrl;
    roomTitle.textContent = room.name;
    roomPrice.textContent = `ფასი: ${room.pricePerNight} ₾ / ღამე`;
  } catch (err) {
    Swal.fire("შეცდომა", err.message, "error");
  }
}

// დღეების გამოთვლა
function calculateDays(checkIn, checkOut) {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return (end - start) / (1000 * 60 * 60 * 24);
}

// დაჯავშნა
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

  const days = calculateDays(checkIn, checkOut);
  const totalPrice = days * currentRoom.pricePerNight;

  try {
    const res = await fetch(`${API_URL}/Booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomId: Number(roomId),
        customerName: name,
        customerPhone: phone,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        totalPrice: totalPrice
      }),
    });

    if (!res.ok) throw new Error("დაჯავშნა ვერ შესრულდა");

    const data = await res.json();

    // 👉 ვინახავთ ჩვენს booking ID-ს
    const savedBookings = JSON.parse(localStorage.getItem("myBookings")) || [];
    savedBookings.push(data.id);
    localStorage.setItem("myBookings", JSON.stringify(savedBookings));

    Swal.fire("წარმატება", "ოთახი წარმატებით დაიჯავშნა", "success")
      .then(() => {
        window.location.href = "booked.html";
      });

  } catch (err) {
    Swal.fire("შეცდომა", err.message, "error");
  }
});

fetchRoom();