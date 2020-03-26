// Create number formatter.
var formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

var LineItem = /** @class */ (function() {
  function LineItem(description, case_variance, cost_variance) {
    this.description = description;
    this.case_variance = case_variance;
    this.cost_variance = cost_variance;
  }
  LineItem.prototype.toString = function() {
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
function parseTextAreaData() {
  let raw_data = document.getElementById("textarea").value;
  let dataArray = raw_data.split("\n");

  let decreaseAdjustments = [];
  let increaseAdjustments = [];
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
      description,
      case_variance,
      cost_var_in_cents
    );
    if (isNegative) {
      decreaseAdjustments.push(newLineItem);
    } else if (cost_var_in_cents != 0) {
      increaseAdjustments.push(newLineItem);
    }
  }

  // Decrease Adjustments
  let decreaseString = "";
  decreaseAdjustments.sort((a, b) => b.cost_variance - a.cost_variance);

  let decrease_adj_total = 0;
  decreaseAdjustments.forEach(e => {
    decrease_adj_total += e.cost_variance;
    decreaseString += e.toString();
  });

  document.getElementById("decAdj").value = decreaseString.trim();

  document.getElementById("decAdjTotal").innerHTML =
    "Total Decrease: " + formatter.format(decrease_adj_total / 100);

  // Increase Adjustments
  let increaseString = "";
  increaseAdjustments.sort((a, b) => a.cost_variance - b.cost_variance);

  let increase_adj_total = 0;
  increaseAdjustments.forEach(e => {
    increase_adj_total += e.cost_variance;
    increaseString += e.toString();
  });

  document.getElementById("incAdj").value = increaseString.trim();
  console.log(increaseString);

  document.getElementById("incAdjTotal").innerHTML =
    "Total Increase: " + formatter.format(increase_adj_total / 100);

  document.getElementById("shrinkTotal").innerHTML =
    "Total Shrink: " +
    formatter.format((decrease_adj_total + increase_adj_total) / 100);

  let temp = document.createElement("textarea");
  temp.value = increase_adj_total / 100 + "\n" + decrease_adj_total / 100;
  document.body.append(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
}

function CopyDecAdj() {
  document.getElementById("decAdj").select();
  document.execCommand("copy");
}

function CopyIncAdj() {
  document.getElementById("incAdj").select();
  document.execCommand("copy");
}

function clearTextAreas() {
  let textAreas = document.getElementsByTagName("textarea");

  for (let ta of textAreas){
    ta.value = "";
  }
}
