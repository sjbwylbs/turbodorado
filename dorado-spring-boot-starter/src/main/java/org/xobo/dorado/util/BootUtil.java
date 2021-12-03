package org.xobo.dorado.util;

import org.springframework.boot.SpringBootVersion;

public class BootUtil {
  public static final ComparableVersion V_2_1 = new ComparableVersion("2.1.0.RELEASE");

  public static ComparableVersion CURRENT = new ComparableVersion(SpringBootVersion.getVersion());

  public static boolean higherThanV2_1() {
    return CURRENT.compareTo(V_2_1) > 0;
  }

}
