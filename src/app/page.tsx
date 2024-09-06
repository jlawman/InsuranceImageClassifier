'use client'

import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogTitle, DialogBody, DialogActions } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { PhotoIcon, FolderIcon } from '@heroicons/react/24/solid'
import { Loader2 } from 'lucide-react'
import { Switch } from "../components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Text, Strong } from "../components/ui/text";
import { Heading, Subheading } from "../components/ui/heading";
import { Divider } from "../components/ui/divider";
import Image from 'next/image';

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [classificationResult, setClassificationResult] = useState<{ roomType: string, features: Record<string, boolean> } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [publicImages, setPublicImages] = useState<string[]>([]);
  const [isPublicImageDialogOpen, setIsPublicImageDialogOpen] = useState(false);

  useEffect(() => {
    // Replace this mock API call with actual image fetching
    const fetchPublicImages = async () => {
      try {
        const images = [
          "00etFI62BjtaGDj6-uAaj_16ce0c5fc2714dc897ef5a9d0d05649c.jpg",
          "3hdlpA-TfeKVaVLlq2k6p_cdb278ce484c440db2ec6124cab71eae.jpg",
          "6fIvAXNra4qaWGeGyPbLM_854060ca68a540e98919736be73beb79.jpg",
          "9HVCO8m_GpPhJea916jRv_79d617e72b6346938391d2e231498f5a.jpg",
          "AKBeztcV7Q-UuiqXOFCWn_0406527aa8c64d048f72c7fddb68d2dd.jpg",
          "bMFt73es6iVM-mWSLl7U3_6ba38311eec0478cb690853c85141855.jpg",
          "hMA61EgWzewkYLME8Pify_08c906511ccf4acda45fed91309ab331.jpg",
          "k0lUPGtXxulfZHvaA410l_c8fd37cb1ba547fb8fa5cde7b670c550.jpg",
          "KCT5RbmzjIzvpCwev9wDF_036e9e3be8884b5ab89e17e66c740ac5.jpg",
          "Qkz_Uxj8_A1FaMl58Ob7x_1f97eaf23b1b44b9aa73f724bb8a5554.jpg",
          "T_xyJao9wuPI0ijI1-jII_32e7b5c9f95c4ab8a0cc067a0f560ceb.jpg",
          "tCodRrjmQSA2fTcZhWmHx_2aabc365cd6b463b9c6408e41649eca1.jpg",
          "uIHzhmXPsLam5QnXtPshk_10cc4653b9e7431c89dfc0bf8c74a903.jpg",
          "V_DkRhu_ZtL4a5vPRgWZ__1dba7467d61f42f1a0178223e1ac448a.jpg",
          "Y_vpwJ5Xciwd9Cig0qX6W_f0839ed9f9e94dad9e968751bc48749e.jpg",
          "yo6qUubM5pzUMMe3Dg7Cd_76a1771db2194f5fad1a5bfef0cb538e.jpg"
      ];
        setPublicImages(images);
      } catch (err) {
        console.error('Failed to fetch sample images:', err);
      }
    };

    fetchPublicImages();
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let file: File | null = null;
    if ('dataTransfer' in event) {
      file = event.dataTransfer?.files[0] || null;
    } else if ('target' in event) {
      file = (event.target as HTMLInputElement).files?.[0] || null;
    }
    if (file) {
      setSelectedFile(file);
      setSelectedImageUrl(URL.createObjectURL(file));
      toast.success('File selected successfully!');
    }
  }, []);

  const handlePublicImageSelect = (imagePath: string) => {
    setSelectedImageUrl(`/images/${imagePath}`);
    setSelectedFile(null);
    setIsPublicImageDialogOpen(false);
    toast.success('Sample image selected successfully!');
  };

  const handleAnalyze = async () => {
    if (!selectedImageUrl) return;

    setIsAnalyzing(true);
    const formData = new FormData();
    
    if (selectedFile) {
      formData.append('image', selectedFile);
    } else {
      // For public images, we'll send the image path instead of a URL
      const imagePath = selectedImageUrl.replace('/images/', '');
      formData.append('imagePath', imagePath);
    }

    try {
      const response = await fetch('/api/classify-interior-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to classify image: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setClassificationResult(result);
      setIsDialogOpen(true);
      toast.success('Image analyzed successfully!');
    } catch (error) {
      console.error('Error classifying image:', error);
      toast.error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFeatureName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      <main className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold mb-8 text-indigo-800 dark:text-indigo-200"
        >
          Insurance Property Image Classifier
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-indigo-300 dark:border-indigo-700 px-6 py-10 bg-white dark:bg-gray-800 shadow-lg"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e);
          }}
        >
          <div className="text-center">
            <PhotoIcon className="mx-auto h-12 w-12 text-indigo-400 dark:text-indigo-300" aria-hidden="true" />
            <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-300">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer rounded-md bg-indigo-50 dark:bg-indigo-900 font-semibold text-indigo-600 dark:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 dark:hover:text-indigo-400 px-3 py-2 transition-colors duration-200"
              >
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept="image/*" />
              </label>
              <p className="pl-1 self-center">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-500 dark:text-gray-400 mt-2">PNG or JPG up to 10MB</p>
          </div>
          <Button plain
            onClick={() => setIsPublicImageDialogOpen(true)}
            className="mt-4 flex items-center justify-center bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-800 dark:hover:bg-indigo-700 dark:text-indigo-200"
          >
            <FolderIcon  className="w-5 h-5 mr-2" />
            Choose from Sample Images
          </Button>
          <AnimatePresence>
            {selectedImageUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4"
              >
                <div className="relative w-64 h-64 mx-auto mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={selectedImageUrl}
                    alt="Selected image"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-lg"
                  />
                </div>
                <Button 
                  onClick={handleAnalyze} 
                  className="mt-2 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white" 
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Image'
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Classification Result</DialogTitle>
        <DialogBody>
          {classificationResult && selectedImageUrl && (
            <>
              <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                <Image
                  src={selectedImageUrl}
                  alt="Classified image"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg"
                />
              </div>
              <Heading level={2} className="mb-4">{classificationResult.locationType === 'interior' ? 'Interior' : 'Exterior'}</Heading>
              <Divider className="mb-6" />
              <Heading level={2} className="mb-4">Space Type</Heading>
              <Text className="mb-6">
                <Strong>{classificationResult.spaceType}</Strong>
              </Text>
              <Subheading level={3} className="mb-4">Features</Subheading>
              <ul className="space-y-4">
                {Object.entries(classificationResult.features).map(([feature, present]) => (
                  <li key={feature} className="flex items-center justify-between">
                    <Text className="text-sm font-medium">{formatFeatureName(feature)}</Text>
                    <Switch
                      checked={present}
                      onChange={() => {}} // Read-only
                      color={present ? "green" : "red"}
                    />
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogBody>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isPublicImageDialogOpen} onClose={() => setIsPublicImageDialogOpen(false)}>
        <DialogTitle>Choose a Sample Image</DialogTitle>
        <DialogBody>
          <div className="grid grid-cols-3 gap-4">
            {publicImages.map((image, index) => (
              <div
                key={index}
                className="relative w-full pt-[100%] rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePublicImageSelect(image)}
              >
                <Image
                  src={`/images/${image}`}
                  alt={`Sample image ${index + 1}`}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg"
                />
              </div>
            ))}
          </div>
        </DialogBody>
        <DialogActions>
          <Button onClick={() => setIsPublicImageDialogOpen(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white">Cancel</Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}
