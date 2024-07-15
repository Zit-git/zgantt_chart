const commonDateFormat = "yyyy-MM-dd HH:MM";

async function getInitParameters() {
  var initparams = ZOHO.CREATOR.init().then((data) => {
    return ZOHO.CREATOR.UTIL.getInitParams();
  });
  return initparams;
}

async function getPageQueryParameters() {
  var queryParams = ZOHO.CREATOR.init().then(async (data) => {
    let qp = await ZOHO.CREATOR.UTIL.getQueryParams();
    return {
      appname: qp.appname,
      reportname: qp.reportname,
      fromtime: qp.fromtime,
      totime: qp.totime,
      title: qp.title,
      description: qp.description,
      timezone: qp.timezone,
      dateformat: qp.dateformat,
      criteria: qp.criteria,
    };
  });
  return queryParams;
}

async function getTaskDetails(page, pageSize) {
  try {
    var queryParams = await getPageQueryParameters();

    var config = {
      appName: queryParams.appname,
      reportName: queryParams.reportname,
      page: page || 1,
      pageSize: pageSize || 100,
    };

    var taskData = await ZOHO.CREATOR.API.getAllRecords(config).then(function (
      response
    ) {
      var recordArr = response.data;
      let taskList = [];
      var indexNumber = 0;
      for (var index in recordArr) {
        indexNumber = indexNumber + 1;
        let task = recordArr[index];
        let sNo = parseInt((page - 1) * 100 + indexNumber);
        taskList.push({
          sno: sNo,
          text: task[queryParams.title],
          start_date: new Date(task[queryParams.fromtime]).toString(
            commonDateFormat
          ),
          end_date: new Date(task[queryParams.totime]).toString(
            commonDateFormat
          ),
          id: sNo,
          creator_rec_id: task.ID,
        });
      }
      return taskList;
    });
  } catch (error) {
    return [];
  }
  return taskData;
}

async function getTaskDetailsByDateRange(page, pageSize, fromDate, toDate) {
  try {
    var queryParams = await getPageQueryParameters();
    let dateFormat = queryParams.dateformat;
    //
    var config = {
      appName: queryParams.appname,
      reportName: queryParams.reportname,
      page: page || 1,
      pageSize: pageSize || 100,
    };
    if ((fromDate != "", toDate != "")) {
      let fromDateformatted = new Date(fromDate).toString(dateFormat);
      let todateFormatted = new Date(toDate).toString(dateFormat);
      // criteriaString = `(${queryParams.fromtime})>='${fromDateformatted}'&&${queryParams.fromtime}<='${todateFormatted}')`;
      config.criteria =
        "(" +
        queryParams.fromtime +
        ">='" +
        fromDateformatted +
        "' && " +
        queryParams.fromtime +
        "<='" +
        todateFormatted +
        "')";

    }
    var taskData = await ZOHO.CREATOR.API.getAllRecords(config).then(function (
      response
    ) {
      var recordArr = response.data;
      let taskList = [];
      var indexNumber = 0;
      for (var index in recordArr) {
        indexNumber = indexNumber + 1;
        let task = recordArr[index];
        let sNo = parseInt((page - 1) * 100 + indexNumber);
        taskList.push({
          sno: sNo,
          text: task[queryParams.title],
          start_date: new Date(task[queryParams.fromtime]).toString(
            commonDateFormat
          ),
          end_date: new Date(task[queryParams.totime]).toString(
            commonDateFormat
          ),
          id: sNo,
          creator_rec_id: task.ID,
        });
      }
      return taskList;
    });
  } catch (error) {
    return [];
  }
  return taskData;
}

async function openEditForm(recordId) {
  var queryParams = await getPageQueryParameters();
  ZOHO.CREATOR.init().then(async (data) => {
    var param = {
      action: "open",
      url:
        "#Form:Add_Task?recLinkID=" +
        recordId +
        "&viewLinkName=" +
        queryParams.reportname +
        "&zc_LoadIn=dialog&zc_NextUrl=#Script:page.parent.refresh",
      window: "same",
    };
    ZOHO.CREATOR.UTIL.navigateParentURL(param);
  });
}
