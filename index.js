// for small answer short use it
//   text:
//   "Answer ONLY what the user asked. Keep it short, clear, and to the point. Do not give extra explanation.\n\nUser Question:\n" +
//   chatHistory[chatHistory.length - 1].content

// ---------------------------
// Configuration
// ---------------------------
const GEMINI_API_KEY = "AIzaSyBIJMcTMkOzeTKUmNIRNMfNCgMC9Hkw0O4"; // 🔴 PUT YOUR REAL KEY

// ---------------------------
// State
// ---------------------------
const chatHistory = [];

// ---------------------------
// DOM refs
// ---------------------------
const chatArea = document.getElementById("chatArea");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const statusEl = document.getElementById("status");

// ---------------------------
// UI Functions
// ---------------------------
function addMessageBubble(type, text) {
  const wrapper = document.createElement("div");
  const bubble = document.createElement("div");

  bubble.classList.add("px-4", "py-2", "rounded-2xl", "max-w-[75%]", "text-sm");

  bubble.style.whiteSpace = "pre-wrap";
  bubble.style.wordBreak = "break-word";
  bubble.innerText = text;

  if (type === "user") {
    wrapper.classList.add("flex", "justify-end");
    bubble.classList.add("bg-indigo-600", "text-white");
  } else {
    wrapper.classList.add("flex", "justify-start");
    bubble.classList.add(
      "bg-white/10",
      "border",
      "border-white/20",
      "text-gray-200",
      "backdrop-blur-lg",
    );
  }

  wrapper.appendChild(bubble);
  chatArea.appendChild(wrapper);
  scrollToBottom();
}

function showTypingIndicator(show = true) {
  const existing = document.getElementById("typing-indicator");
  if (existing) existing.remove();

  if (!show) return;

  const wrapper = document.createElement("div");
  wrapper.id = "typing-indicator";
  wrapper.classList.add("flex", "justify-start");

  const bubble = document.createElement("div");
  bubble.classList.add(
    "bg-white/10",
    "border",
    "border-white/20",
    "px-4",
    "py-2",
    "rounded-2xl",
    "text-sm",
    "text-gray-300",
  );

  bubble.innerText = "Typing...";
  wrapper.appendChild(bubble);
  chatArea.appendChild(wrapper);

  scrollToBottom();
}

function scrollToBottom() {
  chatArea.scrollTop = chatArea.scrollHeight;
}

function setStatus(text) {
  statusEl.innerText = text;
}

function setSendEnabled(enabled) {
  sendBtn.disabled = !enabled;
  sendBtn.classList.toggle("opacity-40", !enabled);
}

async function fetchAIResponse() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
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
                  text: `
You are a smart AI assistant.

Your job:
- Understand the user's question clearly
- Give accurate and helpful answers
- Keep responses clear, structured, and easy to read

Rules:
- Answer only what the user asked
- Keep answer concise but complete
- Use bullet points only when helpful
- Use simple language (easy to understand)
- Do not add unnecessary extra information
- If question is small → give short answer
- If question needs explanation → explain step-by-step
- If user asks coding → give clean and correct code
- If unsure → say "I’m not sure" instead of guessing

User Question:
${chatHistory[chatHistory.length - 1].content}
`,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();
    console.log("Gemini Response:", data);

    if (!response.ok) {
      throw new Error(data.error?.message || "API error");
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
  } catch (error) {
    console.error("ERROR:", error);
    return "⚠️ Error: Something went wrong.";
  }
}

// ---------------------------
// Send Message
// ---------------------------
async function sendMessage() {
  const text = messageInput.value.trim();

  if (!text) {
    setStatus("Type something...");
    return;
  }

  // Show user message
  addMessageBubble("user", text);
  chatHistory.push({ role: "user", content: text });

  messageInput.value = "";
  setSendEnabled(false);
  setStatus("Thinking...");

  showTypingIndicator(true);

  try {
    const aiResponse = await fetchAIResponse();

    showTypingIndicator(false);

    addMessageBubble("assistant", aiResponse);
    chatHistory.push({ role: "assistant", content: aiResponse });

    setStatus("Done ✅");
  } catch (error) {
    showTypingIndicator(false);
    addMessageBubble("assistant", "Something went wrong. Try again.");
    setStatus("Error ❌");
  } finally {
    setSendEnabled(messageInput.value.trim().length > 0);
  }
}

// ---------------------------
// Events
// ---------------------------
messageInput.addEventListener("input", () => {
  setSendEnabled(messageInput.value.trim().length > 0);
});

messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener("click", sendMessage);

// ---------------------------
// Init
// ---------------------------
// ---------------------------
// Init
// ---------------------------
messageInput.focus();
setSendEnabled(false);
setStatus("Ready");

// ✅ Add Welcome Message
window.addEventListener("load", () => {
  const welcomeMessage =
    "👋 Hi! I'm your AI assistant. How can I help you today?";

  addMessageBubble("assistant", welcomeMessage);

  chatHistory.push({
    role: "assistant",
    content: welcomeMessage,
  });
});
messageInput.focus();
setSendEnabled(false);
setStatus("Ready");
