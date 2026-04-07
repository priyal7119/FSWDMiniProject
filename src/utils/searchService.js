// Search Service - Global search across all content types

export const searchContent = (query, contentType = 'all') => {
  const normalizedQuery = query.toLowerCase();
  
  const allContent = {
    projects: [
      { id: 1, title: "E-Commerce Platform", type: "project", path: "/projects", domain: "Web Development" },
      { id: 2, title: "Real-Time Chat Application", type: "project", path: "/projects", domain: "Web Development" },
      { id: 3, title: "Portfolio Website", type: "project", path: "/projects", domain: "Web Development" },
      { id: 4, title: "Machine Learning Model", type: "project", path: "/projects", domain: "AI/ML" },
      { id: 5, title: "REST API with Authentication", type: "project", path: "/projects", domain: "Web Development" },
    ],
    courses: [
      { id: 1, title: "The Complete JavaScript Course", type: "course", path: "/research-guide" },
      { id: 2, title: "React Mastery", type: "course", path: "/research-guide" },
      { id: 3, title: "Machine Learning A-Z", type: "course", path: "/research-guide" },
    ],
    faqs: [
      { id: 1, title: "React Hooks and why are they useful", type: "faq", path: "/interview-faqs" },
      { id: 2, title: "Virtual DOM and how does it work", type: "faq", path: "/interview-faqs" },
    ],
  };

  const filterContent = (items) => {
    return items.filter(item =>
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.company?.toLowerCase().includes(normalizedQuery) ||
      item.domain?.toLowerCase().includes(normalizedQuery)
    );
  };

  let results = [];
  
  if (contentType === 'all' || contentType === 'project') {
    results = [...results, ...filterContent(allContent.projects)];
  }
  if (contentType === 'all' || contentType === 'course') {
    results = [...results, ...filterContent(allContent.courses)];
  }
  if (contentType === 'all' || contentType === 'faq') {
    results = [...results, ...filterContent(allContent.faqs)];
  }

  return results;
};

export const getFilterOptions = () => ({
  contentTypes: ['all', 'project', 'job', 'course', 'faq'],
  domains: ['All', 'Web Development', 'AI/ML', 'Mobile Development', 'Data Science'],
  difficulties: ['All', 'Beginner', 'Intermediate', 'Advanced'],
});
