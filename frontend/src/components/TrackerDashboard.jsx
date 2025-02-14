import { useState, useEffect } from "react";
import API_BASE_URL from "../config";

const TrackerDashboard = () => {
  const [trackers, setTrackers] = useState([]);

  const fetchTrackers = () => {
    fetch(`${API_BASE_URL}/tracker`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setTrackers(data))
      .catch((err) => console.error("Error fetching trackers:", err));
  };

  useEffect(() => {
    fetchTrackers();
  }, []);

  return (
    <div>
      <h2>Sent Emails Tracker</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Recipient</th>
            <th>Subject</th>
            <th>Status</th>
            <th>Seen At</th>
          </tr>
        </thead>
        <tbody>
          {trackers.map((tracker) => (
            <tr key={tracker.id}>
              <td>{tracker.id}</td>
              <td>{tracker.recipient}</td>
              <td>{tracker.subject}</td>
              <td>{tracker.status}</td>
              <td>
                {tracker.seenAt
                  ? new Date(tracker.seenAt).toLocaleString()
                  : "Not seen"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={fetchTrackers}>Refresh</button>
    </div>
  );
};

export default TrackerDashboard;
