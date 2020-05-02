let vars = {
  decreaseAdjustments: [],
  increaseAdjustments: [],
  register_num: "",
  posting_date: "",
};
// Create number formatter.
var formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

var LineItem = /** @class */ (function () {
  function LineItem(register_num, description, case_variance, cost_variance) {
    this.register_num = register_num;
    this.description = description;
    this.case_variance = case_variance;
    this.cost_variance = cost_variance;
  }
  LineItem.prototype.toString = function () {
    var sign = this.case_variance > 0 ? "+" : "";
    return (
      this.description +
      "\n" +
      "   (" +
      sign +
      this.case_variance +
      ") " +
      formatter.format(this.cost_variance / 100) +
      "\n"
    );
  };
  return LineItem;
})();

/********************************
 * Parse the data provided in the variance data text area.
 ********************************/
function parseTextAreaData() {
  let raw_data = document.getElementById("textarea").value;
  let dataArray = raw_data.split("\n");

  vars.register_num = dataArray[2].split(" ")[2];
  vars.posting_date = dataArray[3];

  for (let i = 17; i < dataArray.length; i += 3) {
    let objLine1Cols = dataArray[i].split(" "); // 0: ItemNo, 1: Bin Loc

    if (objLine1Cols[0] === "I/M") {
      i += 18;
      continue;
    } else if (objLine1Cols[0] === "Warehouse") {
      break;
    }

    let description = dataArray[i + 1]; // 0: Description
    let objLine3Cols = dataArray[i + 2].split(" "); // 0: Case, 1: OH, 2: CNTD, 3: CASEVAR, 4: CASECOST, 5: TTLCOST

    let isNegative = objLine3Cols[5][objLine3Cols[5].length - 1] === "-";
    let cost_var_in_cents =
      objLine3Cols[5].replace(/,|\.|\-/g, "") * (isNegative ? 1 : -1);

    let isCaseVarNegative = objLine3Cols[3][objLine3Cols[3].length - 1] === "-";
    let case_variance = parseInt(objLine3Cols[3]) * (isNegative ? -1 : 1);

    let newLineItem = new LineItem(
      vars.register_num,
      description,
      case_variance,
      cost_var_in_cents
    );
    if (isNegative) {
      vars.decreaseAdjustments.push(newLineItem);
    } else if (cost_var_in_cents != 0) {
      vars.increaseAdjustments.push(newLineItem);
    }
  }

  vars.decreaseAdjustments.sort((a, b) => b.cost_variance - a.cost_variance);
  vars.increaseAdjustments.sort((a, b) => a.cost_variance - b.cost_variance);

  displayData();
}

/****************************
 * Display the variance data that was parsed
 ****************************/
function displayData() {
  /* Display Decrease Adjustments
   ************************/
  let decreaseString = "";

  let decrease_adj_total = 0;
  vars.decreaseAdjustments.forEach((e) => {
    decrease_adj_total += e.cost_variance;
    decreaseString += e.toString();
  });

  document.getElementById("decAdj").value = decreaseString.trim();

  document.getElementById("decAdjTotal").innerHTML =
    "Total Decrease: " + formatter.format(decrease_adj_total / 100);

  /* Display Increase Adjustments
   ************************/
  let increaseString = "";

  let increase_adj_total = 0;
  vars.increaseAdjustments.forEach((e) => {
    increase_adj_total += e.cost_variance;
    increaseString += e.toString();
  });

  document.getElementById("incAdj").value = increaseString.trim();
  console.log(increaseString);

  document.getElementById("incAdjTotal").innerHTML =
    "Total Increase: " + formatter.format(increase_adj_total / 100);

  /* Display Total Shrink
   ************************/
  document.getElementById("shrinkTotal").innerHTML =
    "Total Shrink: " +
    formatter.format((decrease_adj_total + increase_adj_total) / 100);

  /* Display Register Num and Posting Date
   ************************/
  document.getElementById("registerNum").innerHTML = 
    "Register Number: " + vars.register_num;

  document.getElementById("postingDate").innerHTML =
    "Posting Date: " + vars.posting_date;
}

/*****************************
 * Post the data to the database 
 *****************************/
function postData() {
  if (
    vars.decreaseAdjustments.length == 0 &&
    vars.increaseAdjustments.length == 0
  ) {
    window.alert("No data to post.");
  } else {
    window.alert("ToDo: Post the data to a database.");
    clearTextAreas();
  }
}

/*****************************
 * Clear the text areas and text of all labels
 *****************************/
function clearTextAreas() {
  /* Clear text areas */
  for (let ta of document.getElementsByTagName("textarea")) {
    ta.value = "";
  }

  /* Reset labels to default of $0.00*/
  for (let lbl of document.getElementsByTagName("h2")) {
    let colonIndex = lbl.innerHTML.indexOf(":");
    lbl.innerHTML = lbl.innerHTML.slice(0, colonIndex + 1) + " $0.00";
  }
  for (let lbl of document.getElementsByTagName("h3")) {
    let colonIndex = lbl.innerHTML.indexOf(":");
    lbl.innerHTML = lbl.innerHTML.slice(0, colonIndex + 1);
  }
}
