// import React, { useState, useEffect } from "react";
// import { getDatabase, ref, onValue, get } from "firebase/database";
// import "./taskcard.css";

// interface TaskProps {
//   name: string;
//   reward: number;
//   show: string;
//   refcount:number;
//   userId:string | null;
//   balanceRef: React.MutableRefObject<{ value: number }>;
//   onRewardClaimed: () => void;
// }

// const TaskCard: React.FC<TaskProps> = ({
//   name,
//   reward,
//   show,
//   userId,
//   balanceRef,
//   onRewardClaimed,
// }) => {
//   const [taskState, setTaskState] = useState<
//     "go" | "check" | "countdown" | "claim" | "done"
//   >("go");
//   const [countdown, setCountdown] = useState(20);
//   const [initialLoad, setInitialLoad] = useState(true); // Flag for initial load
//   const [inviteCount, setInviteCount] = useState<number>(0);
//   useEffect(() => {
//     // Load the saved state from localStorage
//     const savedState = localStorage.getItem(`taskState-${name}`);
//     console.log(`Loaded task state for ${name}:`, savedState); // Debugging log
//     if (savedState === "done") {
//       setTaskState("done");
//     } else {
//       setTaskState("go");
//     }
//     setInitialLoad(false); // Set initial load flag to false after loading
//   }, [name]);

//   useEffect(() => {
//     if (!initialLoad) {
//       // Save the state to localStorage whenever it changes, only if it is 'done'
//       if (taskState === "done") {
//         console.log(`Saving task state for ${name}:`, taskState); // Debugging log
//         localStorage.setItem(`taskState-${name}`, taskState);
//       } else {
//         // If the state is not 'done', remove it from localStorage
//         localStorage.removeItem(`taskState-${name}`);
//       }
//     }
//   }, [taskState, name, initialLoad]);

//   useEffect(() => {
//     let timer: NodeJS.Timeout;
//     if (taskState === "countdown" && countdown > 0) {
//       timer = setTimeout(() => setCountdown(countdown - 1), 1000);
//     } else if (taskState === "countdown" && countdown === 0) {
//       setTaskState("claim");
//     }
//     return () => clearTimeout(timer);
//   }, [taskState, countdown]);

//   const handleGoClick = () => {
//     //window.open(link, "_blank"); // Updated to use 'link' prop
//     setTaskState("go");
//     setTimeout(() => {
//       setTaskState("check");
//     }, 4000); // 4 seconds delay before changing to 'check' state
//   };

//   const handleCheckClick = () => {
//     setTaskState("countdown");
//   };

//   const handleClaimClick = () => {
//     balanceRef.current.value += reward;
//     onRewardClaimed();
//     setTaskState("done");
//   };

//   const renderButton = () => {
//     switch (taskState) {
//       case "go":
//         return (
//           <button className="taskgo" onClick={handleGoClick}>
//             Go
//           </button>
//         );
//       case "check":
//         return (
//           <button className="taskcheck" onClick={handleCheckClick}>
//             Check
//           </button>
//         );
//       case "countdown":
//         return (
//           <button className="taskcount" disabled>
//             {countdown}s
//           </button>
//         );
//       case "claim":
//         return (
//           <button className="taskclaim" onClick={handleClaimClick}>
//             Claim
//           </button>
//         );
//       case "done":
//         return (
//           <button className="taskdone" disabled>
//             ✔️
//           </button>
//         );
//       default:
//         return null;
//     }
//   };

//   useEffect(() => {
//     const db = getDatabase();
//     const userRef = ref(db, `users/${userId}/inviteCount`);

//     const unsubscribe = onValue(
//       userRef,
//       (snapshot) => {
//         const count = snapshot.val();
//         console.log(`Fetched invite count for user ${userId}: ${count}`);
//         setInviteCount(count);
//       },
//       (error) => {
//         console.error("Failed to fetch invite count:", error);
//       }
//     );

//     // Cleanup listener on component unmount
//     return () => {
//       unsubscribe();
//     };
//   }, [userId]);

//   return (
//     <div className="task-box">
//       <span className="taskspan">
//         <p className="taskp">
//           <span>
//             {name} ({show}Coin)
//           </span>
//           <span>{renderButton()}</span>
//         </p>
//       </span>
//     </div>
//   );
// };

// export default TaskCard;
import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import "./taskcard.css";

interface RefTaskCardProps {
  name: string;
  reward: number;
  show: string;
  refercount: number; // Add this line
  userId: string | null;
  balanceRef: React.MutableRefObject<{ value: number }>;
  onRewardClaimed: () => void;
}

const RefTaskCard: React.FC<RefTaskCardProps> = ({
  name,
  reward,
  show,
  refercount,
  userId,
  balanceRef,
  onRewardClaimed,
}) => {
  const [taskState, setTaskState] = useState<
    "go" | "check" | "countdown" | "claim" | "done"
  >("go");
  const [countdown, setCountdown] = useState(20);
  const [initialLoad, setInitialLoad] = useState(true);
  const [inviteCount, setInviteCount] = useState<number>(0);

  useEffect(() => {
    const savedState = localStorage.getItem(`taskState-${name}`);
    if (savedState === "done") {
      setTaskState("done");
    } else {
      setTaskState("go");
    }
    setInitialLoad(false);
  }, [name]);

  useEffect(() => {
    if (!initialLoad) {
      if (taskState === "done") {
        localStorage.setItem(`taskState-${name}`, taskState);
      } else {
        localStorage.removeItem(`taskState-${name}`);
      }
    }
  }, [taskState, name, initialLoad]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (taskState === "countdown" && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (taskState === "countdown" && countdown === 0) {
      if (inviteCount >= refercount) {
        setTaskState("claim");
      } else {
        setTaskState("go");
      }
    }
    return () => clearTimeout(timer);
  }, [taskState, countdown, inviteCount, refercount]);

  const handleGoClick = () => {
    setTaskState("go");
    setTimeout(() => {
      setTaskState("check");
    }, 4000);
  };

  const handleCheckClick = () => {
    setTaskState("countdown");
  };

  const handleClaimClick = () => {
    balanceRef.current.value += reward;
    onRewardClaimed();
    setTaskState("done");
  };

  const renderButton = () => {
    switch (taskState) {
      case "go":
        return (
          <button className="taskgo" onClick={handleGoClick}>
            Go
          </button>
        );
      case "check":
        return (
          <button className="taskcheck" onClick={handleCheckClick}>
            Check
          </button>
        );
      case "countdown":
        return (
          <button className="taskcount" disabled>
            {countdown}s
          </button>
        );
      case "claim":
        return (
          <button className="taskclaim" onClick={handleClaimClick}>
            Claim
          </button>
        );
      case "done":
        return (
          <button className="taskdone" disabled>
            ✔️
          </button>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const db = getDatabase();
    const userRef = ref(db, `users/${userId}/inviteCount`);

    const unsubscribe = onValue(
      userRef,
      (snapshot) => {
        const count = snapshot.val();
        setInviteCount(count);
      },
      (error) => {
        console.error("Failed to fetch invite count:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return (
    <div className="task-box">
      <span className="taskspan">
        <p className="taskp">
          <span>
            {name} ({show})
          </span>
          <span>{renderButton()}</span>
        </p>
      </span>
    </div>
  );
};

export default RefTaskCard;
