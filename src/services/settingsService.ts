
import { supabase } from '@/lib/supabase';
import type { Settings } from '@/types/Settings';

export const fetchSettings = async (): Promise<Settings[]> => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }

  return data.map((setting) => ({
    id: setting.id,
    name: setting.name,
    iacDescription: setting.iac_description,
    iacCode: setting.iac_code,
    createdAt: setting.created_at,
    updatedAt: setting.updated_at,
  }));
};

export const fetchSetting = async (id: string): Promise<Settings> => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching setting:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    iacDescription: data.iac_description,
    iacCode: data.iac_code,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const createSetting = async (setting: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>): Promise<Settings> => {
  const { data, error } = await supabase
    .from('settings')
    .insert({
      name: setting.name,
      iac_description: setting.iacDescription,
      iac_code: setting.iacCode,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating setting:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    iacDescription: data.iac_description,
    iacCode: data.iac_code,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const updateSetting = async (id: string, setting: Partial<Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Settings> => {
  const updateData: Record<string, any> = {};
  
  if (setting.name !== undefined) updateData.name = setting.name;
  if (setting.iacDescription !== undefined) updateData.iac_description = setting.iacDescription;
  if (setting.iacCode !== undefined) updateData.iac_code = setting.iacCode;
  
  const { data, error } = await supabase
    .from('settings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating setting:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    iacDescription: data.iac_description,
    iacCode: data.iac_code,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const deleteSetting = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('settings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting setting:', error);
    throw error;
  }
};
