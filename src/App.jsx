import React, { useState, useEffect } from 'react';
import { Plus, Trash2, LayoutTemplate, Edit3 } from 'lucide-react';

function App() {
  const [pages, setPages] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPageName, setNewPageName] = useState('');

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
      // Optional: Add some dummy data if empty initially to show the premium feel
      setPages([
        { id: '1', name: 'Home Page', status: 'completed', remarks: 'Approved by design team.' },
        { id: '2', name: 'About Us', status: 'in-progress', remarks: 'Waiting for updated team photos.' },
        { id: '3', name: 'Contact Form', status: 'not-started', remarks: '' }
      ]);
    }
  }, []);

  // Save to local storage whenever pages change
  useEffect(() => {
    localStorage.setItem('mesiniaga-checklist', JSON.stringify(pages));
  }, [pages]);

  const handleAddPage = (e) => {
    e.preventDefault();
    if (!newPageName.trim()) return;

    const newPage = {
      id: Date.now().toString(),
      name: newPageName.trim(),
      status: 'not-started',
      remarks: ''
    };

    setPages([...pages, newPage]);
    setNewPageName('');
    setShowAddForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this page from the checklist?')) {
      setPages(pages.filter(page => page.id !== id));
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'status-badge completed';
      case 'in-progress': return 'status-badge in-progress';
      default: return 'status-badge not-started';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      default: return 'Not Started';
    }
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
                  <th style={{ width: '25%' }}>Page Name</th>
                  <th style={{ width: '15%' }}>Status</th>
                  <th style={{ width: '50%' }}>Remarks</th>
                  <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td className="page-name">{page.name}</td>
                    <td>
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
                    <td>
                      <input 
                        type="text" 
                        className="remarks-input" 
                        placeholder="Add remarks..."
                        value={page.remarks}
                        onChange={(e) => handleUpdateRemarks(page.id, e.target.value)}
                      />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-icon" 
                        onClick={() => handleDelete(page.id)}
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
    </div>
  );
}

export default App;
