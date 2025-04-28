
import { supabase } from '@/lib/supabase';
import type { Settings } from '@/types/Settings';

// Get all settings
export const fetchSettings = async (): Promise<Settings[]> => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }

  return data.map(mapToSettingsModel);
};

// Get a single setting by ID
export const fetchSetting = async (id: string): Promise<Settings> => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching setting:', error);
    throw error;
  }

  if (!data) {
    throw new Error(`Setting with ID ${id} not found`);
  }

  return mapToSettingsModel(data);
};

// Create a new setting
export const createSetting = async (setting: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>): Promise<Settings> => {
  // Map from our client model to database schema
  const dbSetting = {
    name: setting.name,
    iac_description: setting.iacDescription,
    iac_code: setting.iacCode || null,
    time_zone: setting.timeZone,
    time_zone_description: setting.timeZoneDescription
  };

  const { data, error } = await supabase
    .from('settings')
    .insert(dbSetting)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating setting:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Failed to create setting: No data returned');
  }

  return mapToSettingsModel(data);
};

// Update an existing setting
export const updateSetting = async (
  id: string, 
  setting: Partial<Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Settings> => {
  // Only include fields that are actually defined
  const updateData: Record<string, any> = {};

  if (setting.name !== undefined) updateData.name = setting.name;
  if (setting.iacDescription !== undefined) updateData.iac_description = setting.iacDescription;
  // Handle iacCode specially to ensure null is properly sent when empty
  if (setting.iacCode !== undefined) updateData.iac_code = setting.iacCode || null;
  if (setting.timeZone !== undefined) updateData.time_zone = setting.timeZone;
  if (setting.timeZoneDescription !== undefined) updateData.time_zone_description = setting.timeZoneDescription;

  console.log('Updating setting with data:', updateData);

  const { data, error } = await supabase
    .from('settings')
    .update(updateData)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating setting:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Failed to update setting: No data returned');
  }

  return mapToSettingsModel(data);
};

// Delete a setting
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

// Helper function to map database record to Settings model
function mapToSettingsModel(data: any): Settings {
  return {
    id: data.id,
    name: data.name,
    iacDescription: data.iac_description,
    iacCode: data.iac_code,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    timeZone: data.time_zone || 'UTC',
    timeZoneDescription: data.time_zone_description || data.time_zone_decription // Handle both spellings
  };
}
