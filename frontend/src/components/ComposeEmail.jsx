import { useState } from "react";
import API_BASE_URL from "../config";

const ComposeEmail = () => {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  const handleCompose = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/compose`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient, subject, body }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setMessage("Error: " + data.error);
        } else {
          setMessage("Email sent successfully!");
          setRecipient("");
          setSubject("");
          setBody("");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        setMessage("Error sending email");
      });
  };

  return (
    <div>
      <h1>Compose Email</h1>
      {message && <p style={{ color: "red" }}>{message}</p>}
      <form onSubmit={handleCompose}>
        <div>
          <label>Recipient: </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Subject: </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Body: </label>
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <button type="submit">Send Email</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ComposeEmail;
