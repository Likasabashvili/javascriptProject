const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendBtn");
const apiKeyInput = document.getElementById("apiKey");

// სასტუმროს ჩათბოტის სიस্ტემური პრომპტი
const HOTEL_SYSTEM_PROMPT = `თქვენ ხართ ლოიალური და გამყოფი სასტუმროს კონსიერჟი.
თქვენი მიზანია დაეხმაროთ ს მხოლოდ სასტუმროს გამოცდილებასთან დაკავშირებულ კითხვებში.
 
ის რაზე შეგიძლიათ დაეხმაროთ:
- ოთახების ხელმისაწვდომობა და დაჯავშნა
- ფასები და განსაკუთრებული შეთავაზებები
- სასტუმროს მოწყობილობები (აუზი, ჯიმი, რესტორანი, Wi-Fi)
- ჩეკ-ინ/ჩეკ-აუტ დროსთან დაკავშირებული ინფორმაცია
- გარშემო მდებარე ღირსშესანიშნაობები და ატრაქციები
- ტრიალ და ტრანსპორტი
- სხვა სასტუმროსთან დაკავშირებული კითხვები
 
როდესაც მომხმარებელი ჩამოთვლილი თემებიდან სხვაზე კითხულობს, უთხარით რომ:
"მე მხოლოდ სასტუმროსთან დაკავშირებულ კითხვებში დავეხმარე. აგრეთვე დამწერიეთ მოთხოვნა, რომელიც სასტუმროსთან დაკავშირებულია 😊"`;

async function sendMessage() {
  const apiKey = apiKeyInput.value.trim();
  const message = userInput.value.trim();

  if (!apiKey) {
    showError("ჯერ ჩასვი API KEY");
    return;
  }
  if (!message) {
    showError("შეიყვანე ტექსტი");
    return;
  }
  //მომხმარებლის მესიჯის ჩვენება

  addMessage(message, "user");
  userInput.value = "";
  sendButton.disabled = true;

  //typing indicator

  const typing = showTyping();

  try {
    const MODEL = "gemini-2.5-flash";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  HOTEL_SYSTEM_PROMPT + "\n\nმომხმარებლის შეკითხვა: " + message,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    typing.remove();

    if (!response.ok) {
      const errorMsg = data.error?.message || "მოხდა შეცდომა";
      showError(errorMsg);
      return;
    } else {
      const botReply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "მოხდა შეცდომა პასუხის მიღებისას";
      addMessage(botReply, "bot");
    }
  } catch (error) {
    typing.remove();
    showError("მოხდა შეცდომა: " + error.message);
  }
  sendButton.disabled = false;
  userInput.focus();
}

//დამხმარე ფუნქციები

function addMessage(text, type) {
  const welcome = chatMessages.querySelector(".welcome");
  if (welcome) {
    welcome.remove();
  }

  const div = document.createElement("div");
  div.className = `message ${type}`;

  if (type === "bot") {
    div.innerHTML = `<div class="label">🤖 სასტუმრო</div>${formatText(text)}`;
  } else {
    div.textContent = text;
  }

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

//შეცდომის ჩვენება

function showError(text) {
  const div = document.createElement("div");
  div.className = "message error";
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

//typing

function showTyping() {
  const div = document.createElement("div");
  div.className = "message bot";
  div.innerHTML = `
<div class="label">
🤖 Gemini </div>
<div class="typing-indicator">
<span></span>
<span></span>
<span></span>
</div>
`;

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return div;
}

function formatText(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}
