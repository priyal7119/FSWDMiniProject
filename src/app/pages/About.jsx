export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-20 flex flex-col items-center">
        <div className="w-20 h-2 bg-blue-600 rounded-full mb-8"></div>
        <h1 className="text-6xl font-extrabold text-center mb-4 text-slate-900 dark:text-white tracking-tight font-sans">
          About MapOut
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 text-center mb-16 font-medium max-w-2xl">
          Empowering the next generation of tech professionals with AI-driven career intelligence.
        </p>

        <div className="space-y-12 text-lg leading-relaxed w-full">
          <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white font-sans">Our Journey</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              MapOut began as a vision to revolutionize career development for students and young professionals.
              Founded in 2026, our platform emerged from the recognition that traditional career guidance often
              falls short in today's rapidly evolving job market.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white font-sans">What We Do</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              We leverage cutting-edge AI technology to provide personalized career planning, resume optimization,
              skill gap detection, and interview preparation. Our comprehensive platform integrates multiple tools
              to guide users through every step of their professional development journey.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white font-sans">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              To empower every individual with the tools and insights needed to build successful, fulfilling careers.
              We believe that with the right guidance and resources, anyone can achieve their professional aspirations.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-white/5 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white font-sans">Innovation & Tech</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              At MapOut, we continuously innovate using the latest in AI and machine learning to provide accurate,
              up-to-date career insights. Our platform adapts to industry trends and user feedback to ensure
              the most relevant and effective guidance.
            </p>
          </section>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-3xl text-white text-center shadow-2xl mt-16">
            <h2 className="text-3xl font-extrabold mb-4 font-sans">Join Our Community</h2>
            <p className="text-blue-50/90 text-lg font-medium leading-relaxed mb-8">
              Whether you're a student exploring career options or a professional seeking advancement,
              MapOut is here to help you navigate your path with confidence.
            </p>
            <button className="px-8 py-4 bg-white text-blue-700 rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg">
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}