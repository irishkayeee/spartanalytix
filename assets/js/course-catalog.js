// Verified subject names/codes: BatStateU Lipa BSIT AY 2023–2024 curriculum,
// which includes the Business Analytics and Network Technology tracks.
const portalCourses = [
  { code: 'CS 111', title: 'Computer Programming' },
  { code: 'CS 131', title: 'Data Structures and Algorithms' },
  { code: 'IT 211', title: 'Database Management System' },
].map(course => ({ ...course, label: `${course.code} · ${course.title}` }));
