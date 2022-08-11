package org.xobo.dorado.trubo.core.service;


public class PersistPolicy {
  public boolean beforeInsert(Object entity) {
    return true;
  }

  public void afterInsert(Object entity) {

  }

  public boolean beforeUpdate(Object entity) {
    return true;
  }

  public void afterUpdate(Object entity) {

  }

  public boolean beforeDelete(Object entity) {
    return true;
  }

  public void afterDelete(Object entity) {

  }

}
