import React, { useState, useEffect } from 'react';
import { Plus, Trash2, LayoutTemplate, ExternalLink, CheckCircle, MoreVertical, Edit2 } from 'lucide-react';

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
  const [newPageOldUrl, setNewPageOldUrl] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [pageToEdit, setPageToEdit] = useState(null);
  const [editPageName, setEditPageName] = useState('');
  const [editPageUrl, setEditPageUrl] = useState('');
  const [editPageOldUrl, setEditPageOldUrl] = useState('');

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
      oldUrl: newPageOldUrl.trim(),
      status: 'not-started',
      remarks: '',
      subtasks: []
    };

    setPages([...pages, newPage]);
    setNewPageName('');
    setNewPageUrl('');
    setNewPageOldUrl('');
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

  const handleSaveEdit = () => {
    if (!editPageName.trim()) return;
    setPages(pages.map(page => 
      page.id === pageToEdit.id ? { ...page, name: editPageName.trim(), url: editPageUrl.trim(), oldUrl: editPageOldUrl.trim() } : page
    ));
    setPageToEdit(null);
    showToast(`"${editPageName}" updated successfully!`);
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
          <h1>Project Checklist</h1>
          <p>Track the development status of your projects</p>
        </div>
        <button className="btn" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={18} />
          {showAddForm ? 'Cancel' : 'Add New Item'}
        </button>
      </header>

      {showAddForm && (
        <form className="add-form-card" onSubmit={handleAddPage}>
          <div className="form-group">
            <label htmlFor="pageName">Item Name</label>
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
            <label htmlFor="pageOldUrl">Old Item Link (Optional)</label>
            <input 
              type="url" 
              id="pageOldUrl"
              className="form-control" 
              placeholder="https://old..."
              value={newPageOldUrl}
              onChange={(e) => setNewPageOldUrl(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="pageUrl">New Item Link (Optional)</label>
            <input 
              type="url" 
              id="pageUrl"
              className="form-control" 
              placeholder="https://new..."
              value={newPageUrl}
              onChange={(e) => setNewPageUrl(e.target.value)}
            />
          </div>
          <button type="submit" className="btn" style={{ height: 'fit-content' }}>
            Add Item
          </button>
        </form>
      )}

      <div className="table-card">
        {pages.length === 0 ? (
          <div className="empty-state">
            <LayoutTemplate size={48} />
            <h3>No items added yet</h3>
            <p>Click "Add New Item" to start your checklist.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Item Name</th>
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <input
                          type="text"
                          className="remarks-input"
                          style={{ fontWeight: 500, padding: '0.25rem 0.5rem', margin: '-0.25rem -0.5rem', width: '100%' }}
                          value={page.name}
                          onChange={(e) => handleUpdatePageName(page.id, e.target.value)}
                          title="Click to edit item name"
                        />
                        {(page.url || page.oldUrl) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem', fontSize: '0.75rem' }}>
                            {page.oldUrl && (
                              <a href={page.oldUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }} title="Visit Old Link">
                                <span style={{ fontWeight: 500 }}>Old:</span> <ExternalLink size={12} />
                              </a>
                            )}
                            {page.url && (
                              <a href={page.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }} title="Visit New Link">
                                <span style={{ fontWeight: 500 }}>New:</span> <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
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
                    <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '1rem', position: 'relative' }}>
                      <button 
                        className="btn btn-icon" 
                        onClick={() => setActiveMenuId(activeMenuId === page.id ? null : page.id)}
                        title="More actions"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeMenuId === page.id && (
                        <>
                          <div 
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9 }}
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div className="action-menu" style={{ position: 'absolute', right: '1.5rem', top: '2.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 10, display: 'flex', flexDirection: 'column', padding: '0.25rem', minWidth: '130px' }}>
                            <button 
                              className="btn-menu-item"
                              onClick={() => {
                                setPageToEdit(page);
                                setEditPageName(page.name);
                                setEditPageUrl(page.url || '');
                                setEditPageOldUrl(page.oldUrl || '');
                                setActiveMenuId(null);
                              }}
                            >
                              <Edit2 size={14} /> Edit Item
                            </button>
                            <button 
                              className="btn-menu-item danger"
                              onClick={() => {
                                setPageToDelete(page);
                                setActiveMenuId(null);
                              }}
                            >
                              <Trash2 size={14} /> Delete Item
                            </button>
                          </div>
                        </>
                      )}
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
            <h3>Delete Item</h3>
            <p>Are you sure you want to remove <strong>{pageToDelete.name}</strong> from the checklist? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setPageToDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {pageToEdit && (
        <div className="modal-overlay" onClick={() => setPageToEdit(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem' }}>Edit Item</h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="editPageName">Item Name</label>
              <input 
                type="text" 
                id="editPageName"
                className="form-control" 
                value={editPageName}
                onChange={(e) => setEditPageName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="editPageOldUrl">Old Item Link (Optional)</label>
              <input 
                type="url" 
                id="editPageOldUrl"
                className="form-control" 
                placeholder="https://old..."
                value={editPageOldUrl}
                onChange={(e) => setEditPageOldUrl(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="editPageUrl">New Item Link (Optional)</label>
              <input 
                type="url" 
                id="editPageUrl"
                className="form-control" 
                placeholder="https://new..."
                value={editPageUrl}
                onChange={(e) => setEditPageUrl(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setPageToEdit(null)}>Cancel</button>
              <button className="btn" onClick={handleSaveEdit}>Save Changes</button>
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
