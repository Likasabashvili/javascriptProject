const API_URL = "https://hotelbooking.stepprojects.ge/api";
const bookedTableBody = document.querySelector("#bookedTable tbody");

// ოთახების ჩატვირთვა
async function fetchBookedRooms() {
  bookedTableBody.innerHTML = "<tr><td colspan='10'>იტვირთება...</td></tr>";

  try {
    const res = await fetch(`${API_URL}/Booking`);
    if (!res.ok) throw new Error("სერვერის შეცდომა");

    const bookings = await res.json();

    if (!bookings || bookings.length === 0) {
      bookedTableBody.innerHTML =
        "<tr><td colspan='10'>დაჯავშნილი ოთახები არ არის</td></tr>";
      return;
    }

    bookedTableBody.innerHTML = "";

    bookings.forEach((b) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${b.hotel?.name || b.hotelName || "-"}</td>
        <td>${b.room?.name || b.roomName || "-"}</td>
        <td>
          <img 
            src="${b.room?.images?.[0]?.source || b.roomImage || "https://picsum.photos/80/60"}" 
            width="80"
            style="border-radius:6px;"
            alt="Room"
          />
        </td>
        <td>${b.customerName || "-"}</td>
        <td>${b.customerPhone || "-"}</td>
        <td>${new Date(b.checkInDate).toLocaleDateString("ka-GE")}</td>
        <td>${new Date(b.checkOutDate).toLocaleDateString("ka-GE")}</td>
        <td>${Math.round(b.totalPrice)} ₾</td>
        <td>${b.isConfirmed ? "დადასტურებულია" : "მოლოდინში"}</td>
        <td><button class="cancel-btn btn-danger" data-id="${b.id}">გაუქმება</button></td>
      `;
      bookedTableBody.appendChild(tr);
    });

    // გაუქმების ღილაკები
    document.querySelectorAll(".cancel-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const bookingId = btn.dataset.id;

        const confirmed = await Swal.fire({
          title: "დაჯავშნის გაუქმება",
          text: "დარწმუნებული ხართ?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "დიახ",
          cancelButtonText: "გაუქმება",
        });

        if (!confirmed.isConfirmed) return;

        try {
          const res = await fetch(`${API_URL}/Booking/${bookingId}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("გაუქმება ვერ შესრულდა");

          Swal.fire("წარმატება", "დაჯავშნა გაუქმდა", "success");
          fetchBookedRooms();
        } catch (err) {
          Swal.fire("შეცდომა", err.message, "error");
        }
      });
    });
  } catch (err) {
    console.error(err);
    bookedTableBody.innerHTML = `<tr><td colspan='10'>შეცდომა: ${err.message}</td></tr>`;
  }
}

// ჩატვირთვა
document.addEventListener("DOMContentLoaded", () => {
  fetchBookedRooms();
});
