package org.xobo.dorado.turbo.core.service;

import java.util.Collection;
import com.bstek.dorado.data.provider.Criteria;
import com.bstek.dorado.data.provider.Page;

public interface PersistService {

  <T> Collection<T> find(Class<T> clazz, Criteria criteria);

  <T> Page<T> find(Class<T> clazz, Criteria criteria, Page<T> page);

  <T> void save(Collection<T> dataList);

  <T> void save(Collection<T> dataList, PersistPolicy persistPolicy);

}
