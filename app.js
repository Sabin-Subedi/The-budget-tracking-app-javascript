// BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };
  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (curr, index, arr) {
      sum += curr.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem;
      //Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item based on inc adn exp type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }
      //Push it into our data structure
      data.allItems[type].push(newItem);
      // Return the new element
      return newItem;
    },
    claculateBudget: function () {
      // calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      //calculate the budget: income -expenses
      data.budget = data.totals.inc - data.totals.exp;
      //calculate the precentage of income that we spend

      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percent: data.percentage,
      };
    },
  };
})();

// UI CONTROLLER
var UiController = (function () {
  var DOMstrings = {
    inputType: ".add__type",
    inputdesc: ".add__description",
    inputval: ".add__value",
    inputbtn: ".add__btn",
    incomeContainer: ".income__list",
    expesnsesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLAbel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percerntLabel: ".budget__expenses--percentage",
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        desc: document.querySelector(DOMstrings.inputdesc).value,
        value: parseFloat(document.querySelector(DOMstrings.inputval).value),
      };
    },
    addListItem: function (obj, type) {
      var html, element;
      //Create a HTML string with some placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html = `<div class='item clearfix' id='income-${obj.id}'><div class='item__description'>${obj.description}</div>
            <div class='right clearfix'>
              <div class='item__value'>${obj.value}</div>
              <div class='item__delete'>
                <button class='item__delete--btn'>
                  <i class='ion-ios-close-outline'></i>
                </button>
              </div>
            </div>
          </div>`;
      } else if (type === "exp") {
        element = DOMstrings.expesnsesContainer;
        html = ` <div class="item clearfix" id="expense-${obj.id}">
        <div class="item__description">${obj.description}</div>
        <div class="right clearfix">
            <div class="item__value">${obj.value}</div>
            <div class="item__percentage">21%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
        </div></div>`;
      }

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", html);
    },

    clearFields: function () {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMstrings.inputdesc + "," + DOMstrings.inputval
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (cur, index, array) {
        cur.value = "";
      });
      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {
      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLAbel).textContent = obj.totalInc;
      document.querySelector(DOMstrings.expenseLabel).textContent =
        obj.totalExp;
      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percerntLabel).textContent =
          obj.percentage;
      } else {
        document.querySelector(DOMstrings.percerntLabel).textContent = "--";
      }
    },
    getDOMstrings: function () {
      return DOMstrings;
    },
  };
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
  var setupEventListener = function () {
    var DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputbtn).addEventListener("click", crtlAddItem);

    document.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        crtlAddItem();
      }
    });
  };

  var updateBudget = function () {
    // 1. calculate the budget
    budgetCtrl.claculateBudget();
    //2.return the budget
    var budget = budgetCtrl.getBudget();

    //3. display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var crtlAddItem = function () {
    var input, newItem;
    //1. Get filled input data
    input = UICtrl.getInput();

    if (input.desc !== "" && !isNaN(input.value) && input.value > 0) {
      //2. add the item to the budget controller
      newItem = budgetController.addItem(input.type, input.desc, input.value);
      //3. Add the new item to ui interface
      UICtrl.addListItem(newItem, input.type);
      // Clear the Fields
      UICtrl.clearFields();

      // 5. Calculate and update budget
      updateBudget();
    }
  };

  return {
    init: function () {
      console.log("Application has started.");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percent: -1,
      });
      setupEventListener();
    },
  };
})(budgetController, UiController);

controller.init();
