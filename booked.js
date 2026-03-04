// const API_URL = "https://hotelbooking.stepprojects.ge/api";
// const bookedTableBody = document.querySelector("#bookedTable tbody");

// // ოთახების ჩატვირთვა
// async function fetchBookedRooms() {
//   bookedTableBody.innerHTML =
//     "<tr><td colspan='10'>მოთხოვნის წამოწყება...</td></tr>";
//   try {
//     const res = await fetch(`${API_URL}/Booking`);
//     if (!res.ok) throw new Error("სერვერის შეცდომა: " + res.status);
//     const bookings = await res.json();

//     if (!bookings.length) {
//       bookedTableBody.innerHTML =
//         "<tr><td colspan='10'>დაჯავშნილი ოთახები არ არის.</td></tr>";
//       return;
//     }

//     bookedTableBody.innerHTML = "";
//     bookings.forEach((b) => {
//       const hotelName = b.hotelName || "–"; // თუ API-ში არაა, შეიძლება მაგით
//       const roomName = b.roomName || "–";
//       const roomImg = b.roomImage || "placeholder.png";

//       const tr = document.createElement("tr");
//       tr.innerHTML = `
//               <td>${hotelName}</td>
//               <td>${roomName}</td>
//               <td><img class="room-img" src="${roomImg}" alt="${roomName}" /></td>
//               <td>${b.customerName}</td>
//               <td>${b.customerPhone}</td>
//               <td>${new Date(b.checkInDate).toLocaleDateString()}</td>
//               <td>${new Date(b.checkOutDate).toLocaleDateString()}</td>
//               <td>${b.totalPrice}</td>
//               <td>${b.isConfirmed ? "დადასტურებულია" : "მოლოდინში"}</td>
//               <td><button class="cancel-btn" data-id="${b.id}">გაუქმება</button></td>
//             `;
//       bookedTableBody.appendChild(tr);
//     });

//     // გაუქმების ღილაკები
//     document.querySelectorAll(".cancel-btn").forEach((btn) => {
//       btn.addEventListener("click", async () => {
//         const bookingId = btn.dataset.id;
//         try {
//           const res = await fetch(`${API_URL}/Booking/${bookingId}`, {
//             method: "DELETE",
//           });
//           if (!res.ok) throw new Error("გაუქმება ვერ შესრულდა: " + res.status);
//           Swal.fire("სწორი", "დაჯავშნა გაუქმდა", "success");
//           fetchBookedRooms(); // განახლება
//         } catch (err) {
//           Swal.fire("შეცდომა", err.message, "error");
//         }
//       });
//     });
//   } catch (err) {
//     bookedTableBody.innerHTML = `<tr><td colspan='10'>შეცდომა: ${err.message}</td></tr>`;
//   }
// }

// // ჩატვირთვა
// fetchBookedRooms();

const API_URL = "https://hotelbooking.stepprojects.ge/api";
const bookedTableBody = document.querySelector("#bookedTable tbody");

async function fetchBookedRooms() {
  bookedTableBody.innerHTML = "<tr><td colspan='10'>იტვირთება...</td></tr>";

  try {
    const res = await fetch(`${API_URL}/Booking`);
    if (!res.ok) throw new Error("სერვერის შეცდომა");

    const bookings = await res.json();

    // 👉 მხოლოდ ჩვენი ID-ები
    const myBookings = JSON.parse(localStorage.getItem("myBookings")) || [];

    const filteredBookings = bookings.filter((b) => myBookings.includes(b.id));

    if (!filteredBookings.length) {
      bookedTableBody.innerHTML =
        "<tr><td colspan='10'>ოთახი არ არის დაჯავშნილი</td></tr>";
      return;
    }

    bookedTableBody.innerHTML = "";

    filteredBookings.forEach((b) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${b.hotel?.name || "-"}</td>
        <td>${b.room?.name || "-"}</td>
        <td>
          <img 
            src="${b.room?.imageUrl || "placeholder.png"}" 
            width="80"
            style="border-radius:6px;"
          >
        </td>
        <td>${b.customerName}</td>
        <td>${b.customerPhone}</td>
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

        try {
          await fetch(`${API_URL}/Booking/${id}`, {
            method: "DELETE",
          });

          // localStorage განახლება
          const updated = myBookings.filter((bId) => bId !== id);
          localStorage.setItem("myBookings", JSON.stringify(updated));

          Swal.fire("წარმატება", "დაჯავშნა გაუქმდა", "success");
          fetchBookedRooms();
        } catch {
          Swal.fire("შეცდომა", "გაუქმება ვერ შესრულდა", "error");
        }
      });
    });
  } catch (err) {
    bookedTableBody.innerHTML = `<tr><td colspan="10">${err.message}</td></tr>`;
  }
}

fetchBookedRooms();
