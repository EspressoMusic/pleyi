/* Multiplayer room helpers */

function createRoom(code, teacherId, teacherName) {
  return {
    code,
    teacherId,
    teacherName: teacherName || "מורה",
    students: new Map(),
    activeGame: null,
    gameState: {},
    scores: { teacher: 0 },
  };
}

function roomSummary(room) {
  const students = Array.from(room.students.entries()).map(([id, s]) => ({
    id,
    name: s.name,
    score: s.score || 0,
  }));
  return {
    code: room.code,
    teacherConnected: !!room.teacherId,
    teacherName: room.teacherName || "",
    students,
    studentCount: students.length,
    studentConnected: students.length > 0,
    studentName: students.length === 1 ? students[0].name : students.length > 1 ? `${students.length} תלמידים` : "",
    activeGame: room.activeGame,
    scores: {
      teacher: room.scores.teacher,
      student: students.reduce((sum, s) => sum + s.score, 0),
      students: Object.fromEntries(students.map((s) => [s.id, s.score])),
    },
  };
}

function getRole(room, socketId) {
  if (room.teacherId === socketId) return "teacher";
  if (room.students.has(socketId)) return "student";
  return null;
}

function playerKey(room, socketId, role) {
  return role === "teacher" ? "teacher" : socketId;
}

function addScore(room, socketId, role, points) {
  if (role === "teacher") {
    room.scores.teacher += points;
    return;
  }
  const s = room.students.get(socketId);
  if (s) s.score = (s.score || 0) + points;
}

function hasStudents(room) {
  return room.students.size > 0;
}

module.exports = {
  createRoom,
  roomSummary,
  getRole,
  playerKey,
  addScore,
  hasStudents,
};
