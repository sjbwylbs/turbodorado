package org.malagu.panda.coke.viewgenerator.util;

import java.util.HashMap;
import java.util.Map;

import org.junit.Test;
import org.malagu.panda.coke.viewgenerator.domain.EntityDef;

public class FreeMarkerUtilTest {

  @Test
  public void test() {

    EntityDef mainEntityDef = ViewGeneratorUtil.build(EntityDef.class);
    Map<String, Object> dataModel = new HashMap<String, Object>();
    dataModel.put("main", mainEntityDef);


    String result = FreeMarkerUtil.generate("SingleView.view.ftl", dataModel);
    System.out.println(result);
  }

}
