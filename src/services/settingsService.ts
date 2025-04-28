
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
      iac_code: setting.iacCode,
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

export const updateSetting = async (
  id: string, 
  setting: Partial<Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<{ data: Settings; updated: boolean }> => {
  // Create a properly formatted update object that matches the database schema
  const updateData: Record<string, any> = {};
  
  if (setting.name !== undefined) updateData.name = setting.name;
  if (setting.iacDescription !== undefined) updateData.iac_description = setting.iacDescription;
  if (setting.iacCode !== undefined) updateData.iac_code = setting.iacCode;
  if (setting.timeZone !== undefined) updateData.time_zone = setting.timeZone;
  if (setting.timeZoneDescription !== undefined) updateData.time_zone_decription = setting.timeZoneDescription;
  
  console.log('Update data being sent to Supabase:', updateData);
  
  // First check if the setting exists
  const { data: existingData, error: checkError } = await supabase
    .from('settings')
    .select('id')
    .eq('id', id)
    .maybeSingle();
    
  if (checkError) {
    console.error('Error checking if setting exists:', checkError);
    throw checkError;
  }
  
  if (!existingData) {
    console.error('Setting not found:', id);
    throw new Error(`Setting with ID ${id} not found`);
  }
  
  try {
    // Perform the update with explicit fields
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
      console.error(`No data returned when updating setting ${id}. Fetching current data.`);
      
      // If no data was returned from the update, fetch the current state
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
        throw new Error(`Setting with ID ${id} not found after update attempt`);
      }
      
      console.log('Retrieved current setting data after update:', currentData);
      return {
        data: {
          id: currentData.id,
          name: currentData.name,
          iacDescription: currentData.iac_description,
          iacCode: currentData.iac_code,
          createdAt: currentData.created_at,
          updatedAt: currentData.updated_at,
          timeZone: currentData.time_zone || 'UTC',
          timeZoneDescription: currentData.time_zone_decription,
        },
        updated: false // Indicate that the actual update failed
      };
    }

    return {
      data: {
        id: data.id,
        name: data.name,
        iacDescription: data.iac_description,
        iacCode: data.iac_code,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        timeZone: data.time_zone || 'UTC',
        timeZoneDescription: data.time_zone_decription,
      },
      updated: true // Indicate successful update
    };
  } catch (error) {
    console.error('Caught error during update:', error);
    
    // If the update fails, fetch the current state of the setting
    const { data: currentData, error: fetchError } = await supabase
      .from('settings')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching current setting after error:', fetchError);
      throw fetchError;
    }
    
    if (currentData) {
      console.log('Retrieved current setting data:', currentData);
      return {
        data: {
          id: currentData.id,
          name: currentData.name,
          iacDescription: currentData.iac_description,
          iacCode: currentData.iac_code,
          createdAt: currentData.created_at,
          updatedAt: currentData.updated_at,
          timeZone: currentData.time_zone || 'UTC',
          timeZoneDescription: currentData.time_zone_decription,
        },
        updated: false // Indicate that the update failed
      };
    }
    
    // If we can't get the current data either, re-throw the original error
    throw error;
  }
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
