export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "completed" | "archived";

export type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  category_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Subtask = {
  id: string;
  user_id: string;
  task_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
};

export type Tag = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export type TaskTag = {
  task_id: string;
  tag_id: string;
  user_id: string;
  created_at: string;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  task_id: string | null;
  action: string;
  metadata: Json;
  timestamp: string;
};

export type TaskWithDetails = Task & {
  category?: Category | null;
  subtasks: Subtask[];
  tags: Tag[];
};

export type DashboardStats = {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  archived: number;
  productivity: number;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<UserProfile, "id" | "created_at">>;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Category, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      tasks: {
        Row: Task;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          priority?: TaskPriority;
          status?: TaskStatus;
          due_date?: string | null;
          completed?: boolean;
          completed_at?: string | null;
          category_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Task, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      subtasks: {
        Row: Subtask;
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          title: string;
          completed?: boolean;
          position?: number;
          created_at?: string;
        };
        Update: Partial<Omit<Subtask, "id" | "user_id" | "task_id" | "created_at">>;
        Relationships: [];
      };
      tags: {
        Row: Tag;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Tag, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      task_tags: {
        Row: TaskTag;
        Insert: {
          task_id: string;
          tag_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<Omit<TaskTag, "task_id" | "tag_id" | "user_id">>;
        Relationships: [];
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          action: string;
          metadata?: Json;
          timestamp?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      task_priority: TaskPriority;
      task_status: TaskStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
