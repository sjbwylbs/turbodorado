package org.xobo.dorado.util;

import java.util.*;
import org.springframework.core.env.Environment;
import com.bstek.dorado.core.el.ContextVarsInitializer;

public class EnvContextVarsInitializer implements ContextVarsInitializer {
  private Environment environment;

  public EnvContextVarsInitializer(Environment environment) {
    this.environment = environment;
  }

  @Override
  public void initializeContext(Map<String, Object> vars) throws Exception {
    vars.put("envs", new EnvMapWrapper(environment));
  }

  class EnvMapWrapper implements Map<String, Object> {
    private Environment environment;

    public EnvMapWrapper(Environment environment) {
      this.environment = environment;
    }

    @Override
    public int size() {
      return environment == null ? 0 : 1;
    }

    @Override
    public boolean isEmpty() {
      return environment == null;
    }

    @Override
    public boolean containsKey(Object key) {
      return environment.containsProperty(Objects.toString(key, ""));
    }

    @Override
    public boolean containsValue(Object value) {
      return false;
    }

    @Override
    public Object get(Object key) {
      return environment.getProperty(Objects.toString(key, ""));
    }

    @Override
    public Object put(String key, Object value) {
      return null;
    }

    @Override
    public Object remove(Object key) {
      return null;
    }

    @Override
    public void putAll(Map<? extends String, ? extends Object> m) {

    }

    @Override
    public void clear() {

    }

    @Override
    public Set<String> keySet() {
      return Collections.emptySet();
    }

    @Override
    public Collection<Object> values() {
      return Collections.emptyList();
    }

    @Override
    public Set<Entry<String, Object>> entrySet() {
      return Collections.emptySet();
    }

  }

}
