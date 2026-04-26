import Link from 'next/link';

export default function Home() {
  const levels = [
    {
      id: 1,
      title: 'Arabic Alphabet',
      description: 'Learn the 28 Arabic letters with pronunciation and writing forms',
      emoji: '🔤',
      color: 'from-blue-400 to-cyan-500',
      href: '/modules/1',
    },
    {
      id: 2,
      title: 'Letter Recognition',
      description: 'Match letters and practice identifying them through fun games',
      emoji: '👁️',
      color: 'from-green-400 to-emerald-500',
      href: '/modules/2',
    },
    {
      id: 3,
      title: 'Word Building',
      description: 'Learn basic vocabulary with images and audio pronunciation',
      emoji: '🏗️',
      color: 'from-yellow-400 to-orange-500',
      href: '/modules/3',
    },
    {
      id: 4,
      title: 'Reading Practice',
      description: 'Read simple sentences and understand their meanings',
      emoji: '📖',
      color: 'from-pink-400 to-red-500',
      href: '/modules/4',
    },
    {
      id: 5,
      title: 'Writing Exercises',
      description: 'Practice writing Arabic letters and words with guidance',
      emoji: '✏️',
      color: 'from-purple-400 to-indigo-500',
      href: '/modules/5',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto animate-slide-in">
          <h1 className="text-5xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
            مرحبا! Welcome to Arabic Kids 🌟
          </h1>
          <p className="text-2xl text-purple-800 mb-4 font-semibold">
            Learn Arabic Reading & Writing in a Fun Way!
          </p>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Perfect for kids abroad learning Arabic. Through interactive lessons, colorful games, and audio pronunciation, you'll master Arabic letters, words, and sentences!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/modules/1"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg text-lg"
            >
              Start Learning Now 🚀
            </Link>
            <a
              href="#levels"
              className="px-8 py-4 bg-white border-2 border-purple-500 text-purple-600 font-bold rounded-lg hover:bg-purple-50 transition-all shadow-lg text-lg"
            >
              Explore All Levels ↓
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white bg-opacity-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-purple-800 mb-12">
            Why Choose Arabic Kids?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-6 shadow-lg">
              <div className="text-5xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-blue-800 mb-3">Colorful Design</h3>
              <p className="text-gray-700">
                Bright, engaging interface designed specifically for kids to keep learning fun and exciting!
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg p-6 shadow-lg">
              <div className="text-5xl mb-4">🔊</div>
              <h3 className="text-xl font-bold text-green-800 mb-3">Native Audio</h3>
              <p className="text-gray-700">
                Hear authentic Arabic pronunciation from native speakers for every letter and word.
              </p>
            </div>
            <div className="bg-gradient-to-br from-pink-100 to-red-100 rounded-lg p-6 shadow-lg">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-pink-800 mb-3">Progressive Learning</h3>
              <p className="text-gray-700">
                Start from basics and gradually advance through structured levels at your own pace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section id="levels" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-purple-800 mb-4">
            5 Learning Levels
          </h2>
          <p className="text-center text-gray-700 text-lg mb-12">
            Progress through carefully designed levels to master Arabic reading and writing
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => (
              <Link
                key={level.id}
                href={level.href}
                className="group"
              >
                <div className={`bg-gradient-to-br ${level.color} rounded-2xl shadow-lg p-8 h-full transform hover:scale-105 transition-all duration-300 cursor-pointer`}>
                  <div className="text-6xl mb-4">{level.emoji}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Level {level.id}: {level.title}
                  </h3>
                  <p className="text-white text-lg mb-6">
                    {level.description}
                  </p>
                  <button className="bg-white text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors w-full">
                    Start Level →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-500 to-pink-500">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Arabic Journey?</h2>
          <p className="text-xl mb-8 text-white text-opacity-90">
            Don't wait! Begin learning Arabic today with our interactive lessons.
          </p>
          <Link
            href="/modules/1"
            className="inline-block px-10 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg text-lg"
          >
            Start Learning Now 🌟
          </Link>
        </div>
      </section>
    </div>
  );
}
