class ApiService {
  async userList() {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users"
      );
      const data = await response.json();
      return data;
    } catch (err) {
      console.log(err);
      return Promise.reject(err);
    }
  }
}
const api = new ApiService();

class UserController {
  constructor(api) {
    this.api = api;
    this.users = null;
  }
  async init() {
    const response = await this.api.userList();
    this.users = response;
    return response;
  }
  getUsers() {
    return this.users;
  }
}
const userStore = new UserController(api);

class UserView {
  constructor() {
    this.tableBody = document.getElementById("tbody");
    this.rows = document.getElementsByClassName("userRow");
    this.selectedElement = null;
    this.users = [];
    this.user = {};
    this.modal = false;
    this.modalSelectors = {
      closeBtn: document.getElementById("close-btn"),
      modalWindow: document.getElementById("modal"),
      modalBackdrop: document.getElementById("modal-backdrop"),
      userName: document.getElementById("additional-name"),
      modalTbody: document.getElementById("modal-tbody"),
    };
    this.formsValue = {};
  }

  renderTable(users) {
    this.users = users;
    this.tableBody.innerHTML = "";
    this.users.forEach((user) => {
      this.tableBody.insertAdjacentHTML("afterbegin", this.template(user));
    });
    this.makeClickableRow();
    this.openModal(this.modalSelectors);
    this.modalTemplate(this.modalSelectors);
    this.addNewUser();
    this.sortingTable();
  }

  renderNewTable() {
    this.tableBody.innerHTML = "";
    this.users.forEach((user) => {
      this.tableBody.insertAdjacentHTML("afterbegin", this.template(user));
    });
  }

  addNewUser() {
    let forms = document.forms["addition-form"];
    let btn = forms.elements[4];

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      [...forms.elements].forEach((i) => {
        if (i.value) {
          this.formsValue = {
            ...this.formsValue,
            [i.name]: i.value,
          };
        }
      });
      this.users = [...this.users, this.formsValue];
      this.renderTable(this.users);
      this.formsValue = {};
    });
  }

  sortingTable() {
    const thead = document.getElementById("main-table-header");
    // console.log(thead.children);
    [...thead.children].forEach((th) =>
      th.addEventListener("click", () => {
        this.tableBody.innerHTML = "";
        this.renderTable(this.compare(this.users, th.innerText));
      })
    );
  }

  compare(arr, criteria) {
    let newArr = arr.sort((a, b) => {
      if (a[criteria.toLowerCase()] > b[criteria.toLowerCase()]) {
        return -1;
      }
      if (a[criteria.toLowerCase()] < b[criteria.toLowerCase()]) {
        return 1;
      }
      return 0;
    });
    return newArr;
  }

  openModal({ modalWindow, modalBackdrop }) {
    if (this.modal) {
      this.renderModalTemplate(this.user, this.modalSelectors);
      modalWindow.style.display = "block";
      modalBackdrop.style.display = "block";
    } else {
      modalWindow.style.display = "none";
      modalBackdrop.style.display = "none";
    }
  }
  renderModalTemplate(user, { modalTbody, userName }) {
    if (!user) {
      return;
    }
    userName.innerHTML = user.name;
    modalTbody.innerHTML = `
            <td>${user.address.street}</td>
            <td>${user.address.city}</td>
            <td>${user.address.zipcode}</td>
            <td>${user.address.suite}</td>
    `;
  }

  makeClickableRow() {
    [...this.rows].map((row) => {
      row.addEventListener("click", () => {
        this.rowClickHandler(row);
      });
    });
  }
  rowClickHandler = (row) => {
    this.selectedElement = row.dataset.id;
    this.user = this.selectedElement && this.users[this.selectedElement - 1];
    this.modal = true;
    this.renderTable(this.users);
  };

  modalTemplate({ closeBtn }) {
    closeBtn.addEventListener("click", () => {
      this.modal = false;
      this.renderTable(this.users);
    });
  }

  template(user) {
    return `
        <tr class="userRow" data-id="${user.id}">
            <td data-id="name">${user.name}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.website}</td>
          </tr>
      `;
  }
}

let userView = new UserView();

document.addEventListener("DOMContentLoaded", () => {
  initApp();
  async function initApp() {
    await userStore.init();
    let users = await userStore.users;
    userView.renderTable(users);
  }
});
