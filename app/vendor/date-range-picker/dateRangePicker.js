const datePicketCommonFormat = "YYYY-MMM-DD";
var lastSelectedSDate, lastSelectedEDate;

var clearFilter = false;

$(function () {
  var start = moment().subtract(29, "days");
  var end = moment();

  function cb(start, end) {
    $("#date-range-picker span").html(
      start.format(datePicketCommonFormat) +
        " - " +
        end.format(datePicketCommonFormat)
    );
  }

  function cbEmpty() {
    $("#date-range-picker span").html("Select Date Range");
    clearFilter = true;
  }

  $("#date-range-picker").daterangepicker(
    {
      ranges: {
        Today: [moment(), moment()],
        Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
        "Last 7 Days": [moment().subtract(6, "days"), moment()],
        "Last 30 Days": [moment().subtract(29, "days"), moment()],
        "This Month": [moment().startOf("month"), moment().endOf("month")],
        "Last Month": [
          moment().subtract(1, "month").startOf("month"),
          moment().subtract(1, "month").endOf("month"),
        ],
      },
      locale: { cancelLabel: "Clear" },
      autoUpdateInput: false,
    },
    cb
  );

  // cb(start, end);
  cbEmpty();

  $("#date-range-picker").on(
    "apply.daterangepicker",
    async function (ev, picker) {
      clearFilter = false;
      if (
        lastSelectedSDate == picker.startDate &&
        lastSelectedEDate == picker.endDate
      )
        return;
      // function call to main.js
      await filterGantDate(picker.startDate, picker.endDate);
      $("#date-range-picker span").html("Select Date Range");
      cb(picker.startDate, picker.endDate);
      //
      lastSelectedSDate = picker.startDate;
      lastSelectedEDate = picker.endDate;
    }
  );

  $("#date-range-picker").on(
    "cancel.daterangepicker",
    async function (ev, picker) {
      cbEmpty();
      clearFilter = true;
      // function call to main.js
      await loadGanttData();
      //
    }
  );
});

function getSelectedPickerDates() {
  let datePicker = $("#date-range-picker").data("daterangepicker");
  return clearFilter
    ? { startDate: "", endDate: "" }
    : {
        startDate: new Date(datePicker.startDate),
        endDate: new Date(datePicker.endDate),
      };
}
