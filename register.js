const AUTH_API = "https://rentcar.stepprojects.ge/api/Users";
const form = document.getElementById("register-form");
const messageDiv = document.getElementById("registerMessage");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const phoneNumber = document.getElementById("phoneNumber").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (!firstName || !lastName || !phoneNumber || !email || !password) {
    Swal.fire({
      title: "შეავსე ყველა ველი",
      icon: "warning",
    });
    return;
  }

  if (password.length < 6) {
    Swal.fire({
      title: "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო",
      icon: "warning",
    });
    return;
  }

  const registerData = {
    phoneNumber,
    email,
    firstName,
    lastName,
    password,
    role,
  };

  // Loading
  Swal.fire({
    title: "რეგისტრაცია...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const response = await fetch(`${AUTH_API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registerData),
    });

    let data;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (response.ok) {
      Swal.fire({
        title: "რეგისტრაცია წარმატებულია!",
        text: "ახლა შეგიძლიათ შეხვიდეთ სისტემაში",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "login.html";
      });
    } else {
      Swal.close();
      const errorMsg = data.message || data.title || "რეგისტრაცია ვერ შესრულდა";
      showMessage(errorMsg, "error");
      Swal.fire("შეცდომა", errorMsg, "error");
    }
  } catch (error) {
    Swal.close();
    showMessage("შეცდომა: " + error.message, "error");
    console.error("Registration error:", error);
    Swal.fire("შეცდომა", error.message, "error");
  }
});

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `auth-message ${type}`;
}
