// Verified subject names/codes: BatStateU Lipa BSIT AY 2023–2024 curriculum,
// which includes the Business Analytics and Network Technology tracks.
const portalCourses = [
  { code: 'CS 111', title: 'Computer Programming' },
  { code: 'CS 131', title: 'Data Structures and Algorithms' },
  { code: 'IT 211', title: 'Database Management System' },
  { code: 'S-004', title: 'IT Project Management' },
  // Additional sample course offerings for the earlier dashboard years.
  { code: 'S-101', title: 'Introduction to Computing' },
  { code: 'S-102', title: 'Web Development' },
  { code: 'S-103', title: 'Computer Networks' },
  { code: 'S-104', title: 'Systems Integration' },
  { code: 'S-201', title: 'Discrete Mathematics' },
  { code: 'S-202', title: 'Human-Computer Interaction' },
  { code: 'S-203', title: 'Information Assurance and Security' },
  { code: 'S-204', title: 'IT Capstone Project' },
].map((course, index) => ({
  ...course,
  academicYear: 2026 - Math.floor(index / 4),
  yearLevel: [1, 2, 3, 4][index % 4],
  failureBase: [78, 104, 65, 91][index % 4],
  label: `${course.code} · ${course.title}`,
}));
