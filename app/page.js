import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#e5f0fe] flex flex-col items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-8">
          <Image src="/banner.png" alt="logo" width={500} height={500} className="w-full max-w-xl mx-auto" />
        </div>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
        הכסף שלכם
        ממתין מעבר לפינה
        </h1>
        <Link href="/agent1">
          <button className="bg-[#8dc63f] text-white px-8 py-3 rounded-md hover:bg-[#87be3b] transition-colors text-lg font-medium">
            התחל עכשיו
          </button>
        </Link>
      </div>
    </div>
  );
}
