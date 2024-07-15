var isEvent = false;
var scrollY;
var page = 1;
const recPerPage = 200;
const recPerPageOnScroll = 100;
const dateFormat = "dd-MM-yyyy";
const ganttTargetElem = "gantt_canvas";

window.onload = async (event) => {
  gantt.config.date_format = "%Y.%m.%d %H:%i";
  gantt.config.date_grid = "%Y.%m.%d %H:%i";
  // gantt configs
  gantt.config.columns = ganttColumns;
  gantt.config.drag_links = false;
  gantt.config.drag_progress = false;
  gantt.config.drag_move = false;
  gantt.config.drag_resize = false;
  gantt.config.sort = true;
  gantt.config.show_progress = false;
  gantt.config.highlight_critical_path = false;
  gantt.config.show_tasks_outside_timescale = true;
  gantt.config.start_on_monday = false;
  gantt.config.skip_off_time = true;
  gantt.config.details_on_dblclick = true;
  gantt.config.preserve_scroll = false;
  gantt.config.fit_tasks = true;
  gantt.config.autofit = true;
  gantt.config.grid_elastic_columns = true;

  // empty state
  gantt.config.show_empty_state = true;
  gantt.ext.emptyStateElement.renderContent = function (container) {
    const placeholderTextElement = `<div class="gantt_empty_state_text">
    <div class="gantt_empty_state_text_description">No records found!</div>
    </div>`;

    const placeholderContainer = `<div class="gantt_empty_state">${placeholderTextElement}</div>`;
    container.innerHTML = placeholderContainer;
  };

  // lightbox
  gantt.showLightbox = async function (id) {
    await openEditForm(gantt.getTask(id).creator_rec_id);
  };
  // plugins
  gantt.plugins({
    tooltip: true,
    quick_info: true,
    marker: true,
    grouping: true,
  });

  gantt.config.layout = {
    css: "gantt_container",
    rows: [
      {
        cols: [
          {
            view: "grid",
            scrollX: "scrollHor",
            scrollY: "scrollVer",
          },
          { resizer: true, width: 1 },
          {
            view: "timeline",
            scrollX: "scrollHor",
            scrollY: "scrollVer",
          },
          {
            view: "scrollbar",
            id: "scrollVer",
          },
        ],
      },
      {
        view: "scrollbar",
        id: "scrollHor",
      },
    ],
  };

  ganttScales();
  setZoom("Weeks");

  gantt.templates.scale_cell_class = function (date) {
    if (date.getDay() === 0 || date.getDay() === 6) {
      return "weekend";
    }
  };
  gantt.templates.timeline_cell_class = function (item, date) {
    if (date.getDay() === 0 || date.getDay() === 6) {
      return "weekend";
    }
  };
  //

  gantt.attachEvent("onGanttScroll", async (left, top) => {
    const visible_tasks = gantt.getVisibleTaskCount();
    const last_visible_task = gantt.getTaskByIndex(visible_tasks - 1);
    if (gantt.getTaskRowNode(last_visible_task.id)) {
      if (!isEvent) {
        isEvent = true;
        let getPickerDates = getSelectedPickerDates();
        let getTasks = await getTaskDetailsByDateRange(
          page,
          recPerPageOnScroll,
          getPickerDates.startDate,
          getPickerDates.endDate
        );
        if (getTasks.length) {
          setTimeout(async () => {
            //
            page = page + 1;
            gantt.parse({ data: getTasks });
            gantt.scrollTo(0, scrollY);
            gantt.render();
            isEvent = false;
          }, 500);
        }
      }
    }
  });

  gantt.attachEvent("onGanttRender", () => {
    scrollY = gantt.getScrollState().y;
  });
  //
  gantt.config.quickinfo_buttons = ["icon_edit"];
  showMarker();
  //
  gantt.init(ganttTargetElem);
  gantt.parse({
    data: await getTaskDetails(1, 200),
  });
  //
};

var showGridd = false;
function controllGrid() {
  gantt.config.show_grid = showGridd;
  showGridd = !showGridd;
  gantt.init(ganttTargetElem);
}

function ganttScales() {
  gantt.ext.zoom.init({
    levels: [
      {
        name: "Days",
        scale_height: 60,
        min_column_width: 30,
        scales: [
          { unit: "day", step: 1, format: "%d %M %Y" },
          { unit: "hour", step: 1, format: "%H" },
        ],
      },
      {
        name: "Weeks",
        scale_height: 60,
        min_column_width: 70,
        scales: [
          {
            unit: "week",
            step: 1,
            format: (date) => {
              let dateToStr = gantt.date.date_to_str("%d %M");
              let weekToStr = gantt.date.date_to_str("%w");
              let monthYearToStr = gantt.date.date_to_str("%Y");
              //
              let firstOfWeek = moment(date).startOf("week").toDate();
              let lastOfWeek = moment(date).endOf("week").toDate();
              return `${dateToStr(firstOfWeek)} - ${dateToStr(
                lastOfWeek
              )}, ${monthYearToStr(firstOfWeek)} (W${weekToStr(firstOfWeek)})`;
            },
          },
          { unit: "day", step: 1, format: "%d" },
        ],
        radius: 50,
      },
      {
        name: "Months",
        scale_height: 60,
        min_column_width: 70,
        scales: [
          { unit: "month", step: 1, format: "%M `%Y" },
          { unit: "week", step: 1, format: "%d" },
        ],
      },
      {
        name: "Years",
        scale_height: 60,
        min_column_width: 70,
        scales: [
          { unit: "year", step: 1, format: "%Y" },
          { unit: "month", step: 1, format: "%M" },
        ],
      },
    ],
  });
}

function setZoom(value) {
  gantt.ext.zoom.setLevel(value);
}

async function filterGantDate(fromDate, toDate) {
  gantt.config.start_date = new Date(fromDate);
  gantt.config.end_date = new Date(toDate);
  //
  page = 1;
  let getTasks = await getTaskDetailsByDateRange(
    page,
    recPerPage,
    fromDate,
    toDate
  );
  gantt.clearAll();
  showMarker();
  gantt.parse({ data: getTasks });
  gantt.render();
}

async function loadGanttData() {
  page = 1;
  let getTasks = await getTaskDetails(page, recPerPage);
  gantt.clearAll();
  showMarker();
  gantt.parse({ data: getTasks });
  gantt.render();
}

function showMarker() {
  // marker
  var dateToStr = gantt.date.date_to_str(gantt.config.task_date);
  gantt.addMarker({
    start_date: new Date(),
    css: "today",
    text: "Today",
    title: "Today: " + dateToStr(new Date()),
  });
}
