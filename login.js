const AUTH_API = "https://rentcar.stepprojects.ge/api/Users";
const TOKEN_KEY = "authToken";
const USER_KEY = "currentUser";

const loginForm = document.getElementById("login-form");
const messageDiv = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const phoneNumber = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!phoneNumber || !password) {
    Swal.fire("შეცდომა", "შეავსეთ ყველა ველი", "warning");
    return;
  }

  // Loading
  Swal.fire({
    title: "შესვლა...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    const response = await fetch(`${AUTH_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, password }),
    });

    if (response.ok) {
      // login-ის რესპონსი შეიძლება ტექსტი იყოს (token) ან JSON
      let userData;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        userData = await response.json();
      } else {
        const text = await response.text();
        // token ან სხვა ტექსტური პასუხი
        userData = { token: text, phoneNumber };
      }

      // შევინახოთ token და user info
      localStorage.setItem(TOKEN_KEY, userData.token || phoneNumber);

      // მომხმარებლის ინფო - თუ სერვერმა არ დააბრუნა, მოვითხოვოთ
      let userInfo = {
        phoneNumber: userData.phoneNumber || phoneNumber,
        email: userData.email || "",
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        role: userData.role || "User",
      };

      // თუ firstName ცარიელია, ვცადოთ GET /api/Users/{phoneNumber}
      if (!userInfo.firstName) {
        try {
          const userRes = await fetch(`${AUTH_API}/${phoneNumber}`);
          if (userRes.ok) {
            const fullUser = await userRes.json();
            userInfo.firstName = fullUser.firstName || "";
            userInfo.lastName = fullUser.lastName || "";
            userInfo.email = fullUser.email || "";
            userInfo.role = fullUser.role || "User";
          }
        } catch (e) {
          // ignore - use what we have
        }
      }

      localStorage.setItem(USER_KEY, JSON.stringify(userInfo));

      Swal.fire({
        title: "წარმატებით შეხვედით!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      Swal.close();
      let errorMsg = "ტელეფონის ნომერი ან პაროლი არასწორია";
      try {
        const errData = await response.json();
        errorMsg = errData.message || errData.title || errorMsg;
      } catch (e) {
        // use default message
      }
      showMessage(errorMsg, "error");
      Swal.fire("შეცდომა", errorMsg, "error");
    }
  } catch (error) {
    Swal.close();
    showMessage("შეცდომა: " + error.message, "error");
    console.error("Login error:", error);
  }
});

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `auth-message ${type}`;
}
