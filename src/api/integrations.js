import { supabase } from '@/lib/supabase';

// Core integrations using Supabase Edge Functions

export const Core = {
  async invokeLLM(model, messages, options = {}) {
    const { data, error } = await supabase.functions.invoke('invoke-llm', {
      body: { model, messages, ...options }
    });
    
    if (error) throw error;
    return data;
  },

  async sendEmail(to, subject, body, options = {}) {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, body, ...options }
    });
    
    if (error) throw error;
    return data;
  },

  async uploadFile(file, bucket = 'public', path = null) {
    const fileName = path || `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (error) throw error;
    return data;
  },

  async generateImage(prompt, options = {}) {
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: { prompt, ...options }
    });
    
    if (error) throw error;
    return data;
  },

  async extractDataFromUploadedFile(fileUrl, extractionType = 'text') {
    const { data, error } = await supabase.functions.invoke('extract-file-data', {
      body: { fileUrl, extractionType }
    });
    
    if (error) throw error;
    return data;
  }
};

// Backward compatibility exports
export const InvokeLLM = Core.invokeLLM;
export const SendEmail = Core.sendEmail;
export const UploadFile = Core.uploadFile;
export const GenerateImage = Core.generateImage;
export const ExtractDataFromUploadedFile = Core.extractDataFromUploadedFile;


