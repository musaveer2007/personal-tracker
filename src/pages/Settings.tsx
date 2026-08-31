import React, { useState } from 'react';
import { useAppStore } from '../data/store';
import { Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Task } from '../data/types';

export const Settings = () => {
  const { settings, updateSettings, resetData, tasks, addTask, deleteTask } = useAppStore();

  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<Task['category']>('fitness');

  const handleChange = (field: keyof typeof settings, value: any) => {
    updateSettings({ [field]: value });
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all your progress data? This cannot be undone.")) {
      resetData();
    }
  };

  const handleAddTask = () => {
    if (!newTaskName.trim()) return;
    addTask({
      id: uuidv4(),
      name: newTaskName,
      category: newTaskCategory,
      frequency: 'daily'
    });
    setNewTaskName('');
  };

  return (
    <div className="pb-24 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight text-white uppercase">SETTINGS</h1>
        <p className="text-primary font-bold tracking-widest text-sm mt-1 uppercase">SYSTEM CONFIGURATION</p>
      </div>

      <div className="space-y-6">
        <div className="card space-y-4">
          <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4">PROFILE & GOALS</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-textMuted uppercase block mb-1">Starting Weight (kg)</label>
              <input 
                type="number" 
                value={settings.startingWeight} 
                onChange={(e) => handleChange('startingWeight', Number(e.target.value))}
                className="w-full bg-surfaceHighlight border border-border rounded-lg p-2 text-white focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-textMuted uppercase block mb-1">Height (cm)</label>
              <input 
                type="number" 
                value={settings.height} 
                onChange={(e) => handleChange('height', Number(e.target.value))}
                className="w-full bg-surfaceHighlight border border-border rounded-lg p-2 text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4">NUTRITION TARGETS</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-textMuted uppercase block mb-1">Calories (kcal)</label>
              <input 
                type="number" 
                value={settings.targetCalories} 
                onChange={(e) => handleChange('targetCalories', Number(e.target.value))}
                className="w-full bg-surfaceHighlight border border-border rounded-lg p-2 text-white focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-textMuted uppercase block mb-1">Protein (g)</label>
              <input 
                type="number" 
                value={settings.targetProtein} 
                onChange={(e) => handleChange('targetProtein', Number(e.target.value))}
                className="w-full bg-surfaceHighlight border border-border rounded-lg p-2 text-white focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-textMuted uppercase block mb-1">Carbs (g)</label>
              <input 
                type="number" 
                value={settings.targetCarbs} 
                onChange={(e) => handleChange('targetCarbs', Number(e.target.value))}
                className="w-full bg-surfaceHighlight border border-border rounded-lg p-2 text-white focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-textMuted uppercase block mb-1">Fat (g)</label>
              <input 
                type="number" 
                value={settings.targetFat} 
                onChange={(e) => handleChange('targetFat', Number(e.target.value))}
                className="w-full bg-surfaceHighlight border border-border rounded-lg p-2 text-white focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-textMuted uppercase block mb-1">Water (ml)</label>
              <input 
                type="number" 
                value={settings.targetWater} 
                onChange={(e) => handleChange('targetWater', Number(e.target.value))}
                className="w-full bg-surfaceHighlight border border-border rounded-lg p-2 text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-bold tracking-widest text-textMuted uppercase mb-4">TASK MANAGEMENT</h2>
          
          <div className="flex space-x-2 mb-4">
            <input 
              type="text" 
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="New Task Name"
              className="flex-1 bg-surfaceHighlight border border-border rounded-lg p-2 text-white focus:border-primary focus:outline-none"
            />
            <select 
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value as any)}
              className="bg-surfaceHighlight border border-border rounded-lg p-2 text-white focus:border-primary focus:outline-none"
            >
              <option value="fitness">Fitness</option>
              <option value="nutrition">Nutrition</option>
              <option value="recovery">Recovery</option>
              <option value="grooming">Grooming</option>
            </select>
            <button onClick={handleAddTask} className="btn-primary flex items-center space-x-2">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {tasks.map(task => (
              <div key={task.id} className="flex justify-between items-center bg-surfaceHighlight/30 p-3 rounded-lg border border-border hover:border-border/80 transition-colors">
                <div>
                  <div className="font-bold text-white text-sm">{task.name}</div>
                  <div className="text-[10px] text-primary uppercase font-bold tracking-widest mt-0.5">{task.category}</div>
                </div>
                <button 
                  onClick={() => {
                    if(window.confirm(`Delete task "${task.name}"?`)) {
                      deleteTask(task.id);
                    }
                  }}
                  className="text-textMuted hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card space-y-4 border-red-900/30">
          <h2 className="text-sm font-bold tracking-widest text-red-500 uppercase mb-4">DANGER ZONE</h2>
          <p className="text-sm text-textMuted mb-4">Resetting your data will erase all workouts, runs, and daily task progress.</p>
          <button onClick={handleReset} className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 hover:bg-red-500/20 transition-colors">
            <RefreshCw className="w-4 h-4" />
            <span>RESET ALL DATA</span>
          </button>
        </div>

      </div>
    </div>
  );
};
