export function getTeacherStats(data) {
  const teacherMap = {};
  const categoryCount = { Basic: 0, Intermediate: 0, Advanced: 0 };

  data.forEach(entry => {
    const { KEF_ID, teacher_category } = entry;

    if (!teacherMap[KEF_ID]) {
      teacherMap[KEF_ID] = {
        count: 0,
        category: teacher_category
      };
      if (teacher_category in categoryCount) {
        categoryCount[teacher_category] += 1;
      }
    }

    teacherMap[KEF_ID].count += 1;
  });

  let topTeacher = null;
  let maxCount = 0;

  for (const [kefId, { count }] of Object.entries(teacherMap)) {
    if (count > maxCount) {
      maxCount = count;
      topTeacher = kefId;
    }
  }

  return {
    categoryCount,
    topTeacher,
    maxCount
  };
}
