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
    this.modalSelectors = {
      closeBtn: document.getElementById("close-btn"),
      modalWindow: document.getElementById("modal"),
      modalBackdrop: document.getElementById("modal-backdrop"),
      userName: document.getElementById("additional-name"),
      modalTbody: document.getElementById("modal-tbody"),
    };
  }

  renderTable() {
    this.tableBody.innerHTML = "";
    this.users.forEach((user) => {
      this.tableBody.insertAdjacentHTML("afterbegin", this._template(user));
    });
    this.makeClickableRow();
  }

  columnsSorting(arr, criteria) {
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

  makeClickableRow() {
    [...this.rows].map((row) => {
      row.addEventListener("click", () => {
        this._rowClickHandler(row);
        this.renderTable(this.users);
        this.openModalWindow(this.modalSelectors);
      });
    });
  }

  _rowClickHandler = (row) => {
    this.selectedElement = row.dataset.id;
    let user = this.users.filter((user) => {
      if (this.selectedElement == user.id) {
        return user;
      }
    });
    this.user = user[0];
  };

  _template(user) {
    return `
        <tr class="userRow" data-id="${user.id}">
            <td data-id="name">${user.name}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.website}</td>
          </tr>
      `;
  }

  openModalWindow({ modalWindow, modalBackdrop }) {
    this.renderModalTemplate(this.user, this.modalSelectors);
    modalWindow.style.display = "block";
    modalBackdrop.style.display = "block";
  }
  renderModalTemplate(user, { modalTbody, userName }) {
    if (!user.name) {
      return;
    }
    userName.innerHTML = user.name;
    modalTbody.innerHTML = `
            <td>${user?.address?.street}</td>
            <td>${user?.address?.city}</td>
            <td>${user?.address?.zipcode}</td>
            <td>${user?.address?.suite}</td>
    `;
  }
}

let userView = new UserView();

class FormView extends UserView {
  constructor() {
    super(...arguments);
    this.formsValue = {};
    this.thead = document.getElementById("main-table-header");
    this.form = document.forms["addition-form"];
    this.inputElements = this.form.elements;
    this.submitBtn = document.getElementById("submit-btn");
  }

  _cleanForm() {
    this.formsValue = {};
    this.inputElements.name.value = "";
    this.inputElements.username.value = "";
    this.inputElements.email.value = "";
    this.inputElements.website.value = "";
    return;
  }

  addUser() {
    this.formsValue = {
      id: Math.floor(Math.random() * 100),
      name: this.inputElements.name.value,
      username: this.inputElements.username.value,
      email: this.inputElements.email.value,
      website: this.inputElements.website.value,
    };
    this.users = [...userView.users, this.formsValue];
    super.renderTable();
    this._cleanForm();
  }
}
const formView = new FormView();

class ModalView extends UserView {
  constructor() {
    super(...arguments);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initApp();
  async function initApp() {
    await userStore.init();
    userView.users = await userStore.users;
    userView.renderTable();
  }

  formView.form.addEventListener("click", (e) => {
    e.preventDefault();
  });
  formView.submitBtn.addEventListener("click", (e) => {
    e.preventDefault;
    formView.addUser();
  });
  [...formView.thead.children].forEach((th) =>
    th.addEventListener("click", (e) => {
      userView.users = userView.columnsSorting(userView.users, th.innerText);
      userView.renderTable();
    })
  );

  userView.modalSelectors.closeBtn.addEventListener("click", () => {
    userView.modalSelectors.modalWindow.style.display = "none";
    userView.modalSelectors.modalBackdrop.style.display = "none";
    userView.user = {};
  });
});

//helper
function isEmptyObj(obj) {
  for (let key in obj) {
    console.log(key);
    if (key) {
      return false;
    }
    return true;
  }
}
