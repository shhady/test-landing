'use client';
import Image from 'next/image'
import React from 'react'
import { useSearchParams } from 'next/navigation'

export default function HomeComponent({setShowForm}) {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-[#e5f0fe] flex flex-col items-center justify-center">
      <div className="text-center px-4">
        {error === 'invalid-agent' && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            הקישור אינו תקין. אנא פנה לסוכן מורשה.
          </div>
        )}
        <div className="mb-8">
          <Image src="/banner.png" alt="logo" width={500} height={500} className="w-full max-w-xl mx-auto" />
        </div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
        הכסף שלכם
        ממתין מעבר לפינה
        </h1>
        <button onClick={() => setShowForm(true)} className="bg-[#8dc63f] text-white px-8 py-3 rounded-md hover:bg-[#87be3b] transition-colors text-lg font-medium">
          התחל עכשיו
        </button>
      </div>
    </div>
  )
}
