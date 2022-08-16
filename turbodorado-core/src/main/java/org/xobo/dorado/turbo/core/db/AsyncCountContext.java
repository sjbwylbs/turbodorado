package org.xobo.dorado.turbo.core.db;

import java.util.Map;

import org.apache.commons.collections.MapUtils;

import com.bstek.dorado.data.provider.Page;


/**
 * dorado 分步加载数据和总数
 *
 * @author xiaobu
 *
 */
public class AsyncCountContext {
  private static ThreadLocal<Boolean> skipCountThreadLocal = new ThreadLocal<Boolean>();
  private static ThreadLocal<Boolean> skipDataThreadLocal = new ThreadLocal<Boolean>();

  public static boolean skipCount() {
    return Boolean.TRUE.equals(skipCountThreadLocal.get());
  }

  public static boolean skipData() {
    return Boolean.TRUE.equals(skipDataThreadLocal.get());
  }

  public static void skipCount(Boolean val) {
    skipCountThreadLocal.set(val);
  }

  public static void skipData(Boolean val) {
    skipDataThreadLocal.set(val);
  }

  public static void reset() {
    skipCountThreadLocal.remove();
    skipDataThreadLocal.remove();
  }

  public static boolean needCount(Page<?> page) {

    // 显式跳过统计查询
    if (AsyncCountContext.skipCount()) {
      return false;
    }

    // 如果已经跳过数据查询，需要统计查询
    if (AsyncCountContext.skipData()) {
      return true;
    }

    if (page.getEntities().size() < page.getPageSize()) {
      // 根据集合数，推算总数
      page.setEntityCount(page.getPageSize() * (page.getPageNo() - 1) + page.getEntities().size());
      return false;
    }
    return true;
  }

  public static boolean needData() {
    return !AsyncCountContext.skipData();
  }


  public static final String ASYNC_COUNT = "asyncCount";
  public static final String SKIP_COUNT = "skipCount";
  public static final String SKIP_DATA = "skipData";

  public static void byMap(Map<String, Object> parameter) {
    skipCount(MapUtils.getBoolean(parameter, SKIP_COUNT));
    skipData(MapUtils.getBoolean(parameter, SKIP_DATA));
  }

}
