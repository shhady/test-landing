'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'shadi-landing');
  formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary upload error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to upload file');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Upload error details:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      
      // Log file details
      const fileSizeMB = file.size / (1024 * 1024);
      console.log('New file details:', {
        name: file.name,
        type: file.type,
        size: `${fileSizeMB.toFixed(2)}MB`
      });

      // Update file details state
      setFileDetails(prev => [...prev, {
        name: file.name,
        type: file.type,
        size: `${fileSizeMB.toFixed(2)}MB`
      }]);

      setFormData(prev => ({
        ...prev,
        [name]: file
      }));

      // Show file details message
      setFormMessage({
        type: 'info',
        content: `
          קובץ נוסף:
          שם: ${file.name}
          סוג: ${file.type}
          גודל: ${fileSizeMB.toFixed(2)}MB
        `
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormMessage({ type: 'info', content: 'מעלה קבצים...' });

    try {
      // Upload files to Cloudinary
      const uploadedFiles = {};
      const fileFields = ['idFront', 'idBack', 'idAttachment', 'bankApproval'];
      
      for (const field of fileFields) {
        if (formData[field]) {
          try {
            setFormMessage({ 
              type: 'info', 
              content: `מעלה קובץ ${field}...` 
            });
            uploadedFiles[field] = await uploadToCloudinary(formData[field]);
          } catch (error) {
            console.error(`Error uploading ${field}:`, error);
            setFormMessage({
              type: 'error',
              content: `שגיאה בהעלאת קובץ ${field}. אנא נסה שוב.`
            });
            setIsLoading(false);
            return;
          }
        }
      }

      // Prepare payload with form data and file URLs
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

      setFormMessage({
        type: 'success',
        content: `
          הטופס נשלח בהצלחה!
          
          פירוט הקבצים שנשלחו:
          ${fileDetails.map(f => `${f.name} (${f.type}) - ${f.size}`).join('\n')}
        `
      });

      // Redirect after 3 seconds
      setTimeout(() => router.push('/'), 3000);
    } catch (error) {
      console.error('Error:', error);
      setFormMessage({
        type: 'error',
        content: 'שגיאה בשליחת הטופס. אנא נסה שוב.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e5f0fe]" dir="rtl">
      {isLoading && (
        <div className="fixed w-full top-0 left-0 inset-0 bg-black opacity-60 backdrop-blur-sm z-50 flex flex-col items-center justify-center" style={{ pointerEvents: 'auto' }}>
          <div className="w-16 h-16 border-4 border-[#0070f3] border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-2xl font-bold">שולח...</div>
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
                      • גודל מקסימלי כולל: 20MB
                      <br />
                      • ניתן להעלות כל סוג של תמונה
                      <br />
                      • עבור אישור בנק: תמונה או PDF
                      <br />
                      • אם התמונה גדולה מדי, נסה:
                      <br />
                      - לצלם באיכות נמוכה יותר
                      <br />
                      - לדחוס את התמונה
                      <br />
                      - להשתמש בתמונה קטנה יותר
                    </p>
                  </div> */}
                  <div>
                    <label className="block font-bold mb-2">צילום ת.ז - צד 1</label>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('idFront').click()}
                        className="w-1/2 py-2 px-4 bg-[#1b283c] text-white border-2 border-gray-300 rounded-md  transition-colors flex items-center justify-center gap-2"
                      >
                        <span>העלה תמונה + </span>
                        {formData.idFront && (
                          <span className="text-green-600">✓</span>
                        )}
                      </button>
                      {formData.idFront && (
                        <p className="text-sm text-gray-600 text-center">
                          {formData.idFront.name}
                        </p>
                      )}
                      <input
                        id="idFront"
                        type="file"
                        name="idFront"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">צילום ת.ז - צד 2</label>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('idBack').click()}
                        className="w-1/2 py-2 px-4 bg-[#1b283c] text-white border-2 border-gray-300 rounded-md transition-colors flex items-center justify-center gap-2"
                      >
                        <span>העלה תמונה +</span>
                        {formData.idBack && (
                          <span className="text-green-600">✓</span>
                        )}
                      </button>
                      {formData.idBack && (
                        <p className="text-sm text-gray-600 text-center">
                          {formData.idBack.name}
                        </p>
                      )}
                      <input
                        id="idBack"
                        type="file"
                        name="idBack"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">צילום ספח ת.ז</label>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('idAttachment').click()}
                        className="w-1/2 py-2 px-4 bg-[#1b283c] text-white border-2 border-gray-300 rounded-md transition-colors flex items-center justify-center gap-2"
                      >
                        <span>העלה תמונה +</span>
                        {formData.idAttachment && (
                          <span className="text-green-600">✓</span>
                        )}
                      </button>
                      {formData.idAttachment && (
                        <p className="text-sm text-gray-600 text-center">
                          {formData.idAttachment.name}
                        </p>
                      )}
                      <input
                        id="idAttachment"
                        type="file"
                        name="idAttachment"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="hidden"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-2">אישור ניהול חשבון בנק</label>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => document.getElementById('bankApproval').click()}
                        className="w-1/2 py-2 px-4 bg-[#1b283c] text-white border-2 border-gray-300 rounded-md  transition-colors flex items-center justify-center gap-2"
                      >
                        <span>העלה קובץ +</span>
                        {formData.bankApproval && (
                          <span className="text-green-600">✓</span>
                        )}
                      </button>
                      {formData.bankApproval && (
                        <p className="text-sm text-gray-600 text-center">
                          {formData.bankApproval.name}
                        </p>
                      )}
                      <input
                        id="bankApproval"
                        type="file"
                        name="bankApproval"
                        onChange={handleFileChange}
                        accept="application/pdf,image/*"
                        className="hidden"
                        required
                      />
                    </div>
                  </div>
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

              {/* Message Area */}
              {formMessage.content && (
                <div className={`mt-4 p-4 rounded-lg ${
                  formMessage.type === 'error' ? 'bg-red-50 text-red-800' : 
                  formMessage.type === 'success' ? 'bg-green-50 text-green-800' :
                  'bg-blue-50 text-blue-800'
                }`}>
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