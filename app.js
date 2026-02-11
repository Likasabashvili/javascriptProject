// fetch("https://hotelbooking.stepprojects.ge/api/Rooms/GetAll")
//   .then((response) => response.json())
//   .then((data) => console.log(data))
//   .catch((error) => console.error(error));

//GET METHOD
async function fetchData() {
  try {
    const response = await fetch(
      "https://hotelbooking.stepprojects.ge/api/Rooms/GetAll",
    );
    const data = await response.json();
    console.log(data);

    const rooms = document.getElementById("rooms");

    data.forEach((room) => {
      const card = document.createElement("div");
      card.className = "room-card";

      card.innerHTML = `
        <img src="${room.images[0].source}" alt="${room.name}" class="room-image">
        <div class="room-info">
          <h3 class="room-name">${room.name}</h3>
          <p class="room-price">${room.pricePerNight} €</p>
          <p class="available">${room.available} </p>
        </div>
      `;

      rooms.appendChild(card);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

fetchData();
//POST METHOD
async function postData() {
  try {
    const response = await fetch(
      "https://hotelbooking.stepprojects.ge/api/Rooms/GetFiltered",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceFrom: 50,
          priceTo: 200,
          available: true,
        }),
      },
    );
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error posting data:", error);
  }
}
postData();