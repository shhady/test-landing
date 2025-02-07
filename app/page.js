import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            The Future of AI Technology
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover how artificial intelligence is revolutionizing the way we live, work, and create in the digital age.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors">
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-blue-600 text-3xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">Machine Learning</h3>
            <p className="text-gray-600">
              Advanced algorithms that learn and adapt from experience, making systems smarter over time.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-blue-600 text-3xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">Neural Networks</h3>
            <p className="text-gray-600">
              Brain-inspired computing systems that process complex patterns and information.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-blue-600 text-3xl mb-4">💡</div>
            <h3 className="text-xl font-semibold mb-2">Natural Language</h3>
            <p className="text-gray-600">
              AI systems that understand and interact using human language naturally.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-blue-50 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore AI?</h2>
          <p className="text-gray-600 mb-6">
            Join us in shaping the future of technology and innovation.
          </p>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors">
            Learn More
          </button>
        </div>
      </section>
    </div>
  );
}
