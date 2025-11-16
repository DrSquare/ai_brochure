import React, { useState, useCallback } from 'react';
import { ImageData } from './types';
import { ImageInput } from './components/ImageInput';
import { generateBrochureImage } from './services/geminiService';
import { UploadIcon, DownloadIcon, SparklesIcon, LoadingSpinner, BrochureIcon, LayoutIcon } from './components/IconComponents';

const App: React.FC = () => {
  const [productImage, setProductImage] = useState<ImageData | null>(null);
  const [modelImage, setModelImage] = useState<ImageData | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<ImageData | null>(null);
  const [adCopy, setAdCopy] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('4:3');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('classic-ad');
  const [generatedBrochure, setGeneratedBrochure] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isFormComplete = !!productImage && !!modelImage && !!backgroundImage && adCopy.trim() !== '';

  const handleGenerate = useCallback(async () => {
    if (!isFormComplete) {
      setError('Please fill all fields and upload all images.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedBrochure(null);

    try {
      const result = await generateBrochureImage(
        productImage,
        modelImage,
        backgroundImage,
        adCopy,
        aspectRatio,
        selectedTemplate
      );
      if (result) {
        setGeneratedBrochure(`data:image/png;base64,${result}`);
      } else {
        setError('The AI model did not return an image. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while generating the brochure. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  }, [productImage, modelImage, backgroundImage, adCopy, aspectRatio, selectedTemplate, isFormComplete]);
  
  const handleDownload = () => {
    if (!generatedBrochure) return;
    const link = document.createElement('a');
    link.href = generatedBrochure;
    link.download = 'ai-generated-brochure.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const aspectRatios = [
    { value: '1:1', label: 'Square' },
    { value: '4:3', label: '4:3' },
    { value: '16:9', label: '16:9' },
  ];

  const templates = [
      { id: 'classic-ad', name: 'Classic Ad' },
      { id: 'modern-split', name: 'Modern Split' },
      { id: 'minimalist-focus', name: 'Minimalist' },
      { id: 'dynamic-showcase', name: 'Showcase' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrochureIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Brochure Maker</h1>
          </div>
          <span className="text-sm font-medium text-indigo-500">Powered by Gemini</span>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">1. Upload Your Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageInput 
                id="product-image"
                title="Product Image"
                onImageUpload={setProductImage}
                icon={<UploadIcon />}
              />
              <ImageInput 
                id="model-image"
                title="Human Model Image"
                onImageUpload={setModelImage}
                icon={<UploadIcon />}
              />
            </div>
            <ImageInput 
              id="background-image"
              title="Background Image"
              onImageUpload={setBackgroundImage}
              icon={<UploadIcon />}
            />

            <div className="flex flex-col space-y-2">
                <label htmlFor="ad-copy" className="text-lg font-semibold text-gray-800 border-b pb-3">2. Write Advertising Copy</label>
                <textarea
                    id="ad-copy"
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 resize-none"
                    placeholder="e.g., 'Experience the future of sound with our new wireless headphones. Crystal clear audio, all-day comfort.'"
                    value={adCopy}
                    onChange={(e) => setAdCopy(e.target.value)}
                />
            </div>
            
            <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-3">3. Select Aspect Ratio</h3>
                <div className="flex space-x-2 pt-2">
                    {aspectRatios.map(({ value, label }) => (
                        <button
                            key={value}
                            onClick={() => setAspectRatio(value)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 ${
                                aspectRatio === value
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-3 flex items-center space-x-2">
                    <LayoutIcon className="h-5 w-5"/>
                    <span>4. Choose a Layout Template</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    {templates.map(template => (
                        <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`p-3 rounded-lg font-semibold text-center transition-all duration-200 border-2 ${
                                selectedTemplate === template.id
                                    ? 'bg-indigo-600 text-white border-indigo-600 scale-105 shadow-lg'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-500 hover:shadow-md'
                            }`}
                        >
                            {template.name}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={!isFormComplete || isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-md mt-4"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="h-5 w-5" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  <span>Generate Brochure</span>
                </>
              )}
            </button>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>

          {/* Output Panel */}
          <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center min-h-[400px] lg:min-h-full">
            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4">
              {isLoading && (
                 <div className="flex flex-col items-center justify-center text-gray-500">
                    <LoadingSpinner className="h-12 w-12 mb-4" />
                    <p className="font-semibold">AI is crafting your brochure...</p>
                    <p className="text-sm text-center mt-2">This may take a moment. Great things are worth the wait!</p>
                 </div>
              )}
              {!isLoading && generatedBrochure && (
                <div className="w-full flex flex-col items-center space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Your AI-Generated Brochure</h2>
                  <img src={generatedBrochure} alt="Generated Brochure" className="max-w-full max-h-[50vh] rounded-lg shadow-xl object-contain" />
                  <button 
                    onClick={handleDownload}
                    className="mt-4 flex items-center justify-center space-x-2 bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-md">
                    <DownloadIcon className="h-5 w-5" />
                    <span>Download Image</span>
                  </button>
                </div>
              )}
              {!isLoading && !generatedBrochure && (
                <div className="text-center text-gray-400">
                    <BrochureIcon className="h-16 w-16 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Brochure Preview</h3>
                    <p className="text-sm">Your generated brochure will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;