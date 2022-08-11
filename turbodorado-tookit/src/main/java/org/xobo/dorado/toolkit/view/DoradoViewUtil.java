package org.xobo.dorado.toolkit.view;

import java.util.Collection;
import java.util.List;
import com.bstek.dorado.view.ViewElement;
import com.bstek.dorado.view.widget.Component;
import com.bstek.dorado.view.widget.Container;
import com.bstek.dorado.view.widget.Control;
import com.bstek.dorado.view.widget.base.SplitPanel;
import com.bstek.dorado.view.widget.base.tab.ControlTab;
import com.bstek.dorado.view.widget.base.tab.Tab;
import com.bstek.dorado.view.widget.base.tab.TabControl;

public class DoradoViewUtil {
  public static void travel(ViewElement viewElement, TravelComponentListener listener) {
    if (viewElement == null) {
      return;
    }
    if (listener != null) {
      listener.travel(viewElement);
    }

    Collection<ViewElement> viewElements = viewElement.getInnerElements();



    if (viewElement instanceof Container) {
      travelContainerComponent((Container) viewElement, listener);
    } else if (viewElement instanceof SplitPanel) {
      SplitPanel splitPanel = (SplitPanel) viewElement;
      Control sideControl = splitPanel.getSideControl();
      Control mainControl = splitPanel.getMainControl();
      travel(sideControl, listener);
      travel(mainControl, listener);
    } else if (viewElement instanceof TabControl) {
      List<Tab> tabList = ((TabControl) viewElement).getTabs();
      if (isNotEmpty(tabList)) {
        for (Tab tab : tabList) {
          if (tab instanceof ControlTab) {
            travel(((ControlTab) tab).getControl(), listener);
          }
        }
      }
    }
  }

  public static void travelContainerComponent(Container container,
      TravelComponentListener listener) {
    List<Component> compoments = container.getChildren();
    for (Component component : compoments) {
      travel(component, listener);
    }
  }

  public static <T> boolean isNotEmpty(Collection<T> collection) {
    return collection != null && !collection.isEmpty();
  }

  public static <T> boolean isEmpty(Collection<T> collection) {
    return !isNotEmpty(collection);
  }


}
