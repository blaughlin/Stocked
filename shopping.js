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
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const shoppingRef = collection(db, "shopping");


document.addEventListener("DOMContentLoaded", () => {
  const shoppingItem = document.getElementById("shoppingItem");
  const addToShoppingBtn = document.getElementById("addToShoppingBtn");

  if (shoppingItem && addToShoppingBtn) {
    addToShoppingBtn.addEventListener("click", () => {
      const name = shoppingItem.value.trim();
      if (name) {
        addToShoppingList(name);
        shoppingItem.value = "";
      }
    });

    loadShoppingList();
  }

  async function loadShoppingList() {
    const shoppingRows = document.getElementById("shoppingRows");
    if (!shoppingRows) return; // 🚨 prevent null error
  
    const querySnapshot = await getDocs(shoppingRef);
    shoppingRows.innerHTML = "";
  
    querySnapshot.forEach((docSnap) => {
      const item = docSnap.data();
      const id = docSnap.id;
  
      const row = document.createElement("div");
      row.className = "shopping-table-row";
  
      row.innerHTML = `
        <span class="shopping-col-item">${item.item}</span>
        <span class="shopping-col-amount">${item.amount || ""}</span>
        <span class="shopping-actions">
          <button class="shopping-edit-btn">✏️</button>
          <button class="shopping-delete-btn">🗑️</button>
        </span>
      `;
  
      shoppingRows.appendChild(row);
            // Attach listeners to the buttons INSIDE each row
      const editBtn = row.querySelector(".shopping-edit-btn");
      const deleteBtn = row.querySelector(".shopping-delete-btn");

      editBtn.addEventListener("click", () => {
        // Replace text with input fields
        const itemSpan = row.querySelector(".shopping-col-item");
        const amountSpan = row.querySelector(".shopping-col-amount");
        const actions = row.querySelector(".shopping-actions");
      
        const itemInput = document.createElement("input");
        itemInput.type = "text";
        itemInput.value = item.item;
      
        const amountInput = document.createElement("input");
        amountInput.type = "text";
        amountInput.value = item.amount || "";
      
      
        itemSpan.innerHTML = "";
        itemSpan.appendChild(itemInput);
        amountSpan.innerHTML = "";
        amountSpan.appendChild(amountInput);
      
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
      
          try {
            await updateDoc(doc(db, "shopping", id), {
              item: newItem,
              amount: newAmount || null,
            });
            loadShoppingList(); // refresh
          } catch (err) {
            console.error("Update error:", err);
            alert("Failed to save changes.");
          }
        });
      
        cancelBtn.addEventListener("click", () => {
          loadShoppingList(); // revert to original
        });
      });

    deleteBtn.addEventListener("click", async () => {
      if (confirm("Delete this item?")) {
        try {
          await deleteDoc(doc(db, "shopping", id));
          await loadShoppingList();
        } catch (error) {
          console.error("Delete error:", error);
          alert("Failed to delete item.");
        }
      }
    });
      
    });
    
  }

   async function addToShoppingList(itemName) {
  try {
    await addDoc(shoppingRef, {
      item: itemName.trim(),
      amount: null,
      createdAt: serverTimestamp()
    });
    await loadShoppingList();
  } catch (error) {
    console.error("Error adding to shopping list:", error);
    alert("Could not add item to shopping list.");
  }
}

  loadShoppingList();

}); 