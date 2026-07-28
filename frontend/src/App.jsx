import React, { useState, useEffect } from 'react';

const API_BASE = '/api/notes';

const PRIORITY_OPTIONS = [
  { value: 'HIGH', label: 'Cao', bgClass: 'bg-priority-high-bg border-priority-high-border text-priority-high-text' },
  { value: 'MEDIUM', label: 'Trung bình', bgClass: 'bg-priority-med-bg border-priority-med-border text-priority-med-text' },
  { value: 'LOW', label: 'Thấp', bgClass: 'bg-priority-low-bg border-priority-low-border text-priority-low-text' },
];

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [editingId, setEditingId] = useState(null);

  // Sort/Filter State
  const [sortBy, setSortBy] = useState('created_desc');

  // Fetch Notes
  const fetchNotes = async (sortParam = sortBy) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}?sort=${sortParam}`);
      if (!res.ok) throw new Error(`Lỗi kết nối Server: HTTP ${res.status}`);
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách ghi chú!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes(sortBy);
  }, [sortBy]);

  // Submit Handler (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng điền đầy đủ tiêu đề và nội dung!');
      return;
    }

    try {
      if (editingId) {
        const res = await fetch(`${API_BASE}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, priority }),
        });
        if (!res.ok) throw new Error('Không thể cập nhật ghi chú');
      } else {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, priority }),
        });
        if (!res.ok) throw new Error('Không thể thêm ghi chú');
      }
      setTitle('');
      setContent('');
      setPriority('MEDIUM');
      setEditingId(null);
      fetchNotes();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setPriority(note.priority || 'MEDIUM');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại!');
      fetchNotes();
    } catch (err) {
      alert(err.message);
    }
  };

  // Helper lấy class màu block dựa theo priority
  const getCardStyle = (p) => {
    switch (p) {
      case 'HIGH':
        return 'bg-priority-high-bg border-priority-high-border';
      case 'MEDIUM':
        return 'bg-priority-med-bg border-priority-med-border';
      case 'LOW':
        return 'bg-priority-low-bg border-priority-low-border';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const getBadgeStyle = (p) => {
    const opt = PRIORITY_OPTIONS.find((item) => item.value === p);
    return opt ? opt.bgClass : 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-pastel-text tracking-wide mb-2">
          Notes App
        </h1>
        <p className="text-sm text-gray-500">DevOps Final Assignment • Priority & Filtering</p>
      </header>

      {/* Input Form */}
      <div className="bg-pastel-card rounded-2xl p-6 shadow-sm border border-pastel-primary/30 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          {editingId ? 'Cập Nhật Ghi Chú' : 'Tạo Ghi Chú Mới'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Tiêu đề ghi chú..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-pastel-bg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pastel-primary text-pastel-text"
            />
            {/* Priority Selector */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-4 py-2 rounded-xl bg-pastel-bg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pastel-primary text-pastel-text font-medium cursor-pointer"
            >
              <option value="HIGH">Ưu tiên Cao</option>
              <option value="MEDIUM">Ưu tiên Trung bình</option>
              <option value="LOW">Ưu tiên Thấp</option>
            </select>
          </div>

          <textarea
            placeholder="Nội dung chi tiết..."
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 rounded-xl bg-pastel-bg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pastel-primary text-pastel-text resize-none"
          ></textarea>

          <div className="flex gap-2 justify-end">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTitle('');
                  setContent('');
                  setPriority('MEDIUM');
                }}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-medium transition"
              >
                Hủy
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-pastel-primary hover:bg-pastel-hover text-white font-medium shadow-sm transition"
            >
              {editingId ? 'Lưu Cập Nhật' : 'Thêm Mới'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter / Sort Control Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <span className="text-sm font-semibold text-gray-600">
          📋 Danh sách ghi chú ({notes.length})
        </span>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Sắp xếp theo:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-pastel-bg text-xs font-semibold text-gray-700 border border-gray-200 focus:outline-none cursor-pointer"
          >
            <option value="created_desc">Mới nhất trước (Tạo trước ra sau)</option>
            <option value="priority_desc">Ưu tiên: Cao ➔ Thấp</option>
            <option value="priority_asc">Ưu tiên: Thấp ➔ Cao</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pastel-primary border-t-transparent"></div>
          <p className="mt-2 text-gray-500 text-sm">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-center mb-6">
          <p className="font-medium">Kết nối thất bại!</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={() => fetchNotes(sortBy)}
            className="mt-3 px-4 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-semibold transition"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Note List */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          {notes.length === 0 ? (
            <p className="text-center col-span-full text-gray-400 py-8">Chưa có ghi chú nào.</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`p-5 rounded-2xl border shadow-sm flex flex-col justify-between transition hover:shadow-md ${getCardStyle(
                  note.priority
                )}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-semibold text-lg text-pastel-text">{note.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-current ${getBadgeStyle(
                        note.priority
                      )}`}
                    >
                      {note.priority === 'HIGH' && 'CAO'}
                      {note.priority === 'MEDIUM' && 'TRUNG BÌNH'}
                      {note.priority === 'LOW' && 'THẤP'}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.content}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-black/5 flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(note.createdAt).toLocaleDateString('vi-VN')}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(note)}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="text-red-600 font-medium hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}