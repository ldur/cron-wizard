
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type ScheduleGroup = Database['public']['Tables']['schedule_groups']['Row'];
export type ScheduleGroupInsert = Database['public']['Tables']['schedule_groups']['Insert'];
export type ScheduleGroupUpdate = Database['public']['Tables']['schedule_groups']['Update'];

export const fetchScheduleGroups = async (): Promise<ScheduleGroup[]> => {
  const { data, error } = await supabase
    .from('schedule_groups')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching schedule groups:', error);
    throw error;
  }

  return data || [];
};

export const createScheduleGroup = async (group: ScheduleGroupInsert): Promise<ScheduleGroup> => {
  const { data, error } = await supabase
    .from('schedule_groups')
    .insert(group)
    .select()
    .single();

  if (error) {
    console.error('Error creating schedule group:', error);
    throw error;
  }

  return data;
};

export const updateScheduleGroup = async (id: string, group: ScheduleGroupUpdate): Promise<ScheduleGroup> => {
  const { data, error } = await supabase
    .from('schedule_groups')
    .update(group)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating schedule group:', error);
    throw error;
  }

  return data;
};

export const deleteScheduleGroup = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('schedule_groups')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting schedule group:', error);
    throw error;
  }
};
