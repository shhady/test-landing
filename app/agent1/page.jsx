'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Agent2Form() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
      
      // Calculate total size of all files after adding this one
      let totalSize = file.size;
      Object.keys(formData).forEach(key => {
        if (key !== name && formData[key] instanceof File) {
          totalSize += formData[key].size;
        }
      });

      // Check individual file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(`הקובץ ${file.name} גדול מדי. הגודל המקסימלי לכל קובץ הוא 5MB\nנסה לצלם שוב עם איכות נמוכה יותר או לדחוס את התמונה`);
        e.target.value = ''; // Clear the input
        return;
      }

      // Check total size of all files (20MB limit)
      if (totalSize > 20 * 1024 * 1024) {
        alert('הגודל הכולל של כל הקבצים גדול מדי. הגודל המקסימלי הכולל הוא 20MB\nנסה לצלם שוב עם איכות נמוכה יותר או לדחוס את התמונות');
        e.target.value = ''; // Clear the input
        return;
      }

      setFormData(prev => ({
        ...prev,
        [name]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    setIsLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Calculate total file size
      let totalSize = 0;
      const fileFields = ['idFront', 'idBack', 'idAttachment', 'bankApproval'];
      fileFields.forEach(field => {
        if (formData[field] instanceof File) {
          totalSize += formData[field].size;
        }
      });

      // Check total size before submission
      if (totalSize > 20 * 1024 * 1024) {
        alert('הגודל הכולל של כל הקבצים גדול מדי. הגודל המקסימלי הכולל הוא 20MB\nנסה לצלם שוב עם איכות נמוכה יותר או לדחוס את התמונות');
        setIsLoading(false);
        return;
      }
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'string') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add files with error handling
      for (const field of fileFields) {
        if (formData[field]) {
          try {
            formDataToSend.append(field, formData[field]);
          } catch (error) {
            console.error(`Error adding file ${field}:`, error);
            alert('שגיאה בהעלאת הקבצים. אנא נסה שוב.');
            setIsLoading(false);
            return;
          }
        }
      }

      console.log('Sending request to API...');
      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (response.ok) {
        console.log('Form submitted successfully');
        alert('הטופס נשלח בהצלחה!');
        router.push('/');
      } else {
        throw new Error(result.error || 'Failed to send data');
      }
    } catch (error) {
      console.error('Error details:', error);
      alert('שגיאה בשליחת הטופס. אנא נסה שוב.');
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

            <div className="max-w-[500px] mx-auto bg-white p-8 rounded-lg shadow-md">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      type="text"
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
                  <div className="bg-blue-50 p-4 rounded-md mb-4">
                    <p className="text-sm text-blue-800">
                      📸 הנחיות להעלאת קבצים:
                      <br />
                      • גודל מקסימלי לכל קובץ: 5MB
                      <br />
                      • גודל מקסימלי כולל: 20MB
                      <br />
                      • אם התמונה גדולה מדי, נסה לצלם באיכות נמוכה יותר
                    </p>
                  </div>
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
                <div className="flex w-full ">
                  {isLoading ? (
                    <div className="text-lg text-[#0070f3] animate-pulse w-full text-center">
                      שולח נתונים...
                    </div>
                  ):(<div className='w-full'>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-[#1b283c] text-white rounded-md hover:bg-[#005cc5] transition-colors"
                    >
                      שלח לבדיקה
                    </button>
                  </div>)}
                </div>
                
              </form>
            </div>
        </div>
    </div>
  );
} 