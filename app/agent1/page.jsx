'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 5MB

const uploadToCloudinary = async (file, onProgress) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`הקובץ גדול מדי. הגודל המקסימלי המותר הוא 8MB`);
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'shadi-landing');

  try {
    const xhr = new XMLHttpRequest();
    const promise = new Promise((resolve, reject) => {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded * 100) / e.total);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          reject(new Error('Upload failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Upload failed'));
    });

    xhr.open('POST', `https://api.cloudinary.com/v1_1/shhady/auto/upload`);
    xhr.send(formData);

    return await promise;
  } catch (error) {
    console.error('Upload error details:', error);
    throw error;
  }
};

const uploadFiles = async (files) => {
  const uploadPromises = Object.entries(files).map(async ([field, file]) => {
    if (!file) return [field, null];
    try {
      const url = await uploadToCloudinary(file);
      return [field, url];
    } catch (error) {
      console.error(`Error uploading ${field}:`, error);
      return [field, null];
    }
  });

  const results = await Promise.all(uploadPromises);
  return Object.fromEntries(results.filter(([_, url]) => url !== null));
};

export default function Agent2Form() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', content: '' });
  const [fileDetails, setFileDetails] = useState([]);
  const [formData, setFormData] = useState({
    finishedWork: '',
    endDate: '',
    closingPapers: '',
    financialIssues: '',
    disability: '',
    disabilityClaim: '',
    currentEmploymentStatus: '',
    salary: '',
    employerName: '',
    transparentCall: '',
    fullName: '',
    phone: '',
    idNumber: '',
    city: '',
    idFront: null,
    idBack: null,
    idAttachment: null,
    bankApproval: null
  });

  const [uploadedFiles, setUploadedFiles] = useState({
    idFront: null,
    idBack: null,
    idAttachment: null,
    bankApproval: null
  });

  const [uploadProgress, setUploadProgress] = useState({
    idFront: 0,
    idBack: 0,
    idAttachment: 0,
    bankApproval: 0
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const deleteFile = async (fieldName) => {
    try {
      if (uploadedFiles[fieldName]) {
        const publicId = uploadedFiles[fieldName].split('/').pop().split('.')[0];
        await fetch('/api/delete-file', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: publicId })
        });
      }

      setUploadedFiles(prev => ({ ...prev, [fieldName]: null }));
      setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));
      
      const input = document.getElementById(fieldName);
      if (input) input.value = '';
    } catch (error) {
      console.error('Error deleting file:', error);
      setFormMessage({
        type: 'error',
        content: 'שגיאה במחיקת הקובץ. אנא נסה שוב.'
      });
    }
  };

  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (!files || !files[0]) return;

    const file = files[0];
    
    try {
      // Update progress callback
      const updateProgress = (progress) => {
        setUploadProgress(prev => ({ ...prev, [name]: progress }));
      };

      // Start upload with progress tracking
      updateProgress(1);
      const url = await uploadToCloudinary(file, updateProgress);
      
      // Update uploaded files state
      setUploadedFiles(prev => ({
        ...prev,
        [name]: url
      }));

      // Don't show success message for individual file uploads
      setUploadProgress(prev => ({ ...prev, [name]: 100 }));
    } catch (error) {
      console.error('Upload error:', error);
      setFormMessage({
        type: 'error',
        content: error.message || `שגיאה בהעלאת הקובץ ${file.name}`
      });
      setUploadProgress(prev => ({ ...prev, [name]: 0 }));
      
      // Clear the input to allow retrying
      const input = document.getElementById(name);
      if (input) input.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Check if all required files are uploaded
      const requiredFiles = ['idFront', 'idBack', 'idAttachment', 'bankApproval'];
      const missingFiles = requiredFiles.filter(field => !uploadedFiles[field]);
      
      if (missingFiles.length > 0) {
        throw new Error('חסרים קבצים נדרשים');
      }

      // Prepare payload with already uploaded file URLs
      const payload = {
        ...Object.fromEntries(
          Object.entries(formData).filter(([_, value]) => !(value instanceof File))
        ),
        ...uploadedFiles
      };

      setFormMessage({ type: 'info', content: 'שולח טופס...' });

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Show success message
      setIsLoading(false);
      setFormMessage({
        type: 'success',
        content: 'הטופס נשלח בהצלחה!'
      });

      // Clear form and redirect after 5 seconds
      setTimeout(() => {
        setFormData({
          finishedWork: '',
          endDate: '',
          closingPapers: '',
          financialIssues: '',
          disability: '',
          disabilityClaim: '',
          currentEmploymentStatus: '',
          salary: '',
          employerName: '',
          transparentCall: '',
          fullName: '',
          phone: '',
          idNumber: '',
          city: '',
          idFront: null,
          idBack: null,
          idAttachment: null,
          bankApproval: null
        });
        setUploadedFiles({
          idFront: null,
          idBack: null,
          idAttachment: null,
          bankApproval: null
        });
        setUploadProgress({
          idFront: 0,
          idBack: 0,
          idAttachment: 0,
          bankApproval: 0
        });
        router.push('/');
      }, 3000); // Changed from 2000 to 5000 milliseconds
    } catch (error) {
      console.error('Error:', error);
      setFormMessage({
        type: 'error',
        content: error.message || 'שגיאה בשליחת הטופס. אנא נסה שוב.'
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e5f0fe]" dir="rtl">
      {isLoading && (
        <div className="fixed w-full top-0 left-0 inset-0 bg-black opacity-60 backdrop-blur-sm z-50 flex flex-col items-center justify-center" style={{ pointerEvents: 'auto' }}>
          <div className="w-16 h-16 border-4 border-[#0070f3] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-2xl font-bold">שולח טופס...</div>
        </div>
      )}
      
      {/* Success Message Overlay */}
      {formMessage.type === 'success' && !isLoading && formMessage.content === 'הטופס נשלח בהצלחה!' && (
        <div className="fixed w-full top-0 left-0 inset-0 bg-[#1b283c] bg-opacity-95 backdrop-blur-sm z-50 flex flex-col items-center justify-center" style={{ pointerEvents: 'auto' }}>
          <div className="bg-white rounded-full p-8 mb-6">
            <div className="text-[#1b283c] text-6xl">✓</div>
          </div>
          <div className="text-white text-3xl font-bold mb-4">{formMessage.content}</div>
          <div className="text-white text-xl opacity-75">מעביר אותך לדף הבית...</div>
        </div>
      )}
      
      <div className="container mx-auto px-4">
            <div className="flex justify-center items-center py-6">
                    <Image src="/landing-pic.png" alt="logo" width={500} height={500} className='w-full max-w-3xl' />
            </div>
            <h1 className="text-2xl font-bold text-center mb-6">תהליך למשיכת כספים הוא פשוט וקל</h1>

            <div className="max-w-[500px] mx-auto">
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-4">
                {/* Radio Questions */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold mb-2">הלקוח סיים לעבוד?</label>
                    <div className="flex gap-4 flex-col">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="finishedWork"
                          value="כן"
                          onChange={handleInputChange}
                          className="form-radio"
                          required
                        />
                        <span className="mr-2">כן</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="finishedWork"
                          value="לא"
                          onChange={handleInputChange}
                          className="form-radio"
                        />
                        <span className="mr-2">לא</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">תאריך סיום עבודה</label>
                    <input
                      type="text"
                      name="endDate"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">האם יש מכתבי סיום העסקה וטפסי 161 בידי הלקוח?</label>
                    <div className="flex gap-4 flex-col">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="closingPapers"
                          value="כן"
                          onChange={handleInputChange}
                          className="form-radio"
                          required
                        />
                        <span className="mr-2">כן</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="closingPapers"
                          value="לא"
                          onChange={handleInputChange}
                          className="form-radio"
                        />
                        <span className="mr-2">לא</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">האם ללקוח קיים עיקולים? בעיות בספרי הבנק? הוצאה לפועל? שיקים ותשלומים שחזרו?</label>
                    <div className="flex gap-4 flex-col">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="financialIssues"
                          value="כן"
                          onChange={handleInputChange}
                          className="form-radio"
                          required
                        />
                        <span className="mr-2">כן</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="financialIssues"
                          value="לא"
                          onChange={handleInputChange}
                          className="form-radio"
                        />
                        <span className="mr-2">לא</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">האם קיימת נכות ללקוח או לאחד מבני המשפחה?</label>
                    <div className="flex gap-4 flex-col">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="disability"
                          value="כן"
                          onChange={handleInputChange}
                          className="form-radio"
                          required
                        />
                        <span className="mr-2">כן</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="disability"
                          value="לא"
                          onChange={handleInputChange}
                          className="form-radio"
                        />
                        <span className="mr-2">לא</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">האם קיימת תביעת נכות מתנהלת מול ביטוח לאומי או חברת הביטוח?</label>
                    <div className="flex gap-4 flex-col">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="disabilityClaim"
                          value="כן"
                          onChange={handleInputChange}
                          className="form-radio"
                          required
                        />
                        <span className="mr-2">כן</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="disabilityClaim"
                          value="לא"
                          onChange={handleInputChange}
                          className="form-radio"
                        />
                        <span className="mr-2">לא</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">מה מעמד העובד נכון להיום? האם הוא עובד?</label>
                    <div className="flex gap-4 flex-col">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="currentEmploymentStatus"
                          value="כן"
                          onChange={handleInputChange}
                          className="form-radio"
                          required
                        />
                        <span className="mr-2">כן</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="currentEmploymentStatus"
                          value="לא"
                          onChange={handleInputChange}
                          className="form-radio"
                        />
                        <span className="mr-2">לא</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">במידה והלקוח היום עובד, מה גובה המשכורת שמקבל?</label>
                    <input
                      type="number"
                      name="salary"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">מה שם המעסיק הנוכחי?</label>
                    <input
                      type="text"
                      name="employerName"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">האם הלקוח מוכן לשיחת שקוף?</label>
                    <div className="flex gap-4 flex-col">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="transparentCall"
                          value="כן"
                          onChange={handleInputChange}
                          className="form-radio"
                          required
                        />
                        <span className="mr-2">כן</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="transparentCall"
                          value="לא"
                          onChange={handleInputChange}
                          className="form-radio"
                        />
                        <span className="mr-2">לא</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold mb-2">שם מלא</label>
                    <input
                      type="text"
                      name="fullName"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">מספר נייד</label>
                    <input
                      type="tel"
                      name="phone"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md"
                      placeholder="+972"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">מספר ת.ז</label>
                    <input
                      type="tel"
                      name="idNumber"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-2">עיר</label>
                    <input
                      type="text"
                      name="city"
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                </div>

                {/* File Uploads */}
                <div className="space-y-4">
                  {/* <div className="bg-blue-50 p-4 rounded-md mb-4">
                    <p className="text-sm text-blue-800">
                      📸 הנחיות להעלאת קבצים:
                        <br />
                        • גודל מקסימלי לכל קובץ: 5MB
                        <br />
                        • ניתן להעלות תמונות או PDF
                    </p>
                  </div> */}
                  {['idFront', 'idBack', 'idAttachment', 'bankApproval'].map((field) => (
                    <div key={field} className="relative">
                      <label className="block font-bold mb-2">
                        {field === 'idFront' && 'צילום ת.ז - צד 1'}
                        {field === 'idBack' && 'צילום ת.ז - צד 2'}
                        {field === 'idAttachment' && 'צילום ספח ת.ז'}
                        {field === 'bankApproval' && 'אישור ניהול חשבון בנק'}
                      </label>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <button
                            type="button"
                            onClick={() => document.getElementById(field).click()}
                            className={`w-1/2 py-2 px-4 ${
                              uploadProgress[field] > 0 && uploadProgress[field] < 100
                                ? 'bg-gray-400'
                                : 'bg-[#1b283c] hover:bg-[#2a3b52]'
                            } text-white rounded-md transition-colors flex items-center justify-center gap-2`}
                            disabled={uploadProgress[field] > 0 && uploadProgress[field] < 100}
                          >
                            {uploadProgress[field] > 0 && uploadProgress[field] < 100 ? (
                              <span>מעלה... {uploadProgress[field]}%</span>
                            ) : (
                              <span>העלה {field === 'bankApproval' ? 'קובץ' : 'תמונה'} +</span>
                            )}
                          </button>
                          <input
                            id={field}
                            type="file"
                            name={field}
                            onChange={handleFileChange}
                            accept={field === 'bankApproval' ? "application/pdf,image/*" : "image/*"}
                            className="hidden"
                            required={!uploadedFiles[field]}
                          />
                        </div>
                        
                        {/* Preview and progress section */}
                        {(uploadProgress[field] > 0 || uploadedFiles[field]) && (
                          <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                            {uploadedFiles[field] ? (
                              <>
                                <img
                                  src={uploadedFiles[field]}
                                  alt={`Preview ${field}`}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => deleteFile(field)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <div className="w-full px-2">
                                  <div className="bg-gray-200 rounded-full h-2.5">
                                    <div
                                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                      style={{ width: `${uploadProgress[field]}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex w-full">
                  {isLoading ? (
                    <div className="text-lg text-[#0070f3] animate-pulse w-full text-center">
                      שולח נתונים...
                    </div>
                  ) : (
                    <div className='w-full'>
                      <button
                        type="submit"
                        className="w-full py-3 px-4 bg-[#1b283c] text-white rounded-md hover:bg-[#005cc5] transition-colors"
                      >
                        שלח לבדיקה
                      </button>
                    </div>
                  )}
                </div>
              </form>

              {/* Message Area - Only show error messages here */}
              {formMessage.type === 'error' && formMessage.content && (
                <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-800">
                  <pre className="whitespace-pre-line text-sm">
                    {formMessage.content}
                  </pre>
                </div>
              )}

              {/* File Details Area */}
              {fileDetails.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">פירוט הקבצים:</h3>
                  <pre className="whitespace-pre-line text-sm text-blue-800">
                    {fileDetails.map(f => `${f.name} (${f.type}) - ${f.size}`).join('\n')}
                  </pre>
                </div>
              )}
            </div>
        </div>
    </div>
  );
} 