export const formatDate = (date, format = 'short') => {
    const dateObj = new Date(date);
    
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString();
      case 'long':
        return dateObj.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'time':
        return dateObj.toLocaleTimeString();
      case 'datetime':
        return dateObj.toLocaleString();
      default:
        return dateObj.toLocaleDateString();
    }
  };
  
  /**
   * Truncates text to a specified length
   * @param {string} text - The text to truncate
   * @param {number} maxLength - The maximum length
   * @returns {string} - The truncated text
   */
  export const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) {
      return text;
    }
    
    return text.slice(0, maxLength) + '...';
  };