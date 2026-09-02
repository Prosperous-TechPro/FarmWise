/**
 * EmptyState Component
 * 
 * Display when no data is available
 */

import './EmptyState.css';

export function EmptyState({ 
  title = 'No Data', 
  message = 'There is nothing to display here', 
  icon = '📭',
  action,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__content">
        <div className="empty-state__icon">{icon}</div>
        <h3 className="empty-state__title">{title}</h3>
        <p className="empty-state__message">{message}</p>
        {action && (
          <div className="empty-state__action">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmptyState;
