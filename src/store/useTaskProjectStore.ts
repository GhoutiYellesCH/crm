import { create } from "zustand";
import {
  fetchProjects,
  fetchProjectById,
  saveProject,
  deleteProject,
  toggleProjectChecklistItem,
  fetchTasks,
  saveTask,
  updateTaskStatus,
  deleteTask,
  fetchUsers,
  type ProjectWithDetails,
  type TaskWithDetails,
  type UpsertProjectInput,
  type UpsertTaskInput,
} from "@/services/taskService";
import type { User } from "@/db/schema";

interface TaskProjectState {
  projects: ProjectWithDetails[];
  selectedProject: ProjectWithDetails | null;
  tasks: TaskWithDetails[];
  users: User[];
  isLoading: boolean;
  filterPriority: string;
  filterAssignee: string;
  filterProject: string;

  loadData: () => Promise<void>;
  selectProject: (id: string | null) => Promise<void>;
  saveProjectData: (input: UpsertProjectInput) => Promise<string>;
  removeProject: (id: string) => Promise<void>;
  toggleChecklist: (projectId: string, itemId: string) => Promise<void>;

  saveTaskData: (input: UpsertTaskInput) => Promise<string>;
  changeTaskStatus: (taskId: string, status: string) => Promise<void>;
  removeTask: (id: string) => Promise<void>;

  setFilterPriority: (priority: string) => void;
  setFilterAssignee: (assignee: string) => void;
  setFilterProject: (project: string) => void;
}

export const useTaskProjectStore = create<TaskProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  tasks: [],
  users: [],
  isLoading: false,
  filterPriority: "all",
  filterAssignee: "all",
  filterProject: "all",

  loadData: async () => {
    set({ isLoading: true });
    try {
      const [projects, tasks, users] = await Promise.all([
        fetchProjects(),
        fetchTasks(),
        fetchUsers(),
      ]);
      set({ projects, tasks, users });
    } catch (err) {
      console.error("[useTaskProjectStore] loadData error:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  selectProject: async (id: string | null) => {
    if (!id) {
      set({ selectedProject: null });
      return;
    }
    try {
      const proj = await fetchProjectById(id);
      set({ selectedProject: proj });
    } catch (err) {
      console.error("[useTaskProjectStore] selectProject error:", err);
    }
  },

  saveProjectData: async (input: UpsertProjectInput) => {
    const id = await saveProject(input);
    await get().loadData();
    if (get().selectedProject?.id === id) {
      await get().selectProject(id);
    }
    return id;
  },

  removeProject: async (id: string) => {
    await deleteProject(id);
    if (get().selectedProject?.id === id) {
      set({ selectedProject: null });
    }
    await get().loadData();
  },

  toggleChecklist: async (projectId: string, itemId: string) => {
    await toggleProjectChecklistItem(projectId, itemId);
    if (get().selectedProject?.id === projectId) {
      await get().selectProject(projectId);
    }
    await get().loadData();
  },

  saveTaskData: async (input: UpsertTaskInput) => {
    const id = await saveTask(input);
    await get().loadData();
    return id;
  },

  changeTaskStatus: async (taskId: string, status: string) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status } : t
      ),
    }));
    await updateTaskStatus(taskId, status);
    await get().loadData();
  },

  removeTask: async (id: string) => {
    await deleteTask(id);
    await get().loadData();
  },

  setFilterPriority: (filterPriority) => set({ filterPriority }),
  setFilterAssignee: (filterAssignee) => set({ filterAssignee }),
  setFilterProject: (filterProject) => set({ filterProject }),
}));
