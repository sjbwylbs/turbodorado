package org.xobo.dorado.autoconfigure;

import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.xobo.dorado.util.EnvContextVarsInitializer;
import com.bstek.dorado.core.el.ContextVarsInitializerRegister;
import com.bstek.dorado.web.servlet.DoradoServlet;


@Configuration
@ConditionalOnClass(DoradoServlet.class)
public class DoradoAutoConfiguration {

  @Bean
  public ServletRegistrationBean<DoradoServlet> doradoServletRegistrationBean() {
    ServletRegistrationBean<DoradoServlet> servletRegistrationBean =
        new ServletRegistrationBean<DoradoServlet>(new DoradoServlet(), "*.d", "*.c", "*.dpkg",
            "/dorado/*");
    servletRegistrationBean.setLoadOnStartup(1);
    return servletRegistrationBean;
  }


  /**
   * 添加 dorado EL 表达式上下文， envs 可访问Spring Environment实例
   * 
   * @param environment
   * @return
   */
  @Bean
  public ContextVarsInitializerRegister environmentContextVarsInitializerRegister(
      Environment environment) {
    ContextVarsInitializerRegister contextVarsInitializerRegister =
        new ContextVarsInitializerRegister();
    contextVarsInitializerRegister
        .setContextInitializer(new EnvContextVarsInitializer(environment));
    return contextVarsInitializerRegister;
  };


}
