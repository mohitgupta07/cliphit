import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer } from 'electron';

interface ClipboardItem {
  id: string;
  text: string;
  timestamp: number;
}

const App: React.FC = () => {
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Request clipboard history when component mounts
    ipcRenderer.send('get-clipboard-history');

    // Listen for clipboard history updates
    ipcRenderer.on('clipboard-history-updated', (_, items: ClipboardItem[]) => {
      setClipboardItems(items);
    });

    return () => {
      // Clean up listeners
      ipcRenderer.removeAllListeners('clipboard-history-updated');
    };
  }, []);

  const handlePaste = (text: string) => {
    ipcRenderer.send('paste-item', text);
  };

  const handleDelete = (id: string) => {
    ipcRenderer.send('delete-item', id);
  };

  const handleClearHistory = () => {
    ipcRenderer.send('clear-history');
  };

  const filteredItems = clipboardItems.filter(item => 
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div id="app">
      <div className="header">
        <h1>Clippy</h1>
        <div className="header-actions">
          <button onClick={handleClearHistory}>Clear All</button>
        </div>
      </div>
      
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search clipboard history..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {filteredItems.length > 0 ? (
        <ul className="clipboard-list">
          {filteredItems.map(item => (
            <li key={item.id} className="clipboard-item">
              <div onClick={() => handlePaste(item.text)}>
                <div className="clipboard-text">{item.text}</div>
                <div className="timestamp">{formatTimestamp(item.timestamp)}</div>
              </div>
              <div className="clipboard-actions">
                <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <p>No clipboard history found</p>
          <p>Copy text to see it appear here</p>
        </div>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('app')); 