// BUDGET CONTROLLER
var budgetController = (function () {
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalinc) {
    if (totalinc > 0) {
      this.percentage = Math.round((this.value / totalinc) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
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
    deleteItem: function (type, id) {
      var ids, index;

      ids = data.allItems[type].map(function (curr) {
        return curr.id;
      });

      index = ids.indexOf(id);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
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

    claculatePercentages: function () {
      data.allItems.exp.forEach(function (curr) {
        curr.calcPercentage(data.totals.inc);
      });
    },

    getPercentage: function () {
      var allPerc = data.allItems.exp.map(function (curr) {
        return curr.getPercentage();
      });
      return allPerc;
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
    container: ".container",
    expensePercLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };
  var formatNumber = function (num) {
    var int, dec;
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
    }

    dec = numSplit[1];

    return int + "." + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
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
        html = `<div class='item clearfix' id='inc-${
          obj.id
        }'><div class='item__description'>${obj.description}</div>
            <div class='right clearfix'>
              <div class='item__value'>+$${formatNumber(obj.value)}</div>
              <div class='item__delete'>
                <button class='item__delete--btn'>
                  <i class='ion-ios-close-outline'></i>
                </button>
              </div>
            </div>
          </div>`;
      } else if (type === "exp") {
        element = DOMstrings.expesnsesContainer;
        html = ` <div class="item clearfix" id="exp-${obj.id}">
        <div class="item__description">${obj.description}</div>
        <div class="right clearfix">
            <div class="item__value">-$${formatNumber(obj.value)}</div>
            <div class="item__percentage">21%</div>
            <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
            </div>
        </div></div>`;
      }

      // Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", html);
    },
    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
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
      if (obj.budget > 0) {
        document.querySelector(DOMstrings.budgetLabel).textContent =
          "+" + formatNumber(obj.budget);
      } else if (obj.budget < 0) {
        document.querySelector(DOMstrings.budgetLabel).textContent =
          "-" + formatNumber(obj.budget);
      } else {
        document.querySelector(
          DOMstrings.budgetLabel
        ).textContent = formatNumber(obj.budget);
      }

      document.querySelector(DOMstrings.incomeLAbel).textContent =
        "+" + formatNumber(obj.totalInc);
      document.querySelector(DOMstrings.expenseLabel).textContent =
        "-" + formatNumber(obj.totalExp);
      if (obj.percent > 0) {
        document.querySelector(DOMstrings.percerntLabel).textContent =
          obj.percent + "%";
      } else {
        document.querySelector(DOMstrings.percerntLabel).textContent = "--";
      }
    },
    displayPercentage: function (percentage) {
      var fields = document.querySelectorAll(DOMstrings.expensePercLabel);

      nodeListForEach(fields, function (curr, index) {
        if (percentage[index] > 0) {
          curr.textContent = percentage[index] + "%";
        } else {
          curr.textContent = "--";
        }
      });
    },
    displayMOnth: function () {
      var now = new Date();
      year = now.getFullYear();
      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      month = now.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent =
        months[month] + " " + year;
    },
    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputdesc +
          "," +
          DOMstrings.inputval
      );
      nodeListForEach(fields, function (curr) {
        curr.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.inputbtn).classList.toggle("red");
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

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UiController.changedType);
  };

  var updateBudget = function () {
    // 1. calculate the budget
    budgetCtrl.claculateBudget();
    //2.return the budget
    var budget = budgetCtrl.getBudget();

    //3. display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    //1. Claculate percentages
    budgetController.claculatePercentages();

    //2. Read percentages from the budget controller
    var percentages = budgetController.getPercentage();
    //3 Update the UI with the new percentages
    UICtrl.displayPercentage(percentages);
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
      //6.calculate and upate the percent
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function (e) {
    var itemID, splitID, type, ID;
    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      //income-1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //delete the item from data structure
      budgetController.deleteItem(type, ID);
      //delete the item from ui
      UiController.deleteListItem(itemID);
      //update and show new budget
      updateBudget();
      //6.update the percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("Application has started.");
      UICtrl.displayMOnth();
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
