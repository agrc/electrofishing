import * as React from 'react';

export default function useDojoWidget(widgetRef, nodeRef, WidgetClass) {
  React.useEffect(() => {
    if (!nodeRef.current) {
      return;
    }

    widgetRef.current = new WidgetClass(null, nodeRef.current);
    widgetRef.current.startup();

    // destroy widgets when the parent component is destroyed
    return () => {
      widgetRef.current.destroy();
    };
  }, [widgetRef, nodeRef, WidgetClass]);
}
