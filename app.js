// import { db, ref, get, set, push, onValue } from "./firebaseConfig.js";

let currentSort = { key: "", asc: true };
let currentData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 5;
let currentUserRole = "";
let currentTrainerName = "";

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

    if (role === "receptionist" || "manager") {
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

window.addEventListener("DOMContentLoaded", () => {
  const session = JSON.parse(localStorage.getItem("loggedInUser"));
  if (session) {
    currentUserRole = session.role;
    currentTrainerName = session.username;
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    if (currentUserRole === "receptionist") {
      document
        .getElementById("openAddCustomerModal")
        .classList.remove("hidden");
    } else {
      document.getElementById("openAddCustomerModal").classList.add("hidden");
    }

    fetchCustomers();
  }
});

window.logout = function () {
  localStorage.removeItem("loggedInUser");
  location.reload();
};

const openBtn = document.getElementById("openAddCustomerModal");
const closeBtn = document.getElementById("closeModal");
const modal = document.getElementById("addCustomerModal");

openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
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

function displayTable() {
  const tbody = document.querySelector("#customerTable tbody");
  tbody.innerHTML = "";

  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const pageData = filteredData.slice(start, end);

  pageData.forEach((customer, index) => {
    const row = document.createElement("tr");

    let actions = "";
    if (currentUserRole === "manager") {
      actions = `
        <td class="action-buttons">
          <button class="edit-btn" onclick="editCustomer(${index})">Edit</button>
          <button class="delete-btn" onclick="deleteCustomer(${index})">Delete</button>
        </td>
      `;
    }

    row.innerHTML = `
      <td>${customer.name || ""}</td>
      <td>${customer.gender || ""}</td>
      <td>${customer.age || ""}</td>
      <td>${customer.phone?.personal || ""}</td>
      <td>${customer.phone?.emergency || ""}</td>
      <td>${customer.address || ""}</td>
      <td>${customer.plan_type || ""}</td>
      <td>${customer.last_payment || ""}</td>
      <td>${customer.subscription_type || ""}</td>
      <td>${(customer.equipment_borrowed || []).join(", ")}</td>
      <td>${customer.trainer || ""}</td>
      ${actions}
    `;

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
    !epb
  ) {
    alert("Please fill all fields");
    return;
  }

  const newCustomer = {
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

  currentData.push(newCustomer);
  filteredData = [...currentData];
  currentPage = 1;
  displayTable();

  const fieldsToClear = [
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
  ];
  fieldsToClear.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document.getElementById("addCustomerModal").classList.add("hidden");
  alert("Customer added successfully.");
};

// Placeholder edit/delete functions
window.editCustomer = function (index) {
  alert(`Edit function not yet implemented. Row index: ${index}`);
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
