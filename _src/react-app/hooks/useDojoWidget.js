import * as React from 'react';

export default function useDojoWidget(nodeRef, WidgetClass) {
  const [widget, setWidget] = React.useState(null);

  React.useEffect(() => {
    if (!nodeRef.current) {
      return;
    }

    const newWidget = new WidgetClass(null, nodeRef.current);
    newWidget.startup();

    setWidget(newWidget);

    // destroy widgets when the parent component is destroyed
    return () => {
      newWidget.destroy();
    };
  }, [nodeRef, WidgetClass]);

  return widget;
}
