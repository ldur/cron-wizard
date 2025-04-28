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
    timeZone: setting.time_zone || 'UTC',
    timeZoneDescription: setting.time_zone_decription,
  }));
};

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

  return {
    id: data.id,
    name: data.name,
    iacDescription: data.iac_description,
    iacCode: data.iac_code,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    timeZone: data.time_zone || 'UTC',
    timeZoneDescription: data.time_zone_decription,
  };
};

export const createSetting = async (setting: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>): Promise<Settings> => {
  const { data, error } = await supabase
    .from('settings')
    .insert({
      name: setting.name,
      iac_description: setting.iacDescription,
      iac_code: setting.iacCode || null,
      time_zone: setting.timeZone,
      time_zone_decription: setting.timeZoneDescription,
    })
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

export const updateSetting = async (
  id: string, 
  setting: Partial<Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<{ data: Settings; updated: boolean }> => {
  console.log('Updating setting with ID:', id);
  console.log('Update data:', setting);
  
  try {
    // Create a properly formatted update object that matches the database schema
    const updateData: Record<string, any> = {};
    
    if (setting.name !== undefined) updateData.name = setting.name;
    if (setting.iacDescription !== undefined) updateData.iac_description = setting.iacDescription;
    if (setting.iacCode !== undefined) updateData.iac_code = setting.iacCode; // Allow null values
    if (setting.timeZone !== undefined) updateData.time_zone = setting.timeZone;
    if (setting.timeZoneDescription !== undefined) updateData.time_zone_description = setting.timeZoneDescription; // Fixed typo
    
    console.log('Final update data being sent to Supabase:', updateData);
    
    // Ensure the updateData object is not empty
    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields provided for update');
    }
    
    // Check if the record exists first
    const { data: existingData, error: checkError } = await supabase
      .from('settings')
      .select('id')
      .eq('id', id)
      .single();
      
    if (checkError) {
      console.error('Setting not found for update:', id, checkError);
      return await fetchCurrentSettingData(id);
    }
    
    // If we found the record, proceed with update
    if (existingData) {
      const { data, error } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating setting:', error);
        return await fetchCurrentSettingData(id);
      }

      if (!data) {
        console.error('No data returned when updating setting', id);
        return await fetchCurrentSettingData(id);
      }

      // Successful update
      return {
        data: mapToSettingsModel(data),
        updated: true
      };
    } else {
      console.error('Setting not found:', id);
      return await fetchCurrentSettingData(id);
    }
  } catch (error) {
    console.error('Caught error during update:', error);
    return await fetchCurrentSettingData(id);
  }
};

// Helper function to fetch current setting data when update fails
async function fetchCurrentSettingData(id: string): Promise<{ data: Settings; updated: false }> {
  try {
    const { data: currentData, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching current setting data:', fetchError);
      throw fetchError;
    }
    
    if (!currentData) {
      throw new Error(`Setting with ID ${id} not found`);
    }
    
    return {
      data: mapToSettingsModel(currentData),
      updated: false
    };
  } catch (error) {
    console.error('Error retrieving current setting data:', error);
    throw new Error(`Failed to retrieve setting with ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to map database record to Settings model
function mapToSettingsModel(data: any): Settings {
  return {
    id: data.id,
    name: data.name,
    iacDescription: data.iac_description,
    iacCode: data.iac_code, // This can be null based on DB schema
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    timeZone: data.time_zone || 'UTC',
    timeZoneDescription: data.time_zone_decription,
  };
}

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
