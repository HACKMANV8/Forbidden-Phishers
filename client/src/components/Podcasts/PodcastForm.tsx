import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, FileText, Mic, Video, AlertCircle } from 'lucide-react';
import { CreatePodcastRequest } from '@/types/podcasts';

interface PodcastFormProps {
  onSubmit: (data: CreatePodcastRequest) => void;
  isLoading: boolean;
}

export default function PodcastForm({ onSubmit, isLoading }: PodcastFormProps) {
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');
  const [knowledgeFile, setKnowledgeFile] = useState<File | null>(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreatePodcastRequest>();

  const handleFormSubmit = (data: CreatePodcastRequest) => {
    onSubmit({
      ...data,
      knowledgeFile: knowledgeFile || undefined,
    });
    reset();
    setKnowledgeFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/plain') {
      setKnowledgeFile(file);
    } else {
      alert('Please select a valid text file (.txt)');
      e.target.value = '';
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-[#F9F6EE] rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto border-2 border-[#E4D7B4]">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#335441] mb-2">Create AI Podcast</h2>
        <p className="text-[#6B8F60]">Transform your content into an engaging two-person podcast</p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-[#335441] mb-2">
            Podcast Title *
          </label>
          <input
            {...register('title', { required: 'Title is required' })}
            type="text"
            className="w-full px-4 py-3 border-2 border-[#A9B782] rounded-lg focus:ring-2 focus:ring-[#335441] focus:border-transparent bg-white"
            placeholder="Enter podcast title..."
          />
          {errors.title && (
            <p className="mt-1 text-sm text-[#335441] flex items-center font-medium">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-[#335441] mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-4 py-3 border-2 border-[#A9B782] rounded-lg focus:ring-2 focus:ring-[#335441] focus:border-transparent bg-white"
            placeholder="Brief description of your podcast..."
          />
        </div>

        {/* Length */}
        <div>
          <label htmlFor="length" className="block text-sm font-semibold text-[#335441] mb-2">
            Podcast Length *
          </label>
          <select
            {...register('length', { required: 'Length is required' })}
            className="w-full px-4 py-3 border-2 border-[#A9B782] rounded-lg focus:ring-2 focus:ring-[#335441] focus:border-transparent bg-white"
          >
            <option value="">Select length...</option>
            <option value="Short">Short (20 seconds)</option>
            <option value="Medium">Medium (1 minute)</option>
            <option value="Long">Long (2 minutes)</option>
          </select>
          {errors.length && (
            <p className="mt-1 text-sm text-[#335441] flex items-center font-medium">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.length.message}
            </p>
          )}
        </div>

        {/* Knowledge Base Input Method */}
        <div>
          <label className="block text-sm font-semibold text-[#335441] mb-3">
            Knowledge Base Input Method *
          </label>
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setInputMethod('text')}
              className={`flex items-center px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                inputMethod === 'text'
                  ? 'bg-[#335441] border-[#335441] text-white shadow-lg'
                  : 'bg-white border-[#A9B782] text-[#335441] hover:border-[#335441]'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Type Text
            </button>
            <button
              type="button"
              onClick={() => setInputMethod('file')}
              className={`flex items-center px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                inputMethod === 'file'
                  ? 'bg-[#335441] border-[#335441] text-white shadow-lg'
                  : 'bg-white border-[#A9B782] text-[#335441] hover:border-[#335441]'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload File
            </button>
          </div>

          {inputMethod === 'text' ? (
            <div>
              <textarea
                {...register('knowledgeText', { 
                  required: inputMethod === 'text' ? 'Knowledge base content is required' : false 
                })}
                rows={6}
                className="w-full px-4 py-3 border-2 border-[#A9B782] rounded-lg focus:ring-2 focus:ring-[#335441] focus:border-transparent bg-white"
                placeholder="Paste your content here... This will be used to generate the podcast conversation."
              />
              {errors.knowledgeText && (
                <p className="mt-1 text-sm text-[#335441] flex items-center font-medium">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.knowledgeText.message}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="border-2 border-dashed border-[#A9B782] rounded-lg p-6 text-center bg-[#F9F6EE] hover:border-[#335441] transition-colors">
                <Upload className="w-8 h-8 mx-auto text-[#6B8F60] mb-2" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-[#335441] hover:text-[#46704A] font-semibold">Choose a text file</span>
                  <span className="text-[#6B8F60]"> or drag and drop</span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-xs text-[#6B8F60] mt-1">TXT files up to 10MB</p>
              </div>
              {knowledgeFile && (
                <p className="mt-2 text-sm text-[#335441] font-medium">
                  ✓ {knowledgeFile.name} selected
                </p>
              )}
            </div>
          )}
        </div>

        {/* Features Info */}
        <div className="bg-gradient-to-br from-[#F9F6EE] to-[#EFE7D4] rounded-lg p-4 border border-[#E4D7B4]">
          <h3 className="text-sm font-bold text-[#335441] mb-2">What you'll get:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#335441]">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-[#335441]" />
              Two-person script
            </div>
            <div className="flex items-center">
              <Mic className="w-4 h-4 mr-2 text-[#46704A]" />
              AI-generated audio
            </div>
            <div className="flex items-center">
              <Video className="w-4 h-4 mr-2 text-[#6B8F60]" />
              3D avatar video
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group w-full px-8 py-4 bg-[#335441] text-white rounded-lg font-bold shadow-lg hover:bg-[#46704A] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating Podcast...
            </div>
          ) : (
            'Create Podcast'
          )}
        </button>
      </form>
    </div>
  );
}