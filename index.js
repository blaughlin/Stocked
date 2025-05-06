import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB_3nHkGT3ig0ICJlR5Dew1XtW4796Ih7k",
  authDomain: "stocked-13b5c.firebaseapp.com",
  projectId: "stocked-13b5c",
  storageBucket: "stocked-13b5c.firebasestorage.app",
  messagingSenderId: "662785189135",
  appId: "1:662785189135:web:a42269266978813effca7a",
  measurementId: "G-58XZ1JSY3W"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const pantryRef = collection(db, "pantry");


document.addEventListener("DOMContentLoaded", () => {
 
const logoutLink = document.getElementById("logoutLink");

if (logoutLink) {
  logoutLink.addEventListener("click", async (e) => {
    e.preventDefault(); // stop link from navigating immediately

    try {
      await signOut(auth); // Firebase logout
      window.location.href = "/login.html"; // redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed.");
    }
  });
}
  const pantryItem = document.getElementById("pantryItem");
  const addItemBtn = document.getElementById("addItemBtn");
async function addNewItem(name) {
  try {
    await addDoc(pantryRef, {
      item: name,
      amount: null,
      expiration: null,
      createdAt: serverTimestamp()
    });
    await loadPantryItems(); // Refresh list
  } catch (error) {
    console.error("Error adding item:", error);
    alert("Failed to add item.");
  }
}
  if (pantryItem && addItemBtn) {
    addItemBtn.addEventListener("click", () => {
      const name = pantryItem.value.trim();
      if (name) {
        addNewItem(name);
        pantryItem.value = "";
      }
    });

    loadPantryItems();
  }





  // ✅ Render pantry items
  async function loadPantryItems() {
    const querySnapshot = await getDocs(pantryRef);
    const pantryRows = document.getElementById("pantryRows");

    if (pantryRows) {;// 🚨 prevent null error
    pantryRows.innerHTML = "";
    }

    querySnapshot.forEach((docSnap) => {
      const item = docSnap.data();
      const id = docSnap.id;

      const row = document.createElement("div");
      row.className = "table-row";

      row.innerHTML = `
        <span class="col-item">${item.item}</span>
        <span class="col-amount">${item.amount || ""}</span>
        <span class="col-expiration">${item.expiration ? item.expiration.toDate().toLocaleDateString() : "—"}</span>
        <span class="actions">
            <button class="edit-btn">✏️</button>
            <button class="delete-btn">🗑️</button>
        </span>
      `;

      pantryRows.appendChild(row);

      // Attach listeners to the buttons INSIDE each row
    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

editBtn.addEventListener("click", () => {
  // Replace text with input fields
  const itemSpan = row.querySelector(".col-item");
  const amountSpan = row.querySelector(".col-amount");
  const expSpan = row.querySelector(".col-expiration");
  const actions = row.querySelector(".actions");

  const itemInput = document.createElement("input");
  itemInput.type = "text";
  itemInput.value = item.item;

  const amountInput = document.createElement("input");
  amountInput.type = "text";
  amountInput.value = item.amount || "";

  const expInput = document.createElement("input");
  expInput.type = "date";
  if (item.expiration) {
    const dateObj = item.expiration.toDate();
    expInput.value = dateObj.toISOString().split("T")[0]; // format YYYY-MM-DD
  }

  itemSpan.innerHTML = "";
  itemSpan.appendChild(itemInput);
  amountSpan.innerHTML = "";
  amountSpan.appendChild(amountInput);
  expSpan.innerHTML = "";
  expSpan.appendChild(expInput);

  // Replace Edit button with Save and Cancel
  actions.innerHTML = `
    <button class="save-btn">✅</button>
    <button class="cancel-btn">❌</button>
  `;

  const saveBtn = row.querySelector(".save-btn");
  const cancelBtn = row.querySelector(".cancel-btn");

  saveBtn.addEventListener("click", async () => {
    const newItem = itemInput.value.trim();
    const newAmount = amountInput.value.trim();
    const newExpiration = expInput.value ? new Date(expInput.value) : null;

    try {
      await updateDoc(doc(db, "pantry", id), {
        item: newItem,
        amount: newAmount || null,
        expiration: newExpiration || null
      });
      loadPantryItems(); // refresh
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to save changes.");
    }
  });

  cancelBtn.addEventListener("click", () => {
    loadPantryItems(); // revert to original
  });
});

    deleteBtn.addEventListener("click", async () => {
      if (confirm("Delete this item?")) {
        try {
          await deleteDoc(doc(db, "pantry", id));
          await loadPantryItems();
        } catch (error) {
          console.error("Delete error:", error);
          alert("Failed to delete item.");
        }
      }
    });
    });
  }
  const sortIcon = document.getElementById("sortIcon");
  if (sortIcon) {
    sortIcon.addEventListener("click", () => {
      const menu = document.getElementById("sortMenu");
      if (menu) menu.classList.toggle("hidden");
    });
  }

 
  function toggleSortMenu() {
  const menu = document.getElementById('sortMenu');
  menu.classList.toggle('hidden');
}

function sortTable(type) {
  console.log("Sorting by:", type);
  // You can implement sorting logic here
  toggleSortMenu(); // hide menu after selection
}



  // ✅ Initial load
  loadPantryItems();

});

