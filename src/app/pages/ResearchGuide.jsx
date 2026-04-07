import { useNavigate } from "react-router";
import { Lightbulb, FileText, Layout, Quote } from "lucide-react";
import { t } from "../utils/translate.js";

export function ResearchGuide() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const language = localStorage.getItem("language") || "English";
  const steps = [
    {
      icon: Lightbulb,
      title: "Research Idea Selection",
      color: "bg-[var(--mapout-mint)]",
      content: [
        "Identify a problem in your field of interest",
        "Review existing literature to understand current research",
        "Look for gaps or areas that need improvement",
        "Ensure your idea is feasible within your timeline",
        "Discuss with mentors and professors for validation",
      ],
    },
    {
      icon: FileText,
      title: "Paper Structure",
      color: "bg-[var(--mapout-accent)]",
      content: [
        "Abstract: Summarize your research in 150-250 words",
        "Introduction: Present the problem and research objectives",
        "Literature Review: Discuss related work and previous research",
        "Methodology: Explain your approach and techniques",
        "Results: Present findings with data and analysis",
        "Discussion: Interpret results and their implications",
        "Conclusion: Summarize key findings and future work",
        "References: List all cited sources",
      ],
    },
    {
      icon: Layout,
      title: "IEEE Formatting",
      color: "bg-[var(--mapout-pink)]",
      content: [
        "Use IEEE conference or journal templates",
        "Set margins to 0.75 inches on all sides",
        "Use Times New Roman, 10pt font for body text",
        "Column format: Two columns with 0.25 inch gap",
        "Section headings: Bold, numbered (I, II, III)",
        "Equations: Center-aligned and numbered",
        "Figures and Tables: Captioned and referenced in text",
      ],
    },
    {
      icon: Quote,
      title: "Citation Guide",
      color: "bg-[var(--mapout-accent)]",
      content: [
        "Use IEEE citation style with numbered references",
        "Format: [1] A. Author, \"Title,\" Journal, vol. X, no. Y, pp. Z, Year.",
        "In-text citations: Use [1], [2], etc.",
        "List references in order of appearance",
        "Use citation management tools like Zotero or Mendeley",
        "Ensure all sources are credible and peer-reviewed",
        "Include DOI numbers when available",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--mapout-bg)] dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-20 py-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 font-sans">
          {t('researchGuideHeading', language)}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 font-medium">
          {t('researchGuideSubheading', language)}
        </p>

        <div className="grid grid-cols-1 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-white/5 group">
                <div className="flex items-start gap-8">
                  <div className={`${step.color} dark:bg-opacity-20 w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform`}>
                    <Icon className="text-[var(--mapout-primary)] dark:text-blue-400" size={36} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 font-sans">
                      {step.title}
                    </h2>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {step.content.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-colors">
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Resources */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold mb-8 font-sans">Helpful Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-blue-100">IEEE Templates</h3>
                <p className="text-blue-50/80 text-sm leading-relaxed">
                  Download official IEEE conference and journal templates from the IEEE website.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-blue-100">Citation Tools</h3>
                <p className="text-blue-50/80 text-sm leading-relaxed">
                  Use tools like Zotero, Mendeley, or EndNote to manage your references efficiently.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-blue-100">Grammar & Style</h3>
                <p className="text-blue-50/80 text-sm leading-relaxed">
                  Use AI tools to check grammar and follow strict academic writing conventions.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-blue-100">Plagiarism</h3>
                <p className="text-blue-50/80 text-sm leading-relaxed">
                  Use Turnitin or similar detection tools to ensure 100% originality before submission.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
