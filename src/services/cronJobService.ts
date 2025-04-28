import { supabase } from "@/integrations/supabase/client";
import { CronJob } from "@/types/CronJob";

export const fetchCronJobs = async (): Promise<CronJob[]> => {
  try {
    const { data: jobsData, error: jobsError } = await supabase
      .from('cron_jobs')
      .select('*');

    if (jobsError) throw jobsError;

    // Get all groups to map IDs to names and icons
    const { data: groupsData, error: groupsError } = await supabase
      .from('schedule_groups')
      .select('*');

    if (groupsError) throw groupsError;

    // Create a map of group IDs to names and icons
    const groupMap = new Map();
    groupsData.forEach((group: any) => {
      groupMap.set(group.id, { 
        name: group.name,
        icon_name: group.icon_name 
      });
    });

    // Map the data to CronJob type and add group names and icons
    const jobs = jobsData.map((job: any) => {
      const groupInfo = job.group_id ? groupMap.get(job.group_id) : { name: 'Default', icon_name: 'briefcase' };
      return {
        ...job,
        groupName: groupInfo ? groupInfo.name : 'Default',
        groupIcon: groupInfo ? groupInfo.icon_name : 'briefcase',
        tags: job.tags || [],
      };
    });

    return jobs;
  } catch (error) {
    console.error('Error fetching cron jobs:', error);
    throw error;
  }
};

export const createCronJob = async (job: Omit<CronJob, 'id' | 'nextRun'>): Promise<CronJob> => {
  try {
    const { data, error } = await supabase
      .from('cron_jobs')
      .insert([
        { 
          ...job,
          tags: job.tags || [],
        }
      ])
      .select('*')
      .single();

    if (error) throw error;
    return data as CronJob;
  } catch (error) {
    console.error('Error creating cron job:', error);
    throw error;
  }
};

export const updateCronJob = async (id: string, job: Partial<Omit<CronJob, 'id' | 'nextRun'>>): Promise<CronJob> => {
  try {
    const { data, error } = await supabase
      .from('cron_jobs')
      .update(job)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as CronJob;
  } catch (error) {
    console.error('Error updating cron job:', error);
    throw error;
  }
};

export const deleteCronJob = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('cron_jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting cron job:', error);
    throw error;
  }
};

export const toggleCronJobStatus = async (id: string, status: 'active' | 'paused'): Promise<CronJob> => {
  try {
    const { data, error } = await supabase
      .from('cron_jobs')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data as CronJob;
  } catch (error) {
    console.error('Error toggling cron job status:', error);
    throw error;
  }
};

export const fetchGroups = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('schedule_groups')
      .select('*');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

export const createGroup = async (name: string, iconName: string = 'folder'): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('schedule_groups')
      .insert([{ name, icon_name: iconName }])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const updateGroup = async (id: string, name: string, iconName: string): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('schedule_groups')
      .update({ name, icon_name: iconName })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

export const deleteGroup = async (id: string): Promise<void> => {
  try {
    // First, move all jobs from the deleting group to the Default group
    const { data: defaultGroup, error: defaultGroupError } = await supabase
      .from('schedule_groups')
      .select('id')
      .eq('name', 'Default')
      .single();

    if (defaultGroupError) {
      console.error('Error fetching Default group:', defaultGroupError);
      throw defaultGroupError;
    }

    if (!defaultGroup) {
      throw new Error('Default group not found');
    }

    const { error: updateError } = await supabase
      .from('cron_jobs')
      .update({ group_id: defaultGroup.id })
      .eq('group_id', id);

    if (updateError) {
      console.error('Error moving jobs to Default group:', updateError);
      throw updateError;
    }

    // Then, delete the group
    const { error: deleteError } = await supabase
      .from('schedule_groups')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting group:', deleteError);
      throw deleteError;
    }
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};
