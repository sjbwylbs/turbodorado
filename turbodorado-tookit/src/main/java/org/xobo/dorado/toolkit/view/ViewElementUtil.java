package org.xobo.dorado.toolkit.view;

import com.bstek.dorado.common.Ignorable;
import com.bstek.dorado.view.ViewElement;

public class ViewElementUtil {
  public void setState(ViewElement viewElement, ViewElementState state) {

    switch (state) {
      case IGNORE:
        if (viewElement instanceof Ignorable) {
          ((Ignorable) viewElement).setIgnored(true);
        }

        break;

      case VISIBLE:
        break;

      case READONLY:
        break;

      default:
        break;
    }
  }

}
