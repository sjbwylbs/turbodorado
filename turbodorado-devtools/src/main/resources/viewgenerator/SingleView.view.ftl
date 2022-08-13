<#import "/Entity.view.ftl" as my>
<?xml version="1.0" encoding="UTF-8"?>
<ViewConfig>
  <Arguments/>
  <Context/>
  <Model>
   	<@my.DataType name=main.name entity=main props=main.props/>
   	<#if main.queryProps?has_content>
   	<@my.DataType name="${main.name}Query" entity=entity props=main.queryProps/>
   	</#if>
  </Model>
  <View>
    <ClientEvent name="onReady">
    <@my.AutoAction entity=main/>
    </ClientEvent>
    <Property name="packages">CokeAction</Property>
   	<@my.Entity entity=main/>
   	<@my.UpdateAction entity=main/>
  </View>
</ViewConfig>