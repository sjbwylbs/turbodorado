CokeAction

对于信息管理类系统存在大量的CRUD页面及功能类似但操作不同数据实体的按钮，开发这类系统会产生大量的重复代码。
该工具包就是为**简化开发**、**减少重复代码**、**统一操作体验**。

该工具包启用后会在dorado view内寻找按约定命名的控件，然后给这些控件设置属性，绑定事件，完成预设动作。

## usage

引入CokeAction包之后，在view的onReady事件里，加入如入代码:

### 单体对象
coke.autoAction(view, {
  name: "User",
});

并在view内创建对应的控件:
dialogUser
dataSetUser
buttonInsertUser
...

buttonInsertCompany 会绑定数据插入动作，执行的时候如果有dialogCompany，那么同时会执行 dialogCompany.show() 把对话框展示出来。
buttonSaveCompany  就执行保存
保存时候会执行updateActionCompamy
然后把dialogCompany隐藏掉

假如需要开发一个User的CRUD页面。

1. 我们创建一个User.view.xml文件，再view的packages属性里设置`CokeAction`, 然后在view的onReady事件里添加如下代码:

```
coke.autoAction(view, "User");
```



## 控件命名
控件命名基本是控件名(首字母小写)+实体名
button比较特殊，它分为toolbarButton和button统一为button

dataSet + [name]
updateAction + [name]
dialog + [name]
dataGrid + [name]
dataTree + [name]
dataTreeGrid + [name]
autoForm + [name] + Query
dataSet + [name] + Query

button + [action] + [name]

### action
Insert 添加
InsertChild 添加(子)
InsertBrother 添加(平)
Edit 编辑
View 查看
Del 删除
Save 保存
Cancel 取消
Query 查询
QueryReset 重置查询条件


