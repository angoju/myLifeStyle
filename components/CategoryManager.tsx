
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ChevronRight, ChevronLeft, Save, List } from 'lucide-react';
import { 
  getCategories, addCategory, updateCategory, deleteCategory,
  addSubItem, updateSubItem, deleteSubItem 
} from '../services/storageService';
import { CategoryDef, SubItemDef } from '../types';

interface CategoryManagerProps {
  onClose: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ onClose }) => {
  const [categories, setCategories] = useState<CategoryDef[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryDef | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCategories(getCategories());
    setLoading(false);
    
    // Refresh selected category if open
    if (selectedCategory) {
        const updated = getCategories().find(c => c.id === selectedCategory.id);
        setSelectedCategory(updated || null);
    }
  };

  // --- Category Actions ---

  const handleAddCategory = () => {
    if (!newValue.trim()) return;
    try {
        addCategory(newValue.trim());
        setNewValue('');
        loadData();
    } catch (e: any) {
        alert(e.message);
    }
  };

  const handleUpdateCategory = (id: string) => {
    if (!editValue.trim()) return;
    updateCategory(id, editValue.trim());
    setEditingId(null);
    loadData();
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Delete this category? This will mark associated habits as 'Unassigned'.")) {
        deleteCategory(id, true);
        loadData();
        if (selectedCategory?.id === id) setSelectedCategory(null);
    }
  };

  // --- Sub-Item Actions ---

  const handleAddSubItem = () => {
    if (!selectedCategory || !newValue.trim()) return;
    addSubItem(selectedCategory.id, newValue.trim());
    setNewValue('');
    loadData();
  };

  const handleUpdateSubItem = (itemId: string) => {
    if (!selectedCategory || !editValue.trim()) return;
    updateSubItem(selectedCategory.id, itemId, editValue.trim());
    setEditingId(null);
    loadData();
  };

  const handleDeleteSubItem = (itemId: string) => {
    if (confirm("Delete this sub-item? Any active habits with this name will be removed.")) {
        deleteSubItem(selectedCategory!.id, itemId);
        loadData();
    }
  };

  // --- UI ---

  const startEdit = (id: string, currentVal: string) => {
      setEditingId(id);
      setEditValue(currentVal);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {selectedCategory ? (
                    <>
                        <button onClick={() => setSelectedCategory(null)} className="hover:bg-gray-100 p-1 rounded-full"><ChevronLeft/></button>
                        {selectedCategory.name}
                    </>
                ) : (
                    'Manage Categories'
                )}
            </h2>
            <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 hover:text-gray-900"><X size={20}/></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
            
            {/* VIEW: CATEGORY LIST */}
            {!selectedCategory && (
                <>
                    {categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl group border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all">
                            {editingId === cat.id ? (
                                <div className="flex flex-1 items-center gap-2">
                                    <input 
                                        autoFocus
                                        value={editValue} 
                                        onChange={e => setEditValue(e.target.value)}
                                        className="flex-1 p-2 rounded-lg border dark:bg-slate-700 dark:text-white text-sm"
                                    />
                                    <button onClick={() => handleUpdateCategory(cat.id)} className="p-2 text-green-500 bg-green-50 rounded-lg"><Save size={16}/></button>
                                    <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 bg-gray-100 rounded-lg"><X size={16}/></button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-medium text-gray-700 dark:text-gray-200 flex-1">{cat.name}</span>
                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setSelectedCategory(cat)} className="p-2 text-primary hover:bg-blue-50 rounded-lg" title="View Items"><List size={16}/></button>
                                        <button onClick={() => startEdit(cat.id, cat.name)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                                        <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </>
            )}

            {/* VIEW: SUB-ITEM LIST */}
            {selectedCategory && (
                 <>
                    {selectedCategory.items.length === 0 && <p className="text-center text-gray-400 py-10">No items yet.</p>}
                    {selectedCategory.items.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl group">
                            {editingId === item.id ? (
                                <div className="flex flex-1 items-center gap-2">
                                    <input 
                                        autoFocus
                                        value={editValue} 
                                        onChange={e => setEditValue(e.target.value)}
                                        className="flex-1 p-2 rounded-lg border dark:bg-slate-700 dark:text-white text-sm"
                                    />
                                    <button onClick={() => handleUpdateSubItem(item.id)} className="p-2 text-green-500 bg-green-50 rounded-lg"><Save size={16}/></button>
                                    <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 bg-gray-100 rounded-lg"><X size={16}/></button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-medium text-gray-700 dark:text-gray-200 flex-1">{item.name}</span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => startEdit(item.id, item.name)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                                        <button onClick={() => handleDeleteSubItem(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                 </>
            )}
        </div>

        {/* Footer: Add New */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-900/50">
            <div className="flex gap-2">
                <input 
                    placeholder={selectedCategory ? `Add to ${selectedCategory.name}...` : "New Category Name..."}
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (selectedCategory ? handleAddSubItem() : handleAddCategory())}
                    className="flex-1 p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary shadow-sm dark:bg-slate-800 dark:text-white"
                />
                <button 
                    onClick={selectedCategory ? handleAddSubItem : handleAddCategory}
                    className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/30 hover:bg-sky-600 transition-colors"
                >
                    <Plus size={24} />
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryManager;
