package org.xobo.dorado.autoconfigure;

import java.util.LinkedHashSet;
import java.util.Set;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.SpringApplicationRunListener;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.support.GenericApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.util.ClassUtils;
import org.springframework.util.StringUtils;
import org.xobo.dorado.util.BootUtil;
import com.bstek.dorado.core.CommonContext;
import com.bstek.dorado.core.Context;
import com.bstek.dorado.web.loader.DoradoLoader;

public class DoradoPreloadSpringApplicationRunListener implements SpringApplicationRunListener {

  private SpringApplication application;


  public DoradoPreloadSpringApplicationRunListener(SpringApplication application, String[] args) {
    this.application = application;
    initBasePath(application);
  }

  public void initBasePath(SpringApplication application) {
    String packageName = application.getMainApplicationClass().getPackage().getName();
    if (!StringUtils.isEmpty(packageName)) {
      String basePath = packageName.replaceAll("\\.", "/");
      // ${view.root} 不需要 / 结尾
      System.setProperty("d7.view.root", "classpath:" + basePath);
      // ${model.root}/*.model.xml
      System.setProperty("d7.model.root", "classpath*:" + basePath + "/**");
    }
  }



  public void environmentPrepared(ConfigurableEnvironment environment) {

  }

  @Override
  public void contextPrepared(ConfigurableApplicationContext applicationContext) {
    if (ClassUtils.isPresent("com.bstek.dorado.web.loader.DoradoLoader",
        this.getClass().getClassLoader())) {
      System.setProperty("doradoHome", "classpath:dorado-home/");

      DoradoLoader doradoLoader = DoradoLoader.getInstance();
      try {
        Context context = CommonContext.init(applicationContext);
        DoradoLoader.getInstance().setFailSafeContext(context);
        doradoLoader.preload(true);;
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
      Set<String> sources = new LinkedHashSet<String>(doradoLoader.getContextLocations(false));

      // 解决dorado xml内重复注册bean的bug
      if (BootUtil.higherThanV2_1()) {
        application.setAllowBeanDefinitionOverriding(true);
      }
      application.setSources(sources);
    }
  }

  @Override
  public void contextLoaded(ConfigurableApplicationContext context) {
    if (context instanceof GenericApplicationContext) {
      ((GenericApplicationContext) context).setAllowCircularReferences(true);
    }
  }

  public void starting() {

  }

  @Override
  public void failed(ConfigurableApplicationContext context, Throwable exception) {

  }

  @Override
  public void running(ConfigurableApplicationContext context) {

  }

  @Override
  public void started(ConfigurableApplicationContext context) {

  }

}
