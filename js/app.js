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
  }

  renderList(users) {
    let newUsers = this.compare(users, "name", "desc");
    console.log(newUsers);
    this.users = newUsers;

    this.tableBody.innerHTML = "";
    this.users.forEach((user) => {
      this.tableBody.insertAdjacentHTML("afterbegin", this.template(user));
    });
    this.makeClickableRow();
    this.openModal(this.modalSelectors);
    this.modalTemplate(this.modalSelectors);
  }

  compare(arr, criteria, desc) {
    let newArr = arr.sort((a, b) => {
      if (!desc) {
        if (a[criteria] > b[criteria]) {
          return -1;
        }
        if (a[criteria] < b[criteria]) {
          return 1;
        }
        return 0;
      } else {
        if (a[criteria] < b[criteria]) {
          return -1;
        }
        if (a[criteria] > b[criteria]) {
          return 1;
        }
        return 0;
      }
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
    this.user = this.selectedElement && this.users[this.selectedElement - 1];
    this.selectedElement = row.dataset.id;
    this.modal = true;
    this.renderList(this.users);
  };

  modalTemplate({ closeBtn }) {
    closeBtn.addEventListener("click", () => {
      this.modal = false;
      this.renderList(this.users);
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
    userView.renderList(users);
  }
});
