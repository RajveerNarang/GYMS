// import { db, ref, get, set, push, onValue } from "./firebaseConfig.js";

let currentSort = { key: "", asc: true };
let currentData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 5;
let currentUserRole = "";
let currentTrainerName = "";

let isEditing = false;
let editIndex = null;

function sortTable(key) {
  const keys = key.split(".");
  const getValue = (obj) => keys.reduce((val, k) => val?.[k], obj);

  if (currentSort.key === key) {
    currentSort.asc = !currentSort.asc;
  } else {
    currentSort = { key, asc: true };
  }

  filteredData.sort((a, b) => {
    const valA = getValue(a);
    const valB = getValue(b);

    if (typeof valA === "string") {
      return currentSort.asc
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
    if (valA instanceof Array) {
      return currentSort.asc
        ? valA.length - valB.length
        : valB.length - valA.length;
    }
    return currentSort.asc ? valA - valB : valB - valA;
  });

  currentPage = 1;
  displayTable();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}
window.toggleDarkMode = toggleDarkMode;

window.login = function () {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  const credentials = {
    receptionist: { username: "reception", password: "reception123" },
    manager: { username: "manager", password: "manager123" },
    trainer: { username: "vikram rana", password: "trainer123" },
  };

  if (
    credentials[role] &&
    user === credentials[role].username &&
    pass === credentials[role].password
  ) {
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ role, username: user })
    );
    currentUserRole = role;
    currentTrainerName = user;
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    if (role === "receptionist" || role === "manager") {
      document
        .getElementById("openAddCustomerModal")
        .classList.remove("hidden");
    } else {
      document.getElementById("openAddCustomerModal").classList.add("hidden");
    }

    fetchCustomers();
  } else {
    alert("Invalid username or password for " + role);
  }
};

window.logout = function () {
  localStorage.removeItem("loggedInUser");
  location.reload();
};

const openBtn = document.getElementById("openAddCustomerModal");
const closeBtn = document.getElementById("closeModal");
const modal = document.getElementById("addCustomerModal");

openBtn.addEventListener("click", () => {
  // Clear all input/select fields in the modal
  const modalInputs = modal.querySelectorAll("input, select");
  modalInputs.forEach((field) => {
    field.value = "";
  });

  // Show the modal
  modal.classList.remove("hidden");
});

closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

function fetchCustomers() {
  const customerRef = ref(db, "customers/");
  onValue(customerRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      currentData = Object.values(data);
      if (currentUserRole === "trainer") {
        filteredData = currentData.filter(
          (c) => c.trainer?.toLowerCase() === currentTrainerName.toLowerCase()
        );
      } else {
        filteredData = [...currentData];
      }

      currentPage = 1;
      displayTable();
    }
  });
}

document
  .getElementById("jsonFileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        currentData = data;

        if (currentUserRole === "trainer") {
          filteredData = currentData.filter(
            (c) => c.trainer?.toLowerCase() === currentTrainerName.toLowerCase()
          );
        } else {
          filteredData = [...currentData];
        }

        currentPage = 1;
        displayTable();
      } catch (error) {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  });

document.getElementById("searchInput").addEventListener("input", () => {
  const query = document.getElementById("searchInput").value.toLowerCase();
  filteredData = currentData.filter((customer) => {
    return (
      (customer.name && customer.name.toLowerCase().includes(query)) ||
      (customer.gender && customer.gender.toLowerCase().includes(query)) ||
      (customer.age && customer.age.toString().includes(query)) ||
      (customer.address && customer.address.toLowerCase().includes(query)) ||
      (customer.plan_type &&
        customer.plan_type.toLowerCase().includes(query)) ||
      (customer.subscription_type &&
        customer.subscription_type.toLowerCase().includes(query)) ||
      (customer.last_payment &&
        customer.last_payment.toLowerCase().includes(query)) ||
      (customer.phone?.personal &&
        customer.phone.personal.toLowerCase().includes(query)) ||
      (customer.phone?.emergency &&
        customer.phone.emergency.toLowerCase().includes(query)) ||
      (customer.equipment_borrowed &&
        customer.equipment_borrowed.join(", ").toLowerCase().includes(query)) ||
      (customer.trainer && customer.trainer.toLowerCase().includes(query))
    );
  });
  currentPage = 1;
  displayTable();
});

// function displayTable() {
//   const tbody = document.querySelector("#customerTable tbody");
//   tbody.innerHTML = "";

//   const start = (currentPage - 1) * rowsPerPage;
//   const end = start + rowsPerPage;
//   const pageData = filteredData.slice(start, end);

//   pageData.forEach((customer, index) => {
//     const row = document.createElement("tr");

//     if (currentUserRole === "manager") {
//       document.getElementById("tableActionsHeader")?.classList.remove("hidden");
//     } else {
//       document.getElementById("tableActionsHeader")?.classList.add("hidden");
//     }

//     let actions = "";
//     if (currentUserRole === "manager") {
//       actions = `
//         <td class="action-buttons">
//           <button class="edit-btn" onclick="editCustomer(${index})">Edit</button>
//           <button class="delete-btn" onclick="deleteCustomer(${index})">Delete</button>
//         </td>
//       `;
//     }

//     row.innerHTML = `
//       <td>${customer.name || ""}</td>
//       <td>${customer.gender || ""}</td>
//       <td>${customer.age || ""}</td>
//       <td>${customer.phone?.personal || ""}</td>
//       <td>${customer.phone?.emergency || ""}</td>
//       <td>${customer.address || ""}</td>
//       <td>${customer.plan_type || ""}</td>
//       <td>${customer.last_payment || ""}</td>
//       <td>${customer.subscription_type || ""}</td>
//       <td>${(customer.equipment_borrowed || []).join(", ")}</td>
//       <td>${customer.trainer || ""}</td>
//       ${actions}
//     `;

//     tbody.appendChild(row);
//   });

//   renderPagination();
// }

function displayTable() {
  const thead = document.querySelector("#customerTable thead tr");
  const tbody = document.querySelector("#customerTable tbody");

  // Clear existing header and body
  thead.innerHTML = "";
  tbody.innerHTML = "";

  const isTrainer = currentUserRole === "trainer";

  // Define column headers
  const allHeaders = [
    { label: "Name", key: "name" },
    { label: "Gender", key: "gender" },
    { label: "Age", key: "age" },
    { label: "Personal Phone", key: "phone.personal" },
    { label: "Emergency Phone", key: "phone.emergency" },
    { label: "Address", key: "address" },
    { label: "Plan Type", key: "plan_type" },
    { label: "Last Payment", key: "last_payment" },
    { label: "Subscription", key: "subscription_type" },
    { label: "Equipment Borrowed", key: "equipment_borrowed" },
    { label: "Trainer", key: "trainer" },
  ];

  const trainerHeaders = [
    "name",
    "gender",
    "phone.personal",
    "equipment_borrowed",
    "trainer",
  ];

  // Filter headers based on role
  const headersToUse = isTrainer
    ? allHeaders.filter((h) => trainerHeaders.includes(h.key))
    : allHeaders;

  // Build thead
  headersToUse.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h.label;
    th.setAttribute("onclick", `sortTable('${h.key}')`);
    thead.appendChild(th);
  });

  // If not trainer, show Actions column
  if (!isTrainer) {
    const th = document.createElement("th");
    th.id = "tableActionsHeader";
    th.textContent = "Actions";
    thead.appendChild(th);
  }

  // Display rows
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = filteredData.slice(start, end);

  pageData.forEach((customer, index) => {
    const row = document.createElement("tr");

    headersToUse.forEach((h) => {
      const td = document.createElement("td");
      const keys = h.key.split(".");
      let value = keys.reduce((obj, key) => obj?.[key], customer);

      if (Array.isArray(value)) {
        value = value.join(", ");
      }

      td.textContent = value || "";
      row.appendChild(td);
    });

    // Actions for manager only
    if (!isTrainer && currentUserRole === "manager") {
      const actionsTd = document.createElement("td");
      actionsTd.innerHTML = `
        <button class="edit-btn" onclick="editCustomer(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteCustomer(${index})">Delete</button>
      `;
      row.appendChild(actionsTd);
    }

    tbody.appendChild(row);
  });

  renderPagination();
}

function renderPagination() {
  const pagination = document.getElementById("paginationControls");
  pagination.innerHTML = "";
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.innerText = i;
    btn.classList.add("pagination-btn");
    if (i === currentPage) btn.style.opacity = 0.6;
    btn.addEventListener("click", () => {
      currentPage = i;
      displayTable();
    });
    pagination.appendChild(btn);
  }
}

window.addCustomer = function () {
  const name = document.getElementById("newName")?.value.trim();
  const age = document.getElementById("newAge")?.value.trim();
  const membership = document.getElementById("newMembership")?.value.trim();
  const gender = document.getElementById("newGender")?.value.trim();
  const personalPhone = document.getElementById("newPho")?.value.trim();
  const emergencyPhone = document.getElementById("newEpho")?.value.trim();
  const address = document.getElementById("newAddress")?.value.trim();
  const plan = document.getElementById("newPlan")?.value.trim();
  const lastPayment = document.getElementById("newLstPay")?.value.trim();
  const subscription = document.getElementById("newSubscription")?.value.trim();
  const epb = document.getElementById("newEpb")?.value.trim();
  const trn = document.getElementById("newTrainer")?.value.trim();

  if (
    !name ||
    !age ||
    !membership ||
    !gender ||
    !personalPhone ||
    !emergencyPhone ||
    !address ||
    !plan ||
    !lastPayment ||
    !subscription ||
    !epb ||
    !trn
  ) {
    alert("Please fill all fields");
    return;
  }

  const updatedCustomer = {
    name,
    age: parseInt(age),
    membership,
    gender,
    address,
    phone: {
      personal: personalPhone,
      emergency: emergencyPhone,
    },
    plan_type: plan,
    last_payment: lastPayment,
    subscription_type: subscription,
    equipment_borrowed: epb.split(",").map((e) => e.trim()),
    trainer: currentTrainerName,
  };

  if (isEditing && editIndex !== null) {
    const originalCustomer = filteredData[editIndex];
    const actualIndex = currentData.indexOf(originalCustomer);
    currentData[actualIndex] = updatedCustomer;
    alert("Customer updated successfully.");
  } else {
    currentData.push(updatedCustomer);
    alert("Customer added successfully.");
  }

  filteredData = [...currentData];
  currentPage = 1;
  displayTable();

  [
    "newName",
    "newAge",
    "newMembership",
    "newGender",
    "newAddress",
    "newPho",
    "newEpho",
    "newPlan",
    "newLstPay",
    "newSubscription",
    "newEpb",
    "newTrainer",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  isEditing = false;
  editIndex = null;
  document.getElementById("addCustomerModal").classList.add("hidden");
};

// Placeholder edit/delete functions
window.editCustomer = function (index) {
  const customer = filteredData[index];

  document.getElementById("newName").value = customer.name || "";
  document.getElementById("newAge").value = customer.age || "";
  document.getElementById("newMembership").value = customer.membership || "";
  document.getElementById("newGender").value = customer.gender || "";
  document.getElementById("newPho").value = customer.phone?.personal || "";
  document.getElementById("newEpho").value = customer.phone?.emergency || "";
  document.getElementById("newAddress").value = customer.address || "";
  document.getElementById("newPlan").value = customer.plan_type || "";
  document.getElementById("newLstPay").value = customer.last_payment || "";
  document.getElementById("newSubscription").value =
    customer.subscription_type || "";
  document.getElementById("newEpb").value = (
    customer.equipment_borrowed || []
  ).join(", ");
  document.getElementById("newTrainer").value = customer.trainer || "";

  isEditing = true;
  editIndex = index;

  document.getElementById("addCustomerModal").classList.remove("hidden");
};

window.deleteCustomer = function (index) {
  if (confirm("Are you sure you want to delete this customer?")) {
    const customerToDelete = filteredData[index];
    currentData = currentData.filter((c) => c !== customerToDelete);
    filteredData = [...currentData];
    displayTable();
    alert("Customer deleted.");
  }
};
