(function(window, coke){
  // Polyfill
  if (typeof Object.assign !== 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
      value: function assign(target, varArgs){ // .length of function is 2
        'use strict';
        if (target === null || target === undefined) {
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource !== null && nextSource !== undefined) {
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true
    });
  }

  coke.snapshot = function(obj){
    if (obj == null || typeof(obj) != 'object') {
      return obj;
    }

    var temp = new obj.constructor();

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        temp[key] = coke.snapshot(obj[key]);
      }
    }

    return temp;
  }

  if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(search, this_len){
      if (this_len === undefined || this_len > this.length) {
        this_len = this.length;
      }
      return this.substring(this_len - search.length, this_len) === search;
    };
  }
  coke.date = coke.date || {};

  Date.prototype.beginOfYear = function(){
    return new Date(this.getFullYear(), 0, 1);
  }

  function calcYear(date, num){
    var copiedDate = new Date(date.getTime());
    copiedDate.setFullYear(copiedDate.getFullYear() + num);
    return copiedDate;
  }

  function calcMonth(date, num){
    var copiedDate = new Date(date.getTime());
    copiedDate.setMonth(copiedDate.getMonth() + num);
    return copiedDate;
  }

  function calcDay(date, num){
    var copiedDate = new Date(date.getTime());
    copiedDate.setDate(copiedDate.getDate() + num);
    return copiedDate;
  }

  function calcHour(date, num){
    var copiedDate = new Date(date.getTime());
    copiedDate.setHours(copiedDate.getHours() + num);
    return copiedDate;
  }
  var calcMap = {
    h: calcHour,
    hours: calcHour,
    d: calcDay,
    days: calcDay,
    m: calcMonth,
    months: calcMonth,
    y: calcYear,
    years: calcYear
  };

  Date.prototype.add = function(num, unit){
    if (typeof num !== "number") {
      num = parseInt(num);
    }
    var date = this;
    var calc = calcMap[unit];
    return calc(date, num);
  }

  coke.renderDataGridError = function(arg, errorColor){
    var entity = arg.data;
    var column = arg.column;
    var property = column.get("property");
    errorColor = errorColor || "#FFE1E2";
    var messages = entity.getMessages(property);
    if (messages) {
      var error = false;
      messages.each(function(msg){
        if (msg.state == "error") {
          error = true;
        }
      });
    }

    qdom = $fly(arg.dom);
    entity.originalBackgroundColor = entity.originalBackgroundColor || qdom.css("background-color");
    var finalColor = arg.finalColor || entity.originalBackgroundColor;
    if (error) {
      arg.finalColor = errorColor;
      qdom.css("background-color", errorColor);
    } else {
      qdom.css("background-color", finalColor);
    }
    arg.processDefault = true;
  }

  var buttonCss = {
    primary: {
      "color": "#007bff",
      "background-color": "transparent",
      "background-image": "none",
      "border-color": "#007bff"
    },
    info: {
      "color": "#17a2b8",
      "background-color": "transparent",
      "background-image": "none",
      "border-color": "#17a2b8"
    },
    warning: {
      "color": "#ffc107",
      "background-color": "transparent",
      "background-image": "none",
      "border-color": "#ffc107"
    },
    danger: {
      "color": "#dc3545",
      "border-color": "#dc3545",
      "background-color": "transparent",
      "background-image": "none"
    }
  };
  coke.buttonCss = function(button, type){
    var componentDom = $fly(button.getDom());
    componentDom.css(buttonCss[type]);
  };

  coke.roundNum = function(num, digits){
    if (!num) {
      num = 0;
    }
    return Number(num.toFixed(digits));
  }

  coke.round2 = function(num){
    return coke.roundNum(num, 2);
  }

  coke.smartExecute = function(action, parameter, executeCallback, cacheCallback){
    var strParameter = dorado.JSON.stringify(parameter);
    if (action.strParameter != strParameter) {
      action.strParameter = strParameter;
      action.set("parameter", parameter);
      if (jQuery.isFunction(executeCallback)) {
        executeCallback();
      } else {
        if (action instanceof dorado.widget.DataSet) {
          action.flushAsync();
        } else if (action instanceof dorad.widget.Action) {
          action.execute();
        }
      }
    } else {
      if (jQuery.isFunction(cacheCallback)) {
        cacheCallback();
      }
    }
  }

  coke.travelEntity = function(data, callback){
    if (data instanceof dorado.Entity) {
      doTravelEntity(data, callback);
    } else if (data instanceof dorado.EntityList) {
      data.each(function(entity){
        doTravelEntity(entity, callback);
      });
    }
  }
  function doTravelEntity(entity, callback){
    callback(entity);
    var data = entity.toJSON();
    for (var p in data) {
      coke.travelEntity(entity.get(p), callback);
    }
  }
  function isFunction(functionToCheck){
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
  }


  function travelEntityByObject(entity, data, callback){
    if (isFunction(callback)) {
      callback(entity, data);
    }


    for (var p in data) {
      if (p[0] == "$") {
        continue;
      }
      var value = data[p];
      var entityValue = entity.get(p);
      if (Array.isArray(value)) {
        if (entityValue instanceof dorado.EntityList) {
          var i = 0;
          entityValue.each(function(entity){
            travelEntityByObject(entity, value[i++], callback);
          });
        } else {
          console.error("should be entityList");
        }
      } else if (typeof value == "object" && value !== null && !(value instanceof Date)) {
        // inserted object is object not null,Date, Array
        if (entityValue instanceof dorado.Entity) {
          travelEntityByObject(entityValue, value, callback);
        } else if (entityValue instanceof dorado.EntityList) {
          entityValue.each(function(entity){
            travelEntityByObject(entity, value, callback);
          });
        }
      }
    }
  }
  coke.travelEntityByObject = function(entityOrList, data, callback){
    if (entityOrList instanceof dorado.Entity) {
      travelEntityByObject(entityOrList, data, callback);
    } else if (entityOrList instanceof dorado.EntityList) {
      entityOrList.each(function(entity){
        travelEntityByObject(entity, data, callback);
      });
    }
  }

  coke.insertItem = function(dataSet, dataPath, dialog, data){
    data = data || {};
    var list = dataSet.getData(dataPath);
    if (list === undefined) {
      list = dataSet.getData();
      if (list === undefined) {
        dataSet.setData(dataPath, {});
        list = dataSet.getData(dataPath);
      }
    }
    var entity;
    if (list) {
      var origData = dorado.Core.clone(data, true)
      entity = list.insert(data);
      // 设置对象所有子对象状态为new
      // deepSetState(entity, dorado.Entity.STATE_NEW);
      travelEntityByObject(entity, origData, function(entity){
        entity.setState(dorado.Entity.STATE_NEW);
      });
      if (dialog) {
        dialog.show();
      }
      return entity;
    } else {
      dorado.MessageBox.alert('不能添加数据。');
    }
  }
  coke.insertChildItem = function(dataTree, childrenName, dialog, insertDataFunc){
    childrenName = childrenName || "children";

    var currentEntity = dataTree.get("currentEntity");
    if (currentEntity) {
      dataTree.get("currentNode").expand();
      // newEntity = currentEntity.createChild(childrenName, data);
      newEntity = currentEntity.get(childrenName).insert();
      dataTree.set("currentEntity", newEntity);
      setTimeout(function(){
        if (jQuery.isFunction(insertDataFunc)) {
          newEntity.set(insertDataFunc(newEntity));
        }
        dataTree.set("currentEntity", newEntity);
      }, 200);
      if (dialog) {
        dialog.show();
      }
    }
  }

  coke.insertBrotherItem = function(dataTree, childrenName, dialog, insertDataFunc){
    childrenName = childrenName || "children";

    var currentEntity = dataTree.get("currentEntity");
    if (currentEntity) {
      newEntity = currentEntity.createBrother();
      dataTree.set("currentEntity", newEntity);
      if (jQuery.isFunction(insertDataFunc)) {
        newEntity.set(insertDataFunc(newEntity));
      }

      if (dialog) {
        dialog.show();
      }
    } else {
      dataTree.get("dataSet").getData(dataTree.get("dataPath")).insert();
    }
  }

  coke.isItemEditable = function(buttonEdit){
    return !buttonEdit || !buttonEdit.get("disabled");
  }

  /*
   * 创建并下载文件 @param {String} fileName 文件名 @param {String} content 文件内容
   */
  coke.createAndDownloadFile = function(filename, text){
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  coke.downloadFile = function(url){
    var iframeId = "iframeDownloadFile";
    var iframe = document.getElementById(iframeId);
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.style.display = "none";
      iframe.id = iframeId;
      document.body.appendChild(iframe);
    }
    iframe.src = url;
  }

  coke.editItem = function(dataSet, dataPath, dialog, buttonEdit){
    if (coke.isItemEditable(buttonEdit)) {
      var entity = dataSet.getData(dataPath);
      if (entity) {
        dialog && dialog.show();
      } else {
        dorado.widget.NotifyTipManager.notify("没有可编辑的记录!");
      }
    }
  }

  coke.maskUpload = function(uploadAction, msg){
    if (!uploadAction) {
      return;
    }
    uploadAction.bind("onError", function(self, arg){
      dorado.util.TaskIndicator.hideTaskIndicator(self.taskId);
    });
    uploadAction.bind("beforeFileUpload", function(self, arg){
      self.taskId = dorado.util.TaskIndicator.showTaskIndicator(msg || "上传中...", "main");
    });

    uploadAction.bind("onFileUploaded", function(self, arg){
      dorado.util.TaskIndicator.hideTaskIndicator(self.taskId);
    });
  }

  var dateSetReadOnly = false;
  coke.viewItem = function(dataSet, dataPath, dialog){
    dateSetReadOnly = dataSet.get("readOnly");
    dataSet.set("readOnly", true);
    var entity = dataSet.getData(dataPath);
    if (entity) {
      dialog.show();
    } else {
      dorado.widget.NotifyTipManager.notify("没有可查看的记录!");
    }
  }

  coke.deleteEntity = function(entity, cascadeDelete){
    if (cascadeDelete && entity.dataType instanceof dorado.EntityDataType) {
      var propertyDefs = entity.dataType.get("propertyDefs");

      propertyDefs.each(function(propertyDef){
        if (propertyDef instanceof dorado.Reference) {
          var name = propertyDef.get("name");
          var subEntity = entity.get(name);
          if (subEntity instanceof dorado.Entity) {
            coke.deleteEntity(subEntity, cascadeDelete);
          } else if (subEntity instanceof dorado.EntityList) {
            subEntity.each(function(item){
              coke.deleteEntity(item, cascadeDelete);
            });
          }
        }
      });

    }
    entity.remove();
  }

  /*
   * coke.deleteItem(dataSet, dataPath, updateAction, callBack);
   */
  coke.deleteItem = function(dataSet, dataPath, updateAction, callBack, config){
    var entity = dataSet.getData(dataPath);
    if (entity) {
      dorado.MessageBox.confirm("确认要删除选中的记录么？", {
        icon: "WARNING",
        title: "删除记录",
        callback: function(){
          coke.deleteEntity(entity, config.cascadeDelete);
          updateAction.execute(callBack);
        }
      });
    } else {
      dorado.widget.NotifyTipManager.notify('没有可删除的记录。');
    }
  }
  /*
   * coke.deleteItems(dataGrid, updateAction, config);
   */
  coke.deleteItems = function(dataGrid, updateAction, config){
    if (!dataGrid || !updateAction) {
      console.log("无法删除。dataGrid %o, updateAction %o.", dataGrid, updateAction);
      return;
    }

    if (!config) {
      config = {};
    }

    var selection = coke.getSelections(dataGrid);

    var names = [];
    var error = "";
    selection.each(function(item){
      if (jQuery.isFunction(config.beforeDel)) {
        var result = config.beforeDel(item);
        if (result) {
          error += (result || "");
        }
      }
      if (config.display) {
        names.push(item.get(config.display))
      }
    });

    if (error) {
      if (jQuery.isFunction(config.error)) {
        config.error(names, error);
      } else {
        dorado.MessageBox.alert(error);
      }
      return;
    }

    var content = "确认要删除选中的记录。";
    if (names.length) {
      content = "确认要删除选中的记录: \n\t" + names.join(",") + " 。";
    }
    dorado.MessageBox.confirm(content, {
      icon: "WARNING",
      title: "删除记录",
      callback: function(){
        var needSave = false;
        selection.each(function(item){
          coke.deleteEntity(item, config.cascadeDelete);
          needSave = needSave || item.state !== 1
        });
        if (needSave) {
          if (jQuery.isFunction(config.updateAction)) {
            config.updateAction();
          } else if (updateAction) {
            updateAction.execute(function(){
              if (jQuery.isFunction(config.afterDel)) {
                config.afterDel()
              }
            });
          } else {
            console.log("未定义删除动作。");
          }
        }
      }
    });
  }

  coke.saveItem = function(dataSet, dataPath, updateAction, dialog, callback){
    var hasUpdateData = updateAction.get("hasUpdateData");
    if (hasUpdateData) {
      coke.validateDataSetLength(dataSet, dataPath);
      updateAction.execute(function(result){
        if (dialog) {
          if (jQuery.isFunction(dialog.$confirm)) {
            dialog.$confirm();
            dialog.$confirm = null;
          }
          dialog.hide();
        }
        if (callback instanceof Function) {
          callback(dataSet.getData(dataPath));
        }
      });
    } else if (hasUpdateData === false) {
      dialog && dialog.hide();
      if (callback instanceof Function) {
        callback();
      }
    }
  }

  coke.cancelItem = function(dataSet, dataPath, dialog, callback){
    var entity = dataSet.getData(dataPath);
    if (entity && entity.isCascadeDirty()) {
      dorado.MessageBox.confirm("确认放弃当前修改？", {
        title: "关闭编辑窗口",
        callback: function(){
          entity.cancel(true);
          if (dialog) {
            if (jQuery.isFunction(dialog.$cancel)) {
              dialog.$cancel();
              dialog.$cancel = null;
            }
            dialog.hide();
          }
          if (typeof callback === "function") {
            callback();
          }
        }
      });
    } else {
      if (dialog) {
        if (jQuery.isFunction(dialog.$cancel)) {
          dialog.$cancel();
          dialog.$cancel = null;
        }
        dialog.hide();
      }
      if (typeof callback === "function") {
        callback();
      }
    }
  }

  coke.formatParameter = function(parameter){
    if (!parameter) {
      return parameter;
    }
    var newParam = {};
    for (var k in parameter) {
      var value = parameter[k];
      if (value && value != 0) {
        var date = new Date();
        var number = parseInt(value);
        if (k.endsWith("Since")) {
          date.setDate(date.getDate() - number);
          k = k.substring(0, k.length - 5);
          newParam[k] = date;
        } else if (k.endsWith("Within")) {
          date.setDate(date.getDate() + number);
          k = k.substring(0, k.length - 6);
          newParam[k] = date;
        } else {
          newParam[k] = value;
        }
      } else {
        newParam[k] = value;
      }
    }
    return newParam;
  }

  coke.queryItem = function(dataSet, dataSetQuery, dataPath, extraConfig){
    var oldParameter = coke.snapshot(dataSet.get("parameter"));
    var queryEntity = dataSetQuery.getData();
    var parameter = coke.formatParameter(queryEntity && queryEntity.toJSON());
    coke.mergeParameter(dataSet, parameter);
    if (extraConfig && extraConfig.extraQueryData) {
      var newExtraQueryData = jQuery.extend(true, {}, extraConfig.extraQueryData);
      coke.mergeParameter(dataSet, newExtraQueryData);
    }
    dataSet.flushAsync(function(data){
      dataSet.set("parameter", {});
      dataSet.set("parameter", oldParameter);
      if (extraConfig && jQuery.isFunction(extraConfig.callback)) {
        extraConfig.callback(data)
      }
    });
  }
  coke.queryReferenceItem = function(entity, reference, autoFormQuery){
    var queryJson = autoFormQuery.get("entity").toJSON();
    var parameter = reference.get("parameter");
    var lastQueryJson = autoFormQuery.lastQueryJson;
    if (lastQueryJson) {
      for (var p in lastQueryJson) {
        parameter.remove(p);
      }
    }
    parameter.put(queryJson);
    entity.reset(reference.get("name"));
    autoFormQuery.lastQueryJson = queryJson;
  }

  coke.resetQuery = function(dataSet, dataSetQuery, resetQueryData){
    // clone对象，防止查询参数与DataSet,data混淆
    resetQueryData = jQuery.extend(true, {}, resetQueryData);
    dataSetQuery.setData(resetQueryData);
  }

  coke.getEntity = function(dataGrid){
    if (!type) {
      type = "current";
    }

    var selection = dataGrid.get("selection");
    var current;
    if (selection) {
      if (selection.length == 1) {
        current = selection[0];
      } else {
        dorado.MessageBox.alert("请选择一条记录.");
      }
    } else {
      current = dataGrid.get("dataSet").getData().current;
    }
    return current;
  }

  coke.getSelections = function(dataControl, type){
    if (!type) {
      type = "current";
    }
    if (!dataControl) {
      console.error("未找到对应的 DataControl,无法处理。");
      return;
    }

    var selection = dataControl.get("selection");
    var list;
    if (selection && selection.length > 0) {
      list = selection;
    } else if (type == "all") {
      list = dataControl.get("dataSet").getData(dataControl.get("dataPath"));
    } else if (type == "current") {
      var current;
      if (dorado.widget.DataTree && dataControl instanceof dorado.widget.DataTree) {
        current = dataControl.get("dataSet").getData("!" + dataControl.get("currentNodeDataPath"));
      } else {
        current = dataControl.get("dataSet").getData(dataControl.get("dataPath")).current;
      }
      list = [];
      if (current) {
        list.push(current);
      }
    } else {
      list = [];
    }
    return list;
  }

  coke.dataRowClick = function(rowList, clickCallback, doubleClickCallback){
    var timer;

    var singleClick = function(){
      clearTimeout(timer);
      timer = setTimeout(function(){
        if (clickCallback instanceof Function) {
          clickCallback();
        }
      }, 200);
    }

    var doubleClick = function(){
      clearTimeout(timer);
      if (doubleClickCallback instanceof Function) {
        doubleClickCallback();
      }
    }

    rowList.addListener("onDataRowClick", singleClick);
    rowList.addListener("onDataRowDoubleClick", doubleClick);
  }

  coke.validateDataSetLength = function(dataSet, dataPath){
    var list = dataSet.queryData("[#dirty]");
    list.each(function(entity){
      coke.validateEntityLength(entity);
    });
  }

  coke.validateEntityLength = function(entity){
    var json = entity.toJSON();

    for (var p in json) {
      var validators = entity.dataType.get("#" + p + ".validators");
      var hasLengthValidator = false;
      if (validators && validators.length) {
        for (var i in validators) {
          if (validators[i] instanceof dorado.validator.LengthValidator) {
            hasLengthValidator = true;
            break;
          }
        }
      }

      var value = entity.get(p);
      if (typeof value === "string" && !hasLengthValidator) {
        var lengthLimited = p == "remark" ? 2000 : 255;
        if (value.length > lengthLimited) {
          entity.setMessages(p, "文本不能超过 " + lengthLimited);
        }
      }
    }
  }

  function currPathToList(dataPath){
    if (!dataPath) {
      return "";
    }
    var hashIndex = dataPath.lastIndexOf("#");
    if (hashIndex < 0) {
      return dataPath;
    }

    return dataPath.substring(0, hashIndex) + dataPath.substring(hashIndex + 1);

  }

  var modeValue = {};
  coke.mode = function(view, name, mode, getModeCode){
    setMode(view.get("^" + name), mode, name, getModeCode);
    modeValue[name] = mode;
  }
  coke.getMode = function(name){
    return modeValue[name];
  }

  function setMode(components, mode, name, getModeCode){
    if (!getModeCode) {
      getModeCode = function(component, name){
        var modeCode;
        if (name) {
          if (jQuery.isFunction(component.getModeCode)) {
            modeCode = component.getModeCode(name);
          } else if (component.modeCode) {
            modeCode = component.modeCode[name];
          }
        }
        return modeCode || component.get("userData");
      }
    }
    components.each(function(component){
      var modeCode = getModeCode(component, name);
      if (modeCode) {
        var code = modeCode[mode];
        if (code == 'H') {
          component.set("visible", false);
        } else if (code == 'R') {
          component.set({
            "visible": true,
            "readOnly": true,
            "disable": true
          }, {
            "skipUnknownAttribute": true,
            "tryNextOnError": true
          });
        } else if (code == 'W') {
          component.set({
            "visible": true,
            "readOnly": false,
            "disable": false
          }, {
            "skipUnknownAttribute": true,
            "tryNextOnError": true
          });
        }
      }
    });
  }
  coke.autoAction = function(view, config){
    if (typeof config === "string") {
      config = {
        name: config
      }
    }

    if (config.cascadeDelete === undefined) {
      config.cascadeDelete = true;
    }

    var dateSetId;
    var updateActionId;
    var currentPath, defaultCurrentPath;
    var listPath, defaultListPath;
    var dataSetQueryId = "dataSet" + config.name + "Query";
    var autoFormQueryId = "autoForm" + config.name + "Query";

    var dialogCaption = config.dialogCaption;

    if (config.parentName) {
      dateSetId = "dataSet" + config.parentName;
      updateActionId = "updateAction" + config.parentName;
      var childname = config.name.substr(0, 1).toLowerCase() + config.name.substr(1) + "s";
      defaultCurrentPath = "#.#" + childname;
      defaultListPath = "#." + childname;
    } else {
      dateSetId = "dataSet" + config.name;
      updateActionId = "updateAction" + config.name;
      defaultCurrentPath = "#";
      defaultListPath = "";
    }

    currentPath = config.currentPath || defaultCurrentPath;
    listPath = config.listPath || currPathToList(currentPath) || defaultListPath;

    var dataSet = config.dataSet || view.id(dateSetId);
    var autoFormQuery = config.autoFormQuery || view.id(autoFormQueryId);
    var dataSetQuery = config.dataSetQuery || view.id(dataSetQueryId);
    if (!dataSetQuery && autoFormQuery) {
      dataSetQuery = autoFormQuery.get("dataSet");
    }
    var updateAction = config.updateAction || view.id(updateActionId);

    var dialog = config.dialog || view.id("dialog" + config.name);
    var dataGrid = config.dataGrid || view.id("dataGrid" + config.name);
    var dataTree = config.dataTree || view.id("dataTree" + config.name)
    var dataTreeGrid = config.dataTreeGrid || view.id("dataTreeGrid" + config.name)
    var children = config.children || "children";

    var buttonEdit = config.buttonEdit || view.id("buttonEdit" + config.name);
    var autoFormQuery = config.autoForm || view.id("autoForm" + config.name + "Query");
    var panelQuery = config.panelQuery || view.id("panel" + config.name + "Query");

    currentPath = config.currentPath || currentPath;
    listPath = config.listPath || listPath;

    var actionMode;
    function changeMode(mode){
      actionMode = mode;
      var components = view.get("^" + config.name + "Mode");
      setMode(components, mode, config.name + "Mode");
      if (jQuery.isFunction(config.onChangeMode)) {
        config.onChangeMode(components, mode);
      }
    }
    // 0. insert, 1. edit, 2. view
    function insertMode(){
      changeMode(0);
    }
    function editMode(){
      changeMode(1);
    }
    function viewMode(){
      changeMode(2);
    }
    view["getMode" + config.name] = function(){
      return actionMode;
    }

    view["changeMode" + config.name] = function(mode){
      changeMode(mode);
    }

    view["insert" + config.name] = view["insert" + config.name] ||
    function(args){
      insertMode();
      if (jQuery.isFunction(config.beforeInsert)) {
        var arg = {
          processDefault: true
        };
        config.beforeInsert(arg);
        if (!arg.processDefault) {
          return;
        }

      }

      var insertedEntity;
      if (args && typeof args.insertData == "function") {
        insertedEntity = coke.insertItem(dataSet, listPath, dialog, args.insertData());
      } else if (args && typeof args.insertData == "object") {
        insertedEntity = coke.insertItem(dataSet, listPath, dialog, jQuery.extend(true, {}, args.insertData));
      } else if (typeof config.insertData == "function") {
        insertedEntity = coke.insertItem(dataSet, listPath, dialog, config.insertData());
      } else if (typeof config.insertData == "object") {
        insertedEntity = coke.insertItem(dataSet, listPath, dialog, jQuery.extend(true, {}, config.insertData));
      } else {
        insertedEntity = coke.insertItem(dataSet, listPath, dialog);
      }
      if (insertedEntity) {
        var onInsert = (args && args.onInsert) || config.onInsert;
        if (jQuery.isFunction(onInsert)) {
          onInsert(insertedEntity);
        }
      }
    };

    view["insertChild" + config.name] = view["insertChild" + config.name] ||
    function(args){
      insertMode();
      var insertedEntity;
      var insertDataFunc;
      if (args && typeof args.insertData == "function") {
        insertDataFunc = args.insertData;
      } else if (typeof config.insertData == "object") {
        insertDataFunc = function(){
          return jQuery.extend(true, {}, config.insertData);
        }
      } else if (typeof config.insertData == "function") {
        insertDataFunc = config.insertData;
      }
      insertedEntity = coke.insertChildItem(dataTree, children, dialog, insertDataFunc);

      if (insertedEntity) {
        var onInsert = (args && args.onInsert) || config.onInsert;
        if (jQuery.isFunction(onInsert)) {
          onInsert(insertedEntity);
        }
      }
    };

    view["insertBrother" + config.name] = view["insertBrother" + config.name] ||
    function(args){
      insertMode();

      var insertedEntity;
      var insertDataFunc;
      if (args && typeof args.insertData == "function") {
        insertDataFunc = args.insertData;
      } else if (typeof config.insertData == "object") {
        insertDataFunc = function(){
          return jQuery.extend(true, {}, config.insertData);
        }
      } else if (typeof config.insertData == "function") {
        insertDataFunc = config.insertData;
      }
      insertedEntity = coke.insertBrotherItem(dataTree, children, dialog, insertDataFunc);

      if (insertedEntity) {
        var onInsert = (args && args.onInsert) || config.onInsert;
        if (jQuery.isFunction(onInsert)) {
          onInsert(insertedEntity);
        }
      }
    };

    view["getCurrent" + config.name] = function(){
      return dataSet.getData(currentPath);
    }

    view["edit" + config.name] = view["edit" + config.name] ||
    function(){
      editMode()
      var entity = dataSet.getData(currentPath);
      if (entity && jQuery.isFunction(config.onEdit)) {
        config.onEdit(entity);
      }
      coke.editItem(dataSet, currentPath, dialog);
    };

    view["view" + config.name] = view["view" + config.name] ||
    function(){
      viewMode();
      var entity = dataSet.getData(currentPath);
      addActionInterceptor("before", "View", entity);
      coke.viewItem(dataSet, currentPath, dialog);
    };

    view["del" + config.name] = view["del" + config.name] ||
    function(){
      var selectableWidget = dataGrid || dataTree || dataTreeGrid;
      if (selectableWidget) {
        coke.deleteItems(selectableWidget, updateAction, config);
      } else {
        coke.deleteItem(dataSet, currentPath, updateAction, config.afterDel, config);
      }
    };

    function addActionInterceptor(type, action, args){
      var realAction = config[type + action];
      if (jQuery.isFunction(realAction)) {
        realAction(args);
      }
    }

    view["save" + config.name] = view["save" + config.name] ||
    function(callback){
      var entity = dataSet.getData(currentPath);
      addActionInterceptor("before", "Save", entity);
      coke.saveItem(dataSet, currentPath, updateAction, dialog, callback || config.afterSave);
      // addActionInterceptor("after", "Save", entity);

    };

    view["cancel" + config.name] = view["cancel" + config.name] ||
    function(){
      var entity = dataSet.getData(currentPath);
      addActionInterceptor("before", "Cancel", entity);
      coke.cancelItem(dataSet, currentPath, dialog, config.afterCancel);
    };

    view["query" + config.name] = view["query" + config.name] ||
    function(extraConfig){
      coke.queryItem(dataSet, dataSetQuery, listPath, extraConfig);
    };

    view["queryReset" + config.name] = view["queryReset" + config.name] ||
    function(){
      var queryResetData;
      if (jQuery.isFunction(config.resetQueryData)) {
        queryResetData = config.resetQueryData();
      }
      coke.resetQuery(dataSet, dataSetQuery, queryResetData);

    };

    var actions = {
      "Insert": {
        "iconClass": "fa fa-plus ck-icon-primary",
        "exClassName": "ck-btn-primary",
        "caption": "添加"
      },
      "Edit": {
        "iconClass": "fa fa-pencil",
        "caption": "编辑"
      },
      "View": {
        "iconClass": "fa fa-eye",
        "caption": "查看"
      },
      "Del": {
        "iconClass": "fa fa-minus ck-icon-danger",
        "caption": "删除"
      },
      "Save": {
        "iconClass": "fa fa-check ck-icon-primary",
        "exClassName": "ck-btn-primary",
        "caption": "保存"
      },
      "Cancel": {
        "iconClass": "fa fa-times",
        "caption": "关闭"
      },
      "Query": {
        "exClassName": "ck-btn-primary",
        "iconClass": "fa fa-search ck-icon-primary",
        "caption": "查询"
      },
      "QueryReset": {
        "iconClass": "fa fa-undo",
        "caption": "重置"
      }

    };

    for (var action in actions) {
      var component = view.id("button" + action + config.name);

      if (!component) {
        continue;
      }

      var configs = actions[action];
      for (var p in configs) {
        var value = component.get(p);
        if (!value) {
          component.set(p, configs[p]);
        }
      }

      function bindFunc(functionName, component){
        return function(){
          if (!component.doing) {
            component.doing = {};
          }
          console.log(component.doing);
          if (jQuery.isFunction(view[functionName]) && !component.doing[functionName]) {
            component.doing[functionName] = true;
            try {
              view[functionName]();
            }
            catch (e) {
              console.error(e);
            }
            setTimeout(function(){
              component.doing[functionName] = false;
            }, 300)
          }
        }
      }

      var functionName = action.substr(0, 1).toLowerCase() + action.substr(1) + config.name;
      var actionFunction = view[functionName];
      if (actionFunction) {
        component.bind("onClick", bindFunc(functionName, component));
      }
      if (action == "Query") {
        // coke.buttonCss(component, "info")
      } else if (action == "Insert" || action == "Save") {
        // coke.buttonCss(component, "primary")
      } else if (action == "Del") {
        coke.buttonCss(component, "danger")
      }
    }

    if (dialog) {
      dialog.bind("beforeClose", function(self, arg){
        view["cancel" + config.name]();
        arg.processDefault = false;
      });
      dialog.bind("beforeShow", function(self, arg){
      });

      dialog.bind("onShow", function(self, arg){
        var caption = dialog.get("caption");
        if (!caption) {
          dialog.set("caption", config.dialogCaption || "");
        }
      });
      dialog.bind("beforeHide", function(self, arg){
        dataSet.set("readOnly", dateSetReadOnly);

        if (jQuery.isFunction(dialog.callback)) {
          dialog.callback();
          dialog.callback = null;
        }

        if (jQuery.isFunction(config.beforeDialogHide)) {
          config.beforeDialogHide(self, arg);
        }
      });
    }

    if (dataGrid) {
      if (dialog && config.onDataRowDoubleClick === undefined) {
        dataGrid.bind("onDataRowDoubleClick", function(self, arg){
          var doubleClickMode = null;
          if (jQuery.isFunction(config.dbClickMode)) {
            doubleClickMode = config.dbClickMode(arg);
          } else {
            doubleClickMode = config.dbClickMode;
          }
          doubleClickMode = doubleClickMode || "edit";
          var func = view[doubleClickMode + config.name];
          if (jQuery.isFunction(func)) {
            func();
          }
        });
      } else if (jQuery.isFunction(config.onDataRowDoubleClick)) {
        dataGrid.bind("onDataRowDoubleClick", config.onDataRowDoubleClick);
      }
    }
    if (autoFormQuery) {
      autoFormQuery.bind("onKeyPress", function(self, arg){
        if (arg.keyCode == 13) {
          var queryFunc = view["query" + config.name];
          if (jQuery.isFunction(queryFunc)) {
            queryFunc();
          }
        }
      });
    }

    if (dataSetQuery) {
      if (config.queryData) {
        var queryData = jQuery.extend(true, {}, config.queryData);
        dataSetQuery.setData(queryData);
      }
    }

    coke._subpages = {};
    var url = window.location.pathname + window.location.search;
    if (url.startsWith("/")) {
      url = url.substr(1);
    }
    coke._updateActions = coke._updateActions || {};
    if (updateAction) {
      coke._updateActions[updateAction.get("id")] = updateAction;
    }
    if (top != window) {
      if (!top.coke._subpages) {
        top.coke._subpages = {};
      }
      top.coke._subpages[url] = {
        couldLeave: function(){
          for (var p in coke._updateActions) {
            if (coke._updateActions[p].get("hasUpdateData")) {
              return false;
            }
          }
          return true;
        }
      };
    }

    if (config.tabControl) {
      var tabControl = view.id("tabControl");
    }

    if (panelQuery) {
      /*
       * panelQuery.set({ collapseable: true, collapsed: true });
       */
      panelQuery.bind("onClick", function(self, arg){
        if (self.get("collapsed")) {
          self.set("collapsed", false);
        }
      });
      panelQuery.bind("onDoubleClick", function(self, arg){
        self.set("collapsed", !self.get("collapsed"));
      });
    }

    coke.unregister = function(){
      if (window.top && top.coke && top.coke._subpages) {
        top.coke._subpages[url] = null;
      }
    }

    window.onbeforeunload = function(e){
      for (var p in coke._updateActions) {
        if (coke._updateActions[p].get("hasUpdateData")) {
          console.log(p);
          top.coke._subpages[url] = null;
          // Cancel the event
          e.preventDefault();
          // Chrome requires returnValue to be set
          e.returnValue = '';
          break;
        }
      }
    }

    if (jQuery.isFunction(config.onCurrent)) {
      coke.onCurrent(dataSet, config.onCurrent);
    }

  };

  function travelObject(parent, property, callback){
    var value;
    if (property || property === 0) {
      value = parent[property];
    } else {
      value = parent;
    }
    if (jQuery.isPlainObject(value)) {
      for (var p in value) {
        travelObject(value, p, callback);
      }
    } else if (jQuery.isArray(value)) {
      for (var i = 0; i < value.length; i++) {
        travelObject(value, i, callback);
      }
    }

    if (property) {
      if (callback && callback instanceof Function) {
        callback(value, property);
      }
    }
  }

  $namespace("coke.dropDown")
  coke.dropDown.enableDynaFilter = function(dropDown, config){
    var filterCallback = config.filterCallback, filterProperty = config.filterProperty || "filterValue", dataSet = config.dataSet, dataPath = config.dataPath ||
    "#";
    minFilterInterval = config.minFilterInterval || 300;

    dropDown.bind("onOpen", function(self, arg){
      var editor = self._editor;
      if (editor instanceof dorado.widget.AbstractTextBox) {
        var editorDom = jQuery(editor.getDom()).find("input");

        var compositionstart = false;
        // 中文输入开始
        editorDom.on('compositionstart', function(){
          compositionstart = true;
        });
        // 中文输入结束
        editorDom.on('compositionend', function(){
          compositionstart = false;
        });

        var dropDown = self;
        var filterFn = self._onTextEditedListener = function(){
          setTimeout(function(){
            if (compositionstart) {
              return;
            }
            if (dropDown.get("opened")) {
              dorado.Toolkits.setDelayedAction(dropDown, "$filterTimeId", function(){
                var text = editor.doGetText();
                if (jQuery.isFunction(filterCallback)) {
                  filterCallback(text);
                } else if (dataSet) {
                  var p = {};
                  p[filterProperty] = text;
                  coke.mergeParameter(dataSet, p);
                  dataSet.flushAsync();
                } else {
                  console.log("typing: " + text);
                }
              }, minFilterInterval);
            }
          }, 10);
        };
        editor.addListener("onTextEdit", filterFn);
      }
    });

    dropDown.bind("onClose", function(self, arg){
      var editor = self._editor;
      if (editor instanceof dorado.widget.AbstractTextBox) {
        editor.removeListener("onTextEdit", self._onTextEditedListener);
      }
      if (config.autoAssignValueOnClose) {
        coke.dropDown.autoSelectOnClose(dropDown, arg, dataSet, dataPath);
      }
    });
  }
  coke.dropDown.autoSelectOnClose = function(dropDown, arg, dataSet, dataPath){
    var editor = arg.editor;
    var dataPath = dataPath || "#";

    if (!arg.selectedValue && dataSet) {
      var data = dataSet.getDataAsync(dataPath, function(data){
        if (data && editor && arg.editor.get("value")) {
          arg.selectedValue = data.toJSON();

          if (arg.selectedValue !== undefined) {
            dropDown.fireEvent("onValueSelect", dropDown, arg);
            if (arg.processDefault && arg.selectedValue !== undefined) {
              dropDown.assignValue(editor, arg.selectedValue, arg);
            }
          }
        }
      });
    }
  }

  coke.mergeParameter = function(action, newParameter){
    var oldParameter = action.get("parameter");
    if (!oldParameter) {
      action.set("parameter", {});
      oldParameter = action.get("parameter");
    }
    if (oldParameter instanceof dorado.util.Map) {
      oldParameter.put(newParameter)
    } else {
      dorado.Object.apply(oldParameter, newParameter);
    }
  }

  function parseParam(param){
    if (!param)
      return null;

    var pairs = [];
    param.split(';').each(function(pair){
      var i = pair.indexOf('='), key, value;
      if (i >= 0 && i < (pair.length - 1)) {
        pairs.push({
          key: pair.substring(0, i),
          value: pair.substring(i + 1)
        });
      } else {
        pairs.push({
          value: pair
        });
      }
    });
    return pairs;
  }

  function getEditor(entity, editorType){
    if (!editorType) {
      return null;
    }
    var param;

    var editor = eval("new dorado.widget." + editorType + "()");
    if (editor instanceof dorado.widget.TextEditor) {
      if (param) {
        var trigger;
        if (param == "date") {
          trigger = "defaultDateDropDown";
        } else if (param == "dateTime") {
          trigger = "defaultDateTimeDropDown";
        } else {
          trigger = new dorado.widget.ListDropDown({
            items: parseParam(param),
            property: "value"
          });
        }
        editor.set("trigger", trigger);
      }
    } else if (editor instanceof dorado.widget.CheckBox) {
      editor.set("exClassName", "d-checkbox-center")
    } else if (editor instanceof dorado.widget.RadioGroup) {
      editor.set("layout", "flow");
      if (param) {
        var radioButtons = [];
        parseParam(param).each(function(pair){
          radioButtons.push({
            value: pair.key,
            text: pair.value
          });
        });
        editor.set("radioButtons", radioButtons);
      }
    } else if (editor instanceof dorado.widget.DateTimeSpinner) {
      editor.set({
        type: param
      });
    } else if (editor instanceof dorado.widget.CustomSpinner) {
      editor.set("pattern", param);
    }
    return editor;
  }

  if (dorado && dorado.widget && dorado.widget.grid) {
    var CellRenderer = $extend(dorado.widget.grid.SubControlCellRenderer, {
      $className: "org.xobo.dorado.widget.CellRenderer",
      property: null,
      editorType: null,
      createSubControl: function(arg){
        var self = this;
        var entity = arg.data;
        var editor = getEditor(entity, this.editorType);
        if (editor) {
          editor.set("width", "100%");
        }
        return editor;
      },
      refreshSubControl: function(editor, arg){
        if (editor)
          editor.set("value", arg.data.get(this.property));
      }
    });
  }

  dorado.widget.View.registerDefaultComponent("defaultDateDropDown", function(){
    return new dorado.widget.DateDropDown({
      autoOpen: true
    });
  });

  /*
   * dorado.afterInit(function(){ var showMenuHandler;
   * jQuery(document).mousemove(function(event){ if (top.viewMain) { if
   * (event.clientX < 2) { showMenuHandler = setTimeout(function(){ var
   * dialogMenu = top.viewMain.id("dialogMenu"); if (dialogMenu){
   * dialogMenu.$show() }; }, 300); } else if (showMenuHandler){
   * clearTimeout(showMenuHandler); showMenuHandler = null; } } }) });
   */
  function addDollar(str){
    return str ? "${" + str + "}" : "";
  }
  coke.generateMyBatisCondition = function(dataType, alias, parameterPrefix){
    var names = [];
    var result = "";

    alias = alias || "t.";
    parameterPrefix = parameterPrefix || "";
    if (alias && !alias.endsWith(".")) {
      alias += ".";
    }
    if (parameterPrefix && !parameterPrefix.endsWith(".")) {
      parameterPrefix += ".";
    }
    viewMain.get("@" + dataType).get("propertyDefs").each(function(item){
      names.push(item.get("name"))
    });

    function toUnderscore(str){
      return str.replace(/([A-Z])/g, function($1){
        return "_" + $1.toLowerCase();
      });
    }

    names.forEach(function(name){
      var columnName = toUnderscore(name);
      // result += `<if test="${parameterPrefix}${name} != null and
      // ${parameterPrefix}${name} != ''">\n AND ${alias}${columnName} =
      // #{${parameterPrefix}${name}}\n</if>\n`;
      result += '<if test="' + parameterPrefix + name + ' != null and ' + parameterPrefix + name + ' != \'\'">\n  AND ' +
      alias +
      columnName +
      ' = #{' +
      parameterPrefix +
      name +
      '}\n</if>\n';
    });
    console.log(result);
  }

  coke.onCurrent = function(dataSet, callback){
    dataSet.get("dataType").bind("onCurrentChange", function(self, arg){
      callback(arg.newCurrent);
    });
    dataSet.bind("onLoadData", function(self, arg){
      var data = self.getData("#");
      callback(data);
    });
  }

  coke.objToQueryStr = function(obj){
    var query = "";
    for (var p in obj) {
      query += "&" + p + "=" + encodeURIComponent(obj[p] || "")
    }
    return query.length ? query.substr(1) : "";
  }

  coke.queryToObj = function(query){
    if (!query) {
      return {};
    }
    try {
      return JSON.parse('{"' + query.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function(key, value){
        return key === "" ? value : decodeURIComponent(value)
      })
    }
    catch (e) {
      console.log(e);
    }
    return {};
  }

  coke.toText = function(entity, properties, separator){
    var values = [];
    properties.split(separator || ",").forEach(function(prop){
      values.push(entity.getText(prop))
    });
    return values.join(separator || ",");
  }

  coke.confirmIfNeeded = function(callback, needConfirm){
    var msg = needConfirm();
    if (!msg) {
      callback();
    } else {
      dorado.MessageBox.confirm(msg, function(){
        callback();
      });
    }
  }

  coke.renderClickLink = function(arg, content, click, config){
    if (!config) {
      config = {};
    }
    jQuery(arg.dom).empty().xCreate({
      tagName: "a",
      content: content || "",
      style: config.style ||
      {
        "color": "#1b8ce0",
        "font-weight": "bold",
      }
    });
    jQuery(arg.dom).css("cursor", config.cursor || "pointer");
    if (click) {
      jQuery(arg.dom).click(click);
    }
    arg.processDefault = false;
  }

  coke.renderButton = function(arg, content, click, config){
    if (!config) {
      config = {};
    }
    jQuery(arg.dom).empty().xCreate({
      tagName: "button",
      content: content || ""
    });
    if (click) {
      jQuery(arg.dom).click(click);
    }
    arg.processDefault = false;
  }

  coke.one = function(component, callback, name, timeout){
    name = name || "default";
    timeout = timeout || 300;

    if (!component.doing) {
      component.doing = {};
    }

    if (!component.doing[name]) {
      component.doing[name] = true;
      callback();
    }
    setTimeout(function(){
      component.doing[name] = false;
    }, timeout)
  }

  coke.copyByAssignmentMap = function(source, target, assignmentMap){
    assignmentMap = assignmentMap.replace(/,/g, ";").split(";");
    var maps = [];
    for (var i = 0; i < assignmentMap.length; i++) {
      var map = assignmentMap[i], index = map.indexOf("=");
      if (index >= 0) {
        maps.push({
          writeProperty: map.substring(0, index),
          readProperty: map.substring(index + 1)
        });
      } else {
        maps.push({
          writeProperty: map,
          readProperty: map
        });
      }
    }
    for (var i = 0; i < maps.length; i++) {
      var map = maps[i], value;
      if (map.readProperty == "$this") {
        value = source;
      } else {
        value = (source instanceof dorado.Entity) ? source.get(map.readProperty) : source[map.readProperty];
      }
      if (value instanceof dorado.Entity) {
        if (value.isEmptyItem) {
          value = null;
        } else {
          value = dorado.Core.clone(value);
        }
      }
      if (target instanceof dorado.Entity) {
        target.set(map.writeProperty, value);
      } else {
        target[map.writeProperty] = value;
      }
    }
  }

  coke.setIfDiff = function(entity, prop, value){
    if (entity.get(prop) !== value) {
      entity.set(prop, value);
    }
  }

})(window, window.coke || (window.coke = {}));
