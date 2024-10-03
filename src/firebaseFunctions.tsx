import { db } from "./firebase";
import { ref, set, update, get, DataSnapshot } from "firebase/database";

export const sendUserDataToFirebase = (
  userId: string,
  autoIncrement: number,
  initialInviteCount: number = 0
) => {
  if (!userId) return;

  const userRef = ref(db, "users/" + userId);
  get(userRef)
    .then((snapshot) => {
      if (!snapshot.exists()) {
        set(userRef, {
          autoIncrement: autoIncrement,
          timestamp: new Date().toISOString(),
          inviteCount: initialInviteCount, // Set initialInviteCount only if data doesn't exist
        });
      } else {
        console.log(
          `User data already exists for ${userId}. Skipping initialization.`
        );
      }
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    });
};

export const updateUserAutoIncrementInFirebase = (
  userId: string,
  autoIncrement: number
) => {
  if (!userId) return;

  update(ref(db, "users/" + userId), {
    autoIncrement: autoIncrement,
  });
};

export const updateUserInviteCountInFirebase = async (
  userId: string,
  inviteCount: number
) => {
  if (!userId) return;

  await update(ref(db, "users/" + userId), {
    inviteCount: inviteCount,
  });
};

export const initializeUserData = async (userId: string) => {
  const userRef = ref(db, "users/" + userId);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) {
    await set(userRef, {
      autoIncrement: 0,
      inviteCount: 0, // Initialize inviteCount to 0 when initializing user data
      timestamp: new Date().toISOString(),
    });
  }
};

export const handleNewUserWithReferral = async (
  newUserId: string,
  referrerId: string
) => {
  // Initialize new user data
  await initializeUserData(newUserId);

  // Increment referrer's invite count
  const referrerRef = ref(db, "users/" + referrerId);
  const snapshot = await get(referrerRef);
  if (snapshot.exists()) {
    const currentInviteCount = snapshot.val().inviteCount || 0;
    //alert(`Fb Current invite count for referrer ${referrerId}: ${currentInviteCount}`); // Log current invite count
    await updateUserInviteCountInFirebase(referrerId, currentInviteCount + 1);
  } else {
    // alert(`Fb No data found for referrer ${referrerId}`);
  }
};

export const getUserInviteCount = async (userId: string) => {
  const userRef = ref(db, "users/" + userId);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    const data = snapshot.val();
    //alert(`Fb Data fetched for user ${userId}: ${JSON.stringify(data)}`);  // Log the entire data
    return data.inviteCount || 0;
  } else {
    //alert(`Fb No data found for user ${userId}`);
  }
  // return 0;
};

//second for airtask
export const saveUserDataToFirebase = (userId: string, data: any) => {
  if (!userId) return;

  const userRef = ref(db, "users/" + userId);

  const structuredData = {
    balance: data.balance || 0,
    upgrades: {
      clickUpgrade: data.upgrades?.clickUpgrade || 0,
      autoClicker01: data.upgrades?.autoClicker01 || 0,
      autoClicker02: data.upgrades?.autoClicker02 || 0,
      autoClicker03: data.upgrades?.autoClicker03 || 0,
      autoClicker04: data.upgrades?.autoClicker04 || 0,
      autoClicker05: data.upgrades?.autoClicker05 || 0,
      autoClicker06: data.upgrades?.autoClicker06 || 0,
      autoClicker07: data.upgrades?.autoClicker07 || 0,
      autoClicker08: data.upgrades?.autoClicker08 || 0,
      autoClicker09: data.upgrades?.autoClicker09 || 0,
      autoClicker10: data.upgrades?.autoClicker10 || 0,
      refClicker01: data.upgrades?.refClicker01 || 0,
      refClicker02: data.upgrades?.refClicker02 || 0,
      refClicker03: data.upgrades?.refClicker03 || 0,
      refClicker04: data.upgrades?.refClicker04 || 0,
      refClicker05: data.upgrades?.refClicker05 || 0,
      refClicker06: data.upgrades?.refClicker06 || 0,
      refClicker07: data.upgrades?.refClicker07 || 0,
      refClicker08: data.upgrades?.refClicker08 || 0,
      refClicker09: data.upgrades?.refClicker09 || 0,
      refClicker10: data.upgrades?.refClicker10 || 0,
      refClicker11: data.upgrades?.refClicker11 || 0,
      refClicker12: data.upgrades?.refClicker12 || 0,
      refClicker13: data.upgrades?.refClicker13 || 0,
      refClicker14: data.upgrades?.refClicker14 || 0,
      //ads
      adsClicker01: data.upgrades?.adsClicker01 || 0,
      adsClicker02: data.upgrades?.adsClicker02 || 0,
      adsClicker03: data.upgrades?.adsClicker03 || 0,
      adsClicker04: data.upgrades?.adsClicker04 || 0,
      adsClicker05: data.upgrades?.adsClicker05 || 0,
      adsClicker06: data.upgrades?.adsClicker06 || 0,
      adsClicker07: data.upgrades?.adsClicker07 || 0,
      adsClicker08: data.upgrades?.adsClicker08 || 0,
    },
    lastUpdated: data.lastUpdated || new Date().getTime(),
  };

  update(userRef, structuredData).catch((error) => {
    console.error("Error saving user data:", error);
  });
};

//04 Function to send and update cumulative exchange amount
// Function to update the total exchange amount
export function sendExchangeAmountToFirebase(
  userId: string,
  exchangeAmount: number,
  tokens: number
) {
  if (!userId) return;

  const exchangeRef = ref(db, `users/${userId}/exchanges`);

  // Get the current exchange amount if it exists
  get(exchangeRef)
    .then((snapshot) => {
      let currentAmount = 0;
      let currentTokensAmount = 0;
      if (snapshot.exists()) {
        // If exchanges node exists, get the current total amount
        currentAmount = snapshot.val().amount || 0;
        currentTokensAmount = snapshot.val().tokens || 0;
      }

      // Update the exchange amount with the new value
      const newAmount = currentAmount + exchangeAmount;
      const newTokensAmount = currentTokensAmount + tokens;

      update(exchangeRef, {
        amount: newAmount,
        tokens: newTokensAmount,
        timestamp: new Date().toISOString(),
      })
        .then(() => {
          console.log("Exchange amount updated successfully.");
        })
        .catch((error) => {
          console.error("Error updating exchange amount:", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching exchange amount:", error);
    });
}

//for reduce autoincrement
export const getLatestExchangeAmount = async (
  userId: string
): Promise<number> => {
  try {
    const exchangeRef = ref(db, `users/${userId}/exchanges`);
    const snapshot = await get(exchangeRef);

    if (snapshot.exists()) {
      const exchangeData = snapshot.val();
      alert(`Snapshot exists. Data: ${JSON.stringify(exchangeData)}`);

      if (exchangeData && exchangeData.amount !== undefined) {
        const amount = exchangeData.amount;
        alert(`Successfully fetched exchange amount: ${amount}`);
        return amount;
      } else {
        alert("Exchange amount field not found, returning 0.");
        return 0;
      }
    } else {
      alert("No exchange data found, returning 0.");
      return 0; // Return 0 if no exchange data exists
    }
  } catch (error) {
    alert("Error fetching exchange amount: " + error);
    return 0; // Return 0 in case of error
  }
};


// Function to load user data from Firebase
export const loadUserDataFromFirebase = async (userId: string) => {
  if (!userId) return null;

  try {
    const userRef = ref(db, "users/" + userId);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      console.log(`Data fetched for user ${userId}:`, userData);
     // alert(`Data fetched for user ${userId}:`);
      return userData;
    } else {
      console.log(`No data found for user ${userId}.`);
      alert(`No data found for user ${userId}.`);
      return null;
    }
  } catch (error) {
    console.error("Error loading user data:", error);
    alert(`error loading user data ${userId}.`);
    return null;
  }
};