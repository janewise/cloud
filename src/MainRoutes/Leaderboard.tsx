import React, { useEffect, useState } from "react";
import { db } from "../firebase"; // Ensure the correct path to your firebase configuration
import { ref, get } from "firebase/database";
import "./Leaderboard.css"; // Assuming you'll have some styles for the leaderboard

interface User {
  name: string;
  autoIncrement: number;
  calculatedValue: number;
  inviteCount: number;
}

interface LeaderboardProps {
  userId: string | null;
}

export function Leaderboard({ userId }: LeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<User[]>([]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      const usersRef = ref(db, "users");
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const leaderboardArray = Object.entries(data).map(
          ([key, value]: [string, any]) => ({
            name: key,
            autoIncrement: value.autoIncrement || 0,
            calculatedValue: (value.autoIncrement || 0) * 3600,
            inviteCount: value.inviteCount || 0, // Add invite count
          })
        );

        leaderboardArray.sort((a, b) => b.inviteCount - a.inviteCount); // Sort by invite count in descending order
        setLeaderboardData(leaderboardArray.slice(0, 20)); // Limit to top 50
      }
    };

    fetchLeaderboardData();
  }, []);

  return (
    <div className="leaderboard">
      <h1>Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>PPH</th>
            <th>Invites</th> {/* Column for invite count */}
          </tr>
        </thead>
        <tbody>
          {leaderboardData.map((user, index) => (
            <tr key={index} className={user.name === userId ? "highlight" : ""}>
              <td>{index + 1}</td>
              <td>{user.name}</td>
              <td>{user.calculatedValue.toFixed(0)}</td>
              <td>{user.inviteCount}</td> {/* Display invite count */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
