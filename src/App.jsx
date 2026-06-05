import React, { useState, useEffect } from 'react';
import { Plus, Trash2, LayoutTemplate, ExternalLink, CheckCircle } from 'lucide-react';

// Subtasks Component for handling local input state
const Subtasks = ({ subtasks = [], onAdd, onToggle, onDelete }) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="subtasks-container">
      {subtasks.map(st => (
        <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <input 
            type="checkbox" 
            checked={st.completed} 
            onChange={() => onToggle(st.id)} 
            style={{ cursor: 'pointer' }}
          />
          <span style={{ 
            textDecoration: st.completed ? 'line-through' : 'none', 
            color: st.completed ? 'var(--text-muted)' : 'inherit', 
            fontSize: '0.875rem', 
            flex: 1,
            wordBreak: 'break-word'
          }}>
            {st.text}
          </span>
          <button 
            onClick={() => onDelete(st.id)} 
            className="btn-icon" 
            style={{ padding: '0.1rem', cursor: 'pointer' }}
            title="Delete subtask"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <input 
        type="text" 
        className="remarks-input" 
        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8125rem', marginTop: '0.25rem' }} 
        placeholder="+ Add subtask (press Enter)"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

function App() {
  const [pages, setPages] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [newPageUrl, setNewPageUrl] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [pageToDelete, setPageToDelete] = useState(null);

  // Load from local storage on initial render
  useEffect(() => {
    const savedPages = localStorage.getItem('mesiniaga-checklist');
    if (savedPages) {
      try {
        setPages(JSON.parse(savedPages));
      } catch (e) {
        console.error("Failed to parse pages from local storage", e);
      }
    } else {
      setPages([
        { id: '1', name: 'Home Page', url: 'https://example.com', status: 'completed', remarks: 'Approved by design team.', subtasks: [{id: 's1', text: 'Hero banner', completed: true}] },
        { id: '2', name: 'About Us', url: '', status: 'in-progress', remarks: 'Waiting for updated team photos.', subtasks: [{id: 's2', text: 'Team section', completed: false}] },
        { id: '3', name: 'Contact Form', url: '', status: 'not-started', remarks: '', subtasks: [] }
      ]);
    }
  }, []);

  // Save to local storage whenever pages change
  useEffect(() => {
    localStorage.setItem('mesiniaga-checklist', JSON.stringify(pages));
  }, [pages]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddPage = (e) => {
    e.preventDefault();
    if (!newPageName.trim()) return;

    const newPage = {
      id: Date.now().toString(),
      name: newPageName.trim(),
      url: newPageUrl.trim(),
      status: 'not-started',
      remarks: '',
      subtasks: []
    };

    setPages([...pages, newPage]);
    setNewPageName('');
    setNewPageUrl('');
    setShowAddForm(false);
    showToast(`"${newPage.name}" added successfully!`);
  };

  const confirmDelete = () => {
    if (pageToDelete) {
      setPages(pages.filter(page => page.id !== pageToDelete.id));
      setPageToDelete(null);
    }
  };

  const handleUpdateStatus = (id, newStatus) => {
    setPages(pages.map(page => 
      page.id === id ? { ...page, status: newStatus } : page
    ));
  };

  const handleUpdateRemarks = (id, newRemarks) => {
    setPages(pages.map(page => 
      page.id === id ? { ...page, remarks: newRemarks } : page
    ));
  };

  const handleUpdatePageName = (id, newName) => {
    setPages(pages.map(page => 
      page.id === id ? { ...page, name: newName } : page
    ));
  };

  const handleAddSubtask = (pageId, text) => {
    if (!text.trim()) return;
    setPages(pages.map(page => {
      if (page.id === pageId) {
        const subtasks = page.subtasks || [];
        return {
          ...page,
          subtasks: [...subtasks, { id: Date.now().toString(), text: text.trim(), completed: false }]
        };
      }
      return page;
    }));
  };

  const handleToggleSubtask = (pageId, subtaskId) => {
    setPages(pages.map(page => {
      if (page.id === pageId) {
        return {
          ...page,
          subtasks: (page.subtasks || []).map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
        };
      }
      return page;
    }));
  };

  const handleDeleteSubtask = (pageId, subtaskId) => {
    setPages(pages.map(page => {
      if (page.id === pageId) {
        return {
          ...page,
          subtasks: (page.subtasks || []).filter(st => st.id !== subtaskId)
        };
      }
      return page;
    }));
  };

  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>Pages Design Checklist</h1>
          <p>Track the development status of your web pages</p>
        </div>
        <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={18} />
          {showAddForm ? 'Cancel' : 'Add New Page'}
        </button>
      </header>

      {showAddForm && (
        <form className="add-form-card" onSubmit={handleAddPage}>
          <div className="form-group">
            <label htmlFor="pageName">Page Name</label>
            <input 
              type="text" 
              id="pageName"
              className="form-control" 
              placeholder="e.g. Services Page"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="pageUrl">Page Link (Optional)</label>
            <input 
              type="url" 
              id="pageUrl"
              className="form-control" 
              placeholder="https://"
              value={newPageUrl}
              onChange={(e) => setNewPageUrl(e.target.value)}
            />
          </div>
          <button type="submit" className="btn" style={{ height: 'fit-content' }}>
            Add Page
          </button>
        </form>
      )}

      <div className="table-card">
        {pages.length === 0 ? (
          <div className="empty-state">
            <LayoutTemplate size={48} />
            <h3>No pages added yet</h3>
            <p>Click "Add New Page" to start your checklist.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Page Name</th>
                  <th style={{ width: '15%' }}>Status</th>
                  <th style={{ width: '30%' }}>Subtasks</th>
                  <th style={{ width: '25%' }}>Remarks</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td className="page-name" style={{ verticalAlign: 'top', paddingTop: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="text"
                          className="remarks-input"
                          style={{ fontWeight: 500, padding: '0.25rem 0.5rem', margin: '-0.25rem -0.5rem', width: '100%' }}
                          value={page.name}
                          onChange={(e) => handleUpdatePageName(page.id, e.target.value)}
                          title="Click to edit page name"
                        />
                        {page.url && (
                          <a href={page.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex' }} title="Visit Page">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>
                      <select 
                        className="form-control" 
                        style={{ padding: '0.375rem 0.5rem', width: '100%', cursor: 'pointer' }}
                        value={page.status}
                        onChange={(e) => handleUpdateStatus(page.id, e.target.value)}
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>
                      <Subtasks 
                        subtasks={page.subtasks}
                        onAdd={(text) => handleAddSubtask(page.id, text)}
                        onToggle={(subId) => handleToggleSubtask(page.id, subId)}
                        onDelete={(subId) => handleDeleteSubtask(page.id, subId)}
                      />
                    </td>
                    <td style={{ verticalAlign: 'top', paddingTop: '1rem' }}>
                      <textarea 
                        className="remarks-input" 
                        placeholder="Add remarks..."
                        value={page.remarks}
                        onChange={(e) => handleUpdateRemarks(page.id, e.target.value)}
                        style={{ resize: 'vertical', minHeight: '60px' }}
                      />
                    </td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '1rem' }}>
                      <button 
                        className="btn btn-icon" 
                        onClick={() => setPageToDelete(page)}
                        title="Delete page"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {pageToDelete && (
        <div className="modal-overlay" onClick={() => setPageToDelete(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Delete Page</h3>
            <p>Are you sure you want to remove <strong>{pageToDelete.name}</strong> from the checklist? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setPageToDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            <CheckCircle size={20} className="toast-icon" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
