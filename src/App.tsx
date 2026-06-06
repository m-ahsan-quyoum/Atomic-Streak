/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { 
  Plus, 
  Trash2, 
  Check, 
  Edit2, 
  X, 
  Download,
  Flame,
  LayoutGrid,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  Apple,
  Briefcase,
  Heart,
  Grid,
  Zap,
  Info
} from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  category: string;
  completed: boolean[]; // Monday (idx 0) to Sunday (idx 6)
}

const PRESET_CATEGORIES = ['Health', 'Work', 'Mindfulness', 'Fitness', 'Routine'];

const DEFAULT_HABITS: Habit[] = [
  { id: '1', name: 'Meditate Daily', category: 'Mindfulness', completed: [true, true, true, false, true, true, false] },
  { id: '2', name: 'Read a book chapter', category: 'Health', completed: [true, false, true, true, false, true, false] },
  { id: '3', name: 'HIIT Conditioning', category: 'Fitness', completed: [false, true, true, false, true, false, false] },
  { id: '4', name: 'Deep Work Protocol', category: 'Work', completed: [true, true, true, true, true, false, false] },
  { id: '5', name: 'Zero Sugar Intake', category: 'Routine', completed: [true, true, true, true, true, true, false] }
];

// Resolves theme styling for each category dynamically based on the website dashboard mockup colors
const getCategoryStyles = (category: string) => {
  const cat = category.toLowerCase();
  switch (cat) {
    case 'mindfulness':
    case 'mind':
      return {
        bg: 'bg-[#8378E5]',
        bgLight: 'bg-[#8378E5]/10',
        text: 'text-[#8378E5]',
        textColor: 'text-white',
        border: 'border-[#8378E5]/30',
        ring: 'focus:ring-[#8378E5]/30',
        badge: 'bg-[#8378E5]/20 text-[#aca1f7]',
        gradient: 'from-[#8378E5] to-[#6a5eeb]',
        glow: 'shadow-[0_0_15px_rgba(131,120,229,0.3)]',
        colorCode: '#8378E5'
      };
    case 'health':
      return {
        bg: 'bg-[#42C2F1]',
        bgLight: 'bg-[#42C2F1]/10',
        text: 'text-[#42C2F1]',
        textColor: 'text-slate-950',
        border: 'border-[#42C2F1]/30',
        ring: 'focus:ring-[#42C2F1]/30',
        badge: 'bg-[#42C2F1]/20 text-[#6fe3ff]',
        gradient: 'from-[#42C2F1] to-[#0ea5e9]',
        glow: 'shadow-[0_0_15px_rgba(66,194,241,0.3)]',
        colorCode: '#42C2F1'
      };
    case 'fitness':
      return {
        bg: 'bg-[#F56F5C]',
        bgLight: 'bg-[#F56F5C]/10',
        text: 'text-[#F56F5C]',
        textColor: 'text-white',
        border: 'border-[#F56F5C]/30',
        ring: 'focus:ring-[#F56F5C]/30',
        badge: 'bg-[#F56F5C]/20 text-[#ffa396]',
        gradient: 'from-[#F56F5C] to-[#ef4444]',
        glow: 'shadow-[0_0_15px_rgba(245,111,92,0.3)]',
        colorCode: '#F56F5C'
      };
    case 'work':
      return {
        bg: 'bg-[#3b82f6]',
        bgLight: 'bg-[#3b82f6]/10',
        text: 'text-[#3b82f6]',
        textColor: 'text-white',
        border: 'border-[#3b82f6]/30',
        ring: 'focus:ring-[#3b82f6]/30',
        badge: 'bg-[#3b82f6]/20 text-[#93c5fd]',
        gradient: 'from-[#3b82f6] to-[#1d4ed8]',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
        colorCode: '#3b82f6'
      };
    case 'routine':
    default:
      return {
        bg: 'bg-[#eab308]',
        bgLight: 'bg-[#eab308]/10',
        text: 'text-[#eab308]',
        textColor: 'text-slate-950',
        border: 'border-[#eab308]/30',
        ring: 'focus:ring-[#eab308]/30',
        badge: 'bg-[#eab308]/20 text-[#fef08a]',
        gradient: 'from-[#eab308] to-[#ca8a04]',
        glow: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]',
        colorCode: '#eab308'
      };
  }
};

export default function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [layoutMode, setLayoutMode] = useState<'deck' | 'spreadsheet'>('deck'); // 'deck' mirrors the user mockup visual theme!
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New habit form states
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Mindfulness');

  // Dedicated edit state
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editHabitName, setEditHabitName] = useState('');
  const [editHabitCategory, setEditHabitCategory] = useState('');

  // Persistency: Load initially from localStorage
  useEffect(() => {
    const raw = localStorage.getItem('multi_col_habits');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHabits(parsed);
        } else {
          setHabits(DEFAULT_HABITS);
        }
      } catch (e) {
        setHabits(DEFAULT_HABITS);
      }
    } else {
      setHabits(DEFAULT_HABITS);
    }
  }, []);

  // Save changes to storage whenever habits mutate
  const saveToStorage = (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    localStorage.setItem('multi_col_habits', JSON.stringify(updatedHabits));
  };

  // Live Dynamic Date Representation formatting in Editorial uppercase style
  const formattedDate = useMemo(() => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(now).toUpperCase();
  }, []);

  // Compute dynamically representing current day tracking (0 = Mon, 6 = Sun)
  const currentDayIndex = useMemo(() => {
    const rawDay = new Date().getDay();
    return rawDay === 0 ? 6 : rawDay - 1;
  }, []);

  const currentDayLabel = useMemo(() => {
    const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return dayLabels[currentDayIndex];
  }, [currentDayIndex]);

  // Compute dynamic labels representing the current week calendar
  const weekDays = useMemo(() => {
    const current = new Date();
    const currentDay = current.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(current);
    monday.setDate(current.getDate() + distanceToMonday);

    const days = [];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({
        name: labels[i],
        dateNum: d.getDate(),
        labelLong: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]
      });
    }
    return days;
  }, []);

  // Formula to calculate consecutive days completed up to current day (or starting yesterday if today isn't checked yet)
  const calculateStreak = (completed: boolean[]) => {
    let streakCount = 0;
    // Walk backwards starting from currentDayIndex
    if (completed[currentDayIndex]) {
      for (let i = currentDayIndex; i >= 0; i--) {
        if (completed[i]) {
          streakCount++;
        } else {
          break;
        }
      }
    } else {
      // If today is not completed yet, the streak stays intact if yesterday was completed
      const yesterdayIndex = currentDayIndex - 1;
      if (yesterdayIndex >= 0 && completed[yesterdayIndex]) {
        for (let i = yesterdayIndex; i >= 0; i--) {
          if (completed[i]) {
            streakCount++;
          } else {
            break;
          }
        }
      }
    }
    return streakCount;
  };

  // Formula to calculate maximum consecutive block in entire week for dynamic visual scoring
  const calculateMaxWeeklyStreak = (completed: boolean[]) => {
    let max = 0;
    let temp = 0;
    for (let i = 0; i < 7; i++) {
      if (completed[i]) {
        temp++;
        if (temp > max) max = temp;
      } else {
        temp = 0;
      }
    }
    return max;
  };

  // Live filter matching query & category buttons
  const filteredHabits = useMemo(() => {
    return habits.filter(h => {
      const matchesCategory = selectedCategoryFilter === 'All' || h.category === selectedCategoryFilter;
      const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            h.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [habits, selectedCategoryFilter, searchQuery]);

  // Total complete count across active view list
  const totalCompletedCount = useMemo(() => {
    let total = 0;
    habits.forEach(h => {
      h.completed.forEach(c => {
        if (c) total++;
      });
    });
    return total;
  }, [habits]);

  // Overall Completion Rate of all items
  const overallCompletionRate = useMemo(() => {
    if (habits.length === 0) return 0;
    const totalSlots = habits.length * 7;
    return Math.round((totalCompletedCount / totalSlots) * 100);
  }, [habits, totalCompletedCount]);

  // Current Day Velocity Done Count
  const todayCompletedCount = useMemo(() => {
    return habits.filter(h => h.completed[currentDayIndex]).length;
  }, [habits, currentDayIndex]);

  // Best habit outstanding streak calculation
  const streakLeaderboard = useMemo(() => {
    if (habits.length === 0) return { name: 'None yet', count: 0 };
    let best = { name: '', count: -1 };
    habits.forEach(h => {
      const s = calculateStreak(h.completed);
      if (s > best.count) {
        best = { name: h.name, count: s };
      }
    });
    return best.count > 0 ? best : { name: habits[0]?.name || 'N/A', count: calculateStreak(habits[0]?.completed || []) };
  }, [habits, currentDayIndex]);

  // Toggle completion checkbox state
  const toggleDay = (habitId: string, dayIndex: number) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const completedCopy = [...h.completed];
        completedCopy[dayIndex] = !completedCopy[dayIndex];
        return { ...h, completed: completedCopy };
      }
      return h;
    });
    saveToStorage(updated);
  };

  // Open add dialog
  const openAddModal = () => {
    setNewHabitName('');
    setNewHabitCategory('Mindfulness');
    setIsAddModalOpen(true);
  };

  // Confirm addition
  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      category: newHabitCategory,
      completed: [false, false, false, false, false, false, false]
    };

    const updated = [...habits, newHabit];
    saveToStorage(updated);
    setIsAddModalOpen(false);
  };

  // Open Edit Dialog
  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setEditHabitName(habit.name);
    setEditHabitCategory(habit.category);
    setIsEditModalOpen(true);
  };

  // Confirm edit modifications
  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingHabit || !editHabitName.trim()) return;

    const updated = habits.map(h => {
      if (h.id === editingHabit.id) {
        return {
          ...h,
          name: editHabitName.trim(),
          category: editHabitCategory
        };
      }
      return h;
    });

    saveToStorage(updated);
    setIsEditModalOpen(false);
    setEditingHabit(null);
  };

  // Remove single habitual row
  const handleDeleteHabit = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this habit?')) {
      const updated = habits.filter(h => h.id !== id);
      saveToStorage(updated);
      if (editingHabit?.id === id) {
        setIsEditModalOpen(false);
        setEditingHabit(null);
      }
    }
  };

  // Hard Reset Week ticks
  const resetAllChecks = () => {
    if (window.confirm('Are you sure you want to reset all completion ticks back to pending for this week?')) {
      const updated = habits.map(h => ({
        ...h,
        completed: [false, false, false, false, false, false, false]
      }));
      saveToStorage(updated);
    }
  };

  // Seed sample database for instant demonstration
  const handleSeedData = () => {
    if (window.confirm('Would you like to seed experimental test data? This will overwrite your current items.')) {
      saveToStorage(DEFAULT_HABITS);
    }
  };

  // Clean export routine formatted in precise high-speed CSV values
  const exportCSV = () => {
    if (habits.length === 0) return;
    const headers = 'Habit,Category,Mon,Tue,Wed,Thu,Fri,Sat,Sun,CurrentStreak,MaxStreak,Progress%\n';
    const rows = habits.map(h => {
      const compStatus = h.completed.map(c => c ? 'Completed' : 'Pending').join(',');
      const count = h.completed.filter(Boolean).length;
      const pct = Math.round((count / 7) * 100);
      const activeStreak = calculateStreak(h.completed);
      const maxStreak = calculateMaxWeeklyStreak(h.completed);
      return `"${h.name}","${h.category}",${compStatus},${activeStreak},${maxStreak},${pct}%`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'atomic_streak_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden antialiased select-none pb-12 selection:bg-[#8378E5]/30 selection:text-white bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-950">
      
      {/* Decorative ambient gradients mirroring the glowing violet-royal blue header circles in the website */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#8378E5]/10 blur-[130px] pointer-events-none z-0"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none z-0"></div>

      <div className="w-full max-w-[1240px] mx-auto p-4 md:p-8 z-10 relative">

        {/* Global Nav Bar Header in custom Minimal Elegance style */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-white/10 pb-6 mb-8 gap-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-gradient-to-br from-[#8378E5] to-[#42C2F1] shadow-[0_0_15px_rgba(131,120,229,0.3)]">
                <Flame className="w-6 h-6 text-slate-950 fill-white" strokeWidth={2.5} />
              </span>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#8378E5] to-[#42C2F1]">
                ATOMIC.STREAK
              </h1>
            </div>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-slate-400 font-bold ml-1 mt-2">
              Premium Performance Logic / Habit Tracker
            </p>
          </div>
          
          <div className="text-left md:text-right flex flex-col">
            <p className="text-lg md:text-xl font-light font-mono text-slate-200 tracking-wide">
              {formattedDate}
            </p>
            <div className="flex items-center gap-2 mt-1 md:justify-end text-xs font-mono text-[#8378E5] tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8378E5] animate-ping"></span>
              Theme: Cozy Cosmic Violet
            </div>
          </div>
        </header>

        {/* Website Style Brand Promo Banner */}
        <div className="bg-gradient-to-r from-[#8378E5]/15 via-indigo-950/40 to-cyan-500/10 border border-indigo-950/60 rounded-3xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-slate-100/5 to-transparent rounded-full -mr-10 -mt-10"></div>
          <div className="flex flex-col max-w-xl">
            <span className="text-[10px] uppercase font-mono bg-[#8378E5]/20 text-[#aca1f7] font-bold px-2.5 py-1 rounded-full w-fit mb-3">
              CONSECUTIVE STREAKS ENABLED
            </span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2 leading-tight">
              Break Bad Habits. Build Great Habits. Daily.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Experience the beautiful card layout designed directly from your mockup aesthetics, with intelligent dynamic consecutive day streak logs updated instantly.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0 justify-start md:justify-end">
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-gradient-to-r from-[#8378E5] to-[#6a5eeb] text-white rounded-xl text-xs font-black font-mono uppercase tracking-widest hover:opacity-90 transform hover:-translate-y-0.5 transition duration-150 shadow-[0_0_15px_rgba(131,120,229,0.4)] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={3} />
              New Habit Protocol
            </button>
            <button
              onClick={handleSeedData}
              className="px-5 py-3 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold font-mono uppercase tracking-wide hover:bg-slate-800 hover:text-white transition duration-150 flex items-center gap-1.5 cursor-pointer"
              title="Bulk preseed application templates"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset To Presets
            </button>
          </div>
        </div>

        {/* Dashboard Stat Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Card 1: Overall completion completion rate gauge */}
          <article className="bg-[#0f1121] border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-[#8378E5]/30 transition duration-300 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Weekly Completion</span>
              <span className="p-1 rounded-lg bg-[#8378E5]/10 text-[#8378E5]">
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-[#8378E5] to-purple-400 tracking-tight">
                {overallCompletionRate}
              </span>
              <span className="text-md text-slate-400 font-mono">% avg</span>
            </div>
            <div className="w-full bg-slate-900/60 h-2 mt-4 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-[#8378E5] to-[#42C2F1] h-full rounded-full transition-all duration-700" 
                style={{ width: `${overallCompletionRate}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 hover:text-slate-300 font-mono">
              Total checkboxes completed: {totalCompletedCount}
            </p>
          </article>

          {/* Card 2: Leaderboard highlight for active streak */}
          <article className="bg-[#0f1121] border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-[#F56F5C]/35 transition duration-300 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Active Streak Champ</span>
              <span className="p-1 rounded-lg bg-[#F56F5C]/10 text-[#F56F5C]">
                <Flame className="w-4 h-4 fill-current animate-pulse" />
              </span>
            </div>
            <div className="mt-1">
              <span className="text-3xl font-black font-mono text-[#F56F5C] mb-1 block tracking-tight">
                {streakLeaderboard.count} {streakLeaderboard.count === 1 ? 'DAY' : 'DAYS'}
              </span>
              <p className="text-xs text-slate-300 font-medium truncate uppercase tracking-tight">
                {streakLeaderboard.name}
              </p>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 font-mono">
              Keep checking consecutive days!
            </p>
          </article>

          {/* Card 3: Specific Today Check List velocity progress */}
          <article className="bg-[#0f1121] border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-[#42C2F1]/30 transition duration-300 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Today ({currentDayLabel.substring(0,3).toUpperCase()}) Protocol</span>
              <span className="p-1 rounded-lg bg-[#42C2F1]/10 text-[#42C2F1]">
                <Check className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-extrabold font-mono text-[#42C2F1]">
                {todayCompletedCount}
              </span>
              <span className="text-md text-slate-400">/ {habits.length} checked</span>
            </div>
            <div className="w-full bg-slate-900/60 h-2 mt-4 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-[#42C2F1] to-teal-400 h-full rounded-full transition-all duration-300" 
                style={{ width: `${habits.length > 0 ? (todayCompletedCount/habits.length)*100 : 0}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 font-mono">
              {todayCompletedCount === habits.length && habits.length > 0 ? '✓ All daily habits secure!' : 'Unfinished checkboxes today'}
            </p>
          </article>

          {/* Card 4: Categories Count Badge */}
          <article className="bg-[#0f1121] border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-[#eab308]/30 transition duration-300 flex flex-col justify-between shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Category Audit</span>
              <span className="p-1 rounded-lg bg-[#eab308]/10 text-[#eab308]">
                <LayoutGrid className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2">
              <span className="text-3xl font-extrabold font-mono text-[#eab308]">
                {PRESET_CATEGORIES.length}
              </span>
              <span className="text-xs text-slate-400 uppercase tracking-wider block mt-1 font-mono">
                System classifications
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-3 font-mono">
              Health, Work, Mindfulness, Fitness...
            </p>
          </article>

        </section>

        {/* Categories filtration tabs and search controller bar */}
        <section className="bg-[#0f1121] border border-white/5 rounded-2xl p-4 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-md">
          
          {/* Left Side: Filter button pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-mono font-bold mr-2 hidden sm:inline">
              Category:
            </span>
            <button 
              onClick={() => setSelectedCategoryFilter('All')}
              className={`px-3 py-1.5 rounded-xl text-xs uppercase font-mono tracking-wider font-bold transition duration-150 cursor-pointer ${
                selectedCategoryFilter === 'All'
                  ? 'bg-[#8378E5] text-white shadow-[0_0_12px_rgba(131,120,229,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({habits.length})
            </button>
            {PRESET_CATEGORIES.map(category => {
              const count = habits.filter(h => h.category === category).length;
              const catTheme = getCategoryStyles(category);
              const isSelected = selectedCategoryFilter === category;
              return (
                <button 
                  key={category}
                  onClick={() => setSelectedCategoryFilter(category)}
                  className={`px-3 py-1.5 rounded-xl text-xs uppercase font-mono tracking-wider font-bold transition duration-110 cursor-pointer ${
                    isSelected
                      ? `${catTheme.bg} ${catTheme.textColor} ${catTheme.glow}`
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>

          {/* Right Side: Search state & Views list toggle switcher */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-auto">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search habits..."
                className="w-full sm:w-56 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#8378E5]/50 transition font-mono"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Layout Mode Toggles */}
            <div className="flex bg-slate-950 rounded-xl p-1 border border-white/5 self-end">
              <button 
                onClick={() => setLayoutMode('deck')}
                className={`px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-bold font-mono transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  layoutMode === 'deck'
                    ? 'bg-[#8378E5] text-white shadow-[0_0_8px_rgba(131,120,229,0.3)]'
                    : 'text-slate-400 hover:text-[#8378E5]'
                }`}
                title="Sleek responsive deck inspired by mobile mockup screenshots"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Aesthetic Deck
              </button>
              <button 
                onClick={() => setLayoutMode('spreadsheet')}
                className={`px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-wider font-bold font-mono transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  layoutMode === 'spreadsheet'
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(66,194,241,0.3)]'
                    : 'text-slate-400 hover:text-cyan-400'
                }`}
                title="Traditional multi-column spreadsheet grid layout"
              >
                <Grid className="w-3.5 h-3.5" />
                Spreadsheet Protocol
              </button>
            </div>

          </div>

        </section>

        {/* Primary Viewports */}
        <section className="min-h-[350px]">
          
          {layoutMode === 'deck' ? (
            
            /* AESTHETIC DECK VIEW - STYLED DIRECTLY AFTER SPECIFIED WEBSITE PREVIEWS & MOBILE SCROLLS IN PICTURE */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {filteredHabits.length === 0 ? (
                <div className="col-span-1 md:col-span-2 bg-[#0f1121] border border-white/5 rounded-3xl py-16 px-4 text-center">
                  <LayoutGrid className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-300">No habit routines matched</h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">
                    Create a new habit or change the filter options above to populate the screen
                  </p>
                </div>
              ) : (
                filteredHabits.map((habit) => {
                  const compCount = habit.completed.filter(Boolean).length;
                  const progressPct = Math.round((compCount / 7) * 100);
                  const activeStreak = calculateStreak(habit.completed);
                  const catTheme = getCategoryStyles(habit.category);

                  return (
                    <article 
                      key={habit.id}
                      className="bg-[#0f1121] border border-white/5 rounded-3xl p-4 flex flex-col justify-between group hover:border-white/10 transition-all duration-300 hover:shadow-[0_4px_25px_rgba(0,0,0,0.3)] relative overflow-hidden"
                    >
                      {/* Interactive Edit shortcut pill */}
                      <button 
                        onClick={() => openEditModal(habit)}
                        className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
                        title="Edit name, class category or delete"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Header block with category badge metadata */}
                      <div className="flex items-center gap-2 mb-4 pr-8">
                        <span className={`text-[10px] font-bold uppercase tracking-wider font-mono px-2.5 py-1 rounded-full ${catTheme.badge}`}>
                          {habit.category.toUpperCase()}
                        </span>
                        
                        {activeStreak > 0 ? (
                          <span className="flex items-center gap-1.5 text-[10px] uppercase font-mono font-extrabold text-[#F56F5C] bg-[#F56F5C]/10 border border-[#F56F5C]/20 px-2.5 py-1 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,111,92,0.15)]">
                            <Flame className="w-3 h-3 fill-current" />
                            {activeStreak} Day streak
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest py-1 px-2.5 bg-slate-900/60 border border-white/5 rounded-full">
                            Streak pending
                          </span>
                        )}
                      </div>

                      {/* Middle Card: Responsive Block exactly reflecting the screenshot aesthetic! */}
                      {/* Left side is an elegant rounded background progress block, right side are check dots */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-slate-950 p-4 rounded-2xl border border-white/5 mb-4">
                        
                        {/* Custom visual component on left (glowing colored panel with progress, title) */}
                        <div 
                          onClick={() => openEditModal(habit)}
                          className={`sm:col-span-5 p-3.5 rounded-xl cursor-pointer ${catTheme.gradient} ${catTheme.glow} ${catTheme.textColor} flex flex-col justify-between min-h-[90px] relative transition hover:opacity-95`}
                        >
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-xl font-black font-mono tracking-tighter">
                              {progressPct}%
                            </span>
                            <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">
                              Week score
                            </span>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="text-sm font-bold tracking-tight leading-tight uppercase truncate">
                              {habit.name}
                            </h4>
                          </div>
                        </div>

                        {/* Interactive checkboxes layout sequence Mon -> Sun directly on card right side */}
                        <div className="sm:col-span-7 flex flex-col justify-center">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-center sm:text-left">
                            Protocol Logs (M T W T F S S)
                          </p>
                          
                          <div className="flex justify-between items-center px-1">
                            {weekDays.map((day, idx) => {
                              const isChecked = habit.completed[idx];
                              const isToday = idx === currentDayIndex;
                              return (
                                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                                  <span className={`text-[8px] font-bold font-mono uppercase tracking-tighter ${isChecked ? catTheme.text : isToday ? 'text-[#8378E5]' : 'text-slate-600'}`}>
                                    {day.name.substring(0, 1)}
                                  </span>
                                  <button
                                    onClick={() => toggleDay(habit.id, idx)}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer ${
                                      isChecked
                                        ? `${catTheme.bg} ${catTheme.textColor} ${catTheme.glow} hover:opacity-90`
                                        : isToday
                                          ? 'border border-[#8378E5]/50 bg-[#8378E5]/10 text-[#8378E5] hover:bg-[#8378E5]/20'
                                          : 'border border-slate-800 bg-slate-900/60 hover:border-slate-600 text-transparent'
                                    }`}
                                    title={`Click to register completion logs for ${day.labelLong}`}
                                  >
                                    {isChecked ? (
                                      <span className="text-xs font-black">✓</span>
                                    ) : (
                                      <span className="text-[14px] font-light text-slate-700">○</span>
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                      {/* Card Footer: Metadata info block metrics */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5 font-mono">
                        <span>Max weekly: {calculateMaxWeeklyStreak(habit.completed)} days max</span>
                        <span className="uppercase text-slate-400">ID: #{habit.id.slice(-5)}</span>
                      </div>

                    </article>
                  );
                })
              )}

            </div>

          ) : (
            
            /* TRADITIONAL MULTI-COLUMN SPREADSHEET PROTOCOL GRID LAYOUT */
            <div className="bg-[#0f1121] rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl">
              
              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="border-b border-indigo-950 bg-slate-950/60 select-none">
                      <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 w-72">
                        Habit Protocol / Category
                      </th>
                      
                      {weekDays.map((day, idx) => {
                        const isToday = idx === currentDayIndex;
                        return (
                          <th key={idx} className="p-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">
                            <span className={isToday ? 'text-[#8378E5] font-black underline decoration-2 underline-offset-4' : ''}>
                              {day.name.toUpperCase()} {day.dateNum}
                            </span>
                          </th>
                        );
                      })}
                      
                      <th className="p-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 w-32 font-mono">
                        Active Streak
                      </th>
                      
                      <th className="p-5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 w-32 font-mono">
                        Score
                      </th>

                      <th className="p-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 w-28">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-white/5 bg-slate-950/20">
                    {filteredHabits.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-20 text-center">
                          <LayoutGrid className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-slate-300">No habit routines registered</h3>
                          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">
                            Create your custom habits and select categories to fill your dashboard
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredHabits.map((habit, index) => {
                        const completedCount = habit.completed.filter(Boolean).length;
                        const progressPct = Math.round((completedCount / 7) * 100);
                        const activeStreak = calculateStreak(habit.completed);
                        const catTheme = getCategoryStyles(habit.category);

                        return (
                          <tr 
                            key={habit.id} 
                            className={`hover:bg-indigo-950/15 transition-colors duration-150 ${index % 2 === 1 ? 'bg-white/[0.01]' : ''}`}
                          >
                            {/* Habit Info Column */}
                            <td className="p-5">
                              <div className="flex flex-col min-w-0 pr-4">
                                <h4 
                                  onClick={() => openEditModal(habit)}
                                  className="text-sm font-bold text-slate-100 hover:text-[#8378E5] truncate cursor-pointer transition flex items-center gap-1.5"
                                  title="Click to quickly modify title or details"
                                >
                                  {habit.name}
                                </h4>
                                
                                <span className={`text-[9px] uppercase tracking-wider mt-1 w-fit px-1.5 py-0.5 rounded font-mono font-medium ${catTheme.badge}`}>
                                  {habit.category}
                                </span>
                              </div>
                            </td>

                            {/* Cheeky checklists cells Mon to Sun */}
                            {Array.from({ length: 7 }).map((_, idx) => {
                              const isChecked = habit.completed[idx];
                              return (
                                <td key={idx} className="p-4 text-center">
                                  <button 
                                    onClick={() => toggleDay(habit.id, idx)}
                                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer mx-auto ${
                                      isChecked
                                        ? `${catTheme.bg} ${catTheme.glow} ${catTheme.textColor} font-bold text-xs`
                                        : 'border border-slate-800 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-800/80 text-transparent'
                                    }`}
                                  >
                                    {isChecked ? (
                                      <span className="text-[10px]">✓</span>
                                    ) : (
                                      <span className="text-[14px] text-slate-800 font-light">○</span>
                                    )}
                                  </button>
                                </td>
                              );
                            })}

                            {/* Active Streak Tracker badge cell */}
                            <td className="p-5 text-center font-mono">
                              {activeStreak > 0 ? (
                                <div className="inline-flex items-center gap-1 text-xs font-black text-[#F56F5C] bg-[#F56F5C]/10 border border-[#F56F5C]/20 px-2 rounded-lg py-1">
                                  <Flame className="w-3.5 h-3.5 fill-current" />
                                  <span>{activeStreak}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-600 font-mono">0d</span>
                              )}
                            </td>

                            {/* Score percent cell */}
                            <td className="p-5 text-center font-mono text-xs font-bold">
                              <span className={progressPct >= 70 ? 'text-emerald-400' : progressPct >= 40 ? 'text-[#eab308]' : 'text-slate-500'}>
                                {progressPct}%
                              </span>
                            </td>

                            {/* Row specific Action controllers */}
                            <td className="p-5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  onClick={() => openEditModal(habit)}
                                  className="p-2 rounded-lg text-slate-500 hover:text-[#8378E5] hover:bg-slate-900 transition duration-150 cursor-pointer"
                                  title="Edit title & category"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                
                                <button 
                                  onClick={() => handleDeleteHabit(habit.id)}
                                  className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition duration-150 cursor-pointer"
                                  title="Delete Habit"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Spreadsheat summary footer bar */}
              <div className="bg-slate-950 p-4 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
                <p className="text-[10px] text-slate-500 font-mono">
                  Rows populated in layout filter: {filteredHabits.length} of {habits.length}
                </p>
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-mono">
                  <span>✓ Complete</span>
                  <span>○ Pending / Target Unfilled</span>
                </div>
              </div>

            </div>
          )}

        </section>

        {/* Global Control Utility Box */}
        <section className="mt-8 bg-[#0f1121] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#8378E5]" />
              Data Persistence Cockpit
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              All transactions are calculated reactively and preserved securely inside your sandboxed browser Local Client storage. Export to standard analytics CSV formats seamlessly anytime.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0 w-full md:w-auto">
            <button 
              onClick={exportCSV} 
              disabled={habits.length === 0}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition duration-150 border ${
                habits.length === 0 
                  ? 'border-white/5 text-slate-600 cursor-not-allowed bg-transparent' 
                  : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 hover:text-[#8378E5] cursor-pointer'
              }`}
            >
              <Download className="w-4 h-4" />
              Export Session CSV
            </button>
            <button 
              onClick={resetAllChecks}
              disabled={habits.length === 0}
              className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-transparent hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
            >
              Reset Week Checks
            </button>
          </div>
        </section>

      </div>

      {/* MODAL 1: CREATE NEW HABIT DIALOG */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition duration-150">
          <div 
            className="bg-[#0f1121] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transition duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header decor block matching selected new category theme */}
            <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#8378E5]/10 text-[#8378E5]">
                  <Plus className="w-5 h-5" strokeWidth={2.5} />
                </span>
                <h2 className="text-lg font-bold font-mono text-white uppercase tracking-tight">New Habit Protocol</h2>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-900 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              
              {/* Field 1: Habit Title Name */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">
                  Habit Title Name
                </label>
                <input 
                  type="text" 
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Deep Work Protocol, HIIT Conditioning"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-[#8378E5]/50 focus:ring-1 focus:ring-[#8378E5]/50 transition font-mono font-bold"
                  autoFocus
                />
              </div>

              {/* Field 2: Assign System Class Category */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 font-mono">
                  System Class Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_CATEGORIES.map(category => {
                    const isSelected = newHabitCategory === category;
                    const style = getCategoryStyles(category);
                    return (
                      <button 
                        type="button"
                        key={category}
                        onClick={() => setNewHabitCategory(category)}
                        className={`px-3 py-2.5 text-xs font-mono font-bold rounded-xl border text-left transition-all duration-110 cursor-pointer uppercase ${
                          isSelected
                            ? `${style.bg} ${style.textColor} ${style.glow} border-transparent`
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subtle Info Label */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 text-[11px] text-slate-400 leading-normal flex items-start gap-2 select-none">
                <Info className="w-4 h-4 text-[#8378E5] shrink-0 mt-0.5" />
                <span>
                  Habits will initialize on a weekly framework (Mon-Sun). Consecutive streaks will automatically calculate live on local modifications.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs font-mono uppercase tracking-widest py-3.5 rounded-xl cursor-pointer transition duration-150"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#8378E5] to-[#6a5eeb] hover:opacity-90 text-white font-black text-xs font-mono uppercase tracking-widest py-3.5 rounded-xl cursor-pointer transition duration-150 shadow-[0_4px_12px_rgba(131,120,229,0.35)]"
                >
                  Create Habit
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT EXISTING HABIT DIALOG & PROTOCOL DETAILS (WITH CATEGORY AND REMOVAL CONTROL) */}
      {isEditModalOpen && editingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition duration-150">
          <div 
            className="bg-[#0f1121] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-400/10 text-cyan-400">
                  <Edit2 className="w-5 h-5" />
                </span>
                <h2 className="text-lg font-bold font-mono text-white uppercase tracking-tight">Edit Habit Protocol</h2>
              </div>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingHabit(null);
                }}
                className="p-1.5 rounded-xl text-slate-500 hover:text-white hover:bg-slate-900 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              
              {/* Habit Title Name */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-mono">
                  Modify Habit Title Name
                </label>
                <input 
                  type="text" 
                  value={editHabitName}
                  onChange={(e) => setEditHabitName(e.target.value)}
                  placeholder="Reset title name..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition font-mono font-bold"
                  autoFocus
                />
              </div>

              {/* Assign System Class Category */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 font-mono">
                  Update System Category Class
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_CATEGORIES.map(category => {
                    const isSelected = editHabitCategory === category;
                    const style = getCategoryStyles(category);
                    return (
                      <button 
                        type="button"
                        key={category}
                        onClick={() => setEditHabitCategory(category)}
                        className={`px-3 py-2.5 text-xs font-mono font-bold rounded-xl border text-left transition-all duration-110 cursor-pointer uppercase ${
                          isSelected
                            ? `${style.bg} ${style.textColor} ${style.glow} border-transparent`
                            : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Week progress preview stats */}
              <div className="bg-slate-950 border border-white/5 rounded-xl p-4 space-y-2 select-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                  Current Week Overview
                </p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Checked Days:</span>
                  <span className="font-mono text-white font-bold">{editingHabit.completed.filter(Boolean).length} / 7 days</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Active Live Streak:</span>
                  <span className="font-mono text-[#F56F5C] font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    {calculateStreak(editingHabit.completed)} days consecutive
                  </span>
                </div>
              </div>

              {/* Danger Zone Removal Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteHabit(editingHabit.id)}
                  className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/35 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Permanently Delete Habit Protocol
                </button>
              </div>

              {/* Submit / Cancel editing */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingHabit(null);
                  }}
                  className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs font-mono uppercase tracking-widest py-3.5 rounded-xl cursor-pointer transition duration-150"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#42C2F1] to-cyan-500 hover:opacity-90 text-slate-950 font-black text-xs font-mono uppercase tracking-widest py-3.5 rounded-xl cursor-pointer transition duration-150 shadow-[0_4px_12px_rgba(66,194,241,0.25)]"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
