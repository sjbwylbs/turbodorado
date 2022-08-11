package org.xobo.dorado.toolkit.view;

import java.util.Collection;
import java.util.List;
import com.bstek.dorado.view.ViewElement;
import com.bstek.dorado.view.widget.Component;
import com.bstek.dorado.view.widget.Container;

public class DoradoViewUtil {
  public static void travel(ViewElement rootViewElement, TravelComponentListener listener) {
    if (rootViewElement == null) {
      return;
    }

    if (listener != null) {
      listener.travel(rootViewElement);
    }

    Collection<ViewElement> subViewElements = rootViewElement.getInnerElements();

    if (isEmpty(subViewElements)) {
      return;
    }

    for (ViewElement subViewElement : subViewElements) {
      travel(subViewElement, listener);
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
